// Nightly rollup: raw `page_views` -> `daily_metrics`.
//
// Idempotency is structural, not careful bookkeeping: every run recomputes each
// metric from the raw rows and writes the result with
// `ON CONFLICT(day, metric, dimension_key) DO UPDATE SET value = excluded.value`.
// There is no `value = value + ?` anywhere, so running the job twice for the
// same day produces the same table as running it once.
//
// Two days are recomputed by default (yesterday and today) because "today" is
// still accumulating when the job runs and yesterday may have been rolled up
// before its last hour of traffic landed.
//
// See docs/TELEMETRY-AND-PRIVACY.md.

import { getD1 } from "../../../db";
import type { RuntimeD1Database } from "../../../platform/runtime-bindings";
import {
  rollupMetrics,
  type MetricRow,
  type MetricDefinition,
} from "@/lib/metrics/catalog";
import { pruneRawViews } from "@/lib/telemetry/ingest";
import { isDay, shiftDay, utcDay } from "@/lib/telemetry/session";

/** Per-metric cap on dimension rows written for one day. */
export const ROLLUP_MAX_ROWS = 500;

/** Guards against a caller asking for an unbounded backfill in one request. */
export const ROLLUP_MAX_DAYS = 31;

export type RollupMetricResult = { metric: string; rows: number };

export type RollupDayResult = {
  day: string;
  metrics: RollupMetricResult[];
  rowsWritten: number;
};

export type RollupResult = {
  days: RollupDayResult[];
  rowsWritten: number;
  prunedViews: number;
};

/** Yesterday and today, in UTC. */
export function defaultRollupDays(now: Date = new Date()): string[] {
  const today = utcDay(now);
  return [shiftDay(today, -1), today];
}

export type DaysResult =
  | { ok: true; days: string[] }
  | { ok: false; detail: string };

/** Validates and de-duplicates a caller-supplied day list. */
export function normalizeRollupDays(input: unknown): DaysResult {
  if (input === undefined || input === null) {
    return { ok: true, days: defaultRollupDays() };
  }
  const raw = Array.isArray(input) ? input : [input];
  if (raw.length === 0) return { ok: true, days: defaultRollupDays() };
  if (raw.length > ROLLUP_MAX_DAYS) {
    return {
      ok: false,
      detail: `At most ${ROLLUP_MAX_DAYS} days may be rolled up in one call.`,
    };
  }
  const days: string[] = [];
  for (const value of raw) {
    if (typeof value !== "string" || !isDay(value.trim())) {
      return { ok: false, detail: "Each day must be a UTC date in YYYY-MM-DD form." };
    }
    const day = value.trim();
    if (!days.includes(day)) days.push(day);
  }
  return { ok: true, days: days.sort() };
}

export async function rollupDays(days: string[]): Promise<RollupResult> {
  const db = getD1();
  const results: RollupDayResult[] = [];
  for (const day of days) {
    results.push(await rollupDay(db, day));
  }
  const prunedViews = await pruneRawViews();
  return {
    days: results,
    rowsWritten: results.reduce((sum, day) => sum + day.rowsWritten, 0),
    prunedViews,
  };
}

async function rollupDay(
  db: RuntimeD1Database,
  day: string,
): Promise<RollupDayResult> {
  const metrics: RollupMetricResult[] = [];
  let rowsWritten = 0;

  for (const definition of rollupMetrics()) {
    const rows = await computeRows(db, definition, day);
    for (const row of rows) {
      await upsertDailyMetric(db, day, definition.id, row);
    }
    metrics.push({ metric: definition.id, rows: rows.length });
    rowsWritten += rows.length;
  }

  return { day, metrics, rowsWritten };
}

async function computeRows(
  db: RuntimeD1Database,
  definition: MetricDefinition,
  day: string,
): Promise<MetricRow[]> {
  const query = definition.build({
    day,
    windowDays: definition.defaultWindowDays,
    dimensionKey: null,
    limit: ROLLUP_MAX_ROWS,
  });
  const result = await db
    .prepare(query.sql)
    .bind(...query.params)
    .all<MetricRow>();
  return result.results.map((row) => ({
    dimension_key: String(row.dimension_key ?? ""),
    value: Number(row.value ?? 0),
    subject_count: Number(row.subject_count ?? 0),
  }));
}

async function upsertDailyMetric(
  db: RuntimeD1Database,
  day: string,
  metric: string,
  row: MetricRow,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO daily_metrics
         (day, metric, dimension_key, value, subject_count, computed_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(day, metric, dimension_key) DO UPDATE SET
         value = excluded.value,
         subject_count = excluded.subject_count,
         computed_at = CURRENT_TIMESTAMP`,
    )
    .bind(day, metric, row.dimension_key, row.value, row.subject_count)
    .run();
}

/**
 * Reads a precomputed series. Returns an empty array when the rollup has not run
 * for that day, which the API distinguishes from "the day had no traffic" by
 * falling back to a live computation.
 */
export async function readDailyMetric(
  metric: string,
  day: string,
  dimensionKey: string | null,
  limit: number,
): Promise<MetricRow[]> {
  const params: unknown[] = [metric, day];
  let filter = "";
  if (dimensionKey) {
    filter = " AND dimension_key = ?";
    params.push(dimensionKey);
  }
  params.push(limit);
  const result = await getD1()
    .prepare(
      `SELECT dimension_key, value, subject_count
         FROM daily_metrics
        WHERE metric = ? AND day = ?${filter}
        ORDER BY value DESC, dimension_key ASC
        LIMIT ?`,
    )
    .bind(...params)
    .all<MetricRow>();
  return result.results.map((row) => ({
    dimension_key: String(row.dimension_key ?? ""),
    value: Number(row.value ?? 0),
    subject_count: Number(row.subject_count ?? 0),
  }));
}
