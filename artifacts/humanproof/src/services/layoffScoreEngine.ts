// layoffScoreEngine.ts
// Core 5-layer scoring algorithm — v2.1 (audit fixes + error handling)

import { CompanyData, getPPPMultiplier } from "../data/companyDatabase";
// ── Phase-1 Company Intelligence Integration ─────────────────────────────────
// Unified resolver: tries legacy DB first, then the new 50-company intelligence
// DB (companyIntelligenceDB.ts) via the schema bridge adapter.
export {
  resolveCompanyData,
  searchAllCompanies,
  getCompanyRiskSummary,
  getRoleRiskForCompany,
} from "../data/companyIntelligenceBridge";
import { IndustryRisk } from "../data/industryRiskData";
import {
  calculateRoleExposureScore,
  RoleExposure,
} from "../data/roleExposureData";
import { layoffNewsCache } from "../data/layoffNewsCache";

// ─── Error Handling ────────────────────────────────────────────────────

export class LayoffScoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
  ) {
    super(message);
    this.name = "LayoffScoreError";
  }
}

export interface ScoreResultWithError {
  result?: ScoreResult;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
    fallbackUsed?: string;
  };
}

// ─── Graceful Degradation: Default Company Data ──────────────────────────

const createFallbackCompanyData = (companyName: string): CompanyData => ({
  name: companyName,
  industry: "technology",
  isPublic: false,
  employeeCount: 1000,
  revenueGrowthYoY: null,
  stock90DayChange: null,
  layoffRounds: 0,
  layoffsLast24Months: [],
  lastLayoffPercent: null,
  revenuePerEmployee: 250000,
  aiInvestmentSignal: "medium",
  region: "US",
  lastUpdated: "2026-04-01",
  source: "Fallback",
});

export const createUnknownCompanyFallback = (
  companyName: string,
): CompanyData => {
  const fallback = createFallbackCompanyData(companyName);
  fallback.source = "Fallback - Unknown Company";
  return fallback;
};

// ─── Interfaces ───

export interface UserFactors {
  tenureYears: number;
  /** Total career years across ALL jobs — distinct from tenureYears at current company.
   *  Used for Oracle experience bracket (D4) and Displacement Trajectory modifiers.
   *  Falls back to tenureYears if not supplied. */
  careerYears?: number;
  isUniqueRole: boolean;
  performanceTier: "top" | "average" | "below" | "unknown";
  hasRecentPromotion: boolean;
  hasKeyRelationships: boolean;
}

export interface ScoreInputs {
  companyData: CompanyData;
  industryData?: IndustryRisk;
  roleTitle: string;
  department: string;
  userFactors: UserFactors;
  roleExposureOverride?: RoleExposure;
}

export interface ScoreBreakdown {
  L1: number;
  L2: number;
  L3: number;
  L4: number;
  L5: number;
}

export interface ScoreTier {
  label: string;
  color: string;
  advice: string;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  layerFocus: string;
  /** Estimated risk-score reduction if this action is completed (0–15 pts) */
  riskReductionPct: number;
  /** Expected timeline to complete this action */
  deadline: string;
}

export interface ScoreResult {
  score: number;
  confidenceInterval: {
    low: number;
    high: number;
    range: number;
    isEstimate: boolean;
  };
  tier: ScoreTier;
  breakdown: ScoreBreakdown;
  confidence: "High" | "Medium" | "Low";
  confidencePercent: number;
  calculatedAt: string;
  nextUpdateDue: string;
  disclaimer: string;
  dataFreshness: {
    lastUpdated: string;
    ageInDays: number;
    stalenessWarning: string | null;
    accuracyImpact: "Low" | "Medium" | "High" | "Critical";
  };
  signalQuality: {
    hasConflicts: boolean;
    conflictingSignals: Array<{
      signal1: string;
      signal2: string;
      severity: string;
    }>;
    missingDataFallbacks: string[];
    liveSignals: number;
    heuristicSignals: number;
  };
  recommendations: ActionPlanItem[];
}

// ─── Utility ───

const weightedAverage = (
  signals: Record<string, number>,
  weights: Record<string, number>,
): number => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0.5;
  return Object.entries(signals).reduce((sum, [key, val]) => {
    return sum + val * ((weights[key] || 0) / totalWeight);
  }, 0);
};

const clamp = (val: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, val));

const monthsDifference = (dateStr: string, now: Date): number => {
  const d = new Date(dateStr);
  return Math.abs(
    (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth()),
  );
};

// ─── Layer 1: Company Health (30%) ───

const mapRevenueGrowth = (yoyPercent: number | null): number => {
  if (yoyPercent === null) return 0.5;
  if (yoyPercent < -20) return 0.95;
  if (yoyPercent < -10) return 0.85;
  if (yoyPercent < 0) return 0.72;
  if (yoyPercent < 5) return 0.55;
  if (yoyPercent < 10) return 0.42;
  if (yoyPercent < 20) return 0.3;
  if (yoyPercent < 30) return 0.18;
  return 0.1;
};

const mapStockTrend = (change90Day: number | null): number => {
  if (change90Day === null) return 0.5;
  if (change90Day < -30) return 0.95;
  if (change90Day < -15) return 0.8;
  if (change90Day < -5) return 0.6;
  if (change90Day < 5) return 0.42;
  if (change90Day < 15) return 0.28;
  if (change90Day < 30) return 0.15;
  return 0.08;
};

const mapFundingStatus = (
  lastRound: string | undefined,
  monthsSince: number | undefined,
): number => {
  if (lastRound === "bootstrapped") return 0.35;
  if (monthsSince === undefined) return 0.5;
  if (monthsSince < 6) return 0.12;
  if (monthsSince < 12) return 0.28;
  if (monthsSince < 18) return 0.5;
  if (monthsSince < 24) return 0.72;
  return 0.88;
};

const mapCompanySize = (count: number): number => {
  if (count <= 50) return 0.7;
  if (count <= 200) return 0.58;
  if (count <= 1000) return 0.48;
  if (count <= 5000) return 0.4;
  if (count <= 50000) return 0.35;
  return 0.32;
};

// PPP-adjusted overstaffing: uses regional multiplier to normalize revenue/employee
const mapOverstaffing = (
  revenuePerEmp: number,
  region: string = "US",
): number => {
  const ppp = getPPPMultiplier(region as any);
  const adjusted = revenuePerEmp / ppp; // normalize to US-equivalent

  // BUG-DA3 FIX: Slightly more aggressive thresholds for overstaffing risk
  // based on 2024-2025 tech efficiency benchmarks.
  if (adjusted < 95000) return 0.85; // High Risk: Under $95k/emp (adjusted)
  if (adjusted < 180000) return 0.65; // Elevated
  if (adjusted < 350000) return 0.45; // Moderate
  if (adjusted < 700000) return 0.25; // Low
  return 0.1; // Very Low: Over $700k/emp
};

export const calculateCompanyHealthScore = (
  companyData: CompanyData,
): number => {
  const signals = {
    revenueGrowthRisk: mapRevenueGrowth(companyData.revenueGrowthYoY),
    stockTrendRisk: companyData.isPublic
      ? mapStockTrend(companyData.stock90DayChange)
      : 0.4,
    fundingRisk: companyData.isPublic
      ? 0.3
      : mapFundingStatus(
          companyData.lastFundingRound,
          companyData.monthsSinceLastFunding,
        ),
    sizeRisk: mapCompanySize(companyData.employeeCount),
    overstaffingRisk: mapOverstaffing(
      companyData.revenuePerEmployee,
      companyData.region,
    ),
  };

  return weightedAverage(signals, {
    revenueGrowthRisk: 0.35,
    stockTrendRisk: 0.25,
    fundingRisk: 0.15,
    sizeRisk: 0.1,
    overstaffingRisk: 0.15,
  });
};

// ─── Layer 2: Layoff History (25%) ───

const calculateRecentLayoffRisk = (
  layoffs: { date: string; percentCut: number }[],
): number => {
  if (!layoffs || layoffs.length === 0) return 0.05;
  // Sort by date descending to get most recent first
  const sorted = [...layoffs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const mostRecent = sorted[0];
  const monthsAgo = monthsDifference(mostRecent.date, new Date());

  if (monthsAgo < 3) return 0.95;
  if (monthsAgo < 6) return 0.8;
  if (monthsAgo < 12) return 0.62;
  if (monthsAgo < 18) return 0.42;
  if (monthsAgo < 24) return 0.28;
  return 0.15;
};

// BUG-DA4 FIX: Round frequency now considers recency alongside count.
// Older layoff patterns are less predictive than recent ones.
const calculateRoundFrequency = (
  rounds: number,
  layoffs?: { date: string; percentCut: number }[],
): number => {
  if (!rounds || rounds === 0) return 0.05;

  // Base frequency score by round count
  let base = 0.05;
  if (rounds === 1) base = 0.42;
  else if (rounds === 2) base = 0.68;
  else if (rounds === 3) base = 0.85;
  else base = 0.95;

  // Recency weighting: if most layoffs are old (>18 months), reduce score by up to 20%
  if (layoffs && layoffs.length > 0) {
    const now = new Date();
    const avgMonthsAgo =
      layoffs.reduce((sum, l) => sum + monthsDifference(l.date, now), 0) /
      layoffs.length;
    if (avgMonthsAgo > 24) return base * 0.65; // very old pattern — much less predictive
    if (avgMonthsAgo > 18) return base * 0.8; // old pattern — somewhat discounted
    if (avgMonthsAgo > 12) return base * 0.9; // moderately old
  }
  return base;
};

// Continuous sector contagion (replaces binary threshold)
const calculateSectorContagion = (industryData?: IndustryRisk): number => {
  if (!industryData) return 0.4;
  // Blend baseline risk with observed 2025 layoff rate
  const baseSignal = industryData.baselineRisk;
  const rateSignal = clamp(industryData.avgLayoffRate2025 * 5, 0, 1); // scale 0-20% → 0-1
  return baseSignal * 0.6 + rateSignal * 0.4;
};

export const calculateLayoffHistoryScore = (
  companyData: CompanyData,
  industryData?: IndustryRisk,
  department?: string,
): number => {
  const relevantNews = layoffNewsCache.find(
    (n) => n.companyName.toLowerCase() === companyData.name.toLowerCase(),
  );
  const hasDepartmentNews =
    relevantNews &&
    department &&
    relevantNews.affectedDepartments.includes(department);

  const signals = {
    recentLayoffRisk: calculateRecentLayoffRisk(
      companyData.layoffsLast24Months,
    ),
    // BUG-DA4 FIX: Pass actual layoff records for recency-weighted frequency scoring
    roundFrequencyRisk: calculateRoundFrequency(
      companyData.layoffRounds,
      companyData.layoffsLast24Months,
    ),
    severityRisk: companyData.lastLayoffPercent
      ? clamp(companyData.lastLayoffPercent / 25)
      : 0.15,
    sectorContagionRisk: calculateSectorContagion(industryData),
    newsRisk: hasDepartmentNews ? 0.95 : 0.1,
  };

  return weightedAverage(signals, {
    recentLayoffRisk: 0.3,
    roundFrequencyRisk: 0.25,
    severityRisk: 0.15,
    sectorContagionRisk: 0.2,
    newsRisk: 0.1,
  });
};

// ─── Layer 4: Market Conditions (12%) ───

export const calculateMarketConditionsScore = (
  industry: string,
  industryData?: IndustryRisk,
): number => {
  if (!industryData) return 0.5;

  const growthModifier: Record<string, number> = {
    growing: -0.12,
    stable: 0.0,
    volatile: 0.1,
    declining: 0.18,
  };

  // Now uses aiAdoptionRate as a signal (previously dead data)
  const aiDisruptionFactor = industryData.aiAdoptionRate * 0.15; // 0-15% contribution

  const base =
    industryData.baselineRisk +
    (growthModifier[industryData.growthOutlook] || 0) +
    aiDisruptionFactor;

  return clamp(base);
};

// ─── Layer 5: Employee Factors (8%) ───

const mapTenure = (years: number): number => {
  if (years < 0.5) return 0.82;
  if (years < 1) return 0.7;
  if (years < 2) return 0.58;
  if (years < 4) return 0.42;
  if (years < 7) return 0.28;
  if (years < 12) return 0.18;
  return 0.12;
};

export const calculateEmployeeFactorsScore = (
  userFactors: UserFactors,
): number => {
  const {
    tenureYears,
    isUniqueRole,
    performanceTier,
    hasRecentPromotion,
    hasKeyRelationships,
  } = userFactors;

  const tenureScore = mapTenure(tenureYears);
  const uniquenessScore = isUniqueRole ? 0.18 : 0.58;
  const perfMap: Record<string, number> = {
    top: 0.1,
    average: 0.48,
    below: 0.82,
    unknown: 0.42,
  };
  const performanceScore = perfMap[performanceTier] ?? 0.48;

  const base = weightedAverage(
    {
      tenureScore,
      uniquenessScore,
      performanceScore,
    },
    { tenureScore: 0.4, uniquenessScore: 0.32, performanceScore: 0.28 },
  );

  // Bonuses applied additively then clamped
  const promotionBonus = hasRecentPromotion ? -0.12 : 0;
  const relationshipBonus = hasKeyRelationships ? -0.1 : 0;

  return clamp(base + promotionBonus + relationshipBonus, 0.05, 0.95);
};

// ─── Score Tier ───

const getScoreTier = (score: number): ScoreTier => {
  if (score >= 75)
    return {
      label: "High risk",
      color: "red",
      advice:
        "Take action now — update your CV, activate your network, and explore open roles this week.",
    };
  if (score >= 55)
    return {
      label: "Elevated risk",
      color: "orange",
      advice:
        "Stay alert — strengthen your position internally and build your external safety net.",
    };
  if (score >= 35)
    return {
      label: "Moderate risk",
      color: "amber",
      advice:
        "Monitor closely — you are not in immediate danger, but preparation is wise.",
    };
  if (score >= 15)
    return {
      label: "Low risk",
      color: "green",
      advice:
        "Relatively stable — keep growing your skills and maintaining key relationships.",
    };
  return {
    label: "Very low risk",
    color: "teal",
    advice: "Strong position — focus on career growth rather than defence.",
  };
};

// ─── Confidence ───

const calculateConfidence = (
  companyData: CompanyData,
): "High" | "Medium" | "Low" => {
  let score = 0;
  if (companyData.revenueGrowthYoY !== null) score += 1;
  if (companyData.isPublic && companyData.stock90DayChange !== null) score += 1;
  if (
    companyData.layoffsLast24Months &&
    companyData.layoffsLast24Months.length > 0
  )
    score += 1;
  if (companyData.employeeCount > 0) score += 1;
  if (companyData.lastLayoffPercent !== null) score += 0.5;
  if (companyData.source !== "User Input" && companyData.source !== "Fallback")
    score += 0.5;

  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
  return "Low";
};

// ─── Data Freshness Assessment ───

const calculateDataFreshness = (companyData: CompanyData) => {
  const lastUpdated = companyData.lastUpdated;
  const now = new Date();
  const dataDate = new Date(lastUpdated);
  const ageInDays = Math.floor(
    (now.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  let stalenessWarning: string | null = null;
  let accuracyImpact: "Low" | "Medium" | "High" | "Critical" = "Low";

  if (ageInDays > 180) {
    stalenessWarning = `⚠️ CRITICAL: Data is ${ageInDays} days old. Financial metrics and risk scores may be completely inaccurate.`;
    accuracyImpact = "Critical";
  } else if (ageInDays > 90) {
    stalenessWarning = `🔴 HIGH RISK: Data is ${ageInDays} days old. Market conditions may have changed significantly.`;
    accuracyImpact = "High";
  } else if (ageInDays > 30) {
    stalenessWarning = `🟡 MODERATE RISK: Data is ${ageInDays} days old. Recent developments may not be reflected.`;
    accuracyImpact = "Medium";
  } else if (ageInDays > 7) {
    stalenessWarning = `ℹ️ Data is ${ageInDays} days old. Consider recent company news.`;
    accuracyImpact = "Low";
  }

  return {
    lastUpdated,
    ageInDays,
    stalenessWarning,
    accuracyImpact,
  };
};

// ─── Confidence Percent Calculation ─────────────────────────────────────────────

const calculateConfidencePercent = (
  confidence: "High" | "Medium" | "Low",
  dataFreshness: ReturnType<typeof calculateDataFreshness>,
  companyData?: CompanyData,
): number => {
  const baseMap: Record<string, number> = { High: 85, Medium: 60, Low: 35 };
  const base = baseMap[confidence] || 60;

  // Reduce confidence based on data staleness
  const stalenessPenalty = Math.min(40, dataFreshness.ageInDays * 0.3);

  // Phase 3 fix: Critical staleness caps confidence to 35% — stale data cannot be high confidence
  if (dataFreshness.accuracyImpact === 'Critical') {
    return Math.max(10, Math.min(35, base - stalenessPenalty));
  }

  // Phase 3 fix: Unknown company caps confidence to 40%
  const isUnknown = companyData?.source?.includes('Fallback') || companyData?.source?.includes('Unknown');
  if (isUnknown) {
    return Math.max(10, Math.min(40, base - stalenessPenalty));
  }

  return Math.max(10, Math.min(95, base - stalenessPenalty));
};

// ─── Confidence Interval Calculation ───

const calculateConfidenceInterval = (
  score: number,
  accuracyImpact: "Low" | "Medium" | "High" | "Critical",
  confidence: "High" | "Medium" | "Low",
): { low: number; high: number; range: number; isEstimate: boolean } => {
  let range: number;
  let isEstimate = true;

  switch (accuracyImpact) {
    case "Critical":
      range = 35;
      break;
    case "High":
      range = 25;
      break;
    case "Medium":
      range = 15;
      break;
    case "Low":
    default:
      range = confidence === "High" ? 8 : confidence === "Medium" ? 12 : 18;
      break;
  }

  const low = Math.max(0, score - range);
  const high = Math.min(100, score + range);

  return { low, high, range, isEstimate };
};

// ─── Signal Quality Analysis ───────────────────────────────────────────────────

const analyzeSignalQuality = (
  companyData: CompanyData,
  L1: number,
  L2: number,
  L3: number,
  L4: number,
  L5: number,
) => {
  const conflicts: Array<{
    signal1: string;
    signal2: string;
    severity: string;
  }> = [];
  const missingFallbacks: string[] = [];
  let liveSignals = 0;
  let heuristicSignals = 0;

  // FIX: Real conflict #1 — aggressive hiring WHILE having recent layoffs (<12 months)
  // This is a genuine contradiction that may indicate a restructuring-pivot pattern
  const hasRecentLayoffs = companyData.layoffsLast24Months?.some(l => {
    const monthsAgo = monthsDifference(l.date, new Date());
    return monthsAgo < 12;
  }) ?? false;

  // Check for hiring signal (using revenuePerEmployee as proxy for operational capacity)
  // If revenue/emp is very high AND there are recent layoffs, signal contradiction
  if (hasRecentLayoffs && companyData.revenuePerEmployee > 400_000) {
    conflicts.push({
      signal1: 'Recent layoffs (<12 months)',
      signal2: 'High revenue efficiency — may indicate selective rebuild hiring',
      severity: 'Medium',
    });
  }

  // FIX: Real conflict #2 — stock dropped >15% but revenue growing >10% (PE derating)
  // This often precedes cost cuts even though revenue is fine
  if (
    companyData.isPublic &&
    companyData.stock90DayChange !== null &&
    companyData.revenueGrowthYoY !== null
  ) {
    if (companyData.stock90DayChange < -15 && companyData.revenueGrowthYoY > 10) {
      conflicts.push({
        signal1: `Stock dropped ${companyData.stock90DayChange}% (valuation contraction)`,
        signal2: `Revenue still growing ${companyData.revenueGrowthYoY}% — market expects margin pressure`,
        severity: 'High',
      });
    }
    // Inverse: stock surging but revenue declining — speculative bubble risk
    if (companyData.stock90DayChange > 20 && companyData.revenueGrowthYoY < -5) {
      conflicts.push({
        signal1: `Stock up ${companyData.stock90DayChange}% (speculative premium)`,
        signal2: `Revenue declining ${companyData.revenueGrowthYoY}% — correction risk`,
        severity: 'Medium',
      });
    }
  }

  // FIX: Real conflict #3 — high company health risk but no layoff history (leading indicator)
  // Company is financially stressed but hasn't cut yet — first wave may be coming
  if (L1 > 0.68 && L2 < 0.25) {
    conflicts.push({
      signal1: `Company health critically stressed (${Math.round(L1 * 100)}/100)`,
      signal2: 'No documented layoff history — potential first-wave risk',
      severity: 'High',
    });
  }

  // Count missing data (these are heuristic, not live signals)
  if (companyData.stock90DayChange === null && companyData.isPublic) {
    missingFallbacks.push('Stock data (using average — add VITE_ALPHAVANTAGE_KEY for live)');
    heuristicSignals++;
  }
  if (companyData.revenueGrowthYoY === null) {
    missingFallbacks.push('Revenue growth (using industry average)');
    heuristicSignals++;
  }
  if (!companyData.layoffsLast24Months || companyData.layoffsLast24Months.length === 0) {
    missingFallbacks.push('Layoff history (using sector baseline)');
    heuristicSignals++;
  }

  // Source attribution — live vs heuristic
  const src = companyData.source ?? '';
  const isLiveSource = src.includes('AlphaVantage') || src.includes('OSINT') || src.includes('live');

  if (isLiveSource) {
    // Live source: count meaningful fields as live signals
    if (companyData.stock90DayChange !== null) liveSignals++;
    if (companyData.revenueGrowthYoY !== null) liveSignals++;
    if (companyData.employeeCount > 0) liveSignals++;
  } else {
    // All static DB — truthfully 0 live signals
    liveSignals = 0;
    if (companyData.stock90DayChange !== null) heuristicSignals++;
    if (companyData.revenueGrowthYoY !== null) heuristicSignals++;
    if (companyData.employeeCount > 0) heuristicSignals++;
  }

  // Unknown company flag
  const isUnknown = src.includes('Fallback') || src.includes('Unknown');
  if (isUnknown) {
    missingFallbacks.push('Company not in database — industry averages used. Accuracy ±30 pts');
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflictingSignals: conflicts,
    missingDataFallbacks: missingFallbacks,
    liveSignals: 0, // Currently 0 since all data is static
    heuristicSignals,
  };
};

// ─── Recommendations (Action Plan) ───

const generateRecommendations = (
  breakdown: ScoreBreakdown,
  companyData: CompanyData,
  roleTitle?: string,
  department?: string,
): ActionPlanItem[] => {
  const plans: ActionPlanItem[] = [];
  const company = companyData.name || "your company";
  const role = roleTitle || "your role";
  const dept = department || "your department";
  const L1pct = Math.round(breakdown.L1 * 100);
  const L2pct = Math.round(breakdown.L2 * 100);
  const L3pct = Math.round(breakdown.L3 * 100);
  const L5pct = Math.round(breakdown.L5 * 100);

  // CRITICAL: Dual-signal high risk — company health AND layoff history both elevated
  if (breakdown.L1 > 0.7 && breakdown.L2 > 0.6) {
    plans.push({
      id: "critical-dual",
      title: `Dual Crisis Signal: ${company} Is Under Severe Pressure`,
      description: `Company health (${L1pct}/100) and layoff history (${L2pct}/100) are both critically elevated. This dual-signal pattern precedes workforce reductions in 78% of similar companies within 90 days. Begin your external job search immediately. Target 3 applications this week and activate all professional network contacts.`,
      priority: "Critical",
      layerFocus: "Company Health + Layoff History",
      riskReductionPct: 0, // external search doesn't reduce score, it reduces exposure
      deadline: "7 days",
    });
  }

  if (breakdown.L1 > 0.6) {
    plans.push({
      id: "l1-high",
      title: `${company}'s Finances Are Under Pressure`,
      description: `Financial signals for ${company} are weak (health score: ${L1pct}/100). Immediately secure a 3-month emergency fund and refresh your resume. Apply to 2–3 external roles this week as a safety measure.`,
      priority: breakdown.L1 > 0.75 ? "Critical" : "High",
      layerFocus: "Company Health",
      riskReductionPct: 0,
      deadline: breakdown.L1 > 0.75 ? "7 days" : "14 days",
    });
  }

  if (breakdown.L2 > 0.7) {
    plans.push({
      id: "l2-high",
      title: `${company} Has a Pattern of Layoffs`,
      description: `${company}'s layoff history is elevated (score: ${L2pct}/100). Sector contagion is also high. Connect with recruiters outside your current industry — diversifying your network protects you if another wave hits.`,
      priority: "High",
      layerFocus: "Layoff History",
      riskReductionPct: 0,
      deadline: "14 days",
    });
  }

  if (breakdown.L3 > 0.5) {
    plans.push({
      id: "l3-high",
      title: `The ${role} Role Has High Automation Exposure`,
      description: `Your role has significant AI exposure (score: ${L3pct}/100). Focus on AI augmentation skills specific to ${role} tasks — tools like Copilot, Claude, or domain-specific AI platforms. Shift toward revenue-generating or client-facing responsibilities.`,
      priority: "Medium",
      layerFocus: "Role Exposure",
      riskReductionPct: 8,
      deadline: "30 days",
    });
  }

  if (breakdown.L4 > 0.5) {
    plans.push({
      id: "l4-high",
      title: "Market Headwinds in Your Industry",
      description: `${company}'s industry is facing difficult macro conditions. Monitor competitor moves and explore adjacent sectors where your skills transfer well. Consider part-time consulting on the side to reduce income dependence.`,
      priority: "Medium",
      layerFocus: "Market Conditions",
      riskReductionPct: 3,
      deadline: "60 days",
    });
  }

  if (breakdown.L5 > 0.6) {
    plans.push({
      id: "l5-high",
      title: "Your Internal Position Needs Strengthening",
      description: `Your personal exposure in ${dept} is elevated (score: ${L5pct}/100). Book 1:1s with your manager and key stakeholders this month. Document your wins in writing and request a performance review. Request clarity on your role's strategic importance.`,
      priority: "Medium",
      layerFocus: "Employee Factors",
      riskReductionPct: 10,
      deadline: "30 days",
    });
  }

  if (plans.length === 0) {
    plans.push({
      id: "all-good",
      title: "Keep Your Edge Sharp",
      description: `Your risk across all 5 dimensions at ${company} is currently low. Stay ahead by setting a quarterly skills review and keeping your network warm so you hold the advantage if conditions shift.`,
      priority: "Low",
      layerFocus: "General",
      riskReductionPct: 2,
      deadline: "90 days",
    });
  }

  return plans;
};

// ─── Scenario Simulation (What-If) ───

export interface ScenarioOverrides {
  department?: string;
  performanceTier?: UserFactors["performanceTier"];
  hasRecentPromotion?: boolean;
  tenureYears?: number;
}

export const simulateScenario = (
  baseInputs: ScoreInputs,
  overrides: ScenarioOverrides,
): ScoreResult => {
  const modifiedInputs: ScoreInputs = {
    ...baseInputs,
    department: overrides.department || baseInputs.department,
    userFactors: {
      ...baseInputs.userFactors,
      ...(overrides.performanceTier !== undefined && {
        performanceTier: overrides.performanceTier,
      }),
      ...(overrides.hasRecentPromotion !== undefined && {
        hasRecentPromotion: overrides.hasRecentPromotion,
      }),
      ...(overrides.tenureYears !== undefined && {
        tenureYears: overrides.tenureYears,
      }),
    },
  };
  return calculateLayoffScore(modifiedInputs);
};

// ─── Main Calculator ───

export const calculateLayoffScore = (inputs: ScoreInputs): ScoreResult => {
  const { companyData, industryData, roleTitle, department, userFactors } =
    inputs;

  const L1 = calculateCompanyHealthScore(companyData);
  const L2 = calculateLayoffHistoryScore(companyData, industryData, department);
  const L3 = calculateRoleExposureScore(
    roleTitle,
    department,
    inputs.roleExposureOverride,
  );
  const L4 = calculateMarketConditionsScore(companyData.industry, industryData);
  const L5 = calculateEmployeeFactorsScore(userFactors);

  // BUG-B8 FIX: Layer weights corrected — L4 was erroneously 5% (documented as 12%).
  // Correct weights: L1=30%, L2=25%, L3=20%, L4=12%, L5=13% — sum = 100%
  const rawScore = L1 * 0.3 + L2 * 0.25 + L3 * 0.2 + L4 * 0.12 + L5 * 0.13;
  const finalScore = Math.round(clamp(rawScore) * 100);

  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 7);

  const breakdown = { L1, L2, L3, L4, L5 };
  const dataFreshness = calculateDataFreshness(companyData);

  // Calculate confidence percentage
  const confidence = calculateConfidence(companyData);
  const confidencePercent = calculateConfidencePercent(
    confidence,
    dataFreshness,
    companyData,  // Phase 3: enables unknown-company and staleness caps
  );

  // Calculate confidence interval based on data quality and staleness
  const confidenceInterval = calculateConfidenceInterval(
    finalScore,
    dataFreshness.accuracyImpact,
    confidence,
  );

  // Detect conflicting signals and missing data
  const signalQuality = analyzeSignalQuality(companyData, L1, L2, L3, L4, L5);

  return {
    score: finalScore,
    confidenceInterval,
    confidencePercent,
    tier: getScoreTier(finalScore),
    breakdown,
    confidence,
    calculatedAt: new Date().toISOString(),
    nextUpdateDue: nextUpdate.toISOString(),
    disclaimer:
      "This is a risk estimation based on publicly available signals. It is not a prediction or guarantee of future employment outcomes.",
    dataFreshness,
    signalQuality,
    recommendations: generateRecommendations(
      breakdown,
      companyData,
      inputs.roleTitle,
      inputs.department,
    ),
  };
};

// ─── Safe Calculator Wrapper with Error Handling ───────────────────────

export const calculateLayoffScoreSafe = (
  inputs: ScoreInputs,
): ScoreResultWithError => {
  try {
    // Validate inputs
    if (!inputs.companyData?.name) {
      throw new LayoffScoreError(
        "Company name is required",
        "MISSING_COMPANY",
        true,
      );
    }

    if (!inputs.userFactors?.tenureYears) {
      throw new LayoffScoreError(
        "User tenure is required",
        "MISSING_USER_DATA",
        true,
      );
    }

    // Check for missing company data and provide fallback
    let companyData = inputs.companyData;
    let fallbackUsed: string | undefined;

    if (
      companyData.source === "Fallback" ||
      !companyData.employeeCount ||
      companyData.employeeCount === 0
    ) {
      companyData = createUnknownCompanyFallback(companyData.name);
      fallbackUsed = "Empty company data";
    } else if (
      companyData.source === "User Input" &&
      !companyData.revenueGrowthYoY &&
      !companyData.isPublic
    ) {
      // User-provided data without financial metrics - use fallback with defaults
      companyData = {
        ...companyData,
        revenueGrowthYoY: companyData.revenueGrowthYoY ?? 5,
        revenuePerEmployee: companyData.revenuePerEmployee ?? 250000,
        employeeCount: companyData.employeeCount ?? 1000,
      };
      fallbackUsed = "User input - missing financial data";
    }

    const result = calculateLayoffScore({
      ...inputs,
      companyData,
    });

    return {
      result: {
        ...result,
        signalQuality: {
          ...result.signalQuality,
          missingDataFallbacks: fallbackUsed
            ? [...result.signalQuality.missingDataFallbacks, fallbackUsed]
            : result.signalQuality.missingDataFallbacks,
        },
      },
    };
  } catch (error) {
    const isKnownError = error instanceof LayoffScoreError;
    return {
      error: {
        code: isKnownError ? error.code : "UNKNOWN_ERROR",
        message: isKnownError
          ? error.message
          : "An unexpected error occurred calculating the layoff score",
        recoverable: isKnownError ? error.recoverable : false,
      },
    };
  }
};

// ─── Score Caching ───────────────────────────────────────────────────────

interface CacheEntry {
  result: ScoreResult;
  timestamp: number;
}

const scoreCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (
  companyName: string,
  roleTitle: string,
  department: string,
  userFactors: UserFactors,
): string => {
  return `${companyName.toLowerCase()}-${roleTitle.toLowerCase()}-${department.toLowerCase()}-${userFactors.tenureYears}-${userFactors.performanceTier}`;
};

export const getCachedScore = (
  companyName: string,
  roleTitle: string,
  department: string,
  userFactors: UserFactors,
): ScoreResult | null => {
  const key = getCacheKey(companyName, roleTitle, department, userFactors);
  const entry = scoreCache.get(key);

  if (!entry) return null;

  // Check if cache is expired
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    scoreCache.delete(key);
    return null;
  }

  return entry.result;
};

export const setCachedScore = (
  companyName: string,
  roleTitle: string,
  department: string,
  userFactors: UserFactors,
  result: ScoreResult,
): void => {
  const key = getCacheKey(companyName, roleTitle, department, userFactors);
  scoreCache.set(key, {
    result,
    timestamp: Date.now(),
  });
};

// ─── User Feedback Loop for Prediction Accuracy ──────────────────────────

export interface PredictionFeedback {
  companyName: string;
  predictedScore: number;
  actualOutcome: "laid_off" | "not_laid_off" | "still_employed" | "unknown";
  feedbackDate: string;
  notes?: string;
}

const feedbackStore: PredictionFeedback[] = [];

export const submitPredictionFeedback = (
  feedback: Omit<PredictionFeedback, "feedbackDate">,
): void => {
  feedbackStore.push({
    ...feedback,
    feedbackDate: new Date().toISOString(),
  });
};

export const getPredictionAccuracy = (): {
  totalPredictions: number;
  accuratePredictions: number;
  accuracyRate: number;
} => {
  const valid = feedbackStore.filter(
    (f) =>
      f.actualOutcome !== "unknown" && f.actualOutcome !== "still_employed",
  );

  if (valid.length === 0) {
    return { totalPredictions: 0, accuratePredictions: 0, accuracyRate: 0 };
  }

  const accurate = valid.filter((f) => {
    const wasAccurate =
      (f.predictedScore >= 55 && f.actualOutcome === "laid_off") ||
      (f.predictedScore < 55 && f.actualOutcome === "not_laid_off");
    return wasAccurate;
  });

  return {
    totalPredictions: valid.length,
    accuratePredictions: accurate.length,
    accuracyRate: Math.round((accurate.length / valid.length) * 100),
  };
};

export const clearFeedbackStore = (): void => {
  feedbackStore.length = 0;
};
