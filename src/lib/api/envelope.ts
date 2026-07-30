// Shared response contract for every /api/*/v1 route.
// Normative spec: docs/PLATFORM-CONTRACT-V1.md
//
// Two shapes only:
//   success -> JSON envelope (contract_version, schema_version, request_id, ...)
//   failure -> application/problem+json (RFC 9457)
//
// Routes must never hand-roll `Response.json({ error })`; scripts/check-api-contract.mjs
// fails the build when they do.

export const CONTRACT_VERSION = 1;

/** Stable base for problem `type` URIs. Kept absolute so clients can dereference. */
export const PROBLEM_BASE = "https://bean-wiki.vercel.app/problems";

export type Page = {
  limit: number;
  has_more: boolean;
  next_cursor: string | null;
};

export type Envelope<T> = {
  contract_version: number;
  schema_version: string;
  request_id: string;
  snapshot_at: string;
  page?: Page;
  data: T;
};

/**
 * Correlation id for one call. Not a data id, and not derived from user input —
 * it is safe to echo in logs and in problem bodies.
 */
export function newRequestId(): string {
  const raw = crypto.randomUUID().replace(/-/g, "");
  return `req_${raw.slice(0, 24)}`;
}

/** RFC 3339 UTC, matching the Beanote contract's timestamp rule. */
export function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export type OkOptions = {
  page?: Page;
  requestId?: string;
  snapshotAt?: string;
  /** Cache-Control value. Read-only public knowledge routes should set this. */
  cacheControl?: string;
  headers?: Record<string, string>;
  status?: number;
};

export function ok<T>(
  schemaVersion: string,
  data: T,
  options: OkOptions = {},
): Response {
  const requestId = options.requestId ?? newRequestId();
  const body: Envelope<T> = {
    contract_version: CONTRACT_VERSION,
    schema_version: schemaVersion,
    request_id: requestId,
    snapshot_at: options.snapshotAt ?? nowIso(),
    ...(options.page ? { page: options.page } : {}),
    data,
  };
  const headers = new Headers(options.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-request-id", requestId);
  if (options.cacheControl) headers.set("cache-control", options.cacheControl);
  return new Response(JSON.stringify(body), {
    status: options.status ?? 200,
    headers,
  });
}

/**
 * Problem catalogue. Adding a case here is cheaper than inventing an ad-hoc
 * error string, and keeps the status/retry semantics in one table
 * (see PLATFORM-CONTRACT-V1.md §6).
 */
export const PROBLEMS = {
  invalid_request: { status: 400, title: "Invalid request" },
  unauthorized: { status: 401, title: "Missing or invalid credential" },
  forbidden_scope: { status: 403, title: "Scope or tier not granted" },
  not_found: { status: 404, title: "Resource not found" },
  state_conflict: { status: 409, title: "Resource state conflict" },
  cursor_expired: { status: 410, title: "Cursor expired" },
  unprocessable: { status: 422, title: "Semantic validation failed" },
  rate_limited: { status: 429, title: "Rate limit exceeded" },
  quota_exhausted: { status: 429, title: "Quota exhausted" },
  storage_unavailable: { status: 503, title: "Storage unavailable" },
  internal: { status: 500, title: "Internal error" },
} as const;

export type ProblemCode = keyof typeof PROBLEMS;

export type ProblemOptions = {
  detail?: string;
  requestId?: string;
  headers?: Record<string, string>;
  /** Extra members. Must not contain secrets or personal data. */
  extra?: Record<string, unknown>;
};

export function problem(
  code: ProblemCode,
  options: ProblemOptions = {},
): Response {
  const spec = PROBLEMS[code];
  const requestId = options.requestId ?? newRequestId();
  const body = {
    type: `${PROBLEM_BASE}/${code.replace(/_/g, "-")}`,
    title: spec.title,
    status: spec.status,
    ...(options.detail ? { detail: options.detail } : {}),
    request_id: requestId,
    ...(options.extra ?? {}),
  };
  const headers = new Headers(options.headers);
  headers.set("content-type", "application/problem+json; charset=utf-8");
  headers.set("x-request-id", requestId);
  return new Response(JSON.stringify(body), { status: spec.status, headers });
}

/**
 * Maps a thrown D1UnavailableError to 503 and rethrows anything else, so a
 * genuine bug still surfaces as a 500 instead of being masked as downtime.
 */
export function problemFromStorageError(
  error: unknown,
  requestId?: string,
): Response {
  const name = (error as { name?: string } | null)?.name;
  if (name !== "D1UnavailableError") throw error;
  return problem("storage_unavailable", {
    requestId,
    detail: "Durable storage is not bound in this environment.",
  });
}
