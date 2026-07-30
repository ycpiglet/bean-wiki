import { getPlatformUser, type PlatformUser } from "@/lib/platform-auth";
import { getArticle } from "@/lib/content";
import {
  createArticleComment,
  deleteArticleComment,
  getArticleFeedback,
  humanActor,
  setArticleLike,
  updateArticleComment,
  upsertArticleReview,
} from "@/lib/engagement-store";
import { recordActivity } from "@/lib/platform-data";
import { resolveRole, roleAtLeast } from "@/lib/roles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getArticle(slug)) {
    return Response.json({ error: "article_not_found" }, { status: 404 });
  }
  const user = await getPlatformUser();
  const role = await resolveRole(user?.accountKey ?? null);
  try {
    return Response.json(
      await getArticleFeedback(slug, user?.accountKey ?? null, role),
    );
  } catch (error) {
    return feedbackErrorResponse(error, 200);
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
    action?: "review" | "comment" | "like";
    rating?: number;
    body?: string;
    parentId?: string | null;
    liked?: boolean;
  } | null;
  const body = typeof data?.body === "string" ? data.body.trim() : "";
  const actor = humanActor(user);

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
      await upsertArticleReview(actor, slug, data.rating as number, body);
      const awarded = await bestEffortActivity(user, "review", slug);
      return Response.json({ ok: true, awarded });
    } catch (error) {
      return feedbackErrorResponse(error);
    }
  }

  if (data?.action === "comment") {
    if (body.length < 2 || body.length > 1200) {
      return Response.json({ error: "invalid_comment" }, { status: 400 });
    }
    try {
      const id = await createArticleComment(
        actor,
        slug,
        body,
        typeof data.parentId === "string" ? data.parentId : null,
      );
      const awarded = await bestEffortActivity(user, "comment", id);
      return Response.json({ ok: true, id, awarded });
    } catch (error) {
      if ((error as Error)?.message === "invalid_parent") {
        return Response.json({ error: "invalid_parent" }, { status: 400 });
      }
      return feedbackErrorResponse(error);
    }
  }

  if (data?.action === "like" && typeof data.liked === "boolean") {
    try {
      const changed = await setArticleLike(actor, slug, data.liked);
      return Response.json({ ok: true, changed, liked: data.liked });
    } catch (error) {
      return feedbackErrorResponse(error);
    }
  }
  return Response.json({ error: "invalid_action" }, { status: 400 });
}

export async function PATCH(
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
    action?: "comment";
    commentId?: string;
    body?: string;
  } | null;
  const body = typeof data?.body === "string" ? data.body.trim() : "";
  if (
    data?.action !== "comment" ||
    typeof data.commentId !== "string" ||
    body.length < 2 ||
    body.length > 1200
  ) {
    return Response.json({ error: "invalid_comment" }, { status: 400 });
  }
  const role = await resolveRole(user.accountKey);
  try {
    const updated = await updateArticleComment(
      humanActor(user),
      slug,
      data.commentId,
      body,
      roleAtLeast(role, "admin"),
    );
    if (!updated) {
      return Response.json({ error: "comment_not_found" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return feedbackErrorResponse(error);
  }
}

export async function DELETE(
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
    action?: "comment" | "like";
    commentId?: string;
  } | null;
  try {
    if (data?.action === "like") {
      const changed = await setArticleLike(humanActor(user), slug, false);
      return Response.json({ ok: true, changed, liked: false });
    }
    if (data?.action === "comment" && typeof data.commentId === "string") {
      const role = await resolveRole(user.accountKey);
      const deleted = await deleteArticleComment(
        humanActor(user),
        slug,
        data.commentId,
        roleAtLeast(role, "admin"),
      );
      if (!deleted) {
        return Response.json({ error: "comment_not_found" }, { status: 404 });
      }
      return Response.json({ ok: true });
    }
  } catch (error) {
    return feedbackErrorResponse(error);
  }
  return Response.json({ error: "invalid_action" }, { status: 400 });
}

async function bestEffortActivity(
  user: PlatformUser,
  kind: "review" | "comment",
  entityKey: string,
) {
  try {
    return await recordActivity(user, kind, entityKey);
  } catch {
    return 0;
  }
}

function feedbackErrorResponse(error: unknown, status = 503) {
  if (
    (error as { name?: string } | null)?.name ===
    "EngagementStoreUnavailableError"
  ) {
    return Response.json(
      {
        error: "storage_unavailable",
        storageReady: false,
        summary: { average: null, count: 0 },
        likes: { total: 0, human: 0, agent: 0, viewerLiked: false },
        views: 0,
        reviews: [],
        comments: [],
        viewer: { signedIn: false, canModerate: false },
      },
      { status },
    );
  }
  throw error;
}
