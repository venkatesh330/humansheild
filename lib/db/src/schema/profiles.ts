import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  industry: text('industry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
