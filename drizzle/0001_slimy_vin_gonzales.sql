CREATE TABLE `access_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(255) NOT NULL,
	`product_id` int NOT NULL,
	`max_uses` int NOT NULL DEFAULT 1,
	`used_count` int NOT NULL DEFAULT 0,
	`expires_at` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `access_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `access_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `product_type` enum('course','disk','b2c','subscription','b2b','other') NOT NULL DEFAULT 'course';--> statement-breakpoint
ALTER TABLE `products` ADD `duration_months` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `project_tasks` ADD `status` varchar(255) DEFAULT 'todo';--> statement-breakpoint
ALTER TABLE `project_tasks` ADD `order` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `access_codes` ADD CONSTRAINT `access_codes_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;