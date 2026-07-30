CREATE TABLE `article_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`article_slug` text NOT NULL,
	`actor_key` text NOT NULL,
	`display_name` text NOT NULL,
	`actor_type` text DEFAULT 'human' NOT NULL,
	`is_synthetic` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `article_like_actor_idx` ON `article_likes` (`article_slug`,`actor_key`);--> statement-breakpoint
CREATE INDEX `article_like_slug_idx` ON `article_likes` (`article_slug`,`created_at`);--> statement-breakpoint
CREATE TABLE `engagement_events` (
	`id` text PRIMARY KEY NOT NULL,
	`article_slug` text NOT NULL,
	`action` text NOT NULL,
	`actor_key` text NOT NULL,
	`actor_type` text DEFAULT 'human' NOT NULL,
	`subject_id` text DEFAULT '' NOT NULL,
	`is_synthetic` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `engagement_event_article_idx` ON `engagement_events` (`article_slug`,`created_at`);--> statement-breakpoint
CREATE INDEX `engagement_event_action_idx` ON `engagement_events` (`action`,`created_at`);--> statement-breakpoint
ALTER TABLE `article_comments` ADD `actor_type` text DEFAULT 'human' NOT NULL;--> statement-breakpoint
ALTER TABLE `article_comments` ADD `is_synthetic` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `article_comments` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `article_comments` ADD `deleted_at` text;--> statement-breakpoint
CREATE INDEX `article_comment_parent_idx` ON `article_comments` (`parent_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `page_views` ADD `country_code` text DEFAULT 'ZZ' NOT NULL;--> statement-breakpoint
ALTER TABLE `page_views` ADD `hour_bucket` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `page_views` ADD `device_class` text DEFAULT 'unknown' NOT NULL;