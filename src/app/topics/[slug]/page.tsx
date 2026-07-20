import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  articlesByCategory,
  categories,
  getCategory,
} from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/topics/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategory(slug);

  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
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

export default async function TopicPage(props: PageProps<"/topics/[slug]">) {
  const { slug } = await props.params;
  const category = getCategory(slug);

  if (!category) notFound();

  const topicArticles = articlesByCategory(category.name);

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
          <span>{category.name}</span>
        </div>

        <div className={`section-heading accent-${category.accent}`}>
          <div>
            <span className="section-index">TOPIC</span>
            <h2>{category.name}</h2>
          </div>
          <p>{category.description}</p>
        </div>

        {topicArticles.length > 0 ? (
          <div className="browse-grid">
            {topicArticles.map((article) => (
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
                <span className="read-meta">
                  읽는 시간 {article.readingTime}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="browse-empty">
            이 분야의 첫 문서를 준비하고 있습니다. 함께 채워주세요.
          </div>
        )}
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
