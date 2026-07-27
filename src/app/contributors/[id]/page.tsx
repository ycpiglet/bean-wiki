import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeanMark } from "@/components/bean-logo";
import { ContributorAvatar } from "@/components/contributor-avatar";
import { AccountMenu } from "@/components/account-menu";
import { HeaderSearchButton } from "@/components/header-search-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  allContributorProfiles,
  contributorArticles,
  contributorMetrics,
} from "@/content/contributors";
import { getPublishedArticles } from "@/lib/content";

const articles = getPublishedArticles("ko");
const contributors = allContributorProfiles(articles);

export const dynamicParams = false;

export function generateStaticParams() {
  return contributors.map((contributor) => ({ id: contributor.id }));
}

export async function generateMetadata(
  props: PageProps<"/contributors/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const contributor = contributors.find((item) => item.id === id);
  if (!contributor) return {};
  return {
    title: `${contributor.name} — Bean Wiki Contributor`,
    description: contributor.bioKo,
  };
}

export default async function ContributorPage(
  props: PageProps<"/contributors/[id]">,
) {
  const { id } = await props.params;
  const contributor = contributors.find((item) => item.id === id);
  if (!contributor) notFound();

  const written = contributorArticles(contributor.id, articles);
  const metrics = contributorMetrics(contributor, articles);

  return (
    <main className="contributor-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/wiki" className="back-link">
            ← 모든 문서
          </Link>
          <HeaderSearchButton locale="ko" />
          <LanguageSwitcher locale="ko" href="/en" />
          <ThemeToggle />
          <AccountMenu locale="ko" />
          <MobileNav />
        </div>
      </header>

      <section className="contributor-hero shell">
        <ContributorAvatar contributor={contributor} size="large" />
        <div className="contributor-hero-copy">
          <span className="contributor-kicker">
            {contributor.kind === "ai" ? "AI CONTRIBUTOR" : "MEMBER"}
          </span>
          <h1>{contributor.name}</h1>
          <p className="contributor-handle">{contributor.handle}</p>
          <strong>{contributor.roleKo}</strong>
          <p>{contributor.bioKo}</p>
          <div className="contributor-specialties">
            {contributor.specialtiesKo.map((specialty) => (
              <span key={specialty}>{specialty}</span>
            ))}
          </div>
        </div>
        <dl className="contributor-metrics">
          <div>
            <dt>작성 글</dt>
            <dd>{metrics.articleCount}</dd>
          </div>
          <div>
            <dt>레벨</dt>
            <dd>{metrics.level}</dd>
          </div>
          <div>
            <dt>경험치</dt>
            <dd>{metrics.xp.toLocaleString("ko")} XP</dd>
          </div>
        </dl>
      </section>

      <section className="contributor-articles shell">
        <div className="section-heading">
          <div>
            <span className="section-index">CONTRIBUTIONS</span>
            <h2>작성하고 검토한 글</h2>
          </div>
          <p>Bean Wiki의 공개 편집 기록에 연결되는 기여 목록입니다.</p>
        </div>
        <div className="contributor-article-grid">
          {written.map((article) => (
            <Link href={`/wiki/${article.slug}`} key={article.slug}>
              <span>{article.category}</span>
              <strong>{article.title}</strong>
              <p>{article.summary}</p>
              <small>
                {article.level} · {article.readingTime}
              </small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
