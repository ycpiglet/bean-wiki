// Save API: validate editor input, serialize to a canonical HTML source, and
// commit to GitHub (which triggers a Vercel rebuild). Commits are attributed to
// the logged-in user's token, or a server PAT fallback. Editing is disabled
// (401) until a token is configured — the credential is user-supplied, exactly
// like CI.
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";
import { ghGetFile, ghPutFile, resolveCommitToken, commitEnabled } from "@/lib/github";
import {
  sourcePath,
  validateSave,
  buildUpdatedSource,
  buildNewSource,
  type SaveInput,
} from "@/lib/editing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_PATH = "src/content/articles/order.json";

function localeOf(value: string | null): "ko" | "en" {
  return value === "en" ? "en" : "ko";
}

// Report the current source-file sha (for optimistic-concurrency / conflict
// detection) and whether committing is possible. The editor calls this on load.
export async function GET(req: NextRequest, ctx: RouteContext<"/api/articles/[slug]">) {
  const { slug } = await ctx.params;
  const locale = localeOf(req.nextUrl.searchParams.get("locale"));
  const session = await readSession();
  let sha: string | null = null;
  try {
    const file = await ghGetFile(sourcePath(slug, locale), resolveCommitToken(session));
    sha = file?.sha ?? null;
  } catch {
    // Network / rate-limit failures leave sha null: conflict detection simply
    // won't fire; the save still validates server-side.
  }
  return Response.json({
    loggedIn: Boolean(session),
    login: session?.login ?? null,
    commitEnabled: commitEnabled(session),
    oauthEnabled: Boolean(process.env.GITHUB_OAUTH_CLIENT_ID && process.env.AUTH_SECRET),
    sha,
  });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/articles/[slug]">) {
  const { slug } = await ctx.params;
  const session = await readSession();
  const token = resolveCommitToken(session);
  if (!token) {
    return Response.json(
      {
        error: "auth_required",
        message:
          "Editing is not connected yet. Sign in with GitHub (or configure GITHUB_CONTENT_TOKEN) to publish.",
      },
      { status: 401 },
    );
  }

  let raw: Partial<SaveInput>;
  try {
    raw = (await req.json()) as Partial<SaveInput>;
  } catch {
    return Response.json({ error: "bad_request", message: "invalid JSON body" }, { status: 400 });
  }

  const locale = localeOf(raw.locale ?? null);
  const input: SaveInput = {
    slug,
    locale,
    title: raw.title ?? "",
    summary: raw.summary ?? "",
    fact: raw.fact,
    bodyHtml: raw.bodyHtml ?? "",
    editSummary: raw.editSummary ?? "",
    baseSha: raw.baseSha,
    category: raw.category,
    level: raw.level,
    accent: raw.accent,
    tags: raw.tags,
    related: raw.related,
  };

  try {
    const path = sourcePath(slug, locale);
    const existing = await ghGetFile(path, token);
    const creating = !existing;

    const errors = validateSave(input, creating);
    if (errors.length) {
      return Response.json({ error: "invalid", errors }, { status: 422 });
    }

    if (!creating && input.baseSha && existing!.sha !== input.baseSha) {
      return Response.json(
        {
          error: "conflict",
          message:
            "This article changed since you started editing. Reload to get the latest version, then re-apply your changes.",
          currentSha: existing!.sha,
        },
        { status: 409 },
      );
    }

    const source = creating ? buildNewSource(input) : buildUpdatedSource(existing!.text, input);
    const verb = creating ? "create" : "edit";
    const tag = locale === "en" ? " en" : "";
    const put = await ghPutFile({
      path,
      text: source,
      message: `content: ${verb}(${slug}${tag}): ${input.editSummary.trim()}`,
      token,
      sha: existing?.sha,
    });

    // A brand-new Korean article must also be registered in order.json.
    if (creating && locale === "ko") {
      const orderFile = await ghGetFile(ORDER_PATH, token);
      if (orderFile) {
        const order = JSON.parse(orderFile.text) as string[];
        if (!order.includes(slug)) {
          order.push(slug);
          await ghPutFile({
            path: ORDER_PATH,
            text: JSON.stringify(order, null, 2) + "\n",
            message: `content: register(${slug})`,
            token,
            sha: orderFile.sha,
          });
        }
      }
    }

    return Response.json({
      committed: true,
      creating,
      commit: { sha: put.commitSha, url: put.htmlUrl, contentSha: put.contentSha },
      publishing: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "commit failed";
    return Response.json({ error: "commit_failed", message }, { status: 502 });
  }
}
