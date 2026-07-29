// POST /api/requests/v1/contributions — submit a draft (PR analog)
// GET  /api/requests/v1/contributions — poll your own submissions
//
// Deliberately does NOT publish. A submission is validated, recorded with
// provenance, and parked at `received` for the existing editorial path (the
// review skills, check-content, check:editorial, then a human-approved commit or
// PR proposal). Automated publishing without a named reviewer is out of scope by
// design, not by omission.

import { ok, problem } from "@/lib/api/envelope";
import { requireClient, auditOk } from "@/lib/api/auth";
import { SCOPES } from "@/lib/api/scopes";
import { clampLimit } from "@/lib/api/cursor";
import { readActor } from "@/lib/contributions/actor";
import {
  createContribution,
  listContributions,
} from "@/lib/contributions/store";
import { getArticle } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA = "contribution.v1";
const MAX_BODY_HTML = 200_000;
const SLUG_RE = /^[a-z0-9-]+$/;

export async function POST(request: Request) {
  const auth = await requireClient(request, SCOPES.contributionsWrite);
  if (!auth.ok) return auth.response;
  const { client, requestId } = auth;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return problem("invalid_request", {
      requestId,
      detail: "Body must be a JSON object.",
    });
  }

  const externalId = str(body.external_id);
  if (!externalId || externalId.length > 160) {
    return problem("invalid_request", {
      requestId,
      detail: "`external_id` is required and makes this call idempotent.",
    });
  }

  const slug = str(body.article_slug);
  if (!slug || !SLUG_RE.test(slug)) {
    return problem("invalid_request", {
      requestId,
      detail: "`article_slug` must be lowercase letters, numbers, and hyphens.",
    });
  }

  const title = str(body.title);
  if (!title || title.length > 160) {
    return problem("invalid_request", { requestId, detail: "`title` is required." });
  }

  const bodyHtml = typeof body.body_html === "string" ? body.body_html : "";
  if (!bodyHtml.trim()) {
    return problem("invalid_request", {
      requestId,
      detail: "`body_html` is required.",
    });
  }
  if (bodyHtml.length > MAX_BODY_HTML) {
    return problem("invalid_request", {
      requestId,
      detail: `\`body_html\` must be at most ${MAX_BODY_HTML} characters.`,
    });
  }

  const changeNote = str(body.change_note);
  if (!changeNote) {
    return problem("invalid_request", {
      requestId,
      detail: "`change_note` is required — reviewers need to know what changed and why.",
    });
  }

  const locale = str(body.locale) ?? "ko";
  if (locale !== "ko" && locale !== "en") {
    return problem("invalid_request", {
      requestId,
      detail: "`locale` must be \"ko\" or \"en\".",
    });
  }

  const actorResult = readActor(body.actor, client.id, client.clientType);
  if (!actorResult.ok) {
    return problem("unprocessable", { requestId, detail: actorResult.detail });
  }

  // Reject unsafe markup at the boundary rather than relying on render-time
  // escaping downstream.
  const unsafe = findUnsafeMarkup(bodyHtml);
  if (unsafe) {
    return problem("unprocessable", {
      requestId,
      detail: `\`body_html\` contains disallowed markup: ${unsafe}.`,
    });
  }

  const targetsExisting = Boolean(getArticle(slug, locale === "en" ? "en" : "ko"));

  try {
    const result = await createContribution({
      clientId: client.id,
      externalId,
      articleSlug: slug,
      locale,
      title,
      summary: str(body.summary) ?? "",
      bodyHtml,
      changeNote,
      contentRequestId: str(body.content_request_id) ?? null,
      actor: actorResult.actor,
    });

    await auditOk({
      clientId: client.id,
      requestId,
      action: result.created
        ? "contribution.create"
        : "contribution.create_idempotent",
      resource: `/api/requests/v1/contributions/${result.contribution.id}`,
      scope: SCOPES.contributionsWrite,
      rowCount: result.created ? 1 : 0,
      detail: actorResult.actor.type,
    });

    return ok(
      SCHEMA,
      {
        ...result.contribution,
        targets_existing_article: targetsExisting,
        next_steps: [
          "A reviewer runs check-content and check:editorial against this draft.",
          "Accepted drafts land as a commit or a pull-request proposal; this API never publishes directly.",
        ],
      },
      {
        requestId,
        status: result.created ? 201 : 200,
        headers: {
          location: `/api/requests/v1/contributions/${result.contribution.id}`,
        },
      },
    );
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

export async function GET(request: Request) {
  // Reading your own submissions must not require write permission.
  const auth = await requireClient(request, SCOPES.contributionsRead);
  if (!auth.ok) return auth.response;
  const { client, requestId } = auth;

  const url = new URL(request.url);
  const limit = clampLimit(url.searchParams.get("limit"), 50, 200);

  try {
    const rows = await listContributions({ clientId: client.id, limit });
    return ok(SCHEMA, rows, {
      requestId,
      page: { limit, has_more: rows.length === limit, next_cursor: null },
    });
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

/**
 * Conservative denylist for submitted markup. The editor path already sanitises
 * browser input; this is the machine equivalent, and it errs toward rejecting
 * rather than silently stripping so the caller learns what was wrong.
 */
function findUnsafeMarkup(html: string): string | null {
  const patterns: Array<[RegExp, string]> = [
    [/<script\b/i, "<script>"],
    [/<iframe\b/i, "<iframe>"],
    [/<object\b/i, "<object>"],
    [/<embed\b/i, "<embed>"],
    [/<form\b/i, "<form>"],
    [/<style\b/i, "<style>"],
    [/\son[a-z]+\s*=/i, "inline event handler"],
    [/javascript:/i, "javascript: URL"],
    [/data:text\/html/i, "data:text/html URL"],
    [/srcdoc\s*=/i, "srcdoc attribute"],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(html)) return label;
  }
  return null;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function storageProblem(error: unknown, requestId: string): Response {
  const name = (error as { name?: string } | null)?.name;
  if (name !== "D1UnavailableError") throw error;
  return problem("storage_unavailable", {
    requestId,
    detail: "Contribution storage is not bound in this environment.",
  });
}
