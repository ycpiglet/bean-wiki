import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  parseThemeTokens,
  validateBrandColors,
} from "../scripts/lib/brand-colors.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const palette = JSON.parse(
  readFileSync(join(root, "src", "design", "brand-colors.json"), "utf8"),
);
const themes = parseThemeTokens(
  readFileSync(join(root, "src", "app", "globals.css"), "utf8"),
);
const clone = (value) => structuredClone(value);

test("the checked-in palette satisfies the material and theme contract", () => {
  const result = validateBrandColors(palette, themes);
  assert.deepEqual(result.errors, []);
  assert.equal(result.count, 47);
});

test("a CSS/catalog color drift is rejected", () => {
  const changed = clone(palette);
  changed.groups[0].swatches[0].hex = "#A13D36";
  const result = validateBrandColors(changed, themes);
  assert.ok(result.errors.some((error) => error.includes("light CSS")));
});

test("a retired misleading material name is rejected", () => {
  const changed = clone(palette);
  changed.groups[0].swatches[0].englishName = "Himalayan Pink Salt";
  const result = validateBrandColors(changed, themes);
  assert.ok(
    result.errors.some((error) => error.includes("retired palette term")),
  );
});

test("a white hierarchy inversion is rejected", () => {
  const changed = clone(palette);
  const blossom = changed.groups
    .flatMap((group) => group.swatches)
    .find((swatch) => swatch.id === "coffee-blossom-white");
  blossom.hex = "#E8E1D4";
  const result = validateBrandColors(changed, themes);
  assert.ok(
    result.errors.some((error) =>
      error.includes("coffee-blossom-white must be lighter"),
    ),
  );
});
