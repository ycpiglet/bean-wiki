import { NextResponse } from "next/server";
import { siteNotices } from "@/content/site-notices";
import { getPublishedArticles } from "@/lib/content";
import { getLiveSignals } from "@/lib/engagement-store";
import type { LiveSignals } from "@/lib/live-signals-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMPTY: LiveSignals = {
  available: false,
  generatedAt: new Date(0).toISOString(),
  refreshSeconds: 60,
  today: { views: 0, visitors: 0 },
  retained: { days: 90, views: 0, dailyVisitors: 0 },
  articleCount: 0,
  trend: [],
  popular: { day: [], week: [], month: [] },
  trending: [],
};

export async function GET(request: Request) {
  const publishedArticles = getPublishedArticles("ko");
  const publishedBySlug = new Map(
    publishedArticles.map((article) => [article.slug, article]),
  );
  const articleCount = publishedArticles.length;
  const signals = await getLiveSignals()
    .then((value) => ({ ...value, articleCount }))
    .catch(() => readFallbackSignals(request, articleCount));

  const titleRows = <T extends { slug: string; title: string }>(
    rows: T[],
  ): T[] => {
    const visibleRows: T[] = [];
    for (const row of rows) {
      const article = publishedBySlug.get(row.slug);
      if (article) visibleRows.push({ ...row, title: article.title });
    }
    return visibleRows;
  };

  const response = {
    ...signals,
    popular: {
      day: titleRows(signals.popular.day),
      week: titleRows(signals.popular.week),
      month: titleRows(signals.popular.month),
    },
    trending: titleRows(signals.trending),
    notices: siteNotices,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}

async function readFallbackSignals(request: Request, articleCount: number) {
  const configured = process.env.ANALYTICS_FALLBACK_ORIGIN?.trim();
  if (!configured) return { ...EMPTY, articleCount };
  try {
    const origin = new URL(configured).origin;
    if (origin === new URL(request.url).origin) return { ...EMPTY, articleCount };
    const response = await fetch(`${origin}/api/analytics/live`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!response.ok) return { ...EMPTY, articleCount };
    const fallback = (await response.json()) as LiveSignals;
    return { ...fallback, articleCount };
  } catch {
    return { ...EMPTY, articleCount };
  }
}
