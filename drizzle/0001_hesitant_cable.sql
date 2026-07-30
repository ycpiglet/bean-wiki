CREATE TABLE `api_client_events` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text,
	`request_id` text NOT NULL,
	`action` text NOT NULL,
	`resource` text DEFAULT '' NOT NULL,
	`status` integer NOT NULL,
	`scope` text DEFAULT '' NOT NULL,
	`row_count` integer,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `api_client_event_client_idx` ON `api_client_events` (`client_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `api_client_event_action_idx` ON `api_client_events` (`action`,`created_at`);--> statement-breakpoint
CREATE TABLE `api_clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`org` text DEFAULT '' NOT NULL,
	`client_type` text DEFAULT 'human_app' NOT NULL,
	`secret_prefix` text NOT NULL,
	`secret_hash` text NOT NULL,
	`scopes_json` text DEFAULT '[]' NOT NULL,
	`max_tier` text DEFAULT 'T1' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`rate_limit_per_min` integer DEFAULT 60 NOT NULL,
	`quota_period` text DEFAULT 'month' NOT NULL,
	`quota_limit` integer,
	`quota_used` integer DEFAULT 0 NOT NULL,
	`quota_reset_at` text,
	`ip_allowlist_json` text DEFAULT '[]' NOT NULL,
	`webhook_url` text,
	`webhook_secret_hash` text,
	`contact_email` text,
	`expires_at` text,
	`last_used_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_client_secret_prefix_idx` ON `api_clients` (`secret_prefix`);--> statement-breakpoint
CREATE INDEX `api_client_status_idx` ON `api_clients` (`status`);--> statement-breakpoint
CREATE TABLE `api_rate_buckets` (
	`client_id` text NOT NULL,
	`window_start` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_rate_bucket_idx` ON `api_rate_buckets` (`client_id`,`window_start`);