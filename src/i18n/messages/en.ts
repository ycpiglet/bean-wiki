import type { Dictionary } from "./ko";

// English UI strings (chrome). Mirrors the ko dictionary shape.
export const en: Dictionary = {
  brand: { home: "Bean Wiki home" },
  mobileNav: {
    open: "Open menu",
    close: "Close menu",
    ariaLabel: "Mobile menu",
    home: "Home",
    allDocs: "All articles",
    glossary: "Glossary",
    topics: "Topics",
    privacy: "Privacy",
    contribute: "Contribute ↗",
  },
  search: {
    label: "Search coffee knowledge",
    placeholder: "extraction, grinder, roast profile…",
    resultsLabel: "Search results",
    resultsCount: (n: number, fuzzy: boolean) =>
      `${n} ${fuzzy ? "approximate " : ""}result${n === 1 ? "" : "s"}`,
    noResults: "No results",
    empty: "No article on this topic yet. Be the first to write one.",
    recent: "Recent searches",
    clearRecent: "Clear all",
    approx: "approx.",
  },
  browse: {
    category: "Topic",
    level: "Level",
    all: "All",
    count: (n: number) => `${n} article${n === 1 ? "" : "s"}`,
    readingTime: "Reading time",
    empty: "No articles match yet. Try different filters, or write the first one.",
  },
  levels: { 입문: "Beginner", 중급: "Intermediate", 전문: "Advanced" },
};
