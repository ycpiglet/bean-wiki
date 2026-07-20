import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/lib/content";

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

  return {
    title: article.title,
    description: article.summary,
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

export default async function WikiArticle(props: PageProps<"/wiki/[slug]">) {
  const { slug } = await props.params;
  const article = getArticle(slug);

  if (!article) notFound();

  const related = article.related
    .map((relatedSlug) => getArticle(relatedSlug))
    .filter((item) => item !== undefined);

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
        <Link href="/" className="back-link">
          ← 모든 지식 둘러보기
        </Link>
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
            <span>/</span>
            <span>{article.category}</span>
          </div>

          <header className="wiki-title">
            <span className={`level-badge accent-${article.accent}`}>
              {article.level}
            </span>
            <h1>{article.title}</h1>
            <p>{article.summary}</p>
            <div className="article-meta">
              <span>읽는 시간 {article.readingTime}</span>
              <span>최근 수정 {article.updatedAt}</span>
            </div>
          </header>

          <div className={`knowledge-note accent-${article.accent}`}>
            <span>핵심 한 줄</span>
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
        </article>
      </div>

      <footer className="article-footer shell">
        <p>Bean Wiki · 함께 만드는 열린 커피 백과사전</p>
        <a
          href="https://github.com/ycpiglet/bean-wiki"
          target="_blank"
          rel="noreferrer"
        >
          이 문서 개선하기 ↗
        </a>
      </footer>
    </main>
  );
}

