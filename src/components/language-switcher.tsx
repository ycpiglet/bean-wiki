import Link from "next/link";
import type { Locale } from "@/i18n/config";

// Links to the current page's counterpart in the other locale. The page passes
// the exact counterpart href, so we never link to a non-existent translation.
export function LanguageSwitcher({
  locale,
  href,
}: {
  locale: Locale;
  href: string;
}) {
  const isEn = locale === "en";
  return (
    <Link
      className="lang-switcher"
      href={href}
      hrefLang={isEn ? "ko" : "en"}
      aria-label={isEn ? "한국어로 보기" : "View in English"}
    >
      {isEn ? "한국어" : "EN"}
    </Link>
  );
}
