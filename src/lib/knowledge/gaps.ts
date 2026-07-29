// Content-gap capture.
//
// Every failed resolve is a question an app asked that the wiki could not
// answer. Aggregated by normalised query, these become the editorial queue:
// `content.gaps` in the bot catalogue and `demand_evidence` on requests.

import { getD1 } from "../../../db";

export type ResolveMissInput = {
  entityType: string;
  query: string;
  normalizedQuery: string;
  clientId: string | null;
};

/**
 * Counts one miss. Best-effort by design: a lookup must still succeed when the
 * database is unbound or the write races, so failures are swallowed rather than
 * propagated to the caller.
 */
export async function recordResolveMiss(
  input: ResolveMissInput,
): Promise<void> {
  if (!input.normalizedQuery) return;
  try {
    await getD1()
      .prepare(
        `INSERT INTO resolve_misses
           (id, entity_type, query, normalized_query, client_id, hit_count)
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(entity_type, normalized_query) DO UPDATE SET
           hit_count = hit_count + 1,
           last_seen_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        crypto.randomUUID(),
        input.entityType,
        input.query.slice(0, 200),
        input.normalizedQuery.slice(0, 200),
        input.clientId,
      )
      .run();
  } catch {
    // Unbound storage or a lost race: the signal is nice to have, not required.
  }
}

export type TopMiss = {
  entity_type: string;
  query: string;
  normalized_query: string;
  hit_count: number;
  first_seen_at: string;
  last_seen_at: string;
  content_request_id: string | null;
};

/**
 * Highest-demand unanswered terms. `onlyUnfiled` hides gaps that already have a
 * request so the queue does not re-suggest work in flight.
 */
export async function topMisses(options: {
  limit: number;
  sinceDays?: number;
  onlyUnfiled?: boolean;
}): Promise<TopMiss[]> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (options.sinceDays) {
    where.push(`last_seen_at >= datetime('now', ?)`);
    binds.push(`-${Math.floor(options.sinceDays)} days`);
  }
  if (options.onlyUnfiled) where.push("content_request_id IS NULL");

  const sql = `SELECT entity_type, query, normalized_query, hit_count,
                      first_seen_at, last_seen_at, content_request_id
                 FROM resolve_misses
                 ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
                ORDER BY hit_count DESC, last_seen_at DESC
                LIMIT ?`;
  binds.push(Math.min(Math.max(options.limit, 1), 100));

  const result = await getD1()
    .prepare(sql)
    .bind(...binds)
    .all<TopMiss>();
  return result.results ?? [];
}

/** Marks a gap as filed so it stops appearing in the suggestion queue. */
export async function linkMissToRequest(
  entityType: string,
  normalizedQuery: string,
  contentRequestId: string,
): Promise<void> {
  try {
    await getD1()
      .prepare(
        `UPDATE resolve_misses SET content_request_id = ?
          WHERE entity_type = ? AND normalized_query = ?`,
      )
      .bind(contentRequestId, entityType, normalizedQuery)
      .run();
  } catch {
    // Best-effort link.
  }
}
