import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  categoryLabel,
  getArticle,
  getGlossaryTerms,
  glossaryByCategory,
} from "@/lib/content";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Common coffee terms, defined in one line and grouped by topic.",
  alternates: {
    canonical: "/en/glossary",
    languages: { ko: "/glossary", en: "/en/glossary" },
  },
};

export default function EnGlossaryPage() {
  const groups = glossaryByCategory("en");

  const termSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: `${SITE_NAME} Glossary`,
    inLanguage: "en",
    hasDefinedTerm: getGlossaryTerms("en").map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      description: term.definition,
    })),
  };

  return (
    <main className="article-page" lang="en">
      <JsonLd data={termSetSchema} />
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
          <LanguageSwitcher locale="en" href="/glossary" />
          <ThemeToggle />
          <MobileNav locale="en" />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="breadcrumbs">
          <Link href="/en">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Glossary</span>
        </div>

        <div className="section-heading">
          <div>
            <span className="section-index">GLOSSARY</span>
            <h2>Glossary</h2>
          </div>
          <p>Terms you&rsquo;ll hear around coffee, defined in one line, by topic.</p>
        </div>

        <nav className="glossary-nav" aria-label="Jump to topic">
          {groups.map((group) => (
            <a
              key={group.category.slug}
              href={`#${group.category.slug}`}
              className="filter-chip"
            >
              {categoryLabel(group.category.name, "en")}
            </a>
          ))}
        </nav>

        {groups.map((group, index) => (
          <section
            id={group.category.slug}
            key={group.category.slug}
            className="glossary-group"
          >
            <div className={`section-heading accent-${group.category.accent}`}>
              <div>
                <span className="section-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2>{categoryLabel(group.category.name, "en")}</h2>
              </div>
            </div>

            <dl className="glossary-list">
              {group.terms.map((term) => (
                <div className="glossary-term" key={term.term}>
                  <dt>
                    {term.term}
                    {term.reading && (
                      <span className="glossary-reading">{term.reading}</span>
                    )}
                  </dt>
                  <dd>
                    <p className="glossary-def">{term.definition}</p>
                    {term.related && term.related.length > 0 && (
                      <div className="glossary-related">
                        {term.related.map((slug) => {
                          const linked = getArticle(slug, "en");
                          return linked ? (
                            <Link key={slug} href={`/en/wiki/${slug}`}>
                              {linked.title} →
                            </Link>
                          ) : null;
                        })}
                      </div>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
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
