import "server-only";

import { getRuntimeBindings } from "../../platform/runtime-bindings";
import type { PlatformUser } from "@/lib/platform-auth";
import type { Role } from "@/lib/roles";
import type { LiveSignals } from "@/lib/live-signals-types";

export type EngagementActor = {
  key: string;
  displayName: string;
  type: "human" | "agent";
  synthetic?: boolean;
};

export type FeedbackComment = {
  id: string;
  displayName: string;
  body: string;
  parentId: string | null;
  actorType: "human" | "agent";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isMine: boolean;
};

export type ArticleFeedback = {
  summary: { average: number | null; count: number };
  likes: {
    total: number;
    human: number;
    agent: number;
    viewerLiked: boolean;
  };
  views: number;
  reviews: {
    id: string;
    displayName: string;
    rating: number;
    body: string;
    createdAt: string;
  }[];
  comments: FeedbackComment[];
  viewer: { signedIn: boolean; canModerate: boolean };
};

export type AnalyticsPoint = {
  key: string;
  value: number;
  secondary?: number;
};

export type AnalyticsDashboard = {
  available: boolean;
  windowDays: number;
  generatedAt: string;
  totals: {
    views: number;
    uniqueDailyReaders: number;
    likes: number;
    humanLikes: number;
    agentLikes: number;
    comments: number;
  };
  trend: AnalyticsPoint[];
  topArticles: {
    slug: string;
    views: number;
    likes: number;
    comments: number;
  }[];
  referrers: AnalyticsPoint[];
  countries: AnalyticsPoint[];
  hours: AnalyticsPoint[];
};

export type StoredPageView = {
  path: string;
  entityType: string;
  entityKey: string;
  locale: string;
  day: string;
  sessionHash: string;
  referrerClass: string;
  countryCode: string;
  hourBucket: number;
  deviceClass: string;
};

type SupabaseInit = RequestInit & { prefer?: string };

export class EngagementStoreUnavailableError extends Error {
  constructor(message = "engagement store unavailable") {
    super(message);
    this.name = "EngagementStoreUnavailableError";
  }
}

export function humanActor(user: PlatformUser): EngagementActor {
  return {
    key: user.accountKey,
    displayName: user.displayName,
    type: "human",
    synthetic: false,
  };
}

export async function storePageView(view: StoredPageView): Promise<void> {
  if (backend() === "d1") {
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    await db
      .prepare(
        `INSERT INTO page_views
          (id, path, entity_type, entity_key, locale, day, session_hash,
           referrer_class, country_code, hour_bucket, device_class)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        view.path,
        view.entityType,
        view.entityKey,
        view.locale,
        view.day,
        view.sessionHash,
        view.referrerClass,
        view.countryCode,
        view.hourBucket,
        view.deviceClass,
      )
      .run();
    return;
  }
  await rest("page_views", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      path: view.path,
      entity_type: view.entityType,
      entity_key: view.entityKey,
      locale: view.locale,
      day: view.day,
      session_hash: view.sessionHash,
      referrer_class: view.referrerClass,
      country_code: view.countryCode,
      hour_bucket: view.hourBucket,
      device_class: view.deviceClass,
    }),
  });
}

export async function pruneStoredPageViews(beforeDay: string): Promise<number> {
  if (backend() === "d1") {
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    const result = await db
      .prepare(`DELETE FROM page_views WHERE day < ?`)
      .bind(beforeDay)
      .run();
    return Number(result.meta.changes ?? 0);
  }

  const result = await rest<number | number[]>(
    "rpc/bean_wiki_prune_page_views",
    {
      method: "POST",
      body: JSON.stringify({ before_day: beforeDay }),
    },
  );
  return Number(Array.isArray(result) ? result[0] ?? 0 : result ?? 0);
}

function d1() {
  return getRuntimeBindings().DB;
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
      process.env.ENGAGEMENT_STORE_MODE?.trim().toLowerCase() !== "disabled",
  );
}

function backend(): "d1" | "supabase" {
  const requested =
    process.env.ENGAGEMENT_STORE_MODE?.trim().toLowerCase() ?? "auto";
  if (requested === "d1") {
    if (!d1()) throw new EngagementStoreUnavailableError("D1 is not bound");
    return "d1";
  }
  if (requested === "supabase") {
    if (!supabaseConfigured()) {
      throw new EngagementStoreUnavailableError("Supabase is not configured");
    }
    return "supabase";
  }
  if (requested !== "auto") {
    throw new EngagementStoreUnavailableError("invalid engagement store mode");
  }
  if (d1()) return "d1";
  if (supabaseConfigured()) return "supabase";
  throw new EngagementStoreUnavailableError();
}

async function rest<T>(
  path: string,
  init: SupabaseInit = {},
): Promise<T> {
  const base = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new EngagementStoreUnavailableError();
  const { prefer, ...request } = init;
  let response: Response;
  try {
    response = await fetch(`${base}/rest/v1/${path}`, {
      ...request,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(prefer ? { Prefer: prefer } : {}),
        ...(request.headers ?? {}),
      },
      cache: "no-store",
      signal: request.signal ?? AbortSignal.timeout(6_000),
    });
  } catch {
    throw new EngagementStoreUnavailableError();
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status >= 500 || response.status === 408) {
      throw new EngagementStoreUnavailableError(
        `engagement store request failed (${response.status})`,
      );
    }
    const error = new Error(
      `engagement store request failed (${response.status}): ${detail.slice(0, 240)}`,
    );
    error.name = "EngagementStoreError";
    throw error;
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function ensureD1Actor(actor: EngagementActor) {
  const db = d1();
  if (!db) throw new EngagementStoreUnavailableError();
  await db
    .prepare(
      `INSERT INTO profiles (email, display_name)
       VALUES (?, ?)
       ON CONFLICT(email) DO UPDATE SET
         display_name = excluded.display_name,
         updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(actor.key, actor.displayName)
    .run();
}

async function recordEvent(
  actor: EngagementActor,
  articleSlug: string,
  action: string,
  subjectId = "",
) {
  if (backend() === "d1") {
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    await db
      .prepare(
        `INSERT INTO engagement_events
          (id, article_slug, action, actor_key, actor_type, subject_id, is_synthetic)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        articleSlug,
        action,
        actor.key,
        actor.type,
        subjectId,
        actor.synthetic ? 1 : 0,
      )
      .run();
    return;
  }
  await rest("engagement_events", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      article_slug: articleSlug,
      action,
      actor_key: actor.key,
      actor_type: actor.type,
      subject_id: subjectId,
      is_synthetic: Boolean(actor.synthetic),
    }),
  });
}

export async function getArticleFeedback(
  articleSlug: string,
  viewerKey: string | null,
  viewerRole: Role = "reader",
): Promise<ArticleFeedback> {
  if (backend() === "d1") {
    return getD1Feedback(articleSlug, viewerKey, viewerRole);
  }
  return getSupabaseFeedback(articleSlug, viewerKey, viewerRole);
}

async function getD1Feedback(
  articleSlug: string,
  viewerKey: string | null,
  viewerRole: Role,
): Promise<ArticleFeedback> {
  const db = d1();
  if (!db) throw new EngagementStoreUnavailableError();
  const [summary, reviews, comments, likes, viewCount, viewerLike] =
    await Promise.all([
      db
        .prepare(
          `SELECT ROUND(AVG(rating), 1) AS average, COUNT(*) AS count
             FROM article_reviews WHERE article_slug = ?`,
        )
        .bind(articleSlug)
        .first<{ average: number | null; count: number }>(),
      db
        .prepare(
          `SELECT id, display_name AS displayName, rating, body,
                  created_at AS createdAt
             FROM article_reviews
            WHERE article_slug = ?
            ORDER BY updated_at DESC
            LIMIT 30`,
        )
        .bind(articleSlug)
        .all<{
          id: string;
          displayName: string;
          rating: number;
          body: string;
          createdAt: string;
        }>(),
      db
        .prepare(
          `SELECT id, email AS actorKey, display_name AS displayName, body,
                  parent_id AS parentId, actor_type AS actorType,
                  created_at AS createdAt, updated_at AS updatedAt,
                  deleted_at AS deletedAt
             FROM article_comments
            WHERE article_slug = ? AND is_synthetic = 0
            ORDER BY created_at ASC
            LIMIT 200`,
        )
        .bind(articleSlug)
        .all<{
          id: string;
          actorKey: string;
          displayName: string;
          body: string;
          parentId: string | null;
          actorType: "human" | "agent";
          createdAt: string;
          updatedAt: string;
          deletedAt: string | null;
        }>(),
      db
        .prepare(
          `SELECT actor_type AS actorType, COUNT(*) AS count
             FROM article_likes
            WHERE article_slug = ? AND is_synthetic = 0
            GROUP BY actor_type`,
        )
        .bind(articleSlug)
        .all<{ actorType: string; count: number }>(),
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM page_views
            WHERE entity_type = 'article' AND entity_key = ?`,
        )
        .bind(articleSlug)
        .first<{ count: number }>(),
      viewerKey
        ? db
            .prepare(
              `SELECT 1 AS liked FROM article_likes
                WHERE article_slug = ? AND actor_key = ? AND is_synthetic = 0`,
            )
            .bind(articleSlug, viewerKey)
            .first<{ liked: number }>()
        : Promise.resolve(null),
    ]);

  const likeCounts = Object.fromEntries(
    likes.results.map((row) => [row.actorType, Number(row.count)]),
  );
  return {
    summary: {
      average: summary?.average ?? null,
      count: Number(summary?.count ?? 0),
    },
    likes: {
      human: likeCounts.human ?? 0,
      agent: likeCounts.agent ?? 0,
      total: (likeCounts.human ?? 0) + (likeCounts.agent ?? 0),
      viewerLiked: Boolean(viewerLike),
    },
    views: Number(viewCount?.count ?? 0),
    reviews: reviews.results,
    comments: comments.results.map((row) => ({
      ...row,
      body: row.deletedAt ? "" : row.body,
      isMine: Boolean(viewerKey && row.actorKey === viewerKey),
    })),
    viewer: {
      signedIn: Boolean(viewerKey),
      canModerate: viewerRole === "admin" || viewerRole === "owner",
    },
  };
}

async function getSupabaseFeedback(
  articleSlug: string,
  viewerKey: string | null,
  viewerRole: Role,
): Promise<ArticleFeedback> {
  const slug = encodeURIComponent(articleSlug);
  type FeedbackSummary = {
    review_average: number | null;
    review_count: number;
    human_likes: number;
    agent_likes: number;
    view_count: number;
  };
  const [reviews, comments, summaryResult, viewerLikes] = await Promise.all([
    rest<
      {
        id: string;
        display_name: string;
        rating: number;
        body: string;
        created_at: string;
      }[]
    >(
      `article_reviews?article_slug=eq.${slug}&select=id,display_name,rating,body,created_at&order=updated_at.desc&limit=30`,
    ),
    rest<
      {
        id: string;
        actor_key: string;
        display_name: string;
        body: string;
        parent_id: string | null;
        actor_type: "human" | "agent";
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }[]
    >(
      `article_comments?article_slug=eq.${slug}&is_synthetic=eq.false&select=id,actor_key,display_name,body,parent_id,actor_type,created_at,updated_at,deleted_at&order=created_at.asc&limit=200`,
    ),
    rest<FeedbackSummary | FeedbackSummary[]>(
      "rpc/bean_wiki_article_feedback_summary",
      {
        method: "POST",
        body: JSON.stringify({ requested_slug: articleSlug }),
      },
    ),
    viewerKey
      ? rest<{ id: string }[]>(
          `article_likes?article_slug=eq.${slug}&actor_key=eq.${encodeURIComponent(viewerKey)}&is_synthetic=eq.false&select=id&limit=1`,
        )
      : Promise.resolve([]),
  ]);
  const summary = Array.isArray(summaryResult)
    ? summaryResult[0]
    : summaryResult;
  if (!summary) throw new EngagementStoreUnavailableError();
  const human = Number(summary.human_likes ?? 0);
  const agent = Number(summary.agent_likes ?? 0);
  return {
    summary: {
      average:
        summary.review_average === null
          ? null
          : Number(summary.review_average),
      count: Number(summary.review_count ?? 0),
    },
    likes: {
      total: human + agent,
      human,
      agent,
      viewerLiked: viewerLikes.length > 0,
    },
    views: Number(summary.view_count ?? 0),
    reviews: reviews.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      rating: row.rating,
      body: row.body,
      createdAt: row.created_at,
    })),
    comments: comments.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      body: row.deleted_at ? "" : row.body,
      parentId: row.parent_id,
      actorType: row.actor_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      isMine: Boolean(viewerKey && row.actor_key === viewerKey),
    })),
    viewer: {
      signedIn: Boolean(viewerKey),
      canModerate: viewerRole === "admin" || viewerRole === "owner",
    },
  };
}

export async function upsertArticleReview(
  actor: EngagementActor,
  articleSlug: string,
  rating: number,
  body?: string,
) {
  if (backend() === "d1") {
    await ensureD1Actor(actor);
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    await db
      .prepare(
        `INSERT INTO article_reviews
          (id, article_slug, email, display_name, rating, body)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(article_slug, email) DO UPDATE SET
           display_name = excluded.display_name,
           rating = excluded.rating,
           body = CASE
             WHEN ? = 1 THEN excluded.body
             ELSE article_reviews.body
           END,
           updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        crypto.randomUUID(),
        articleSlug,
        actor.key,
        actor.displayName,
        rating,
        body ?? "",
        body === undefined ? 0 : 1,
      )
      .run();
  } else {
    const previous =
      body === undefined
        ? await rest<{ body: string }[]>(
            `article_reviews?article_slug=eq.${encodeURIComponent(articleSlug)}&actor_key=eq.${encodeURIComponent(actor.key)}&select=body&limit=1`,
          )
        : [];
    await rest("article_reviews?on_conflict=article_slug,actor_key", {
      method: "POST",
      prefer: "return=minimal,resolution=merge-duplicates",
      body: JSON.stringify({
        article_slug: articleSlug,
        actor_key: actor.key,
        display_name: actor.displayName,
        rating,
        body: body ?? previous[0]?.body ?? "",
        updated_at: new Date().toISOString(),
      }),
    });
  }
  await recordEvent(actor, articleSlug, "review.upsert", articleSlug);
}

export async function createArticleComment(
  actor: EngagementActor,
  articleSlug: string,
  body: string,
  parentId: string | null,
): Promise<string> {
  const id = crypto.randomUUID();
  if (backend() === "d1") {
    await ensureD1Actor(actor);
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    if (parentId) {
      const parent = await db
        .prepare(
          `SELECT id FROM article_comments
            WHERE id = ? AND article_slug = ? AND parent_id IS NULL`,
        )
        .bind(parentId, articleSlug)
        .first<{ id: string }>();
      if (!parent) throw new Error("invalid_parent");
    }
    await db
      .prepare(
        `INSERT INTO article_comments
          (id, article_slug, email, display_name, body, parent_id,
           actor_type, is_synthetic)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        articleSlug,
        actor.key,
        actor.displayName,
        body,
        parentId,
        actor.type,
        actor.synthetic ? 1 : 0,
      )
      .run();
  } else {
    if (parentId) {
      const parent = await rest<{ id: string }[]>(
        `article_comments?id=eq.${encodeURIComponent(parentId)}&article_slug=eq.${encodeURIComponent(articleSlug)}&parent_id=is.null&select=id`,
      );
      if (!parent.length) throw new Error("invalid_parent");
    }
    await rest("article_comments", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        id,
        article_slug: articleSlug,
        actor_key: actor.key,
        display_name: actor.displayName,
        body,
        parent_id: parentId,
        actor_type: actor.type,
        is_synthetic: Boolean(actor.synthetic),
      }),
    });
  }
  await recordEvent(
    actor,
    articleSlug,
    parentId ? "reply.create" : "comment.create",
    id,
  );
  return id;
}

export async function updateArticleComment(
  actor: EngagementActor,
  articleSlug: string,
  commentId: string,
  body: string,
  canModerate = false,
): Promise<boolean> {
  if (backend() === "d1") {
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    const result = await db
      .prepare(
        `UPDATE article_comments
            SET body = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND article_slug = ? AND deleted_at IS NULL
            AND (? = 1 OR email = ?)`,
      )
      .bind(body, commentId, articleSlug, canModerate ? 1 : 0, actor.key)
      .run();
    if (!Number(result.meta.changes ?? 0)) return false;
  } else {
    const owner = canModerate
      ? ""
      : `&actor_key=eq.${encodeURIComponent(actor.key)}`;
    const updated = await rest<{ id: string }[]>(
      `article_comments?id=eq.${encodeURIComponent(commentId)}&article_slug=eq.${encodeURIComponent(articleSlug)}&deleted_at=is.null${owner}&select=id`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify({
          body,
          updated_at: new Date().toISOString(),
        }),
      },
    );
    if (!updated.length) return false;
  }
  await recordEvent(actor, articleSlug, "comment.update", commentId);
  return true;
}

export async function deleteArticleComment(
  actor: EngagementActor,
  articleSlug: string,
  commentId: string,
  canModerate = false,
): Promise<boolean> {
  const now = new Date().toISOString();
  if (backend() === "d1") {
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    const result = await db
      .prepare(
        `UPDATE article_comments
            SET body = '', deleted_at = ?, updated_at = ?
          WHERE id = ? AND article_slug = ? AND deleted_at IS NULL
            AND (? = 1 OR email = ?)`,
      )
      .bind(
        now,
        now,
        commentId,
        articleSlug,
        canModerate ? 1 : 0,
        actor.key,
      )
      .run();
    if (!Number(result.meta.changes ?? 0)) return false;
  } else {
    const owner = canModerate
      ? ""
      : `&actor_key=eq.${encodeURIComponent(actor.key)}`;
    const deleted = await rest<{ id: string }[]>(
      `article_comments?id=eq.${encodeURIComponent(commentId)}&article_slug=eq.${encodeURIComponent(articleSlug)}&deleted_at=is.null${owner}&select=id`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify({ body: "", deleted_at: now, updated_at: now }),
      },
    );
    if (!deleted.length) return false;
  }
  await recordEvent(actor, articleSlug, "comment.delete", commentId);
  return true;
}

export async function setArticleLike(
  actor: EngagementActor,
  articleSlug: string,
  liked: boolean,
): Promise<boolean> {
  let changed = false;
  if (backend() === "d1") {
    const db = d1();
    if (!db) throw new EngagementStoreUnavailableError();
    if (liked) {
      const result = await db
        .prepare(
          `INSERT OR IGNORE INTO article_likes
            (id, article_slug, actor_key, display_name, actor_type, is_synthetic)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          articleSlug,
          actor.key,
          actor.displayName,
          actor.type,
          actor.synthetic ? 1 : 0,
        )
        .run();
      changed = Number(result.meta.changes ?? 0) > 0;
    } else {
      const result = await db
        .prepare(
          `DELETE FROM article_likes
            WHERE article_slug = ? AND actor_key = ?
              AND is_synthetic = ?`,
        )
        .bind(articleSlug, actor.key, actor.synthetic ? 1 : 0)
        .run();
      changed = Number(result.meta.changes ?? 0) > 0;
    }
  } else if (liked) {
    const rows = await rest<{ id: string }[]>(
      "article_likes?on_conflict=article_slug,actor_key",
      {
        method: "POST",
        prefer: "return=representation,resolution=ignore-duplicates",
        body: JSON.stringify({
          article_slug: articleSlug,
          actor_key: actor.key,
          display_name: actor.displayName,
          actor_type: actor.type,
          is_synthetic: Boolean(actor.synthetic),
        }),
      },
    );
    changed = rows.length > 0;
  } else {
    const rows = await rest<{ id: string }[]>(
      `article_likes?article_slug=eq.${encodeURIComponent(articleSlug)}&actor_key=eq.${encodeURIComponent(actor.key)}&is_synthetic=eq.${Boolean(actor.synthetic)}&select=id`,
      {
        method: "DELETE",
        prefer: "return=representation",
      },
    );
    changed = rows.length > 0;
  }
  if (changed) {
    await recordEvent(actor, articleSlug, liked ? "like.add" : "like.remove");
  }
  return changed;
}

export async function getAnalyticsDashboard(
  windowDays = 14,
): Promise<AnalyticsDashboard> {
  const days = Math.min(90, Math.max(1, Math.trunc(windowDays)));
  if (backend() === "supabase") {
    const result = await rest<AnalyticsDashboard | AnalyticsDashboard[]>(
      "rpc/bean_wiki_analytics_dashboard",
      {
        method: "POST",
        body: JSON.stringify({ window_days: days }),
      },
    );
    const dashboard = Array.isArray(result) ? result[0] : result;
    if (!dashboard) throw new EngagementStoreUnavailableError();
    return dashboard;
  }

  const db = d1();
  if (!db) throw new EngagementStoreUnavailableError();
  const today = new Date().toISOString().slice(0, 10);
  const from = new Date(
    Date.parse(`${today}T00:00:00Z`) - (days - 1) * 86_400_000,
  )
    .toISOString()
    .slice(0, 10);

  const [
    totals,
    likes,
    comments,
    trend,
    topViews,
    topLikes,
    topComments,
    referrers,
    countries,
    hours,
  ] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) AS views,
                COUNT(DISTINCT day || ':' || session_hash) AS uniqueDailyReaders
           FROM page_views WHERE day >= ? AND day <= ?`,
      )
      .bind(from, today)
      .first<{ views: number; uniqueDailyReaders: number }>(),
    db
      .prepare(
        `SELECT actor_type AS actorType, COUNT(*) AS count
           FROM article_likes WHERE is_synthetic = 0 GROUP BY actor_type`,
      )
      .all<{ actorType: string; count: number }>(),
    db
      .prepare(
        `SELECT COUNT(*) AS count FROM article_comments
          WHERE is_synthetic = 0 AND deleted_at IS NULL`,
      )
      .first<{ count: number }>(),
    db
      .prepare(
        `SELECT day AS key, COUNT(*) AS value,
                COUNT(DISTINCT session_hash) AS secondary
           FROM page_views
          WHERE day >= ? AND day <= ?
          GROUP BY day
         HAVING COUNT(DISTINCT session_hash) >= 5
          ORDER BY day ASC`,
      )
      .bind(from, today)
      .all<AnalyticsPoint>(),
    db
      .prepare(
        `SELECT entity_key AS slug, COUNT(*) AS count
           FROM page_views
          WHERE day >= ? AND day <= ? AND entity_type = 'article'
          GROUP BY entity_key
         HAVING COUNT(DISTINCT session_hash) >= 5
          ORDER BY count DESC LIMIT 12`,
      )
      .bind(from, today)
      .all<{ slug: string; count: number }>(),
    db
      .prepare(
        `SELECT article_slug AS slug, COUNT(*) AS count
           FROM article_likes WHERE is_synthetic = 0
          GROUP BY article_slug`,
      )
      .all<{ slug: string; count: number }>(),
    db
      .prepare(
        `SELECT article_slug AS slug, COUNT(*) AS count
           FROM article_comments
          WHERE is_synthetic = 0 AND deleted_at IS NULL
          GROUP BY article_slug`,
      )
      .all<{ slug: string; count: number }>(),
    db
      .prepare(
        `SELECT referrer_class AS key, COUNT(*) AS value,
                COUNT(DISTINCT session_hash) AS secondary
           FROM page_views WHERE day >= ? AND day <= ?
          GROUP BY referrer_class
         HAVING COUNT(DISTINCT session_hash) >= 5
          ORDER BY value DESC`,
      )
      .bind(from, today)
      .all<AnalyticsPoint>(),
    db
      .prepare(
        `SELECT country_code AS key, COUNT(*) AS value,
                COUNT(DISTINCT session_hash) AS secondary
           FROM page_views WHERE day >= ? AND day <= ?
          GROUP BY country_code
         HAVING COUNT(DISTINCT session_hash) >= 5
          ORDER BY value DESC LIMIT 12`,
      )
      .bind(from, today)
      .all<AnalyticsPoint>(),
    db
      .prepare(
        `SELECT CAST(hour_bucket AS TEXT) AS key, COUNT(*) AS value,
                COUNT(DISTINCT session_hash) AS secondary
           FROM page_views WHERE day >= ? AND day <= ?
          GROUP BY hour_bucket
         HAVING COUNT(DISTINCT session_hash) >= 5
          ORDER BY hour_bucket ASC`,
      )
      .bind(from, today)
      .all<AnalyticsPoint>(),
  ]);

  const likeCounts = Object.fromEntries(
    likes.results.map((row) => [row.actorType, Number(row.count)]),
  );
  const likeBySlug = new Map(
    topLikes.results.map((row) => [row.slug, Number(row.count)]),
  );
  const commentsBySlug = new Map(
    topComments.results.map((row) => [row.slug, Number(row.count)]),
  );
  const trafficVisible = Number(totals?.uniqueDailyReaders ?? 0) >= 5;

  return {
    available: true,
    windowDays: days,
    generatedAt: new Date().toISOString(),
    totals: {
      views: trafficVisible ? Number(totals?.views ?? 0) : 0,
      uniqueDailyReaders: trafficVisible
        ? Number(totals?.uniqueDailyReaders ?? 0)
        : 0,
      humanLikes: likeCounts.human ?? 0,
      agentLikes: likeCounts.agent ?? 0,
      likes: (likeCounts.human ?? 0) + (likeCounts.agent ?? 0),
      comments: Number(comments?.count ?? 0),
    },
    trend: trend.results.map(numberPoint),
    topArticles: topViews.results.map((row) => ({
      slug: row.slug,
      views: Number(row.count),
      likes: likeBySlug.get(row.slug) ?? 0,
      comments: commentsBySlug.get(row.slug) ?? 0,
    })),
    referrers: referrers.results.map(numberPoint),
    countries: countries.results.map(numberPoint),
    hours: hours.results.map(numberPoint),
  };
}

const PUBLIC_TRAFFIC_FLOOR = 5;
const LIVE_RETENTION_DAYS = 90;

type RankedSignal = {
  slug: string;
  views: number;
};

export async function getLiveSignals(): Promise<Omit<LiveSignals, "articleCount">> {
  if (backend() === "supabase") {
    const [today, week, month, retained] = await Promise.all([
      getAnalyticsDashboard(1),
      getAnalyticsDashboard(7),
      getAnalyticsDashboard(30),
      getAnalyticsDashboard(LIVE_RETENTION_DAYS),
    ]);
    return {
      available: true,
      generatedAt: new Date().toISOString(),
      refreshSeconds: 60,
      today: {
        views: today.totals.views,
        visitors: today.totals.uniqueDailyReaders,
      },
      retained: {
        days: LIVE_RETENTION_DAYS,
        views: retained.totals.views,
        dailyVisitors: retained.totals.uniqueDailyReaders,
      },
      trend: week.trend.map((point) => ({
        day: point.key,
        views: point.value,
        visitors: point.secondary ?? 0,
      })),
      popular: {
        day: today.topArticles.slice(0, 5).map(toRankedSignal),
        week: week.topArticles.slice(0, 5).map(toRankedSignal),
        month: month.topArticles.slice(0, 5).map(toRankedSignal),
      },
      // The current Supabase compatibility RPC does not expose the velocity
      // baseline. Keep this empty rather than deriving a misleading ranking.
      trending: [],
    };
  }

  const db = d1();
  if (!db) throw new EngagementStoreUnavailableError();
  const today = new Date().toISOString().slice(0, 10);
  const weekFrom = shiftIsoDay(today, -6);
  const monthFrom = shiftIsoDay(today, -29);
  const retainedFrom = shiftIsoDay(today, -(LIVE_RETENTION_DAYS - 1));
  const baselineFrom = shiftIsoDay(today, -7);

  const [
    todayTotals,
    retainedTotals,
    trend,
    dayPopular,
    weekPopular,
    monthPopular,
    trending,
  ] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) AS views,
                COUNT(DISTINCT session_hash) AS visitors
           FROM page_views WHERE day = ?`,
      )
      .bind(today)
      .first<{ views: number; visitors: number }>(),
    db
      .prepare(
        `SELECT COUNT(*) AS views,
                COUNT(DISTINCT day || ':' || session_hash) AS dailyVisitors
           FROM page_views WHERE day >= ? AND day <= ?`,
      )
      .bind(retainedFrom, today)
      .first<{ views: number; dailyVisitors: number }>(),
    db
      .prepare(
        `SELECT day, COUNT(*) AS views,
                COUNT(DISTINCT session_hash) AS visitors
           FROM page_views
          WHERE day >= ? AND day <= ?
          GROUP BY day
         HAVING COUNT(DISTINCT session_hash) >= ?
          ORDER BY day ASC`,
      )
      .bind(weekFrom, today, PUBLIC_TRAFFIC_FLOOR)
      .all<{ day: string; views: number; visitors: number }>(),
    popularQuery(db, today, today),
    popularQuery(db, weekFrom, today),
    popularQuery(db, monthFrom, today),
    db
      .prepare(
        `SELECT current.entity_key AS slug,
                current.views AS views,
                ROUND((current.views + 1.0) /
                  ((COALESCE(baseline.views, 0) / 7.0) + 1.0), 2) AS ratio
           FROM (
             SELECT entity_key, COUNT(*) AS views,
                    COUNT(DISTINCT session_hash) AS visitors
               FROM page_views
              WHERE day = ? AND entity_type = 'article'
              GROUP BY entity_key
           ) AS current
           LEFT JOIN (
             SELECT entity_key, COUNT(*) AS views
               FROM page_views
              WHERE day >= ? AND day < ? AND entity_type = 'article'
              GROUP BY entity_key
           ) AS baseline ON baseline.entity_key = current.entity_key
          WHERE current.views >= 10 AND current.visitors >= ?
            AND (current.views + 1.0) /
                ((COALESCE(baseline.views, 0) / 7.0) + 1.0) >= 1.5
          ORDER BY ratio DESC, current.views DESC
          LIMIT 5`,
      )
      .bind(today, baselineFrom, today, PUBLIC_TRAFFIC_FLOOR)
      .all<{ slug: string; views: number; ratio: number }>(),
  ]);

  const todayVisitors = Number(todayTotals?.visitors ?? 0);
  const retainedVisitors = Number(retainedTotals?.dailyVisitors ?? 0);
  return {
    available: true,
    generatedAt: new Date().toISOString(),
    refreshSeconds: 60,
    today: {
      views:
        todayVisitors >= PUBLIC_TRAFFIC_FLOOR
          ? Number(todayTotals?.views ?? 0)
          : 0,
      visitors:
        todayVisitors >= PUBLIC_TRAFFIC_FLOOR ? todayVisitors : 0,
    },
    retained: {
      days: LIVE_RETENTION_DAYS,
      views:
        retainedVisitors >= PUBLIC_TRAFFIC_FLOOR
          ? Number(retainedTotals?.views ?? 0)
          : 0,
      dailyVisitors:
        retainedVisitors >= PUBLIC_TRAFFIC_FLOOR ? retainedVisitors : 0,
    },
    trend: trend.results.map((row) => ({
      day: String(row.day),
      views: Number(row.views),
      visitors: Number(row.visitors),
    })),
    popular: {
      day: dayPopular.results.map(normalizeRankedSignal),
      week: weekPopular.results.map(normalizeRankedSignal),
      month: monthPopular.results.map(normalizeRankedSignal),
    },
    trending: trending.results.map((row) => ({
      slug: String(row.slug),
      title: "",
      views: Number(row.views),
      ratio: Number(row.ratio),
    })),
  };
}

function popularQuery(
  db: NonNullable<ReturnType<typeof d1>>,
  from: string,
  to: string,
) {
  return db
    .prepare(
      `SELECT entity_key AS slug, COUNT(*) AS views
         FROM page_views
        WHERE day >= ? AND day <= ? AND entity_type = 'article'
        GROUP BY entity_key
       HAVING COUNT(DISTINCT session_hash) >= ?
        ORDER BY views DESC, slug ASC
        LIMIT 5`,
    )
    .bind(from, to, PUBLIC_TRAFFIC_FLOOR)
    .all<RankedSignal>();
}

function normalizeRankedSignal(row: RankedSignal) {
  return {
    slug: String(row.slug),
    title: "",
    views: Number(row.views),
  };
}

function toRankedSignal(row: AnalyticsDashboard["topArticles"][number]) {
  return { slug: row.slug, title: "", views: row.views };
}

function shiftIsoDay(day: string, amount: number) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + amount * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

function numberPoint(point: AnalyticsPoint): AnalyticsPoint {
  return {
    key: String(point.key),
    value: Number(point.value),
    ...(point.secondary === undefined
      ? {}
      : { secondary: Number(point.secondary) }),
  };
}
