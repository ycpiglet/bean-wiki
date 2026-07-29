// GET /api/metrics/v1?metric=…  — the read side of the telemetry model.
//
// Every number served here comes from a catalogue definition
// (src/lib/metrics/catalog.ts), never from SQL written in this file. Rolled-up
// metrics are read from `daily_metrics`; when the rollup has not run for the
// requested day the definition is computed live so a missing cron run degrades
// freshness instead of returning a wrong zero. Which path was taken is reported
// as `computed_from`.
//
// Suppression: rows below the k-anonymity floor are dropped and counted. The
// count is part of the payload, because "withheld" and "absent" are different
// answers and a consumer that cannot tell them apart will report the wrong one.
//
// See docs/TELEMETRY-AND-PRIVACY.md.

import { auditOk, requireClient } from "@/lib/api/auth";
import { ok, problem, problemFromStorageError } from "@/lib/api/envelope";
import { SCOPES } from "@/lib/api/scopes";
import { getD1 } from "../../../../../db";
import {
  applySuppression,
  describeMetric,
  getMetric,
  resolveMetricParams,
  K_ANONYMITY_FLOOR,
  METRIC_IDS,
  MAX_LIMIT,
  type MetricDefinition,
  type MetricParams,
  type MetricRow,
} from "@/lib/metrics/catalog";
import { readDailyMetric } from "@/lib/metrics/rollup";
import { shiftDay, sessionGroupingAvailable } from "@/lib/telemetry/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESOURCE = "/api/metrics/v1";

export async function GET(request: Request) {
  const auth = await requireClient(request, SCOPES.metricsRead);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const metricId = (url.searchParams.get("metric") ?? "").trim();
  if (!metricId) {
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: "`metric` is required.",
      extra: { valid_metrics: METRIC_IDS },
    });
  }

  const metric = getMetric(metricId);
  if (!metric) {
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: `Unknown metric \`${metricId}\`.`,
      extra: { valid_metrics: METRIC_IDS },
    });
  }

  const resolved = resolveMetricParams(metric, {
    day: url.searchParams.get("day"),
    window: url.searchParams.get("window"),
    dimension: url.searchParams.get("dimension"),
    limit: url.searchParams.get("limit"),
  });
  if (!resolved.ok) {
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: resolved.detail,
      extra: { valid_metrics: METRIC_IDS, max_limit: MAX_LIMIT },
    });
  }
  const params = resolved.params;

  try {
    const series = await readSeries(metric, params);
    const suppression = applySuppression(metric, series.rows);

    await auditOk({
      clientId: auth.client.id,
      requestId: auth.requestId,
      action: "metrics.read",
      resource: RESOURCE,
      scope: SCOPES.metricsRead,
      rowCount: suppression.rows.length,
      detail: metric.id,
    });

    return ok(
      "metric_series.v1",
      {
        metric: describeMetric(metric),
        period: describePeriod(metric, params),
        computed_from: series.computedFrom,
        dimension_filter: params.dimensionKey,
        // False means TELEMETRY_SALT is unset, so session counts are inflated.
        session_grouping: sessionGroupingAvailable(),
        k_anonymity_floor: K_ANONYMITY_FLOOR,
        suppression: metric.suppression,
        suppressed_rows: suppression.suppressed,
        rows: suppression.rows,
      },
      {
        requestId: auth.requestId,
        cacheControl: "no-store",
        page: {
          limit: params.limit,
          has_more: series.rows.length >= params.limit,
          next_cursor: null,
        },
      },
    );
  } catch (error) {
    return problemFromStorageError(error, auth.requestId);
  }
}

type Series = { rows: MetricRow[]; computedFrom: "rollup" | "live" };

async function readSeries(
  metric: MetricDefinition,
  params: MetricParams,
): Promise<Series> {
  if (metric.rollup) {
    const stored = await readDailyMetric(
      metric.id,
      params.day,
      params.dimensionKey,
      params.limit,
    );
    if (stored.length > 0) return { rows: stored, computedFrom: "rollup" };
  }
  return { rows: await computeLive(metric, params), computedFrom: "live" };
}

async function computeLive(
  metric: MetricDefinition,
  params: MetricParams,
): Promise<MetricRow[]> {
  const query = metric.build(params);
  const result = await getD1()
    .prepare(query.sql)
    .bind(...query.params)
    .all<MetricRow>();
  return result.results.map((row) => ({
    dimension_key: String(row.dimension_key ?? ""),
    value: Number(row.value ?? 0),
    subject_count: Number(row.subject_count ?? 0),
  }));
}

function describePeriod(metric: MetricDefinition, params: MetricParams) {
  if (metric.period === "snapshot") return { kind: "snapshot" as const };
  if (metric.period === "day") {
    return { kind: "day" as const, day: params.day };
  }
  return {
    kind: "window" as const,
    from: shiftDay(params.day, -(params.windowDays - 1)),
    to: params.day,
    days: params.windowDays,
  };
}
