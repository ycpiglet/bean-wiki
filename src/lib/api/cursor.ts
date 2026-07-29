// Opaque, tamper-evident cursors for list endpoints.
//
// Contract (PLATFORM-CONTRACT-V1.md §6): the client never interprets a cursor.
// We therefore sign it rather than merely encoding it, so a client cannot hand
// us a fabricated sort position and page through rows out of order.
//
// Payload is the last row's deterministic sort key plus the snapshot the page
// set belongs to, so a long pagination run stays consistent.

import { hmacSha256Hex, timingSafeEqualHex, toBase64Url, fromBase64Url } from "@/lib/api/crypto";
import { getRuntimeBindings } from "../../../platform/runtime-bindings";

export type CursorPayload = {
  /** Value of the primary sort column of the last row returned. */
  k: string;
  /** Tie-breaker id of the last row returned. */
  i: string;
  /** snapshot_at of the first page, echoed on every later page. */
  s: string;
};

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function signingSecret(): string | null {
  const secret =
    getRuntimeBindings().PLATFORM_GATEWAY_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.PLATFORM_GATEWAY_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

export async function encodeCursor(payload: CursorPayload): Promise<string> {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const secret = signingSecret();
  if (!secret) return `u.${body}`;
  const signature = await hmacSha256Hex(secret, body);
  return `s.${body}.${signature.slice(0, 32)}`;
}

export type CursorResult =
  | { ok: true; payload: CursorPayload }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

export async function decodeCursor(cursor: string): Promise<CursorResult> {
  const parts = cursor.split(".");
  let body: string;

  if (parts[0] === "s" && parts.length === 3) {
    const secret = signingSecret();
    if (!secret) return { ok: false, reason: "bad_signature" };
    const expected = (await hmacSha256Hex(secret, parts[1])).slice(0, 32);
    if (!timingSafeEqualHex(parts[2], expected)) {
      return { ok: false, reason: "bad_signature" };
    }
    body = parts[1];
  } else if (parts[0] === "u" && parts.length === 2) {
    // Unsigned cursors exist only where no secret is configured. Accepting them
    // when a secret IS configured would be a downgrade, so that case is refused
    // above by returning bad_signature for "s." and here by this check.
    if (signingSecret()) return { ok: false, reason: "bad_signature" };
    body = parts[1];
  } else {
    return { ok: false, reason: "malformed" };
  }

  let payload: CursorPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (
    typeof payload?.k !== "string" ||
    typeof payload?.i !== "string" ||
    typeof payload?.s !== "string"
  ) {
    return { ok: false, reason: "malformed" };
  }

  const snapshot = Date.parse(payload.s);
  if (Number.isNaN(snapshot)) return { ok: false, reason: "malformed" };
  if (Date.now() - snapshot > MAX_AGE_MS) return { ok: false, reason: "expired" };

  return { ok: true, payload };
}

/** Clamps a caller-supplied limit to the contract's 1..500 window. */
export function clampLimit(raw: string | null, fallback = 100, max = 500): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), max);
}
