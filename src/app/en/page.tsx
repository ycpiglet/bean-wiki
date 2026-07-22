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
  categoryDescription,
  categoryLabel,
  getArticles,
  getSearchIndex,
  levelArticleCount,
} from "@/lib/content";
import { getDictionary } from "@/i18n";
import type { CategoryIcon } from "@/content/types";

export const metadata: Metadata = {
  title: "Bean Wiki — Open Coffee Encyclopedia",
  description:
    "An open coffee encyclopedia built and learned together — from beginners to baristas, roasters, and Q graders.",
  alternates: { canonical: "/en", languages: { ko: "/", en: "/en" } },
  openGraph: {
    title: "Bean Wiki — Open Coffee Encyclopedia",
    description: "From seed to cup, all of coffee in one place.",
    locale: "en_US",
    type: "website",
  },
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

export default function EnHome() {
  const enArticles = getArticles("en");
  const searchItems = getSearchIndex("en");
  const levels = getDictionary("en").levels;

  return (
    <main lang="en">
      <header className="site-header shell">
        <Link href="/en" className="brand" aria-label="Bean Wiki home">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <nav aria-label="Primary">
          <Link href="/en/wiki">Articles</Link>
          <Link href="/en/glossary">Glossary</Link>
          <a href="#contribute">Contribute</a>
        </nav>
        <div className="header-tools">
          <HeaderSearchButton locale="en" />
          <LanguageSwitcher locale="en" href="/" />
          <ThemeToggle />
          <MobileNav locale="en" />
        </div>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">OPEN COFFEE ENCYCLOPEDIA</span>
          <h1>
            All the coffee knowledge
            <br />
            <span>to understand a cup</span>
          </h1>
          <p>
            From your first pour-over to baristas, roasters, and Q graders.
            <br className="desktop-break" />
            An open coffee encyclopedia anyone can learn from, verify, and build.
          </p>
          <div id="search">
            <Search articles={searchItems} locale="en" manageShortcut={false} />
          </div>
          <div className="search-suggestions">
            <span>Popular</span>
            <Link href="/en/wiki/extraction-basics">Extraction yield</Link>
            <Link href="/en/wiki/coffee-processing">Processing</Link>
            <Link href="/en/wiki/cupping-basics">Cupping</Link>
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
          <span>Knowledge gets clearer as it connects.</span>
          <p>
            Follow coffee&rsquo;s six areas and discover the cause and effect
            behind a single taste.
          </p>
          <span className="scroll-mark">SCROLL ↓</span>
        </div>
      </section>

      <section className="section shell" id="topics">
        <div className="section-heading">
          <div>
            <span className="section-index">01</span>
            <h2>Explore by topic</h2>
          </div>
          <p>From seed to cup — start with the area you&rsquo;re curious about.</p>
        </div>

        <div className="topic-grid">
          {categories.map((category, index) => (
            <Link
              className={`topic-card accent-${category.accent}`}
              href={`/en/topics/${category.slug}`}
              key={category.slug}
            >
              <span className="topic-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="topic-icon">
                <TopicIcon name={category.icon} />
              </span>
              <div>
                <h3>{categoryLabel(category.name, "en")}</h3>
                <p>{categoryDescription(category.slug, "en")}</p>
              </div>
              <span className="topic-meta">
                {categoryArticleCount(category.name, "en")} articles
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
              <h2>Most read right now</h2>
            </div>
            <Link href="/en/wiki" className="text-link">
              See all articles <ArrowIcon />
            </Link>
          </div>

          <div className="featured-layout">
            <Link href={`/en/wiki/${enArticles[0].slug}`} className="lead-article">
              <div className="article-visual accent-olive">
                <span className="article-visual-index">01</span>
                <BeanMark />
                <span className="article-visual-caption">FROM SEED TO CUP</span>
              </div>
              <div className="lead-article-copy">
                <span className="article-category">
                  {categoryLabel(enArticles[0].category, "en")}
                </span>
                <h3>{enArticles[0].title}</h3>
                <p>{enArticles[0].summary}</p>
                <span className="read-meta">
                  {levels[enArticles[0].level] ?? enArticles[0].level} · Reading
                  time {enArticles[0].readingTime}
                </span>
              </div>
            </Link>

            <div className="article-list">
              {enArticles.slice(1, 5).map((article, index) => (
                <Link href={`/en/wiki/${article.slug}`} key={article.slug}>
                  <span className="list-index">0{index + 2}</span>
                  <div>
                    <span className="article-category">
                      {categoryLabel(article.category, "en")}
                    </span>
                    <h3>{article.title}</h3>
                    <span className="read-meta">
                      {levels[article.level] ?? article.level} ·{" "}
                      {article.readingTime}
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
            <h2>A path that fits you</h2>
          </div>
          <p>Start from where you are and move naturally to the next step.</p>
        </div>

        <div className="path-grid">
          <Link href="/en/wiki?level=입문" className="path-card">
            <span className="path-level">STARTER</span>
            <strong>New to coffee</strong>
            <p>Begin with the whole flow from fruit and seed to roasting and brewing.</p>
            <span>
              {levelArticleCount("입문", "en")} beginner articles <ArrowIcon />
            </span>
          </Link>
          <Link href="/en/wiki?level=중급" className="path-card path-card-dark">
            <span className="path-level">BARISTA</span>
            <strong>Make taste reliable</strong>
            <p>Connect extraction variables, water, and gear systematically.</p>
            <span>
              {levelArticleCount("중급", "en")} intermediate articles <ArrowIcon />
            </span>
          </Link>
          <Link href="/en/wiki?level=전문" className="path-card">
            <span className="path-level">PROFESSIONAL</span>
            <strong>Go deep on evaluation and design</strong>
            <p>Extend into green properties, heat transfer, sensory, and QC.</p>
            <span>
              {levelArticleCount("전문", "en")} advanced articles <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>

      <section className="contribute-section" id="contribute">
        <div className="shell contribute-inner">
          <div>
            <span className="eyebrow">KNOWLEDGE GROWS TOGETHER</span>
            <h2>
              Turn what you know
              <br />
              into shared knowledge.
            </h2>
          </div>
          <div className="contribute-copy">
            <p>
              Field experience, freshly read research, old information that needs
              fixing. Every Bean Wiki article grows through evidence and discussion.
            </p>
            <a
              className="primary-button"
              href="https://github.com/ycpiglet/bean-wiki"
              target="_blank"
              rel="noreferrer"
            >
              Contribute your first article <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer shell">
        <Link href="/en" className="brand footer-brand">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <p>An open coffee encyclopedia, built together and free to learn from.</p>
        <span>
          © 2026 BEAN WIKI · <Link href="/en/privacy">Privacy</Link>
        </span>
      </footer>
    </main>
  );
}
