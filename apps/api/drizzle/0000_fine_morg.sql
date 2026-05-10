CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`estimated_cost` real DEFAULT 0,
	`duration_min` integer DEFAULT 60,
	`latitude` real,
	`longitude` real,
	`osm_id` integer,
	`image_url` text,
	`source` text DEFAULT 'seed',
	`created_by` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_activities_city` ON `activities` (`city_id`);--> statement-breakpoint
CREATE INDEX `idx_activities_category` ON `activities` (`category`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`metadata` text,
	`ip_address` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_created` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `budget_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`stop_id` text,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`currency_code` text DEFAULT 'USD',
	`description` text,
	`entry_date` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`stop_id`) REFERENCES `stops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_budget_trip` ON `budget_entries` (`trip_id`);--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country_code` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`osm_id` integer,
	`population` integer,
	`popularity` integer DEFAULT 0,
	`cost_index` real,
	`description` text,
	`image_url` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`country_code`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_cities_country` ON `cities` (`country_code`);--> statement-breakpoint
CREATE INDEX `idx_cities_name` ON `cities` (`name`);--> statement-breakpoint
CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`currency_code` text NOT NULL,
	`currency_symbol` text,
	`flag_emoji` text,
	`region` text,
	`cost_index` real
);
--> statement-breakpoint
CREATE TABLE `packing_items` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'misc',
	`is_packed` integer DEFAULT false,
	`quantity` integer DEFAULT 1,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_packing_trip` ON `packing_items` (`trip_id`);--> statement-breakpoint
CREATE TABLE `public_itineraries` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`slug` text NOT NULL,
	`view_count` integer DEFAULT 0,
	`clone_count` integer DEFAULT 0,
	`published_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `public_itineraries_trip_id_unique` ON `public_itineraries` (`trip_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `public_itineraries_slug_unique` ON `public_itineraries` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_public_slug` ON `public_itineraries` (`slug`);--> statement-breakpoint
CREATE TABLE `saved_destinations` (
	`user_id` text NOT NULL,
	`city_id` text NOT NULL,
	`saved_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pk_saved_dest` ON `saved_destinations` (`user_id`,`city_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`refresh_token_hash` text NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`expires_at` text NOT NULL,
	`revoked` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `stop_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`stop_id` text NOT NULL,
	`activity_id` text NOT NULL,
	`scheduled_date` text,
	`scheduled_time` text,
	`custom_cost` real,
	`notes` text,
	`order_index` integer DEFAULT 0,
	FOREIGN KEY (`stop_id`) REFERENCES `stops`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_stop_act_stop` ON `stop_activities` (`stop_id`);--> statement-breakpoint
CREATE TABLE `stops` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`city_id` text NOT NULL,
	`arrival_date` text NOT NULL,
	`departure_date` text NOT NULL,
	`order_index` integer NOT NULL,
	`accommodation` text,
	`accommodation_cost` real DEFAULT 0,
	`transport_cost` real DEFAULT 0,
	`meal_cost_per_day` real DEFAULT 0,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_stops_trip` ON `stops` (`trip_id`,`order_index`);--> statement-breakpoint
CREATE TABLE `trip_clones` (
	`id` text PRIMARY KEY NOT NULL,
	`source_trip_id` text NOT NULL,
	`cloned_trip_id` text NOT NULL,
	`cloned_by` text NOT NULL,
	`cloned_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`source_trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cloned_trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cloned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trip_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`stop_id` text,
	`title` text,
	`body` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`stop_id`) REFERENCES `stops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notes_trip` ON `trip_notes` (`trip_id`);--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`cover_image_url` text,
	`budget_limit` real,
	`currency_code` text DEFAULT 'USD',
	`is_public` integer DEFAULT false,
	`status` text DEFAULT 'planning',
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`deleted_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_trips_user` ON `trips` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_trips_public` ON `trips` (`is_public`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`avatar_url` text,
	`language` text DEFAULT 'en',
	`role` text DEFAULT 'user',
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);