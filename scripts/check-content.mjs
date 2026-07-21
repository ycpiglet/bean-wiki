#!/usr/bin/env node
// Content integrity gate. Reads the markdown article sources and validates the
// referential integrity that type-checking cannot: related slugs exist,
// category names match categories.ts, accent matches the category, filename
// matches slug, order.json agrees with the .md files, glossary refs are valid,
// and no category is orphaned.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { markdownToArticle } from "./content-md.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "src", "content");
const articlesDir = join(contentDir, "articles");

const read = (p) => readFileSync(p, "utf8");
const errors = [];
const err = (msg) => errors.push(msg);

function quoted(re, text) {
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

// Valid accent / icon values from the type unions.
const typesSrc = read(join(contentDir, "types.ts"));
const validAccents = new Set(
  quoted(/"([^"]+)"/g, typesSrc.match(/export type Accent =([^;]+);/s)?.[1] ?? ""),
);
const validIcons = new Set(
  quoted(
    /"([^"]+)"/g,
    typesSrc.match(/export type CategoryIcon =([^;]+);/s)?.[1] ?? "",
  ),
);

// Categories.
const catSrc = read(join(contentDir, "categories.ts"));
const categoryAccent = new Map();
const categoryNames = new Set();
for (const block of catSrc.split(/\{/).slice(1)) {
  const name = block.match(/name:\s*"([^"]+)"/)?.[1];
  const accent = block.match(/accent:\s*"([^"]+)"/)?.[1];
  const icon = block.match(/icon:\s*"([^"]+)"/)?.[1];
  if (!name) continue;
  categoryNames.add(name);
  if (accent) categoryAccent.set(name, accent);
  if (accent && !validAccents.has(accent))
    err(`category "${name}" has unknown accent "${accent}"`);
  if (icon && !validIcons.has(icon))
    err(`category "${name}" has unknown icon "${icon}"`);
}

// Articles from .md.
const mdFiles = readdirSync(articlesDir).filter((f) => f.endsWith(".md"));
const slugs = new Set();
const articles = [];
for (const file of mdFiles) {
  let article;
  try {
    article = markdownToArticle(read(join(articlesDir, file)));
  } catch (e) {
    err(`${file}: failed to parse (${e.message})`);
    continue;
  }
  if (slugs.has(article.slug)) err(`duplicate slug "${article.slug}" (${file})`);
  slugs.add(article.slug);
  if (file !== `${article.slug}.md`)
    err(`${file}: slug "${article.slug}" != filename (expected ${article.slug}.md)`);
  articles.push(article);
}

// order.json must agree with the .md set.
const order = JSON.parse(read(join(articlesDir, "order.json")));
for (const slug of order)
  if (!slugs.has(slug)) err(`order.json lists "${slug}" with no matching .md`);
for (const slug of slugs)
  if (!order.includes(slug)) err(`${slug}.md is not listed in order.json`);

// Article referential checks.
for (const a of articles) {
  if (!categoryNames.has(a.category))
    err(`article "${a.slug}" uses unknown category "${a.category}"`);
  if (!validAccents.has(a.accent))
    err(`article "${a.slug}" has unknown accent "${a.accent}"`);
  if (categoryAccent.get(a.category) !== a.accent)
    err(
      `article "${a.slug}" accent "${a.accent}" != category "${a.category}" accent "${categoryAccent.get(a.category)}"`,
    );
  for (const rel of a.related)
    if (!slugs.has(rel))
      err(`article "${a.slug}" related-links a missing slug "${rel}"`);
}

// Orphan categories.
for (const name of categoryNames)
  if (!articles.some((a) => a.category === name))
    err(`category "${name}" has no articles`);

// Glossary.
const glossarySrc = read(join(contentDir, "glossary.ts"));
for (const cat of quoted(/category:\s*"([^"]+)"/g, glossarySrc))
  if (!categoryNames.has(cat)) err(`glossary term uses unknown category "${cat}"`);
for (const block of glossarySrc.split(/\{/).slice(1)) {
  const relatedRaw = block.match(/related:\s*\[([^\]]*)\]/s)?.[1];
  if (!relatedRaw) continue;
  for (const rel of quoted(/"([^"]+)"/g, relatedRaw))
    if (!slugs.has(rel)) err(`glossary term related-links a missing slug "${rel}"`);
}

if (errors.length) {
  console.error(`\n✗ check-content: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ check-content: ${articles.length} articles, ${categoryNames.size} categories, all references valid`,
);
