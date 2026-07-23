import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HtmlLangSync } from "@/components/html-lang-sync";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { SearchOverlay } from "@/components/search-overlay";
import { getSearchIndex } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    description: "씨앗에서 한 잔까지, 모든 커피 지식을 한곳에서.",
    locale: "ko_KR",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
