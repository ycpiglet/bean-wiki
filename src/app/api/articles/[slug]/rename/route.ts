// Rename an article's slug. Old URLs keep working via a 301 recorded in
// redirects.json. To keep the build green, every reference (related links,
// wikilinks) is rewritten too — all in a single atomic commit (Git Data API).
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";
import { ghGetFile, ghCommitFiles, resolveCommitToken, type FileChange } from "@/lib/github";
import { rewriteReferences, renameSelf } from "@/lib/editing";
import { getArticles } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9-]+$/;
const koPath = (slug: string) => `src/content/articles/${slug}.html`;
const enPath = (slug: string) => `src/content/articles/en/${slug}.html`;
const ORDER = "src/content/articles/order.json";
const REDIRECTS = "src/content/redirects.json";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/articles/[slug]/rename">) {
  const { slug } = await ctx.params;
  const session = await readSession();
  const token = resolveCommitToken(session);
  if (!token) {
    return Response.json({ error: "auth_required" }, { status: 401 });
  }

  let body: { newSlug?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const newSlug = (body.newSlug ?? "").trim().toLowerCase();

  if (!SLUG_RE.test(newSlug)) {
    return Response.json({ error: "invalid", message: "invalid new slug" }, { status: 422 });
  }
  if (newSlug === slug) {
    return Response.json({ error: "invalid", message: "same slug" }, { status: 422 });
  }

  try {
    const oldKo = await ghGetFile(koPath(slug), token);
    if (!oldKo) {
      return Response.json({ error: "not_found", message: `no article "${slug}"` }, { status: 404 });
    }
    if (await ghGetFile(koPath(newSlug), token)) {
      return Response.json(
        { error: "conflict", message: `"${newSlug}" already exists` },
        { status: 409 },
      );
    }

    const changes: FileChange[] = [];

    // The renamed article (ko, and en if present).
    changes.push({ path: koPath(newSlug), content: renameSelf(oldKo.text, slug, newSlug) });
    changes.push({ path: koPath(slug), content: null });
    const oldEn = await ghGetFile(enPath(slug), token);
    if (oldEn) {
      changes.push({ path: enPath(newSlug), content: renameSelf(oldEn.text, slug, newSlug) });
      changes.push({ path: enPath(slug), content: null });
    }

    // Other articles that reference the old slug (from the build snapshot).
    const affected = getArticles("ko").filter(
      (a) =>
        a.slug !== slug &&
        (a.related.includes(slug) || a.bodyHtml.includes(`data-wikilink="${slug}"`)),
    );
    for (const a of affected) {
      const ko = await ghGetFile(koPath(a.slug), token);
      if (ko) changes.push({ path: koPath(a.slug), content: rewriteReferences(ko.text, slug, newSlug) });
      const en = await ghGetFile(enPath(a.slug), token);
      if (en) changes.push({ path: enPath(a.slug), content: rewriteReferences(en.text, slug, newSlug) });
    }

    // order.json: keep position, swap the slug.
    const orderFile = await ghGetFile(ORDER, token);
    if (orderFile) {
      const order = (JSON.parse(orderFile.text) as string[]).map((s) => (s === slug ? newSlug : s));
      changes.push({ path: ORDER, content: JSON.stringify(order, null, 2) + "\n" });
    }

    // redirects.json: record old -> new and repoint any chain that ended at old.
    const redirectsFile = await ghGetFile(REDIRECTS, token);
    const redirects = redirectsFile ? (JSON.parse(redirectsFile.text) as Record<string, string>) : {};
    for (const key of Object.keys(redirects)) {
      if (redirects[key] === slug) redirects[key] = newSlug;
    }
    redirects[slug] = newSlug;
    changes.push({ path: REDIRECTS, content: JSON.stringify(redirects, null, 2) + "\n" });

    const commit = await ghCommitFiles({
      changes,
      message: `content: rename(${slug} -> ${newSlug})`,
      token,
    });

    return Response.json({
      renamed: true,
      newSlug,
      editUrl: `/edit/${newSlug}`,
      commit: { sha: commit.commitSha },
      publishing: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "rename failed";
    return Response.json({ error: "rename_failed", message }, { status: 502 });
  }
}
