import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import { HtmlLangSync } from "@/components/html-lang-sync";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { SearchOverlay } from "@/components/search-overlay";
import { getSearchIndex } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import "./globals.css";

// Geist covers Latin (logo, numbers, English). It has NO Korean glyphs, so a
// Korean webfont must be loaded too — otherwise Hangul falls back to whatever
// each OS happens to have. The font stack (globals.css --font-sans) puts Geist
// first and Noto Sans KR second, so browsers pick per-glyph: Latin → Geist,
// Hangul → Noto. `preload: false` keeps the large CJK font non-blocking.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bean Wiki — 열린 커피 백과사전",
    template: "%s | Bean Wiki",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Bean Wiki — 열린 커피 백과사전",
    description: "32개 심화 문서와 120개 주제 로드맵으로 배우는 열린 커피 백과사전.",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 907,
        alt: "Bean Wiki — 32 deep articles, 120 topic roadmap, learn and level up",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bean Wiki — 열린 커피 백과사전",
    description: "읽고, 풀고, 나누며 레벨업하는 커피 지식 플랫폼",
    images: ["/og.png"],
  },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f0e7" },
    { media: "(prefers-color-scheme: dark)", color: "#14170f" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <HtmlLangSync />
        <ServiceWorkerRegister />
        <SearchOverlay
          indexes={{ ko: getSearchIndex("ko"), en: getSearchIndex("en") }}
        />
        {children}
      </body>
    </html>
  );
}
