ALTER TABLE `events` ADD `command` text;--> statement-breakpoint
ALTER TABLE `events` ADD `maxSubmissionCount` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `events` ADD `isActive` integer DEFAULT true;--> statement-breakpoint
CREATE UNIQUE INDEX `events_command_unique` ON `events` (`command`);