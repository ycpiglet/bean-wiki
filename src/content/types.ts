export type Accent = "olive" | "sage" | "copper" | "blue" | "berry" | "sand";
export type CategoryIcon =
  | "seed"
  | "mountain"
  | "flame"
  | "drop"
  | "nose"
  | "cup";

export type ArticleSection = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
};

export type RevisionEntry = {
  date: string;
  note: string;
};

export type ArticleContributor = {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  kind: "human" | "ai";
  role?: string;
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  level: "입문" | "중급" | "전문";
  readingTime: string;
  updatedAt: string;
  accent: Accent;
  fact: string;
  sections: ArticleSection[];
  // Published HTML body, rendered at build time from the article's canonical
  // HTML source (see src/lib/content-serialize.mjs `renderSectionedHtml`): each
  // `<h2>`-delimited run wrapped in a numbered `<section id>`. `sections` is a
  // derived outline retained for the TOC, search index, and content validation.
  bodyHtml: string;
  related: string[];
  tags?: string[];
  history?: RevisionEntry[];
  // Contributor snapshots are stored with the article so attribution survives
  // account/profile changes. Older and agent-generated articles without this
  // field receive a transparent AI editorial byline from contributors.ts.
  contributors?: ArticleContributor[];
  // Slugs of articles that link here via an in-body wikilink. Computed at
  // build time (see scripts/build-content.mjs). Powers the "referenced by"
  // section; empty when nothing links here.
  backlinks?: string[];
  // Draft articles still build (and their page renders with a badge + noindex)
  // but are excluded from listings, search, the sitemap, and the feed.
  draft?: boolean;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: CategoryIcon;
  accent: Accent;
};

export type GlossaryTerm = {
  term: string;
  reading?: string;
  definition: string;
  body?: string;
  category?: string;
  related?: string[];
};

export const levels = ["입문", "중급", "전문"] as const;
export type Level = (typeof levels)[number];
