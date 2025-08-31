import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

const users = sqliteTable('users', {
  id: text().primaryKey(),
  username: text(),
});

export { users };
