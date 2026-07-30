#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractGeneratedTokenBlock,
  findUndefinedCssTokens,
  findUnexpectedCanonicalTokenOverrides,
  renderDesignTokenBlock,
  validateCodeowners,
  validateDesignTokenData,
  validateMergeGatePolicy,
} from "./lib/design-tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const paths = {
  palette: join(root, "src", "design", "brand-colors.json"),
  css: join(root, "src", "app", "globals.css"),
  mergeGates: join(root, "agents", "host", "MERGE-GATES.json"),
  codeowners: join(root, ".github", "CODEOWNERS"),
  designDocs: join(root, "docs", "DESIGN.md"),
};
const errors = [];

function readText(label, path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    errors.push(`${label} is unreadable: ${path} (${error.message})`);
    return "";
  }
}

function readJson(label, path) {
  const source = readText(label, path);
  if (!source) return {};
  try {
    return JSON.parse(source);
  } catch (error) {
    errors.push(`${label} is invalid JSON: ${path} (${error.message})`);
    return {};
  }
}

function collect(label, findings) {
  for (const finding of findings) errors.push(`${label}: ${finding}`);
}

const palette = readJson("design token SSOT", paths.palette);
const css = readText("runtime CSS", paths.css);
const mergeGates = readJson("host merge gate policy", paths.mergeGates);
const codeowners = readText("CODEOWNERS", paths.codeowners);
const designDocs = readText("design documentation", paths.designDocs);

const tokenResult = validateDesignTokenData(palette);
collect("design token SSOT", tokenResult.errors);

if (!tokenResult.errors.length && css) {
  try {
    const expected = renderDesignTokenBlock(palette);
    const actual = extractGeneratedTokenBlock(css);
    if (actual !== expected) {
      errors.push(
        "runtime CSS: generated token block drifted; run node scripts/generate-design-tokens.mjs",
      );
    }
  } catch (error) {
    errors.push(`runtime CSS: ${error.message}`);
  }
}

if (css) {
  const undefinedTokens = findUndefinedCssTokens(css);
  for (const token of undefinedTokens) {
    errors.push(
      `runtime CSS: ${token} is used but never defined; define it in the canonical token data or an explicit local scope`,
    );
  }
  if (!tokenResult.errors.length) {
    for (const finding of findUnexpectedCanonicalTokenOverrides(
      css,
      tokenResult.entries,
    )) {
      errors.push(`runtime CSS: ${finding}`);
    }
  }
}

collect("host merge gate policy", validateMergeGatePolicy(mergeGates).errors);
collect("CODEOWNERS", validateCodeowners(codeowners).errors);

for (const requiredText of [
  "src/design/brand-colors.json",
  "node scripts/generate-design-tokens.mjs",
  "npm run design:check",
  "npm run design:visual",
  "agents/host/MERGE-GATES.json",
  ".github/CODEOWNERS",
]) {
  if (!designDocs.includes(requiredText)) {
    errors.push(
      `design documentation: missing operational contract reference "${requiredText}"`,
    );
  }
}

if (errors.length) {
  console.error(`\n✗ design contract: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ design contract: ${tokenResult.entries.length} canonical runtime tokens, generated CSS, ownership, merge gates and references valid`,
);
