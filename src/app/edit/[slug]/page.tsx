import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/article-editor";
import { articles, getArticle } from "@/lib/content";

export const dynamicParams = false;

// Editing UI is not public content — keep it out of search indexes.
export const metadata: Metadata = {
  title: "편집",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

// The stored bodyHtml wraps each section in <section id> with a presentational
// <span class="content-index"> number. The editor's schema (headings, lists,
// prose) does not model those, so seed it with clean block content — section
// numbering and anchor structure are re-derived when rendering / on save (P3).
function toEditorHtml(bodyHtml: string): string {
  return bodyHtml
    .replace(/<span class="content-index">\d+<\/span>/g, "")
    .replace(/<\/?section[^>]*>/g, "");
}

export default async function EditArticle(props: PageProps<"/edit/[slug]">) {
  const { slug } = await props.params;
  const article = getArticle(slug);

  if (!article) notFound();

  return (
    <ArticleEditor
      slug={article.slug}
      title={article.title}
      summary={article.summary}
      bodyHtml={toEditorHtml(article.bodyHtml)}
      locale="ko"
    />
  );
}
