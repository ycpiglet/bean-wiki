// POST /api/telemetry/v1/views — the public view beacon.
//
// This is the one /api/*/v1 endpoint with no client credential: it is called by
// every reader's browser, including readers who are not signed in, which is
// exactly the traffic `activity_events` cannot see. Requiring a credential here
// would mean shipping one to the browser, which is not a credential.
//
// The trade is that the endpoint must be cheap and boring:
//   - body capped at MAX_BODY_BYTES
//   - only four fields read; unknown fields ignored, not stored
//   - referrer class derived server-side from the Referer header, never trusted
//     from the body
//   - per-session-hash rate limit
//
// See docs/TELEMETRY-AND-PRIVACY.md.

import {
  ok,
  problem,
  problemFromStorageError,
  newRequestId,
} from "@/lib/api/envelope";
import { recordView } from "@/lib/telemetry/ingest";
import {
  classifyReferrer,
  sessionHash,
  utcDay,
} from "@/lib/telemetry/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// contract-auth: public
// contract-exempt: public-beacon — called by unauthenticated browsers, so no
// credential can be required. Declared explicitly so the exemption is visible in
// review rather than inferred from missing code; scripts/check-api-contract.mjs
// requires this declaration and fails the build without it.
//
// The marker is a comment, not an export, on purpose. Next 16 builds with
// Turbopack, whose generated validator tolerates extra route exports, but
// `next build --webpack` emits a stricter checkFields() guard that rejects any
// export other than a handler or route config.

const MAX_BODY_BYTES = 1024;
const MAX_VIEWS_PER_MINUTE = 30;

/**
 * Best-effort rate limit.
 *
 * In-process only: it is per isolate, it resets on a cold start, and it does not
 * coordinate across regions. That is accepted deliberately — the alternative is
 * a D1 write per beacon, which costs more than the abuse it would prevent. The
 * durable per-client limiter in src/lib/api/auth.ts stays the mechanism for
 * credentialed endpoints.
 */
const recentBySession = new Map<string, number>();
const MAX_TRACKED_SESSIONS = 50_000;
let lastSweptMinute = "";

function allow(session: string, minute: string): boolean {
  // One entry per session per minute; both the minute rollover and the size cap
  // drop the whole map, which is the correct failure direction (allow, not deny).
  if (minute !== lastSweptMinute || recentBySession.size > MAX_TRACKED_SESSIONS) {
    recentBySession.clear();
    lastSweptMinute = minute;
  }
  const key = `${minute}:${session}`;
  const used = (recentBySession.get(key) ?? 0) + 1;
  recentBySession.set(key, used);
  return used <= MAX_VIEWS_PER_MINUTE;
}

type ViewBody = {
  path?: unknown;
  entityType?: unknown;
  entityKey?: unknown;
  locale?: unknown;
};

export async function POST(request: Request) {
  const requestId = newRequestId();

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return problem("invalid_request", {
      requestId,
      detail: `Body must be at most ${MAX_BODY_BYTES} bytes.`,
    });
  }

  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) {
    return problem("invalid_request", {
      requestId,
      detail: `Body must be at most ${MAX_BODY_BYTES} bytes.`,
    });
  }

  let body: ViewBody | null = null;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    body = parsed && typeof parsed === "object" ? (parsed as ViewBody) : null;
  } catch {
    body = null;
  }
  if (!body || typeof body.path !== "string") {
    return problem("invalid_request", {
      requestId,
      detail: "Send `{ path, entityType?, entityKey?, locale? }` as JSON.",
    });
  }

  const now = new Date();
  const day = utcDay(now);
  const session = await sessionHash(request, day);

  if (!allow(session, now.toISOString().slice(0, 16))) {
    return problem("rate_limited", {
      requestId,
      detail: "Too many views recorded for this session in the current minute.",
      headers: { "retry-after": String(60 - now.getUTCSeconds()) },
    });
  }

  const referrerClass = classifyReferrer(
    request.headers.get("referer"),
    request.headers.get("host"),
  );

  try {
    const result = await recordView({
      path: body.path,
      entityType: typeof body.entityType === "string" ? body.entityType : "",
      entityKey: typeof body.entityKey === "string" ? body.entityKey : "",
      locale: typeof body.locale === "string" ? body.locale : "ko",
      sessionHash: session,
      referrerClass,
      day,
    });
    if (!result.ok) {
      return problem("invalid_request", {
        requestId,
        detail: result.detail,
        extra: { reason: result.reason },
      });
    }
  } catch (error) {
    try {
      return problemFromStorageError(error, requestId);
    } catch {
      return problem("internal", {
        requestId,
        detail: "The view could not be recorded.",
      });
    }
  }

  // 202: accepted for counting. The caller has no reason to wait for a rollup,
  // and a beacon must not be encouraged to retry.
  return ok(
    "page_view.v1",
    { recorded: true },
    { requestId, status: 202, cacheControl: "no-store" },
  );
}
