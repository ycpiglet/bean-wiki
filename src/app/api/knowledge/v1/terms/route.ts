// GET /api/knowledge/v1/terms?locale=ko&category=…
//
// The glossary. Smaller and flatter than the article corpus, so it is returned
// whole rather than paginated — an integrating app can hold all of it in memory.

import { ok } from "@/lib/api/envelope";
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";
import { readLocale, wireTerm } from "@/lib/knowledge/serialize";
import { getGlossaryTerms } from "@/lib/content";
import { vocabulary } from "@/content/vocabulary";

export const runtime = "nodejs";

const SCHEMA = "glossary_term.v1";

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

  let terms = getGlossaryTerms(locale);
  if (category) terms = terms.filter((term) => term.category === category);

  // Cross-link each term to its vocabulary id where one exists, so a consumer
  // can move from a human-readable term to a stable machine id in one hop.
  const entityByTerm = new Map(
    vocabulary
      .filter((entity) => entity.glossaryTerm)
      .map((entity) => [entity.glossaryTerm as string, entity.id]),
  );

  return ok(
    SCHEMA,
    terms.map((term) => ({
      ...wireTerm(term, locale),
      entity_id: entityByTerm.get(term.term) ?? null,
    })),
    {
      requestId,
      // `limit` is the contract's page size (1..500), not the row count — an
      // empty glossary previously reported `limit: 0`, which is out of range.
      page: { limit: 500, has_more: false, next_cursor: null },
      headers: { ...cors, "x-total-count": String(terms.length) },
      cacheControl: knowledgeCacheControl(client),
    },
  );
}
