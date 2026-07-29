// Session grouping and referrer classification for `page_views`.
//
// The question the traffic log has to answer is "how many *distinct* readers
// saw this today", and the constraint is that nothing identifying a reader may
// be stored. `session_hash` is the whole answer: a keyed digest of
// (daily salt, ip, user-agent) whose inputs are discarded immediately.
//
// Why the salt carries the UTC day: the same reader on two different days
// produces two unrelated hashes, so the table cannot be used to build a
// cross-day profile even by whoever holds the salt. That property is structural,
// not a policy we promise to honour.
//
// See docs/TELEMETRY-AND-PRIVACY.md.

import { sha256Hex } from "@/lib/api/crypto";
import { getRuntimeBindings } from "../../../platform/runtime-bindings";

/** Hex chars kept from the SHA-256 digest. 128 bits is far past collision risk. */
export const SESSION_HASH_LENGTH = 32;

/**
 * `app:<clientId>` covers server-side callers that render Bean Wiki content
 * inside another company app. Any other external referrer folds into `direct`,
 * because the stored enum is fixed by the plan (§4 Phase 5).
 */
export type ReferrerClass =
  | "internal"
  | "search"
  | "social"
  | "direct"
  | `app:${string}`;

const FIXED_REFERRER_CLASSES: readonly string[] = [
  "internal",
  "search",
  "social",
  "direct",
];

// --- day helpers ----------------------------------------------------------
//
// Every telemetry bucket is a UTC day. Local time is deliberately not used: a
// KST-vs-UTC boundary would make rollups depend on which region served the
// request.

export function utcDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function isDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && utcDay(parsed) === value;
}

/** `shiftDay("2026-07-28", -7) === "2026-07-21"`. */
export function shiftDay(day: string, deltaDays: number): string {
  const base = Date.parse(`${day}T00:00:00Z`);
  if (Number.isNaN(base)) throw new Error("shiftDay expects a YYYY-MM-DD day.");
  return utcDay(new Date(base + deltaDays * 86_400_000));
}

// --- session hash ---------------------------------------------------------

function telemetrySalt(): string {
  const raw =
    getRuntimeBindings().TELEMETRY_SALT ?? process.env.TELEMETRY_SALT ?? "";
  return raw.trim();
}

/**
 * False when TELEMETRY_SALT is unset. Callers that report distinct-visitor
 * numbers must surface this, because every view then looks like a new visitor
 * and `views.unique_sessions` degenerates into `views.total`.
 */
export function sessionGroupingAvailable(): boolean {
  return telemetrySalt().length > 0;
}

/** Unlinkable per-request value, used when no salt is configured. */
export function randomSessionHash(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, SESSION_HASH_LENGTH);
}

/**
 * Groups requests that are probably the same reader on `day`.
 *
 * With no salt we return a random value rather than an unsalted hash: an
 * unsalted SHA-256 of (ip, user-agent) is trivially reversible by anyone who can
 * enumerate address ranges, which would make the column personal data. Losing
 * grouping is the cheaper failure.
 *
 * The ip and the user-agent exist only as arguments to the digest here. Nothing
 * in this module returns or stores them.
 */
export async function sessionHash(
  request: Request,
  day: string,
): Promise<string> {
  const salt = telemetrySalt();
  if (!salt) return randomSessionHash();
  const ip = callerIp(request) ?? "";
  const agent = request.headers.get("user-agent") ?? "";
  // NUL separators cannot occur in a header value, so two different input
  // triples cannot produce the same pre-image by concatenation.
  const digest = await sha256Hex(`${salt}\u0000${day}\u0000${ip}\u0000${agent}`);
  return digest.slice(0, SESSION_HASH_LENGTH);
}

export function isSessionHash(value: string): boolean {
  return value.length === SESSION_HASH_LENGTH && /^[0-9a-f]+$/.test(value);
}

function callerIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    null
  );
}

// --- referrer classification ---------------------------------------------
//
// Only the class is stored, never the referring URL: a referrer can carry the
// reader's search terms, and those are not ours to keep.

const SEARCH_HOSTS = [
  "google",
  "bing",
  "duckduckgo",
  "search.naver.com",
  "search.daum.net",
  "yahoo",
  "baidu",
  "yandex",
  "ecosia",
  "kagi.com",
  "perplexity.ai",
  "brave.com",
];

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "threads.net",
  "twitter.com",
  "x.com",
  "t.co",
  "linkedin.com",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "pinterest.com",
  "discord.com",
  "t.me",
  "telegram.org",
  "kakao.com",
  "kakaocorp.com",
  "band.us",
  "blog.naver.com",
  "cafe.naver.com",
  "brunch.co.kr",
  "tistory.com",
  "velog.io",
];

/**
 * @param referer  the `Referer` header, or null
 * @param host     the host serving the request, used to detect internal links
 * @param clientId set only by server-side integrations; wins over the referrer
 */
export function classifyReferrer(
  referer: string | null | undefined,
  host: string | null | undefined,
  clientId?: string | null,
): ReferrerClass {
  const app = sanitizeClientId(clientId);
  if (app) return `app:${app}`;
  if (!referer) return "direct";

  let refHost: string;
  try {
    refHost = new URL(referer).hostname.toLowerCase();
  } catch {
    return "direct";
  }

  const selfHost = (host ?? "").toLowerCase().split(":")[0];
  if (selfHost && (refHost === selfHost || refHost.endsWith(`.${selfHost}`))) {
    return "internal";
  }
  if (matchesHost(refHost, SEARCH_HOSTS)) return "search";
  if (matchesHost(refHost, SOCIAL_HOSTS)) return "social";
  return "direct";
}

export function isReferrerClass(value: string): value is ReferrerClass {
  if (FIXED_REFERRER_CLASSES.includes(value)) return true;
  return /^app:[a-z0-9_-]{1,60}$/.test(value);
}

function matchesHost(host: string, needles: readonly string[]): boolean {
  return needles.some(
    (needle) =>
      host === needle ||
      host.endsWith(`.${needle}`) ||
      // Bare tokens such as "google" match google.co.kr, www.google.com, ...
      (!needle.includes(".") &&
        (host === `${needle}.com` ||
          host.startsWith(`${needle}.`) ||
          host.includes(`.${needle}.`))),
  );
}

function sanitizeClientId(clientId: string | null | undefined): string | null {
  if (!clientId) return null;
  const cleaned = clientId.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return cleaned ? cleaned.slice(0, 60) : null;
}
