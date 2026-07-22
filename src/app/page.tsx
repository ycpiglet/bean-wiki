import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { HeaderSearchButton } from "@/components/header-search-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { Search } from "@/components/search";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  categories,
  categoryArticleCount,
  getPublishedArticles,
  getSearchIndex,
  levelArticleCount,
} from "@/lib/content";
import type { CategoryIcon } from "@/content/types";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { ko: "/", en: "/en" } },
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

function TopicIcon({ name }: { name: CategoryIcon }) {
  const paths: Record<CategoryIcon, React.ReactNode> = {
    seed: (
      <>
        <path d="M12 20v-8" />
        <path d="M12 12C7 12 4.8 9.2 5 5c4.8 0 7 2.8 7 7Z" />
        <path d="M12 15c4.5 0 7-2.6 7-6.5-4.5 0-7 2.4-7 6.5Z" />
      </>
    ),
    mountain: (
      <>
        <path d="m3 19 6.7-12 3 5 2-3L21 19H3Z" />
        <path d="m8.3 9.5 1.4 2 1.1-1.2" />
      </>
    ),
    flame: <path d="M13.4 3.5c.5 3-1.8 4.4-2.8 6.2-1.2-1-1.4-2.2-1.1-3.5C6.8 8.1 5 10.5 5 13.3A7 7 0 0 0 19 13c0-4.2-2.3-7-5.6-9.5ZM12 20c-2 0-3.4-1.3-3.4-3.1 0-1.4.8-2.6 2-3.7 0 1 .5 1.8 1.3 2.3.7-1.1 1.7-2 1.7-3.7 1.3 1.4 1.9 2.8 1.9 4.3 0 2.2-1.5 3.9-3.5 3.9Z" />,
    drop: <path d="M12 3S6.5 9.5 6.5 14.2a5.5 5.5 0 0 0 11 0C17.5 9.5 12 3 12 3Zm-2.8 12c.2 1.3 1 2.1 2.2 2.4" />,
    nose: (
      <>
        <path d="M13 4c-1.8 2.5-2.5 5.5-2.5 8.7 0 1.1-.8 1.9-1.7 2.4 1.7 1.1 4.4 1 5.6-.1" />
        <path d="M8 19c2.4 1.3 5.4 1.3 8 0" />
      </>
    ),
    cup: (
      <>
        <path d="M5 8h12v5.5A5.5 5.5 0 0 1 11.5 19h-1A5.5 5.5 0 0 1 5 13.5V8Z" />
        <path d="M17 10h1.2a2.3 2.3 0 0 1 0 4.6H17M8 4v2M12 3v3" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  // Build the search index at render (SSG) so the client never re-lowercases
  // the full corpus on every keystroke.
  const searchItems = getSearchIndex("ko");
  const articles = getPublishedArticles("ko");

  return (
    <main>
      <header className="site-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <nav aria-label="주 메뉴">
          <a href="#topics">둘러보기</a>
          <Link href="/wiki">문서</Link>
          <Link href="/glossary">용어집</Link>
          <a href="#contribute">기여하기</a>
        </nav>
        <div className="header-tools">
          <HeaderSearchButton locale="ko" />
          <LanguageSwitcher locale="ko" href="/en" />
          <ThemeToggle />
          <MobileNav />
        </div>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">OPEN COFFEE ENCYCLOPEDIA</span>
          <h1>
            한 잔을 이해하는 데 필요한
            <br />
            <span>모든 커피 지식</span>
          </h1>
          <p>
            처음 커피를 내리는 사람부터 바리스타, 로스터, Q 그레이더까지.
            <br className="desktop-break" />
            누구나 배우고, 검증하고, 함께 쌓아가는 열린 커피 백과사전입니다.
          </p>
          <div id="search">
            <Search articles={searchItems} manageShortcut={false} />
          </div>
          <div className="search-suggestions">
            <span>추천 검색</span>
            <Link href="/wiki/extraction-basics">추출 수율</Link>
            <Link href="/wiki/coffee-processing">가공 방식</Link>
            <Link href="/wiki/cupping-basics">커핑</Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="bean-illustration">
            <BeanMark />
          </div>
          <span className="visual-label label-origin">ORIGIN</span>
          <span className="visual-label label-roast">ROAST</span>
          <span className="visual-label label-brew">BREW</span>
          <div className="visual-note">
            <span>SEED TO CUP</span>
            <strong>01 — 06</strong>
          </div>
        </div>
      </section>

      <section className="intro-strip">
        <div className="shell intro-strip-inner">
          <span>지식은 연결될수록 선명해집니다.</span>
          <p>
            커피의 여섯 영역을 따라가며 한 가지 맛 뒤에 숨은 원인과 결과를
            발견해보세요.
          </p>
          <span className="scroll-mark">SCROLL ↓</span>
        </div>
      </section>

      <section className="section shell" id="topics">
        <div className="section-heading">
          <div>
            <span className="section-index">01</span>
            <h2>주제별로 탐색하기</h2>
          </div>
          <p>커피가 씨앗에서 한 잔이 되기까지, 관심 있는 영역부터 시작하세요.</p>
        </div>

        <div className="topic-grid">
          {categories.map((category, index) => (
            <Link
              className={`topic-card accent-${category.accent}`}
              href={`/topics/${category.slug}`}
              key={category.slug}
            >
              <span className="topic-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="topic-icon">
                <TopicIcon name={category.icon} />
              </span>
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <span className="topic-meta">
                문서 {categoryArticleCount(category.name)}
              </span>
              <span className="topic-arrow">
                <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section" id="featured">
        <div className="shell">
          <div className="section-heading section-heading-light">
            <div>
              <span className="section-index">02</span>
              <h2>지금 많이 읽는 문서</h2>
            </div>
            <Link href="/wiki" className="text-link">
              모든 문서 보기 <ArrowIcon />
            </Link>
          </div>

          <div className="featured-layout">
            <Link
              href={`/wiki/${articles[0].slug}`}
              className="lead-article"
            >
              <div className="article-visual accent-olive">
                <span className="article-visual-index">01</span>
                <BeanMark />
                <span className="article-visual-caption">FROM SEED TO CUP</span>
              </div>
              <div className="lead-article-copy">
                <span className="article-category">{articles[0].category}</span>
                <h3>{articles[0].title}</h3>
                <p>{articles[0].summary}</p>
                <span className="read-meta">
                  {articles[0].level} · 읽는 시간 {articles[0].readingTime}
                </span>
              </div>
            </Link>

            <div className="article-list">
              {articles.slice(1, 5).map((article, index) => (
                <Link href={`/wiki/${article.slug}`} key={article.slug}>
                  <span className="list-index">0{index + 2}</span>
                  <div>
                    <span className="article-category">{article.category}</span>
                    <h3>{article.title}</h3>
                    <span className="read-meta">
                      {article.level} · {article.readingTime}
                    </span>
                  </div>
                  <span className="list-arrow">
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="path-section shell" id="path">
        <div className="section-heading">
          <div>
            <span className="section-index">03</span>
            <h2>나에게 맞는 지식 경로</h2>
          </div>
          <p>현재의 경험에서 출발해 다음 단계로 자연스럽게 이어가세요.</p>
        </div>

        <div className="path-grid">
          <Link href="/wiki?level=입문" className="path-card">
            <span className="path-level">STARTER</span>
            <strong>커피를 처음 알아간다면</strong>
            <p>열매와 씨앗, 로스팅과 추출의 전체 흐름부터 시작합니다.</p>
            <span>입문 문서 {levelArticleCount("입문")}개 <ArrowIcon /></span>
          </Link>
          <Link href="/wiki?level=중급" className="path-card path-card-dark">
            <span className="path-level">BARISTA</span>
            <strong>맛을 안정적으로 만들고 싶다면</strong>
            <p>추출 변수와 물, 장비 관리의 관계를 체계적으로 연결합니다.</p>
            <span>중급 문서 {levelArticleCount("중급")}개 <ArrowIcon /></span>
          </Link>
          <Link href="/wiki?level=전문" className="path-card">
            <span className="path-level">PROFESSIONAL</span>
            <strong>평가와 설계를 깊이 다룬다면</strong>
            <p>생두 물성, 열 전달, 센서리와 품질 관리로 확장합니다.</p>
            <span>전문 문서 {levelArticleCount("전문")}개 <ArrowIcon /></span>
          </Link>
        </div>
      </section>

      <section className="contribute-section" id="contribute">
        <div className="shell contribute-inner">
          <div>
            <span className="eyebrow">KNOWLEDGE GROWS TOGETHER</span>
            <h2>당신이 아는 커피를<br />모두의 지식으로.</h2>
          </div>
          <div className="contribute-copy">
            <p>
              현장의 경험, 새롭게 읽은 연구, 바로잡아야 할 오래된 정보까지.
              Bean Wiki의 모든 문서는 근거와 토론을 통해 함께 성장합니다.
            </p>
            <a
              className="primary-button"
              href="https://github.com/ycpiglet/bean-wiki"
              target="_blank"
              rel="noreferrer"
            >
              첫 문서에 기여하기 <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer shell">
        <Link href="/" className="brand footer-brand">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <p>함께 만들고, 누구나 배우는 열린 커피 백과사전.</p>
        <span>
          © 2026 BEAN WIKI · <Link href="/privacy">개인정보</Link>
        </span>
      </footer>
    </main>
  );
}
