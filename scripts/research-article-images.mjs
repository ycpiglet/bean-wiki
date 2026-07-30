#!/usr/bin/env node

import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assessImageLicense,
  isSafeHttpsUrl,
  stripHtml,
} from "./lib/image-license.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const plansPath = join(root, "src", "content", "image-research-plans.json");
const plans = JSON.parse(readFileSync(plansPath, "utf8"));
const USER_AGENT =
  "BeanWikiImageResearchBot/0.1 (https://github.com/ycpiglet/bean-wiki)";

function parseArgs(argv) {
  const parsed = { queries: [], limit: 12 };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = argv[index + 1];
    if (token === "--slug") parsed.slug = value;
    else if (token === "--query") parsed.queries.push(value);
    else if (token === "--limit") parsed.limit = Number(value);
    else if (token === "--output") parsed.output = value;
    else if (token === "--help") parsed.help = true;
    else throw new Error(`unknown argument: ${token}`);
    index += 1;
  }
  return parsed;
}

function usage() {
  return [
    "Usage:",
    "  node scripts/research-article-images.mjs --slug <article-slug>",
    "    [--query <English search query>] [--limit 12] [--output <path>]",
    "",
    "Only CC0, Public Domain, CC BY, and CC BY-SA bitmap candidates survive.",
    "The command creates an evidence report; it never edits or publishes an article.",
  ].join("\n");
}

function candidateId(provider, value) {
  return `${provider}:${String(value).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
}

function inferImageMime(filetype, url) {
  const raw =
    String(filetype ?? "").toLowerCase() ||
    String(url ?? "").match(/\.([a-z0-9]+)(?:$|[?#])/i)?.[1]?.toLowerCase() ||
    "";
  return {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  }[raw] ?? "";
}

function scoreCandidate(candidate, query) {
  const haystack = [
    candidate.title,
    candidate.description,
    ...(candidate.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  const queryTerms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 4);
  const matches = queryTerms.filter((term) => haystack.includes(term)).length;
  let score = 35 + matches * 12;
  if (candidate.provider === "wikimedia-commons") score += 8;
  if ((candidate.width ?? 0) >= 1200) score += 8;
  if ((candidate.height ?? 0) >= 800) score += 5;
  if (/photograph|photo/i.test(candidate.category ?? "")) score += 4;
  if (/logo|icon|clipart|poster|wheel/i.test(haystack)) score -= 22;
  return Math.max(0, Math.min(100, score));
}

function approveCandidate(candidate, query) {
  const license = assessImageLicense(candidate.rawLicense, candidate.licenseUrl);
  const reasons = [];
  if (!license.allowed) reasons.push(license.reason);
  if (!stripHtml(candidate.author)) reasons.push("creator is missing");
  if (!isSafeHttpsUrl(candidate.sourceUrl)) reasons.push("source page is not HTTPS");
  if (!isSafeHttpsUrl(candidate.imageUrl)) reasons.push("image URL is not HTTPS");
  if (!/^image\/(jpeg|png|webp)$/i.test(candidate.mime ?? "image/jpeg")) {
    reasons.push(`unsupported media type: ${candidate.mime || "unknown"}`);
  }
  const score = scoreCandidate(candidate, query);
  return {
    ...candidate,
    author: stripHtml(candidate.author),
    title: stripHtml(candidate.title),
    description: stripHtml(candidate.description),
    license,
    query,
    score,
    accepted: reasons.length === 0,
    rejectionReasons: reasons,
  };
}

async function searchCommons(query, limit) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime",
    iiurlwidth: "1600",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) throw new Error(`Commons search failed: ${response.status}`);
  const json = await response.json();
  return Object.values(json.query?.pages ?? {}).map((page) => {
    const info = page.imageinfo?.[0] ?? {};
    const meta = info.extmetadata ?? {};
    return {
      id: candidateId("commons", page.pageid ?? page.title),
      provider: "wikimedia-commons",
      providerId: String(page.pageid ?? ""),
      title: String(page.title ?? "").replace(/^File:/, ""),
      description: meta.ImageDescription?.value ?? "",
      author: meta.Artist?.value || meta.Credit?.value || "",
      rawLicense: meta.LicenseShortName?.value ?? "",
      licenseUrl: meta.LicenseUrl?.value ?? "",
      sourceUrl: info.descriptionurl ?? "",
      imageUrl: info.thumburl || info.url || "",
      originalUrl: info.url ?? "",
      width: info.thumbwidth || info.width || null,
      height: info.thumbheight || info.height || null,
      mime: info.mime ?? "",
      category: "photograph",
      tags: [],
      acquisitionNote:
        "Wikimedia Commons generated preview; Bean Wiki stores the selected file without further visual edits.",
    };
  });
}

async function searchOpenverse(query, limit) {
  const params = new URLSearchParams({
    q: query,
    page_size: String(limit),
    license: "by,by-sa,cc0,pdm",
    mature: "false",
    filter_dead: "true",
  });
  const response = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) throw new Error(`Openverse search failed: ${response.status}`);
  const json = await response.json();
  return (json.results ?? []).map((item) => ({
    id: candidateId("openverse", item.id),
    provider: "openverse",
    providerId: item.id,
    title: item.title ?? "",
    description: "",
    author: item.creator ?? "",
    rawLicense: [item.license, item.license_version].filter(Boolean).join(" "),
    licenseUrl: item.license_url ?? "",
    sourceUrl: item.foreign_landing_url ?? "",
    imageUrl: item.url ?? "",
    originalUrl: item.url ?? "",
    width: item.width ?? null,
    height: item.height ?? null,
    mime: inferImageMime(item.filetype, item.url),
    category: item.category ?? "",
    tags: (item.tags ?? []).map((tag) => tag.name).filter(Boolean),
    acquisitionNote:
      "Openverse indexed original; verify the provider landing page again immediately before selection.",
  }));
}

function deduplicate(candidates) {
  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.sourceUrl}|${candidate.originalUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.slug || !/^[a-z0-9-]+$/.test(args.slug)) {
    throw new Error("--slug must be a lowercase article slug");
  }
  if (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 40) {
    throw new Error("--limit must be an integer between 1 and 40");
  }

  const articlePath = join(root, "src", "content", "articles", `${args.slug}.html`);
  const articleSource = readFileSync(articlePath, "utf8");
  const articleTitle = articleSource.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? args.slug;
  const plan = plans[args.slug] ?? null;
  const queries = args.queries.length ? args.queries : plan?.queries ?? [];
  if (!queries.length) {
    throw new Error("no query: add --query or an entry to image-research-plans.json");
  }

  const allCandidates = [];
  const sourceErrors = [];
  for (const query of queries) {
    const searches = await Promise.allSettled([
      searchCommons(query, args.limit),
      searchOpenverse(query, args.limit),
    ]);
    for (const result of searches) {
      if (result.status === "fulfilled") {
        allCandidates.push(
          ...result.value.map((candidate) => approveCandidate(candidate, query)),
        );
      } else {
        sourceErrors.push({ query, message: result.reason?.message ?? String(result.reason) });
      }
    }
  }

  const candidates = deduplicate(allCandidates).sort(
    (left, right) =>
      Number(right.accepted) - Number(left.accepted) ||
      right.score - left.score ||
      left.title.localeCompare(right.title),
  );
  const accepted = candidates.filter((candidate) => candidate.accepted);
  const outputPath = resolve(
    root,
    args.output ??
      join(".artifacts", "image-research", `${args.slug}-${new Date().toISOString().slice(0, 10)}.json`),
  );
  const report = {
    schemaVersion: 1,
    article: { slug: args.slug, title: articleTitle },
    researchedAt: new Date().toISOString(),
    policy: {
      acceptedLicenses: ["CC0", "Public Domain", "CC BY", "CC BY-SA"],
      automatedSources: ["Wikimedia Commons", "Openverse"],
      excludedSources: [
        "arbitrary web image search without machine-readable rights",
        "Unsplash automated batch search",
      ],
      publicationMode: "research only; selection, local acquisition, and article edits are separate",
    },
    plan,
    queries,
    sourceErrors,
    summary: {
      total: candidates.length,
      accepted: accepted.length,
      rejected: candidates.length - accepted.length,
    },
    candidates,
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `✓ image research: ${accepted.length}/${candidates.length} licensed candidates for ${args.slug}`,
  );
  for (const candidate of accepted.slice(0, 8)) {
    console.log(
      `  ${candidate.id} · ${candidate.score} · ${candidate.license.label} · ${candidate.title}`,
    );
  }
  if (sourceErrors.length) {
    console.warn(`  ${sourceErrors.length} source request(s) failed; see report`);
  }
  console.log(`  report: ${outputPath}`);
}

main().catch((error) => {
  console.error(`✗ image research: ${error.message}`);
  process.exit(1);
});
