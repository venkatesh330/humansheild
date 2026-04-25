// sessionChangeDetector.ts
// Architecture fix 6: When a user returns to a completed audit, check if any
// signal has changed since the last session. If yes, surface a banner.
// "2 signals changed since your last audit on March 15. Recalculate?"
// This creates the daily-active-user behavior that builds long-term retention.

import { CompanyData } from '../data/companyDatabase';

export interface SignalChange {
  field: string;
  label: string;
  previous: string | number | null;
  current: string | number | null;
  direction: 'worsened' | 'improved' | 'updated';
  impact: 'high' | 'medium' | 'low';
}

export interface SessionSignalDiff {
  hasChanges: boolean;
  changeCount: number;
  changes: SignalChange[];
  auditDate: string;   // ISO of the saved session
  recommendation: string;
}

const SESSION_SNAPSHOT_KEY = 'hp_last_company_snapshot';

export interface CompanySnapshot {
  companyName: string;
  stock90DayChange: number | null;
  revenueGrowthYoY: number | null;
  layoffRounds: number;
  lastLayoffPercent: number | null;
  aiInvestmentSignal: string;
  employeeCount: number;
  savedAt: string;  // ISO
}

export function saveCompanySnapshot(companyData: CompanyData): void {
  try {
    const snapshot: CompanySnapshot = {
      companyName: companyData.name,
      stock90DayChange: companyData.stock90DayChange,
      revenueGrowthYoY: companyData.revenueGrowthYoY,
      layoffRounds: companyData.layoffRounds,
      lastLayoffPercent: companyData.lastLayoffPercent,
      aiInvestmentSignal: companyData.aiInvestmentSignal,
      employeeCount: companyData.employeeCount,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch { /* quota */ }
}

export function loadCompanySnapshot(companyName: string): CompanySnapshot | null {
  try {
    const raw = localStorage.getItem(SESSION_SNAPSHOT_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as CompanySnapshot;
    // Only return if same company
    if (snapshot.companyName.toLowerCase() !== companyName.toLowerCase()) return null;
    return snapshot;
  } catch {
    return null;
  }
}

/**
 * Compares fresh company data against the last saved snapshot.
 * Returns a diff of changed signals with human-readable labels.
 */
export function detectSignalChanges(
  fresh: CompanyData,
  snapshot: CompanySnapshot,
): SessionSignalDiff {
  const changes: SignalChange[] = [];

  // Stock 90-day change
  if (fresh.stock90DayChange != null && snapshot.stock90DayChange != null) {
    const diff = fresh.stock90DayChange - snapshot.stock90DayChange;
    if (Math.abs(diff) >= 5) {
      changes.push({
        field: 'stock90DayChange',
        label: 'Stock 90-Day Change',
        previous: `${snapshot.stock90DayChange > 0 ? '+' : ''}${snapshot.stock90DayChange}%`,
        current: `${fresh.stock90DayChange > 0 ? '+' : ''}${fresh.stock90DayChange}%`,
        direction: diff < 0 ? 'worsened' : 'improved',
        impact: Math.abs(diff) >= 15 ? 'high' : 'medium',
      });
    }
  } else if (fresh.stock90DayChange != null && snapshot.stock90DayChange == null) {
    changes.push({
      field: 'stock90DayChange',
      label: 'Stock Data',
      previous: 'Not available',
      current: `${fresh.stock90DayChange > 0 ? '+' : ''}${fresh.stock90DayChange}%`,
      direction: 'updated',
      impact: 'medium',
    });
  }

  // Revenue growth YoY
  if (fresh.revenueGrowthYoY != null && snapshot.revenueGrowthYoY != null) {
    const diff = fresh.revenueGrowthYoY - snapshot.revenueGrowthYoY;
    if (Math.abs(diff) >= 5) {
      changes.push({
        field: 'revenueGrowthYoY',
        label: 'Revenue Growth YoY',
        previous: `${snapshot.revenueGrowthYoY > 0 ? '+' : ''}${snapshot.revenueGrowthYoY}%`,
        current: `${fresh.revenueGrowthYoY > 0 ? '+' : ''}${fresh.revenueGrowthYoY}%`,
        direction: diff < 0 ? 'worsened' : 'improved',
        impact: Math.abs(diff) >= 15 ? 'high' : 'medium',
      });
    }
  }

  // Layoff rounds — only detects increases (new rounds)
  if (fresh.layoffRounds > snapshot.layoffRounds) {
    changes.push({
      field: 'layoffRounds',
      label: 'Layoff Rounds',
      previous: `${snapshot.layoffRounds} round${snapshot.layoffRounds !== 1 ? 's' : ''}`,
      current: `${fresh.layoffRounds} round${fresh.layoffRounds !== 1 ? 's' : ''}`,
      direction: 'worsened',
      impact: 'high',
    });
  }

  // Last layoff percent — new or larger cut
  if (fresh.lastLayoffPercent != null && snapshot.lastLayoffPercent == null) {
    changes.push({
      field: 'lastLayoffPercent',
      label: 'New Layoff Detected',
      previous: 'None on record',
      current: `${fresh.lastLayoffPercent}% cut`,
      direction: 'worsened',
      impact: 'high',
    });
  }

  // AI investment signal escalation
  const AI_LEVELS: Record<string, number> = { low: 1, medium: 2, high: 3, 'very-high': 4 };
  const prevAI = AI_LEVELS[snapshot.aiInvestmentSignal] ?? 2;
  const currAI = AI_LEVELS[fresh.aiInvestmentSignal] ?? 2;
  if (currAI > prevAI) {
    changes.push({
      field: 'aiInvestmentSignal',
      label: 'AI Investment Signal',
      previous: snapshot.aiInvestmentSignal,
      current: fresh.aiInvestmentSignal,
      direction: 'worsened', // more AI investment = more displacement risk
      impact: 'medium',
    });
  }

  const highImpact = changes.filter(c => c.impact === 'high').length;
  const recommendation = changes.length === 0
    ? 'All signals stable — session data is current'
    : highImpact >= 1
      ? `${highImpact} high-impact signal${highImpact > 1 ? 's' : ''} changed. Recalculate now to get an accurate current score.`
      : `${changes.length} signal${changes.length > 1 ? 's' : ''} updated. Recalculate to reflect current conditions.`;

  return {
    hasChanges: changes.length > 0,
    changeCount: changes.length,
    changes,
    auditDate: snapshot.savedAt,
    recommendation,
  };
}
