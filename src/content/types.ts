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
  accent: string;
  fact: string;
  sections: ArticleSection[];
  related: string[];
  tags?: string[];
  history?: RevisionEntry[];
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
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
