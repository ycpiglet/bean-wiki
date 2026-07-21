"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// The root layout renders <html lang="ko"> for SSR (Korean is the default site
// language). This keeps the document root's lang attribute in sync with the
// active route so assistive tech reads /en pages as English — including across
// client-side navigations. (Full SSR-correct lang would require [lang] routing;
// see docs/I18N.md.)
export function HtmlLangSync() {
  const pathname = usePathname();
  useEffect(() => {
    const isEn = pathname === "/en" || pathname?.startsWith("/en/");
    document.documentElement.lang = isEn ? "en" : "ko";
  }, [pathname]);
  return null;
}
