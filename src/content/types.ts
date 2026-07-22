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
  // Semantic HTML body generated from `sections` at build time (see
  // scripts/content-md.mjs `sectionsToHtml`). This is the representation the
  // in-browser editor reads; `sections` is retained for the TOC, search index,
  // and content validation.
  bodyHtml: string;
  related: string[];
  tags?: string[];
  history?: RevisionEntry[];
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
