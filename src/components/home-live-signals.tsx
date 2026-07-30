"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteNotice } from "@/content/site-notices";
import type { LiveSignals } from "@/lib/live-signals-types";

type LiveResponse = LiveSignals & { notices: SiteNotice[] };
type Period = "day" | "week" | "month";

const PERIODS: { id: Period; label: string }[] = [
  { id: "day", label: "일간" },
  { id: "week", label: "주간" },
  { id: "month", label: "월간" },
];

export function HomeLiveSignals({ articleCount }: { articleCount: number }) {
  const [data, setData] = useState<LiveResponse | null>(null);
  const [period, setPeriod] = useState<Period>("day");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/analytics/live", {
        signal,
        cache: "no-store",
      });
      if (response.ok) setData((await response.json()) as LiveResponse);
    } catch {
      // Preserve the last successful snapshot through a transient failure.
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => void load(controller.signal));
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const popular = data?.popular[period] ?? [];
  const maxTrend = useMemo(
    () => Math.max(1, ...(data?.trend.map((item) => item.views) ?? [])),
    [data?.trend],
  );

  return (
    <section className="home-live shell" aria-labelledby="home-live-title">
      <header className="home-live-heading">
        <div>
          <span className="live-indicator">
            <i aria-hidden="true" />
            LIVE · 60 SEC
          </span>
          <h2 id="home-live-title">지금 Bean Wiki에서는</h2>
          <p>읽기와 참여 흐름을 60초마다 새로 확인합니다.</p>
        </div>
        <Link href="/analytics">전체 통계와 수집 기준 보기 →</Link>
      </header>

      {!data?.available && (
        <p className="home-live-notice" role="status">
          방문 데이터가 안전하게 집계되는 중입니다. 공개 기준인 익명 독자
          5명에 도달한 항목부터 표시됩니다.
        </p>
      )}

      <div className="home-live-kpis" aria-label="현재 사이트 지표">
        <LiveKpi
          value={data?.today.visitors}
          label="오늘의 독자"
          detail="일 단위 익명 세션"
          active
          protectedMetric
        />
        <LiveKpi
          value={data?.retained.dailyVisitors}
          label="누적 일별 방문"
          detail={`최근 ${data?.retained.days ?? 90}일 합계`}
          protectedMetric
        />
        <LiveKpi
          value={data?.today.views}
          label="오늘의 조회"
          detail="새로 읽힌 페이지"
          protectedMetric
        />
        <LiveKpi
          value={data?.articleCount ?? articleCount}
          label="공개 문서"
          detail="현재 읽을 수 있는 글"
        />
      </div>

      <div className="home-live-grid">
        <section className="home-signal-card home-pulse-card">
          <header>
            <div>
              <span>7 DAY PULSE</span>
              <h3>일주일 읽기 추이</h3>
            </div>
            <small>{refreshing ? "갱신 중…" : formatUpdatedAt(data?.generatedAt)}</small>
          </header>
          {data?.trend.length ? (
            <div className="home-pulse-bars" aria-label="최근 7일 조회 추이">
              {data.trend.map((item) => (
                <div key={item.day}>
                  <span
                    style={{
                      height: `${Math.max(8, (item.views / maxTrend) * 100)}%`,
                    }}
                    title={`${item.day} · 조회 ${item.views} · 독자 ${item.visitors}`}
                  />
                  <strong>{item.views}</strong>
                  <small>{item.day.slice(5).replace("-", ".")}</small>
                </div>
              ))}
            </div>
          ) : (
            <SignalEmpty>공개 가능한 추이 표본을 모으고 있습니다.</SignalEmpty>
          )}
        </section>

        <section className="home-signal-card">
          <header className="home-ranking-head">
            <div>
              <span>MOST READ</span>
              <h3>많이 읽는 문서</h3>
            </div>
            <div className="home-period-tabs" role="tablist" aria-label="인기 문서 기간">
              {PERIODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={period === item.id}
                  className={period === item.id ? "is-active" : undefined}
                  onClick={() => setPeriod(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>
          {popular.length ? (
            <ol className="home-live-ranking">
              {popular.map((item, index) => (
                <li key={item.slug}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <Link href={`/wiki/${item.slug}`}>{item.title}</Link>
                  <span>{item.views.toLocaleString("ko-KR")}회</span>
                </li>
              ))}
            </ol>
          ) : (
            <SignalEmpty>이 기간의 공개 가능한 순위를 집계 중입니다.</SignalEmpty>
          )}
        </section>

        <section className="home-signal-card">
          <header>
            <div>
              <span>RISING NOW</span>
              <h3>인기 급상승</h3>
            </div>
            <small>오늘 ÷ 직전 7일 평균</small>
          </header>
          {data?.trending.length ? (
            <ol className="home-live-ranking is-rising">
              {data.trending.map((item, index) => (
                <li key={item.slug}>
                  <b>↗{index + 1}</b>
                  <Link href={`/wiki/${item.slug}`}>{item.title}</Link>
                  <span>{item.ratio.toFixed(1)}×</span>
                </li>
              ))}
            </ol>
          ) : (
            <SignalEmpty>평소보다 빠르게 읽히는 문서를 감지하고 있습니다.</SignalEmpty>
          )}
        </section>

        <section className="home-signal-card">
          <header>
            <div>
              <span>NOTICE BOARD</span>
              <h3>공지사항</h3>
            </div>
            <Link href="/community">게시판 →</Link>
          </header>
          <ol className="home-notice-list">
            {(data?.notices ?? []).map((notice) => (
              <li key={notice.id}>
                <div>
                  <span>{notice.label}</span>
                  <time>{notice.date.slice(5)}</time>
                </div>
                <Link href={notice.href}>{notice.title}</Link>
              </li>
            ))}
          </ol>
          {!data?.notices.length && (
            <SignalEmpty>공지 목록을 불러오고 있습니다.</SignalEmpty>
          )}
        </section>
      </div>
    </section>
  );
}

function LiveKpi({
  value,
  label,
  detail,
  active = false,
  protectedMetric = false,
}: {
  value?: number;
  label: string;
  detail: string;
  active?: boolean;
  protectedMetric?: boolean;
}) {
  const displayValue =
    value === undefined
      ? "—"
      : protectedMetric && value === 0
        ? "집계 중"
        : value.toLocaleString("ko-KR");
  return (
    <article>
      <div>
        {active && <i aria-hidden="true" />}
        <strong>{displayValue}</strong>
      </div>
      <span>{label}</span>
      <small>{detail}</small>
    </article>
  );
}

function SignalEmpty({ children }: { children: React.ReactNode }) {
  return <p className="home-signal-empty">{children}</p>;
}

function formatUpdatedAt(value?: string) {
  if (!value || value.startsWith("1970-")) return "집계 대기";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "최근 갱신";
  return `${new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)} 갱신`;
}
