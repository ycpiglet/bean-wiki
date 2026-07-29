"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

type NavItem = {
  href: string;
  label: string;
  matches: string[];
};

const koreanItems: NavItem[] = [
  { href: "/", label: "홈", matches: ["/"] },
  {
    href: "/wiki",
    label: "문서",
    matches: ["/wiki", "/topics", "/tags", "/glossary", "/edit"],
  },
  { href: "/resources", label: "자료실", matches: ["/resources"] },
  {
    href: "/learning-path",
    label: "학습",
    matches: ["/learning-path"],
  },
  { href: "/quiz", label: "퀴즈", matches: ["/quiz"] },
  {
    href: "/community",
    label: "커뮤니티",
    matches: ["/community", "/suggestions", "/contact"],
  },
  {
    href: "/design/colors",
    label: "브랜드 컬러",
    matches: ["/design/colors"],
  },
];

const englishItems: NavItem[] = [
  { href: "/en", label: "Home", matches: ["/en"] },
  {
    href: "/en/wiki",
    label: "Articles",
    matches: ["/en/wiki", "/en/topics"],
  },
  {
    href: "/en/glossary",
    label: "Glossary",
    matches: ["/en/glossary"],
  },
  {
    href: "/design/colors",
    label: "Brand colors",
    matches: ["/design/colors"],
  },
];

function isCurrentPath(pathname: string, item: NavItem) {
  return item.matches.some((match) => {
    if (match === "/" || match === "/en") return pathname === match;
    return pathname === match || pathname.startsWith(`${match}/`);
  });
}

export function PrimaryNav({ locale = "ko" }: { locale?: Locale }) {
  const pathname = usePathname() || (locale === "en" ? "/en" : "/");
  const items = locale === "en" ? englishItems : koreanItems;

  return (
    <nav
      className="primary-nav"
      aria-label={locale === "en" ? "Primary navigation" : "주 메뉴"}
    >
      {items.map((item) => {
        const active = isCurrentPath(pathname, item);
        return (
          <Link
            href={item.href}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
