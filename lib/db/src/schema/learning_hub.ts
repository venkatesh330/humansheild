import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { freeResources } from './live_signals';

// Groupings of resources form logical, ordered curricula
export const learningPaths = pgTable('learning_paths', {
  id:               uuid('id').primaryKey().defaultRandom(),
  title:            text('title').notNull(),
  description:      text('description').notNull(),
  targetRoleKey:    text('target_role_key'),       // SafeCareer role_key this path fulfills
  targetDimension:  text('target_dimension'),      // D1, D3, general
  difficultyLevel:  text('difficulty_level').notNull().default('beginner'),
  estimatedHours:   integer('estimated_hours').default(0),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
});

// Resources within a path
export const pathResources = pgTable('path_resources', {
  pathId:       uuid('path_id').notNull().references(() => learningPaths.id, { onDelete: 'cascade' }),
  resourceId:   uuid('resource_id').notNull().references(() => freeResources.id, { onDelete: 'cascade' }),
  orderIndex:   integer('order_index').notNull().default(0),
  isRequired:   boolean('is_required').notNull().default(true),
});

// Enrolled paths by users
export const userPathEnrollments = pgTable('user_path_enrollments', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       text('user_id').notNull(),         // Supabase auth user.id
  pathId:       uuid('path_id').notNull().references(() => learningPaths.id, { onDelete: 'cascade' }),
  status:       text('status').notNull().default('in_progress'), // 'in_progress' | 'completed'
  enrolledAt:   timestamp('enrolled_at').defaultNow().notNull(),
  completedAt:  timestamp('completed_at'),
});

// Specific tracking for individual resources
export const userResourceProgress = pgTable('user_resource_progress', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       text('user_id').notNull(),         // Supabase auth user.id
  resourceId:   uuid('resource_id').notNull().references(() => freeResources.id, { onDelete: 'cascade' }),
  status:       text('status').notNull().default('not_started'), // 'not_started' | 'in_progress' | 'completed'
  isBookmarked: boolean('is_bookmarked').notNull().default(false),
  startedAt:    timestamp('started_at').defaultNow().notNull(),
  completedAt:  timestamp('completed_at'),
});

export type LearningPath          = typeof learningPaths.$inferSelect;
export type PathResource          = typeof pathResources.$inferSelect;
export type UserPathEnrollment    = typeof userPathEnrollments.$inferSelect;
export type UserResourceProgress  = typeof userResourceProgress.$inferSelect;
