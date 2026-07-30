#!/usr/bin/env node

import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assessImageLicense,
  buildArticleFigure,
  isSafeHttpsUrl,
} from "./lib/image-license.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_BYTES = 12 * 1024 * 1024;
const MIME_EXTENSIONS = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 2) {
    const token = argv[index];
    const value = argv[index + 1];
    if (!token?.startsWith("--") || !value) throw new Error(`bad argument: ${token}`);
    parsed[token.slice(2)] = value;
  }
  return parsed;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54) || "image";
}

function insertAfterSectionIntro(source, section, figure) {
  const heading = `<h2 id="${section}">`;
  const headingIndex = source.indexOf(heading);
  if (headingIndex === -1) throw new Error(`section not found: ${section}`);
  const paragraphEnd = source.indexOf("</p>", headingIndex);
  const nextHeading = source.indexOf("<h2 ", headingIndex + heading.length);
  if (
    paragraphEnd === -1 ||
    (nextHeading !== -1 && paragraphEnd > nextHeading)
  ) {
    throw new Error(`section has no introductory paragraph: ${section}`);
  }
  const insertionPoint = paragraphEnd + "</p>".length;
  return `${source.slice(0, insertionPoint)}\n${figure}${source.slice(insertionPoint)}`;
}

async function downloadCandidate(candidate) {
  if (!isSafeHttpsUrl(candidate.imageUrl)) throw new Error("candidate image URL is not HTTPS");
  const response = await fetch(candidate.imageUrl, {
    headers: {
      "User-Agent":
        "BeanWikiImageResearchBot/0.1 (https://github.com/ycpiglet/bean-wiki)",
    },
  });
  if (!response.ok) throw new Error(`image download failed: ${response.status}`);
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BYTES) throw new Error("image exceeds 12 MB");
  const mime = response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
  const extension = MIME_EXTENSIONS.get(mime);
  if (!extension) throw new Error(`unsupported downloaded media type: ${mime || "unknown"}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_BYTES) throw new Error("image exceeds 12 MB");
  return { bytes, mime, extension };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const key of ["manifest", "candidate", "section", "alt", "caption"]) {
    if (!args[key]) throw new Error(`--${key} is required`);
  }

  const manifestPath = resolve(args.manifest);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const candidate = manifest.candidates?.find((item) => item.id === args.candidate);
  if (!candidate) throw new Error(`candidate not found: ${args.candidate}`);
  if (!candidate.accepted) throw new Error("candidate did not pass the research gate");
  const license = assessImageLicense(candidate.license?.raw, candidate.license?.url);
  if (!license.allowed) throw new Error(`license recheck failed: ${license.reason}`);
  if (!candidate.author || !isSafeHttpsUrl(candidate.sourceUrl)) {
    throw new Error("candidate attribution evidence is incomplete");
  }

  const slug = manifest.article?.slug;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error("manifest article slug is invalid");
  const articlePath = join(root, "src", "content", "articles", `${slug}.html`);
  const articleSource = readFileSync(articlePath, "utf8");
  if (articleSource.includes(`data-source="${candidate.sourceUrl}"`)) {
    throw new Error("the selected source is already present in the article");
  }

  const downloaded = await downloadCandidate(candidate);
  const sha256 = createHash("sha256").update(downloaded.bytes).digest("hex");
  const fileStem = `${slugify(candidate.title)}-${sha256.slice(0, 12)}`;
  const filename = `${fileStem}${downloaded.extension}`;
  const assetDirectory = join(root, "public", "article-media", slug);
  const assetPath = join(assetDirectory, filename);
  const publicPath = `/article-media/${slug}/${filename}`;
  const evidenceDirectory = join(root, "src", "content", "media", slug);
  const evidencePath = join(evidenceDirectory, `${fileStem}.json`);

  if (existsSync(assetPath) || existsSync(evidencePath)) {
    throw new Error(`asset already exists: ${basename(assetPath)}`);
  }
  const figure = buildArticleFigure({
    src: publicPath,
    alt: args.alt,
    caption: args.caption,
    author: candidate.author,
    license: license.label,
    sourceUrl: candidate.sourceUrl,
  });
  const nextArticle = insertAfterSectionIntro(articleSource, args.section, figure);

  const evidence = {
    schemaVersion: 1,
    id: candidate.id,
    articleSlug: slug,
    section: args.section,
    localPath: publicPath,
    sha256,
    bytes: downloaded.bytes.length,
    mime: downloaded.mime,
    alt: args.alt,
    caption: args.caption,
    source: {
      provider: candidate.provider,
      providerId: candidate.providerId,
      title: candidate.title,
      author: candidate.author,
      sourceUrl: candidate.sourceUrl,
      originalUrl: candidate.originalUrl,
      acquiredFrom: candidate.imageUrl,
    },
    license,
    acquisition: {
      selectedAt: new Date().toISOString(),
      researchManifest: basename(manifestPath),
      query: candidate.query,
      note: candidate.acquisitionNote,
      beanWikiTransformations: [],
    },
  };
  mkdirSync(assetDirectory, { recursive: true });
  mkdirSync(evidenceDirectory, { recursive: true });
  writeFileSync(assetPath, downloaded.bytes);
  chmodSync(assetPath, 0o644);
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  chmodSync(evidencePath, 0o644);
  writeFileSync(articlePath, nextArticle);
  console.log(`✓ image applied: ${publicPath}`);
  console.log(`  evidence: ${evidencePath}`);
  console.log(`  article: ${articlePath}`);
}

main().catch((error) => {
  console.error(`✗ image apply: ${error.message}`);
  process.exit(1);
});
