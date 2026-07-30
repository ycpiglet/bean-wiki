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
  // reader | editor | admin | owner. Authorises operator surfaces (the bot,
  // request triage, client management), which the pre-existing
  // GITHUB_ALLOWED_LOGINS / GOOGLE_ALLOWED_EMAILS allowlists cannot express.
  // Bootstrap owners come from PLATFORM_OWNER_EMAILS; see src/lib/roles.ts.
  role: text("role").notNull().default("reader"),
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
    actorType: text("actor_type").notNull().default("human"),
    isSynthetic: integer("is_synthetic").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    index("article_comment_slug_idx").on(table.articleSlug, table.createdAt),
    index("article_comment_parent_idx").on(table.parentId, table.createdAt),
  ],
);

export const articleLikes = sqliteTable(
  "article_likes",
  {
    id: text("id").primaryKey(),
    articleSlug: text("article_slug").notNull(),
    actorKey: text("actor_key").notNull(),
    displayName: text("display_name").notNull(),
    actorType: text("actor_type").notNull().default("human"),
    isSynthetic: integer("is_synthetic").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("article_like_actor_idx").on(table.articleSlug, table.actorKey),
    index("article_like_slug_idx").on(table.articleSlug, table.createdAt),
  ],
);

export const engagementEvents = sqliteTable(
  "engagement_events",
  {
    id: text("id").primaryKey(),
    articleSlug: text("article_slug").notNull(),
    action: text("action").notNull(),
    actorKey: text("actor_key").notNull(),
    actorType: text("actor_type").notNull().default("human"),
    subjectId: text("subject_id").notNull().default(""),
    isSynthetic: integer("is_synthetic").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("engagement_event_article_idx").on(
      table.articleSlug,
      table.createdAt,
    ),
    index("engagement_event_action_idx").on(table.action, table.createdAt),
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

// --- Platform interop (docs/PLATFORM-CONTRACT-V1.md) ---------------------
//
// Machine callers are first-class: every non-browser request to an /api/*/v1
// route authenticates as an `api_clients` row, not as a user. Scopes use the
// `resource:action[:tier]` grammar shared with the Beanote contract.

export const apiClients = sqliteTable(
  "api_clients",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    org: text("org").notNull().default(""),
    // human_app: another product's backend. agent: an autonomous AI caller.
    // internal: first-party jobs (cron, admin console).
    clientType: text("client_type").notNull().default("human_app"),
    // Only ever store the hash. `secret_prefix` is the lookup key and the only
    // part safe to display after creation.
    secretPrefix: text("secret_prefix").notNull(),
    secretHash: text("secret_hash").notNull(),
    scopesJson: text("scopes_json").notNull().default("[]"),
    maxTier: text("max_tier").notNull().default("T1"),
    status: text("status").notNull().default("active"),
    rateLimitPerMin: integer("rate_limit_per_min").notNull().default(60),
    // Reserved for the credit-metered agent tier so enabling it needs no
    // migration: quota_limit null means unmetered.
    quotaPeriod: text("quota_period").notNull().default("month"),
    quotaLimit: integer("quota_limit"),
    quotaUsed: integer("quota_used").notNull().default(0),
    quotaResetAt: text("quota_reset_at"),
    ipAllowlistJson: text("ip_allowlist_json").notNull().default("[]"),
    webhookUrl: text("webhook_url"),
    // Verifies a signature the CLIENT sends us. It cannot produce one: outbound
    // signing needs the plaintext, which we deliberately do not store. See the
    // STATUS note in src/lib/requests/webhook.ts before enabling delivery.
    webhookSecretHash: text("webhook_secret_hash"),
    contactEmail: text("contact_email"),
    expiresAt: text("expires_at"),
    lastUsedAt: text("last_used_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("api_client_secret_prefix_idx").on(table.secretPrefix),
    index("api_client_status_idx").on(table.status),
  ],
);

// Append-only audit trail. Never write secrets, tokens, OCR raw text, free-form
// notes, or expiring asset URLs here (BEANOTE-DATA-API-V1.md §13).
export const apiClientEvents = sqliteTable(
  "api_client_events",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id"),
    requestId: text("request_id").notNull(),
    action: text("action").notNull(),
    resource: text("resource").notNull().default(""),
    status: integer("status").notNull(),
    scope: text("scope").notNull().default(""),
    rowCount: integer("row_count"),
    detail: text("detail").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("api_client_event_client_idx").on(table.clientId, table.createdAt),
    index("api_client_event_action_idx").on(table.action, table.createdAt),
  ],
);

// Fixed-window rate limit counters. One row per (client, minute); old rows are
// pruned opportunistically rather than on a schedule.
export const apiRateBuckets = sqliteTable(
  "api_rate_buckets",
  {
    clientId: text("client_id").notNull(),
    windowStart: text("window_start").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("api_rate_bucket_idx").on(table.clientId, table.windowStart),
  ],
);

// --- Content requests (docs/CONTENT-REQUEST-API-V1.md) --------------------
//
// The machine-facing twin of `suggestions`. Two intake paths, one triage queue:
// a human form row in `suggestions` may link here via `suggestion_id`, and this
// table carries the fields a program can actually supply — which entities the
// request is about, and the evidence that demand exists.

export const contentRequests = sqliteTable(
  "content_requests",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id"),
    // Caller's own id for this request. Together with client_id it makes
    // submission idempotent, mirroring recommendation_items.
    externalId: text("external_id").notNull(),
    kind: text("kind").notNull().default("new_article"),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    locale: text("locale").notNull().default("ko"),
    entityRefsJson: text("entity_refs_json").notNull().default("[]"),
    demandEvidenceJson: text("demand_evidence_json").notNull().default("{}"),
    priorityHint: text("priority_hint").notNull().default("normal"),
    status: text("status").notNull().default("received"),
    resolutionArticleSlug: text("resolution_article_slug"),
    resolutionUrl: text("resolution_url"),
    declinedReason: text("declined_reason"),
    duplicateOf: text("duplicate_of"),
    // Links a machine request to the human suggestion row it was merged with.
    suggestionId: text("suggestion_id"),
    callbackUrl: text("callback_url"),
    // Monotonic per row; lets pulling clients dedupe by (id, revision).
    revision: integer("revision").notNull().default(1),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("content_request_idempotency_idx").on(
      table.clientId,
      table.externalId,
    ),
    // Cursor pagination sorts on (updated_at, id); see PLATFORM-CONTRACT-V1 §5.
    index("content_request_updated_idx").on(table.updatedAt, table.id),
    index("content_request_status_idx").on(table.status, table.updatedAt),
  ],
);

export const contentRequestEvents = sqliteTable(
  "content_request_events",
  {
    id: text("id").primaryKey(),
    requestRowId: text("request_row_id").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actorType: text("actor_type").notNull().default("system"),
    actorRef: text("actor_ref").notNull().default(""),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("content_request_event_row_idx").on(
      table.requestRowId,
      table.createdAt,
    ),
  ],
);

// Outbound notification attempts. Kept so a client can ask "did you try to tell
// me?" and so retries are bounded rather than infinite.
export const webhookDeliveries = sqliteTable(
  "webhook_deliveries",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull(),
    event: text("event").notNull(),
    resourceId: text("resource_id").notNull(),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastStatusCode: integer("last_status_code"),
    lastError: text("last_error").notNull().default(""),
    nextAttemptAt: text("next_attempt_at"),
    ...timestamps,
  },
  (table) => [
    index("webhook_delivery_status_idx").on(table.status, table.nextAttemptAt),
    index("webhook_delivery_client_idx").on(table.clientId, table.createdAt),
  ],
);

// --- Contributions (Phase 4) ----------------------------------------------
//
// A draft submitted by an external human app or AI agent. Never auto-publishes:
// it records provenance and parks the draft until the editorial checks and a
// human reviewer clear it.
export const contributions = sqliteTable(
  "contributions",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull(),
    externalId: text("external_id").notNull(),
    articleSlug: text("article_slug").notNull(),
    locale: text("locale").notNull().default("ko"),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    bodyHtml: text("body_html").notNull(),
    changeNote: text("change_note").notNull().default(""),
    contentRequestId: text("content_request_id"),
    // actor: { type, client_id, model, operator, harness_version }
    actorJson: text("actor_json").notNull().default("{}"),
    status: text("status").notNull().default("received"),
    checkReportJson: text("check_report_json").notNull().default("{}"),
    proposalUrl: text("proposal_url"),
    rejectedReason: text("rejected_reason"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("contribution_idempotency_idx").on(
      table.clientId,
      table.externalId,
    ),
    index("contribution_status_idx").on(table.status, table.updatedAt),
  ],
);

// --- Telemetry read model (docs/TELEMETRY-AND-PRIVACY.md) -----------------
//
// `activity_events` is an XP ledger: its unique index collapses repeat views to
// one row per (user, kind, entity) forever, and it only records signed-in users.
// It therefore cannot answer "most read" or "trending". This is the append-only
// traffic log that can.
//
// No IP, no user agent, no account key. `session_hash` is salted with a salt
// that rotates daily, so it groups a single day's requests and nothing longer.
export const pageViews = sqliteTable(
  "page_views",
  {
    id: text("id").primaryKey(),
    path: text("path").notNull(),
    entityType: text("entity_type").notNull().default(""),
    entityKey: text("entity_key").notNull().default(""),
    locale: text("locale").notNull().default("ko"),
    day: text("day").notNull(),
    sessionHash: text("session_hash").notNull(),
    // internal | search | social | direct | app:<client-id>
    referrerClass: text("referrer_class").notNull().default("direct"),
    // Coarse request metadata only. Never store an IP or raw user agent.
    countryCode: text("country_code").notNull().default("ZZ"),
    hourBucket: integer("hour_bucket").notNull().default(0),
    deviceClass: text("device_class").notNull().default("unknown"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("page_view_day_entity_idx").on(
      table.day,
      table.entityType,
      table.entityKey,
    ),
    index("page_view_created_idx").on(table.createdAt),
  ],
);

export const dailyMetrics = sqliteTable(
  "daily_metrics",
  {
    day: text("day").notNull(),
    metric: text("metric").notNull(),
    dimensionKey: text("dimension_key").notNull().default(""),
    value: real("value").notNull().default(0),
    // Distinct-subject count behind `value`, so the k-anonymity floor can be
    // applied at read time without recomputing from raw rows.
    subjectCount: integer("subject_count").notNull().default(0),
    computedAt: text("computed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("daily_metric_idx").on(
      table.day,
      table.metric,
      table.dimensionKey,
    ),
    index("daily_metric_metric_idx").on(table.metric, table.day),
  ],
);

// Every `/knowledge/v1/resolve` miss. This is the content-gap signal: a term an
// integrating app tried to normalise and Bean Wiki could not explain.
export const resolveMisses = sqliteTable(
  "resolve_misses",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull().default(""),
    query: text("query").notNull(),
    normalizedQuery: text("normalized_query").notNull(),
    clientId: text("client_id"),
    hitCount: integer("hit_count").notNull().default(1),
    // Set once a request has been filed, so the same gap is not re-queued.
    contentRequestId: text("content_request_id"),
    firstSeenAt: text("first_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("resolve_miss_idx").on(table.entityType, table.normalizedQuery),
    index("resolve_miss_count_idx").on(table.hitCount, table.lastSeenAt),
  ],
);

// --- Operator bot (docs/BOT-COMMAND-CATALOG.md) ---------------------------
//
// Audit trail for every command the bot ran. Stores the matched catalogue id and
// parameters, never the message text or the result rows.
export const botCommandEvents = sqliteTable(
  "bot_command_events",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id").notNull(),
    actorRef: text("actor_ref").notNull(),
    actorRole: text("actor_role").notNull(),
    surface: text("surface").notNull().default("api"),
    commandId: text("command_id"),
    paramsJson: text("params_json").notNull().default("{}"),
    mode: text("mode").notNull().default("read"),
    outcome: text("outcome").notNull(),
    rowCount: integer("row_count"),
    suppressed: integer("suppressed").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("bot_command_actor_idx").on(table.actorRef, table.createdAt),
    index("bot_command_id_idx").on(table.commandId, table.createdAt),
  ],
);

// Single-use confirmation tokens for write-mode bot commands.
export const botConfirmations = sqliteTable(
  "bot_confirmations",
  {
    token: text("token").primaryKey(),
    actorRef: text("actor_ref").notNull(),
    commandId: text("command_id").notNull(),
    paramsJson: text("params_json").notNull().default("{}"),
    expiresAt: text("expires_at").notNull(),
    consumedAt: text("consumed_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("bot_confirmation_actor_idx").on(table.actorRef)],
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
