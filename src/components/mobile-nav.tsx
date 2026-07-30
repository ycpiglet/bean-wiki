"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories } from "@/content/categories";
import { categoriesEn } from "@/content/categories.en";
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
  const categoryName = (slug: string, fallback: string) =>
    locale === "en" ? categoriesEn[slug]?.name ?? fallback : fallback;

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
            {locale === "ko" && (
              <>
                <Link href="/quiz" onClick={close}>{t.quiz}</Link>
                <Link href="/analytics" onClick={close}>통계</Link>
                <Link href="/discover" onClick={close}>커피 추천</Link>
                <Link href="/learning-path" onClick={close}>초보자 학습 경로</Link>
                <Link href="/design/colors" onClick={close}>
                  브랜드 컬러
                </Link>
                <Link href="/resources" onClick={close}>{t.resources}</Link>
                <Link href="/roadmap" onClick={close}>{t.roadmap}</Link>
                <Link href="/community" onClick={close}>{t.community}</Link>
                <Link href="/suggestions" onClick={close}>질문과 제안</Link>
                <Link href="/account" onClick={close}>내 계정</Link>
                <Link href="/contact" onClick={close}>{t.contact}</Link>
              </>
            )}
            {locale === "en" && (
              <>
                <Link href="/analytics" onClick={close}>Analytics</Link>
                <Link href="/design/colors" onClick={close}>
                  Brand colors
                </Link>
              </>
            )}
            <span className="mobile-drawer-label">{t.topics}</span>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`${prefix}/topics/${category.slug}`}
                onClick={close}
              >
                {categoryName(category.slug, category.name)}
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
