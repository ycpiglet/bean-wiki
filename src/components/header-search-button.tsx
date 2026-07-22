"use client";

import type { Locale } from "@/i18n/config";
import { OPEN_SEARCH_EVENT } from "@/components/search-overlay";

// Compact search launcher for page headers. Dispatches a window event that the
// globally-mounted <SearchOverlay> listens for, so search is reachable from
// every page without each header owning its own search state.
export function HeaderSearchButton({ locale = "ko" }: { locale?: Locale }) {
  const label = locale === "en" ? "Search" : "검색";
  return (
    <button
      type="button"
      className="header-search"
      aria-label={label}
      aria-keyshortcuts="Meta+K Control+K"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <circle cx="9" cy="9" r="5.5" />
        <path d="m13 13 4 4" />
      </svg>
      <span className="header-search-label">{label}</span>
      <span className="header-search-key" aria-hidden="true">
        ⌘K
      </span>
    </button>
  );
}
