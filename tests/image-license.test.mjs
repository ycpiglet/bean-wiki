import assert from "node:assert/strict";
import test from "node:test";
import {
  assessImageLicense,
  buildArticleFigure,
} from "../scripts/lib/image-license.mjs";

test("allows licenses that support commercial reuse and modification", () => {
  for (const [name, url, id] of [
    ["CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", "cc0"],
    ["Public Domain Mark 1.0", "https://creativecommons.org/publicdomain/mark/1.0/", "pdm"],
    ["CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/", "cc-by"],
    ["Creative Commons Attribution-Share Alike 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "cc-by-sa"],
  ]) {
    const result = assessImageLicense(name, url);
    assert.equal(result.allowed, true, name);
    assert.equal(result.id, id, name);
    assert.equal(result.allowsCommercialUse, true, name);
    assert.equal(result.allowsModification, true, name);
  }
});

test("blocks non-commercial, no-derivatives, fair-use, and unknown rights", () => {
  for (const name of [
    "CC BY-NC 4.0",
    "CC BY-NC-ND 4.0",
    "CC BY-ND 4.0",
    "Fair use",
    "All rights reserved",
    "see source",
  ]) {
    assert.equal(assessImageLicense(name).allowed, false, name);
  }
});

test("builds a source-linked figure that survives the article sanitizer contract", () => {
  const html = buildArticleFigure({
    src: "/article-media/example/photo.jpg",
    alt: "두 사람이 커핑 볼의 향을 맡는 장면",
    caption: "향미 용어는 실제 향을 비교하는 과정에서 구체화됩니다.",
    author: "Example Photographer",
    license: "CC BY 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
  });
  assert.match(html, /class="article-figure"/);
  assert.match(html, /data-author="Example Photographer"/);
  assert.match(html, /data-license="CC BY 4\.0"/);
  assert.match(html, /class="figure-credit"/);
  assert.doesNotMatch(html, /javascript:/);
});

test("refuses an unsafe source URL", () => {
  assert.throws(
    () =>
      buildArticleFigure({
        src: "/article-media/example/photo.jpg",
        alt: "예시",
        caption: "예시",
        author: "Example",
        license: "CC BY 4.0",
        sourceUrl: "javascript:alert(1)",
      }),
    /HTTPS/,
  );
});
