import type { Metadata } from "next";
import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { PrimaryNav } from "@/components/primary-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getAnalyticsDashboard,
  type AnalyticsDashboard,
  type AnalyticsPoint,
} from "@/lib/engagement-store";
import { getArticle, getPublishedArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "읽기와 참여 통계",
  description:
    "Bean Wiki의 문서 조회, 독자 참여, 시간대와 유입 경향을 개인정보를 최소화해 집계합니다.",
  alternates: { canonical: "/analytics" },
};

export const dynamic = "force-dynamic";

const EMPTY: AnalyticsDashboard = {
  available: false,
  windowDays: 14,
  generatedAt: new Date(0).toISOString(),
  totals: {
    views: 0,
    uniqueDailyReaders: 0,
    likes: 0,
    humanLikes: 0,
    agentLikes: 0,
    comments: 0,
  },
  trend: [],
  topArticles: [],
  referrers: [],
  countries: [],
  hours: [],
};

export default async function AnalyticsPage() {
  const dashboard = await getAnalyticsDashboard(14).catch(() => EMPTY);
  const articleCount = getPublishedArticles().length;
  const maxTrend = Math.max(1, ...dashboard.trend.map((point) => point.value));
  const topRows = dashboard.topArticles.map((row) => ({
    ...row,
    title: getArticle(row.slug)?.title ?? row.slug,
  }));

  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <PrimaryNav />
        <div className="header-tools">
          <Link href="/" className="back-link">← 홈으로</Link>
          <HeaderSearchButton locale="ko" />
          <ThemeToggle />
          <AccountMenu locale="ko" />
          <MobileNav />
        </div>
      </header>

      <div className="shell analytics-page">
        <header className="community-hero analytics-hero">
          <span className="eyebrow"><i aria-hidden="true" /> READING SIGNALS</span>
          <h1>숫자가 아니라,<br />지식이 움직이는 방향.</h1>
          <p>
            최근 14일의 읽기와 참여 흐름을 보여줍니다. IP와 원본 기기
            정보는 저장하지 않으며, 검증용 합성 활동은 모든 공개 수치에서
            제외합니다.
          </p>
        </header>

        {!dashboard.available && (
          <p className="analytics-notice" role="status">
            통계 저장소 연결 전입니다. 문서 수는 표시되며, 배포 환경이
            연결되면 나머지 지표가 자동으로 채워집니다.
          </p>
        )}

        <section className="analytics-kpis" aria-label="핵심 지표">
          <Kpi value={articleCount} label="공개 문서" detail="현재 읽을 수 있는 글" />
          <Kpi
            value={dashboard.totals.views}
            label="14일 조회"
            detail="새로 읽힌 페이지"
          />
          <Kpi
            value={dashboard.totals.uniqueDailyReaders}
            label="일별 독자"
            detail="날짜별 익명 세션 합계"
          />
          <Kpi
            value={dashboard.totals.likes}
            label="좋아요"
            detail={`독자 ${dashboard.totals.humanLikes} · AI ${dashboard.totals.agentLikes}`}
          />
          <Kpi
            value={dashboard.totals.comments}
            label="댓글"
            detail="삭제·QA 활동 제외"
          />
        </section>

        <section className="analytics-panel analytics-trend">
          <header>
            <div>
              <span>14 DAY PULSE</span>
              <h2>날짜별 읽기 흐름</h2>
            </div>
            <small>막대: 조회 · 점선 수치: 일별 독자</small>
          </header>
          {dashboard.trend.length ? (
            <div className="trend-bars">
              {dashboard.trend.map((point) => (
                <div key={point.key}>
                  <span
                    style={{ height: `${Math.max(3, (point.value / maxTrend) * 100)}%` }}
                    title={`${point.key}: 조회 ${point.value}, 일별 독자 ${point.secondary ?? 0}`}
                  />
                  <strong>{point.value}</strong>
                  <small>{point.key.slice(5)}</small>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart />
          )}
        </section>

        <div className="analytics-grid">
          <section className="analytics-panel">
            <header>
              <div><span>TOP ARTICLES</span><h2>가장 많이 읽은 문서</h2></div>
            </header>
            {topRows.length ? (
              <ol className="analytics-ranking">
                {topRows.map((row, index) => (
                  <li key={row.slug}>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <Link href={`/wiki/${row.slug}`}>{row.title}</Link>
                    <span>{row.views} 조회 · {row.likes} 좋아요 · {row.comments} 댓글</span>
                  </li>
                ))}
              </ol>
            ) : <EmptyChart />}
          </section>

          <MetricList
            title="어디에서 들어왔나요"
            eyebrow="REFERRER"
            rows={dashboard.referrers}
            labels={{ direct: "직접 방문", search: "검색", social: "소셜", internal: "내부 이동", other: "기타" }}
          />
          <MetricList
            title="국가별 읽기"
            eyebrow="COARSE LOCATION"
            rows={dashboard.countries}
            labels={{ KR: "대한민국", US: "미국", JP: "일본", ZZ: "확인하지 않음" }}
          />
          <MetricList
            title="언제 가장 많이 읽나요"
            eyebrow="UTC HOUR"
            rows={dashboard.hours}
            formatKey={(key) => `${key.padStart(2, "0")}:00 UTC`}
          />
        </div>

        <aside className="analytics-privacy">
          <strong>수집 기준</strong>
          <p>
            페이지 경로, 문서 식별자, 날짜, 일 단위로 회전하는 익명 세션,
            유입 분류, 2자리 국가 코드, UTC 시간 구간, 기기 분류만
            저장합니다. 원본 IP·정확한 위치·원본 User-Agent는 저장하지
            않습니다. 원시 조회 데이터는 90일 뒤 삭제합니다.
          </p>
          <Link href="/privacy">개인정보 처리 원칙 보기 →</Link>
        </aside>
      </div>
    </main>
  );
}

function Kpi({
  value,
  label,
  detail,
}: {
  value: number;
  label: string;
  detail: string;
}) {
  return (
    <article>
      <strong>{value.toLocaleString("ko-KR")}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </article>
  );
}

function MetricList({
  title,
  eyebrow,
  rows,
  labels = {},
  formatKey,
}: {
  title: string;
  eyebrow: string;
  rows: AnalyticsPoint[];
  labels?: Record<string, string>;
  formatKey?: (key: string) => string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="analytics-panel analytics-breakdown">
      <header><div><span>{eyebrow}</span><h2>{title}</h2></div></header>
      {rows.length ? (
        <ul>
          {rows.map((row) => (
            <li key={row.key}>
              <div><span>{labels[row.key] ?? formatKey?.(row.key) ?? row.key}</span><strong>{row.value}</strong></div>
              <i style={{ width: `${(row.value / max) * 100}%` }} />
            </li>
          ))}
        </ul>
      ) : <EmptyChart />}
    </section>
  );
}

function EmptyChart() {
  return <p className="analytics-empty">아직 집계된 데이터가 없습니다.</p>;
}
