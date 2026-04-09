// scoreStorageService.ts
// Layoff-specific score persistence with typed history and drift detection

import { ScoreResult, ScoreBreakdown } from './layoffScoreEngine';

const STORAGE_KEY = 'hp_layoff_score_history';

export interface ScoreHistoryEntry {
  id: string;
  score: number;
  tier: string;
  tierColor: string;
  companyName: string;
  roleTitle: string;
  department: string;
  breakdown: ScoreBreakdown;
  confidence: string;
  timestamp: string;
}

export interface DriftResult {
  drift: number;
  direction: 'increased' | 'decreased';
  from: number;
  to: number;
  fromDate: string;
  daysSince: number;
}

export const saveLayoffScore = (
  scoreResult: ScoreResult,
  companyName: string,
  roleTitle: string,
  department: string = ''
): ScoreHistoryEntry => {
  const entry: ScoreHistoryEntry = {
    id: crypto.randomUUID(),
    score: scoreResult.score,
    tier: scoreResult.tier.label,
    tierColor: scoreResult.tier.color,
    companyName,
    roleTitle,
    department,
    breakdown: scoreResult.breakdown,
    confidence: scoreResult.confidence,
    timestamp: new Date().toISOString(),
  };

  const history = getLayoffScoreHistory();
  history.push(entry);

  // Keep last 50 entries
  while (history.length > 50) history.shift();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
};

export const getLayoffScoreHistory = (): ScoreHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate entries have required fields
    return parsed.filter(
      (e: any) =>
        typeof e.id === 'string' &&
        typeof e.score === 'number' &&
        typeof e.timestamp === 'string'
    );
  } catch {
    return [];
  }
};

export const clearLayoffScoreHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const detectScoreDrift = (): DriftResult | null => {
  const history = getLayoffScoreHistory();
  if (history.length < 2) return null;

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const drift = latest.score - previous.score;

  if (Math.abs(drift) < 5) return null;

  return {
    drift,
    direction: drift > 0 ? 'increased' : 'decreased',
    from: previous.score,
    to: latest.score,
    fromDate: previous.timestamp,
    daysSince: Math.round(
      (new Date().getTime() - new Date(previous.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    ),
  };
};

// Get the most recent score for a specific company
export const getLatestScoreForCompany = (companyName: string): ScoreHistoryEntry | null => {
  const history = getLayoffScoreHistory();
  const filtered = history.filter(e => e.companyName.toLowerCase() === companyName.toLowerCase());
  return filtered.length > 0 ? filtered[filtered.length - 1] : null;
};
