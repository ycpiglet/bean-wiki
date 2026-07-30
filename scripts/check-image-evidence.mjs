#!/usr/bin/env node

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assessImageLicense,
  isSafeHttpsUrl,
} from "./lib/image-license.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const articlesDirectory = join(root, "src", "content", "articles");
const evidenceDirectory = join(root, "src", "content", "media");
const assetDirectory = join(root, "public", "article-media");
const errors = [];

function walk(directory, predicate = () => true) {
  if (!existsSync(directory)) return [];
  const output = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) output.push(...walk(path, predicate));
    else if (predicate(path)) output.push(path);
  }
  return output;
}

function fail(message) {
  errors.push(message);
}

function parseFigureAttributes(figure) {
  const get = (name) =>
    figure.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? "";
  const image = figure.match(/<img\b[^>]*>/)?.[0] ?? "";
  const getImage = (name) =>
    image.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? "";
  return {
    author: get("data-author"),
    license: get("data-license"),
    source: get("data-source"),
    src: getImage("src"),
    alt: getImage("alt"),
  };
}

const articleSources = new Map(
  walk(articlesDirectory, (path) => path.endsWith(".html")).map((path) => [
    path,
    readFileSync(path, "utf8"),
  ]),
);
const evidenceByLocalPath = new Map();

for (const path of walk(evidenceDirectory, (entry) => entry.endsWith(".json"))) {
  let evidence;
  try {
    evidence = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${path}: invalid JSON (${error.message})`);
    continue;
  }
  const label = `${evidence.articleSlug || "unknown"}:${evidence.id || "unknown"}`;
  if (!evidence.localPath?.startsWith("/article-media/")) {
    fail(`${label}: localPath must start with /article-media/`);
    continue;
  }
  if (evidenceByLocalPath.has(evidence.localPath)) {
    fail(`${label}: duplicate localPath ${evidence.localPath}`);
  }
  evidenceByLocalPath.set(evidence.localPath, evidence);

  const license = assessImageLicense(evidence.license?.raw, evidence.license?.url);
  if (!license.allowed) fail(`${label}: blocked license (${license.reason})`);
  if (!evidence.source?.author) fail(`${label}: source author is missing`);
  if (!isSafeHttpsUrl(evidence.source?.sourceUrl)) {
    fail(`${label}: source page must be HTTPS`);
  }
  if (!isSafeHttpsUrl(evidence.license?.url)) {
    fail(`${label}: license URL must be HTTPS`);
  }
  if (!evidence.alt?.trim()) fail(`${label}: alt text is missing`);
  if (!evidence.caption?.trim()) fail(`${label}: caption is missing`);

  const assetPath = join(root, "public", evidence.localPath.replace(/^\//, ""));
  if (!existsSync(assetPath)) {
    fail(`${label}: asset is missing (${evidence.localPath})`);
  } else {
    const bytes = readFileSync(assetPath);
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== evidence.sha256) fail(`${label}: SHA-256 does not match`);
    if (bytes.length !== evidence.bytes) fail(`${label}: byte count does not match`);
  }

  const articlePath = join(articlesDirectory, `${evidence.articleSlug}.html`);
  const article = articleSources.get(articlePath);
  if (!article) fail(`${label}: article is missing`);
  else if (!article.includes(`src="${evidence.localPath}"`)) {
    fail(`${label}: article does not reference the local asset`);
  }
}

let figureCount = 0;
for (const [path, source] of articleSources) {
  let articleFigureCount = 0;
  for (const match of source.matchAll(/<figure\b[\s\S]*?<\/figure>/g)) {
    figureCount += 1;
    articleFigureCount += 1;
    const attrs = parseFigureAttributes(match[0]);
    const label = `${path}:${figureCount}`;
    if (!attrs.author) fail(`${label}: figure author is missing`);
    if (!attrs.license) fail(`${label}: figure license is missing`);
    if (!isSafeHttpsUrl(attrs.source)) fail(`${label}: figure source must be HTTPS`);
    if (!attrs.alt) fail(`${label}: figure alt text is missing`);
    if (attrs.src.startsWith("/article-media/")) {
      const evidence = evidenceByLocalPath.get(attrs.src);
      if (!evidence) fail(`${label}: local figure has no evidence JSON`);
      else {
        if (attrs.author !== evidence.source.author) {
          fail(`${label}: figure author differs from evidence`);
        }
        if (attrs.license !== evidence.license.label) {
          fail(`${label}: figure license differs from evidence`);
        }
        if (attrs.source !== evidence.source.sourceUrl) {
          fail(`${label}: figure source differs from evidence`);
        }
      }
    }
  }
  const minimumDeclaration = source.match(
    /(?:^|\n)mediaMinimum:\s*([^\r\n]*)/,
  );
  if (minimumDeclaration) {
    const minimumRaw = minimumDeclaration[1].trim();
    if (!/^(?:[1-9]|1[0-2])$/.test(minimumRaw)) {
      fail(`${path}: mediaMinimum must be an integer from 1 to 12`);
    } else if (articleFigureCount < Number(minimumRaw)) {
      fail(
        `${path}: requires ${minimumRaw} explanatory figure(s), found ${articleFigureCount}`,
      );
    }
  }
}

for (const assetPath of walk(assetDirectory)) {
  const publicPath = `/${assetPath.slice(join(root, "public").length + 1)}`;
  if (!evidenceByLocalPath.has(publicPath)) {
    fail(`${publicPath}: local article asset has no evidence JSON`);
  }
}

if (errors.length) {
  console.error(`\n✗ check-image-evidence: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ check-image-evidence: ${figureCount} figure(s), ${evidenceByLocalPath.size} licensed local asset(s) valid`,
);
