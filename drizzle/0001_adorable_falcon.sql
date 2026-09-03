CREATE TABLE `inquiry_deliveries` (
	`sequence` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inquiry_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`desktop_enabled` integer DEFAULT 1 NOT NULL,
	`email_status` text DEFAULT 'pending' NOT NULL,
	`email_attempts` integer DEFAULT 0 NOT NULL,
	`email_next_attempt_at` integer DEFAULT 0 NOT NULL,
	`email_lease_until` integer DEFAULT 0 NOT NULL,
	`email_payload` text,
	`email_provider_id` text,
	`email_sent_at` integer,
	`email_last_error` text,
	FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiry_deliveries_inquiry_id_unique` ON `inquiry_deliveries` (`inquiry_id`);--> statement-breakpoint
CREATE INDEX `inquiry_delivery_queue_idx` ON `inquiry_deliveries` (`email_status`,`email_next_attempt_at`);