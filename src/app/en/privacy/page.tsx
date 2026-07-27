import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { AccountMenu } from "@/components/account-menu";
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
          <AccountMenu locale="en" />
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
          <h3>Public reading and optional accounts</h3>
          <p>
            All articles are public and require no sign-in. A ChatGPT account is
            required only to sync XP, rate or comment on articles, submit topic
            ideas, and write community posts.
          </p>

          <h3>What is stored with an account</h3>
          <p>
            For signed-in features, Bean Wiki stores your email address,
            display name, XP activity, ratings, comments, suggestions, and
            community posts. Your email identifies the account and prevents
            duplicate XP awards; public views show only your display name.
          </p>

          <h3>What&rsquo;s stored in your browser</h3>
          <p>
            The following is stored in your browser (localStorage) for
            convenience. Clearing browser data removes these local records.
          </p>
          <ul>
            <li>Theme preference (light/dark) — to remember your choice on return</li>
            <li>Recent searches — to help you find things again quickly</li>
            <li>Anonymous learning progress — XP, quiz answers, and article views</li>
            <li>Contact form drafts and local receipt numbers</li>
          </ul>
          <p>
            When signed in, eligible XP activity is also synced to your account.
            The contact form remains a local preview and is not automatically
            sent to the editors.
          </p>

          <h3>Analytics</h3>
          <p>
            We currently use no user-tracking or analytics tools. If we add any,
            we will update this page and state what data is handled.
          </p>

          <h3>Hosting and access logs</h3>
          <p>
            The site is hosted with OpenAI Sites and Cloudflare-based services.
            Hosting providers may process standard access logs (such as IP
            address and request time) to operate and secure the service.
          </p>

          <h3>Contact</h3>
          <p>
            Topic and feature ideas can be submitted through the Korean{" "}
            <Link href="/suggestions">suggestions page</Link>. For correction
            requests that must reach the editors, please open an issue on the{" "}
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
