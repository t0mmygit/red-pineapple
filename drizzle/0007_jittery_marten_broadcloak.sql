DROP INDEX "events_code_unique";--> statement-breakpoint
DROP INDEX "events_command_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "username" TO "username" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `events_code_unique` ON `events` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `events_command_unique` ON `events` (`command`);