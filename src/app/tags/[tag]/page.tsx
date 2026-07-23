import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { allTags, articlesByTag } from "@/lib/content";

// Known tags are prerendered below. dynamicParams stays at its default (true) so
// encoded Korean tag URLs still resolve — Next 16 delivers params.tag still
// percent-encoded, so we decode it before looking up articles.
export function generateStaticParams() {
  return allTags().map((tag) => ({ tag }));
}

function decodeTag(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata(
  props: PageProps<"/tags/[tag]">,
): Promise<Metadata> {
  const { tag: rawTag } = await props.params;
  const tag = decodeTag(rawTag);
  const canonical = `/tags/${encodeURIComponent(tag)}`;
  return {
    title: `#${tag}`,
    description: `"${tag}" 태그가 붙은 커피 문서 모음`,
    alternates: { canonical },
    openGraph: {
      title: `#${tag}`,
      description: `"${tag}" 태그가 붙은 커피 문서 모음`,
      url: canonical,
    },
  };
}

export default async function TagPage(props: PageProps<"/tags/[tag]">) {
  const { tag: rawTag } = await props.params;
  const tag = decodeTag(rawTag);
  const tagArticles = articlesByTag(tag);

  if (tagArticles.length === 0) notFound();

  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/wiki" className="back-link">
            모든 문서 →
          </Link>
          <HeaderSearchButton locale="ko" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="breadcrumbs">
          <Link href="/">홈</Link>
          <span aria-hidden="true">/</span>
          <Link href="/wiki">문서</Link>
          <span aria-hidden="true">/</span>
          <span>#{tag}</span>
        </div>

        <div className="section-heading">
          <div>
            <span className="section-index">TAG</span>
            <h2>#{tag}</h2>
          </div>
          <p>
            “{tag}” 태그가 붙은 문서 {tagArticles.length}편
          </p>
        </div>

        <div className="browse-grid">
          {tagArticles.map((article) => (
            <Link
              href={`/wiki/${article.slug}`}
              key={article.slug}
              className="browse-card"
            >
              <div className="browse-card-top">
                <span className="article-category">{article.category}</span>
                <span className={`level-badge accent-${article.accent}`}>
                  {article.level}
                </span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <span className="read-meta">읽는 시간 {article.readingTime}</span>
            </Link>
          ))}
        </div>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · 함께 만드는 열린 커피 백과사전</p>
        <a
          href="https://github.com/ycpiglet/bean-wiki"
          target="_blank"
          rel="noreferrer"
        >
          이 위키에 기여하기 ↗
        </a>
      </footer>
    </main>
  );
}
