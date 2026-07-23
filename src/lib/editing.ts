// Server-side article-save logic: validate editor input, then serialize it to a
// canonical HTML source file. Shared by the save API route.
// content-serialize is plain ESM JS shared with the build scripts (allowJs).
import {
  parseFrontmatter,
  serializeArticleSource,
  editorHtmlToSourceBody,
} from "@/lib/content-serialize.mjs";
import { categories } from "@/content/categories";
import { getArticles, type Level } from "@/lib/content";
import { levels } from "@/content/types";

export type SaveInput = {
  slug: string;
  locale: "ko" | "en";
  title: string;
  summary: string;
  fact?: string;
  bodyHtml: string;
  editSummary: string;
  baseSha?: string;
  draft?: boolean;
  // Only required when creating a new article:
  category?: string;
  level?: Level;
  accent?: string;
  tags?: string[];
  related?: string[];
};

type HistoryEntry = { date: string; note: string };
type Frontmatter = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  level: Level;
  readingTime: string;
  updatedAt: string;
  accent: string;
  fact: string;
  related: string[];
  tags?: string[];
  history?: HistoryEntry[];
  draft?: boolean | string;
};

export function sourcePath(slug: string, locale: "ko" | "en"): string {
  const base = "src/content/articles";
  return locale === "en" ? `${base}/en/${slug}.html` : `${base}/${slug}.html`;
}

// "YYYY. MM. DD." — matches the existing updatedAt/history date convention.
export function todayStamp(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${d}.`;
}

const SLUG_RE = /^[a-z0-9-]+$/;

export function validateSave(input: SaveInput, creating: boolean): string[] {
  const errors: string[] = [];
  if (!SLUG_RE.test(input.slug)) errors.push("slug must be lowercase letters, numbers, and hyphens.");
  if (!input.title?.trim()) errors.push("title is required.");
  if (!input.summary?.trim()) errors.push("summary is required.");
  if (!input.bodyHtml?.trim()) errors.push("body is required.");
  if (!input.editSummary?.trim()) errors.push("edit summary is required.");

  const knownSlugs = new Set(getArticles("ko").map((a) => a.slug));
  for (const rel of input.related ?? []) {
    if (!knownSlugs.has(rel)) errors.push(`related links a missing slug "${rel}".`);
  }

  if (creating) {
    const category = categories.find((c) => c.name === input.category);
    if (!category) errors.push(`unknown category "${input.category}".`);
    else if (input.accent && input.accent !== category.accent)
      errors.push(`accent "${input.accent}" != category accent "${category.accent}".`);
    if (input.level && !levels.includes(input.level))
      errors.push(`unknown level "${input.level}".`);
    if (input.locale !== "ko") errors.push("new articles must be created in the Korean locale first.");
  }
  return errors;
}

// Build the updated source text by merging editor input into the existing
// file's frontmatter (category/accent/related/tags are preserved). A new
// history entry is prepended (newest-first, matching the render convention) and
// updatedAt is bumped to today.
export function buildUpdatedSource(existingSource: string, input: SaveInput): string {
  const { fm } = parseFrontmatter(existingSource) as { fm: Frontmatter; body: string };
  const today = todayStamp();
  const history = [{ date: today, note: input.editSummary.trim() }, ...(fm.history ?? [])];
  const meta = {
    ...fm,
    title: input.title.trim(),
    summary: input.summary.trim(),
    fact: (input.fact ?? fm.fact).trim(),
    updatedAt: today,
    related: input.related ?? fm.related,
    tags: input.tags ?? fm.tags,
    history,
    draft: input.draft !== undefined ? input.draft : fm.draft,
  };
  return serializeArticleSource(meta, editorHtmlToSourceBody(input.bodyHtml));
}

// Rewrite references to a renamed slug inside another article's source: its
// related[] entries and any in-body wikilinks / hrefs.
export function rewriteReferences(sourceText: string, oldSlug: string, newSlug: string): string {
  const { fm, body } = parseFrontmatter(sourceText) as { fm: Frontmatter; body: string };
  const related = (fm.related ?? []).map((r) => (r === oldSlug ? newSlug : r));
  const newBody = body
    .split(`data-wikilink="${oldSlug}"`)
    .join(`data-wikilink="${newSlug}"`)
    .split(`href="/wiki/${oldSlug}"`)
    .join(`href="/wiki/${newSlug}"`)
    .split(`href="/en/wiki/${oldSlug}"`)
    .join(`href="/en/wiki/${newSlug}"`);
  return serializeArticleSource({ ...fm, related }, newBody);
}

// The renamed article itself: rewrite self-references, then set the new slug.
export function renameSelf(sourceText: string, oldSlug: string, newSlug: string): string {
  const rewritten = rewriteReferences(sourceText, oldSlug, newSlug);
  const { fm, body } = parseFrontmatter(rewritten) as { fm: Frontmatter; body: string };
  return serializeArticleSource({ ...fm, slug: newSlug }, body);
}

// Build a brand-new article source from scratch.
export function buildNewSource(input: SaveInput): string {
  const category = categories.find((c) => c.name === input.category);
  const today = todayStamp();
  const meta = {
    slug: input.slug,
    title: input.title.trim(),
    summary: input.summary.trim(),
    category: input.category,
    level: input.level ?? "입문",
    readingTime: "5분",
    updatedAt: today,
    accent: category?.accent ?? "olive",
    fact: (input.fact ?? "").trim(),
    related: input.related ?? [],
    tags: input.tags ?? [],
    history: [{ date: today, note: input.editSummary.trim() || "문서 최초 작성" }],
    draft: input.draft || undefined,
  };
  return serializeArticleSource(meta, editorHtmlToSourceBody(input.bodyHtml));
}
