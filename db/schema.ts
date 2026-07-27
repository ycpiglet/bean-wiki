import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const profiles = sqliteTable("profiles", {
  email: text("email").primaryKey(),
  displayName: text("display_name").notNull(),
  xp: integer("xp").notNull().default(0),
  ...timestamps,
});

export const activityEvents = sqliteTable(
  "activity_events",
  {
    id: text("id").primaryKey(),
    email: text("email")
      .notNull()
      .references(() => profiles.email, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    entityKey: text("entity_key").notNull(),
    xp: integer("xp").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("activity_event_once_idx").on(
      table.email,
      table.kind,
      table.entityKey,
    ),
    index("activity_event_email_idx").on(table.email, table.createdAt),
  ],
);

export const articleReviews = sqliteTable(
  "article_reviews",
  {
    id: text("id").primaryKey(),
    articleSlug: text("article_slug").notNull(),
    email: text("email")
      .notNull()
      .references(() => profiles.email, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    rating: integer("rating").notNull(),
    body: text("body").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("article_review_author_idx").on(
      table.articleSlug,
      table.email,
    ),
    index("article_review_slug_idx").on(table.articleSlug, table.createdAt),
  ],
);

export const articleComments = sqliteTable(
  "article_comments",
  {
    id: text("id").primaryKey(),
    articleSlug: text("article_slug").notNull(),
    email: text("email")
      .notNull()
      .references(() => profiles.email, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    body: text("body").notNull(),
    parentId: text("parent_id"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("article_comment_slug_idx").on(table.articleSlug, table.createdAt),
  ],
);

export const suggestions = sqliteTable(
  "suggestions",
  {
    id: text("id").primaryKey(),
    email: text("email")
      .notNull()
      .references(() => profiles.email, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("접수"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("suggestion_created_idx").on(table.createdAt)],
);

export const communityPosts = sqliteTable(
  "community_posts",
  {
    id: text("id").primaryKey(),
    email: text("email")
      .notNull()
      .references(() => profiles.email, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    board: text("board").notNull().default("free"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("community_post_created_idx").on(table.createdAt)],
);

export const recommendationItems = sqliteTable(
  "recommendation_items",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    externalId: text("external_id").notNull(),
    storeName: text("store_name"),
    name: text("name").notNull(),
    area: text("area"),
    summary: text("summary").notNull(),
    tagsJson: text("tags_json").notNull().default("[]"),
    rating: real("rating"),
    reviewCount: integer("review_count").notNull().default(0),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url"),
    importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("recommendation_source_external_idx").on(
      table.sourceName,
      table.externalId,
    ),
    index("recommendation_kind_rating_idx").on(table.kind, table.rating),
  ],
);
