// POST /api/telemetry/v1/rollup — internal cron job.
//
// Recomputes `daily_metrics` for the requested days from raw `page_views` and
// prunes expired raw rows. Internal clients only: this mutates the read model
// and prunes data, so it is not something a partner integration may trigger,
// even one that legitimately holds `metrics:read`.
//
// See docs/TELEMETRY-AND-PRIVACY.md.

import { auditOk, requireClient } from "@/lib/api/auth";
import { ok, problem, problemFromStorageError } from "@/lib/api/envelope";
import { SCOPES } from "@/lib/api/scopes";
import { normalizeRollupDays, rollupDays } from "@/lib/metrics/rollup";
import { RAW_RETENTION_DAYS } from "@/lib/telemetry/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESOURCE = "/api/telemetry/v1/rollup";

export async function POST(request: Request) {
  const auth = await requireClient(request, SCOPES.metricsRead);
  if (!auth.ok) return auth.response;

  if (auth.client.clientType !== "internal") {
    return problem("forbidden_scope", {
      requestId: auth.requestId,
      detail:
        "The rollup job is internal-only. Read metrics through GET /api/metrics/v1 instead.",
      extra: { required_client_type: "internal" },
    });
  }

  const body = (await request.json().catch(() => null)) as {
    day?: unknown;
    days?: unknown;
  } | null;

  const requested = body?.days ?? body?.day ?? null;
  const days = normalizeRollupDays(requested);
  if (!days.ok) {
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: days.detail,
    });
  }

  try {
    const result = await rollupDays(days.days);
    await auditOk({
      clientId: auth.client.id,
      requestId: auth.requestId,
      action: "metrics.rollup",
      resource: RESOURCE,
      scope: SCOPES.metricsRead,
      rowCount: result.rowsWritten,
    });
    return ok(
      "metric_rollup.v1",
      {
        days: result.days.map((day) => ({
          day: day.day,
          rows_written: day.rowsWritten,
          metrics: day.metrics.map((metric) => ({
            metric: metric.metric,
            rows: metric.rows,
          })),
        })),
        rows_written: result.rowsWritten,
        pruned_views: result.prunedViews,
        raw_retention_days: RAW_RETENTION_DAYS,
      },
      { requestId: auth.requestId, cacheControl: "no-store" },
    );
  } catch (error) {
    return problemFromStorageError(error, auth.requestId);
  }
}
