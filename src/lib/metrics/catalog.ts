// Metric catalogue — one definition per question the platform can answer.
//
// Everything that reports numbers reads from here: /api/metrics/v1, the nightly
// rollup, and (Phase 6) the operator bot. A metric defined twice is a metric
// that will disagree with itself in two places, so no consumer is allowed to
// write its own aggregate SQL.
//
// Each definition owns:
//   - what it means (title/description/formula, for humans and for the bot)
//   - how it is computed (`build` -> parameterised SQL over raw tables)
//   - how it may be exposed (`suppression`, `subject`)
//
// See docs/TELEMETRY-AND-PRIVACY.md.

import { isDay, shiftDay, utcDay } from "@/lib/telemetry/session";

// --- disclosure control ---------------------------------------------------

/**
 * Minimum distinct subjects behind a number before it may leave the server.
 * Same principle as the Beanote contract's T0 rule: with 1-2 sessions behind a
 * row, "someone read this article today" is close to naming that someone.
 */
export const K_ANONYMITY_FLOOR = 5;

// --- trending constants ---------------------------------------------------
//
// See TRENDING_FORMULA below; they are named so the doc and the SQL cannot
// drift apart.

export const TRENDING_BASELINE_DAYS = 7;
export const TRENDING_SMOOTHING = 1;
export const TRENDING_MIN_VIEWS = 10;
export const TRENDING_MIN_SESSIONS = K_ANONYMITY_FLOOR;
export const TRENDING_MIN_RATIO = 1.5;

/**
 * trending.now, in full.
 *
 *   today       = views of the entity on the anchor day
 *   baseline    = views of the same entity over the 7 days BEFORE the anchor day,
 *                 divided by 7 (a per-day rate, not a total)
 *   score       = (today + 1) / (baseline + 1)
 *
 * The +1 on both sides is Laplace smoothing. It does two jobs: it removes the
 * division by zero for an entity with no history, and it damps tiny numbers so
 * a jump from 1 to 3 views scores (3+1)/(1/7+1) = 3.5 instead of 21.
 *
 * Smoothing alone is not enough, so a row must also clear two floors:
 *   today >= TRENDING_MIN_VIEWS (10)      — real volume, not noise
 *   today_sessions >= K_ANONYMITY_FLOOR   — enough distinct readers to publish
 * and be actually rising: score >= TRENDING_MIN_RATIO (1.5).
 *
 * So the 1 -> 3 case never appears at all: it fails the volume floor. This is a
 * ratio against a trailing baseline, never a cumulative total; a permanently
 * popular article has score ~= 1 and is correctly absent from "what is hot".
 */
export const TRENDING_FORMULA =
  "score = (today_views + 1) / (trailing_7d_views / 7 + 1), gated by today_views >= 10, today_sessions >= 5, score >= 1.5";

// --- types ----------------------------------------------------------------

export type MetricUnit =
  | "views"
  | "sessions"
  | "ratio"
  | "requests"
  | "misses";

export type MetricDimension =
  | "article"
  | "locale"
  | "entity"
  | "resolve_query"
  | "none";

/** What one unit in `subject_count` is. Drives the k-anonymity decision. */
export type MetricSubject = "session" | "request" | "none";

export type MetricPeriod = "day" | "window" | "snapshot";

export type MetricSuppression = "k_anonymity" | "exempt";

export type MetricParams = {
  /** Anchor day (UTC). For window metrics this is the last day of the window. */
  day: string;
  windowDays: number;
  /** Optional filter on the metric's dimension. */
  dimensionKey: string | null;
  limit: number;
};

export type MetricQuery = { sql: string; params: unknown[] };

export type MetricRow = {
  dimension_key: string;
  value: number;
  subject_count: number;
};

export type MetricDefinition = {
  id: string;
  /** Korean, shown in the admin console and the bot's reply. */
  title: string;
  description: string;
  unit: MetricUnit;
  dimension: MetricDimension;
  period: MetricPeriod;
  subject: MetricSubject;
  suppression: MetricSuppression;
  /** Precomputed into `daily_metrics` by the nightly rollup. */
  rollup: boolean;
  defaultWindowDays: number;
  /** One-line formula for docs and for the bot's answer footer. */
  formula: string;
  build(params: MetricParams): MetricQuery;
};

// --- definitions ----------------------------------------------------------

const ARTICLE_SCOPE = `entity_type = 'article' AND entity_key <> ''`;

export const METRIC_DEFINITIONS: readonly MetricDefinition[] = [
  {
    id: "views.total",
    title: "일일 조회수",
    description: "해당 UTC 날짜의 page_views 행 수. 재방문을 모두 포함합니다.",
    unit: "views",
    dimension: "none",
    period: "day",
    subject: "session",
    suppression: "k_anonymity",
    rollup: true,
    defaultWindowDays: 1,
    formula: "COUNT(*) FROM page_views WHERE day = :day",
    build: ({ day }) => ({
      sql: `SELECT '' AS dimension_key,
                   COUNT(*) AS value,
                   COUNT(DISTINCT session_hash) AS subject_count
              FROM page_views
             WHERE day = ?`,
      params: [day],
    }),
  },
  {
    id: "views.unique_sessions",
    title: "일일 순 세션",
    description:
      "해당 날짜의 서로 다른 session_hash 개수. TELEMETRY_SALT가 없으면 조회수와 같아집니다.",
    unit: "sessions",
    dimension: "none",
    period: "day",
    subject: "session",
    suppression: "k_anonymity",
    rollup: true,
    defaultWindowDays: 1,
    formula: "COUNT(DISTINCT session_hash) FROM page_views WHERE day = :day",
    build: ({ day }) => ({
      sql: `SELECT '' AS dimension_key,
                   COUNT(DISTINCT session_hash) AS value,
                   COUNT(DISTINCT session_hash) AS subject_count
              FROM page_views
             WHERE day = ?`,
      params: [day],
    }),
  },
  {
    id: "views.by_article",
    title: "문서별 일일 조회수",
    description: "해당 날짜의 문서 슬러그별 조회수. 상위 limit개만 반환합니다.",
    unit: "views",
    dimension: "article",
    period: "day",
    subject: "session",
    suppression: "k_anonymity",
    rollup: true,
    defaultWindowDays: 1,
    formula:
      "COUNT(*) GROUP BY entity_key FROM page_views WHERE day = :day AND entity_type = 'article'",
    build: ({ day, dimensionKey, limit }) => {
      const params: unknown[] = [day];
      let filter = "";
      if (dimensionKey) {
        filter = " AND entity_key = ?";
        params.push(dimensionKey);
      }
      params.push(limit);
      return {
        sql: `SELECT entity_key AS dimension_key,
                     COUNT(*) AS value,
                     COUNT(DISTINCT session_hash) AS subject_count
                FROM page_views
               WHERE day = ? AND ${ARTICLE_SCOPE}${filter}
               GROUP BY entity_key
               ORDER BY value DESC, dimension_key ASC
               LIMIT ?`,
        params,
      };
    },
  },
  {
    id: "articles.top_read",
    title: "가장 많이 읽힌 문서",
    description:
      "기준일을 마지막 날로 하는 window일 구간의 문서별 누적 조회수 순위입니다.",
    unit: "views",
    dimension: "article",
    period: "window",
    subject: "session",
    suppression: "k_anonymity",
    rollup: false,
    defaultWindowDays: 7,
    formula:
      "COUNT(*) GROUP BY entity_key FROM page_views WHERE day BETWEEN :from AND :day ORDER BY value DESC",
    build: ({ day, windowDays, dimensionKey, limit }) => {
      const from = shiftDay(day, -(windowDays - 1));
      const params: unknown[] = [from, day];
      let filter = "";
      if (dimensionKey) {
        filter = " AND entity_key = ?";
        params.push(dimensionKey);
      }
      params.push(limit);
      return {
        sql: `SELECT entity_key AS dimension_key,
                     COUNT(*) AS value,
                     COUNT(DISTINCT session_hash) AS subject_count
                FROM page_views
               WHERE day >= ? AND day <= ? AND ${ARTICLE_SCOPE}${filter}
               GROUP BY entity_key
               ORDER BY value DESC, subject_count DESC, dimension_key ASC
               LIMIT ?`,
        params,
      };
    },
  },
  {
    id: "trending.now",
    title: "지금 뜨는 문서",
    description:
      "오늘의 조회 속도를 직전 7일 평균과 비교한 비율입니다. 누적 합계가 아니므로 꾸준히 인기 있는 문서는 올라오지 않습니다.",
    unit: "ratio",
    dimension: "article",
    period: "day",
    subject: "session",
    suppression: "k_anonymity",
    rollup: false,
    defaultWindowDays: TRENDING_BASELINE_DAYS,
    formula: TRENDING_FORMULA,
    build: ({ day, dimensionKey, limit }) => {
      const baselineFrom = shiftDay(day, -TRENDING_BASELINE_DAYS);
      // Parameter order follows the SQL text: today subquery, then baseline
      // subquery, then the gates, then the limit. D1 binds positionally.
      const params: unknown[] = [day];
      let todayFilter = "";
      let baseFilter = "";
      if (dimensionKey) {
        todayFilter = " AND entity_key = ?";
        params.push(dimensionKey);
      }
      params.push(baselineFrom, day);
      if (dimensionKey) {
        baseFilter = " AND entity_key = ?";
        params.push(dimensionKey);
      }
      params.push(
        TRENDING_MIN_VIEWS,
        TRENDING_MIN_SESSIONS,
        TRENDING_MIN_RATIO,
        limit,
      );
      const score = `(today.views + ${TRENDING_SMOOTHING}.0) / ((COALESCE(base.views, 0) / ${TRENDING_BASELINE_DAYS}.0) + ${TRENDING_SMOOTHING}.0)`;
      return {
        sql: `SELECT today.entity_key AS dimension_key,
                     ROUND(${score}, 4) AS value,
                     today.sessions AS subject_count
                FROM (SELECT entity_key,
                             COUNT(*) AS views,
                             COUNT(DISTINCT session_hash) AS sessions
                        FROM page_views
                       WHERE day = ? AND ${ARTICLE_SCOPE}${todayFilter}
                       GROUP BY entity_key) AS today
                LEFT JOIN (SELECT entity_key, COUNT(*) AS views
                             FROM page_views
                            WHERE day >= ? AND day < ? AND ${ARTICLE_SCOPE}${baseFilter}
                            GROUP BY entity_key) AS base
                  ON base.entity_key = today.entity_key
               WHERE today.views >= ? AND today.sessions >= ? AND ${score} >= ?
               ORDER BY value DESC, today.views DESC, dimension_key ASC
               LIMIT ?`,
        params,
      };
    },
  },
  {
    id: "resolve.top_misses",
    title: "정규화 실패 상위 질의",
    description:
      "window일 안에 다시 관측된 resolve 미스입니다. 콘텐츠 공백 목록의 원천이며 사람의 검색어가 아니라 앱이 정규화하려 한 문자열입니다.",
    unit: "misses",
    dimension: "resolve_query",
    period: "window",
    subject: "request",
    suppression: "k_anonymity",
    rollup: false,
    defaultWindowDays: 30,
    formula:
      "hit_count FROM resolve_misses WHERE last_seen_at >= :from ORDER BY hit_count DESC",
    build: ({ day, windowDays, dimensionKey, limit }) => {
      const from = shiftDay(day, -(windowDays - 1));
      const params: unknown[] = [from];
      let filter = "";
      if (dimensionKey) {
        // For this metric the dimension filter selects an entity type.
        filter = " AND entity_type = ?";
        params.push(dimensionKey);
      }
      params.push(limit);
      return {
        sql: `SELECT entity_type || ':' || normalized_query AS dimension_key,
                     hit_count AS value,
                     hit_count AS subject_count
                FROM resolve_misses
               WHERE last_seen_at >= ?${filter}
               ORDER BY hit_count DESC, last_seen_at DESC
               LIMIT ?`,
        params,
      };
    },
  },
  {
    id: "requests.open_count",
    title: "미처리 글 요청 수",
    description:
      "published·declined·duplicate가 아닌 content_requests 행 수입니다. 큐가 비어 있으면 0입니다.",
    unit: "requests",
    dimension: "none",
    period: "snapshot",
    subject: "none",
    // Operational metadata submitted by client apps. There is no human subject
    // behind a row, so the k-anonymity floor would only hide a small backlog.
    suppression: "exempt",
    rollup: false,
    defaultWindowDays: 1,
    formula:
      "COUNT(*) FROM content_requests WHERE status NOT IN ('published','declined','duplicate')",
    build: () => ({
      sql: `SELECT '' AS dimension_key,
                   COUNT(*) AS value,
                   COUNT(*) AS subject_count
              FROM content_requests
             WHERE status NOT IN ('published', 'declined', 'duplicate')`,
      params: [],
    }),
  },
];

const BY_ID = new Map(METRIC_DEFINITIONS.map((metric) => [metric.id, metric]));

export const METRIC_IDS: readonly string[] = METRIC_DEFINITIONS.map(
  (metric) => metric.id,
);

export function getMetric(id: string): MetricDefinition | null {
  return BY_ID.get(id) ?? null;
}

export function rollupMetrics(): MetricDefinition[] {
  return METRIC_DEFINITIONS.filter((metric) => metric.rollup);
}

/** Catalogue summary for API discovery and the bot's help output. */
export function describeMetric(metric: MetricDefinition) {
  return {
    id: metric.id,
    title: metric.title,
    description: metric.description,
    unit: metric.unit,
    dimension: metric.dimension,
    period: metric.period,
    subject: metric.subject,
    suppression: metric.suppression,
    source: metric.rollup ? "rollup" : "live",
    formula: metric.formula,
  };
}

// --- parameters -----------------------------------------------------------

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const MAX_WINDOW_DAYS = 90;

export type RawMetricParams = {
  day?: string | null;
  window?: string | null;
  dimension?: string | null;
  limit?: string | null;
};

export type ParamsResult =
  | { ok: true; params: MetricParams }
  | { ok: false; detail: string };

export function resolveMetricParams(
  metric: MetricDefinition,
  raw: RawMetricParams,
): ParamsResult {
  const day = (raw.day ?? utcDay()).trim();
  if (!isDay(day)) {
    return { ok: false, detail: "`day` must be a UTC date in YYYY-MM-DD form." };
  }

  let windowDays = metric.defaultWindowDays;
  if (raw.window !== undefined && raw.window !== null && raw.window !== "") {
    if (metric.period !== "window") {
      return {
        ok: false,
        detail: `\`${metric.id}\` is a ${metric.period} metric; \`window\` does not apply.`,
      };
    }
    const parsed = Number(raw.window);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_WINDOW_DAYS) {
      return {
        ok: false,
        detail: `\`window\` must be an integer between 1 and ${MAX_WINDOW_DAYS}.`,
      };
    }
    windowDays = parsed;
  }

  const dimensionRaw = (raw.dimension ?? "").trim();
  if (dimensionRaw && metric.dimension === "none") {
    return {
      ok: false,
      detail: `\`${metric.id}\` has no dimension; \`dimension\` does not apply.`,
    };
  }
  if (dimensionRaw.length > 160) {
    return { ok: false, detail: "`dimension` must be at most 160 characters." };
  }

  let limit = DEFAULT_LIMIT;
  if (raw.limit !== undefined && raw.limit !== null && raw.limit !== "") {
    const parsed = Number(raw.limit);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return { ok: false, detail: "`limit` must be a positive integer." };
    }
    limit = Math.min(parsed, MAX_LIMIT);
  }

  return {
    ok: true,
    params: { day, windowDays, dimensionKey: dimensionRaw || null, limit },
  };
}

// --- suppression ----------------------------------------------------------

export type SuppressionResult<T> = {
  rows: T[];
  /** Rows withheld. Reported to the consumer so absent != zero. */
  suppressed: number;
};

/**
 * Drops rows whose distinct-subject count is below K_ANONYMITY_FLOOR.
 *
 * Drops rather than masks: a masked row still discloses that the dimension
 * exists and had 1-4 readers, which is most of what we are hiding. The count of
 * dropped rows is returned so the caller can say "withheld", not "zero".
 */
export function suppressSmall<T extends Record<string, unknown>>(
  rows: readonly T[],
  subjectCountKey: keyof T & string,
): SuppressionResult<T> {
  const kept: T[] = [];
  let suppressed = 0;
  for (const row of rows) {
    const count = Number(row[subjectCountKey] ?? 0);
    if (!Number.isFinite(count) || count < K_ANONYMITY_FLOOR) {
      suppressed += 1;
      continue;
    }
    kept.push(row);
  }
  return { rows: kept, suppressed };
}

/**
 * The single place a metric's suppression policy is applied. Every surface
 * outside the admin console must go through this, not through raw rows.
 */
export function applySuppression(
  metric: MetricDefinition,
  rows: readonly MetricRow[],
): SuppressionResult<MetricRow> {
  if (metric.suppression === "exempt") return { rows: [...rows], suppressed: 0 };
  // "no traffic at all" discloses nothing about anybody, so it is reported as a
  // zero instead of being withheld — otherwise a quiet day looks like an outage.
  const empty = new Set(rows.filter(isEmptyAggregate));
  const result = suppressSmall(
    rows.filter((row) => !empty.has(row)),
    "subject_count",
  );
  const kept = new Set(result.rows);
  return {
    rows: rows.filter((row) => empty.has(row) || kept.has(row)),
    suppressed: result.suppressed,
  };
}

function isEmptyAggregate(row: MetricRow): boolean {
  return Number(row.value) === 0 && Number(row.subject_count) === 0;
}
