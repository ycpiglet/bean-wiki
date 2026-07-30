import {
  EngagementStoreUnavailableError,
  pruneStoredPageViews,
} from "@/lib/engagement-store";
import { RAW_RETENTION_DAYS } from "@/lib/telemetry/ingest";
import { shiftDay, utcDay } from "@/lib/telemetry/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const beforeDay = shiftDay(utcDay(), -RAW_RETENTION_DAYS);
  try {
    const deletedRows = await pruneStoredPageViews(beforeDay);
    return Response.json(
      {
        ok: true,
        deletedRows,
        beforeDay,
        rawRetentionDays: RAW_RETENTION_DAYS,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const unavailable =
      error instanceof EngagementStoreUnavailableError ||
      (error as { name?: string } | null)?.name === "D1UnavailableError";
    return Response.json(
      {
        ok: false,
        error: unavailable ? "storage_unavailable" : "retention_failed",
      },
      { status: unavailable ? 503 : 500, headers: { "cache-control": "no-store" } },
    );
  }
}
