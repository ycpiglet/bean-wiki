#!/usr/bin/env node
// Content integrity gate. TypeScript's `satisfies` only validates field names and
// literal unions — it cannot catch referential mistakes (a related slug that does
// not exist, a category name that does not match categories.ts, an article accent
// that disagrees with its category). This script closes that gap so those typos
// fail `npm run build` (via the prebuild hook) instead of silently breaking links.
//
// It reads the source as text (the content modules use the "@/" path alias and
// extensionless imports, which plain Node cannot resolve), which is sufficient for
// these existence/consistency checks.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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

// Valid accent / icon values, read from the type unions (source of truth).
const typesSrc = read(join(contentDir, "types.ts"));
const accentLine = typesSrc.match(/export type Accent =([^;]+);/s)?.[1] ?? "";
const iconLine = typesSrc.match(/export type CategoryIcon =([^;]+);/s)?.[1] ?? "";
const validAccents = new Set(quoted(/"([^"]+)"/g, accentLine));
const validIcons = new Set(quoted(/"([^"]+)"/g, iconLine));

// Categories: name -> accent, plus icon validity.
const catSrc = read(join(contentDir, "categories.ts"));
const catBlocks = catSrc.split(/\{/).slice(1);
const categoryAccent = new Map();
const categoryNames = new Set();
for (const block of catBlocks) {
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

// Articles: one module per file (excluding index.ts).
const articleFiles = readdirSync(articlesDir).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts",
);
const slugs = new Set();
const articles = [];
for (const file of articleFiles) {
  const src = read(join(articlesDir, file));
  const slug = src.match(/slug:\s*"([^"]+)"/)?.[1];
  const category = src.match(/category:\s*"([^"]+)"/)?.[1];
  const accent = src.match(/accent:\s*"([^"]+)"/)?.[1];
  const relatedRaw = src.match(/related:\s*\[([^\]]*)\]/s)?.[1] ?? "";
  const related = quoted(/"([^"]+)"/g, relatedRaw);
  if (!slug) {
    err(`${file}: no slug found`);
    continue;
  }
  if (slugs.has(slug)) err(`duplicate slug "${slug}" (${file})`);
  slugs.add(slug);
  const expectedFile = `${slug}.ts`;
  if (file !== expectedFile)
    err(`${file}: slug "${slug}" does not match filename (expected ${expectedFile})`);
  articles.push({ file, slug, category, accent, related });
}

// Registry must import + list every article file exactly once.
const indexSrc = read(join(articlesDir, "index.ts"));
for (const { slug, file } of articles) {
  if (!indexSrc.includes(`"./${slug}"`))
    err(`registry index.ts does not import "./${slug}" (${file})`);
}

// Article referential checks.
for (const a of articles) {
  if (a.category && !categoryNames.has(a.category))
    err(`article "${a.slug}" uses unknown category "${a.category}"`);
  if (a.accent && !validAccents.has(a.accent))
    err(`article "${a.slug}" has unknown accent "${a.accent}"`);
  if (a.category && a.accent && categoryAccent.get(a.category) !== a.accent)
    err(
      `article "${a.slug}" accent "${a.accent}" != category "${a.category}" accent "${categoryAccent.get(a.category)}"`,
    );
  for (const rel of a.related) {
    if (!slugs.has(rel))
      err(`article "${a.slug}" related-links a missing slug "${rel}"`);
  }
}

// Orphan categories (a topic page with no articles).
for (const name of categoryNames) {
  if (!articles.some((a) => a.category === name))
    err(`category "${name}" has no articles`);
}

// Glossary: category names must match, related slugs must exist.
const glossarySrc = read(join(contentDir, "glossary.ts"));
for (const cat of quoted(/category:\s*"([^"]+)"/g, glossarySrc)) {
  if (!categoryNames.has(cat))
    err(`glossary term uses unknown category "${cat}"`);
}
for (const block of glossarySrc.split(/\{/).slice(1)) {
  const relatedRaw = block.match(/related:\s*\[([^\]]*)\]/s)?.[1];
  if (!relatedRaw) continue;
  for (const rel of quoted(/"([^"]+)"/g, relatedRaw)) {
    if (!slugs.has(rel))
      err(`glossary term related-links a missing slug "${rel}"`);
  }
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
