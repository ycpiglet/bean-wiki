import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleBrowser } from "@/components/article-browser";
import { BeanMark } from "@/components/bean-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { articles, categories, levels } from "@/lib/content";

export const metadata: Metadata = {
  title: "모든 문서",
  description:
    "Bean Wiki의 모든 커피 문서를 분야와 난이도로 탐색하세요.",
  alternates: { canonical: "/wiki", languages: { ko: "/wiki", en: "/en/wiki" } },
};

export default function WikiIndex() {
  const browseArticles = articles.map(
    ({ slug, title, summary, category, level, readingTime, accent }) => ({
      slug,
      title,
      summary,
      category,
      level,
      readingTime,
      accent,
    }),
  );
  const browseCategories = categories.map(({ slug, name }) => ({ slug, name }));

  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/" className="back-link">
            ← 홈으로
          </Link>
          <HeaderSearchButton locale="ko" />
          <LanguageSwitcher locale="ko" href="/en/wiki" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="section-heading">
          <div>
            <span className="section-index">ALL DOCS</span>
            <h2>모든 문서</h2>
          </div>
          <p>분야와 난이도로 걸러 가며 필요한 커피 지식을 찾아보세요.</p>
        </div>

        <Suspense fallback={<div className="browse-count">문서를 불러오는 중…</div>}>
          <ArticleBrowser
            articles={browseArticles}
            categories={browseCategories}
            levels={[...levels]}
          />
        </Suspense>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · 함께 만드는 열린 커피 백과사전</p>
        <a
          href="https://github.com/ycpiglet/bean-wiki"
          target="_blank"
          rel="noreferrer"
        >
          이 위키에 기여하기 ↗
        </a>
      </footer>
    </main>
  );
}
