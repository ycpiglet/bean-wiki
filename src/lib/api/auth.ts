// Machine-caller authentication for /api/*/v1 routes.
//
// Credential format:  bwk_<prefix>_<secret>
//   prefix  12 chars, stored in clear as the O(1) lookup key
//   secret  never stored; only its SHA-256 is persisted
//
// A successful call is audited; so is every rejection, because a burst of 401s
// against one prefix is exactly what we want to be able to see later.

import { getD1 } from "../../../db";
import type { RuntimeD1Database } from "../../../platform/runtime-bindings";
import { sha256Hex, timingSafeEqualHex, randomAlnum } from "@/lib/api/crypto";
import {
  grantsScope,
  type Tier,
  tierWithinCeiling,
  isKnownScope,
} from "@/lib/api/scopes";
import { newRequestId, problem } from "@/lib/api/envelope";

export const CREDENTIAL_PREFIX = "bwk";
const PREFIX_LENGTH = 12;

export type ApiClient = {
  id: string;
  name: string;
  org: string;
  clientType: "human_app" | "agent" | "internal";
  scopes: string[];
  maxTier: Tier;
  rateLimitPerMin: number;
  quotaLimit: number | null;
  quotaUsed: number;
  ipAllowlist: string[];
  webhookUrl: string | null;
};

export type AuthSuccess = {
  ok: true;
  client: ApiClient;
  requestId: string;
  /**
   * The budget actually consumed by THIS call. Routes must emit headers from
   * this rather than reconstructing them from the client's configured limit —
   * a synthesised `remaining: limit` is worse than no header, because clients
   * believe it.
   */
  rate: RateResult;
};
export type AuthFailure = { ok: false; response: Response; requestId: string };
export type AuthResult = AuthSuccess | AuthFailure;

type ClientRow = {
  id: string;
  name: string;
  org: string;
  client_type: string;
  secret_hash: string;
  scopes_json: string;
  max_tier: string;
  status: string;
  rate_limit_per_min: number;
  quota_limit: number | null;
  quota_used: number;
  ip_allowlist_json: string;
  webhook_url: string | null;
  expires_at: string | null;
};

/**
 * Authenticates the caller and checks one required scope.
 *
 * Returns a discriminated union rather than throwing so route handlers stay
 * linear and always attach the same `request_id` to their response.
 */
export async function requireClient(
  request: Request,
  requiredScope: string,
): Promise<AuthResult> {
  const requestId = newRequestId();
  const fail = (
    code: Parameters<typeof problem>[0],
    detail: string,
    extra?: Record<string, unknown>,
    headers?: Record<string, string>,
  ): AuthFailure => ({
    ok: false,
    requestId,
    response: problem(code, { detail, requestId, extra, headers }),
  });

  if (!isKnownScope(requiredScope)) {
    // A typo in a route's scope constant must not silently allow traffic.
    return fail("internal", "Route declared an unknown scope.");
  }

  const presented = readBearer(request);
  if (!presented) {
    return fail("unauthorized", "Provide `Authorization: Bearer <credential>`.");
  }
  const parsed = parseCredential(presented);
  if (!parsed) {
    return fail("unauthorized", "Malformed credential.");
  }

  let db: RuntimeD1Database;
  try {
    db = getD1();
  } catch {
    return fail("storage_unavailable", "Client registry is unavailable.");
  }

  const row = await db
    .prepare(
      `SELECT id, name, org, client_type, secret_hash, scopes_json, max_tier,
              status, rate_limit_per_min, quota_limit, quota_used,
              ip_allowlist_json, webhook_url, expires_at
         FROM api_clients WHERE secret_prefix = ?`,
    )
    .bind(parsed.prefix)
    .first<ClientRow>();

  // Hash unconditionally so a miss and a wrong secret cost the same.
  const presentedHash = await sha256Hex(parsed.secret);
  if (!row || !timingSafeEqualHex(presentedHash, row.secret_hash)) {
    await audit(db, {
      clientId: row?.id ?? null,
      requestId,
      action: "auth.reject",
      resource: new URL(request.url).pathname,
      status: 401,
      scope: requiredScope,
      detail: "credential_mismatch",
    });
    return fail("unauthorized", "Credential is not valid.");
  }

  if (row.status !== "active") {
    await audit(db, {
      clientId: row.id,
      requestId,
      action: "auth.reject",
      resource: new URL(request.url).pathname,
      status: 403,
      scope: requiredScope,
      detail: `status_${row.status}`,
    });
    return fail("forbidden_scope", `Client is ${row.status}.`);
  }

  if (row.expires_at && row.expires_at <= new Date().toISOString()) {
    return fail("forbidden_scope", "Credential has expired.");
  }

  const client = toClient(row);

  const ip = callerIp(request);
  if (client.ipAllowlist.length > 0 && (!ip || !client.ipAllowlist.includes(ip))) {
    await audit(db, {
      clientId: client.id,
      requestId,
      action: "auth.reject",
      resource: new URL(request.url).pathname,
      status: 403,
      scope: requiredScope,
      detail: "ip_not_allowed",
    });
    return fail("forbidden_scope", "Caller address is not allowlisted.");
  }

  if (!grantsScope(client.scopes, requiredScope)) {
    await audit(db, {
      clientId: client.id,
      requestId,
      action: "auth.reject",
      resource: new URL(request.url).pathname,
      status: 403,
      scope: requiredScope,
      detail: "scope_missing",
    });
    return fail("forbidden_scope", `Scope \`${requiredScope}\` is required.`);
  }

  if (client.quotaLimit !== null && client.quotaUsed >= client.quotaLimit) {
    return fail("quota_exhausted", "Client quota for the current period is spent.", {
      quota_limit: client.quotaLimit,
    });
  }

  const rate = await consumeRateBudget(db, client);
  if (!rate.allowed) {
    await audit(db, {
      clientId: client.id,
      requestId,
      action: "auth.rate_limited",
      resource: new URL(request.url).pathname,
      status: 429,
      scope: requiredScope,
      detail: "",
    });
    return fail(
      "rate_limited",
      "Too many requests in the current minute window.",
      undefined,
      rateHeaders(rate),
    );
  }

  await db
    .prepare(`UPDATE api_clients SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(client.id)
    .run();

  return { ok: true, client, requestId, rate };
}

/** Headers every authenticated response should carry. */
export function rateHeaders(rate: RateResult): Record<string, string> {
  const headers: Record<string, string> = {
    "x-ratelimit-limit": String(rate.limit),
    "x-ratelimit-remaining": String(Math.max(0, rate.remaining)),
    "x-ratelimit-reset": String(rate.resetSeconds),
  };
  if (!rate.allowed) headers["retry-after"] = String(rate.resetSeconds);
  return headers;
}

export type RateResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
};

async function consumeRateBudget(
  db: RuntimeD1Database,
  client: ApiClient,
): Promise<RateResult> {
  const now = new Date();
  const windowStart = now.toISOString().slice(0, 16); // minute precision
  const resetSeconds = 60 - now.getUTCSeconds();

  await db
    .prepare(
      `INSERT INTO api_rate_buckets (client_id, window_start, count)
       VALUES (?, ?, 1)
       ON CONFLICT(client_id, window_start)
         DO UPDATE SET count = count + 1`,
    )
    .bind(client.id, windowStart)
    .run();

  const current = await db
    .prepare(
      `SELECT count FROM api_rate_buckets WHERE client_id = ? AND window_start = ?`,
    )
    .bind(client.id, windowStart)
    .first<{ count: number }>();

  const used = current?.count ?? 1;
  // Opportunistic prune keeps the table from growing without a cron job.
  if (used === 1) {
    await db
      .prepare(`DELETE FROM api_rate_buckets WHERE window_start < ?`)
      .bind(new Date(now.getTime() - 10 * 60_000).toISOString().slice(0, 16))
      .run();
  }

  return {
    allowed: used <= client.rateLimitPerMin,
    limit: client.rateLimitPerMin,
    remaining: client.rateLimitPerMin - used,
    resetSeconds,
  };
}

export type AuditEntry = {
  clientId: string | null;
  requestId: string;
  action: string;
  resource?: string;
  status: number;
  scope?: string;
  rowCount?: number | null;
  /** Short machine-readable reason. Never secrets, tokens, or personal data. */
  detail?: string;
};

export async function audit(
  db: RuntimeD1Database,
  entry: AuditEntry,
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO api_client_events
           (id, client_id, request_id, action, resource, status, scope, row_count, detail)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        entry.clientId,
        entry.requestId,
        entry.action,
        (entry.resource ?? "").slice(0, 200),
        entry.status,
        entry.scope ?? "",
        entry.rowCount ?? null,
        (entry.detail ?? "").slice(0, 200),
      )
      .run();
  } catch {
    // Auditing must never turn a served request into an error. The write is
    // best-effort; loss is visible as a gap in the trail.
  }
}

export async function auditOk(
  entry: Omit<AuditEntry, "status"> & { status?: number },
): Promise<void> {
  try {
    await audit(getD1(), { status: 200, ...entry });
  } catch {
    // storage unbound
  }
}

/** Creates a credential. The plaintext is returned once and never stored. */
export async function mintCredential(): Promise<{
  credential: string;
  prefix: string;
  hash: string;
}> {
  const prefix = randomAlnum(PREFIX_LENGTH);
  const secret = randomAlnum(43);
  return {
    credential: `${CREDENTIAL_PREFIX}_${prefix}_${secret}`,
    prefix,
    hash: await sha256Hex(secret),
  };
}

function parseCredential(
  value: string,
): { prefix: string; secret: string } | null {
  const parts = value.split("_");
  if (parts.length !== 3) return null;
  const [scheme, prefix, secret] = parts;
  if (scheme !== CREDENTIAL_PREFIX) return null;
  if (prefix.length !== PREFIX_LENGTH || secret.length < 16) return null;
  return { prefix, secret };
}

function readBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

function callerIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("cf-connecting-ip");
}

function toClient(row: ClientRow): ApiClient {
  return {
    id: row.id,
    name: row.name,
    org: row.org,
    clientType: (row.client_type as ApiClient["clientType"]) ?? "human_app",
    scopes: safeJsonArray(row.scopes_json),
    maxTier: (row.max_tier as Tier) ?? "T1",
    rateLimitPerMin: row.rate_limit_per_min ?? 60,
    quotaLimit: row.quota_limit,
    quotaUsed: row.quota_used ?? 0,
    ipAllowlist: safeJsonArray(row.ip_allowlist_json),
    webhookUrl: row.webhook_url,
  };
}

function safeJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Guards a tier request against the client's ceiling. */
export function clientAllowsTier(client: ApiClient, tier: Tier): boolean {
  return tierWithinCeiling(tier, client.maxTier);
}
