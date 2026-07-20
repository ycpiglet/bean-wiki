import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleBrowser } from "@/components/article-browser";
import { ThemeToggle } from "@/components/theme-toggle";
import { articles, categories, levels } from "@/lib/content";

export const metadata: Metadata = {
  title: "모든 문서",
  description:
    "Bean Wiki의 모든 커피 문서를 분야와 난이도로 탐색하세요.",
};

function BeanLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48">
      <path d="M34.7 7.7C27.6 3.6 17 7.4 11.2 16.3 5.4 25.2 6.8 36 14 40.5c7.2 4.5 17.7.9 23.6-8 5.8-8.9 4.3-20.5-2.9-24.8Z" />
      <path d="M34.5 8.4c-2.3 7.9-8.7 9.2-13 14.6-4.1 5.2-4.9 10.3-4.2 16.2" />
    </svg>
  );
}

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
          <span className="bean-mark bean-mark-small">
            <BeanLogo />
          </span>
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/" className="back-link">
            ← 홈으로
          </Link>
          <ThemeToggle />
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
