// Credentialed article-engagement API for QA agents and disclosed public agents.
// `mode: "qa"` is the default: those rows are synthetic and never appear in
// public counts. `mode: "public"` is visible, but every actor is labelled as an
// AI agent by the reader UI.

import { auditOk, rateHeaders, requireClient } from "@/lib/api/auth";
import { ok, problem } from "@/lib/api/envelope";
import { SCOPES } from "@/lib/api/scopes";
import { getArticle } from "@/lib/content";
import {
  createArticleComment,
  deleteArticleComment,
  getArticleFeedback,
  setArticleLike,
  updateArticleComment,
  type EngagementActor,
} from "@/lib/engagement-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };
type Mode = "qa" | "public";

export async function GET(request: Request, { params }: Context) {
  const auth = await requireClient(request, SCOPES.engagementRead);
  if (!auth.ok) return auth.response;
  const { slug } = await params;
  if (!getArticle(slug)) {
    return problem("not_found", {
      requestId: auth.requestId,
      detail: "Article was not found.",
      headers: rateHeaders(auth.rate),
    });
  }
  try {
    const data = await getArticleFeedback(slug, null);
    await auditOk({
      clientId: auth.client.id,
      requestId: auth.requestId,
      action: "engagement.read",
      resource: `/wiki/${slug}`,
      scope: SCOPES.engagementRead,
      rowCount: data.comments.length,
    });
    return ok("article_engagement.v1", data, {
      requestId: auth.requestId,
      headers: rateHeaders(auth.rate),
      cacheControl: "no-store",
    });
  } catch (error) {
    return storeProblem(error, auth.requestId, auth.rate);
  }
}

export async function POST(request: Request, { params }: Context) {
  const auth = await requireClient(request, SCOPES.engagementWrite);
  if (!auth.ok) return auth.response;
  const { slug } = await params;
  if (!getArticle(slug)) {
    return problem("not_found", {
      requestId: auth.requestId,
      detail: "Article was not found.",
      headers: rateHeaders(auth.rate),
    });
  }
  const body = await parseBody(request);
  if (!body) {
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: "Send a valid JSON action.",
      headers: rateHeaders(auth.rate),
    });
  }
  const actor = agentActor(auth.client.id, auth.client.name, body.mode);

  try {
    let data: Record<string, unknown>;
    if (
      (body.action === "comment" || body.action === "reply") &&
      validText(body.body)
    ) {
      const parentId =
        body.action === "reply" && typeof body.parentId === "string"
          ? body.parentId
          : null;
      if (body.action === "reply" && !parentId) {
        return problem("invalid_request", {
          requestId: auth.requestId,
          detail: "`parentId` is required for a reply.",
          headers: rateHeaders(auth.rate),
        });
      }
      const id = await createArticleComment(
        actor,
        slug,
        body.body.trim(),
        parentId,
      );
      data = { action: body.action, id, mode: body.mode };
    } else if (body.action === "like" && typeof body.liked === "boolean") {
      const changed = await setArticleLike(actor, slug, body.liked);
      data = { action: "like", liked: body.liked, changed, mode: body.mode };
    } else {
      return problem("invalid_request", {
        requestId: auth.requestId,
        detail:
          "Use comment/reply with a 2–1200 character body, or like with a boolean `liked`.",
        headers: rateHeaders(auth.rate),
      });
    }
    await auditOk({
      clientId: auth.client.id,
      requestId: auth.requestId,
      action: `engagement.${body.action}`,
      resource: `/wiki/${slug}`,
      scope: SCOPES.engagementWrite,
      rowCount: 1,
      detail: body.mode,
    });
    return ok("article_engagement_mutation.v1", data, {
      requestId: auth.requestId,
      headers: rateHeaders(auth.rate),
      status: 201,
    });
  } catch (error) {
    if ((error as Error)?.message === "invalid_parent") {
      return problem("state_conflict", {
        requestId: auth.requestId,
        detail: "Reply parent must be a root comment on the same article.",
        headers: rateHeaders(auth.rate),
      });
    }
    return storeProblem(error, auth.requestId, auth.rate);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireClient(request, SCOPES.engagementWrite);
  if (!auth.ok) return auth.response;
  const { slug } = await params;
  const body = await parseBody(request);
  if (
    !getArticle(slug) ||
    !body ||
    body.action !== "comment" ||
    typeof body.commentId !== "string" ||
    !validText(body.body)
  ) {
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: "Send comment, commentId, body, and mode.",
      headers: rateHeaders(auth.rate),
    });
  }
  try {
    const updated = await updateArticleComment(
      agentActor(auth.client.id, auth.client.name, body.mode),
      slug,
      body.commentId,
      body.body.trim(),
    );
    if (!updated) {
      return problem("not_found", {
        requestId: auth.requestId,
        detail: "Comment was not found or belongs to another actor.",
        headers: rateHeaders(auth.rate),
      });
    }
    await auditMutation(auth, slug, "engagement.comment.update", body.mode);
    return ok(
      "article_engagement_mutation.v1",
      { action: "comment.update", id: body.commentId, mode: body.mode },
      { requestId: auth.requestId, headers: rateHeaders(auth.rate) },
    );
  } catch (error) {
    return storeProblem(error, auth.requestId, auth.rate);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await requireClient(request, SCOPES.engagementWrite);
  if (!auth.ok) return auth.response;
  const { slug } = await params;
  const body = await parseBody(request);
  if (!getArticle(slug) || !body) {
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: "Send a valid article engagement action.",
      headers: rateHeaders(auth.rate),
    });
  }
  const actor = agentActor(auth.client.id, auth.client.name, body.mode);
  try {
    if (body.action === "like") {
      const changed = await setArticleLike(actor, slug, false);
      await auditMutation(auth, slug, "engagement.like.remove", body.mode);
      return ok(
        "article_engagement_mutation.v1",
        { action: "like.remove", changed, mode: body.mode },
        { requestId: auth.requestId, headers: rateHeaders(auth.rate) },
      );
    }
    if (body.action === "comment" && typeof body.commentId === "string") {
      const deleted = await deleteArticleComment(
        actor,
        slug,
        body.commentId,
      );
      if (!deleted) {
        return problem("not_found", {
          requestId: auth.requestId,
          detail: "Comment was not found or belongs to another actor.",
          headers: rateHeaders(auth.rate),
        });
      }
      await auditMutation(auth, slug, "engagement.comment.delete", body.mode);
      return ok(
        "article_engagement_mutation.v1",
        { action: "comment.delete", id: body.commentId, mode: body.mode },
        { requestId: auth.requestId, headers: rateHeaders(auth.rate) },
      );
    }
    return problem("invalid_request", {
      requestId: auth.requestId,
      detail: "DELETE supports comment with commentId, or like.",
      headers: rateHeaders(auth.rate),
    });
  } catch (error) {
    return storeProblem(error, auth.requestId, auth.rate);
  }
}

type Body = {
  action?: "comment" | "reply" | "like";
  mode: Mode;
  body?: string;
  parentId?: string;
  commentId?: string;
  liked?: boolean;
};

async function parseBody(request: Request): Promise<Body | null> {
  const parsed = (await request.json().catch(() => null)) as Partial<Body> | null;
  if (!parsed || typeof parsed !== "object") return null;
  return {
    ...parsed,
    mode: parsed.mode === "public" ? "public" : "qa",
  };
}

function validText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 1200;
}

function agentActor(id: string, name: string, mode: Mode): EngagementActor {
  return {
    key: `agent:${id}${mode === "qa" ? ":qa" : ""}`,
    displayName: name,
    type: "agent",
    synthetic: mode === "qa",
  };
}

async function auditMutation(
  auth: Extract<Awaited<ReturnType<typeof requireClient>>, { ok: true }>,
  slug: string,
  action: string,
  mode: Mode,
) {
  await auditOk({
    clientId: auth.client.id,
    requestId: auth.requestId,
    action,
    resource: `/wiki/${slug}`,
    scope: SCOPES.engagementWrite,
    rowCount: 1,
    detail: mode,
  });
}

function storeProblem(
  error: unknown,
  requestId: string,
  rate: Parameters<typeof rateHeaders>[0],
) {
  const name = (error as { name?: string } | null)?.name;
  if (
    name === "D1UnavailableError" ||
    name === "EngagementStoreUnavailableError"
  ) {
    return problem("storage_unavailable", {
      requestId,
      detail: "Engagement storage is unavailable.",
      headers: rateHeaders(rate),
    });
  }
  throw error;
}
