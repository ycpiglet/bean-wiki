// Public content API. Article/glossary/category data now lives under src/content/*;
// this module is the stable facade every page imports from. Adding a new article
// means adding a file under src/content/articles/ and one line in its index.ts —
// nothing here changes. See CONTRIBUTING.md.
export type {
  ArticleSection,
  RevisionEntry,
  Article,
  Category,
  GlossaryTerm,
  Level,
} from "@/content/types";
export { levels } from "@/content/types";

import type { Article, Level } from "@/content/types";
import { articles } from "@/content/articles";
import { categories } from "@/content/categories";
import { glossaryTerms } from "@/content/glossary";

export { articles, categories, glossaryTerms };

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function articlesByCategory(categoryName: string) {
  return articles.filter((article) => article.category === categoryName);
}

export function categoryArticleCount(categoryName: string) {
  return articlesByCategory(categoryName).length;
}

export function levelArticleCount(level: Level) {
  return articles.filter((article) => article.level === level).length;
}

export function allTags() {
  const set = new Set<string>();
  for (const article of articles) {
    for (const tag of article.tags ?? []) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ko"));
}

export function articlesByTag(tag: string) {
  return articles.filter((article) => article.tags?.includes(tag));
}

export function articleBodyText(article: Article) {
  return [
    ...article.sections.flatMap((section) => [
      ...section.paragraphs,
      ...(section.points ?? []),
    ]),
    article.fact,
  ].join(" ");
}

export function glossaryByCategory() {
  return categories
    .map((category) => ({
      category,
      terms: glossaryTerms.filter((term) => term.category === category.name),
    }))
    .filter((group) => group.terms.length > 0);
}
