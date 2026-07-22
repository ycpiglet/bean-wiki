import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/article-editor";
import { articles, getArticle } from "@/lib/content";
import { bodyHtmlToEditorHtml } from "@/lib/content-serialize.mjs";

export const dynamicParams = false;

// Editing UI is not public content — keep it out of search indexes.
export const metadata: Metadata = {
  title: "편집",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function EditArticle(props: PageProps<"/edit/[slug]">) {
  const { slug } = await props.params;
  const article = getArticle(slug);

  if (!article) notFound();

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
    />
  );
}
