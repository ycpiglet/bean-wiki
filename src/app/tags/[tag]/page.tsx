import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  return {
    title: `#${tag}`,
    description: `"${tag}" 태그가 붙은 커피 문서 모음`,
  };
}

function BeanLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48">
      <path d="M34.7 7.7C27.6 3.6 17 7.4 11.2 16.3 5.4 25.2 6.8 36 14 40.5c7.2 4.5 17.7.9 23.6-8 5.8-8.9 4.3-20.5-2.9-24.8Z" />
      <path d="M34.5 8.4c-2.3 7.9-8.7 9.2-13 14.6-4.1 5.2-4.9 10.3-4.2 16.2" />
    </svg>
  );
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
          <span className="bean-mark bean-mark-small">
            <BeanLogo />
          </span>
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/wiki" className="back-link">
            모든 문서 →
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="breadcrumbs">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/wiki">문서</Link>
          <span>/</span>
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
