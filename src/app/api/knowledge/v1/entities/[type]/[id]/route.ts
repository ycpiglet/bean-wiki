// GET /api/knowledge/v1/entities/{type}/{id}
//
// `id` is the bare key, not the full `type:key` form, so the URL reads
// /entities/origin/et-yirgacheffe. Percent-encoded non-ASCII keys are decoded
// before lookup — Korean path params arrive encoded on this stack.

import { ok, problem } from "@/lib/api/envelope";
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";
import { wireArticleSummary, wireEntity } from "@/lib/knowledge/serialize";
import { byId, vocabulary } from "@/content/vocabulary";
import { ENTITY_TYPES } from "@/content/vocabulary/types";
import { getArticle } from "@/lib/content";

export const runtime = "nodejs";

const SCHEMA = "coffee_entity.v1";

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const access = await optionalClient(request);
  if (access.rejection) return access.rejection;
  const { client, requestId } = access;
  const cors = corsHeaders(request);

  const params = await context.params;
  const type = safeDecode(params.type);
  const key = safeDecode(params.id);

  if (!(ENTITY_TYPES as readonly string[]).includes(type)) {
    return problem("not_found", {
      requestId,
      detail: "Unknown entity type.",
      headers: cors,
    });
  }

  const entity = byId.get(`${type}:${key}`);
  if (!entity) {
    return problem("not_found", {
      requestId,
      detail: "No such entity. Try /api/knowledge/v1/resolve for fuzzy lookup.",
      headers: cors,
    });
  }

  const children = vocabulary.filter((candidate) => candidate.parent === entity.id);
  const ancestors = collectAncestors(entity.parent);

  // Drafts are excluded here for the same reason they are excluded from
  // listings, search, the sitemap, the feed, and /articles/{slug}. This is the
  // one place the gate is easy to forget, because the article is reached
  // indirectly through the vocabulary entity rather than requested by slug.
  const linked = entity.articleSlug ? getArticle(entity.articleSlug, "ko") : undefined;
  const article = linked && !linked.draft ? linked : undefined;

  return ok(
    SCHEMA,
    {
      ...wireEntity(entity),
      ancestors: ancestors.map(wireEntity),
      children: children.map(wireEntity),
      article_detail: article ? wireArticleSummary(article, "ko") : null,
    },
    {
      requestId,
      headers: cors,
      cacheControl: knowledgeCacheControl(client),
    },
  );
}

function collectAncestors(parentId: string | undefined) {
  const chain = [];
  let cursor = parentId;
  // Bounded walk: a malformed parent cycle must not hang the request.
  for (let depth = 0; cursor && depth < 8; depth += 1) {
    const parent = byId.get(cursor);
    if (!parent) break;
    chain.unshift(parent);
    cursor = parent.parent;
  }
  return chain;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
