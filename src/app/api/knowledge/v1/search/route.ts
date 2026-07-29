// GET /api/knowledge/v1/search?q=…&locale=ko&kind=article|term|entity
//
// Reuses the same prebuilt index the on-site search uses (src/lib/content
// getSearchIndex), so API results and site results cannot drift apart.

import { ok, problem } from "@/lib/api/envelope";
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";
import { readLocale, articleUrl, SITE_ORIGIN } from "@/lib/knowledge/serialize";
import { clampLimit } from "@/lib/api/cursor";
import { getSearchIndex, getGlossaryTerms } from "@/lib/content";
import { vocabulary } from "@/content/vocabulary";
import { normalizeQuery } from "@/content/vocabulary/types";

export const runtime = "nodejs";

const SCHEMA = "search_result.v1";
const KINDS = ["article", "term", "entity"] as const;

export function OPTIONS(request: Request) {
  return preflight(request);
}

type Hit = {
  kind: (typeof KINDS)[number];
  id: string;
  title: string;
  snippet: string;
  url: string;
  score: number;
};

export async function GET(request: Request) {
  const access = await optionalClient(request);
  if (access.rejection) return access.rejection;
  const { client, requestId } = access;
  const cors = corsHeaders(request);
  const url = new URL(request.url);

  const raw = url.searchParams.get("q");
  if (!raw || raw.trim().length < 2) {
    return problem("invalid_request", {
      requestId,
      detail: "`q` is required and must be at least 2 characters.",
      headers: cors,
    });
  }
  const kindParam = url.searchParams.get("kind");
  if (kindParam && !(KINDS as readonly string[]).includes(kindParam)) {
    return problem("invalid_request", {
      requestId,
      detail: `\`kind\` must be one of ${KINDS.join(", ")}.`,
      headers: cors,
    });
  }

  const locale = readLocale(url.searchParams.get("locale"));
  const limit = clampLimit(url.searchParams.get("limit"), 20, 100);
  const needle = normalizeQuery(raw);
  const hits: Hit[] = [];

  if (!kindParam || kindParam === "article") {
    for (const item of getSearchIndex(locale)) {
      const title = normalizeQuery(item.title);
      // `haystack` is the prebuilt lowercased title+summary+category+tags blob;
      // normalising it again only strips punctuation, which is what we want.
      const haystack = normalizeQuery(item.haystack);
      if (!haystack.includes(needle)) continue;
      hits.push({
        kind: "article",
        id: item.slug,
        title: item.title,
        snippet: item.summary.slice(0, 200),
        url: articleUrl(item.slug, locale),
        // Title matches outrank body matches; exact title match outranks both.
        score: title === needle ? 3 : title.includes(needle) ? 2 : 1,
      });
    }
  }

  if (!kindParam || kindParam === "term") {
    for (const term of getGlossaryTerms(locale)) {
      const haystack = normalizeQuery(
        `${term.term} ${term.reading ?? ""} ${term.definition}`,
      );
      if (!haystack.includes(needle)) continue;
      hits.push({
        kind: "term",
        id: term.term,
        title: term.term,
        snippet: term.definition.slice(0, 200),
        url: `${SITE_ORIGIN}${locale === "en" ? "/en" : ""}/glossary`,
        score: normalizeQuery(term.term) === needle ? 3 : 2,
      });
    }
  }

  if (!kindParam || kindParam === "entity") {
    for (const entity of vocabulary) {
      if (entity.status === "deprecated") continue;
      const haystack = normalizeQuery(
        `${entity.labels.ko} ${entity.labels.en} ${entity.aliases.join(" ")}`,
      );
      if (!haystack.includes(needle)) continue;
      hits.push({
        kind: "entity",
        id: entity.id,
        title: locale === "en" ? entity.labels.en : entity.labels.ko,
        snippet: entity.note ?? `${entity.type} · ${entity.id}`,
        url: `${SITE_ORIGIN}/api/knowledge/v1/entities/${entity.type}/${entity.id.split(":")[1]}`,
        score: 2,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || (a.title < b.title ? -1 : 1));
  const page = hits.slice(0, limit);

  // Search is relevance-ranked and intentionally not cursor-paginated: a stable
  // keyset over a score that changes with the corpus is not meaningful. So
  // has_more stays false and the truncated total is reported instead — promising
  // has_more: true with next_cursor: null would advertise a page the caller can
  // never fetch. Callers needing everything should raise `limit` (max 100) or use
  // /articles and /entities, which are cursored.
  return ok(SCHEMA, page, {
    requestId,
    page: { limit, has_more: false, next_cursor: null },
    headers: {
      ...cors,
      "x-total-count": String(hits.length),
      "x-truncated": hits.length > limit ? "true" : "false",
    },
    cacheControl: knowledgeCacheControl(client),
  });
}
