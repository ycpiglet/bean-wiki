CREATE TABLE `bot_command_events` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`actor_ref` text NOT NULL,
	`actor_role` text NOT NULL,
	`surface` text DEFAULT 'api' NOT NULL,
	`command_id` text,
	`params_json` text DEFAULT '{}' NOT NULL,
	`mode` text DEFAULT 'read' NOT NULL,
	`outcome` text NOT NULL,
	`row_count` integer,
	`suppressed` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bot_command_actor_idx` ON `bot_command_events` (`actor_ref`,`created_at`);--> statement-breakpoint
CREATE INDEX `bot_command_id_idx` ON `bot_command_events` (`command_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `bot_confirmations` (
	`token` text PRIMARY KEY NOT NULL,
	`actor_ref` text NOT NULL,
	`command_id` text NOT NULL,
	`params_json` text DEFAULT '{}' NOT NULL,
	`expires_at` text NOT NULL,
	`consumed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bot_confirmation_actor_idx` ON `bot_confirmations` (`actor_ref`);--> statement-breakpoint
CREATE TABLE `content_request_events` (
	`id` text PRIMARY KEY NOT NULL,
	`request_row_id` text NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`actor_type` text DEFAULT 'system' NOT NULL,
	`actor_ref` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `content_request_event_row_idx` ON `content_request_events` (`request_row_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `content_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text,
	`external_id` text NOT NULL,
	`kind` text DEFAULT 'new_article' NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`locale` text DEFAULT 'ko' NOT NULL,
	`entity_refs_json` text DEFAULT '[]' NOT NULL,
	`demand_evidence_json` text DEFAULT '{}' NOT NULL,
	`priority_hint` text DEFAULT 'normal' NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`resolution_article_slug` text,
	`resolution_url` text,
	`declined_reason` text,
	`duplicate_of` text,
	`suggestion_id` text,
	`callback_url` text,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_request_idempotency_idx` ON `content_requests` (`client_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `content_request_updated_idx` ON `content_requests` (`updated_at`,`id`);--> statement-breakpoint
CREATE INDEX `content_request_status_idx` ON `content_requests` (`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`external_id` text NOT NULL,
	`article_slug` text NOT NULL,
	`locale` text DEFAULT 'ko' NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`body_html` text NOT NULL,
	`change_note` text DEFAULT '' NOT NULL,
	`content_request_id` text,
	`actor_json` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`check_report_json` text DEFAULT '{}' NOT NULL,
	`proposal_url` text,
	`rejected_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contribution_idempotency_idx` ON `contributions` (`client_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `contribution_status_idx` ON `contributions` (`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `daily_metrics` (
	`day` text NOT NULL,
	`metric` text NOT NULL,
	`dimension_key` text DEFAULT '' NOT NULL,
	`value` real DEFAULT 0 NOT NULL,
	`subject_count` integer DEFAULT 0 NOT NULL,
	`computed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_metric_idx` ON `daily_metrics` (`day`,`metric`,`dimension_key`);--> statement-breakpoint
CREATE INDEX `daily_metric_metric_idx` ON `daily_metrics` (`metric`,`day`);--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`entity_type` text DEFAULT '' NOT NULL,
	`entity_key` text DEFAULT '' NOT NULL,
	`locale` text DEFAULT 'ko' NOT NULL,
	`day` text NOT NULL,
	`session_hash` text NOT NULL,
	`referrer_class` text DEFAULT 'direct' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `page_view_day_entity_idx` ON `page_views` (`day`,`entity_type`,`entity_key`);--> statement-breakpoint
CREATE INDEX `page_view_created_idx` ON `page_views` (`created_at`);--> statement-breakpoint
CREATE TABLE `resolve_misses` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text DEFAULT '' NOT NULL,
	`query` text NOT NULL,
	`normalized_query` text NOT NULL,
	`client_id` text,
	`hit_count` integer DEFAULT 1 NOT NULL,
	`content_request_id` text,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resolve_miss_idx` ON `resolve_misses` (`entity_type`,`normalized_query`);--> statement-breakpoint
CREATE INDEX `resolve_miss_count_idx` ON `resolve_misses` (`hit_count`,`last_seen_at`);--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`event` text NOT NULL,
	`resource_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_status_code` integer,
	`last_error` text DEFAULT '' NOT NULL,
	`next_attempt_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `webhook_delivery_status_idx` ON `webhook_deliveries` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE INDEX `webhook_delivery_client_idx` ON `webhook_deliveries` (`client_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `profiles` ADD `role` text DEFAULT 'reader' NOT NULL;