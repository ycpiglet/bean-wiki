// Bot audit trail and write-command confirmations.
//
// What is recorded: who asked, what role they held, which catalogue command was
// matched, the extracted parameters, and how many rows came back.
// What is NOT recorded: the raw message text, and never the result rows. The
// message can contain anything a person typed; the results can contain content
// we have already decided not to expose in aggregate form.

import { getD1 } from "../../../db";
import { randomAlnum } from "@/lib/api/crypto";
import type { Role } from "@/lib/roles";

export type CommandRecord = {
  requestId: string;
  actorRef: string;
  actorRole: Role;
  surface: string;
  commandId: string | null;
  params: Record<string, string | number>;
  mode: "read" | "write";
  outcome: string;
  rowCount: number | null;
  suppressed: number;
};

export async function recordCommand(record: CommandRecord): Promise<void> {
  try {
    await getD1()
      .prepare(
        `INSERT INTO bot_command_events
           (id, request_id, actor_ref, actor_role, surface, command_id,
            params_json, mode, outcome, row_count, suppressed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        record.requestId,
        record.actorRef.slice(0, 160),
        record.actorRole,
        record.surface,
        record.commandId,
        JSON.stringify(record.params).slice(0, 400),
        record.mode,
        record.outcome.slice(0, 60),
        record.rowCount,
        record.suppressed,
      )
      .run();
  } catch {
    // Audit is best-effort; a logging failure must not fail an operator's query.
  }
}

const CONFIRMATION_TTL_MS = 5 * 60 * 1000;

export async function issueConfirmation(input: {
  actorRef: string;
  commandId: string;
  params: Record<string, string | number>;
}): Promise<{ token: string; expiresAt: string }> {
  const token = `bcf_${randomAlnum(32)}`;
  const expiresAt = new Date(Date.now() + CONFIRMATION_TTL_MS).toISOString();
  await getD1()
    .prepare(
      `INSERT INTO bot_confirmations
         (token, actor_ref, command_id, params_json, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      token,
      input.actorRef.slice(0, 160),
      input.commandId,
      JSON.stringify(input.params).slice(0, 400),
      expiresAt,
    )
    .run();
  return { token, expiresAt };
}

export type ConsumeResult =
  | { ok: true; params: Record<string, string | number> }
  | { ok: false; reason: "unknown" | "expired" | "consumed" | "actor_mismatch" | "command_mismatch" };

/**
 * Single-use. The UPDATE is conditional on `consumed_at IS NULL`, so two
 * concurrent confirmations of the same token cannot both proceed.
 */
export async function consumeConfirmation(
  token: string,
  actorRef: string,
  commandId: string,
): Promise<ConsumeResult> {
  const db = getD1();
  const row = await db
    .prepare(
      `SELECT actor_ref, command_id, params_json, expires_at, consumed_at
         FROM bot_confirmations WHERE token = ?`,
    )
    .bind(token)
    .first<{
      actor_ref: string;
      command_id: string;
      params_json: string;
      expires_at: string;
      consumed_at: string | null;
    }>();

  if (!row) return { ok: false, reason: "unknown" };
  if (row.consumed_at) return { ok: false, reason: "consumed" };
  if (row.actor_ref !== actorRef.slice(0, 160)) {
    return { ok: false, reason: "actor_mismatch" };
  }
  if (row.command_id !== commandId) {
    return { ok: false, reason: "command_mismatch" };
  }
  if (row.expires_at <= new Date().toISOString()) {
    return { ok: false, reason: "expired" };
  }

  const update = await db
    .prepare(
      `UPDATE bot_confirmations SET consumed_at = CURRENT_TIMESTAMP
        WHERE token = ? AND consumed_at IS NULL`,
    )
    .bind(token)
    .run();
  if ((update.meta?.changes ?? 0) === 0) {
    return { ok: false, reason: "consumed" };
  }

  let params: Record<string, string | number> = {};
  try {
    params = JSON.parse(row.params_json);
  } catch {
    params = {};
  }
  return { ok: true, params };
}
