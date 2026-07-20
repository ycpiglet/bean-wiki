"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

type SearchItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  haystack: string;
};

const STORAGE_KEY = "bean-wiki:recent-searches";
const MAX_RECENT = 6;

function highlight(text: string, queryLower: string): ReactNode {
  if (!queryLower) return text;
  const lower = text.toLocaleLowerCase("ko");
  const index = lower.indexOf(queryLower);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="search-mark">
        {text.slice(index, index + queryLower.length)}
      </mark>
      {text.slice(index + queryLower.length)}
    </>
  );
}

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

export function Search({ articles }: { articles: SearchItem[] }) {
  const [query, setQuery] = useState("");
  // Seed recent searches from localStorage lazily. On the server this returns []
  // (matching SSR); the recent panel is gated behind `focused`, which is false on
  // first render, so there is no hydration mismatch.
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [focused, setFocused] = useState(false);
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

  function commitRecent(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const lower = trimmed.toLocaleLowerCase("ko");
    setRecent((prev) => {
      const next = [
        trimmed,
        ...prev.filter((item) => item.toLocaleLowerCase("ko") !== lower),
      ].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore write failures
      }
      return next;
    });
  }

  function clearRecent() {
    setRecent([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const normalized = query.trim().toLocaleLowerCase("ko");
  const results = normalized
    ? articles
        .filter((article) => article.haystack.includes(normalized))
        .slice(0, 4)
    : [];

  const showRecent = focused && !query.trim() && recent.length > 0;

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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
                onClick={() => commitRecent(query)}
              >
                <span>{article.category}</span>
                <strong>{highlight(article.title, normalized)}</strong>
                <p>{highlight(article.summary, normalized)}</p>
              </Link>
            ))
          ) : (
            <div className="search-empty">
              아직 해당 주제의 문서가 없습니다. 첫 문서의 작성자가 되어보세요.
            </div>
          )}
        </div>
      )}

      {showRecent && (
        <div
          className="search-results"
          onMouseDown={(event) => event.preventDefault()}
        >
          <div className="search-recent">
            <div className="search-recent-head">
              <span>최근 검색</span>
              <button
                type="button"
                className="search-recent-clear"
                onClick={clearRecent}
              >
                전체 지우기
              </button>
            </div>
            <div className="search-recent-chips">
              {recent.map((chip) => (
                <button
                  type="button"
                  className="search-recent-chip"
                  key={chip}
                  onClick={() => {
                    setQuery(chip);
                    inputRef.current?.focus();
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
