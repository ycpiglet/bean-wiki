"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "@/components/search";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { SearchIndexItem } from "@/lib/content";

// Header buttons on any page dispatch this on window to open the palette.
export const OPEN_SEARCH_EVENT = "bean-wiki:open-search";

// Globally-mounted search palette. Mounted once in the root layout so search is
// available on every page via ⌘K / Ctrl+K or a header button. It picks the
// locale index from the current path, so the Korean and English trees share one
// mount without the server layout needing to know the active locale.
export function SearchOverlay({
  indexes,
}: {
  indexes: { ko: SearchIndexItem[]; en: SearchIndexItem[] };
}) {
  const pathname = usePathname();
  const locale: Locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ko";
  const [open, setOpen] = useState(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const t = getDictionary(locale).search;

  const close = useCallback(() => setOpen(false), []);

  // Close when navigating (e.g. after picking a result). Adjusting state during
  // render off a changed value is the React-recommended alternative to a
  // setState-in-effect on `pathname`.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Open via ⌘K / Ctrl+K anywhere, or the header button's custom event.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        restoreFocusRef.current = document.activeElement as HTMLElement;
        setOpen((prev) => !prev);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      restoreFocusRef.current = document.activeElement as HTMLElement;
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Lock body scroll and restore focus to the trigger when the palette closes.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t.label}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="search-overlay-panel">
        <Search
          key={locale}
          articles={indexes[locale]}
          locale={locale}
          manageShortcut={false}
          autoFocus
        />
        <button
          type="button"
          className="search-overlay-close"
          aria-label={locale === "en" ? "Close search" : "검색 닫기"}
          onClick={close}
        >
          Esc
        </button>
      </div>
    </div>
  );
}
