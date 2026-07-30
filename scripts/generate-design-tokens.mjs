#!/usr/bin/env node

import {
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractGeneratedTokenBlock,
  renderDesignTokenBlock,
  replaceGeneratedTokenBlock,
} from "./lib/design-tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const palettePath = join(root, "src", "design", "brand-colors.json");
const cssPath = join(root, "src", "app", "globals.css");
const checkOnly = process.argv.includes("--check");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--check");

if (unknownArguments.length) {
  console.error(
    `✗ generate-design-tokens: unknown argument(s): ${unknownArguments.join(", ")}`,
  );
  process.exit(2);
}

const palette = JSON.parse(readFileSync(palettePath, "utf8"));
const currentCss = readFileSync(cssPath, "utf8");
const expectedBlock = renderDesignTokenBlock(palette);
const currentBlock = extractGeneratedTokenBlock(currentCss);

if (currentBlock === expectedBlock) {
  console.log("✓ generate-design-tokens: runtime token block is current");
  process.exit(0);
}

if (checkOnly) {
  console.error(
    "✗ generate-design-tokens: runtime token block drifted; run node scripts/generate-design-tokens.mjs",
  );
  process.exit(1);
}

const nextCss = replaceGeneratedTokenBlock(currentCss, expectedBlock);
const temporaryPath = `${cssPath}.${process.pid}.tmp`;
try {
  writeFileSync(temporaryPath, nextCss, "utf8");
  renameSync(temporaryPath, cssPath);
} finally {
  rmSync(temporaryPath, { force: true });
}

console.log(
  "✓ generate-design-tokens: regenerated src/app/globals.css from src/design/brand-colors.json",
);
