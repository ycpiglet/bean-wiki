// GET /api/knowledge/v1/resolve?q=ETHIOPIA&type=origin
//
// The single most useful endpoint in this API: turns whatever string another app
// holds — an OCR read off a tasting card, a user's typo, a legacy spelling —
// into a canonical vocabulary id plus the article that explains it.
//
// A miss is not a failure. It is the content-gap signal: something an app needed
// Bean Wiki to explain and Bean Wiki could not. Misses are counted in
// `resolve_misses` and surface as the bot's `content.gaps` command and as
// demand evidence on content requests.

import { ok, problem } from "@/lib/api/envelope";
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";
import { recordResolveMiss } from "@/lib/knowledge/gaps";
import { wireEntity } from "@/lib/knowledge/serialize";
import { aliasIndex, byId } from "@/content/vocabulary";
import {
  ENTITY_TYPES,
  normalizeQuery,
  type EntityType,
} from "@/content/vocabulary/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMA = "resolve_result.v1";
const MAX_QUERY = 200;

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function GET(request: Request) {
  const access = await optionalClient(request);
  // A broken credential is reported, not downgraded to anonymous, so a
  // misconfigured integration fails visibly instead of quietly losing its quota.
  if (access.rejection) return access.rejection;
  const { client, requestId } = access;
  const url = new URL(request.url);
  const cors = corsHeaders(request);

  const raw = url.searchParams.get("q");
  if (!raw || !raw.trim()) {
    return problem("invalid_request", {
      requestId,
      detail: "`q` is required.",
      headers: cors,
    });
  }
  if (raw.length > MAX_QUERY) {
    return problem("invalid_request", {
      requestId,
      detail: `\`q\` must be at most ${MAX_QUERY} characters.`,
      headers: cors,
    });
  }

  const typeParam = url.searchParams.get("type");
  if (typeParam && !(ENTITY_TYPES as readonly string[]).includes(typeParam)) {
    return problem("invalid_request", {
      requestId,
      detail: `\`type\` must be one of ${ENTITY_TYPES.join(", ")}.`,
      headers: cors,
    });
  }
  const type = (typeParam as EntityType | null) ?? null;

  const normalized = normalizeQuery(raw);
  const direct = byId.get(raw.trim());
  const matched = direct ?? aliasIndex.get(normalized) ?? null;

  // A type filter must not silently return the wrong kind of thing.
  const hit = matched && (!type || matched.type === type) ? matched : null;

  if (!hit) {
    // Best-effort: a gap-logging failure must not turn a lookup into an error.
    await recordResolveMiss({
      entityType: type ?? "",
      query: raw.trim(),
      normalizedQuery: normalized,
      clientId: client?.id ?? null,
    });

    return ok(
      SCHEMA,
      {
        query: raw.trim(),
        normalized_query: normalized,
        matched: false,
        entity: null,
        // Tells the caller exactly what to do next instead of leaving them to
        // guess: file the gap, and it becomes a tracked request.
        suggestion: {
          action: "file_content_request",
          endpoint: "/api/requests/v1/content-requests",
          hint: "Send `demand_evidence.unresolved_terms` with this query so the gap is prioritised by real demand.",
        },
      },
      { requestId, headers: cors, cacheControl: "no-store" },
    );
  }

  // Deprecated ids still resolve — that is the point of never deleting them —
  // but the replacement is named so the caller can migrate.
  const replacement =
    hit.status === "deprecated" && hit.replacedBy
      ? (byId.get(hit.replacedBy) ?? null)
      : null;

  return ok(
    SCHEMA,
    {
      query: raw.trim(),
      normalized_query: normalized,
      matched: true,
      match_kind: direct ? "id" : "alias",
      entity: wireEntity(hit),
      replacement: replacement ? wireEntity(replacement) : null,
    },
    {
      requestId,
      headers: cors,
      // Vocabulary only changes on deploy, so this is the most cacheable endpoint
      // in the API — but an identified caller's response must not land in a shared
      // cache, so the policy comes from knowledgeCacheControl() like every other
      // knowledge route rather than being hardcoded public here.
      cacheControl: knowledgeCacheControl(client),
    },
  );
}
