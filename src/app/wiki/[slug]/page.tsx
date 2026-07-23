import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeanMark } from "@/components/bean-logo";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ShareButtons } from "@/components/share-buttons";
import { ThemeToggle } from "@/components/theme-toggle";
import { articles, getArticle, getCategoryByName } from "@/lib/content";
import { toISODate } from "@/lib/dates";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(
  props: PageProps<"/wiki/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticle(slug);

  if (!article) return {};

  const published = article.history?.length
    ? toISODate(article.history[article.history.length - 1].date)
    : toISODate(article.updatedAt);

  return {
    title: article.title,
    description: article.summary,
    keywords: article.tags,
    robots: article.draft ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: `/wiki/${slug}`,
      languages: { ko: `/wiki/${slug}`, en: `/en/wiki/${slug}` },
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: `/wiki/${slug}`,
      publishedTime: published,
      modifiedTime: toISODate(article.updatedAt),
      section: article.category,
      tags: article.tags,
    },
  };
}

export default async function WikiArticle(props: PageProps<"/wiki/[slug]">) {
  const { slug } = await props.params;
  const article = getArticle(slug);

  if (!article) notFound();

  const related = article.related
    .map((relatedSlug) => getArticle(relatedSlug))
    .filter((item) => item !== undefined);

  const backlinks = (article.backlinks ?? [])
    .map((linkSlug) => getArticle(linkSlug))
    .filter((item) => item !== undefined);

  const history = article.history ?? [];
  const categorySlug = getCategoryByName(article.category)?.slug;
  const published = history.length
    ? toISODate(history[history.length - 1].date)
    : toISODate(article.updatedAt);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    inLanguage: "ko",
    articleSection: article.category,
    keywords: article.tags?.join(", "),
    datePublished: published,
    dateModified: toISODate(article.updatedAt),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/wiki/${slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      ...(categorySlug
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: article.category,
              item: `${SITE_URL}/topics/${categorySlug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: categorySlug ? 3 : 2,
        name: article.title,
        item: `${SITE_URL}/wiki/${slug}`,
      },
    ],
  };

  return (
    <main className="article-page">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/" className="back-link">
            ← 모든 지식 둘러보기
          </Link>
          <HeaderSearchButton locale="ko" />
          <LanguageSwitcher locale="ko" href={`/en/wiki/${slug}`} />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <div className="article-shell shell">
        <aside className="article-aside">
          <span>목차</span>
          <nav aria-label="문서 목차">
            {article.sections.map((section, index) => (
              <a href={`#${section.id}`} key={section.id}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {section.title}
              </a>
            ))}
          </nav>
          <div className="article-license">
            <span>OPEN KNOWLEDGE</span>
            <p>이 문서는 함께 검토하고 발전시키는 초안입니다.</p>
          </div>
        </aside>

        <article className="wiki-article">
          <div className="breadcrumbs">
            <Link href="/">홈</Link>
            <span aria-hidden="true">/</span>
            <span>{article.category}</span>
          </div>

          <header className="wiki-title">
            <span className={`level-badge accent-${article.accent}`}>
              {article.level}
            </span>
            {article.draft && <span className="draft-badge">초안</span>}
            <h1>{article.title}</h1>
            <p>{article.summary}</p>
            <div className="article-meta">
              <span>읽는 시간 {article.readingTime}</span>
              <span>최근 수정 {article.updatedAt}</span>
              <Link href={`/edit/${slug}`} className="edit-article-link">
                편집
              </Link>
              <Link href={`/wiki/${slug}/history`} className="edit-article-link">
                역사
              </Link>
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.map((tag) => (
                  <Link href={`/tags/${encodeURIComponent(tag)}`} key={tag}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <div className={`knowledge-note accent-${article.accent}`}>
            <span>핵심 한 줄</span>
            <p>{article.fact}</p>
          </div>

          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />

          {history.length > 0 && (
            <section className="revision-section">
              <span>개정 이력</span>
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
            <span>다음으로 읽기</span>
            <div>
              {related.map((item) => (
                <Link href={`/wiki/${item.slug}`} key={item.slug}>
                  <small>{item.category}</small>
                  <strong>{item.title}</strong>
                  <span>→</span>
                </Link>
              ))}
            </div>
          </section>

          {backlinks.length > 0 && (
            <section className="related-section backlinks-section">
              <span>이 문서를 참조하는 문서</span>
              <div>
                {backlinks.map((item) => (
                  <Link href={`/wiki/${item.slug}`} key={item.slug}>
                    <small>{item.category}</small>
                    <strong>{item.title}</strong>
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <ShareButtons title={article.title} path={`/wiki/${slug}`} />
        </article>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · 함께 만드는 열린 커피 백과사전</p>
        <a
          href={`https://github.com/ycpiglet/bean-wiki/blob/main/src/content/articles/${slug}.html`}
          target="_blank"
          rel="noreferrer"
        >
          GitHub에서 이 문서 편집하기 ↗
        </a>
      </footer>
    </main>
  );
}

