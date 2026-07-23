import type { Metadata } from "next";
import { ArticleEditor } from "@/components/article-editor";
import { articles, getArticle, categories } from "@/lib/content";
import { bodyHtmlToEditorHtml } from "@/lib/content-serialize.mjs";

// Allow unknown slugs so a red link (a link to a not-yet-written article) opens
// the editor in "create" mode. Known slugs are still prerendered.
export const dynamicParams = true;

// Editing UI is not public content — keep it out of search indexes.
export const metadata: Metadata = {
  title: "편집",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

const SLUG_RE = /^[a-z0-9-]+$/;

export default async function EditArticle(props: PageProps<"/edit/[slug]">) {
  const { slug } = await props.params;
  const article = getArticle(slug);

  const linkTargets = articles.map((a) => ({ slug: a.slug, title: a.title }));
  const categoryOptions = categories.map((c) => c.name);

  // Unknown (or malformed) slug -> create a new article.
  if (!article) {
    return (
      <ArticleEditor
        slug={SLUG_RE.test(slug) ? slug : ""}
        title=""
        summary=""
        bodyHtml="<h2>새 섹션</h2><p></p>"
        locale="ko"
        creating
        articles={linkTargets}
        categoryOptions={categoryOptions}
      />
    );
  }

  // Seed the editor with clean block content, lifting each section id back onto
  // its <h2> so anchors and ko/en parity survive the round-trip (the save API
  // re-derives the numbered <section> wrappers).
  return (
    <ArticleEditor
      slug={article.slug}
      title={article.title}
      summary={article.summary}
      bodyHtml={bodyHtmlToEditorHtml(article.bodyHtml)}
      locale="ko"
      articles={linkTargets}
      categoryOptions={categoryOptions}
    />
  );
}
