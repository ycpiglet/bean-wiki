"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories } from "@/lib/content";

// Hamburger + slide-down drawer. Only shown at <=980px (CSS), where the desktop
// header nav is hidden — without this, inner pages had no way to reach
// /wiki or /glossary on mobile.
export function MobileNav() {
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
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
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
          <nav aria-label="모바일 메뉴">
            <Link href="/" onClick={close}>
              홈
            </Link>
            <Link href="/wiki" onClick={close}>
              전체 문서
            </Link>
            <Link href="/glossary" onClick={close}>
              용어집
            </Link>
            <span className="mobile-drawer-label">분야</span>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/topics/${category.slug}`}
                onClick={close}
              >
                {category.name}
              </Link>
            ))}
            <Link href="/privacy" onClick={close}>
              개인정보 처리방침
            </Link>
            <a
              href="https://github.com/ycpiglet/bean-wiki"
              target="_blank"
              rel="noreferrer"
              onClick={close}
            >
              기여하기 ↗
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
