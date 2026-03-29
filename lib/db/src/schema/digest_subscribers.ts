import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const digestSubscribersTable = pgTable('digest_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  status: text('status').notNull().default('active'),
  subscribedAt: timestamp('subscribed_at').notNull().defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at'),
});

export const insertDigestSubscriberSchema = createInsertSchema(digestSubscribersTable).omit({
  id: true,
  subscribedAt: true,
  unsubscribedAt: true,
});

export type InsertDigestSubscriber = z.infer<typeof insertDigestSubscriberSchema>;
export type DigestSubscriber = typeof digestSubscribersTable.$inferSelect;
