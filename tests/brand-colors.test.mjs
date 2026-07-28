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
const expectedCount = palette.groups.reduce(
  (total, group) => total + group.swatches.length,
  0,
);

test("the checked-in palette satisfies the material and theme contract", () => {
  const result = validateBrandColors(palette, themes);
  assert.deepEqual(result.errors, []);
  assert.equal(result.count, expectedCount);
  assert.equal(result.count, 42);
  assert.ok(
    palette.groups.every(
      (group) =>
        group.swatches.length === palette.namingPolicy.preferredGroupSize,
    ),
  );
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

test("groups outside the five-to-seven balance contract are rejected", () => {
  const tooSmall = clone(palette);
  tooSmall.groups[0].swatches = tooSmall.groups[0].swatches.slice(0, 4);
  assert.ok(
    validateBrandColors(tooSmall, themes).errors.some((error) =>
      error.includes("below the minimum"),
    ),
  );

  const tooLarge = clone(palette);
  tooLarge.groups[0].swatches.push(
    clone(tooLarge.groups[1].swatches[0]),
    clone(tooLarge.groups[1].swatches[1]),
  );
  assert.ok(
    validateBrandColors(tooLarge, themes).errors.some((error) =>
      error.includes("exceeds the maximum"),
    ),
  );
});

test("Korean display names enforce a 12-character target and 14-character cap", () => {
  const overTarget = clone(palette);
  overTarget.groups[0].swatches[0].brandName = "가나다라마바사아자차카타파";
  const targetResult = validateBrandColors(overTarget, themes);
  assert.ok(
    targetResult.warnings.some((warning) => warning.includes("target is 12")),
  );
  assert.ok(
    targetResult.errors.every(
      (error) => !error.includes("hard maximum is 14"),
    ),
  );

  const overLimit = clone(palette);
  overLimit.groups[0].swatches[0].brandName = "가나다라마바사아자차카타파하허";
  assert.ok(
    validateBrandColors(overLimit, themes).errors.some((error) =>
      error.includes("hard maximum is 14"),
    ),
  );
});

test("invalid whitespace and retired ids cannot hide in display data", () => {
  const whitespace = clone(palette);
  whitespace.groups[0].swatches[0].brandName = "예가체프  그린";
  assert.ok(
    validateBrandColors(whitespace, themes).errors.some((error) =>
      error.includes("invalid whitespace"),
    ),
  );

  const retiredId = clone(palette);
  retiredId.groups[0].swatches[0].id = "cascara-infusion-rose";
  assert.ok(
    validateBrandColors(retiredId, themes).errors.some((error) =>
      error.includes("retired palette id"),
    ),
  );
});
