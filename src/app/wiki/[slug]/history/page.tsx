import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleHistory } from "@/components/article-history";
import { articles, getArticle } from "@/lib/content";

export const dynamicParams = false;

// History reads live GitHub data client-side; keep the shell out of indexes.
export const metadata: Metadata = {
  title: "문서 역사",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticleHistoryPage(props: PageProps<"/wiki/[slug]/history">) {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) notFound();

  return <ArticleHistory slug={article.slug} title={article.title} locale="ko" />;
}
