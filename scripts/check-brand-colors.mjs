#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseThemeTokens,
  retiredPaletteTerms,
  validateBrandColors,
} from "./lib/brand-colors.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const palette = JSON.parse(
  readFileSync(join(root, "src", "design", "brand-colors.json"), "utf8"),
);
const css = readFileSync(join(root, "src", "app", "globals.css"), "utf8");
const result = validateBrandColors(palette, parseThemeTokens(css));
const publicFiles = [
  ["design policy", join(root, "docs", "DESIGN.md")],
  ["palette page", join(root, "src", "app", "design", "colors", "page.tsx")],
  [
    "palette card",
    join(root, "src", "components", "palette-color-card.tsx"),
  ],
];
for (const [label, path] of publicFiles) {
  const source = readFileSync(path, "utf8");
  for (const retired of retiredPaletteTerms) {
    if (source.includes(retired)) {
      result.errors.push(`${label} still contains retired term "${retired}"`);
    }
  }
}

const cardSource = readFileSync(
  join(root, "src", "components", "palette-color-card.tsx"),
  "utf8",
);
for (const contract of [
  ["an always-visible HEX value", "<code>{swatch.hex}</code>"],
  ["a copy button label", "색상값 ${swatch.hex} 복사"],
  ["accessible copy feedback", 'aria-live="polite"'],
  ["a fixed canonical swatch", "backgroundColor: swatch.hex"],
]) {
  if (!cardSource.includes(contract[1])) {
    result.errors.push(`palette card is missing ${contract[0]}`);
  }
}

if (result.warnings.length) {
  console.warn(`\n⚠ check-brand-colors: ${result.warnings.length} warning(s)`);
  for (const warning of result.warnings) console.warn(`  - ${warning}`);
}

if (result.errors.length) {
  console.error(`\n✗ check-brand-colors: ${result.errors.length} problem(s)\n`);
  for (const error of result.errors) console.error(`  - ${error}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ check-brand-colors: ${result.count} researched swatches, CSS themes and material rules valid`,
);
