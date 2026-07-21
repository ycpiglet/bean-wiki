import type { MetadataRoute } from "next";
import { allTags, articles, articlesByCategory, categories } from "@/lib/content";
import { parseKoreanDate } from "@/lib/dates";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Deterministic: derived from content dates, so lastmod only moves when
  // content actually changes — not on every build.
  const siteLastModified = articles.reduce(
    (max, a) => {
      const d = parseKoreanDate(a.updatedAt);
      return d > max ? d : max;
    },
    new Date(0),
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: siteLastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/wiki`, lastModified: siteLastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/glossary`, lastModified: siteLastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: siteLastModified, changeFrequency: "yearly", priority: 0.2 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = categories.map((category) => {
    const catArticles = articlesByCategory(category.name);
    const lastModified = catArticles.reduce(
      (max, a) => {
        const d = parseKoreanDate(a.updatedAt);
        return d > max ? d : max;
      },
      new Date(0),
    );
    return {
      url: `${SITE_URL}/topics/${category.slug}`,
      lastModified: catArticles.length ? lastModified : siteLastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/wiki/${article.slug}`,
    lastModified: parseKoreanDate(article.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tagRoutes: MetadataRoute.Sitemap = allTags().map((tag) => ({
    url: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: siteLastModified,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...topicRoutes, ...articleRoutes, ...tagRoutes];
}
