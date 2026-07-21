import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeanMark } from "@/components/bean-logo";
import { MobileNav } from "@/components/mobile-nav";
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
    alternates: { canonical: `/topics/${slug}` },
    openGraph: {
      title: category.name,
      description: category.description,
      url: `/topics/${slug}`,
    },
  };
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
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/wiki" className="back-link">
            모든 문서 →
          </Link>
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
