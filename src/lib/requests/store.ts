// Content request persistence. Raw D1 SQL to match src/lib/platform-data.ts;
// drizzle is used for schema definition and migrations only.

import { getD1 } from "../../../db";
import {
  canTransition,
  isRequestStatus,
  TRANSITION_REQUIREMENTS,
  type RequestKind,
  type RequestStatus,
  type PriorityHint,
} from "@/lib/requests/status";

export type EntityRef = { id: string; role?: string };

export type DemandEvidence = {
  /** How many times the requesting app needed this and found nothing. */
  observation_count?: number;
  /** Window the count covers, e.g. "P30D". */
  window?: string;
  /** Free-form but short: what the app was doing when it hit the gap. */
  context?: string;
  /** Terms that failed to resolve, feeding straight from /resolve misses. */
  unresolved_terms?: string[];
};

export type ContentRequest = {
  id: string;
  client_id: string | null;
  external_id: string;
  kind: RequestKind;
  title: string;
  body: string;
  locale: string;
  entity_refs: EntityRef[];
  demand_evidence: DemandEvidence;
  priority_hint: PriorityHint;
  status: RequestStatus;
  resolution_article_slug: string | null;
  resolution_url: string | null;
  declined_reason: string | null;
  duplicate_of: string | null;
  suggestion_id: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
};

type Row = Record<string, unknown>;

// SQLite's CURRENT_TIMESTAMP writes "YYYY-MM-DD HH:MM:SS" (space separator).
// The contract requires RFC 3339 on the wire ("...THH:MM:SSZ").
//
// This is not cosmetic. `updated_at > ?` is a STRING comparison in SQLite, and
// " " (0x20) sorts before "T" (0x54). Passing an RFC 3339 `updated_after`
// straight into that predicate makes every row from the same date compare as
// older and silently vanish from the result — which would quietly break the
// incremental sync that the whole polling contract depends on.
//
// So: convert to SQL form at every SQL boundary, and to RFC 3339 at every wire
// boundary. Never mix.

function toSqlTimestamp(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

function toRfc3339(value: string): string {
  if (!value) return value;
  if (value.includes("T")) return value;
  return `${value.replace(" ", "T")}Z`;
}

const SELECT = `SELECT id, client_id, external_id, kind, title, body, locale,
    entity_refs_json, demand_evidence_json, priority_hint, status,
    resolution_article_slug, resolution_url, declined_reason, duplicate_of,
    suggestion_id, revision, created_at, updated_at
  FROM content_requests`;

export type CreateInput = {
  clientId: string | null;
  externalId: string;
  kind: RequestKind;
  title: string;
  body: string;
  locale: string;
  entityRefs: EntityRef[];
  demandEvidence: DemandEvidence;
  priorityHint: PriorityHint;
  callbackUrl: string | null;
};

export type CreateResult = {
  request: ContentRequest;
  /** False when an existing row was returned for a repeated external_id. */
  created: boolean;
};

/**
 * Idempotent create. A repeat (client_id, external_id) returns the stored row
 * untouched — resubmitting must not reset a request that triage already moved
 * forward, and must not silently overwrite the original text either.
 */
export async function createRequest(input: CreateInput): Promise<CreateResult> {
  const db = getD1();
  const existing = await db
    .prepare(`${SELECT} WHERE client_id IS ? AND external_id = ?`)
    .bind(input.clientId, input.externalId)
    .first<Row>();
  if (existing) {
    return { request: mapRow(existing), created: false };
  }

  const id = `cr_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  await db
    .prepare(
      `INSERT INTO content_requests
         (id, client_id, external_id, kind, title, body, locale,
          entity_refs_json, demand_evidence_json, priority_hint, status,
          callback_url, revision)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, 1)`,
    )
    .bind(
      id,
      input.clientId,
      input.externalId,
      input.kind,
      input.title,
      input.body,
      input.locale,
      JSON.stringify(input.entityRefs),
      JSON.stringify(input.demandEvidence),
      input.priorityHint,
      input.callbackUrl,
    )
    .run();

  await recordEvent(id, null, "received", "client", input.clientId ?? "", "");

  const row = await db.prepare(`${SELECT} WHERE id = ?`).bind(id).first<Row>();
  if (!row) throw new Error("content request vanished immediately after insert");
  return { request: mapRow(row), created: true };
}

export async function getRequest(id: string): Promise<ContentRequest | null> {
  const row = await getD1()
    .prepare(`${SELECT} WHERE id = ?`)
    .bind(id)
    .first<Row>();
  return row ? mapRow(row) : null;
}

export type ListFilter = {
  clientId?: string | null;
  status?: RequestStatus;
  updatedAfter?: string;
  limit: number;
  /** Deterministic keyset position: (updated_at, id) strictly greater than. */
  after?: { updatedAt: string; id: string };
};

export async function listRequests(
  filter: ListFilter,
): Promise<ContentRequest[]> {
  const where: string[] = [];
  const binds: unknown[] = [];

  if (filter.clientId !== undefined) {
    where.push("client_id IS ?");
    binds.push(filter.clientId);
  }
  if (filter.status) {
    where.push("status = ?");
    binds.push(filter.status);
  }
  if (filter.updatedAfter) {
    where.push("updated_at > ?");
    binds.push(toSqlTimestamp(filter.updatedAfter));
  }
  if (filter.after) {
    const cursorAt = toSqlTimestamp(filter.after.updatedAt);
    where.push("(updated_at > ? OR (updated_at = ? AND id > ?))");
    binds.push(cursorAt, cursorAt, filter.after.id);
  }

  const sql = `${SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""}
    ORDER BY updated_at ASC, id ASC LIMIT ?`;
  binds.push(filter.limit);

  const result = await getD1()
    .prepare(sql)
    .bind(...binds)
    .all<Row>();
  return (result.results ?? []).map(mapRow);
}

export type TransitionInput = {
  id: string;
  to: RequestStatus;
  actorType: "human" | "agent" | "system" | "client";
  actorRef: string;
  note?: string;
  resolutionArticleSlug?: string;
  resolutionUrl?: string;
  declinedReason?: string;
  duplicateOf?: string;
};

export type TransitionResult =
  | { ok: true; request: ContentRequest }
  | {
      ok: false;
      reason: "not_found" | "illegal_transition" | "missing_field" | "concurrent_change";
      detail: string;
    };

/**
 * Applies a status transition. Rejects illegal edges and terminal states that
 * would carry no explanation, then bumps `revision` so pulling clients can
 * dedupe on (id, revision).
 */
export async function transitionRequest(
  input: TransitionInput,
): Promise<TransitionResult> {
  const current = await getRequest(input.id);
  if (!current) return { ok: false, reason: "not_found", detail: input.id };

  if (!canTransition(current.status, input.to)) {
    return {
      ok: false,
      reason: "illegal_transition",
      detail: `${current.status} -> ${input.to}`,
    };
  }

  const requirement = TRANSITION_REQUIREMENTS[input.to]?.requires;
  if (requirement === "resolutionArticleSlug" && !input.resolutionArticleSlug) {
    return {
      ok: false,
      reason: "missing_field",
      detail: "resolution_article_slug is required to publish",
    };
  }
  if (requirement === "declinedReason" && !input.declinedReason) {
    return {
      ok: false,
      reason: "missing_field",
      detail: "declined_reason is required to decline",
    };
  }
  if (requirement === "duplicateOf" && !input.duplicateOf) {
    return {
      ok: false,
      reason: "missing_field",
      detail: "duplicate_of is required to mark a duplicate",
    };
  }

  const db = getD1();
  const update = await db
    .prepare(
      `UPDATE content_requests SET
         status = ?,
         resolution_article_slug = COALESCE(?, resolution_article_slug),
         resolution_url = COALESCE(?, resolution_url),
         declined_reason = COALESCE(?, declined_reason),
         duplicate_of = COALESCE(?, duplicate_of),
         revision = revision + 1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = ?`,
    )
    .bind(
      input.to,
      input.resolutionArticleSlug ?? null,
      input.resolutionUrl ?? null,
      input.declinedReason ?? null,
      input.duplicateOf ?? null,
      input.id,
      current.status,
    )
    .run();

  // `WHERE id = ? AND status = ?` is the optimistic-concurrency guard: it applies
  // only if the row is still in the status we validated against. Zero rows means
  // another triage call moved it in between, so this transition did NOT happen.
  // Returning success here would lose a write silently AND append a timeline
  // event describing a transition that never occurred.
  if ((update.meta?.changes ?? 0) === 0) {
    return {
      ok: false,
      reason: "concurrent_change",
      detail: `The request changed status while this transition was being applied; re-read and retry.`,
    };
  }

  await recordEvent(
    input.id,
    current.status,
    input.to,
    input.actorType,
    input.actorRef,
    input.note ?? "",
  );

  const updated = await getRequest(input.id);
  if (!updated) return { ok: false, reason: "not_found", detail: input.id };
  return { ok: true, request: updated };
}

export type RequestEvent = {
  from_status: string | null;
  to_status: string;
  actor_type: string;
  actor_ref: string;
  note: string;
  created_at: string;
};

export async function listEvents(id: string): Promise<RequestEvent[]> {
  const result = await getD1()
    .prepare(
      `SELECT from_status, to_status, actor_type, actor_ref, note, created_at
         FROM content_request_events
        WHERE request_row_id = ? ORDER BY created_at ASC`,
    )
    .bind(id)
    .all<RequestEvent>();
  return result.results ?? [];
}

async function recordEvent(
  requestRowId: string,
  from: string | null,
  to: string,
  actorType: string,
  actorRef: string,
  note: string,
): Promise<void> {
  await getD1()
    .prepare(
      `INSERT INTO content_request_events
         (id, request_row_id, from_status, to_status, actor_type, actor_ref, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      requestRowId,
      from,
      to,
      actorType,
      actorRef.slice(0, 120),
      note.slice(0, 400),
    )
    .run();
}

function mapRow(row: Row): ContentRequest {
  const status = String(row.status ?? "received");
  return {
    id: String(row.id),
    client_id: (row.client_id as string | null) ?? null,
    external_id: String(row.external_id ?? ""),
    kind: String(row.kind ?? "new_article") as RequestKind,
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    locale: String(row.locale ?? "ko"),
    entity_refs: parseJson<EntityRef[]>(row.entity_refs_json, []),
    demand_evidence: parseJson<DemandEvidence>(row.demand_evidence_json, {}),
    priority_hint: String(row.priority_hint ?? "normal") as PriorityHint,
    status: isRequestStatus(status) ? status : "received",
    resolution_article_slug: (row.resolution_article_slug as string | null) ?? null,
    resolution_url: (row.resolution_url as string | null) ?? null,
    declined_reason: (row.declined_reason as string | null) ?? null,
    duplicate_of: (row.duplicate_of as string | null) ?? null,
    suggestion_id: (row.suggestion_id as string | null) ?? null,
    revision: Number(row.revision ?? 1),
    created_at: toRfc3339(String(row.created_at ?? "")),
    updated_at: toRfc3339(String(row.updated_at ?? "")),
  };
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
