"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories, categoryLabel } from "@/lib/content";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

// Hamburger + slide-down drawer. Only shown at <=980px (CSS), where the desktop
// header nav is hidden — without this, inner pages had no way to reach
// /wiki or /glossary on mobile.
export function MobileNav({ locale = "ko" }: { locale?: Locale }) {
  const t = getDictionary(locale).mobileNav;
  const prefix = locale === "en" ? "/en" : "";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Close on Escape (keyboard users have no other way out of the open drawer).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        aria-label={open ? t.close : t.open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div id="mobile-drawer" className="mobile-drawer">
          <nav aria-label={t.ariaLabel}>
            <Link href={locale === "en" ? "/en" : "/"} onClick={close}>
              {t.home}
            </Link>
            <Link href={`${prefix}/wiki`} onClick={close}>
              {t.allDocs}
            </Link>
            <Link href={`${prefix}/glossary`} onClick={close}>
              {t.glossary}
            </Link>
            <span className="mobile-drawer-label">{t.topics}</span>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`${prefix}/topics/${category.slug}`}
                onClick={close}
              >
                {categoryLabel(category.name, locale)}
              </Link>
            ))}
            <Link href={`${prefix}/privacy`} onClick={close}>
              {t.privacy}
            </Link>
            <a
              href="https://github.com/ycpiglet/bean-wiki"
              target="_blank"
              rel="noreferrer"
              onClick={close}
            >
              {t.contribute}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
