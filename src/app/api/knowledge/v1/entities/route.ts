// GET /api/knowledge/v1/entities?type=origin&parent=origin:et&limit=100
//
// The vocabulary catalogue. An integrating app syncs this once and then speaks
// in ids instead of strings.

import { ok, problem } from "@/lib/api/envelope";
import { corsHeaders, preflight } from "@/lib/api/cors";
import { optionalClient, knowledgeCacheControl } from "@/lib/knowledge/access";
import { wireEntity } from "@/lib/knowledge/serialize";
import { clampLimit, decodeCursor, encodeCursor } from "@/lib/api/cursor";
import { vocabulary } from "@/content/vocabulary";
import { ENTITY_TYPES, normalizeQuery } from "@/content/vocabulary/types";

export const runtime = "nodejs";

const SCHEMA = "coffee_entity.v1";

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function GET(request: Request) {
  const access = await optionalClient(request);
  if (access.rejection) return access.rejection;
  const { client, requestId } = access;
  const cors = corsHeaders(request);
  const url = new URL(request.url);

  const type = url.searchParams.get("type");
  if (type && !(ENTITY_TYPES as readonly string[]).includes(type)) {
    return problem("invalid_request", {
      requestId,
      detail: `\`type\` must be one of ${ENTITY_TYPES.join(", ")}.`,
      headers: cors,
    });
  }

  const parent = url.searchParams.get("parent");
  const query = url.searchParams.get("q");
  const includeDeprecated = url.searchParams.get("include_deprecated") === "true";
  const limit = clampLimit(url.searchParams.get("limit"));

  let rows = vocabulary;
  if (type) rows = rows.filter((entity) => entity.type === type);
  if (parent) rows = rows.filter((entity) => entity.parent === parent);
  if (!includeDeprecated) {
    rows = rows.filter((entity) => entity.status !== "deprecated");
  }
  if (query) {
    const needle = normalizeQuery(query);
    rows = rows.filter(
      (entity) =>
        normalizeQuery(entity.labels.ko).includes(needle) ||
        normalizeQuery(entity.labels.en).includes(needle) ||
        entity.aliases.some((alias) => normalizeQuery(alias).includes(needle)),
    );
  }

  // Deterministic order is required for cursor stability (contract §6). Ids are
  // unique and immutable, so they are the whole sort key here.
  const sorted = [...rows].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

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
    startIndex = sorted.findIndex((entity) => entity.id > decoded.payload.i);
    if (startIndex < 0) startIndex = sorted.length;
  }

  const slice = sorted.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < sorted.length;
  const last = slice.at(-1);
  const nextCursor =
    hasMore && last
      ? await encodeCursor({ k: last.id, i: last.id, s: snapshotAt })
      : null;

  return ok(SCHEMA, slice.map(wireEntity), {
    requestId,
    snapshotAt,
    page: { limit, has_more: hasMore, next_cursor: nextCursor },
    headers: { ...cors, "x-total-count": String(sorted.length) },
    cacheControl: knowledgeCacheControl(client),
  });
}
