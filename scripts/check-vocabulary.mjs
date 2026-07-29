#!/usr/bin/env node
// Vocabulary integrity gate. The canonical coffee vocabulary is the interop
// spine: other apps store our ids instead of free strings, so an id typo, an
// alias claimed by two entities, or a dangling articleSlug is a broken contract
// in someone else's database — not a lint nit.
//
// Reading the data without a TS toolchain: every src/content/vocabulary/*.ts
// data file is written so that the array literal after
// `export const X: VocabularyEntity[] =` is strict JSON. We drop the import
// line(s) and that prefix, drop the trailing `;`, and JSON.parse the rest.
// Rules: docs/VOCABULARY-IDS.md.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "src", "content");
const vocabDir = join(contentDir, "vocabulary");
const articlesDir = join(contentDir, "articles");

const read = (p) => readFileSync(p, "utf8");
const errors = [];
const err = (msg) => errors.push(msg);

const ENTITY_TYPES = [
  "origin",
  "variety",
  "process",
  "flavor",
  "method",
  "equipment",
  "defect",
];
const ID_RE = /^(origin|variety|process|flavor|method|equipment|defect):[a-z0-9-]+$/;
const SOURCE_KINDS = new Set(["article", "glossary", "category", "tag"]);

// Keep in sync with normalizeQuery() in src/content/vocabulary/types.ts.
function normalizeQuery(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\s_]+/g, " ")
    .replace(/[.,;:!?'"()[\]{}]/g, "");
}

function quoted(re, text) {
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

// ── data files ───────────────────────────────────────────────────────────────
const dataFiles = readdirSync(vocabDir)
  .filter((f) => f.endsWith(".ts") && f !== "types.ts" && f !== "index.ts")
  .sort();

if (dataFiles.length === 0) err("no vocabulary data files in src/content/vocabulary/");

const entities = [];
for (const file of dataFiles) {
  const src = read(join(vocabDir, file))
    .split("\n")
    .filter((line) => !/^import\s/.test(line))
    .join("\n");
  const marker = src.match(/export const (\w+): VocabularyEntity\[\]\s*=\s*/);
  if (!marker) {
    err(`${file}: no "export const <name>: VocabularyEntity[] =" declaration`);
    continue;
  }
  let body = src.slice(marker.index + marker[0].length).trim();
  if (body.endsWith(";")) body = body.slice(0, -1).trim();
  let rows;
  try {
    rows = JSON.parse(body);
  } catch (e) {
    err(
      `${file}: array literal is not strict JSON (${e.message}). ` +
        "Use double-quoted keys/strings, no trailing commas, no comments inside the array.",
    );
    continue;
  }
  if (!Array.isArray(rows)) {
    err(`${file}: ${marker[1]} is not an array`);
    continue;
  }
  for (const row of rows) entities.push({ ...row, __file: file });
}

// ── referenced repo content ──────────────────────────────────────────────────
const articleSlugs = new Set(
  quoted(/^\s+"slug": "([^"]+)"/gm, read(join(articlesDir, "index.ts"))),
);
if (articleSlugs.size === 0)
  err("src/content/articles/index.ts yielded no slugs — run `npm run build:content` first");

const glossaryTerms = new Set(
  quoted(/term:\s*"([^"]+)"/g, read(join(contentDir, "glossary.ts"))),
);
const categoryNames = new Set(
  quoted(/name:\s*"([^"]+)"/g, read(join(contentDir, "categories.ts"))),
);

const articleTags = new Set();
for (const file of readdirSync(articlesDir).filter((f) => f.endsWith(".html"))) {
  const raw = read(join(articlesDir, file)).match(/^tags:\s*(\[.*\])\s*$/m)?.[1];
  if (!raw) continue;
  try {
    for (const t of JSON.parse(raw)) articleTags.add(t);
  } catch {
    err(`articles/${file}: tags frontmatter is not valid JSON`);
  }
}

// ── per-entity checks ────────────────────────────────────────────────────────
const byId = new Map();
const perType = new Map(ENTITY_TYPES.map((t) => [t, 0]));

for (const entity of entities) {
  const where = `${entity.__file}: "${entity.id ?? "(no id)"}"`;

  if (typeof entity.id !== "string" || !entity.id) {
    err(`${entity.__file}: entity without an "id"`);
    continue;
  }
  if (byId.has(entity.id)) err(`duplicate id "${entity.id}" (${entity.__file})`);
  else byId.set(entity.id, entity);

  if (!ENTITY_TYPES.includes(entity.type)) {
    err(`${where} has unknown type "${entity.type}"`);
  } else {
    perType.set(entity.type, perType.get(entity.type) + 1);
    if (!entity.id.startsWith(`${entity.type}:`))
      err(`${where} id prefix does not match type "${entity.type}"`);
  }
  if (!ID_RE.test(entity.id))
    err(`${where} id must match ${ID_RE} (lowercase ascii kebab after the prefix)`);

  if (!entity.labels || !entity.labels.ko || !entity.labels.en)
    err(`${where} is missing labels.ko or labels.en`);

  if (!Array.isArray(entity.aliases)) {
    err(`${where} has no "aliases" array`);
  } else {
    for (const alias of entity.aliases) {
      if (typeof alias !== "string" || !alias.trim()) {
        err(`${where} has an empty alias`);
        continue;
      }
      if (alias !== normalizeQuery(alias))
        err(
          `${where} alias "${alias}" is not normalized (expected "${normalizeQuery(alias)}")`,
        );
    }
  }

  if (entity.status !== "canonical" && entity.status !== "deprecated")
    err(`${where} status must be "canonical" or "deprecated" (got "${entity.status}")`);
  if (entity.status === "deprecated" && !entity.replacedBy)
    err(`${where} is deprecated without "replacedBy"`);
  if (entity.status === "canonical" && entity.replacedBy)
    err(`${where} is canonical but sets "replacedBy"`);

  if (entity.articleSlug && !articleSlugs.has(entity.articleSlug))
    err(`${where} articleSlug "${entity.articleSlug}" is not an existing article`);
  if (entity.glossaryTerm && !glossaryTerms.has(entity.glossaryTerm))
    err(`${where} glossaryTerm "${entity.glossaryTerm}" is not a term in glossary.ts`);

  const source = entity.source;
  if (!source || typeof source.kind !== "string" || typeof source.ref !== "string" || !source.ref) {
    err(`${where} is missing "source" — every entity must cite existing repo content`);
  } else if (!SOURCE_KINDS.has(source.kind)) {
    err(`${where} source.kind "${source.kind}" is not one of ${[...SOURCE_KINDS].join("/")}`);
  } else {
    const exists =
      source.kind === "article"
        ? articleSlugs.has(source.ref)
        : source.kind === "glossary"
          ? glossaryTerms.has(source.ref)
          : source.kind === "category"
            ? categoryNames.has(source.ref)
            : articleTags.has(source.ref);
    if (!exists)
      err(`${where} source ${source.kind} "${source.ref}" does not exist in the repo`);
  }
}

// ── cross-entity checks ──────────────────────────────────────────────────────
for (const entity of entities) {
  if (entity.parent && !byId.has(entity.parent))
    err(`"${entity.id}" parent "${entity.parent}" is not an existing entity id`);
  if (entity.parent === entity.id) err(`"${entity.id}" is its own parent`);
  if (entity.replacedBy) {
    const target = byId.get(entity.replacedBy);
    if (!target) err(`"${entity.id}" replacedBy "${entity.replacedBy}" does not exist`);
    else if (target.status === "deprecated")
      err(`"${entity.id}" replacedBy "${entity.replacedBy}" is itself deprecated`);
  }
}

// parent cycles
for (const entity of entities) {
  const seen = new Set([entity.id]);
  let cursor = entity.parent;
  while (cursor) {
    if (seen.has(cursor)) {
      err(`"${entity.id}" has a parent cycle through "${cursor}"`);
      break;
    }
    seen.add(cursor);
    cursor = byId.get(cursor)?.parent;
  }
}

// alias collisions across entities, over labels + aliases, after normalizeQuery
const aliasOwner = new Map();
let collisions = 0;
for (const entity of entities) {
  const keys = [entity.labels?.ko, entity.labels?.en, ...(entity.aliases ?? [])];
  const own = new Set();
  for (const raw of keys) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const key = normalizeQuery(raw);
    if (!key) continue;
    if (own.has(key)) continue;
    own.add(key);
    const owner = aliasOwner.get(key);
    if (owner && owner !== entity.id) {
      collisions += 1;
      err(`alias "${key}" is claimed by both "${owner}" and "${entity.id}"`);
    } else {
      aliasOwner.set(key, entity.id);
    }
  }
}

// index.ts must export the documented surface
const indexSrc = read(join(vocabDir, "index.ts"));
for (const symbol of ["vocabulary", "byId", "aliasIndex", "entitiesOfType"]) {
  if (!new RegExp(`export (const|function) ${symbol}\\b`).test(indexSrc))
    err(`src/content/vocabulary/index.ts does not export "${symbol}"`);
}
for (const file of dataFiles) {
  const mod = file.replace(/\.ts$/, "");
  if (!indexSrc.includes(`"./${mod}"`))
    err(`src/content/vocabulary/index.ts does not import "./${mod}"`);
}

if (errors.length) {
  console.error(`\n✗ check-vocabulary: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

const breakdown = ENTITY_TYPES.map((t) => `${perType.get(t)} ${t}`).join(", ");
console.log(
  `✓ check-vocabulary: ${entities.length} entities (${breakdown}), ` +
    `${aliasOwner.size} match keys, ${collisions} alias collisions`,
);
