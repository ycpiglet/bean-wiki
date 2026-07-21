import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeanMark } from "@/components/bean-logo";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ShareButtons } from "@/components/share-buttons";
import { ThemeToggle } from "@/components/theme-toggle";
import { categoryLabel, getArticle, getArticles } from "@/lib/content";
import { toISODate } from "@/lib/dates";
import { getDictionary } from "@/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles("en").map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(
  props: PageProps<"/en/wiki/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticle(slug, "en");
  if (!article) return {};
  const published = article.history?.length
    ? toISODate(article.history[article.history.length - 1].date)
    : toISODate(article.updatedAt);
  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: `/en/wiki/${slug}`,
      languages: { ko: `/wiki/${slug}`, en: `/en/wiki/${slug}` },
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: `/en/wiki/${slug}`,
      locale: "en_US",
      publishedTime: published,
      modifiedTime: toISODate(article.updatedAt),
    },
  };
}

export default async function EnWikiArticle(props: PageProps<"/en/wiki/[slug]">) {
  const { slug } = await props.params;
  const article = getArticle(slug, "en");
  if (!article) notFound();

  const levels = getDictionary("en").levels;
  const related = article.related
    .map((relatedSlug) => getArticle(relatedSlug, "en"))
    .filter((item) => item !== undefined);
  const history = article.history ?? [];
  const catLabel = categoryLabel(article.category, "en");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    inLanguage: "en",
    articleSection: catLabel,
    datePublished: toISODate(article.updatedAt),
    dateModified: toISODate(article.updatedAt),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/en/wiki/${slug}`,
  };

  return (
    <main className="article-page" lang="en">
      <JsonLd data={articleSchema} />
      <header className="article-header shell">
        <Link href="/en" className="brand" aria-label="Bean Wiki home">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/en" className="back-link">
            ← Browse all
          </Link>
          <LanguageSwitcher locale="en" href={`/wiki/${slug}`} />
          <ThemeToggle />
          <MobileNav locale="en" />
        </div>
      </header>

      <div className="article-shell shell">
        <aside className="article-aside">
          <span>Contents</span>
          <nav aria-label="Table of contents">
            {article.sections.map((section, index) => (
              <a href={`#${section.id}`} key={section.id}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {section.title}
              </a>
            ))}
          </nav>
          <div className="article-license">
            <span>OPEN KNOWLEDGE</span>
            <p>English translation of the Korean original — help us refine it.</p>
          </div>
        </aside>

        <article className="wiki-article">
          <div className="breadcrumbs">
            <Link href="/en">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{catLabel}</span>
          </div>

          <header className="wiki-title">
            <span className={`level-badge accent-${article.accent}`}>
              {levels[article.level] ?? article.level}
            </span>
            <h1>{article.title}</h1>
            <p>{article.summary}</p>
            <div className="article-meta">
              <span>Reading time {article.readingTime}</span>
              <span>Updated {article.updatedAt}</span>
            </div>
          </header>

          <div className={`knowledge-note accent-${article.accent}`}>
            <span>KEY POINT</span>
            <p>{article.fact}</p>
          </div>

          <div className="article-content">
            {article.sections.map((section, index) => (
              <section id={section.id} key={section.id}>
                <span className="content-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.points && (
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {history.length > 0 && (
            <section className="revision-section">
              <span>Revision history</span>
              <ol>
                {history.map((entry) => (
                  <li key={`${entry.date}-${entry.note}`}>
                    <time dateTime={toISODate(entry.date)}>{entry.date}</time>
                    <p>{entry.note}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="related-section">
            <span>Read next</span>
            <div>
              {related.map((item) => (
                <Link href={`/en/wiki/${item.slug}`} key={item.slug}>
                  <small>{categoryLabel(item.category, "en")}</small>
                  <strong>{item.title}</strong>
                  <span>→</span>
                </Link>
              ))}
            </div>
          </section>

          <ShareButtons title={article.title} path={`/en/wiki/${slug}`} />
        </article>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · an open, community-built coffee encyclopedia</p>
        <a
          href={`https://github.com/ycpiglet/bean-wiki/blob/main/src/content/articles/en/${slug}.md`}
          target="_blank"
          rel="noreferrer"
        >
          Edit this article on GitHub ↗
        </a>
      </footer>
    </main>
  );
}
