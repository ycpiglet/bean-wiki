#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { articleFromSource } from "../src/lib/content-serialize.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const directory = join(root, "src", "content", "articles");
const files = readdirSync(directory).filter((file) => file.endsWith(".html"));
const errors = [];
const warnings = [];

const stripHtml = (value) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

for (const file of files) {
  const source = readFileSync(join(directory, file), "utf8");
  const article = articleFromSource(source);
  const words = stripHtml(article.bodyHtml).split(/\s+/).filter(Boolean).length;
  const links = (article.bodyHtml.match(/<a\s[^>]*href=/g) ?? []).length;
  const hasPractice = /실습|직접 해보기|연습/.test(article.bodyHtml);
  const hasMisconception = /오해|주의|단정/.test(article.bodyHtml);

  if (article.related.length < 2) {
    errors.push(`${article.slug}: related 문서가 2개 미만입니다.`);
  }
  if ((article.tags ?? []).length < 3) {
    errors.push(`${article.slug}: 태그가 3개 미만입니다.`);
  }
  if (article.sections.length < 3) {
    errors.push(`${article.slug}: 본문 절이 3개 미만입니다.`);
  }
  if (article.level === "입문" && words < 350) {
    warnings.push(`${article.slug}: 입문 권장 분량보다 짧습니다 (${words}어절).`);
  }

  if (article.slug === "coffee-cherry-to-bean") {
    if (article.sections.length < 8) {
      errors.push(`첫 배치 1편: 8개 절을 충족하지 못했습니다.`);
    }
    if (words < 500) {
      errors.push(`첫 배치 1편: 최소 500어절 미달입니다 (${words}어절).`);
    }
    if (links < 5) {
      errors.push(`첫 배치 1편: 참고·내부 링크가 5개 미만입니다.`);
    }
    if (!hasPractice || !hasMisconception) {
      errors.push(`첫 배치 1편: 실습 또는 흔한 오해 점검이 없습니다.`);
    }
    if (!/<table[\s>]/.test(article.bodyHtml)) {
      errors.push(`첫 배치 1편: 비교 표가 없습니다.`);
    }
    if (!/class="callout/.test(article.bodyHtml)) {
      errors.push(`첫 배치 1편: 핵심 콜아웃이 없습니다.`);
    }
  }
}

if (warnings.length) {
  console.warn(`⚠ check-editorial: ${warnings.length} legacy warning(s)`);
  for (const warning of warnings.slice(0, 12)) console.warn(`  - ${warning}`);
  if (warnings.length > 12) console.warn(`  - 외 ${warnings.length - 12}건`);
}

if (errors.length) {
  console.error(`✗ check-editorial: ${errors.length} problem(s)`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `✓ check-editorial: ${files.length} articles checked; beginner batch gate passed`,
);
