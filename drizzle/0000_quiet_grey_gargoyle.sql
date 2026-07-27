CREATE TABLE `activity_events` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`kind` text NOT NULL,
	`entity_key` text NOT NULL,
	`xp` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_event_once_idx` ON `activity_events` (`email`,`kind`,`entity_key`);--> statement-breakpoint
CREATE INDEX `activity_event_email_idx` ON `activity_events` (`email`,`created_at`);--> statement-breakpoint
CREATE TABLE `article_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`article_slug` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`body` text NOT NULL,
	`parent_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `article_comment_slug_idx` ON `article_comments` (`article_slug`,`created_at`);--> statement-breakpoint
CREATE TABLE `article_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`article_slug` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `article_review_author_idx` ON `article_reviews` (`article_slug`,`email`);--> statement-breakpoint
CREATE INDEX `article_review_slug_idx` ON `article_reviews` (`article_slug`,`created_at`);--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`board` text DEFAULT 'free' NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `community_post_created_idx` ON `community_posts` (`created_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recommendation_items` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`external_id` text NOT NULL,
	`store_name` text,
	`name` text NOT NULL,
	`area` text,
	`summary` text NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`rating` real,
	`review_count` integer DEFAULT 0 NOT NULL,
	`source_name` text NOT NULL,
	`source_url` text,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recommendation_source_external_idx` ON `recommendation_items` (`source_name`,`external_id`);--> statement-breakpoint
CREATE INDEX `recommendation_kind_rating_idx` ON `recommendation_items` (`kind`,`rating`);--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT '접수' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `suggestion_created_idx` ON `suggestions` (`created_at`);