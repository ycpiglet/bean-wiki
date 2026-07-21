import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeanMark } from "@/components/bean-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  articlesByCategory,
  categories,
  categoryDescription,
  categoryLabel,
  getCategory,
} from "@/lib/content";
import { getDictionary } from "@/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/en/topics/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: categoryLabel(category.name, "en"),
    description: categoryDescription(slug, "en"),
    alternates: {
      canonical: `/en/topics/${slug}`,
      languages: { ko: `/topics/${slug}`, en: `/en/topics/${slug}` },
    },
    openGraph: {
      title: categoryLabel(category.name, "en"),
      description: categoryDescription(slug, "en"),
      url: `/en/topics/${slug}`,
      locale: "en_US",
    },
  };
}

export default async function EnTopicPage(props: PageProps<"/en/topics/[slug]">) {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();

  const levels = getDictionary("en").levels;
  const topicArticles = articlesByCategory(category.name, "en");
  const label = categoryLabel(category.name, "en");

  return (
    <main className="article-page" lang="en">
      <header className="article-header shell">
        <Link href="/en" className="brand" aria-label="Bean Wiki home">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/en/wiki" className="back-link">
            All articles →
          </Link>
          <LanguageSwitcher locale="en" href={`/topics/${slug}`} />
          <ThemeToggle />
          <MobileNav locale="en" />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="breadcrumbs">
          <Link href="/en">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/en/wiki">Articles</Link>
          <span aria-hidden="true">/</span>
          <span>{label}</span>
        </div>

        <div className={`section-heading accent-${category.accent}`}>
          <div>
            <span className="section-index">TOPIC</span>
            <h2>{label}</h2>
          </div>
          <p>{categoryDescription(slug, "en")}</p>
        </div>

        {topicArticles.length > 0 ? (
          <div className="browse-grid">
            {topicArticles.map((article) => (
              <Link
                href={`/en/wiki/${article.slug}`}
                key={article.slug}
                className="browse-card"
              >
                <div className="browse-card-top">
                  <span className="article-category">{label}</span>
                  <span className={`level-badge accent-${article.accent}`}>
                    {levels[article.level] ?? article.level}
                  </span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <span className="read-meta">
                  Reading time {article.readingTime}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="browse-empty">
            The first article for this topic is on the way.
          </div>
        )}
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
