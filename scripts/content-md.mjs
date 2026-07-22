// Shared markdown <-> Article serialization for the content pipeline.
// Frontmatter: `key: value`. Structured keys (related/tags/history) carry a JSON
// value; all other keys are raw single-line strings. Body: `## Title {#id}`
// sections, blank-line-separated paragraphs, and a trailing `- ` bullet list
// becomes `points`.

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

export function articleToMarkdown(a) {
  const fm = [];
  for (const key of SCALARS) fm.push(`${key}: ${a[key]}`);
  fm.push(`related: ${JSON.stringify(a.related)}`);
  if (a.tags) fm.push(`tags: ${JSON.stringify(a.tags)}`);
  if (a.history) fm.push(`history: ${JSON.stringify(a.history)}`);

  let body = "";
  for (const s of a.sections) {
    body += `\n## ${s.title} {#${s.id}}\n\n`;
    body += s.paragraphs.join("\n\n");
    if (s.points && s.points.length) {
      body += "\n\n" + s.points.map((p) => `- ${p}`).join("\n");
    }
    body += "\n";
  }

  return `---\n${fm.join("\n")}\n---\n${body}`;
}

export function markdownToArticle(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("missing frontmatter");
  const [, fmBlock, bodyBlock] = match;

  const fm = {};
  for (const line of fmBlock.split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(": ");
    if (idx === -1) throw new Error(`bad frontmatter line: ${line}`);
    const key = line.slice(0, idx);
    const raw = line.slice(idx + 2);
    fm[key] = STRUCTURED.has(key) ? JSON.parse(raw) : raw;
  }

  const sections = [];
  let cur = null;
  let buf = [];
  const flush = () => {
    if (!cur) return;
    const blocks = [];
    let block = [];
    for (const l of buf) {
      if (l.trim() === "") {
        if (block.length) blocks.push(block);
        block = [];
      } else {
        block.push(l);
      }
    }
    if (block.length) blocks.push(block);

    const paragraphs = [];
    let points;
    for (const b of blocks) {
      if (b.every((l) => l.startsWith("- "))) {
        // The Article model has ONE points list per section. A silent overwrite
        // would lose content, so fail loudly instead.
        if (points) {
          throw new Error(
            `section "${cur.id}" has more than one bullet list; merge them into one`,
          );
        }
        points = b.map((l) => l.slice(2));
      } else {
        paragraphs.push(b.join("\n"));
      }
    }
    cur.paragraphs = paragraphs;
    if (points) cur.points = points;
    sections.push(cur);
  };

  for (const line of bodyBlock.split("\n")) {
    const h = line.match(/^## (.+?) \{#([\w-]+)\}$/);
    if (h) {
      // Reject ambiguous titles: "## A {#x} B {#y}" would silently parse the
      // title as "A {#x} B" via regex backtracking.
      if (h[1].includes("{#")) {
        throw new Error(
          `section title may not contain "{#" (line: ${line})`,
        );
      }
      flush();
      cur = { id: h[2], title: h[1], paragraphs: [] };
      buf = [];
    } else if (cur) {
      buf.push(line);
    }
  }
  flush();

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
    sections,
    related: fm.related,
  };
  if (fm.tags) article.tags = fm.tags;
  if (fm.history) article.history = fm.history;
  return article;
}

// Escape text for safe interpolation into generated HTML bodies.
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Render an Article's sections to a semantic HTML body. Markup mirrors the
// former React render (section > .content-index + h2 + p… + ul>li) exactly, so
// switching the article page to dangerouslySetInnerHTML is a visual no-op. This
// HTML is the representation the in-browser editor reads and (later) writes.
export function sectionsToHtml(sections) {
  return sections
    .map((s, i) => {
      const index = String(i + 1).padStart(2, "0");
      let html = `<section id="${escapeHtml(s.id)}">`;
      html += `<span class="content-index">${index}</span>`;
      html += `<h2>${escapeHtml(s.title)}</h2>`;
      for (const paragraph of s.paragraphs) {
        html += `<p>${escapeHtml(paragraph)}</p>`;
      }
      if (s.points && s.points.length) {
        html += `<ul>${s.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`;
      }
      html += `</section>`;
      return html;
    })
    .join("");
}

// Order-independent structural stringify for equivalence checks.
export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
