// POST /api/requests/v1/content-requests  — file a request (Issue analog)
// GET  /api/requests/v1/content-requests  — poll your own requests
//
// Contract: docs/CONTENT-REQUEST-API-V1.md

import { ok, problem } from "@/lib/api/envelope";
import { requireClient, auditOk, rateHeaders } from "@/lib/api/auth";
import { SCOPES } from "@/lib/api/scopes";
import { clampLimit, decodeCursor, encodeCursor } from "@/lib/api/cursor";
import {
  createRequest,
  listRequests,
  type DemandEvidence,
  type EntityRef,
} from "@/lib/requests/store";
import {
  isPriorityHint,
  isRequestKind,
  isRequestStatus,
} from "@/lib/requests/status";
import { byId } from "@/content/vocabulary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA = "content_request.v1";
const MAX_TITLE = 160;
const MAX_BODY = 4000;
const MAX_ENTITY_REFS = 20;
const MAX_UNRESOLVED_TERMS = 50;

export async function POST(request: Request) {
  const auth = await requireClient(request, SCOPES.contentRequestsWrite);
  if (!auth.ok) return auth.response;
  const { client, requestId } = auth;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body !== "object") {
    return problem("invalid_request", {
      requestId,
      detail: "Body must be a JSON object.",
    });
  }

  const externalId = str(body.external_id);
  if (!externalId || externalId.length > 160) {
    return problem("invalid_request", {
      requestId,
      detail: "`external_id` is required (<=160 chars) and makes this call idempotent.",
    });
  }

  const kind = str(body.kind) ?? "new_article";
  if (!isRequestKind(kind)) {
    return problem("invalid_request", {
      requestId,
      detail: "`kind` is not a known request kind.",
    });
  }

  const title = str(body.title);
  if (!title || title.length < 4 || title.length > MAX_TITLE) {
    return problem("invalid_request", {
      requestId,
      detail: `\`title\` must be 4..${MAX_TITLE} characters.`,
    });
  }

  const text = str(body.body) ?? "";
  if (text.length > MAX_BODY) {
    return problem("invalid_request", {
      requestId,
      detail: `\`body\` must be at most ${MAX_BODY} characters.`,
    });
  }

  const locale = str(body.locale) ?? "ko";
  if (locale !== "ko" && locale !== "en") {
    return problem("invalid_request", {
      requestId,
      detail: "`locale` must be \"ko\" or \"en\".",
    });
  }

  const priorityHint = str(body.priority_hint) ?? "normal";
  if (!isPriorityHint(priorityHint)) {
    return problem("invalid_request", {
      requestId,
      detail: "`priority_hint` must be low, normal, or high.",
    });
  }

  const refsResult = readEntityRefs(body.entity_refs);
  if (!refsResult.ok) {
    // 422, not 400: the payload parsed fine, the referenced entity just is not
    // one we publish. The caller needs to resolve it first.
    return problem("unprocessable", { requestId, detail: refsResult.detail });
  }

  const callbackUrl = str(body.callback_url);
  if (callbackUrl && !isHttpsUrl(callbackUrl)) {
    return problem("invalid_request", {
      requestId,
      detail: "`callback_url` must be an https URL.",
    });
  }

  try {
    const result = await createRequest({
      clientId: client.id,
      externalId,
      kind,
      title,
      body: text,
      locale,
      entityRefs: refsResult.refs,
      demandEvidence: readDemandEvidence(body.demand_evidence),
      priorityHint,
      callbackUrl: callbackUrl ?? null,
    });

    await auditOk({
      clientId: client.id,
      requestId,
      action: result.created
        ? "content_request.create"
        : "content_request.create_idempotent",
      resource: `/api/requests/v1/content-requests/${result.request.id}`,
      scope: SCOPES.contentRequestsWrite,
      rowCount: result.created ? 1 : 0,
    });

    return ok(SCHEMA, result.request, {
      requestId,
      // 200 on a repeat submission signals "already have this" without making
      // the caller treat it as an error.
      status: result.created ? 201 : 200,
      headers: { location: `/api/requests/v1/content-requests/${result.request.id}` },
    });
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

export async function GET(request: Request) {
  const auth = await requireClient(request, SCOPES.contentRequestsRead);
  if (!auth.ok) return auth.response;
  const { client, requestId, rate } = auth;

  const url = new URL(request.url);
  const limit = clampLimit(url.searchParams.get("limit"));
  const statusParam = url.searchParams.get("status");
  if (statusParam && !isRequestStatus(statusParam)) {
    return problem("invalid_request", {
      requestId,
      detail: "`status` is not a known status.",
    });
  }
  const updatedAfter = url.searchParams.get("updated_after") ?? undefined;
  if (updatedAfter && Number.isNaN(Date.parse(updatedAfter))) {
    return problem("invalid_request", {
      requestId,
      detail: "`updated_after` must be an RFC 3339 timestamp.",
    });
  }

  const cursorParam = url.searchParams.get("cursor");
  let after: { updatedAt: string; id: string } | undefined;
  let snapshotAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  if (cursorParam) {
    const decoded = await decodeCursor(cursorParam);
    if (!decoded.ok) {
      return problem(
        decoded.reason === "expired" ? "cursor_expired" : "invalid_request",
        {
          requestId,
          detail:
            decoded.reason === "expired"
              ? "Restart the sync without a cursor."
              : "Cursor is not valid.",
        },
      );
    }
    after = { updatedAt: decoded.payload.k, id: decoded.payload.i };
    snapshotAt = decoded.payload.s;
  }

  try {
    // A client only ever sees its own requests. Triage surfaces read the table
    // directly with the triage scope.
    const rows = await listRequests({
      clientId: client.id,
      status: statusParam && isRequestStatus(statusParam) ? statusParam : undefined,
      updatedAfter,
      after,
      limit: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page.at(-1);
    const nextCursor =
      hasMore && last
        ? await encodeCursor({ k: last.updated_at, i: last.id, s: snapshotAt })
        : null;

    return ok(SCHEMA, page, {
      requestId,
      snapshotAt,
      page: { limit, has_more: hasMore, next_cursor: nextCursor },
      // Real consumed budget from this call, not a reconstruction.
      headers: rateHeaders(rate),
    });
  } catch (error) {
    return storageProblem(error, requestId);
  }
}

function readEntityRefs(
  value: unknown,
): { ok: true; refs: EntityRef[] } | { ok: false; detail: string } {
  if (value === undefined || value === null) return { ok: true, refs: [] };
  if (!Array.isArray(value)) {
    return { ok: false, detail: "`entity_refs` must be an array." };
  }
  if (value.length > MAX_ENTITY_REFS) {
    return {
      ok: false,
      detail: `\`entity_refs\` must hold at most ${MAX_ENTITY_REFS} entries.`,
    };
  }
  const refs: EntityRef[] = [];
  for (const entry of value) {
    const id =
      typeof entry === "string" ? entry : str((entry as Record<string, unknown>)?.id);
    if (!id) {
      return { ok: false, detail: "Each entity ref needs an `id`." };
    }
    if (!byId.has(id)) {
      return {
        ok: false,
        detail: `Unknown vocabulary id \`${id}\`. Resolve it via /api/knowledge/v1/resolve first.`,
      };
    }
    const role =
      typeof entry === "object" && entry
        ? str((entry as Record<string, unknown>).role)
        : undefined;
    refs.push(role ? { id, role } : { id });
  }
  return { ok: true, refs };
}

function readDemandEvidence(value: unknown): DemandEvidence {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  const count = Number(input.observation_count);
  const terms = Array.isArray(input.unresolved_terms)
    ? input.unresolved_terms
        .filter((term): term is string => typeof term === "string")
        .slice(0, MAX_UNRESOLVED_TERMS)
        .map((term) => term.slice(0, 120))
    : undefined;
  return {
    ...(Number.isFinite(count) && count >= 0
      ? { observation_count: Math.floor(count) }
      : {}),
    ...(str(input.window) ? { window: str(input.window)!.slice(0, 40) } : {}),
    ...(str(input.context) ? { context: str(input.context)!.slice(0, 400) } : {}),
    ...(terms && terms.length ? { unresolved_terms: terms } : {}),
  };
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function storageProblem(error: unknown, requestId: string): Response {
  const name = (error as { name?: string } | null)?.name;
  if (name !== "D1UnavailableError") throw error;
  return problem("storage_unavailable", {
    requestId,
    detail: "Request storage is not bound in this environment.",
  });
}
