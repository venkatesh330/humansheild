import { pgTable, text, timestamp, jsonb, uuid, real, integer } from 'drizzle-orm/pg-core';

// Raw signals ingested from external sources (BLS, HN Algolia, Adzuna, etc.)
export const liveSignals = pgTable('live_signals', {
  id:             uuid('id').primaryKey().defaultRandom(),
  roleKey:        text('role_key').notNull(),        // e.g. 'fin_account', 'sw_backend'
  dimension:      text('dimension').notNull(),        // 'D1' | 'D2' | 'D3' | 'D4' | 'D5'
  sourceName:     text('source_name').notNull(),      // 'BLS' | 'HackerNews' | 'Adzuna'
  sourceUrl:      text('source_url'),
  rawValue:       real('raw_value').notNull(),        // 0-100 normalised
  rawPayload:     jsonb('raw_payload'),               // full source JSON for traceability
  fetchedAt:      timestamp('fetched_at').defaultNow().notNull(),
  validUntil:     timestamp('valid_until').notNull(), // TTL: when this signal expires
  confidencePct:  integer('confidence_pct').notNull().default(50), // 0-100
});

// Validated consensus scores after cross-source triangulation
export const validatedScores = pgTable('validated_scores', {
  id:             uuid('id').primaryKey().defaultRandom(),
  roleKey:        text('role_key').notNull().unique(),
  d1:             real('d1').notNull(),
  d2:             real('d2').notNull(),
  d3:             real('d3').notNull(),
  d4:             real('d4').notNull(),
  d5:             real('d5').notNull(),
  d6:             real('d6').notNull(),
  finalScore:     integer('final_score').notNull(),   // 3-97, calibrated score
  confidencePct:  integer('confidence_pct').notNull().default(50),
  sourcesUsed:    text('sources_used').array(),       // ['BLS','HN','Adzuna']
  outliersRemoved:text('outliers_removed').array(),
  computedAt:     timestamp('computed_at').defaultNow().notNull(),
  validUntil:     timestamp('valid_until').notNull(),
});

// Current D1-D6 dimension weights (auto-updated by score calibrator)
export const signalWeights = pgTable('signal_weights', {
  id:         uuid('id').primaryKey().defaultRandom(),
  d1Weight:   real('d1_weight').notNull().default(0.26),
  d2Weight:   real('d2_weight').notNull().default(0.18),
  d3Weight:   real('d3_weight').notNull().default(0.20),
  d4Weight:   real('d4_weight').notNull().default(0.16),
  d5Weight:   real('d5_weight').notNull().default(0.09),
  d6Weight:   real('d6_weight').notNull().default(0.11),
  reason:     text('reason'),                         // why weights changed
  calibratedBy: text('calibrated_by').default('auto'),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});

// Full audit trail — every data change with old vs new value
export const dataAuditLog = pgTable('data_audit_log', {
  id:         uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(),          // 'signal_weight' | 'validated_score' | 'live_signal'
  entityId:   text('entity_id').notNull(),
  fieldName:  text('field_name').notNull(),
  oldValue:   text('old_value'),
  newValue:   text('new_value').notNull(),
  changeReason: text('change_reason'),
  sourceName: text('source_name'),
  changedAt:  timestamp('changed_at').defaultNow().notNull(),
});

// Pre-computed safe and future-proof career rankings
export const safeCareers = pgTable('safe_careers', {
  id:               uuid('id').primaryKey().defaultRandom(),
  roleKey:          text('role_key').notNull().unique(),
  roleTitle:        text('role_title').notNull(),
  industryKey:      text('industry_key').notNull(),
  industryLabel:    text('industry_label').notNull(),
  riskScore:        integer('risk_score').notNull(),       // 3-97, lower = safer
  growthProjection: real('growth_projection'),            // BLS % growth 2024-2034
  medianSalaryUsd:  integer('median_salary_usd'),
  remoteViable:     text('remote_viable').notNull().default('partial'), // 'yes'|'partial'|'no'
  educationRequired:text('education_required').notNull().default('bachelor'),
  automationD1:     real('automation_d1'),
  augmentationD3:   real('augmentation_d3'),
  disruptionD2:     real('disruption_d2'),
  safetyReason:     text('safety_reason'),                // human-readable explanation
  computedAt:       timestamp('computed_at').defaultNow().notNull(),
});

// Free learning resources (multilingual, sourced from open platforms)
export const freeResources = pgTable('free_resources', {
  id:             uuid('id').primaryKey().defaultRandom(),
  title:          text('title').notNull(),
  provider:       text('provider').notNull(),              // 'Coursera' | 'Kaggle' | 'fast.ai' etc.
  url:            text('url').notNull(),
  language:       text('language').notNull().default('en'),// ISO 639-1 code
  languageLabel:  text('language_label').notNull().default('English'),
  isFree:         text('is_free').notNull().default('yes'),// 'yes'|'audit'|'scholarship'
  level:          text('level').notNull().default('beginner'),// 'beginner'|'intermediate'|'advanced'
  durationHours:  integer('duration_hours'),
  targetRoleKeys: text('target_role_keys').array(),        // which roles this helps
  targetDimension:text('target_dimension'),                // 'D1'|'D3'|'general' — which risk it addresses
  riskLevelTarget:text('risk_level_target'),               // 'critical'|'high'|'moderate'|'all'
  tags:           text('tags').array(),
  syncedAt:       timestamp('synced_at').defaultNow().notNull(),
});

export type LiveSignal      = typeof liveSignals.$inferSelect;
export type ValidatedScore  = typeof validatedScores.$inferSelect;
export type SignalWeight     = typeof signalWeights.$inferSelect;
export type DataAuditEntry  = typeof dataAuditLog.$inferSelect;
export type SafeCareer      = typeof safeCareers.$inferSelect;
export type FreeResource    = typeof freeResources.$inferSelect;
