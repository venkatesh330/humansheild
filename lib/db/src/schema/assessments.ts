import { pgTable, text, timestamp, jsonb, uuid, integer } from 'drizzle-orm/pg-core';

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // text instead of uuid to allow 'anonymous' if needed, though we will enforce auth
  type: text('type').notNull(),
  score: integer('score').notNull(),
  metadata: jsonb('metadata'), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shareEntries = pgTable('share_entries', {
  code: text('code').primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
