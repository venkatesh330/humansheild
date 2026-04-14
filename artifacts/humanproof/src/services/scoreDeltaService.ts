// ═══════════════════════════════════════════════════════════════════════
// scoreDeltaService.ts — Score History & Delta Tracking
// Tracks user's risk score over time via localStorage.
// Shows improvement / degradation between assessments.
// ═══════════════════════════════════════════════════════════════════════

import { KEY_REGISTRY } from '../data/riskData';

export interface ScoreHistoryEntry {
  roleKey: string;
  industryKey: string;
  countryKey: string;
  experience: string;
  score: number;
  timestamp: number; // unix ms
  isGrounded: boolean;
}

export interface ScoreDelta {
  previous: number;
  current: number;
  delta: number;         // positive = risk increased, negative = risk decreased
  daysAgo: number;
  label: string;         // e.g. "↓5 pts vs last month"
  direction: 'up' | 'down' | 'same';
}

const MAX_HISTORY = 50;

/**
 * Load full score history from localStorage
 */
export function loadScoreHistory(): ScoreHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY_REGISTRY.SCORE_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as ScoreHistoryEntry[];
  } catch {
    return [];
  }
}

/**
 * Save a new score assessment to history (dedupes by role+country+exp within 24h)
 */
export function recordScore(entry: ScoreHistoryEntry): void {
  try {
    const history = loadScoreHistory();
    const oneDayAgo = Date.now() - 86_400_000;

    // Remove duplicate within same 24h window for same role
    const filtered = history.filter(h =>
      !(h.roleKey === entry.roleKey &&
        h.countryKey === entry.countryKey &&
        h.experience === entry.experience &&
        h.timestamp > oneDayAgo)
    );

    filtered.unshift(entry);

    // Keep only last MAX_HISTORY entries
    const trimmed = filtered.slice(0, MAX_HISTORY);
    localStorage.setItem(KEY_REGISTRY.SCORE_HISTORY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable (incognito) — fail silently
  }
}

/**
 * Get score delta for a given role vs the most recent previous assessment of the same role.
 * Returns null if no previous record exists.
 */
export function getScoreDelta(
  roleKey: string,
  currentScore: number,
  experience: string,
  countryKey: string
): ScoreDelta | null {
  try {
    const history = loadScoreHistory();
    // Current assessment was just recorded — find the SECOND most recent for this role
    const sameRole = history.filter(h =>
      h.roleKey === roleKey &&
      h.experience === experience &&
      h.countryKey === countryKey
    );

    if (sameRole.length < 2) return null;

    // sameRole[0] is the current, sameRole[1] is the previous
    const previous = sameRole[1];
    const delta = currentScore - previous.score;
    const daysAgo = Math.round((Date.now() - previous.timestamp) / 86_400_000);

    let label: string;
    let direction: 'up' | 'down' | 'same';

    if (Math.abs(delta) < 1) {
      label = 'No change vs last assessment';
      direction = 'same';
    } else if (delta > 0) {
      label = `↑${Math.abs(delta)} pts vs ${daysAgo}d ago`;
      direction = 'up'; // risk increased = bad
    } else {
      label = `↓${Math.abs(delta)} pts vs ${daysAgo}d ago`;
      direction = 'down'; // risk decreased = good
    }

    return { previous: previous.score, current: currentScore, delta, daysAgo, label, direction };
  } catch {
    return null;
  }
}

/**
 * Get a user's best (lowest risk) assessment ever across all roles
 */
export function getBestScore(): ScoreHistoryEntry | null {
  const history = loadScoreHistory();
  if (!history.length) return null;
  return history.reduce((best, curr) => curr.score < best.score ? curr : best);
}

/**
 * Get unique roles the user has assessed
 */
export function getAssessedRoles(): string[] {
  const history = loadScoreHistory();
  return [...new Set(history.map(h => h.roleKey))];
}
