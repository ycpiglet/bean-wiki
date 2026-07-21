import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleBrowser } from "@/components/article-browser";
import { BeanMark } from "@/components/bean-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { categories, getArticles, levels } from "@/lib/content";

export const metadata: Metadata = {
  title: "All articles",
  description: "Browse every Bean Wiki coffee article by topic and level.",
  alternates: {
    canonical: "/en/wiki",
    languages: { ko: "/wiki", en: "/en/wiki" },
  },
};

export default function EnWikiIndex() {
  const browseArticles = getArticles("en").map(
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
    <main className="article-page" lang="en">
      <header className="article-header shell">
        <Link href="/en" className="brand" aria-label="Bean Wiki home">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/en" className="back-link">
            ← Home
          </Link>
          <LanguageSwitcher locale="en" href="/wiki" />
          <ThemeToggle />
          <MobileNav locale="en" />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="section-heading">
          <div>
            <span className="section-index">ALL DOCS</span>
            <h2>All articles</h2>
          </div>
          <p>Filter by topic and level to find the coffee knowledge you need.</p>
        </div>

        <Suspense fallback={<div className="browse-count">Loading…</div>}>
          <ArticleBrowser
            articles={browseArticles}
            categories={browseCategories}
            levels={[...levels]}
            locale="en"
          />
        </Suspense>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · an open, community-built coffee encyclopedia</p>
        <a
          href="https://github.com/ycpiglet/bean-wiki"
          target="_blank"
          rel="noreferrer"
        >
          Contribute to this wiki ↗
        </a>
      </footer>
    </main>
  );
}
