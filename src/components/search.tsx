"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SearchItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  haystack: string;
};

const STORAGE_KEY = "bean-wiki:recent-searches";
const MAX_RECENT = 6;
const MAX_RESULTS = 4;

const CHOSUNG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

// Reduce Hangul syllables to their leading consonants so "ㅊㅊ" matches "추출".
function toChosung(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += CHOSUNG[Math.floor((code - 0xac00) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

// True when the query is only Hangul consonant jamo (a 초성 query).
const CHOSUNG_ONLY = /^[ㄱ-ㅎ]+$/;

// Bounded Levenshtein distance; returns early once it exceeds `max`.
function levenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      curr[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

// Fuzzy fallback: does any whitespace token of `haystack` come within `max`
// edits of the (typo'd) query? Used only when exact/초성 search finds nothing.
function fuzzyHit(haystack: string, query: string, max: number): boolean {
  for (const token of haystack.split(/\s+/)) {
    if (!token) continue;
    if (Math.abs(token.length - query.length) > max) continue;
    if (levenshtein(token, query, max) <= max) return true;
  }
  return false;
}

// Highlight every occurrence of the query in the text (case-insensitive).
function highlight(text: string, queryLower: string): ReactNode {
  if (!queryLower) return text;
  const lower = text.toLocaleLowerCase("ko");
  const parts: ReactNode[] = [];
  let from = 0;
  let index = lower.indexOf(queryLower, from);
  if (index === -1) return text;
  let key = 0;
  while (index !== -1) {
    if (index > from) parts.push(text.slice(from, index));
    parts.push(
      <mark className="search-mark" key={key++}>
        {text.slice(index, index + queryLower.length)}
      </mark>,
    );
    from = index + queryLower.length;
    index = lower.indexOf(queryLower, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return <>{parts}</>;
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  // Seed recent searches from localStorage lazily. On the server this returns []
  // (matching SSR); the recent panel is gated behind `focused`, which is false on
  // first render, so there is no hydration mismatch.
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Precompute 초성 forms once per corpus (cheap for this dataset).
  const chosungHaystacks = useMemo(
    () => articles.map((article) => toChosung(article.haystack)),
    [articles],
  );

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
  const isChosungQuery = CHOSUNG_ONLY.test(query.trim());

  const results = useMemo(() => {
    if (!normalized) return [];
    const matched: { article: SearchItem; fuzzy: boolean }[] = [];
    for (let i = 0; i < articles.length; i += 1) {
      const hit =
        articles[i].haystack.includes(normalized) ||
        (isChosungQuery && chosungHaystacks[i].includes(normalized));
      if (hit) {
        matched.push({ article: articles[i], fuzzy: false });
        if (matched.length >= MAX_RESULTS) break;
      }
    }
    // Typo tolerance: only when nothing matched exactly, and not for 초성 queries.
    if (matched.length === 0 && !isChosungQuery && normalized.length >= 2) {
      const maxEdits = normalized.length <= 5 ? 1 : 2;
      for (let i = 0; i < articles.length; i += 1) {
        if (fuzzyHit(articles[i].haystack, normalized, maxEdits)) {
          matched.push({ article: articles[i], fuzzy: true });
          if (matched.length >= MAX_RESULTS) break;
        }
      }
    }
    return matched;
  }, [articles, chosungHaystacks, normalized, isChosungQuery]);

  const showRecent = focused && !query.trim() && recent.length > 0;

  function goTo(item: SearchItem) {
    commitRecent(query);
    router.push(`/wiki/${item.slug}`);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setQuery("");
      setActiveIndex(-1);
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      const entry = results[activeIndex] ?? results[0];
      if (entry) {
        event.preventDefault();
        goTo(entry.article);
      }
    }
  }

  const listboxOpen = Boolean(query.trim() && results.length > 0);

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
          role="combobox"
          aria-expanded={listboxOpen}
          aria-controls="search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
          }
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={onInputKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="추출, 그라인더, ㄹㅅㅌ 프로파일…"
          autoComplete="off"
        />
        <span className="search-key">⌘ K</span>
      </div>

      {query.trim() && (
        <div className="search-results">
          <span className="sr-only" role="status" aria-live="polite">
            {results.length > 0
              ? `${results.length}개의 ${results[0].fuzzy ? "유사 " : ""}검색 결과`
              : "검색 결과가 없습니다"}
          </span>
          {results.length > 0 ? (
            <div id="search-listbox" role="listbox" aria-label="검색 결과">
              {results.map(({ article, fuzzy }, index) => (
                <Link
                  href={`/wiki/${article.slug}`}
                  className="search-result"
                  id={`search-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  key={article.slug}
                  onClick={() => commitRecent(query)}
                >
                  <span>{article.category}</span>
                  <strong>
                    {fuzzy ? article.title : highlight(article.title, normalized)}
                    {fuzzy && <em className="search-approx">유사</em>}
                  </strong>
                  <p>
                    {fuzzy
                      ? article.summary
                      : highlight(article.summary, normalized)}
                  </p>
                </Link>
              ))}
            </div>
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
