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
  assert.deepEqual(
    palette.groups.map((group) => group.swatches.length),
    [6, 5, 6, 6, 6, 6, 7],
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

test("groups may vary in size but remain within the catalog bounds", () => {
  const tooSmall = clone(palette);
  tooSmall.groups[0].swatches = tooSmall.groups[0].swatches.slice(0, 3);
  assert.ok(
    validateBrandColors(tooSmall, themes).errors.some((error) =>
      error.includes("below the minimum"),
    ),
  );

  const tooLarge = clone(palette);
  tooLarge.groups[0].swatches = clone(
    palette.groups.flatMap((group) => group.swatches).slice(0, 13),
  );
  assert.ok(
    validateBrandColors(tooLarge, themes).errors.some((error) =>
      error.includes("exceeds the maximum"),
    ),
  );
});

test("display names are not rejected by a character-count shortcut", () => {
  const changed = clone(palette);
  changed.groups[0].swatches[0].brandName =
    "에티오피아 예가체프 워시드 그린빈 올리브";
  const result = validateBrandColors(changed, themes);
  assert.ok(
    result.errors.every(
      (error) =>
        !error.includes("hard maximum") && !error.includes("character"),
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

  const translatedIngredient = clone(palette);
  translatedIngredient.groups[0].swatches[0].brandName = "강력분 화이트";
  assert.ok(
    validateBrandColors(translatedIngredient, themes).errors.some((error) =>
      error.includes("retired palette term"),
    ),
  );
});
