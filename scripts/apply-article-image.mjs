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
import { spawnSync } from "node:child_process";
import {
  assessImageLicense,
  buildArticleFigure,
  isSafeHttpsUrl,
} from "./lib/image-license.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const RECOMPRESS_THRESHOLD_BYTES = 700 * 1024;
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
  const headerProfiles = [
    {
      "User-Agent":
        "BeanWikiImageResearchBot/0.1 (https://github.com/ycpiglet/bean-wiki)",
      Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.7",
    },
    {
      // Some image CDNs reject descriptive crawler user agents even when the
      // source page and licence are public. Retry as a normal image request;
      // this does not bypass authentication or access controls.
      "User-Agent": "Mozilla/5.0 (compatible; BeanWikiImageResearch/0.1)",
      Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.7",
      Referer: candidate.sourceUrl,
    },
  ];
  let response;
  for (const headers of headerProfiles) {
    response = await fetch(candidate.imageUrl, { headers });
    if (response.ok) break;
  }
  if (!response) throw new Error("image download did not start");
  if (!response.ok) throw new Error(`image download failed: ${response.status}`);
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BYTES) throw new Error("image exceeds 12 MB");
  const mime = response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
  const extension = MIME_EXTENSIONS.get(mime);
  if (!extension) throw new Error(`unsupported downloaded media type: ${mime || "unknown"}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_BYTES) throw new Error("image exceeds 12 MB");
  const resized = downsizeIfNeeded(bytes, mime);
  return { bytes: resized.bytes, mime, extension, resized: resized.applied };
}

// Wikimedia/Openverse originals are frequently far larger than any layout
// needs (multi-megabyte, 4000px+ on a side), which the CI performance
// reviewer flags. Downscale to a web-appropriate size before it ever reaches
// disk or the evidence hash, instead of shipping the raw original.
function downsizeIfNeeded(bytes, mime) {
  const pythonFormat = { "image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP" }[mime];
  if (!pythonFormat) return { bytes, applied: false };
  const script = `
import sys
from io import BytesIO
try:
    from PIL import Image
except ImportError:
    sys.exit(3)
data = sys.stdin.buffer.read()
img = Image.open(BytesIO(data))
w, h = img.size
needs_resize = max(w, h) > ${MAX_DIMENSION}
needs_recompress = len(data) > ${RECOMPRESS_THRESHOLD_BYTES}
if not (needs_resize or needs_recompress):
    sys.exit(2)
if needs_resize:
    scale = ${MAX_DIMENSION} / max(w, h)
    img = img.convert("RGB").resize((round(w * scale), round(h * scale)), Image.LANCZOS)
elif "${pythonFormat}" == "JPEG":
    img = img.convert("RGB")
out = BytesIO()
save_kwargs = {"quality": 82, "optimize": True} if "${pythonFormat}" == "JPEG" else {"optimize": True}
img.save(out, "${pythonFormat}", **save_kwargs)
sys.stdout.buffer.write(out.getvalue())
`;
  const result = spawnSync("python3", ["-c", script], { input: bytes, maxBuffer: MAX_BYTES * 2 });
  if (result.status === 2) return { bytes, applied: false }; // already small enough
  if (result.status !== 0 || !result.stdout?.length) {
    console.warn("⚠ image apply: skipped automatic downsize (python3/Pillow unavailable or failed)");
    return { bytes, applied: false };
  }
  return { bytes: result.stdout, applied: true };
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
    resized: downloaded.resized,
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
      beanWikiTransformations: downloaded.resized
        ? [`resized to max ${MAX_DIMENSION}px on the long edge, re-encoded as JPEG quality 82 to reduce page weight`]
        : [],
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
