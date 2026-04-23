// naukriConnector.ts
// Naukri/LinkedIn job posting trend proxy — role demand signal.
// Uses public job count heuristics + cached role demand baselines.
// Live scraping requires backend; this provides a client-side heuristic model
// supplemented by optional Serper/SERP API for real counts.

export interface RoleDemandSignal {
  roleTitle: string;
  company: string;
  estimatedOpenings: number | null;
  demandTrend: 'rising' | 'stable' | 'falling';
  hiringFreezeScore: number;  // 0 = no freeze, 1 = complete freeze
  source: 'Naukri Heuristic' | 'Serper API';
  /**
   * True when the values came from a real-time API (Serper). False when
   * `ROLE_DEMAND_BASE` was used — those are *static priors* curated by the
   * team and not refreshed per-request. Surface this so the UI does not
   * label heuristic numbers as "live signals".
   */
  isLive: boolean;
  /**
   * Human-readable disclosure suitable for tooltips next to the demand trend
   * value. Empty string when the data is live.
   */
  disclosure: string;
  fetchedAt: string;
}

// Role demand baselines indexed by role keywords.
//
// IMPORTANT: These values are STATIC PRIORS, not live data. They are curated
// by the team and only updated manually (last review: Q1 2026). The pipeline
// upstream presents them to the UI through the same channel as live signals,
// so callers must consult `isLive` before labelling them as fresh.
//
// Refresh checklist when updating: cross-check Naukri job-count snapshots,
// LinkedIn role-trend reports, and StackOverflow developer survey trends.
const ROLE_DEMAND_BASE: Record<string, { trend: 'rising' | 'stable' | 'falling'; freezeScore: number }> = {
  'ai engineer':           { trend: 'rising',  freezeScore: 0.05 },
  'ml engineer':           { trend: 'rising',  freezeScore: 0.05 },
  'data scientist':        { trend: 'stable',  freezeScore: 0.20 },
  'cloud engineer':        { trend: 'rising',  freezeScore: 0.10 },
  'devops':                { trend: 'rising',  freezeScore: 0.10 },
  'cybersecurity':         { trend: 'rising',  freezeScore: 0.08 },
  'software engineer':     { trend: 'stable',  freezeScore: 0.25 },
  'frontend developer':    { trend: 'stable',  freezeScore: 0.30 },
  'backend developer':     { trend: 'stable',  freezeScore: 0.28 },
  'product manager':       { trend: 'stable',  freezeScore: 0.35 },
  'data analyst':          { trend: 'falling', freezeScore: 0.45 },
  'business analyst':      { trend: 'falling', freezeScore: 0.48 },
  'qa engineer':           { trend: 'falling', freezeScore: 0.55 },
  'recruiter':             { trend: 'falling', freezeScore: 0.60 },
  'content writer':        { trend: 'falling', freezeScore: 0.70 },
  'customer service':      { trend: 'falling', freezeScore: 0.65 },
  'data entry':            { trend: 'falling', freezeScore: 0.85 },
  'technical writer':      { trend: 'falling', freezeScore: 0.60 },
  'marketing coordinator': { trend: 'falling', freezeScore: 0.55 },
};

function matchRole(roleTitle: string): { trend: 'rising' | 'stable' | 'falling'; freezeScore: number } {
  const lower = roleTitle.toLowerCase();
  for (const [key, val] of Object.entries(ROLE_DEMAND_BASE)) {
    if (lower.includes(key)) return val;
  }
  return { trend: 'stable', freezeScore: 0.35 };
}

export async function fetchRoleDemandSignal(
  roleTitle: string,
  company: string,
): Promise<RoleDemandSignal> {
  // Optional: use Serper API for live job count (requires VITE_SERPER_KEY)
  const serperKey = typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_SERPER_KEY
    : null;

  if (serperKey) {
    try {
      const query = `${roleTitle} jobs at ${company} site:naukri.com OR site:linkedin.com`;
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, num: 5 }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const count = data?.organic?.length ?? 0;
        const base = matchRole(roleTitle);
        return {
          roleTitle,
          company,
          estimatedOpenings: count,
          demandTrend: count > 3 ? 'rising' : count > 1 ? 'stable' : 'falling',
          hiringFreezeScore: count === 0 ? 0.9 : base.freezeScore,
          source: 'Serper API',
          isLive: true,
          disclosure: '',
          fetchedAt: new Date().toISOString(),
        };
      }
    } catch { /* fall through to heuristic */ }
  }

  // Heuristic fallback — static prior, NOT live data.
  const base = matchRole(roleTitle);
  return {
    roleTitle,
    company,
    estimatedOpenings: null,
    demandTrend: base.trend,
    hiringFreezeScore: base.freezeScore,
    source: 'Naukri Heuristic',
    isLive: false,
    disclosure:
      'Static heuristic baseline (not live). Set VITE_SERPER_KEY to fetch real job-count data from Naukri/LinkedIn.',
    fetchedAt: new Date().toISOString(),
  };
}

// Hiring freeze detection: company-level signal from job delta
export function detectHiringFreeze(
  currentOpenings: number | null,
  previousOpenings: number | null,
): { frozen: boolean; severity: 'none' | 'partial' | 'full' } {
  if (currentOpenings === null || previousOpenings === null) {
    return { frozen: false, severity: 'none' };
  }
  const delta = previousOpenings === 0 ? -1 : (currentOpenings - previousOpenings) / previousOpenings;
  if (delta < -0.6) return { frozen: true, severity: 'full' };
  if (delta < -0.35) return { frozen: true, severity: 'partial' };
  return { frozen: false, severity: 'none' };
}
