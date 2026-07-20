"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
};

export function Search({ articles }: { articles: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the search field with ⌘K (macOS) or Ctrl+K (others).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const normalized = query.trim().toLocaleLowerCase("ko");
  const results = normalized
    ? articles
        .filter((article) =>
          [article.title, article.summary, article.category]
            .join(" ")
            .toLocaleLowerCase("ko")
            .includes(normalized),
        )
        .slice(0, 4)
    : [];

  return (
    <div className="search-wrap">
      <div className="search-field">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <label className="sr-only" htmlFor="wiki-search">
          커피 지식 검색
        </label>
        <input
          id="wiki-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="추출, 그라인더, 로스팅 프로파일…"
          autoComplete="off"
        />
        <span className="search-key">⌘ K</span>
      </div>

      {query.trim() && (
        <div className="search-results" aria-live="polite">
          {results.length > 0 ? (
            results.map((article) => (
              <Link
                href={`/wiki/${article.slug}`}
                className="search-result"
                key={article.slug}
              >
                <span>{article.category}</span>
                <strong>{article.title}</strong>
                <p>{article.summary}</p>
              </Link>
            ))
          ) : (
            <div className="search-empty">
              아직 해당 주제의 문서가 없습니다. 첫 문서의 작성자가 되어보세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
