#!/usr/bin/env node
// Scaffold a new article as HTML and register it in order.json. Usage:
//   npm run new-article -- --slug my-article --category "추출" --accent blue

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "src", "content", "articles");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const slug = arg("slug");
const category = arg("category", "커피 기초");
const accent = arg("accent", "olive");

if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error(
    'Usage: npm run new-article -- --slug my-article [--category "추출"] [--accent blue]',
  );
  console.error("slug must be lowercase letters, numbers, and hyphens.");
  process.exit(1);
}

const file = join(dir, `${slug}.html`);
if (existsSync(file)) {
  console.error(`✗ ${slug}.html already exists.`);
  process.exit(1);
}

const template = `---
slug: ${slug}
title: 제목을 입력하세요
summary: 한 줄 요약을 입력하세요.
category: ${category}
level: 입문
readingTime: 5분
updatedAt: YYYY. MM. DD.
accent: ${accent}
fact: 핵심 한 줄을 입력하세요.
related: []
tags: []
history: [{"date":"YYYY. MM. DD.","note":"문서 최초 작성"}]
---
<h2 id="section-1">첫 번째 섹션 제목</h2>
<p>본문을 입력하세요.</p>
`;

writeFileSync(file, template, "utf8");

const orderPath = join(dir, "order.json");
const order = JSON.parse(readFileSync(orderPath, "utf8"));
if (!order.includes(slug)) {
  order.push(slug);
  writeFileSync(orderPath, JSON.stringify(order, null, 2) + "\n", "utf8");
}

console.log(`✓ Created src/content/articles/${slug}.html and added it to order.json.`);
console.log("  Next: fill in the fields, then run `npm run check-content`.");
