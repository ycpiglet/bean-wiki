#!/usr/bin/env node
// Scaffold a new article: create the module from a template and register it in
// src/content/articles/index.ts. Usage:
//   npm run new-article -- --slug my-article --category "추출" --accent blue

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const articlesDir = join(root, "src", "content", "articles");

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

const file = join(articlesDir, `${slug}.ts`);
if (existsSync(file)) {
  console.error(`✗ ${slug}.ts already exists.`);
  process.exit(1);
}

const camel = slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const template = `import type { Article } from "@/content/types";

const article = {
  slug: "${slug}",
  title: "제목을 입력하세요",
  summary: "한 줄 요약을 입력하세요.",
  category: "${category}",
  level: "입문",
  readingTime: "5분",
  updatedAt: "YYYY. MM. DD.",
  accent: "${accent}",
  fact: "핵심 한 줄을 입력하세요.",
  sections: [
    {
      id: "section-1",
      title: "첫 번째 섹션 제목",
      paragraphs: ["본문을 입력하세요."],
    },
  ],
  related: [],
  tags: [],
  history: [{ date: "YYYY. MM. DD.", note: "문서 최초 작성" }],
} satisfies Article;

export default article;
`;

writeFileSync(file, template, "utf8");

// Register in index.ts: add the import after the last import, and the identifier
// as the last array entry.
const indexPath = join(articlesDir, "index.ts");
let index = readFileSync(indexPath, "utf8");
const importLine = `import ${camel} from "./${slug}";`;
const lastImport = index.lastIndexOf('import ');
const lastImportEnd = index.indexOf("\n", lastImport);
index =
  index.slice(0, lastImportEnd + 1) +
  importLine +
  "\n" +
  index.slice(lastImportEnd + 1);
index = index.replace(/\n\];/, `\n  ${camel},\n];`);
writeFileSync(indexPath, index, "utf8");

console.log(`✓ Created src/content/articles/${slug}.ts and registered it.`);
console.log("  Next: fill in the fields, then run `npm run check-content`.");
