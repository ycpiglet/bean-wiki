import type { MetadataRoute } from "next";
import { articles, categories } from "@/lib/content";

const baseUrl = "https://bean-wiki.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/wiki`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const topicRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/topics/${category.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/wiki/${article.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...topicRoutes, ...articleRoutes];
}
