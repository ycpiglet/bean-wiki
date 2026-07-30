// Contribution persistence. Raw D1 SQL, matching src/lib/platform-data.ts.

import { getD1 } from "../../../db";
import type { Actor } from "@/lib/contributions/actor";

export const CONTRIBUTION_STATUSES = [
  "received",
  "checks_passed",
  "checks_failed",
  "in_review",
  "proposed",
  "merged",
  "rejected",
] as const;

export type ContributionStatus = (typeof CONTRIBUTION_STATUSES)[number];

export function isContributionStatus(value: string): value is ContributionStatus {
  return (CONTRIBUTION_STATUSES as readonly string[]).includes(value);
}

export type Contribution = {
  id: string;
  client_id: string;
  external_id: string;
  article_slug: string;
  locale: string;
  title: string;
  summary: string;
  change_note: string;
  content_request_id: string | null;
  actor: Actor;
  status: ContributionStatus;
  check_report: Record<string, unknown>;
  proposal_url: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
};

// body_html is intentionally omitted from list/detail projections: it can be
// 200 KB and no consumer of the status API needs it back.
const SELECT = `SELECT id, client_id, external_id, article_slug, locale, title,
    summary, change_note, content_request_id, actor_json, status,
    check_report_json, proposal_url, rejected_reason, created_at, updated_at
  FROM contributions`;

export type CreateInput = {
  clientId: string;
  externalId: string;
  articleSlug: string;
  locale: string;
  title: string;
  summary: string;
  bodyHtml: string;
  changeNote: string;
  contentRequestId: string | null;
  actor: Actor;
};

export async function createContribution(
  input: CreateInput,
): Promise<{ contribution: Contribution; created: boolean }> {
  const db = getD1();
  const existing = await db
    .prepare(`${SELECT} WHERE client_id = ? AND external_id = ?`)
    .bind(input.clientId, input.externalId)
    .first<Record<string, unknown>>();
  if (existing) return { contribution: mapRow(existing), created: false };

  const id = `cb_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  await db
    .prepare(
      `INSERT INTO contributions
         (id, client_id, external_id, article_slug, locale, title, summary,
          body_html, change_note, content_request_id, actor_json, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received')`,
    )
    .bind(
      id,
      input.clientId,
      input.externalId,
      input.articleSlug,
      input.locale,
      input.title,
      input.summary,
      input.bodyHtml,
      input.changeNote,
      input.contentRequestId,
      JSON.stringify(input.actor),
    )
    .run();

  const row = await db.prepare(`${SELECT} WHERE id = ?`).bind(id).first<
    Record<string, unknown>
  >();
  if (!row) throw new Error("contribution vanished immediately after insert");
  return { contribution: mapRow(row), created: true };
}

export async function getContribution(id: string): Promise<Contribution | null> {
  const row = await getD1()
    .prepare(`${SELECT} WHERE id = ?`)
    .bind(id)
    .first<Record<string, unknown>>();
  return row ? mapRow(row) : null;
}

/** Body is fetched separately, only by the review path that actually needs it. */
export async function getContributionBody(id: string): Promise<string | null> {
  const row = await getD1()
    .prepare(`SELECT body_html FROM contributions WHERE id = ?`)
    .bind(id)
    .first<{ body_html: string }>();
  return row?.body_html ?? null;
}

export async function listContributions(filter: {
  clientId?: string;
  status?: ContributionStatus;
  limit: number;
}): Promise<Contribution[]> {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (filter.clientId) {
    where.push("client_id = ?");
    binds.push(filter.clientId);
  }
  if (filter.status) {
    where.push("status = ?");
    binds.push(filter.status);
  }
  binds.push(filter.limit);

  const result = await getD1()
    .prepare(
      `${SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""}
        ORDER BY updated_at DESC, id DESC LIMIT ?`,
    )
    .bind(...binds)
    .all<Record<string, unknown>>();
  return (result.results ?? []).map(mapRow);
}

export async function setContributionStatus(input: {
  id: string;
  status: ContributionStatus;
  checkReport?: Record<string, unknown>;
  proposalUrl?: string | null;
  rejectedReason?: string | null;
}): Promise<Contribution | null> {
  await getD1()
    .prepare(
      `UPDATE contributions SET
         status = ?,
         check_report_json = COALESCE(?, check_report_json),
         proposal_url = COALESCE(?, proposal_url),
         rejected_reason = COALESCE(?, rejected_reason),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(
      input.status,
      input.checkReport ? JSON.stringify(input.checkReport) : null,
      input.proposalUrl ?? null,
      input.rejectedReason ?? null,
      input.id,
    )
    .run();
  return getContribution(input.id);
}

function mapRow(row: Record<string, unknown>): Contribution {
  const status = String(row.status ?? "received");
  return {
    id: String(row.id),
    client_id: String(row.client_id ?? ""),
    external_id: String(row.external_id ?? ""),
    article_slug: String(row.article_slug ?? ""),
    locale: String(row.locale ?? "ko"),
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    change_note: String(row.change_note ?? ""),
    content_request_id: (row.content_request_id as string | null) ?? null,
    actor: parseJson<Actor>(row.actor_json, {
      type: "human",
      client_id: String(row.client_id ?? ""),
      operator: "unknown",
    }),
    status: isContributionStatus(status) ? status : "received",
    check_report: parseJson<Record<string, unknown>>(row.check_report_json, {}),
    proposal_url: (row.proposal_url as string | null) ?? null,
    rejected_reason: (row.rejected_reason as string | null) ?? null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
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
