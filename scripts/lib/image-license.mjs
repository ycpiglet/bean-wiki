const BLOCKED_LICENSE_PATTERNS = [
  /\b(?:by-)?nc(?:-|$|\b)/i,
  /\bnon-?commercial\b/i,
  /\b(?:by-)?nd(?:-|$|\b)/i,
  /\bno-?derivatives?\b/i,
  /\ball rights reserved\b/i,
  /\bfair use\b/i,
  /\bunknown\b/i,
  /\bsee source\b/i,
];

const LICENSE_RULES = [
  {
    id: "cc0",
    label: "CC0",
    pattern: /\bcc\s*0\b|\bcc0\b|publicdomain\/zero/i,
    requiresAttribution: false,
    shareAlike: false,
  },
  {
    id: "pdm",
    label: "Public Domain",
    pattern: /\bpublic domain\b|\bpdm\b|publicdomain\/mark/i,
    requiresAttribution: false,
    shareAlike: false,
  },
  {
    id: "cc-by-sa",
    label: "CC BY-SA",
    pattern:
      /\bcc\s*by[- ]sa\b|\bby-sa\b|licenses\/by-sa|attribution[- ]share\s*alike/i,
    requiresAttribution: true,
    shareAlike: true,
  },
  {
    id: "cc-by",
    label: "CC BY",
    pattern: /\bcc\s*by\b|\battribution\b|licenses\/by\//i,
    requiresAttribution: true,
    shareAlike: false,
  },
];

export function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function assessImageLicense(rawLicense, licenseUrl = "") {
  const evidence = `${stripHtml(rawLicense)} ${String(licenseUrl)}`.trim();
  const blocked = BLOCKED_LICENSE_PATTERNS.find((pattern) => pattern.test(evidence));
  if (blocked) {
    return {
      allowed: false,
      reason: "non-commercial, no-derivatives, fair-use, or unclear terms",
      raw: stripHtml(rawLicense),
      url: String(licenseUrl || ""),
    };
  }

  const rule = LICENSE_RULES.find((candidate) => candidate.pattern.test(evidence));
  if (!rule) {
    return {
      allowed: false,
      reason: "license is not in the approved allowlist",
      raw: stripHtml(rawLicense),
      url: String(licenseUrl || ""),
    };
  }

  const version =
    evidence.match(/\b([1-9]\d*(?:\.\d+)?)\b/)?.[1] ??
    String(licenseUrl).match(/\/([1-9]\d*(?:\.\d+)?)\/?$/)?.[1] ??
    null;
  return {
    allowed: true,
    id: rule.id,
    label: version ? `${rule.label} ${version}` : rule.label,
    version,
    url: canonicalLicenseUrl(rule.id, licenseUrl),
    requiresAttribution: rule.requiresAttribution,
    shareAlike: rule.shareAlike,
    allowsCommercialUse: true,
    allowsModification: true,
    raw: stripHtml(rawLicense),
  };
}

// Wikimedia/Openverse sometimes report an http:// license URL or omit it
// entirely for CC0/Public Domain works. The evidence gate requires HTTPS, so
// fall back to the canonical deed page for the identified license instead of
// failing an otherwise-valid candidate on a metadata quirk.
const CANONICAL_LICENSE_URLS = {
  cc0: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  pdm: "https://creativecommons.org/publicdomain/mark/1.0/",
};

function canonicalLicenseUrl(ruleId, licenseUrl) {
  const value = String(licenseUrl || "").trim();
  if (isSafeHttpsUrl(value)) return value;
  if (value.startsWith("http://")) {
    const upgraded = `https://${value.slice("http://".length)}`;
    if (isSafeHttpsUrl(upgraded)) return upgraded;
  }
  return CANONICAL_LICENSE_URLS[ruleId] ?? value;
}

export function isSafeHttpsUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildArticleFigure({
  src,
  alt,
  caption,
  author,
  license,
  sourceUrl,
}) {
  for (const [name, value] of Object.entries({
    src,
    alt,
    caption,
    author,
    license,
    sourceUrl,
  })) {
    if (!String(value ?? "").trim()) throw new Error(`figure is missing ${name}`);
  }
  if (!String(src).startsWith("/")) throw new Error("figure src must be a local path");
  if (!isSafeHttpsUrl(sourceUrl)) throw new Error("figure source must be HTTPS");

  const credit = `${author} · ${license}`;
  return [
    `<figure class="article-figure" data-author="${escapeHtml(author)}" data-license="${escapeHtml(license)}" data-source="${escapeHtml(sourceUrl)}">`,
    `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`,
    `<figcaption>${escapeHtml(caption)} <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer" class="figure-credit">${escapeHtml(credit)}</a></figcaption>`,
    "</figure>",
  ].join("");
}
