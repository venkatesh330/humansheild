// ═══════════════════════════════════════════════════════════
// riskData.ts — UI Stubs & Constants
// ALL PROPRIETARY BUSINESS LOGIC HAS BEEN MOVED TO BACKEND EDGE FUNCTIONS.
// This file exists only to provide KEY_REGISTRY constants to the UI and 
// prevent import breakages while keeping intelligence protected.
// ═══════════════════════════════════════════════════════════

export const DATA_VERSION = '2026-Q2';
// BUG-09 FIX: DATA_LAST_UPDATED is now computed from Vite build time.
// Vite exposes the build timestamp via import.meta.env.VITE_BUILD_DATE
// (set in vite.config.ts via define: { 'import.meta.env.VITE_BUILD_DATE': ... })
// Falls back to a static string if the env var is not set (local dev).
export const DATA_LAST_UPDATED: string = (
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env?.VITE_BUILD_DATE
) ? (import.meta as any).env.VITE_BUILD_DATE
  : new Date().toISOString().split('T')[0];

// KEY_REGISTRY — all localStorage keys used by this app
export const KEY_REGISTRY = {
  SCORE_HISTORY:      'hp_score_history',
  SKILL_SELECTIONS:   'hp_skill_selections',
  SKILL_BREAKDOWN:    'hp_skill_breakdown',
  ROADMAP_START:      'hp_roadmap_start',
  ROADMAP_START_DATE: 'hp_roadmap_start_date',
  JOURNAL_ENTRIES:    'hp_journal_entries',
  DIGEST_SUBSCRIBED:  'hp_digest_subscribed',
  QUIZ_PROGRESS:      'hp_quiz_progress',
  ROADMAP_PROGRESS:   'hp_roadmap_progress',
  VISITED:            'hp_visited',
  WAITLIST_EMAIL:     'hp_waitlist_email',
  LAST_SAVE_JOB:      'hp_last_save_job',
  LAST_SAVE_SKILL:    'hp_last_save_skill',
  LAST_SAVE_HUMAN:    'hp_last_save_human-index',
  HISTORY_WARNED:     'hp_history_warned',
} as const;

// Stubs to prevent type errors in older components
export const TASK_AUTO: Record<string, Record<string, number>> = {};
export const DISRUPTION_VELOCITY: Record<string, number> = {};
export const AUGMENTATION: Record<string, number> = {};
export const NETWORK_MOAT: Record<string, number> = {};
export const EXP_SENSITIVITY: Record<string, number> = {};
export const EXP_RISK_BASE: Record<string, number> = {};
export const COUNTRY_DATA: Record<string, [number, number]> = {};
export const INDUSTRY_KEY_MULT: Record<string, number> = {};
export const D3_CURVE_EXPONENT = 0.70;
