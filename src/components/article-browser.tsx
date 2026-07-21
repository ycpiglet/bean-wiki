"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categoryLabel } from "@/lib/content";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

type BrowseArticle = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  level: string;
  readingTime: string;
  accent: string;
};

type BrowseCategory = {
  slug: string;
  name: string;
};

export function ArticleBrowser({
  articles,
  categories,
  levels,
  locale = "ko",
}: {
  articles: BrowseArticle[];
  categories: BrowseCategory[];
  levels: string[];
  locale?: Locale;
}) {
  const t = getDictionary(locale).browse;
  const levelLabels = getDictionary(locale).levels;
  const prefix = locale === "en" ? "/en" : "";
  const searchParams = useSearchParams();

  // Seed filters from the URL once (e.g. /wiki?cat=brewing&level=입문);
  // afterwards the chips control the state locally. Values stay canonical
  // (Korean category name / level); only the labels are localized.
  const [category, setCategory] = useState(() => {
    const catSlug = searchParams.get("cat");
    const matched = categories.find((item) => item.slug === catSlug);
    return matched ? matched.name : "all";
  });
  const [level, setLevel] = useState(() => {
    const levelParam = searchParams.get("level");
    return levelParam && levels.includes(levelParam) ? levelParam : "all";
  });

  const results = useMemo(() => {
    return articles.filter((article) => {
      const categoryOk = category === "all" || article.category === category;
      const levelOk = level === "all" || article.level === level;
      return categoryOk && levelOk;
    });
  }, [articles, category, level]);

  return (
    <div className="browse">
      <div className="browse-filters">
        <div className="filter-row" role="group" aria-label={t.category}>
          <span className="filter-label">{t.category}</span>
          <button
            type="button"
            className={`filter-chip${category === "all" ? " is-active" : ""}`}
            onClick={() => setCategory("all")}
          >
            {t.all}
          </button>
          {categories.map((item) => (
            <button
              type="button"
              key={item.slug}
              className={`filter-chip${category === item.name ? " is-active" : ""}`}
              onClick={() => setCategory(item.name)}
            >
              {categoryLabel(item.name, locale)}
            </button>
          ))}
        </div>

        <div className="filter-row" role="group" aria-label={t.level}>
          <span className="filter-label">{t.level}</span>
          <button
            type="button"
            className={`filter-chip${level === "all" ? " is-active" : ""}`}
            onClick={() => setLevel("all")}
          >
            {t.all}
          </button>
          {levels.map((item) => (
            <button
              type="button"
              key={item}
              className={`filter-chip${level === item ? " is-active" : ""}`}
              onClick={() => setLevel(item)}
            >
              {levelLabels[item] ?? item}
            </button>
          ))}
        </div>
      </div>

      <div className="browse-count" aria-live="polite">
        {t.count(results.length)}
      </div>

      {results.length > 0 ? (
        <div className="browse-grid">
          {results.map((article) => (
            <Link
              href={`${prefix}/wiki/${article.slug}`}
              key={article.slug}
              className="browse-card"
            >
              <div className="browse-card-top">
                <span className="article-category">
                  {categoryLabel(article.category, locale)}
                </span>
                <span className={`level-badge accent-${article.accent}`}>
                  {levelLabels[article.level] ?? article.level}
                </span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <span className="read-meta">
                {t.readingTime} {article.readingTime}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="browse-empty">{t.empty}</div>
      )}
    </div>
  );
}
