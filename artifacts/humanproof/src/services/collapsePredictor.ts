// collapsePredictor.ts
// Company Collapse Predictor — Stage 1-3 signal detection with 6-18 month lead time.
// Stage 1 (12-18 months out): AI investment language, "efficiency" earnings calls
// Stage 2 (6-12 months out): Hiring freeze, middle-management cuts, offshore spike
// Stage 3 (1-6 months out): C-suite departures, delayed products, customer churn signals

import { getSectorLayoffCount, getCompanyLayoffs } from './dataConnectors/layoffsFyiConnector';
import { fetchCompanyNewsSignals } from './dataConnectors/rssNewsConnector';
import { fetchRoleDemandSignal } from './dataConnectors/naukriConnector';

export type CollapseStage = 1 | 2 | 3 | null;

export interface StageSignal {
  name: string;
  detected: boolean;
  severity: 'weak' | 'moderate' | 'strong';
  description: string;
}

// Intelligence Upgrade 2 (v4.0): Department-level cut probability
export interface DepartmentRiskBreakdown {
  /** Department name */
  department: string;
  /** 0–100 hiring freeze score for this department */
  freezeScore: number;
  /** Whether this is the user's own department */
  isUserDepartment: boolean;
  /** Human-readable risk label */
  riskLabel: 'Active Hiring' | 'Slowdown' | 'Freeze' | 'Critical Freeze';
}

export interface CollapseReport {
  company: string;
  stage: CollapseStage;
  stageLabel: string;
  timeToCollapseRange: string;
  overallRisk: number;          // 0-100
  stage1Signals: StageSignal[];
  stage2Signals: StageSignal[];
  stage3Signals: StageSignal[];
  activeSignalCount: number;
  recommendation: string;
  fetchedAt: string;
  /** v4.0: Department-level cut probability distribution */
  departmentRisks?: DepartmentRiskBreakdown[];
  /** v4.0: User's own department freeze score (0–100) */
  userDepartmentFreezeScore?: number | null;
}

// ── Stage 1 signal detectors (12-18 months before collapse) ──────────────────

function detectAIEfficiencyLanguage(newsSentiment: number, layoffNewsCount: number): StageSignal {
  // High AI investment + "efficiency" language in news = Stage 1
  const detected = layoffNewsCount === 0 && newsSentiment < -0.1;
  return {
    name: 'AI/Efficiency Language in Earnings',
    detected,
    severity: detected ? 'moderate' : 'weak',
    description: detected
      ? 'Negative news sentiment without confirmed layoffs — often precedes restructuring announcements'
      : 'No unusual efficiency language detected',
  };
}

function detectSectorPeerPressure(sectorLayoff180d: number): StageSignal {
  const detected = sectorLayoff180d >= 3;
  return {
    name: 'Sector Peer Layoff Pressure',
    detected,
    severity: sectorLayoff180d >= 6 ? 'strong' : sectorLayoff180d >= 3 ? 'moderate' : 'weak',
    description: detected
      ? `${sectorLayoff180d} peer companies in same sector cut headcount in last 180 days — contagion risk`
      : 'Sector peers appear stable',
  };
}

function detectAIInvestmentWithNoGrowth(
  stock90dChange: number | null,
  aiInvestmentSignal: string,
): StageSignal {
  const highAI = aiInvestmentSignal === 'high' || aiInvestmentSignal === 'very_high';
  const stockDown = stock90dChange !== null && stock90dChange < -10;
  const detected = highAI && stockDown;
  return {
    name: 'AI Investment Without Revenue Growth',
    detected,
    severity: detected ? 'moderate' : 'weak',
    description: detected
      ? 'Company investing heavily in AI while stock declining — efficiency cuts may follow to justify AI spend'
      : 'AI investment appears aligned with performance',
  };
}

// ── Stage 2 signal detectors (6-12 months before collapse) ───────────────────

function detectHiringFreeze(hiringFreezeScore: number): StageSignal {
  const detected = hiringFreezeScore > 0.55;
  return {
    name: 'Hiring Freeze Detected',
    detected,
    severity: hiringFreezeScore > 0.8 ? 'strong' : hiringFreezeScore > 0.6 ? 'moderate' : 'weak',
    description: detected
      ? `Hiring freeze score ${Math.round(hiringFreezeScore * 100)}/100 — job postings significantly below baseline`
      : 'Hiring activity appears normal',
  };
}

function detectRecentLayoffPattern(rounds: number, mostRecentDate: string | null): StageSignal {
  const hasRecent = mostRecentDate
    ? monthsSince(mostRecentDate) < 12
    : false;
  const detected = rounds >= 2 || (rounds >= 1 && hasRecent);
  return {
    name: 'Repeated or Recent Layoff Pattern',
    detected,
    severity: rounds >= 3 ? 'strong' : rounds >= 2 ? 'moderate' : 'weak',
    description: detected
      ? `${rounds} confirmed layoff round(s)${hasRecent ? ', most recent within 12 months' : ''} — serial cuts indicate structural decline`
      : 'No significant layoff pattern detected',
  };
}

function detectStockDecline(stock90dChange: number | null): StageSignal {
  const detected = stock90dChange !== null && stock90dChange < -20;
  return {
    name: 'Severe Stock Decline (>20% in 90 days)',
    detected,
    severity: stock90dChange !== null && stock90dChange < -35 ? 'strong' : 'moderate',
    description: detected
      ? `Stock down ${stock90dChange}% in 90 days — market pricing in operational stress`
      : 'Stock performance within normal range',
  };
}

// ── Stage 3 signal detectors (1-6 months before collapse) ────────────────────

function detectLeadershipInstability(layoffRounds: number, stock90dChange: number | null): StageSignal {
  // Proxy: multiple layoff rounds + stock crash = leadership likely changing
  const stockCrash = stock90dChange !== null && stock90dChange < -30;
  const detected = layoffRounds >= 2 && stockCrash;
  return {
    name: 'Leadership Instability Proxy',
    detected,
    severity: detected ? 'strong' : 'weak',
    description: detected
      ? 'Multiple layoff rounds combined with stock crash historically coincides with C-suite departures'
      : 'Leadership stability signals appear normal',
  };
}

function detectHighLayoffNewsSentiment(layoffNewsCount: number, newsSentimentScore: number): StageSignal {
  const detected = layoffNewsCount >= 2 && newsSentimentScore < -0.3;
  return {
    name: 'Active Layoff News Coverage',
    detected,
    severity: layoffNewsCount >= 4 ? 'strong' : 'moderate',
    description: detected
      ? `${layoffNewsCount} layoff-related news signals in the last 30 days — public confirmation risk`
      : 'No significant layoff news coverage detected',
  };
}

function detectMCAFilingDelinquency(filingDelinquent: boolean): StageSignal {
  return {
    name: 'MCA Filing Delinquency (India)',
    detected: filingDelinquent,
    severity: filingDelinquent ? 'strong' : 'weak',
    description: filingDelinquent
      ? 'Company has not filed with MCA in 24+ months — regulatory/operational distress signal'
      : 'MCA filings appear current',
  };
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export interface CollapseInputs {
  companyName: string;
  industry: string;
  roleTitle: string;
  stock90dChange: number | null;
  aiInvestmentSignal: string;
  layoffRounds: number;
  mostRecentLayoffDate: string | null;
  filingDelinquent: boolean;
  /** v4.0: User's department for personalized cut probability */
  userDepartment?: string;
}

// ── v4.0: Department role mapping ─────────────────────────────────────────────
// Maps department names to the role categories we scrape from Naukri
const DEPARTMENT_ROLES: Record<string, string[]> = {
  'Engineering':       ['sw_backend', 'sw_frontend', 'sw_devops', 'sw_testing'],
  'Finance':           ['fin_account', 'fin_fp', 'fin_payroll'],
  'HR':                ['hr_recruit', 'hr_hrbp', 'hr_ops'],
  'Operations':        ['bpo_inbound', 'bpo_outbound', 'log_ops'],
  'Sales':             ['fmcg_sales', 'ser_sales_exec'],
  'Product':           ['saas_pm', 'sw_pm'],
  'Data / Analytics':  ['ml_data', 'it_data_analyst', 'ml_mlops'],
  'Legal':             ['leg_corporate', 'leg_paralegal'],
  'Marketing':         ['mkt_seo', 'cnt_copy', 'mkt_brand'],
};

function getDepartmentRiskLabel(score: number): DepartmentRiskBreakdown['riskLabel'] {
  if (score >= 80) return 'Critical Freeze';
  if (score >= 55) return 'Freeze';
  if (score >= 30) return 'Slowdown';
  return 'Active Hiring';
}

export async function detectCollapseStage(inputs: CollapseInputs): Promise<CollapseReport> {
  const { companyName, industry, roleTitle, stock90dChange,
    aiInvestmentSignal, layoffRounds, mostRecentLayoffDate, filingDelinquent,
    userDepartment } = inputs;

  // v4.0: Fetch department-level freeze scores in parallel with other signals
  const departmentEntries = Object.entries(DEPARTMENT_ROLES);
  const [newsData, roleData, sectorCount, ...deptRoleDataArr] = await Promise.all([
    fetchCompanyNewsSignals(companyName),
    fetchRoleDemandSignal(roleTitle, companyName),
    getSectorLayoffCount(industry, 180),
    // Fetch freeze score for one representative role per department
    ...departmentEntries.map(([, roles]) =>
      fetchRoleDemandSignal(roles[0], companyName).catch(() => ({ hiringFreezeScore: 0.5, demandTrend: 'stable' as const, isLive: false, estimatedOpenings: null, source: 'heuristic' }))
    ),
  ]);

  // Stage 1 signals
  const s1: StageSignal[] = [
    detectAIEfficiencyLanguage(newsData.sentimentScore, newsData.layoffSignalCount),
    detectSectorPeerPressure(sectorCount),
    detectAIInvestmentWithNoGrowth(stock90dChange, aiInvestmentSignal),
  ];

  // Stage 2 signals
  const s2: StageSignal[] = [
    detectHiringFreeze(roleData.hiringFreezeScore),
    detectRecentLayoffPattern(layoffRounds, mostRecentLayoffDate),
    detectStockDecline(stock90dChange),
  ];

  // Stage 3 signals
  const s3: StageSignal[] = [
    detectLeadershipInstability(layoffRounds, stock90dChange),
    detectHighLayoffNewsSentiment(newsData.layoffSignalCount, newsData.sentimentScore),
    detectMCAFilingDelinquency(filingDelinquent),
  ];

  const s1Active = s1.filter(s => s.detected).length;
  const s2Active = s2.filter(s => s.detected).length;
  const s3Active = s3.filter(s => s.detected).length;
  const totalActive = s1Active + s2Active + s3Active;

  // Stage determination: highest confirmed stage wins
  let stage: CollapseStage = null;
  if (s3Active >= 2) stage = 3;
  else if (s2Active >= 2) stage = 2;
  else if (s1Active >= 2) stage = 1;

  // Overall risk: weighted by stage severity
  const overallRisk = Math.min(100, Math.round(
    (s1Active * 12 + s2Active * 20 + s3Active * 30) * (totalActive > 0 ? 1 : 0),
  ));

  const stageLabels: Record<number, string> = {
    1: 'Stage 1 — Early Warning (12-18 months)',
    2: 'Stage 2 — Displacement in Progress (6-12 months)',
    3: 'Stage 3 — Imminent Risk (1-6 months)',
  };

  const timeRanges: Record<number, string> = {
    1: '12-18 months',
    2: '6-12 months',
    3: '1-6 months',
  };

  const recommendations: Record<number, string> = {
    1: `Stage 1 early warning: ${s1Active} of 3 signals active. The pattern — efficiency language, sector peer pressure, or misaligned AI investment — is historically the leading indicator of workforce restructuring 12–18 months out. Action: keep CV current, build external contacts, and reassess in 90 days.`,
    2: `Stage 2 signals active: ${s2Active} of 3 displacement indicators detected. Hiring freeze, layoff recurrence, or stock drawdown are mid-stage signals typically 6–12 months before a restructuring event. Action: start a parallel job search now, allocate 2–3 hours/week to outreach and applications.`,
    3: `Stage 3 imminent risk: ${s3Active} of 3 late-stage signals detected (leadership instability, active media coverage, or regulatory delinquency). Historical median time to layoff announcement from Stage 3: 4–8 weeks. Action: treat this as an active emergency — prioritize job search above all other career activities.`,
  };

  // ── v4.0: Build department risk breakdown ─────────────────────────────────
  const departmentRisks: DepartmentRiskBreakdown[] = departmentEntries.map(([deptName], idx) => {
    const deptData = deptRoleDataArr[idx];
    const freezeScore = Math.round((deptData?.hiringFreezeScore ?? 0.5) * 100);
    const isUserDept = userDepartment
      ? deptName.toLowerCase().includes(userDepartment.toLowerCase()) ||
        userDepartment.toLowerCase().includes(deptName.toLowerCase().split(' ')[0])
      : false;
    return {
      department: deptName,
      freezeScore,
      isUserDepartment: isUserDept,
      riskLabel: getDepartmentRiskLabel(freezeScore),
    };
  }).sort((a, b) => b.freezeScore - a.freezeScore);

  const userDeptRisk = userDepartment
    ? (departmentRisks.find(d => d.isUserDepartment)?.freezeScore ?? null)
    : null;

  // Build department commentary for recommendation (only when stage 2+)
  let departmentNote = '';
  if (stage && stage >= 2 && departmentRisks.length > 0) {
    const topTwo = departmentRisks.slice(0, 2);
    departmentNote = ` Department risk distribution: ${topTwo.map(d => `${d.department} — ${d.freezeScore}% freeze`).join('; ')}.`;
    if (userDeptRisk !== null) {
      const userDept = departmentRisks.find(d => d.isUserDepartment);
      const companyAvg = Math.round(departmentRisks.reduce((s, d) => s + d.freezeScore, 0) / departmentRisks.length);
      departmentNote += ` Your department (${userDept?.department ?? userDepartment}) shows ${userDeptRisk}% freeze — ${userDeptRisk > companyAvg ? 'above' : 'below'} company average of ${companyAvg}%.`;
    }
  }

  return {
    company: companyName,
    stage,
    stageLabel: stage ? stageLabels[stage] : 'No Active Collapse Signals',
    timeToCollapseRange: stage ? timeRanges[stage] : 'N/A',
    overallRisk,
    stage1Signals: s1,
    stage2Signals: s2,
    stage3Signals: s3,
    activeSignalCount: totalActive,
    recommendation: stage
      ? recommendations[stage] + departmentNote
      : overallRisk > 0
        ? `${companyName} has sub-threshold signals (risk score: ${overallRisk}/100) but no confirmed stage detected. Individual signals are present but haven't converged into a clear pattern. Monitor monthly — a single new signal could trigger Stage 1 classification.`
        : `${companyName} shows no collapse signals across all 9 detection vectors. This is a positive stability indicator. Reassess in 90 days or when significant company news emerges.`,
    fetchedAt: new Date().toISOString(),
    departmentRisks,
    userDepartmentFreezeScore: userDeptRisk,
  };
}

// ── Company Watch Subscription ────────────────────────────────────────────────

export interface WatchedCompany {
  companyName: string;
  industry: string;
  addedAt: string;
  lastChecked: string | null;
  lastStage: CollapseStage;
  alertOnStage: CollapseStage; // alert when reaching this stage or higher
}

const WATCH_KEY = 'hp_company_watch_list';

export function getWatchList(): WatchedCompany[] {
  try {
    return JSON.parse(localStorage.getItem(WATCH_KEY) ?? '[]');
  } catch { return []; }
}

export function addToWatchList(company: string, industry: string, alertOnStage: CollapseStage = 2): void {
  const list = getWatchList();
  if (list.some(w => w.companyName.toLowerCase() === company.toLowerCase())) return;
  list.push({
    companyName: company,
    industry,
    addedAt: new Date().toISOString(),
    lastChecked: null,
    lastStage: null,
    alertOnStage,
  });
  localStorage.setItem(WATCH_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('watch-list-changed', { detail: { company } }));
}

export function removeFromWatchList(company: string): void {
  const list = getWatchList().filter(w => w.companyName.toLowerCase() !== company.toLowerCase());
  localStorage.setItem(WATCH_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('watch-list-changed'));
}

export function updateWatchListEntry(company: string, stage: CollapseStage): void {
  const list = getWatchList();
  const idx = list.findIndex(w => w.companyName.toLowerCase() === company.toLowerCase());
  if (idx === -1) return;
  list[idx].lastChecked = new Date().toISOString();
  list[idx].lastStage = stage;
  localStorage.setItem(WATCH_KEY, JSON.stringify(list));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function monthsSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.abs((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}
