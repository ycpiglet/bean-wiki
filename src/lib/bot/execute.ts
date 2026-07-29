// Command execution.
//
// Every handler here runs a query that is written out in full in this file or in
// src/lib/metrics/catalog.ts. Nothing is assembled from caller input beyond bound
// parameters, and every aggregate leaves through applySuppression().

import { getD1 } from "../../../db";
import {
  applySuppression,
  getMetric,
  resolveMetricParams,
  type MetricRow,
} from "@/lib/metrics/catalog";
import { topMisses } from "@/lib/knowledge/gaps";
import { isOpen, REQUEST_STATUSES } from "@/lib/requests/status";
import type { BotCommand } from "@/lib/bot/catalog";

export type ExecOutcome =
  | {
      ok: true;
      /** Rendered Korean answer. */
      text: string;
      /** Structured payload for non-chat surfaces. */
      data: unknown;
      rowCount: number;
      suppressed: number;
    }
  | { ok: false; detail: string };

export type ExecContext = {
  command: BotCommand;
  params: Record<string, string | number>;
};

export async function execute(context: ExecContext): Promise<ExecOutcome> {
  switch (context.command.handler) {
    case "metric":
      return runMetric(context);
    case "statsToday":
      return runStatsToday(context);
    case "contentGaps":
      return runContentGaps(context);
    case "requestsQueue":
      return runRequestsQueue(context);
    case "clientsUsage":
      return runClientsUsage(context);
    case "requestsTriage":
      return {
        ok: false,
        detail:
          "요청 상태 변경은 확인 절차를 거친 뒤 /api/requests/v1/content-requests/{id} PATCH로 실행됩니다.",
      };
    default:
      // An unrouted handler name is a catalogue bug; fail loudly.
      return {
        ok: false,
        detail: `핸들러 \`${context.command.handler}\`가 구현되어 있지 않습니다.`,
      };
  }
}

async function runMetric(context: ExecContext): Promise<ExecOutcome> {
  const metric = context.command.metricId ? getMetric(context.command.metricId) : null;
  if (!metric) {
    return { ok: false, detail: "명령에 연결된 지표를 찾을 수 없습니다." };
  }

  const resolved = resolveMetricParams(metric, {
    day: asString(context.params.day),
    window: asString(context.params.window_days),
    limit: asString(context.params.limit),
  });
  if (!resolved.ok) return { ok: false, detail: resolved.detail };

  const query = metric.build(resolved.params);
  const result = await getD1()
    .prepare(query.sql)
    .bind(...query.params)
    .all<MetricRow>();
  const { rows, suppressed } = applySuppression(metric, result.results ?? []);

  const lines = rows.map((row, index) => {
    const label = row.dimension_key || "전체";
    return `${index + 1}. ${label} — ${formatValue(row.value, metric.unit)}`;
  });

  return {
    ok: true,
    text: [
      `**${metric.title}**`,
      lines.length ? lines.join("\n") : "해당 기간에 표시할 데이터가 없습니다.",
      suppressed > 0
        ? `\n최소 인원 기준(고유 세션 5) 미달로 ${suppressed}개 항목을 숨겼습니다.`
        : "",
      `\n산식: ${metric.formula}`,
    ]
      .filter(Boolean)
      .join("\n"),
    data: { metric: metric.id, params: resolved.params, rows, suppressed },
    rowCount: rows.length,
    suppressed,
  };
}

async function runStatsToday(context: ExecContext): Promise<ExecOutcome> {
  const day = normalizeDay(asString(context.params.day));
  const db = getD1();

  // Two named metrics rather than one ad-hoc join, so the numbers the bot says
  // are the same numbers the metrics API returns.
  const totals = getMetric("views.total");
  const uniques = getMetric("views.unique_sessions");
  if (!totals || !uniques) {
    return { ok: false, detail: "기본 지표 정의를 찾을 수 없습니다." };
  }

  const read = async (metricId: "views.total" | "views.unique_sessions", target: string) => {
    const metric = getMetric(metricId);
    if (!metric) return { value: 0, subject_count: 0 };
    const params = resolveMetricParams(metric, { day: target });
    if (!params.ok) return { value: 0, subject_count: 0 };
    const query = metric.build(params.params);
    const row = await db
      .prepare(query.sql)
      .bind(...query.params)
      .first<MetricRow>();
    return { value: Number(row?.value ?? 0), subject_count: Number(row?.subject_count ?? 0) };
  };

  const previous = shiftDay(day, -1);
  const [todayViews, todayUnique, yesterdayViews] = await Promise.all([
    read("views.total", day),
    read("views.unique_sessions", day),
    read("views.total", previous),
  ]);

  const openRequests = await countOpenRequests();
  const delta =
    yesterdayViews.value > 0
      ? ((todayViews.value - yesterdayViews.value) / yesterdayViews.value) * 100
      : null;

  // Below the floor we report the aggregate but not a per-reader breakdown, and
  // we say so, because "0" would be a lie on a genuinely quiet day.
  const thin = todayUnique.value > 0 && todayUnique.value < 5;

  return {
    ok: true,
    text: [
      `**${day} 이용 통계**`,
      `- 조회수: ${todayViews.value.toLocaleString("ko-KR")}`,
      `- 고유 세션: ${todayUnique.value.toLocaleString("ko-KR")}`,
      delta === null
        ? "- 전일 대비: 비교 기준 없음"
        : `- 전일 대비: ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`,
      `- 미처리 콘텐츠 요청: ${openRequests}`,
      thin
        ? "\n고유 세션이 최소 인원 기준(5) 미만이라 문서별 분해는 제공하지 않습니다."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
    data: {
      day,
      views: todayViews.value,
      unique_sessions: todayUnique.value,
      previous_day_views: yesterdayViews.value,
      change_percent: delta,
      open_requests: openRequests,
    },
    rowCount: 1,
    suppressed: thin ? 1 : 0,
  };
}

async function runContentGaps(context: ExecContext): Promise<ExecOutcome> {
  const limit = clamp(Number(context.params.limit ?? 15), 1, 50);
  const sinceDays = clamp(Number(context.params.window_days ?? 30), 1, 90);
  const misses = await topMisses({ limit, sinceDays, onlyUnfiled: true });

  const lines = misses.map(
    (miss, index) =>
      `${index + 1}. \`${miss.query}\`${miss.entity_type ? ` (${miss.entity_type})` : ""} — ${miss.hit_count}회`,
  );

  return {
    ok: true,
    text: [
      `**콘텐츠 공백 — 최근 ${sinceDays}일**`,
      lines.length
        ? lines.join("\n")
        : "미해결 조회 실패가 없습니다. 외부 앱이 찾는 용어를 모두 설명하고 있습니다.",
      lines.length
        ? "\n이 용어들은 외부 앱이 /resolve로 정규화하려다 실패한 것입니다. 요청이 등록된 항목은 제외했습니다."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
    data: { window_days: sinceDays, misses },
    rowCount: misses.length,
    suppressed: 0,
  };
}

async function runRequestsQueue(context: ExecContext): Promise<ExecOutcome> {
  const limit = clamp(Number(context.params.limit ?? 20), 1, 50);
  const status = asString(context.params.status);
  if (status && !(REQUEST_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, detail: `\`${status}\`는 알 수 없는 상태입니다.` };
  }

  const open = REQUEST_STATUSES.filter(isOpen);
  const placeholders = open.map(() => "?").join(", ");
  const sql = status
    ? `SELECT id, kind, title, status, priority_hint, client_id, updated_at
         FROM content_requests WHERE status = ?
        ORDER BY updated_at DESC LIMIT ?`
    : `SELECT id, kind, title, status, priority_hint, client_id, updated_at
         FROM content_requests WHERE status IN (${placeholders})
        ORDER BY
          CASE priority_hint WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
          updated_at DESC
        LIMIT ?`;
  const binds = status ? [status, limit] : [...open, limit];

  type Row = {
    id: string;
    kind: string;
    title: string;
    status: string;
    priority_hint: string;
    client_id: string | null;
    updated_at: string;
  };
  const result = await getD1()
    .prepare(sql)
    .bind(...binds)
    .all<Row>();
  const rows = result.results ?? [];

  const lines = rows.map(
    (row) =>
      `- \`${row.id}\` [${row.status}/${row.priority_hint}] ${row.title} — ${row.client_id ? "앱 요청" : "사람 제안"}`,
  );

  return {
    ok: true,
    text: [
      status ? `**콘텐츠 요청 — ${status}**` : "**미처리 콘텐츠 요청**",
      lines.length ? lines.join("\n") : "처리할 요청이 없습니다.",
    ].join("\n"),
    data: { status: status ?? "open", requests: rows },
    rowCount: rows.length,
    suppressed: 0,
  };
}

async function runClientsUsage(context: ExecContext): Promise<ExecOutcome> {
  const limit = clamp(Number(context.params.limit ?? 20), 1, 50);
  const windowDays = clamp(Number(context.params.window_days ?? 7), 1, 90);

  // Client-level counts only. Never the request bodies, never the scopes'
  // secrets, never a per-end-user breakdown.
  type Row = {
    client_id: string | null;
    name: string | null;
    calls: number;
    rejections: number;
    last_used_at: string | null;
  };
  const result = await getD1()
    .prepare(
      `SELECT e.client_id AS client_id,
              c.name AS name,
              COUNT(*) AS calls,
              SUM(CASE WHEN e.status >= 400 THEN 1 ELSE 0 END) AS rejections,
              MAX(c.last_used_at) AS last_used_at
         FROM api_client_events e
         LEFT JOIN api_clients c ON c.id = e.client_id
        WHERE e.created_at >= datetime('now', ?)
        GROUP BY e.client_id
        ORDER BY calls DESC
        LIMIT ?`,
    )
    .bind(`-${windowDays} days`, limit)
    .all<Row>();
  const rows = result.results ?? [];

  const lines = rows.map(
    (row) =>
      `- ${row.name ?? row.client_id ?? "알 수 없음"} — ${row.calls}회 (거절 ${row.rejections})`,
  );

  return {
    ok: true,
    text: [
      `**API 클라이언트 사용량 — 최근 ${windowDays}일**`,
      lines.length ? lines.join("\n") : "기록된 호출이 없습니다.",
    ].join("\n"),
    data: { window_days: windowDays, clients: rows },
    rowCount: rows.length,
    suppressed: 0,
  };
}

async function countOpenRequests(): Promise<number> {
  const open = REQUEST_STATUSES.filter(isOpen);
  const placeholders = open.map(() => "?").join(", ");
  const row = await getD1()
    .prepare(
      `SELECT COUNT(*) AS value FROM content_requests WHERE status IN (${placeholders})`,
    )
    .bind(...open)
    .first<{ value: number }>();
  return Number(row?.value ?? 0);
}

function formatValue(value: number, unit: string): string {
  if (unit === "ratio") return `${value.toFixed(2)}x`;
  return value.toLocaleString("ko-KR");
}

function normalizeDay(value: string | undefined): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!value) return today;
  if (value === "yesterday") return shiftDay(today, -1);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : today;
}

function shiftDay(day: string, delta: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return String(value);
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.floor(value), min), max);
}
