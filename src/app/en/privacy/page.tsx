import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Bean Wiki does and does not handle.",
  alternates: {
    canonical: "/en/privacy",
    languages: { ko: "/privacy", en: "/en/privacy" },
  },
  openGraph: {
    title: "Privacy",
    description: "What Bean Wiki does and does not handle.",
    url: "/en/privacy",
    locale: "en_US",
  },
};

export default function EnPrivacyPage() {
  return (
    <main className="article-page" lang="en">
      <header className="article-header shell">
        <Link href="/en" className="brand" aria-label="Bean Wiki home">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/en" className="back-link">
            ← Home
          </Link>
          <HeaderSearchButton locale="en" />
          <LanguageSwitcher locale="en" href="/privacy" />
          <ThemeToggle />
          <MobileNav locale="en" />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="breadcrumbs">
          <Link href="/en">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Privacy</span>
        </div>

        <div className="section-heading">
          <div>
            <span className="section-index">PRIVACY</span>
            <h2>Privacy</h2>
          </div>
          <p>What Bean Wiki does, and does not, handle.</p>
        </div>

        <div className="policy">
          <h3>What we don&rsquo;t collect</h3>
          <p>
            Bean Wiki is a static website. There are no accounts or logins, and
            no server feature that collects personal information such as your
            name or email.
          </p>

          <h3>What&rsquo;s stored in your browser</h3>
          <p>
            The following is stored only in your browser (localStorage) for
            convenience and is never sent to a server. Clearing your browser
            data removes it.
          </p>
          <ul>
            <li>Theme preference (light/dark) — to remember your choice on return</li>
            <li>Recent searches — to help you find things again quickly</li>
          </ul>

          <h3>Analytics</h3>
          <p>
            We currently use no user-tracking or analytics tools. If we add any,
            we will update this page and state what data is handled.
          </p>

          <h3>Hosting and access logs</h3>
          <p>
            The site is hosted on Vercel. The host may keep standard access logs
            (e.g., IP address, request time) to provide the service; this is not
            information Bean Wiki itself collects or retains.
          </p>

          <h3>Contact</h3>
          <p>
            For questions or correction requests, please open an issue on the{" "}
            <a
              href="https://github.com/ycpiglet/bean-wiki/issues"
              target="_blank"
              rel="noreferrer"
            >
              GitHub repository
            </a>
            .
          </p>
        </div>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · an open, community-built coffee encyclopedia</p>
        <a
          href="https://github.com/ycpiglet/bean-wiki"
          target="_blank"
          rel="noreferrer"
        >
          Contribute to this wiki ↗
        </a>
      </footer>
    </main>
  );
}
