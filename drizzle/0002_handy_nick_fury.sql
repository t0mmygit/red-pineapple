ALTER TABLE `submissions` RENAME COLUMN "create_at" TO "created_at";--> statement-breakpoint
DROP INDEX "events_code_unique";--> statement-breakpoint
ALTER TABLE `events` ALTER COLUMN "code" TO "code" text(3) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `events_code_unique` ON `events` (`code`);