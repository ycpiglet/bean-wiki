import { getD1 } from "../../db";
import type { ChatGPTUser } from "@/lib/chatgpt-auth";

export type ActivityKind =
  | "visit"
  | "article_view"
  | "quiz_correct"
  | "quiz_complete"
  | "post"
  | "review"
  | "comment"
  | "suggestion";

const XP_BY_KIND: Record<ActivityKind, number> = {
  visit: 2,
  article_view: 5,
  quiz_correct: 10,
  quiz_complete: 15,
  post: 20,
  review: 10,
  comment: 5,
  suggestion: 10,
};

export async function ensureProfile(user: ChatGPTUser) {
  const db = getD1();
  await db
    .prepare(
      `INSERT INTO profiles (email, display_name)
       VALUES (?, ?)
       ON CONFLICT(email) DO UPDATE SET
         display_name = excluded.display_name,
         updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(user.email, user.displayName)
    .run();
}

export async function recordActivity(
  user: ChatGPTUser,
  kind: ActivityKind,
  entityKey: string,
) {
  await ensureProfile(user);
  const db = getD1();
  const xp = XP_BY_KIND[kind];
  const inserted = await db
    .prepare(
      `INSERT OR IGNORE INTO activity_events
        (id, email, kind, entity_key, xp)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), user.email, kind, entityKey.slice(0, 160), xp)
    .run();

  const awarded = Number(inserted.meta.changes ?? 0) > 0 ? xp : 0;
  if (awarded) {
    await db
      .prepare(
        `UPDATE profiles
         SET xp = xp + ?, updated_at = CURRENT_TIMESTAMP
         WHERE email = ?`,
      )
      .bind(awarded, user.email)
      .run();
  }
  return awarded;
}

export async function getProfile(user: ChatGPTUser) {
  await ensureProfile(user);
  const db = getD1();
  const profile = await db
    .prepare(
      `SELECT email, display_name AS displayName, xp, created_at AS createdAt
       FROM profiles WHERE email = ?`,
    )
    .bind(user.email)
    .first<{
      email: string;
      displayName: string;
      xp: number;
      createdAt: string;
    }>();
  const stats = await db
    .prepare(
      `SELECT kind, COUNT(*) AS count
       FROM activity_events
       WHERE email = ?
       GROUP BY kind`,
    )
    .bind(user.email)
    .all<{ kind: ActivityKind; count: number }>();
  return {
    profile,
    stats: Object.fromEntries(
      stats.results.map((row) => [row.kind, Number(row.count)]),
    ),
  };
}

export async function getArticleFeedback(articleSlug: string) {
  const db = getD1();
  const [summary, reviews, comments] = await Promise.all([
    db
      .prepare(
        `SELECT
           ROUND(AVG(rating), 1) AS average,
           COUNT(*) AS count
         FROM article_reviews
         WHERE article_slug = ?`,
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
        `SELECT id, display_name AS displayName, body,
                parent_id AS parentId, created_at AS createdAt
         FROM article_comments
         WHERE article_slug = ?
         ORDER BY created_at ASC
         LIMIT 100`,
      )
      .bind(articleSlug)
      .all<{
        id: string;
        displayName: string;
        body: string;
        parentId: string | null;
        createdAt: string;
      }>(),
  ]);
  return {
    summary: {
      average: summary?.average ?? null,
      count: Number(summary?.count ?? 0),
    },
    reviews: reviews.results,
    comments: comments.results,
  };
}

export async function upsertArticleReview(
  user: ChatGPTUser,
  articleSlug: string,
  rating: number,
  body: string,
) {
  await ensureProfile(user);
  const db = getD1();
  await db
    .prepare(
      `INSERT INTO article_reviews
        (id, article_slug, email, display_name, rating, body)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(article_slug, email) DO UPDATE SET
         display_name = excluded.display_name,
         rating = excluded.rating,
         body = excluded.body,
         updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(
      crypto.randomUUID(),
      articleSlug,
      user.email,
      user.displayName,
      rating,
      body,
    )
    .run();
  return recordActivity(user, "review", articleSlug);
}

export async function addArticleComment(
  user: ChatGPTUser,
  articleSlug: string,
  body: string,
  parentId: string | null,
) {
  await ensureProfile(user);
  const id = crypto.randomUUID();
  await getD1()
    .prepare(
      `INSERT INTO article_comments
        (id, article_slug, email, display_name, body, parent_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, articleSlug, user.email, user.displayName, body, parentId)
    .run();
  const awarded = await recordActivity(user, "comment", id);
  return { id, awarded };
}

export async function listSuggestions() {
  const rows = await getD1()
    .prepare(
      `SELECT id, display_name AS displayName, kind, title, body, status,
              created_at AS createdAt
       FROM suggestions
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .all<{
      id: string;
      displayName: string;
      kind: string;
      title: string;
      body: string;
      status: string;
      createdAt: string;
    }>();
  return rows.results;
}

export async function createSuggestion(
  user: ChatGPTUser,
  kind: string,
  title: string,
  body: string,
) {
  await ensureProfile(user);
  const id = crypto.randomUUID();
  await getD1()
    .prepare(
      `INSERT INTO suggestions
        (id, email, display_name, kind, title, body)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, user.email, user.displayName, kind, title, body)
    .run();
  const awarded = await recordActivity(user, "suggestion", id);
  return { id, awarded };
}

export async function listCommunityPosts() {
  const rows = await getD1()
    .prepare(
      `SELECT id, display_name AS displayName, board, title, body,
              created_at AS createdAt
       FROM community_posts
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .all<{
      id: string;
      displayName: string;
      board: string;
      title: string;
      body: string;
      createdAt: string;
    }>();
  return rows.results;
}

export async function createCommunityPost(
  user: ChatGPTUser,
  board: string,
  title: string,
  body: string,
) {
  await ensureProfile(user);
  const id = crypto.randomUUID();
  await getD1()
    .prepare(
      `INSERT INTO community_posts
        (id, email, display_name, board, title, body)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, user.email, user.displayName, board, title, body)
    .run();
  const awarded = await recordActivity(user, "post", id);
  return { id, awarded };
}

export type ImportedRecommendation = {
  externalId: string;
  kind: "store" | "menu" | "bean" | "recipe";
  storeName?: string;
  name: string;
  area?: string;
  summary: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  sourceUrl?: string;
};

export async function importRecommendations(
  sourceName: string,
  items: ImportedRecommendation[],
) {
  const db = getD1();
  const statements = items.map((item) =>
    db
      .prepare(
        `INSERT INTO recommendation_items
          (id, kind, external_id, store_name, name, area, summary, tags_json,
           rating, review_count, source_name, source_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(source_name, external_id) DO UPDATE SET
           kind = excluded.kind,
           store_name = excluded.store_name,
           name = excluded.name,
           area = excluded.area,
           summary = excluded.summary,
           tags_json = excluded.tags_json,
           rating = excluded.rating,
           review_count = excluded.review_count,
           source_url = excluded.source_url,
           imported_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        crypto.randomUUID(),
        item.kind,
        item.externalId,
        item.storeName ?? null,
        item.name,
        item.area ?? null,
        item.summary,
        JSON.stringify(item.tags ?? []),
        item.rating ?? null,
        item.reviewCount ?? 0,
        sourceName,
        item.sourceUrl ?? null,
      ),
  );
  if (statements.length) await db.batch(statements);
  return statements.length;
}

export async function listRecommendations() {
  const rows = await getD1()
    .prepare(
      `SELECT id, kind, external_id AS externalId, store_name AS storeName,
              name, area, summary, tags_json AS tagsJson, rating,
              review_count AS reviewCount, source_name AS sourceName,
              source_url AS sourceUrl, imported_at AS importedAt
       FROM recommendation_items
       ORDER BY rating IS NULL, rating DESC, review_count DESC, imported_at DESC
       LIMIT 300`,
    )
    .all<{
      id: string;
      kind: string;
      externalId: string;
      storeName: string | null;
      name: string;
      area: string | null;
      summary: string;
      tagsJson: string;
      rating: number | null;
      reviewCount: number;
      sourceName: string;
      sourceUrl: string | null;
      importedAt: string;
    }>();
  return rows.results.map(({ tagsJson, ...row }) => ({
    ...row,
    tags: parseTags(tagsJson),
  }));
}

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
