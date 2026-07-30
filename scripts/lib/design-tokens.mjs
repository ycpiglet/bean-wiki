const TOKEN_NAME = /^--[a-z][a-z0-9-]*$/;
const UPPER_HEX = /^#[0-9A-F]{6}$/;
const CSS_FUNCTION_VALUE =
  /^(?:rgba?\(\s*[0-9.]+(?:\s*,\s*[0-9.]+){2}(?:\s*,\s*(?:0|1|0?\.[0-9]+))?\s*\)|var\(--[a-z][a-z0-9-]*\))$/;
const GATE_ID = /^[a-z0-9][a-z0-9._-]{0,63}$/;

export const GENERATED_TOKEN_START = "/* BEGIN GENERATED DESIGN TOKENS */";
export const GENERATED_TOKEN_END = "/* END GENERATED DESIGN TOKENS */";
export const PUBLIC_SWATCH_COUNT = 42;
export const SEMANTIC_TOKEN_COUNT = 9;
export const RUNTIME_CSS_TOKEN_ALLOWLIST = new Set([
  "--font-geist-mono",
  "--font-geist-sans",
  "--font-palette-name",
]);
export const PRINT_TOKEN_OVERRIDES = new Map([
  ["--paper", "#ffffff"],
  ["--cream", "#ffffff"],
  ["--ink", "#000000"],
  ["--muted", "#333333"],
  ["--line", "rgba(0, 0, 0, 0.25)"],
]);
export const REQUIRED_CODEOWNER_PATTERNS = [
  "/.github/CODEOWNERS",
  "/.github/workflows/ci.yml",
  "/agents/host/MERGE-GATES.json",
  "/docs/DESIGN.md",
  "/package-lock.json",
  "/package.json",
  "/playwright.config.ts",
  "/scripts/check-design-contract.mjs",
  "/scripts/generate-design-tokens.mjs",
  "/scripts/lib/design-tokens.mjs",
  "/src/app/design/",
  "/src/app/globals.css",
  "/src/app/layout.tsx",
  "/src/components/",
  "/src/design/",
  "/tests/design-contract.test.mjs",
  "/tests/visual/",
];
export const REQUIRED_PROTECTED_PATHS = [
  ".github/CODEOWNERS",
  ".github/workflows/ci.yml",
  "agents/host/MERGE-GATES.json",
  "package-lock.json",
  "package.json",
  "playwright.config.ts",
  "scripts/check-brand-colors.mjs",
  "scripts/check-design-contract.mjs",
  "scripts/generate-design-tokens.mjs",
  "scripts/lib/design-tokens.mjs",
  "tests/brand-colors.test.mjs",
  "tests/design-contract.test.mjs",
  "tests/visual/**",
];
export const REQUIRED_MERGE_GATE_PATHS = {
  "design-contract": [
    ".github/CODEOWNERS",
    ".github/workflows/ci.yml",
    "agents/host/MERGE-GATES.json",
    "docs/DESIGN.md",
    "package-lock.json",
    "package.json",
    "playwright.config.ts",
    "scripts/check-design-contract.mjs",
    "scripts/generate-design-tokens.mjs",
    "scripts/lib/design-tokens.mjs",
    "src/app/design/**",
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/components/**",
    "src/design/**",
    "tests/design-contract.test.mjs",
    "tests/visual/**",
  ],
  "design-visual": [
    "next.config.ts",
    "package-lock.json",
    "package.json",
    "playwright.config.ts",
    "postcss.config.mjs",
    "public/**",
    "src/app/**",
    "src/components/**",
    "src/content/categories.ts",
    "src/design/**",
    "tests/visual/**",
  ],
};

function addUnique(errors, seen, label, value) {
  if (seen.has(value)) errors.push(`duplicate ${label}: "${value}"`);
  seen.add(value);
}

function validCssValue(value) {
  return UPPER_HEX.test(value) || CSS_FUNCTION_VALUE.test(value);
}

function publicSwatches(palette) {
  return (palette?.groups ?? []).flatMap((group) => group.swatches ?? []);
}

function tokenEntryFromSwatch(swatch) {
  return {
    token: swatch.token,
    light: swatch.hex,
    dark: swatch.darkHex,
    role: swatch.story,
    source: "public-swatch",
  };
}

function tokenEntryFromSemantic(token) {
  return {
    token: token.token,
    light: token.light,
    dark: token.dark,
    role: token.role,
    source: "semantic-token",
  };
}

export function validateDesignTokenData(palette) {
  const errors = [];
  const swatches = publicSwatches(palette);
  const semanticTokens = palette?.semanticTokens ?? [];
  const runtimeOrder = palette?.runtimeTokenOrder ?? [];
  const tokenNames = new Set();
  const entriesByToken = new Map();

  if (palette?.runtimeTokenVersion !== 1) {
    errors.push("runtimeTokenVersion must be 1");
  }
  if (swatches.length !== PUBLIC_SWATCH_COUNT) {
    errors.push(
      `public palette must contain ${PUBLIC_SWATCH_COUNT} swatches; found ${swatches.length}`,
    );
  }
  if (!Array.isArray(semanticTokens)) {
    errors.push("semanticTokens must be an array");
  } else if (semanticTokens.length !== SEMANTIC_TOKEN_COUNT) {
    errors.push(
      `semanticTokens must contain ${SEMANTIC_TOKEN_COUNT} entries; found ${semanticTokens.length}`,
    );
  }

  for (const entry of [
    ...swatches.map(tokenEntryFromSwatch),
    ...(Array.isArray(semanticTokens)
      ? semanticTokens.map(tokenEntryFromSemantic)
      : []),
  ]) {
    if (!TOKEN_NAME.test(entry.token ?? "")) {
      errors.push(`invalid design token name: "${entry.token ?? ""}"`);
      continue;
    }
    addUnique(errors, tokenNames, "design token", entry.token);
    if (!validCssValue(entry.light ?? "")) {
      errors.push(
        `${entry.token}: light value must be uppercase #RRGGBB, rgb(a), or var(--token)`,
      );
    }
    if (!validCssValue(entry.dark ?? "")) {
      errors.push(
        `${entry.token}: dark value must be uppercase #RRGGBB, rgb(a), or var(--token)`,
      );
    }
    if (typeof entry.role !== "string" || !entry.role.trim()) {
      errors.push(`${entry.token}: role must be a non-empty string`);
    }
    entriesByToken.set(entry.token, entry);
  }

  if (!Array.isArray(runtimeOrder)) {
    errors.push("runtimeTokenOrder must be an array");
  } else {
    const orderedNames = new Set();
    for (const token of runtimeOrder) {
      if (!TOKEN_NAME.test(token ?? "")) {
        errors.push(`runtimeTokenOrder contains invalid token: "${token ?? ""}"`);
        continue;
      }
      addUnique(errors, orderedNames, "runtimeTokenOrder entry", token);
      if (!entriesByToken.has(token)) {
        errors.push(`runtimeTokenOrder references unknown token: "${token}"`);
      }
    }
    for (const token of entriesByToken.keys()) {
      if (!orderedNames.has(token)) {
        errors.push(`runtimeTokenOrder is missing canonical token: "${token}"`);
      }
    }
  }

  for (const entry of entriesByToken.values()) {
    for (const [theme, value] of [
      ["light", entry.light],
      ["dark", entry.dark],
    ]) {
      const alias = /^var\((--[a-z][a-z0-9-]*)\)$/.exec(value ?? "");
      if (alias && !entriesByToken.has(alias[1])) {
        errors.push(
          `${entry.token}: ${theme} alias references unknown token "${alias[1]}"`,
        );
      }
      if (alias && alias[1] === entry.token) {
        errors.push(`${entry.token}: ${theme} alias cannot reference itself`);
      }
    }
  }

  for (const theme of ["light", "dark"]) {
    const visited = new Set();
    const visiting = new Set();
    const visit = (token, path) => {
      if (visited.has(token)) return;
      if (visiting.has(token)) {
        errors.push(
          `${theme} alias cycle: ${[...path, token].join(" -> ")}`,
        );
        return;
      }
      visiting.add(token);
      const value = entriesByToken.get(token)?.[theme] ?? "";
      const alias = /^var\((--[a-z][a-z0-9-]*)\)$/.exec(value);
      if (alias && entriesByToken.has(alias[1])) {
        visit(alias[1], [...path, token]);
      }
      visiting.delete(token);
      visited.add(token);
    };
    for (const token of entriesByToken.keys()) visit(token, []);
  }

  const entries = Array.isArray(runtimeOrder)
    ? runtimeOrder
        .map((token) => entriesByToken.get(token))
        .filter((entry) => entry !== undefined)
    : [...entriesByToken.values()];
  return { errors, entries };
}

function cssValue(value) {
  return UPPER_HEX.test(value) ? value.toLowerCase() : value;
}

function renderTheme(selector, entries, valueKey) {
  const declarations = entries
    .map((entry) => `  ${entry.token}: ${cssValue(entry[valueKey])};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
}

export function renderDesignTokenBlock(palette) {
  const { errors, entries } = validateDesignTokenData(palette);
  if (errors.length) {
    throw new Error(`invalid design token data:\n- ${errors.join("\n- ")}`);
  }
  return [
    GENERATED_TOKEN_START,
    "/* Source: src/design/brand-colors.json",
    " * Update only with: node scripts/generate-design-tokens.mjs",
    " * Manual edits inside this block are rejected by design:check.",
    " */",
    renderTheme(":root", entries, "light"),
    "",
    renderTheme('[data-theme="dark"]', entries, "dark"),
    GENERATED_TOKEN_END,
  ].join("\n");
}

export function generatedTokenBlockRange(css) {
  const start = css.indexOf(GENERATED_TOKEN_START);
  const endMarker = css.indexOf(GENERATED_TOKEN_END);
  if (start < 0 || endMarker < 0) {
    throw new Error(
      `globals.css must contain ${GENERATED_TOKEN_START} and ${GENERATED_TOKEN_END}`,
    );
  }
  if (
    css.indexOf(GENERATED_TOKEN_START, start + GENERATED_TOKEN_START.length) >= 0 ||
    css.indexOf(GENERATED_TOKEN_END, endMarker + GENERATED_TOKEN_END.length) >= 0
  ) {
    throw new Error("globals.css must contain exactly one generated token block");
  }
  if (endMarker < start) {
    throw new Error("generated token block markers are out of order");
  }
  return {
    start,
    end: endMarker + GENERATED_TOKEN_END.length,
  };
}

export function extractGeneratedTokenBlock(css) {
  const range = generatedTokenBlockRange(css);
  return css.slice(range.start, range.end);
}

export function replaceGeneratedTokenBlock(css, block) {
  const range = generatedTokenBlockRange(css);
  return css.slice(0, range.start) + block + css.slice(range.end);
}

export function findUndefinedCssTokens(css, allowlist = RUNTIME_CSS_TOKEN_ALLOWLIST) {
  const definitions = new Set(
    [...css.matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)].map((match) => match[1]),
  );
  const uses = new Set(
    [...css.matchAll(/var\(\s*(--[a-z][a-z0-9-]*)/g)].map(
      (match) => match[1],
    ),
  );
  return [...uses]
    .filter((token) => !definitions.has(token) && !allowlist.has(token))
    .sort();
}

function atRuleRanges(css, pattern) {
  const ranges = [];
  for (const match of css.matchAll(pattern)) {
    const open = css.indexOf("{", match.index);
    if (open < 0) continue;
    let depth = 0;
    for (let index = open; index < css.length; index += 1) {
      if (css[index] === "{") depth += 1;
      else if (css[index] === "}") {
        depth -= 1;
        if (depth === 0) {
          ranges.push({ start: match.index, end: index + 1 });
          break;
        }
      }
    }
  }
  return ranges;
}

function insideRange(index, ranges) {
  return ranges.some((range) => index >= range.start && index < range.end);
}

export function findUnexpectedCanonicalTokenOverrides(css, canonicalEntries) {
  const generated = generatedTokenBlockRange(css);
  const printRanges = atRuleRanges(css, /@media\s+print\s*\{/g);
  const canonical = new Set(canonicalEntries.map((entry) => entry.token));
  const findings = [];
  const definitions =
    /(--[a-z][a-z0-9-]*)\s*:\s*([^;{}]+);/g;

  for (const match of css.matchAll(definitions)) {
    const token = match[1];
    if (!canonical.has(token)) continue;
    if (match.index >= generated.start && match.index < generated.end) continue;
    const value = match[2].trim().toLowerCase();
    const allowedPrintValue = PRINT_TOKEN_OVERRIDES.get(token);
    if (
      insideRange(match.index, printRanges) &&
      allowedPrintValue === value
    ) {
      continue;
    }
    findings.push(
      `${token} is redefined outside the generated block at offset ${match.index}`,
    );
  }
  return findings;
}

function validatePathPattern(errors, gateId, field, value) {
  if (
    typeof value !== "string" ||
    !value ||
    value.startsWith("/") ||
    value.includes("\\") ||
    value.split("/").includes("..")
  ) {
    errors.push(
      `${gateId}: ${field} entries must be normalized repository-relative paths`,
    );
  }
}

export function validateMergeGatePolicy(policy) {
  const errors = [];
  if (
    typeof policy !== "object" ||
    policy === null ||
    Array.isArray(policy)
  ) {
    return { errors: ["merge gate policy must be an object"], gates: [] };
  }
  if (policy.schema !== "agent-runtime-merge-gates/v1") {
    errors.push(
      'merge gate policy schema must be "agent-runtime-merge-gates/v1"',
    );
  }
  if (
    !Array.isArray(policy.protected_paths) ||
    !policy.protected_paths.length
  ) {
    errors.push("merge gate policy must contain protected_paths");
  } else {
    const paths = new Set();
    for (const path of policy.protected_paths) {
      validatePathPattern(errors, "policy", "protected_paths", path);
      addUnique(errors, paths, "policy protected path", path);
    }
    for (const path of REQUIRED_PROTECTED_PATHS) {
      if (!paths.has(path)) {
        errors.push(`protected_paths is missing required path "${path}"`);
      }
    }
  }
  if (!Array.isArray(policy.gates) || !policy.gates.length) {
    errors.push("merge gate policy must contain at least one gate");
    return { errors, gates: [] };
  }

  const ids = new Set();
  for (const gate of policy.gates) {
    const id = gate?.id;
    if (!GATE_ID.test(id ?? "")) {
      errors.push(`invalid merge gate id: "${id ?? ""}"`);
      continue;
    }
    addUnique(errors, ids, "merge gate id", id);
    if (
      typeof gate.command !== "string" ||
      !gate.command.trim() ||
      /[\r\n]/.test(gate.command)
    ) {
      errors.push(`${id}: command must be one non-empty line`);
    }
    if (!Array.isArray(gate.include_paths) || !gate.include_paths.length) {
      errors.push(`${id}: include_paths must be a non-empty array`);
    } else {
      const paths = new Set();
      for (const path of gate.include_paths) {
        validatePathPattern(errors, id, "include_paths", path);
        addUnique(errors, paths, `${id} include path`, path);
      }
    }
    if (gate.exclude_paths !== undefined) {
      if (!Array.isArray(gate.exclude_paths)) {
        errors.push(`${id}: exclude_paths must be an array when present`);
      } else {
        const paths = new Set();
        for (const path of gate.exclude_paths) {
          validatePathPattern(errors, id, "exclude_paths", path);
          addUnique(errors, paths, `${id} exclude path`, path);
        }
      }
    }
  }

  const expectedCommands = new Map([
    ["design-contract", "npm run design:check"],
    ["design-visual", "npm run design:visual"],
  ]);
  for (const [id, command] of expectedCommands) {
    const gate = policy.gates.find((candidate) => candidate?.id === id);
    if (!gate) errors.push(`required merge gate is missing: "${id}"`);
    else if (gate.command !== command) {
      errors.push(`${id}: command must be exactly "${command}"`);
    } else {
      const configured = new Set(gate.include_paths ?? []);
      for (const path of REQUIRED_MERGE_GATE_PATHS[id]) {
        if (!configured.has(path)) {
          errors.push(`${id}: include_paths is missing required path "${path}"`);
        }
      }
    }
  }
  const visualGate = policy.gates.find(
    (candidate) => candidate?.id === "design-visual",
  );
  if (
    visualGate &&
    !(visualGate.exclude_paths ?? []).includes("src/app/api/**")
  ) {
    errors.push(
      'design-visual: exclude_paths must include "src/app/api/**"',
    );
  }
  return { errors, gates: policy.gates };
}

export function parseCodeowners(source) {
  const entries = new Map();
  const errors = [];
  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const [pattern, ...owners] = line.split(/\s+/);
    if (!pattern || !owners.length) {
      errors.push(`CODEOWNERS line ${index + 1} must include a path and owner`);
      continue;
    }
    if (entries.has(pattern)) {
      errors.push(`CODEOWNERS contains duplicate pattern: "${pattern}"`);
    }
    if (owners.some((owner) => !owner.startsWith("@"))) {
      errors.push(`CODEOWNERS line ${index + 1} contains an invalid owner`);
    }
    entries.set(pattern, owners);
  }
  return { entries, errors };
}

export function validateCodeowners(
  source,
  requiredPatterns = REQUIRED_CODEOWNER_PATTERNS,
) {
  const { entries, errors } = parseCodeowners(source);
  for (const pattern of requiredPatterns) {
    const owners = entries.get(pattern);
    if (!owners) {
      errors.push(`CODEOWNERS is missing required design path: "${pattern}"`);
    } else if (!owners.includes("@ycpiglet")) {
      errors.push(`${pattern}: design owner must include @ycpiglet`);
    }
  }
  return { entries, errors };
}
