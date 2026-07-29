// Render-time sanitisation for article bodies.
//
// Why this exists even though saving already sanitises: sanitizeArticleHtml()
// in content-serialize.mjs only runs on the editor's save path, and it is a
// regex allowlist. The normal way content reaches this repo is a git commit —
// an editor with push access, or a merged PR proposal — which never touches
// that code. So the *only* guaranteed chokepoint for HTML that is about to be
// handed to dangerouslySetInnerHTML is here, at render, using a real parser
// rather than regexes.
//
// The allowlist below is derived from what the corpus actually contains (a
// survey of all 110 ko+en article bodies) plus every tag the save-path
// allowlist permits, so sanitising is a no-op for legitimate content. Articles
// are prerendered, so this cost is paid at build time, not per request.
import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    // structure added by renderSectionedHtml()
    "section",
    "span",
    // block content
    "h2",
    "h3",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "figure",
    "figcaption",
    "div",
    // rich blocks: callout / toggle / table
    "aside",
    "details",
    "summary",
    "table",
    "thead",
    "tbody",
    "colgroup",
    "col",
    "tr",
    "th",
    "td",
    // inline
    "a",
    "strong",
    "em",
    "s",
    "code",
    "br",
    "img",
  ],
  allowedAttributes: {
    section: ["id"],
    span: ["class"],
    h2: ["id"],
    a: ["href", "data-wikilink", "data-slug", "target", "rel", "class"],
    figure: ["class", "data-author", "data-license", "data-source"],
    img: ["src", "alt", "width"],
    aside: ["class", "data-tone"],
    details: ["class"],
    div: ["class"],
    table: ["class"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  // Anything not listed here is dropped from href/src, so javascript:, data:
  // and vbscript: URLs cannot survive.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  // Drop disallowed elements *and* their contents for these, rather than
  // unwrapping to text — a <script> body should not become visible prose.
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  // Keep the corpus's existing entity/quote shape intact.
  parser: { lowerCaseTags: true, lowerCaseAttributeNames: true },
};

export function sanitizeRenderedHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
