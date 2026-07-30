#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const slug = valueAfter(args, "--slug");
const strict = args.includes("--strict");
const asJson = args.includes("--json");

if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("Usage: audit-article-resources.mjs --slug <slug> [--strict] [--json]");
  process.exit(2);
}

const articlePath = join(root, "src", "content", "articles", `${slug}.html`);
if (!existsSync(articlePath)) {
  console.error(`Article not found: ${slug}`);
  process.exit(2);
}

const html = readFileSync(articlePath, "utf8");
const inventory = {
  tables: count(html, /<table\b/gi),
  figures: count(html, /<figure\b/gi),
  blockquotes: count(html, /<blockquote\b/gi),
  numericClaims: count(
    stripMarkup(html),
    /(?:\d+(?:[.,]\d+)?\s*(?:%|°C|g|kg|mg|ml|L|bar|ppm|분|초|시간|일|년))/gi,
  ),
};

const evidenceDir = join(root, "src", "content", "resource-evidence", slug);
const manifests = existsSync(evidenceDir)
  ? readdirSync(evidenceDir).filter((name) => name.endsWith(".json"))
  : [];
const errors = [];
const records = [];

for (const file of manifests) {
  try {
    const record = JSON.parse(readFileSync(join(evidenceDir, file), "utf8"));
    records.push(record);
    for (const field of ["schemaVersion", "articleSlug", "resourceId", "kind", "purpose"]) {
      if (record[field] === undefined || record[field] === "") {
        errors.push(`${file}: ${field} is required`);
      }
    }
    if (record.articleSlug !== slug) errors.push(`${file}: articleSlug must equal ${slug}`);
    if (!record.source?.title || !record.source?.creator || !isHttp(record.source?.url)) {
      errors.push(`${file}: source title, creator, and absolute URL are required`);
    }
    if (!record.source?.checkedAt) errors.push(`${file}: source.checkedAt is required`);
    if (!["licensed-copy", "public-domain", "original", "link-only"].includes(record.rights?.mode)) {
      errors.push(`${file}: rights.mode is invalid`);
    }
    if (!record.accessibility?.summary) {
      errors.push(`${file}: accessibility.summary is required`);
    }
  } catch {
    errors.push(`${file}: invalid JSON`);
  }
}

const explanatoryCount =
  inventory.tables + inventory.figures + inventory.blockquotes;
if (explanatoryCount > 0 && manifests.length === 0) {
  errors.push("article contains table/figure/blockquote but has no resource evidence manifest");
}
if (manifests.length < explanatoryCount) {
  errors.push(
    `evidence manifests (${manifests.length}) are fewer than explanatory resources (${explanatoryCount})`,
  );
}

const result = { slug, strict, inventory, manifestCount: manifests.length, errors };
if (asJson) console.log(JSON.stringify(result, null, 2));
else {
  console.log(
    `${slug}: tables=${inventory.tables}, figures=${inventory.figures}, ` +
      `blockquotes=${inventory.blockquotes}, numeric_claims=${inventory.numericClaims}, ` +
      `manifests=${manifests.length}`,
  );
  for (const error of errors) console.error(`- ${error}`);
}

if (strict && errors.length) process.exit(1);

function valueAfter(values, flag) {
  const index = values.indexOf(flag);
  return index >= 0 ? values[index + 1] : null;
}

function count(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function stripMarkup(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function isHttp(value) {
  return typeof value === "string" && /^https?:\/\//.test(value);
}
