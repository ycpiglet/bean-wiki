import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getArticle, glossaryByCategory } from "@/lib/content";

export const metadata: Metadata = {
  title: "용어집",
  description:
    "커피 현장에서 자주 쓰는 핵심 용어를 분야별로 한 줄 정의와 함께 정리했습니다.",
};

function BeanLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48">
      <path d="M34.7 7.7C27.6 3.6 17 7.4 11.2 16.3 5.4 25.2 6.8 36 14 40.5c7.2 4.5 17.7.9 23.6-8 5.8-8.9 4.3-20.5-2.9-24.8Z" />
      <path d="M34.5 8.4c-2.3 7.9-8.7 9.2-13 14.6-4.1 5.2-4.9 10.3-4.2 16.2" />
    </svg>
  );
}

export default function GlossaryPage() {
  const groups = glossaryByCategory();

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
          <Link href="/" className="back-link">
            ← 홈으로
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="browse-shell shell">
        <div className="breadcrumbs">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>용어집</span>
        </div>

        <div className="section-heading">
          <div>
            <span className="section-index">GLOSSARY</span>
            <h2>용어집</h2>
          </div>
          <p>
            커피를 이야기할 때 자주 쓰는 용어를 분야별로 한 줄 정의와 함께
            정리했습니다.
          </p>
        </div>

        <nav className="glossary-nav" aria-label="용어 분야 바로가기">
          {groups.map((group) => (
            <a
              key={group.category.slug}
              href={`#${group.category.slug}`}
              className="filter-chip"
            >
              {group.category.name}
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
                <h2>{group.category.name}</h2>
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
                    {term.body && <p className="glossary-body">{term.body}</p>}
                    {term.related && term.related.length > 0 && (
                      <div className="glossary-related">
                        {term.related.map((slug) => {
                          const linked = getArticle(slug);
                          return linked ? (
                            <Link key={slug} href={`/wiki/${slug}`}>
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
