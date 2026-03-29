// KEY_REGISTRY — all localStorage keys used by this app
// hp_score_history     : ScoreEntry[] — chronological score timeline
// hp_skill_selections  : WeightedSkill[] — persisted skill portfolio
// hp_skill_breakdown   : SkillEntry[] — skills for roadmap
// hp_roadmap_start     : { startDate, weekGoals, jobId, score } — roadmap start
// hp_roadmap_start_date: string — ISO date for roadmap reference line
// hp_journal_entries   : JournalEntry[] — human edge journal
// hp_digest_subscribed : JSON boolean — digest signup suppression
// hp_quiz_progress     : { answers, currentQuestion, savedAt } — quiz resume state (30-day TTL)
// hp_roadmap_progress  : RoadmapProgress — course completion tracking
// hp_visited           : string — first visit detection
// hp_waitlist_email    : string — waitlist email
// hp_last_save_{type}  : number (ms) — per-scoreType last-save timestamp (BUG 1 fix)

export interface ScoreEntry {
  score: number;
  // plotScore: higher always = more AI-resilient
  // Risk scores are INVERTED: plotScore = 100 - riskScore
  // Human-index score is used directly (higher = more human = safer)
  plotScore: number;
  source: 'job' | 'skill' | 'human-index';
  timestamp: number;
  dataVersion: string;
  appVersion: string;
}

const DATA_VERSION = '2026-Q1';

// BUG 1 FIX: per-scoreType timestamp prefix for compound guard
const LAST_SAVE_PREFIX = 'hp_last_save_';

function getPlotScore(rawScore: number, source: 'job' | 'skill' | 'human-index'): number {
  return source === 'human-index' ? rawScore : 100 - rawScore;
}

// BUG 1 FIX: compound guard — require BOTH score change AND 30 min elapsed per scoreType
const DEDUP_THRESHOLD: Record<'job' | 'skill' | 'human-index', number> = {
  'human-index': 8,
  'job': 4,
  'skill': 6,
};

function shouldSaveScore(
  newScore: number,
  source: 'job' | 'skill' | 'human-index',
  history: ScoreEntry[],
): boolean {
  const lastEntry = history
    .filter(e => e.source === source)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  if (!lastEntry) return true;

  // BUG 1 FIX: per-scoreType timestamp — compound guard
  const lastSaveKey = `${LAST_SAVE_PREFIX}${source}`;
  const lastSaveTs = parseInt(localStorage.getItem(lastSaveKey) || '0', 10);
  const minutesElapsed = (Date.now() - lastSaveTs) / (1000 * 60);

  const scoreChanged = Math.abs(newScore - lastEntry.score) >= DEDUP_THRESHOLD[source];
  const thirtyMinElapsed = minutesElapsed >= 30;

  // Compound: meaningful change AND at least 30 min elapsed since last save for this type
  if (scoreChanged && thirtyMinElapsed) return true;
  // Skip all other cases (no change / not enough time elapsed)
  return false;
}

export const saveScore = (score: number, source: 'job' | 'skill' | 'human-index') => {
  const history = JSON.parse(localStorage.getItem('hp_score_history') || '[]') as ScoreEntry[];
  if (!shouldSaveScore(score, source, history)) return;
  const entry: ScoreEntry = {
    score,
    plotScore: getPlotScore(score, source),
    source,
    timestamp: Date.now(),
    dataVersion: DATA_VERSION,
    appVersion: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_VERSION) || '2.0',
  };
  history.push(entry);
  localStorage.setItem('hp_score_history', JSON.stringify(history));
  // BUG 1 FIX: update per-scoreType last-save timestamp after successful save
  localStorage.setItem(`${LAST_SAVE_PREFIX}${source}`, Date.now().toString());
};

export const getScoreHistory = (): ScoreEntry[] => {
  const raw = JSON.parse(localStorage.getItem('hp_score_history') || '[]') as any[];
  return raw.map(e => ({
    score: e.score ?? 0,
    plotScore: e.plotScore ?? (e.source === 'human-index' ? e.score : 100 - (e.score ?? 0)),
    source: e.source,
    timestamp: typeof e.timestamp === 'number' ? e.timestamp : new Date(e.timestamp).getTime(),
    dataVersion: e.dataVersion || '2025.0',
    appVersion: e.appVersion || '1.0',
  }));
};

export interface DriftResult {
  change: number;
  direction: 'up' | 'down';
  previousDate: string;
  latest: number;
  previous: number;
}

export const getScoreDrift = (): DriftResult | null => {
  const history = getScoreHistory();
  if (history.length < 2) return null;

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const change = Math.abs(latest.plotScore - previous.plotScore);

  const baseThreshold = ({ 'job': 4, 'skill': 6, 'human-index': 8 } as Record<string, number>)[latest.source] ?? 5;
  const ageHours = (Date.now() - previous.timestamp) / 3600000;
  const timeMultiplier = ageHours < 24 ? 0.75 : ageHours > 168 ? 1.25 : 1.0;
  const threshold = baseThreshold * timeMultiplier;

  if (change < threshold) return null;

  return {
    change,
    direction: latest.plotScore > previous.plotScore ? 'up' : 'down',
    previousDate: new Date(previous.timestamp).toLocaleDateString(),
    latest: latest.score,
    previous: previous.score,
  };
};

export const getHistoryBySource = (source: 'job' | 'skill' | 'human-index'): ScoreEntry[] => {
  return getScoreHistory().filter(e => e.source === source);
};

export const getScoreHistory_raw = getScoreHistory;

export const getScoreDriftLegacy = () => {
  const drift = getScoreDrift();
  if (!drift) return null;
  return {
    change: drift.direction === 'up' ? drift.change : -drift.change,
    direction: drift.direction === 'up' ? 'increased' : 'decreased',
    previousDate: new Date(drift.previousDate).getTime(),
    latest: drift.latest,
    previous: drift.previous,
  };
};
