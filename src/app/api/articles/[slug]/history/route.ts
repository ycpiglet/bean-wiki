// Article history: GET lists the file's commits (read-only, works for the
// public repo without a token); POST restores the file's content from a past
// commit as a new commit (auth-gated).
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";
import { ghGetFile, ghListCommits, ghPutFile, resolveCommitToken } from "@/lib/github";
import { sourcePath } from "@/lib/editing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function localeOf(value: string | null): "ko" | "en" {
  return value === "en" ? "en" : "ko";
}

export async function GET(req: NextRequest, ctx: RouteContext<"/api/articles/[slug]/history">) {
  const { slug } = await ctx.params;
  const locale = localeOf(req.nextUrl.searchParams.get("locale"));
  const session = await readSession();
  try {
    const commits = await ghListCommits(sourcePath(slug, locale), resolveCommitToken(session));
    return Response.json({ commits, canRestore: Boolean(resolveCommitToken(session)) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "history unavailable";
    return Response.json({ error: "history_failed", message, commits: [] }, { status: 502 });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/articles/[slug]/history">) {
  const { slug } = await ctx.params;
  const session = await readSession();
  const token = resolveCommitToken(session);
  if (!token) return Response.json({ error: "auth_required" }, { status: 401 });

  let body: { sha?: string; locale?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const sha = body.sha;
  const locale = localeOf(body.locale ?? null);
  if (!sha || !/^[0-9a-f]{7,40}$/.test(sha)) {
    return Response.json({ error: "invalid", message: "bad commit sha" }, { status: 422 });
  }

  try {
    const path = sourcePath(slug, locale);
    const past = await ghGetFile(path, token, sha);
    if (!past) {
      return Response.json({ error: "not_found", message: "file not in that commit" }, { status: 404 });
    }
    const current = await ghGetFile(path, token);
    const put = await ghPutFile({
      path,
      text: past.text,
      message: `content: restore(${slug}) to ${sha.slice(0, 7)}`,
      token,
      sha: current?.sha,
    });
    return Response.json({
      restored: true,
      commit: { sha: put.commitSha, url: put.htmlUrl },
      publishing: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "restore failed";
    return Response.json({ error: "restore_failed", message }, { status: 502 });
  }
}
