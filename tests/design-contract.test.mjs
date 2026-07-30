import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  extractGeneratedTokenBlock,
  findUndefinedCssTokens,
  findUnexpectedCanonicalTokenOverrides,
  renderDesignTokenBlock,
  replaceGeneratedTokenBlock,
  validateCodeowners,
  validateDesignTokenData,
  validateMergeGatePolicy,
} from "../scripts/lib/design-tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const palette = JSON.parse(read("src", "design", "brand-colors.json"));
const css = read("src", "app", "globals.css");
const policy = JSON.parse(read("agents", "host", "MERGE-GATES.json"));
const codeowners = read(".github", "CODEOWNERS");
const clone = (value) => structuredClone(value);

test("the canonical source covers every public and semantic runtime token", () => {
  const result = validateDesignTokenData(palette);
  assert.deepEqual(result.errors, []);
  assert.equal(palette.runtimeTokenVersion, 1);
  assert.equal(
    palette.groups.flatMap((group) => group.swatches).length,
    42,
  );
  assert.equal(palette.semanticTokens.length, 9);
  assert.equal(result.entries.length, 51);
  assert.deepEqual(
    result.entries.map((entry) => entry.token),
    palette.runtimeTokenOrder,
  );
});

test("the checked-in CSS token block is exactly generated and has no undefined vars", () => {
  const tokenResult = validateDesignTokenData(palette);
  assert.equal(extractGeneratedTokenBlock(css), renderDesignTokenBlock(palette));
  assert.deepEqual(findUndefinedCssTokens(css), []);
  assert.deepEqual(
    findUnexpectedCanonicalTokenOverrides(css, tokenResult.entries),
    [],
  );
});

test("manual CSS drift is detectable without rewriting the stylesheet", () => {
  const changed = css.replace(
    "  --brand: var(--roast-medium);",
    "  --brand: #ffffff;",
  );
  assert.notEqual(
    extractGeneratedTokenBlock(changed),
    renderDesignTokenBlock(palette),
  );
  assert.equal(css.includes("--brand: #ffffff"), false);
});

test("missing, duplicate and unknown-alias token data fails closed", () => {
  const missing = clone(palette);
  missing.semanticTokens.pop();
  assert.ok(
    validateDesignTokenData(missing).errors.some((error) =>
      error.includes("semanticTokens must contain 9"),
    ),
  );

  const duplicate = clone(palette);
  duplicate.semanticTokens[0].token = duplicate.groups[0].swatches[0].token;
  assert.ok(
    validateDesignTokenData(duplicate).errors.some((error) =>
      error.includes("duplicate design token"),
    ),
  );

  const unknownAlias = clone(palette);
  unknownAlias.semanticTokens.find((entry) => entry.token === "--brand").light =
    "var(--missing-brand-source)";
  assert.ok(
    validateDesignTokenData(unknownAlias).errors.some((error) =>
      error.includes('references unknown token "--missing-brand-source"'),
    ),
  );

  const cycle = clone(palette);
  cycle.semanticTokens.find((entry) => entry.token === "--prose").light =
    "var(--prose-soft)";
  cycle.semanticTokens.find((entry) => entry.token === "--prose-soft").light =
    "var(--prose)";
  assert.ok(
    validateDesignTokenData(cycle).errors.some((error) =>
      error.includes("light alias cycle"),
    ),
  );
});

test("undefined CSS variables are reported while runtime font variables are allowed", () => {
  const changed = `${css}\n.example { color: var(--missing-contract-token); }\n`;
  assert.deepEqual(findUndefinedCssTokens(changed), [
    "--missing-contract-token",
  ]);
  assert.equal(
    findUndefinedCssTokens(
      `${css}\n.example { font-family: var(--font-geist-sans); }\n`,
    ).length,
    0,
  );
});

test("canonical runtime tokens cannot be silently overridden outside adapters", () => {
  const entries = validateDesignTokenData(palette).entries;
  const changed = `${css}\n.example { --brand: #ffffff; }\n`;
  assert.ok(
    findUnexpectedCanonicalTokenOverrides(changed, entries).some((finding) =>
      finding.includes("--brand is redefined outside the generated block"),
    ),
  );
  assert.deepEqual(findUnexpectedCanonicalTokenOverrides(css, entries), []);
});

test("the generator replaces only the marked token block", () => {
  const expected = renderDesignTokenBlock(palette);
  const sentinelBlock = [
    "/* BEGIN GENERATED DESIGN TOKENS */",
    ":root { --sentinel: red; }",
    "/* END GENERATED DESIGN TOKENS */",
  ].join("\n");
  const changed = replaceGeneratedTokenBlock(css, sentinelBlock);
  const restored = replaceGeneratedTokenBlock(changed, expected);
  assert.equal(restored, css);
});

test("host merge gates require immutable contract and visual command coverage", () => {
  assert.deepEqual(validateMergeGatePolicy(policy).errors, []);

  const weakened = clone(policy);
  weakened.gates
    .find((gate) => gate.id === "design-contract")
    .include_paths =
    weakened.gates
      .find((gate) => gate.id === "design-contract")
      .include_paths.filter((path) => path !== "src/design/**");
  assert.ok(
    validateMergeGatePolicy(weakened).errors.some((error) =>
      error.includes(
        'design-contract: include_paths is missing required path "src/design/**"',
      ),
    ),
  );

  const optionalVisual = clone(policy);
  optionalVisual.gates = optionalVisual.gates.filter(
    (gate) => gate.id !== "design-visual",
  );
  assert.ok(
    validateMergeGatePolicy(optionalVisual).errors.some((error) =>
      error.includes('required merge gate is missing: "design-visual"'),
    ),
  );

  const mutableJudge = clone(policy);
  mutableJudge.protected_paths = mutableJudge.protected_paths.filter(
    (path) => path !== "tests/visual/**",
  );
  assert.ok(
    validateMergeGatePolicy(mutableJudge).errors.some((error) =>
      error.includes(
        'protected_paths is missing required path "tests/visual/**"',
      ),
    ),
  );
});

test("CODEOWNERS covers every shared design contract path", () => {
  assert.deepEqual(validateCodeowners(codeowners).errors, []);
  const weakened = codeowners.replace(
    "/src/design/ @ycpiglet\n",
    "",
  );
  assert.ok(
    validateCodeowners(weakened).errors.some((error) =>
      error.includes('missing required design path: "/src/design/"'),
    ),
  );
});
