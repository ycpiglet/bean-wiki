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
  // Strip inline tags (links, bold, …) so the outline holds clean text for the
  // TOC and search haystack. The current corpus has no inline markup, so this
  // is a no-op there.
  const plain = (html) => unescapeHtml(html.replace(/<[^>]+>/g, "").trim());
  const pushText = (raw) => {
    if (!cur) return;
    cur.paragraphs.push(plain(raw));
  };
  const pushPoints = (listInner) => {
    if (!cur) return;
    const items = [];
    const re = /<li>([\s\S]*?)<\/li>/g;
    let m;
    while ((m = re.exec(listInner)) !== null) items.push(plain(m[1]));
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

// --- Editor <-> source (used by the save API and the /edit page) -----------

// Allowlisted tags and their permitted attributes. Anything else is unwrapped
// (tag stripped, text kept). Editors are authenticated, but the body is
// rendered with dangerouslySetInnerHTML, so this is defense-in-depth.
const ALLOWED = {
  h2: ["id"],
  h3: [],
  p: [],
  ul: [],
  ol: [],
  li: [],
  blockquote: [],
  strong: [],
  em: [],
  s: [],
  code: [],
  br: [],
  a: ["href", "data-wikilink", "data-slug", "target", "rel", "class"],
  figure: ["class", "data-author", "data-license", "data-source"],
  figcaption: [],
  img: ["src", "alt", "width"],
};
const SELF_CLOSING = new Set(["br", "img"]);
const BLOCK_TAGS = new Set([
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "blockquote",
  "figure",
]);

function safeUrl(value) {
  const v = String(value).trim();
  // Allow relative URLs and a safe scheme allowlist; reject javascript:, etc.
  if (/^(https?:\/\/|mailto:|\/|#|\.\/|\.\.\/)/i.test(v)) return v;
  if (/^[^:]+$/.test(v)) return v; // bare relative path, no scheme
  return null;
}

// Allowlist-sanitize an HTML fragment. Drops <script>/<style>, comments, and
// event-handler / unsafe-URL attributes; unwraps disallowed tags.
export function sanitizeArticleHtml(html) {
  const out = String(html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?(script|style)\b[\s\S]*?>/gi, "");

  return out.replace(
    /<(\/?)([a-zA-Z0-9]+)((?:\s+[^<>]*?)?)\s*\/?>/g,
    (match, close, rawName, attrs) => {
      const name = rawName.toLowerCase();
      const allowedAttrs = ALLOWED[name];
      if (!allowedAttrs) return ""; // unwrap disallowed tag, keep inner text
      if (close) return `</${name}>`;

      let kept = "";
      const attrRe = /([a-zA-Z0-9-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|(\S+)))?/g;
      let a;
      while ((a = attrRe.exec(attrs)) !== null) {
        const attr = a[1].toLowerCase();
        if (!allowedAttrs.includes(attr)) continue;
        const value = a[3] ?? a[4] ?? a[5] ?? "";
        if (attr === "href" || attr === "src") {
          const url = safeUrl(value);
          if (url === null) continue;
          kept += ` ${attr}="${url.replace(/"/g, "&quot;")}"`;
        } else {
          kept += ` ${attr}="${String(value).replace(/"/g, "&quot;")}"`;
        }
      }
      const slash = SELF_CLOSING.has(name) ? " /" : "";
      return `<${name}${kept}${slash}>`;
    },
  );
}

// Split an HTML fragment into its top-level block strings, tracking nesting so
// a list (or figure) with nested children stays one block. Text outside any
// block is dropped (the editor wraps prose in <p>).
export function splitTopLevelBlocks(html) {
  const blocks = [];
  let depth = 0;
  let start = -1;
  const tagRe = /<(\/?)([a-zA-Z0-9]+)[^>]*?(\/?)>/g;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const [full, close, rawName, selfClose] = m;
    const name = rawName.toLowerCase();
    if (SELF_CLOSING.has(name) || selfClose) {
      if (depth === 0 && BLOCK_TAGS.has(name)) blocks.push(full);
      continue;
    }
    if (close) {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        blocks.push(html.slice(start, m.index + full.length));
        start = -1;
      }
    } else {
      if (depth === 0 && BLOCK_TAGS.has(name)) start = m.index;
      depth += 1;
    }
  }
  return blocks;
}

// Convert the editor's HTML output into a canonical source body: sanitize,
// split into top-level blocks, assign stable ids to <h2> headings (preserving
// any the editor kept, slugifying the rest), and normalize to one block/line.
export function editorHtmlToSourceBody(html) {
  const clean = sanitizeArticleHtml(html);
  const blocks = splitTopLevelBlocks(clean);
  const usedIds = new Set();
  const lines = [];
  let n = 0;
  for (const block of blocks) {
    const h2 = block.match(/^<h2([^>]*)>([\s\S]*)<\/h2>$/);
    if (h2) {
      n += 1;
      const existing = h2[1].match(/\bid="([^"]*)"/);
      const inner = h2[2];
      let id = existing ? existing[1] : slugifyHeading(inner);
      if (!id) id = `section-${n}`;
      let unique = id;
      let i = 2;
      while (usedIds.has(unique)) unique = `${id}-${i++}`;
      usedIds.add(unique);
      lines.push(`<h2 id="${unique}">${inner}</h2>`);
    } else {
      lines.push(block);
    }
  }
  return lines.join("\n");
}

// Seed the editor from a published bodyHtml: strip the section wrapper and
// index badge, lifting each section id back onto its <h2> so ids survive an
// edit round-trip.
export function bodyHtmlToEditorHtml(bodyHtml) {
  return bodyHtml
    .replace(/<span class="content-index">\d+<\/span>/g, "")
    .replace(/<section id="([^"]*)"><h2>/g, '<h2 id="$1">')
    .replace(/<\/section>/g, "");
}

// --- Wikilinks (internal links) --------------------------------------------

// Internal links are stored as <a data-wikilink="<slug>" href="/wiki/<slug>">.
// Collect the distinct target slugs referenced in a body.
export function extractWikilinks(bodyHtml) {
  const slugs = new Set();
  const re = /data-wikilink="([^"]*)"/g;
  let m;
  while ((m = re.exec(bodyHtml)) !== null) if (m[1]) slugs.add(m[1]);
  return [...slugs];
}

// Rewrite internal links whose target does not exist into "red links": a
// distinct style pointing at the create-article route, mirroring MediaWiki. A
// broken link is a feature (it invites creation), not an error. `exists` is a
// predicate over slugs.
export function annotateRedLinks(bodyHtml, exists) {
  return bodyHtml.replace(/<a\b([^>]*)>/g, (full, attrs) => {
    const m = attrs.match(/data-wikilink="([^"]*)"/);
    if (!m || !m[1]) return full;
    if (exists(m[1])) return full;
    return `<a class="is-redlink" href="/edit/${m[1]}" data-wikilink="${m[1]}">`;
  });
}

// --- Heading ids -----------------------------------------------------------

// Slugify a heading title into an anchor id. Unicode-aware: keeps letters and
// numbers of any script (Korean headings stay meaningful), lowercases Latin,
// collapses whitespace to hyphens. Returns "" when nothing usable remains.
export function slugifyHeading(title) {
  return unescapeHtml(String(title))
    .replace(/<[^>]+>/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
