// GET /api/knowledge/v1/articles?locale=ko&category=…&tag=…&level=…
//
// Draft articles are excluded here exactly as they are from the sitemap, feed,
// and on-site search: getPublishedArticles() is the single gate, so a draft
// cannot leak through the API while being hidden on the site.

import { ok, problem } from "@/lib/api/envelope";
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";
import { readLocale, wireArticleSummary } from "@/lib/knowledge/serialize";
import { clampLimit, decodeCursor, encodeCursor } from "@/lib/api/cursor";
import { getPublishedArticles, levels } from "@/lib/content";

export const runtime = "nodejs";

const SCHEMA = "article_summary.v1";

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function GET(request: Request) {
  const access = await optionalClient(request);
  if (access.rejection) return access.rejection;
  const { client, requestId } = access;
  const cors = corsHeaders(request);
  const url = new URL(request.url);

  const locale = readLocale(url.searchParams.get("locale"));
  const category = url.searchParams.get("category");
  const tag = url.searchParams.get("tag");
  const level = url.searchParams.get("level");
  const updatedAfter = url.searchParams.get("updated_after");
  const limit = clampLimit(url.searchParams.get("limit"));

  if (level && !(levels as readonly string[]).includes(level)) {
    return problem("invalid_request", {
      requestId,
      detail: `\`level\` must be one of ${levels.join(", ")}.`,
      headers: cors,
    });
  }
  if (updatedAfter && Number.isNaN(Date.parse(updatedAfter))) {
    return problem("invalid_request", {
      requestId,
      detail: "`updated_after` must be an RFC 3339 date.",
      headers: cors,
    });
  }

  let rows = getPublishedArticles(locale);
  if (category) rows = rows.filter((article) => article.category === category);
  if (tag) rows = rows.filter((article) => (article.tags ?? []).includes(tag));
  if (level) rows = rows.filter((article) => article.level === level);
  if (updatedAfter) {
    const threshold = Date.parse(updatedAfter);
    rows = rows.filter((article) => Date.parse(article.updatedAt) > threshold);
  }

  const sorted = [...rows].sort((a, b) => {
    if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? -1 : 1;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });

  let startIndex = 0;
  let snapshotAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const cursorParam = url.searchParams.get("cursor");
  if (cursorParam) {
    const decoded = await decodeCursor(cursorParam);
    if (!decoded.ok) {
      return problem(
        decoded.reason === "expired" ? "cursor_expired" : "invalid_request",
        {
          requestId,
          detail:
            decoded.reason === "expired"
              ? "Restart without a cursor."
              : "Cursor is not valid.",
          headers: cors,
        },
      );
    }
    snapshotAt = decoded.payload.s;
    startIndex = sorted.findIndex(
      (article) =>
        article.updatedAt > decoded.payload.k ||
        (article.updatedAt === decoded.payload.k && article.slug > decoded.payload.i),
    );
    if (startIndex < 0) startIndex = sorted.length;
  }

  const slice = sorted.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < sorted.length;
  const last = slice.at(-1);
  const nextCursor =
    hasMore && last
      ? await encodeCursor({ k: last.updatedAt, i: last.slug, s: snapshotAt })
      : null;

  return ok(
    SCHEMA,
    slice.map((article) => wireArticleSummary(article, locale)),
    {
      requestId,
      snapshotAt,
      page: { limit, has_more: hasMore, next_cursor: nextCursor },
      headers: { ...cors, "x-total-count": String(sorted.length) },
      cacheControl: knowledgeCacheControl(client),
    },
  );
}
