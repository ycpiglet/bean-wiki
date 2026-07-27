import { getPlatformUser } from "@/lib/platform-auth";
import { getArticle } from "@/lib/content";
import {
  addArticleComment,
  getArticleFeedback,
  upsertArticleReview,
} from "@/lib/platform-data";
import { storageUnavailableResponse } from "@/lib/platform-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getArticle(slug)) {
    return Response.json({ error: "article_not_found" }, { status: 404 });
  }
  try {
    return Response.json(await getArticleFeedback(slug));
  } catch (error) {
    return storageUnavailableResponse(
      error,
      {
        summary: { average: null, count: 0 },
        reviews: [],
        comments: [],
      },
      200,
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getArticle(slug)) {
    return Response.json({ error: "article_not_found" }, { status: 404 });
  }
  const user = await getPlatformUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const data = (await request.json().catch(() => null)) as {
    action?: "review" | "comment";
    rating?: number;
    body?: string;
    parentId?: string | null;
  } | null;
  const body = typeof data?.body === "string" ? data.body.trim() : "";

  if (data?.action === "review") {
    if (
      !Number.isInteger(data.rating) ||
      (data.rating ?? 0) < 1 ||
      (data.rating ?? 0) > 5 ||
      body.length > 1200
    ) {
      return Response.json({ error: "invalid_review" }, { status: 400 });
    }
    try {
      const awarded = await upsertArticleReview(
        user,
        slug,
        data.rating as number,
        body,
      );
      return Response.json({ ok: true, awarded });
    } catch (error) {
      return storageUnavailableResponse(error, {
        error: "storage_unavailable",
      });
    }
  }

  if (data?.action === "comment") {
    if (body.length < 2 || body.length > 1200) {
      return Response.json({ error: "invalid_comment" }, { status: 400 });
    }
    try {
      return Response.json(
        await addArticleComment(
          user,
          slug,
          body,
          typeof data.parentId === "string" ? data.parentId : null,
        ),
      );
    } catch (error) {
      return storageUnavailableResponse(error, {
        error: "storage_unavailable",
      });
    }
  }
  return Response.json({ error: "invalid_action" }, { status: 400 });
}
