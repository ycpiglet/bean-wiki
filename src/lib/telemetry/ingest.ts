// Append-only write path for `page_views`.
//
// `activity_events` cannot serve as a traffic log: its
// uniqueIndex(email, kind, entity_key) makes a second view by the same reader a
// no-op, and it only exists for signed-in readers. This module is the other
// half — every view is a row, nobody is identified.
//
// Validation here is deliberately strict and rejecting rather than coercing.
// A traffic table filled with junk paths is worse than a traffic table with
// holes, because the junk silently changes every ranking built on top of it.
//
// See docs/TELEMETRY-AND-PRIVACY.md.

import { getD1 } from "../../../db";
import {
  isDay,
  isReferrerClass,
  isSessionHash,
  shiftDay,
  utcDay,
  type ReferrerClass,
} from "@/lib/telemetry/session";

export const MAX_PATH_LENGTH = 300;
export const MAX_ENTITY_KEY_LENGTH = 160;

/** Raw rows are pruned after this many days; see `pruneRawViews`. */
export const RAW_RETENTION_DAYS = 90;

/**
 * "" means "a view we counted but did not attribute to a catalogued entity"
 * (for example the home page before it is broken down further).
 */
export const ENTITY_TYPES = [
  "article",
  "glossary",
  "topic",
  "tag",
  "page",
  "quiz",
  "",
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const TELEMETRY_LOCALES = ["ko", "en"] as const;
export type TelemetryLocale = (typeof TELEMETRY_LOCALES)[number];

export type RecordViewInput = {
  path: string;
  entityType?: string | null;
  entityKey?: string | null;
  locale?: string | null;
  sessionHash: string;
  referrerClass?: string | null;
  /** UTC day; defaults to today. Only the rollup backfill passes this. */
  day?: string | null;
};

export type NormalizedView = {
  path: string;
  entityType: EntityType;
  entityKey: string;
  locale: TelemetryLocale;
  day: string;
  sessionHash: string;
  referrerClass: ReferrerClass;
};

export type ViewRejection =
  | "invalid_path"
  | "invalid_entity_type"
  | "invalid_entity_key"
  | "invalid_locale"
  | "invalid_session"
  | "invalid_referrer"
  | "invalid_day";

export type ValidationResult =
  | { ok: true; view: NormalizedView }
  | { ok: false; reason: ViewRejection; detail: string };

/**
 * Validates and normalises one view.
 *
 * Exported separately from `recordView` so a route can reject a bad beacon
 * before touching storage.
 */
export function validateView(input: RecordViewInput): ValidationResult {
  const path = normalizePath(input.path);
  if (!path) {
    return {
      ok: false,
      reason: "invalid_path",
      detail: `path must be an absolute site path of at most ${MAX_PATH_LENGTH} characters.`,
    };
  }

  const entityType = (input.entityType ?? "").trim();
  if (!(ENTITY_TYPES as readonly string[]).includes(entityType)) {
    return {
      ok: false,
      reason: "invalid_entity_type",
      detail: `entityType must be one of: ${ENTITY_TYPES.filter(Boolean).join(", ")} (or omitted).`,
    };
  }

  const entityKey = stripControl(input.entityKey ?? "").trim();
  if (entityKey.length > MAX_ENTITY_KEY_LENGTH) {
    return {
      ok: false,
      reason: "invalid_entity_key",
      detail: `entityKey must be at most ${MAX_ENTITY_KEY_LENGTH} characters.`,
    };
  }
  if (entityType !== "" && entityKey === "") {
    return {
      ok: false,
      reason: "invalid_entity_key",
      detail: "entityKey is required when entityType is set.",
    };
  }

  const locale = (input.locale ?? "ko").trim();
  if (!(TELEMETRY_LOCALES as readonly string[]).includes(locale)) {
    return {
      ok: false,
      reason: "invalid_locale",
      detail: `locale must be one of: ${TELEMETRY_LOCALES.join(", ")}.`,
    };
  }

  if (!isSessionHash(input.sessionHash)) {
    return {
      ok: false,
      reason: "invalid_session",
      detail: "sessionHash must come from sessionHash() in telemetry/session.",
    };
  }

  const referrerClass = (input.referrerClass ?? "direct").trim();
  if (!isReferrerClass(referrerClass)) {
    return {
      ok: false,
      reason: "invalid_referrer",
      detail: "referrerClass must come from classifyReferrer().",
    };
  }

  const day = (input.day ?? utcDay()).trim();
  if (!isDay(day)) {
    return { ok: false, reason: "invalid_day", detail: "day must be YYYY-MM-DD." };
  }

  return {
    ok: true,
    view: {
      path,
      // The membership checks above narrow these, but TypeScript cannot see
      // through `includes` on a readonly tuple.
      entityType: entityType as EntityType,
      entityKey: entityType === "" ? "" : entityKey,
      locale: locale as TelemetryLocale,
      day,
      sessionHash: input.sessionHash,
      referrerClass: referrerClass as ReferrerClass,
    },
  };
}

export type RecordViewResult =
  | { ok: true; day: string }
  | { ok: false; reason: ViewRejection; detail: string };

/** Appends one row. Never updates, never deduplicates — that is the point. */
export async function recordView(
  input: RecordViewInput,
): Promise<RecordViewResult> {
  const validated = validateView(input);
  if (!validated.ok) return validated;
  const view = validated.view;

  await getD1()
    .prepare(
      `INSERT INTO page_views
         (id, path, entity_type, entity_key, locale, day, session_hash, referrer_class)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      view.path,
      view.entityType,
      view.entityKey,
      view.locale,
      view.day,
      view.sessionHash,
      view.referrerClass,
    )
    .run();

  return { ok: true, day: view.day };
}

/**
 * Deletes raw rows older than the retention window.
 *
 * Called by the rollup job (src/lib/metrics/rollup.ts) rather than by the write
 * path, so pruning happens exactly once per run on a schedule instead of
 * randomly on a reader's request. `daily_metrics` is never pruned: it holds no
 * per-session column, so it does not age into a privacy liability.
 */
export async function pruneRawViews(now: Date = new Date()): Promise<number> {
  const cutoff = shiftDay(utcDay(now), -RAW_RETENTION_DAYS);
  const result = await getD1()
    .prepare(`DELETE FROM page_views WHERE day < ?`)
    .bind(cutoff)
    .run();
  return Number(result.meta.changes ?? 0);
}

/**
 * Keeps only the path. Query strings and fragments are dropped before storage
 * because a query string is where a reader's search terms live.
 */
function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cut = stripControl(raw).split(/[?#]/)[0].trim();
  if (!cut.startsWith("/")) return null;
  if (cut.length > MAX_PATH_LENGTH) return null;
  return cut;
}

function stripControl(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "");
}
