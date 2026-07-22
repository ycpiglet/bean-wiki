// Public content API. Article data lives in src/content/articles/*.md and is
// generated into src/content/articles/index.ts (locale-keyed). This module is
// the stable facade every page imports from. Locale defaults to "ko", so the
// existing Korean pages need no changes; the /en pages pass "en".
export type {
  ArticleSection,
  RevisionEntry,
  Article,
  Category,
  GlossaryTerm,
  Level,
  Accent,
  CategoryIcon,
} from "@/content/types";
export { levels } from "@/content/types";

import type { Article, Level, GlossaryTerm } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { articlesByLocale } from "@/content/articles";
import { categories } from "@/content/categories";
import { categoriesEn } from "@/content/categories.en";
import { glossaryTerms } from "@/content/glossary";
import { glossaryTermsEn } from "@/content/glossary.en";

export { categories, glossaryTerms };
// Back-compat: the unqualified `articles` is the Korean set.
export const articles = articlesByLocale.ko;

export function getArticles(locale: Locale = "ko") {
  return articlesByLocale[locale] ?? articlesByLocale.ko;
}

export function getArticle(slug: string, locale: Locale = "ko") {
  return getArticles(locale).find((article) => article.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryByName(name: string) {
  return categories.find((category) => category.name === name);
}

// Localized display name / description for a category (matching stays by the
// canonical Korean name; only the label is translated).
export function categoryLabel(canonicalName: string, locale: Locale = "ko") {
  if (locale === "en") {
    const category = getCategoryByName(canonicalName);
    return (category && categoriesEn[category.slug]?.name) || canonicalName;
  }
  return canonicalName;
}

export function categoryDescription(slug: string, locale: Locale = "ko") {
  const category = getCategory(slug);
  if (!category) return "";
  if (locale === "en") return categoriesEn[slug]?.description ?? category.description;
  return category.description;
}

export function articlesByCategory(categoryName: string, locale: Locale = "ko") {
  return getArticles(locale).filter((article) => article.category === categoryName);
}

export function categoryArticleCount(categoryName: string, locale: Locale = "ko") {
  return articlesByCategory(categoryName, locale).length;
}

export function levelArticleCount(level: Level, locale: Locale = "ko") {
  return getArticles(locale).filter((article) => article.level === level).length;
}

export function allTags(locale: Locale = "ko") {
  const set = new Set<string>();
  for (const article of getArticles(locale)) {
    for (const tag of article.tags ?? []) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ko"));
}

export function articlesByTag(tag: string, locale: Locale = "ko") {
  return getArticles(locale).filter((article) => article.tags?.includes(tag));
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

export type SearchIndexItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  haystack: string;
};

// Precomputed, lowercased search index for a locale. Built once at SSG time so
// the client never re-lowercases the whole corpus on every keystroke. Shared by
// the home hero <Search> and the global <SearchOverlay>.
export function getSearchIndex(locale: Locale = "ko"): SearchIndexItem[] {
  return getArticles(locale).map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: categoryLabel(article.category, locale),
    haystack: [
      article.title,
      article.summary,
      categoryLabel(article.category, locale),
      (article.tags ?? []).join(" "),
      articleBodyText(article),
    ]
      .join(" ")
      .toLocaleLowerCase("ko"),
  }));
}

export function getGlossaryTerms(locale: Locale = "ko"): GlossaryTerm[] {
  return locale === "en" ? glossaryTermsEn : glossaryTerms;
}

export function glossaryByCategory(locale: Locale = "ko") {
  const terms = getGlossaryTerms(locale);
  return categories
    .map((category) => ({
      category,
      terms: terms.filter((term) => term.category === category.name),
    }))
    .filter((group) => group.terms.length > 0);
}
