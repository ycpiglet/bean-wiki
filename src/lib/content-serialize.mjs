// Shared HTML <-> Article serialization for the content pipeline.
//
// The canonical article source is now HTML (the markdown pipeline is gone). A
// source file is frontmatter (`key: value`, structured keys carry JSON) plus a
// clean, semantic HTML body — exactly what the in-browser editor emits:
// `<h2 id>` section headings, `<p>`, `<ul>/<ol>`, `<h3>`, `<blockquote>`, with
// inline `<strong>/<em>/<s>/<a>`.
//
// At build time an Article is derived from a source file:
//   - `bodyHtml`  = renderSectionedHtml(body): the published render, wrapping
//     each `<h2>`-delimited run in `<section id>` + a numbered index badge.
//   - `sections`  = deriveSections(body): a heading/text outline used only for
//     the table of contents, the search haystack, and structural validation.
//
// This module is plain ESM JS (no TS, no framework imports) so the build
// scripts (`node scripts/*.mjs`), the content check, and the Next.js save API
// route all round-trip through the exact same code.

const STRUCTURED = new Set(["related", "tags", "history"]);
const SCALARS = [
  "slug",
  "title",
  "summary",
  "category",
  "level",
  "readingTime",
  "updatedAt",
  "accent",
  "fact",
];

// Escape text for safe interpolation into HTML. Mirrors the former markdown
// pipeline so migrated bodies are byte-identical to the previous output.
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Inverse of escapeHtml, for recovering raw text (TOC titles, search haystack).
export function unescapeHtml(html) {
  return String(html)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// --- Frontmatter -----------------------------------------------------------

export function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("missing frontmatter");
  const [, fmBlock, body] = match;

  const fm = {};
  for (const line of fmBlock.split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(": ");
    if (idx === -1) throw new Error(`bad frontmatter line: ${line}`);
    const key = line.slice(0, idx);
    const raw = line.slice(idx + 2);
    fm[key] = STRUCTURED.has(key) ? JSON.parse(raw) : raw;
  }
  return { fm, body };
}

function serializeFrontmatter(a) {
  const fm = [];
  for (const key of SCALARS) fm.push(`${key}: ${a[key]}`);
  fm.push(`related: ${JSON.stringify(a.related)}`);
  if (a.tags) fm.push(`tags: ${JSON.stringify(a.tags)}`);
  if (a.history) fm.push(`history: ${JSON.stringify(a.history)}`);
  return fm.join("\n");
}

// --- Body: block tokenizer -------------------------------------------------

// Split a clean HTML body into its top-level block strings. Sources store one
// block per line, so a line-based split is exact and cheap; blank lines are
// ignored.
export function tokenizeBlocks(body) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const H2_RE = /^<h2 id="([^"]*)">([\s\S]*)<\/h2>$/;

// --- Rendered (published) HTML ---------------------------------------------

// Wrap each `<h2>`-delimited run of blocks in a numbered `<section id>`. All
// non-heading blocks pass through verbatim, so richer blocks (lists, quotes,
// figures, sub-headings) survive untouched. Any content before the first
// heading is emitted outside a section.
export function renderSectionedHtml(body) {
  let html = "";
  let open = false;
  let count = 0;
  for (const block of tokenizeBlocks(body)) {
    const h2 = block.match(H2_RE);
    if (h2) {
      if (open) html += "</section>";
      count += 1;
      const index = String(count).padStart(2, "0");
      html += `<section id="${h2[1]}">`;
      html += `<span class="content-index">${index}</span>`;
      html += `<h2>${h2[2]}</h2>`;
      open = true;
    } else {
      html += block;
    }
  }
  if (open) html += "</section>";
  return html;
}

// --- Outline (TOC / search / validation) -----------------------------------

// Derive a heading/text outline from a clean HTML body. One entry per `<h2>`;
// paragraph-like blocks feed `paragraphs` and list items feed `points`. This is
// lossy by design — it exists for the table of contents, the search haystack,
// and ko/en structural checks, never for rendering.
export function deriveSections(body) {
  const sections = [];
  let cur = null;
  const pushText = (raw) => {
    if (!cur) return;
    cur.paragraphs.push(unescapeHtml(raw.trim()));
  };
  const pushPoints = (listInner) => {
    if (!cur) return;
    const items = [];
    const re = /<li>([\s\S]*?)<\/li>/g;
    let m;
    while ((m = re.exec(listInner)) !== null) items.push(unescapeHtml(m[1].trim()));
    if (!items.length) return;
    if (cur.points) cur.points.push(...items);
    else cur.points = items;
  };

  for (const block of tokenizeBlocks(body)) {
    const h2 = block.match(H2_RE);
    if (h2) {
      cur = { id: h2[1], title: unescapeHtml(h2[2].trim()), paragraphs: [] };
      sections.push(cur);
      continue;
    }
    let m;
    if ((m = block.match(/^<p>([\s\S]*)<\/p>$/))) pushText(m[1]);
    else if ((m = block.match(/^<h3>([\s\S]*)<\/h3>$/))) pushText(m[1]);
    else if ((m = block.match(/^<blockquote>([\s\S]*)<\/blockquote>$/))) pushText(m[1]);
    else if ((m = block.match(/^<[uo]l>([\s\S]*)<\/[uo]l>$/))) pushPoints(m[1]);
  }

  // Match the historical object shape: omit `points` when a section has none.
  return sections.map((s) => {
    const out = { id: s.id, title: s.title, paragraphs: s.paragraphs };
    if (s.points) out.points = s.points;
    return out;
  });
}

// --- Article <-> source ----------------------------------------------------

// Build an Article from a source file's text. Key order matches the historical
// generated shape so the codegen output stays byte-stable.
export function articleFromSource(source) {
  const { fm, body } = parseFrontmatter(source);
  const article = {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    category: fm.category,
    level: fm.level,
    readingTime: fm.readingTime,
    updatedAt: fm.updatedAt,
    accent: fm.accent,
    fact: fm.fact,
    sections: deriveSections(body),
    related: fm.related,
  };
  if (fm.tags) article.tags = fm.tags;
  if (fm.history) article.history = fm.history;
  article.bodyHtml = renderSectionedHtml(body);
  return article;
}

// Serialize an article + clean HTML body back to a source file's text.
export function serializeArticleSource(meta, body) {
  return `---\n${serializeFrontmatter(meta)}\n---\n${normalizeBody(body)}`;
}

// Normalize an HTML body to the on-disk convention: one top-level block per
// line, no blank lines. Idempotent.
export function normalizeBody(body) {
  return tokenizeBlocks(body).join("\n") + "\n";
}

// --- Heading ids (used by the save API) ------------------------------------

// Slugify a heading title into an anchor id. ASCII-lossy for non-Latin scripts,
// so callers fall back to a positional id when the result is empty.
export function slugifyHeading(title) {
  return unescapeHtml(title)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Order-independent structural stringify for round-trip equivalence checks.
export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
