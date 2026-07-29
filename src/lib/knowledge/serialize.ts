// Wire shapes for the knowledge API.
//
// These are a projection, not the internal model: they expose stable ids,
// locale-resolved labels, and links, and deliberately omit build-time internals
// (accent, section outlines, backlink graphs) so the site can restructure its
// content model without breaking integrators.

import type { Article, GlossaryTerm } from "@/content/types";
import type { VocabularyEntity } from "@/content/vocabulary/types";

export const SITE_ORIGIN = "https://bean-wiki.vercel.app";

export type WireEntity = {
  id: string;
  type: string;
  labels: { ko: string; en: string };
  aliases: string[];
  parent: string | null;
  status: string;
  replaced_by: string | null;
  note: string | null;
  article: { slug: string; url: string } | null;
  glossary_term: string | null;
};

export function wireEntity(entity: VocabularyEntity): WireEntity {
  return {
    id: entity.id,
    type: entity.type,
    labels: entity.labels,
    aliases: entity.aliases,
    parent: entity.parent ?? null,
    status: entity.status,
    replaced_by: entity.replacedBy ?? null,
    note: entity.note ?? null,
    article: entity.articleSlug
      ? { slug: entity.articleSlug, url: articleUrl(entity.articleSlug, "ko") }
      : null,
    glossary_term: entity.glossaryTerm ?? null,
  };
}

export type WireArticleSummary = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  level: string;
  tags: string[];
  reading_time: string;
  updated_at: string;
  url: string;
};

export function wireArticleSummary(
  article: Article,
  locale: "ko" | "en",
): WireArticleSummary {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: article.category,
    level: article.level,
    tags: article.tags ?? [],
    reading_time: article.readingTime,
    updated_at: article.updatedAt,
    url: articleUrl(article.slug, locale),
  };
}

export type WireArticle = WireArticleSummary & {
  body_html: string;
  fact: string;
  related: string[];
  outline: { id: string; title: string }[];
  license: string;
};

export function wireArticle(
  article: Article,
  locale: "ko" | "en",
): WireArticle {
  return {
    ...wireArticleSummary(article, locale),
    body_html: article.bodyHtml,
    fact: article.fact,
    related: article.related,
    outline: article.sections.map((section) => ({
      id: section.id,
      title: section.title,
    })),
    // Content licence travels with the content: a consumer republishing an
    // excerpt needs to know the terms without reading the repo.
    license: "CC-BY-4.0",
  };
}

export type WireTerm = {
  term: string;
  reading: string | null;
  definition: string;
  category: string | null;
  related: string[];
  url: string;
};

export function wireTerm(term: GlossaryTerm, locale: "ko" | "en"): WireTerm {
  return {
    term: term.term,
    reading: term.reading ?? null,
    definition: term.definition,
    category: term.category ?? null,
    related: term.related ?? [],
    url: `${SITE_ORIGIN}${locale === "en" ? "/en" : ""}/glossary`,
  };
}

export function articleUrl(slug: string, locale: "ko" | "en"): string {
  return `${SITE_ORIGIN}${locale === "en" ? "/en" : ""}/wiki/${slug}`;
}

export function readLocale(value: string | null): "ko" | "en" {
  return value === "en" ? "en" : "ko";
}
