"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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
}: {
  articles: BrowseArticle[];
  categories: BrowseCategory[];
  levels: string[];
}) {
  const searchParams = useSearchParams();

  // Seed filters from the URL once (e.g. /wiki?cat=brewing&level=입문);
  // afterwards the chips control the state locally.
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
        <div className="filter-row" role="group" aria-label="분야 필터">
          <span className="filter-label">분야</span>
          <button
            type="button"
            className={`filter-chip${category === "all" ? " is-active" : ""}`}
            onClick={() => setCategory("all")}
          >
            전체
          </button>
          {categories.map((item) => (
            <button
              type="button"
              key={item.slug}
              className={`filter-chip${category === item.name ? " is-active" : ""}`}
              onClick={() => setCategory(item.name)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="filter-row" role="group" aria-label="난이도 필터">
          <span className="filter-label">난이도</span>
          <button
            type="button"
            className={`filter-chip${level === "all" ? " is-active" : ""}`}
            onClick={() => setLevel("all")}
          >
            전체
          </button>
          {levels.map((item) => (
            <button
              type="button"
              key={item}
              className={`filter-chip${level === item ? " is-active" : ""}`}
              onClick={() => setLevel(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="browse-count" aria-live="polite">
        문서 {results.length}편
      </div>

      {results.length > 0 ? (
        <div className="browse-grid">
          {results.map((article) => (
            <Link
              href={`/wiki/${article.slug}`}
              key={article.slug}
              className="browse-card"
            >
              <div className="browse-card-top">
                <span className="article-category">{article.category}</span>
                <span className={`level-badge accent-${article.accent}`}>
                  {article.level}
                </span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <span className="read-meta">읽는 시간 {article.readingTime}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="browse-empty">
          조건에 맞는 문서가 아직 없습니다. 필터를 바꾸거나 첫 문서를 작성해보세요.
        </div>
      )}
    </div>
  );
}
