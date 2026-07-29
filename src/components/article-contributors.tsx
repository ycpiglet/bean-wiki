import Link from "next/link";
import type { Article } from "@/content/types";
import {
  contributorMetrics,
  contributorProfilesForArticle,
} from "@/content/contributors";
import { getPublishedArticles } from "@/lib/content";
import { ContributorAvatar } from "@/components/contributor-avatar";

type Locale = "ko" | "en";

const COPY = {
  ko: {
    label: "CONTRIBUTED BY",
    ai: "AI CONTRIBUTOR",
    human: "MEMBER",
    articles: "작성 글",
    level: "레벨",
    xp: "XP",
  },
  en: {
    label: "CONTRIBUTED BY",
    ai: "AI CONTRIBUTOR",
    human: "MEMBER",
    articles: "Articles",
    level: "Level",
    xp: "XP",
  },
} as const;

export function ArticleContributors({
  article,
  locale = "ko",
}: {
  article: Article;
  locale?: Locale;
}) {
  const t = COPY[locale];
  const corpus = getPublishedArticles("ko");
  const contributors = contributorProfilesForArticle(article);

  return (
    <section className="article-contributors" aria-label={t.label}>
      <span className="article-contributors-label">{t.label}</span>
      <div className="article-contributors-list">
        {contributors.map((contributor) => {
          const metrics = contributorMetrics(contributor, corpus);
          const role =
            locale === "en" ? contributor.roleEn : contributor.roleKo;
          return (
            <Link
              href={`/contributors/${contributor.id}`}
              className="article-contributor-card"
              key={contributor.id}
            >
              <ContributorAvatar contributor={contributor} />
              <span className="article-contributor-identity">
                <span className="article-contributor-name">
                  <strong>{contributor.name}</strong>
                  <em>
                    {contributor.kind === "ai" ? t.ai : t.human}
                  </em>
                </span>
                <span className="article-contributor-role">
                  {contributor.handle} · {role}
                </span>
              </span>
              <span className="article-contributor-stats">
                <span>
                  <b>{metrics.articleCount}</b>
                  {t.articles}
                </span>
                <span>
                  <b>{metrics.level}</b>
                  {t.level}
                </span>
                <span>
                  <b>{metrics.xp.toLocaleString(locale === "en" ? "en" : "ko")}</b>
                  {t.xp}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
