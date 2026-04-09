// KEY_REGISTRY — all localStorage keys used by this app
// hp_score_history     : ScoreEntry[] — chronological score timeline (max 200)
// hp_skill_selections  : WeightedSkill[] — persisted skill portfolio
// hp_skill_breakdown   : SkillEntry[] — skills for roadmap
// hp_roadmap_start     : { startDate, weekGoals, jobId, score } — roadmap start
// hp_roadmap_start_date: string — ISO date for roadmap reference line
// hp_journal_entries   : JournalEntry[] — human edge journal (max 500)
// hp_digest_subscribed : JSON boolean — digest popup suppression
// hp_quiz_progress     : { answers, currentQuestion, savedAt } — quiz resume (7-day TTL)
// hp_roadmap_progress  : RoadmapProgress — course completion tracking
// hp_visited           : string — first visit detection
// hp_waitlist_email    : string — waitlist email
// hp_last_save_job     : Unix timestamp
// hp_last_save_skill   : Unix timestamp
// hp_last_save_hii     : Unix timestamp
// hp_history_warned    : Boolean — data-loss warning shown once
// hp_ever_completed_job / _skill / _hii : Boolean — assessment completion flags
// hp_data_version      : string e.g. "2026-Q1"

export const KEY_REGISTRY = {
  SCORE_HISTORY:      'hp_score_history',
  SKILL_SELECTIONS:   'hp_skill_selections',
  SKILL_BREAKDOWN:    'hp_skill_breakdown',
  ROADMAP_START:      'hp_roadmap_start',
  ROADMAP_START_DATE: 'hp_roadmap_start_date',
  ROADMAP_PROGRESS:   'hp_roadmap_progress',
  JOURNAL_ENTRIES:    'hp_journal_entries',
  QUIZ_PROGRESS:      'hp_quiz_progress',
  DIGEST_SUBSCRIBED:  'hp_digest_subscribed',
  VISITED:            'hp_visited',
  WAITLIST_EMAIL:     'hp_waitlist_email',
  HISTORY_WARNED:     'hp_history_warned',
  EVER_COMPLETED_JOB:   'hp_ever_completed_job',
  EVER_COMPLETED_SKILL: 'hp_ever_completed_skill',
  EVER_COMPLETED_HII:   'hp_ever_completed_hii',
  DATA_VERSION:       'hp_data_version',
};

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
const MAX_HISTORY = 200;

function getPlotScore(rawScore: number, source: 'job' | 'skill' | 'human-index'): number {
  return source === 'human-index' ? rawScore : 100 - rawScore;
}

// v3 FIX: Removed 30-minute time gate — score-diff threshold alone is sufficient.
// A user changing experience level from 5–10 → 10–20 years gets a genuinely different
// score and it SHOULD be saved without waiting 30 minutes.
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

  const scoreChanged = Math.abs(newScore - lastEntry.score) >= DEDUP_THRESHOLD[source];
  return scoreChanged;
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
    appVersion: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_VERSION) || '3.0',
  };
  history.push(entry);

  // v3 FIX: Prune to last 200 entries to prevent unbounded localStorage growth
  const pruned = history.length > MAX_HISTORY ? history.slice(-MAX_HISTORY) : history;
  localStorage.setItem('hp_score_history', JSON.stringify(pruned));

  // Mark assessment as ever-completed (for progress bar — prevents flickering on retake)
  if (source === 'job') localStorage.setItem(KEY_REGISTRY.EVER_COMPLETED_JOB, 'true');
  if (source === 'skill') localStorage.setItem(KEY_REGISTRY.EVER_COMPLETED_SKILL, 'true');
  if (source === 'human-index') localStorage.setItem(KEY_REGISTRY.EVER_COMPLETED_HII, 'true');
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

// v3 FIX: Data version migration detection
// Returns true if any entries exist with a different data version than current
export const hasLegacyVersionEntries = (): boolean => {
  const history = getScoreHistory();
  return history.some(e => e.dataVersion !== DATA_VERSION);
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
  // BUG 4 FIX: Use the raw history timestamp instead of parsing a locale string
  const history = getScoreHistory();
  const previousEntry = history.length >= 2 ? history[history.length - 2] : null;
  return {
    change: drift.direction === 'up' ? drift.change : -drift.change,
    direction: drift.direction === 'up' ? 'increased' : 'decreased',
    previousDate: previousEntry?.timestamp ?? Date.now(),
    latest: drift.latest,
    previous: drift.previous,
  };
};

// Helpers for "ever completed" progress bar (v3 FIX — prevents flickering during quiz retakes)
export const getEverCompletedFlags = () => ({
  job:   localStorage.getItem(KEY_REGISTRY.EVER_COMPLETED_JOB) === 'true',
  skill: localStorage.getItem(KEY_REGISTRY.EVER_COMPLETED_SKILL) === 'true',
  hii:   localStorage.getItem(KEY_REGISTRY.EVER_COMPLETED_HII) === 'true',
});
