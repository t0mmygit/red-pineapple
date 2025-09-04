import { InferInsertModel, sql } from 'drizzle-orm';
import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';

// User Table
export const users = table('users', {
  id: text().primaryKey(),
  username: text(),
});

export type NewUser = typeof users.$inferInsert;

// Event Table
export const events = table('events', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  code: text({ length: 3 }).unique().notNull(),
  name: text({ length: 256 }).notNull(),
  command: text().unique(),
  maxSubmissionCount: integer('max_submission_count', { mode: 'number' }).default(1),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

// Submission Table
export const submissions = table('submissions', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$onUpdate(() => new Date()),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type InferInsertSubmission = InferInsertModel<typeof submissions>;
