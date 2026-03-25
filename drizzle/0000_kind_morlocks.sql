CREATE TABLE `account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `account_provider_providerAccountId_pk` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `ad_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('banner','text','cta') DEFAULT 'banner',
	`placement` enum('global','task') DEFAULT 'global',
	`content` text,
	`image_url` text,
	`link_url` text,
	`button_text` varchar(255),
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ad_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`url` varchar(255) NOT NULL,
	`type` enum('internal','external') DEFAULT 'internal',
	`order` int DEFAULT 0,
	`is_visible` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL DEFAULT 0,
	`product_type` enum('course','disk','other') NOT NULL DEFAULT 'course',
	`granted_role_id` int,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_boards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `project_boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_columns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`board_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`order` int DEFAULT 0,
	`color` varchar(255),
	CONSTRAINT `project_columns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`board_id` int NOT NULL,
	`column_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`assignee_id` varchar(255),
	`creator_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`task_id` int NOT NULL,
	`content` text NOT NULL,
	`answer` text,
	`status` enum('pending','answered') DEFAULT 'pending',
	`is_read_by_user` boolean DEFAULT true,
	`is_read_by_admin` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`answered_at` timestamp,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255),
	`task_id` int,
	`status` enum('passed','failed') NOT NULL,
	`logs` text,
	`duration_ms` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`max_track_order` int DEFAULT 0,
	`has_practice_access` boolean DEFAULT false,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `task_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_id` int,
	`text` text NOT NULL,
	`options` json NOT NULL,
	`correct_answer` text NOT NULL,
	`order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `task_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`track_id` int,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`difficulty` enum('easy','medium','hard') DEFAULT 'easy',
	`initial_code` text NOT NULL,
	`expected_result` text,
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`type` enum('code','quiz') NOT NULL DEFAULT 'code',
	`options` json,
	`correct_answer` text,
	`video_url` text,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `task_track_title_idx` UNIQUE(`track_id`,`title`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`is_active` boolean DEFAULT true,
	`order` int DEFAULT 0,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`),
	CONSTRAINT `track_title_idx` UNIQUE(`title`)
);
--> statement-breakpoint
CREATE TABLE `user_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`product_id` int NOT NULL,
	`status` enum('active','expired','cancelled') DEFAULT 'active',
	`purchased_at` timestamp DEFAULT (now()),
	`expires_at` timestamp,
	CONSTRAINT `user_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`emailVerified` timestamp,
	`image` text,
	`password_hash` text,
	`role` enum('user','admin') DEFAULT 'user',
	`dynamic_role_id` int,
	`is_blocked` boolean DEFAULT false,
	`onboarding_completed` boolean DEFAULT false,
	`learning_path` enum('theory','practice'),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verificationToken_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_granted_role_id_roles_id_fk` FOREIGN KEY (`granted_role_id`) REFERENCES `roles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_columns` ADD CONSTRAINT `project_columns_board_id_project_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `project_boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_board_id_project_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `project_boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_column_id_project_columns_id_fk` FOREIGN KEY (`column_id`) REFERENCES `project_columns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_assignee_id_user_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_tasks` ADD CONSTRAINT `project_tasks_creator_id_user_id_fk` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `results` ADD CONSTRAINT `results_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `results` ADD CONSTRAINT `results_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_questions` ADD CONSTRAINT `task_questions_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_track_id_tracks_id_fk` FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_products` ADD CONSTRAINT `user_products_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_products` ADD CONSTRAINT `user_products_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_dynamic_role_id_roles_id_fk` FOREIGN KEY (`dynamic_role_id`) REFERENCES `roles`(`id`) ON DELETE set null ON UPDATE no action;