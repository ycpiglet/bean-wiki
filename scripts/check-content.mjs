#!/usr/bin/env node
// Content integrity gate. Reads the HTML article sources and validates the
// referential integrity that type-checking cannot: related slugs exist,
// category names match categories.ts, accent matches the category, filename
// matches slug, order.json agrees with the .html files, glossary refs are
// valid, and no category is orphaned.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { articleFromSource, extractWikilinks } from "../src/lib/content-serialize.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "src", "content");
const articlesDir = join(contentDir, "articles");

const read = (p) => readFileSync(p, "utf8");
const errors = [];
const err = (msg) => errors.push(msg);
const warnings = [];
const warn = (msg) => warnings.push(msg);

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

// Articles from .html.
const htmlFiles = readdirSync(articlesDir).filter((f) => f.endsWith(".html"));
const slugs = new Set();
const articles = [];
for (const file of htmlFiles) {
  let article;
  try {
    article = articleFromSource(read(join(articlesDir, file)));
  } catch (e) {
    err(`${file}: failed to parse (${e.message})`);
    continue;
  }
  if (slugs.has(article.slug)) err(`duplicate slug "${article.slug}" (${file})`);
  slugs.add(article.slug);
  if (file !== `${article.slug}.html`)
    err(`${file}: slug "${article.slug}" != filename (expected ${article.slug}.html)`);
  articles.push(article);
}

// order.json must agree with the .html set.
const order = JSON.parse(read(join(articlesDir, "order.json")));
for (const slug of order)
  if (!slugs.has(slug)) err(`order.json lists "${slug}" with no matching .html`);
for (const slug of slugs)
  if (!order.includes(slug)) err(`${slug}.html is not listed in order.json`);

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

// Wikilinks: a link to a missing slug is a "red link" (invites creation), so
// warn rather than fail — mirroring MediaWiki.
for (const a of articles)
  for (const target of extractWikilinks(a.bodyHtml))
    if (!slugs.has(target))
      warn(`article "${a.slug}" wikilinks a missing slug "${target}" (red link)`);

// English translations (articles/en/*.html): must mirror a Korean article's
// slug, canonical category/accent/related, and section structure.
const enDir = join(articlesDir, "en");
let enCount = 0;
if (existsSync(enDir)) {
  const koBySlug = new Map(articles.map((a) => [a.slug, a]));
  for (const file of readdirSync(enDir).filter((f) => f.endsWith(".html"))) {
    let en;
    try {
      en = articleFromSource(read(join(enDir, file)));
    } catch (e) {
      err(`en/${file}: failed to parse (${e.message})`);
      continue;
    }
    enCount += 1;
    if (file !== `${en.slug}.html`)
      err(`en/${file}: slug "${en.slug}" != filename`);
    const ko = koBySlug.get(en.slug);
    if (!ko) {
      err(`en/${file}: no Korean article with slug "${en.slug}"`);
      continue;
    }
    if (en.category !== ko.category)
      err(`en/${en.slug}: category must match Korean canonical "${ko.category}"`);
    if (en.accent !== ko.accent)
      err(`en/${en.slug}: accent must match Korean "${ko.accent}"`);
    if (JSON.stringify(en.related) !== JSON.stringify(ko.related))
      err(`en/${en.slug}: related must match the Korean article`);
    const enIds = en.sections.map((s) => s.id).join(",");
    const koIds = ko.sections.map((s) => s.id).join(",");
    if (enIds !== koIds)
      err(`en/${en.slug}: section anchors [${enIds}] != Korean [${koIds}]`);
  }
}

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

if (warnings.length) {
  console.warn(`\n⚠ check-content: ${warnings.length} warning(s)`);
  for (const w of warnings) console.warn(`  - ${w}`);
  console.warn("");
}

if (errors.length) {
  console.error(`\n✗ check-content: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ check-content: ${articles.length} articles (+${enCount} en), ${categoryNames.size} categories, all references valid`,
);
