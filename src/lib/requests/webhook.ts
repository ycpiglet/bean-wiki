// Outbound webhooks (PLATFORM-CONTRACT-V1.md §11).
//
// Webhooks are the convenience path, not the contract path: clients are told to
// poll `?updated_after=` as their source of truth. Delivery here is best-effort
// and recorded, so "we tried and your endpoint 500'd" is answerable.

import { getD1 } from "../../../db";
import { hmacSha256Hex } from "@/lib/api/crypto";

export type WebhookEvent =
  | "content_request.status_changed"
  | "content_request.published"
  | "contribution.status_changed";

const MAX_ATTEMPTS = 5;
const TIMEOUT_MS = 5_000;

export type DeliverInput = {
  clientId: string;
  url: string;
  /** Plaintext webhook secret for this client. */
  secret: string;
  event: WebhookEvent;
  resourceId: string;
  payload: unknown;
};

/**
 * Signs and POSTs one event. Never throws: a failed notification must not fail
 * the API call that triggered it.
 */
export async function deliver(input: DeliverInput): Promise<void> {
  const deliveryId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    event: input.event,
    delivery_id: deliveryId,
    sent_at: new Date().toISOString(),
    data: input.payload,
  });

  // Sign "<timestamp>.<body>" so a captured body cannot be replayed later with
  // a fresh timestamp, and the receiver can bound clock skew.
  const signature = await hmacSha256Hex(input.secret, `${timestamp}.${body}`);

  await record(deliveryId, input, "pending", 0, null, "");

  try {
    const response = await fetch(input.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-beanwiki-event": input.event,
        "x-beanwiki-delivery": deliveryId,
        "x-beanwiki-timestamp": String(timestamp),
        "x-beanwiki-signature": `sha256=${signature}`,
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await record(
      deliveryId,
      input,
      response.ok ? "delivered" : "failed",
      1,
      response.status,
      response.ok ? "" : `http_${response.status}`,
    );
  } catch (error) {
    await record(
      deliveryId,
      input,
      "failed",
      1,
      null,
      error instanceof Error ? error.name : "fetch_failed",
    );
  }
}

async function record(
  id: string,
  input: DeliverInput,
  status: string,
  attempts: number,
  code: number | null,
  error: string,
): Promise<void> {
  try {
    const nextAttempt =
      status === "failed" && attempts < MAX_ATTEMPTS
        ? new Date(Date.now() + backoffMs(attempts)).toISOString()
        : null;
    await getD1()
      .prepare(
        `INSERT INTO webhook_deliveries
           (id, client_id, event, resource_id, status, attempts,
            last_status_code, last_error, next_attempt_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           status = excluded.status,
           attempts = excluded.attempts,
           last_status_code = excluded.last_status_code,
           last_error = excluded.last_error,
           next_attempt_at = excluded.next_attempt_at,
           updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        id,
        input.clientId,
        input.event,
        input.resourceId,
        status,
        attempts,
        code,
        error.slice(0, 200),
        nextAttempt,
      )
      .run();
  } catch {
    // Storage unbound or write failed: delivery bookkeeping is best-effort.
  }
}

function backoffMs(attempts: number): number {
  return Math.min(60_000 * 2 ** attempts, 60 * 60_000);
}

/**
 * Verifies an inbound signature using the same scheme, so a company app can
 * import this helper instead of reimplementing (and getting it subtly wrong).
 */
export async function verifySignature(options: {
  secret: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  rawBody: string;
  toleranceSeconds?: number;
}): Promise<boolean> {
  const { secret, timestampHeader, signatureHeader, rawBody } = options;
  if (!timestampHeader || !signatureHeader) return false;
  const timestamp = Number.parseInt(timestampHeader, 10);
  if (!Number.isInteger(timestamp)) return false;
  const tolerance = options.toleranceSeconds ?? 300;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > tolerance) return false;

  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  const presented = signatureHeader.replace(/^sha256=/, "");
  if (presented.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= presented.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
