// GET /api/knowledge/v1/articles/{slug}?locale=ko
//
// Full article body. Honours src/content/redirects.json so a renamed article
// keeps answering at its old slug, matching the 301s the site serves.

import { ok, problem } from "@/lib/api/envelope";
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";
import { readLocale, wireArticle, articleUrl } from "@/lib/knowledge/serialize";
import { getArticle } from "@/lib/content";
import { vocabulary } from "@/content/vocabulary";
import { wireEntity } from "@/lib/knowledge/serialize";
import redirectMap from "@/content/redirects.json";

export const runtime = "nodejs";

const SCHEMA = "article.v1";

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const access = await optionalClient(request);
  if (access.rejection) return access.rejection;
  const { client, requestId } = access;
  const cors = corsHeaders(request);
  const url = new URL(request.url);
  const locale = readLocale(url.searchParams.get("locale"));

  const { slug: rawSlug } = await context.params;
  const slug = safeDecode(rawSlug);

  const renamedTo = (redirectMap as Record<string, string>)[slug];
  if (renamedTo) {
    // Tell the client the canonical id rather than silently serving the new
    // article under the old slug, so its stored references can be updated.
    return ok(
      SCHEMA,
      {
        moved: true,
        from_slug: slug,
        to_slug: renamedTo,
        url: articleUrl(renamedTo, locale),
      },
      {
        requestId,
        status: 200,
        headers: { ...cors, "x-canonical-slug": renamedTo },
        cacheControl: knowledgeCacheControl(client),
      },
    );
  }

  const article = getArticle(slug, locale);
  // Drafts are not published content; they must 404 here just as they are hidden
  // from listings, search, the sitemap, and the feed.
  if (!article || article.draft) {
    return problem("not_found", {
      requestId,
      detail: "No published article with that slug.",
      headers: cors,
    });
  }

  const entities = vocabulary.filter((entity) => entity.articleSlug === slug);

  return ok(
    SCHEMA,
    { ...wireArticle(article, locale), entities: entities.map(wireEntity) },
    {
      requestId,
      headers: cors,
      cacheControl: knowledgeCacheControl(client),
    },
  );
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
