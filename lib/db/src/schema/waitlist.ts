import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

// Plan tiers for waitlist
export const planTierEnum = pgEnum('plan_tier_enum', ['pro', 'team', 'enterprise']);

export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  planTier: planTierEnum('plan_tier').default('pro').notNull(),
  referralSource: text('referral_source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
