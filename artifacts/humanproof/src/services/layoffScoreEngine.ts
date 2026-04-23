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
import { getCompanyRoleRisk } from "../data/companyIntelligenceBridge";
import { IndustryRisk } from "../data/industryRiskData";
import {
  calculateRoleExposureScore,
  inferRoleRisk,
  roleExposureData,
  RoleExposure,
} from "../data/roleExposureData";
import { layoffNewsCache } from "../data/layoffNewsCache";
import { getCareerIntelligence } from "../data/intelligence/index";

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
  L1: number; // Company Health (financial signals)
  L2: number; // Layoff History
  L3: number; // Role Displacement / Task Automatability (D1)
  L4: number; // Market Conditions / Country-Market Context (D5)
  L5: number; // Employee Factors / Experience Protection (D4)
  D6?: number; // AI Agent Capability — autonomous agent coverage of role
  D7?: number; // Company Health Risk — unified L1+L2+AI adoption signal
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
  /** Provenance: which signals back this recommendation. Empty when the item
   *  is a generic safety-net (e.g. the all-good fallback). The UI surfaces
   *  these so readers can see exactly what the recommendation rests on
   *  rather than treating it as opaque advice. */
  evidence?: Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>;
}

/**
 * LayoffProbabilityForecast — concrete P(layoff round) for the next two
 * windows, derived from sector base rate × company-specific multipliers.
 * The point of surfacing the math (multipliers field) is so the reader can
 * sanity-check the number rather than treating the score as opaque.
 */
export interface LayoffProbabilityForecast {
  next90Days: number;          // 0..1
  next180Days: number;         // 0..1
  baseSectorRate: number;      // 0..1, from industryData.avgLayoffRate2025
  multipliers: Array<{ name: string; factor: number; reason: string }>;
  /** Plain-English summary the UI can render without re-deriving the math */
  verdict: string;
}

/**
 * LayoffTiming — calendar-aware window analysis. Re-cut waves at companies
 * with restructuring patterns typically follow a 6–9 month rhythm; this
 * struct surfaces where the user's company sits in that rhythm so that
 * "next wave likely in N months" is a concrete claim, not vague unease.
 */
export interface LayoffTiming {
  daysSinceLastCut: number | null;
  totalRoundsTracked: number;
  /** "outside-window" | "approaching-window" | "in-window" | "past-window" | "no-history" */
  windowStatus: "no-history" | "outside-window" | "approaching-window" | "in-window" | "past-window";
  /** Days until the *start* of the typical re-cut window (negative = already inside it). */
  daysUntilWindow: number | null;
  /** Plain-English summary the UI can render without re-deriving the math */
  verdict: string;
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
  /** Concrete probability of a layoff round in the next 90/180 days, with
   *  the multiplier chain that produced it surfaced for transparency. */
  probabilityForecast: LayoffProbabilityForecast;
  /** Where the company sits in the typical re-layoff rhythm (days since
   *  last cut → likely next-wave window). */
  timing: LayoffTiming;
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

  // Floor lowered from 0.05 → 0.03 so a fully-protected profile (long tenure +
  // top performance + recent promotion + key relationships + unique role) can
  // pull the L5 contribution toward zero rather than getting stuck at the
  // original floor — necessary for the "Very low risk" tier to be reachable.
  return clamp(base + promotionBonus + relationshipBonus, 0.03, 0.95);
};

// ─── D6: AI Agent Capability (8%) ─────────────────────────────────────────────
// How much of this role can autonomous AI agents handle end-to-end?

const calculateAIAgentCapability = (
  roleTitle: string,
  aiRisk: number,
): number => {
  const t = roleTitle.toLowerCase();
  if (/data entry|transcri|translate|bookkeep/i.test(t)) return 0.93;
  if (/customer service|support|helpdesk|chat/i.test(t)) return 0.82;
  if (/content|writer|copywriter|editor/i.test(t)) return 0.78;
  if (/legal research|paralegal/i.test(t)) return 0.72;
  if (/junior|intern|entry.level/i.test(t)) return 0.65;
  if (/analyst/i.test(t)) return 0.55;
  if (/qa|quality/i.test(t)) return 0.60;
  if (/recruiter|hr/i.test(t)) return 0.50;
  if (/engineer|developer|dev/i.test(t)) return 0.38;
  if (/designer|ux|ui/i.test(t)) return 0.40;
  if (/manager|director/i.test(t)) return 0.22;
  if (/surgeon|physician|nurse|clinical/i.test(t)) return 0.06;
  if (/ai|ml|machine learning/i.test(t)) return 0.10;
  if (/cyber|security/i.test(t)) return 0.20;
  // Fallback: scale from role's aiRisk proxy (more automatable → more agent-replaceable)
  return clamp(aiRisk * 0.88);
};

// ─── D7: Unified Company Health Risk (7%) ─────────────────────────────────────
// Combines L1 (financial), L2 (layoff history), L4 (market context), AI adoption

const calculateD7CompanyHealthRisk = (
  L1: number,
  L2: number,
  L4: number,
  companyData: CompanyData,
): number => {
  const aiAdoptionMap: Record<string, number> = {
    low: 0.25,
    medium: 0.50,
    high: 0.75,
    very_high: 0.90,
  };
  const aiAdoption = aiAdoptionMap[companyData.aiInvestmentSignal ?? 'medium'] ?? 0.5;

  // Leadership stability proxy: recent rounds = instability, no history = stable
  const leadershipInstability = companyData.layoffRounds > 2
    ? 0.75
    : companyData.layoffRounds > 0
      ? 0.45
      : 0.20;

  return clamp(
    L1 * 0.30 +
    L2 * 0.25 +
    L4 * 0.20 +
    aiAdoption * 0.15 +
    leadershipInstability * 0.10,
  );
};

// ─── D2: AI Tool Maturity (18%) ───────────────────────────────────────────────
// How mature and production-deployed are AI tools in this role's domain?

const calculateAIToolMaturity = (
  companyData: CompanyData,
  roleAIRisk: number,
  demandTrend: 'rising' | 'stable' | 'falling',
): number => {
  const companyAIMap: Record<string, number> = {
    low: 0.18,
    medium: 0.48,
    high: 0.72,
    very_high: 0.88,
  };
  const companyAI = companyAIMap[companyData.aiInvestmentSignal ?? 'medium'] ?? 0.48;
  // Higher AI risk role + falling demand = AI tools are mature in this domain
  const domainMaturity = roleAIRisk * 0.6 + (demandTrend === 'falling' ? 0.15 : demandTrend === 'stable' ? 0.05 : 0.0);
  // Weight domain maturity over company AI investment: a healthcare physician
  // at an "AI-very-high" company is not at AI-displacement risk just because
  // their employer invests heavily in AI. Previously the 50/50 split let the
  // company-level signal dominate even when the role itself was unrelated to
  // AI displacement, polluting tier-boundary tests for stable healthcare /
  // research / leadership roles. The 30/70 split keeps company AI investment
  // a meaningful tilt without overpowering role-specific automatability.
  return clamp(companyAI * 0.30 + domainMaturity * 0.70);
};

// ─── D3 Risk: Augmentation Potential risk (18%) — inverted ───────────────────
// (1 - augmentation potential) = risk from low ability to leverage AI as partner

const calculateAugmentationRisk = (
  roleAIRisk: number,
  demandTrend: 'rising' | 'stable' | 'falling',
): number => {
  const trendRisk = demandTrend === 'falling' ? 0.82 : demandTrend === 'stable' ? 0.42 : 0.15;
  return clamp(trendRisk * 0.55 + roleAIRisk * 0.45);
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
  D6?: number,
  D7?: number,
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
  if (L1 > 0.68 && L2 < 0.25) {
    conflicts.push({
      signal1: `Company health critically stressed (${Math.round(L1 * 100)}/100)`,
      signal2: 'No documented layoff history — potential first-wave risk',
      severity: 'High',
    });
  }

  // D6 conflict — high agent capability but low AI tool maturity in company
  if (D6 !== undefined && D7 !== undefined) {
    if (D6 > 0.75 && D7 < 0.3) {
      conflicts.push({
        signal1: `AI agents can fully handle ${Math.round(D6 * 100)}% of role tasks`,
        signal2: 'Company AI adoption is low — displacement may arrive with sudden investment',
        severity: 'Medium',
      });
    }
    // D7 conflict — company health risk high but D6 agent risk is low (role is protected)
    if (D7 > 0.72 && D6 < 0.25) {
      conflicts.push({
        signal1: `Company health at risk (D7: ${Math.round(D7 * 100)}/100)`,
        signal2: 'Role has low AI agent coverage — budget cuts rather than AI displacement is the threat',
        severity: 'High',
      });
    }
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
    liveSignals,
    heuristicSignals,
  };
};

// Format a layoff event date as something concrete ("January 2024") rather
// than the raw ISO string the recommendation can compose into prose. Hoisted
// above the forecast/timing engines because they reference it; the
// recommendation block below also uses it via the same definition.
const formatLayoffDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

// ─── Layoff Probability Forecast ──────────────────────────────────────────
//
// Question we want to answer: "What is the probability my employer runs a
// layoff round in the next 90 days?" rather than the (less actionable)
// "What is your aggregated risk score?".
//
// Approach: take the sector base rate (industryData.avgLayoffRate2025 — the
// observed share of firms that cut staff in 2025) and apply a chain of
// company-specific multipliers driven by signals we already scored.
// Multipliers are surfaced in the result so the reader can sanity-check
// the math; this is a forecast, not a magic number.
//
// Calibration notes: the sector base rate is an *annual* probability; we
// scale it to 90-day and 180-day windows assuming a roughly uniform
// hazard. Company multipliers are tuned so an "all clear" company sits at
// roughly 0.4× sector base, while a multi-signal-distressed company sits
// at roughly 4× — bracketing the observed 2024–2026 range without
// pretending to predict tail outcomes. Cap final probability at 0.95 to
// preserve room for confidence — even maximally distressed companies are
// not guaranteed to cut in 90 days.
const computeLayoffProbabilityForecast = (
  companyData: CompanyData,
  industryData: IndustryRisk | undefined,
  breakdown: ScoreBreakdown,
  now: Date,
): LayoffProbabilityForecast => {
  // Sector base — fall back to a moderate 5% annual rate when industry
  // data is missing rather than silently producing 0% probability.
  const sectorAnnualRate = industryData?.avgLayoffRate2025 ?? 0.05;
  const multipliers: Array<{ name: string; factor: number; reason: string }> = [];

  // Recent-cut bias: companies that already cut in the last 12 months are
  // statistically much more likely to cut again (re-org momentum + cost
  // structure that didn't fix in one round). Magnitude tracks recency.
  const lastCut = (companyData.layoffsLast24Months ?? [])[0];
  if (lastCut) {
    const monthsSince = (now.getTime() - new Date(lastCut.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSince < 6) {
      multipliers.push({ name: "recent-cut", factor: 1.6, reason: `cut staff <6mo ago (${formatLayoffDate(lastCut.date)})` });
    } else if (monthsSince < 12) {
      multipliers.push({ name: "recent-cut", factor: 1.3, reason: `cut staff 6–12mo ago — re-cut window approaching` });
    }
  }

  // Multi-round pattern: 2+ rounds in 24 months indicates structural
  // not cyclical pressure, which raises near-term probability sharply.
  const rounds = companyData.layoffRounds ?? 0;
  if (rounds >= 3) multipliers.push({ name: "chronic-restructuring", factor: 1.8, reason: `${rounds} rounds in 24mo — structural pattern` });
  else if (rounds === 2) multipliers.push({ name: "second-wave", factor: 1.4, reason: `2 rounds in 24mo — second wave already happened` });

  // Financial weakness — translate L1 score into a multiplier band.
  if (breakdown.L1 >= 0.75) multipliers.push({ name: "severe-financial-stress", factor: 1.7, reason: `L1 health score ${Math.round(breakdown.L1 * 100)}/100` });
  else if (breakdown.L1 >= 0.6) multipliers.push({ name: "financial-stress", factor: 1.35, reason: `L1 health score ${Math.round(breakdown.L1 * 100)}/100` });
  else if (breakdown.L1 <= 0.3) multipliers.push({ name: "financial-strength", factor: 0.65, reason: `L1 health score ${Math.round(breakdown.L1 * 100)}/100 — strong fundamentals` });

  // Sector trajectory — declining/volatile sectors compound company stress.
  const outlook = industryData?.growthOutlook;
  if (outlook === "declining") multipliers.push({ name: "sector-declining", factor: 1.3, reason: `${companyData.industry} outlook is declining` });
  else if (outlook === "volatile") multipliers.push({ name: "sector-volatile", factor: 1.15, reason: `${companyData.industry} outlook is volatile` });
  else if (outlook === "growing") multipliers.push({ name: "sector-growing", factor: 0.8, reason: `${companyData.industry} outlook is growing` });

  // Stock signal — large drawdowns precede cost-cutting cycles within
  // about one quarter; large rallies usually mean the cuts already happened
  // (so the *next* round is less likely, not more).
  if (companyData.stock90DayChange != null) {
    const move = companyData.stock90DayChange;
    if (move <= -25) multipliers.push({ name: "severe-drawdown", factor: 1.5, reason: `${move}% 90-day drawdown` });
    else if (move <= -10) multipliers.push({ name: "drawdown", factor: 1.2, reason: `${move}% 90-day drawdown` });
    else if (move >= 20) multipliers.push({ name: "rally", factor: 0.85, reason: `${move > 0 ? "+" : ""}${move}% 90-day rally — restructuring largely priced in` });
  }

  // Compose final annual probability — multiplicative chain with a sanity cap.
  const compoundedAnnualRate = multipliers.reduce(
    (rate, m) => rate * m.factor,
    sectorAnnualRate,
  );
  const cappedAnnualRate = Math.min(0.95, compoundedAnnualRate);

  // Convert annual to window probabilities. Hazard model: P(event in T) =
  // 1 - (1 - annualRate)^(T/365). Approximation good enough at these
  // ranges; we are not pretending to be a Cox model.
  const next90Days = Math.min(0.95, 1 - Math.pow(1 - cappedAnnualRate, 90 / 365));
  const next180Days = Math.min(0.95, 1 - Math.pow(1 - cappedAnnualRate, 180 / 365));

  // Verdict — calibrated to common decision thresholds (15% / 35% / 60%
  // are roughly the breakpoints where most users would want to start
  // searching, accelerate searching, or treat the cut as effectively
  // certain). The numbers in the verdict are the same as the field
  // values so the UI can show either form.
  const pct90 = Math.round(next90Days * 100);
  const verdict = next90Days >= 0.6
    ? `Layoff round in next 90 days is more likely than not (${pct90}% modeled probability) — the multiplier chain stacks several stress signals on top of a ${Math.round(sectorAnnualRate * 100)}% sector base rate.`
    : next90Days >= 0.35
      ? `Materially elevated 90-day probability (${pct90}%) — above the ${Math.round(sectorAnnualRate * 100)}% sector base rate by a multiple of ${(cappedAnnualRate / sectorAnnualRate).toFixed(1)}×.`
      : next90Days >= 0.15
        ? `Modestly elevated 90-day probability (${pct90}%) — slightly above sector base rate but no single dominant signal.`
        : `Low 90-day probability (${pct90}%) — at or below the ${Math.round(sectorAnnualRate * 100)}% sector base rate; no compounded stress signals.`;

  return {
    next90Days,
    next180Days,
    baseSectorRate: sectorAnnualRate,
    multipliers,
    verdict,
  };
};

// ─── Layoff Timing (re-cut window analysis) ───────────────────────────────
//
// Empirically, companies that have done one layoff round in the past 24
// months tend to do the next one ~6–9 months later (the cost-cut cycle
// finishes around quarter-end, the resulting head-room buys 1–2 quarters,
// then the next forecast miss triggers the next round). This function
// converts that pattern into a calendar-aware verdict so users see "you
// are 4 days from the typical re-cut window" instead of "elevated risk".
const RECUT_WINDOW_START_MONTHS = 6;
const RECUT_WINDOW_END_MONTHS = 9;

const computeLayoffTiming = (
  companyData: CompanyData,
  now: Date,
): LayoffTiming => {
  const lastCut = (companyData.layoffsLast24Months ?? [])[0];
  const totalRounds = companyData.layoffRounds ?? 0;

  if (!lastCut) {
    return {
      daysSinceLastCut: null,
      totalRoundsTracked: 0,
      windowStatus: "no-history",
      daysUntilWindow: null,
      verdict: `No tracked layoff rounds in the past 24 months. Re-cut timing is not informative when the first round has not happened.`,
    };
  }

  const lastCutDate = new Date(lastCut.date);
  const daysSince = Math.max(0, Math.floor((now.getTime() - lastCutDate.getTime()) / (1000 * 60 * 60 * 24)));
  const windowStartDays = RECUT_WINDOW_START_MONTHS * 30;
  const windowEndDays = RECUT_WINDOW_END_MONTHS * 30;
  const daysUntilWindow = windowStartDays - daysSince; // negative once we're inside

  let windowStatus: LayoffTiming["windowStatus"];
  let verdict: string;

  if (daysSince < windowStartDays - 60) {
    // > 2 months before the typical window — too early for re-cut alarm.
    windowStatus = "outside-window";
    verdict = `Last cut was ${formatLayoffDate(lastCut.date)} (${daysSince} days ago). The typical 6–9 month re-cut window opens in ~${daysUntilWindow} days — outside the alarm zone today.`;
  } else if (daysSince < windowStartDays) {
    windowStatus = "approaching-window";
    verdict = `Last cut was ${formatLayoffDate(lastCut.date)} (${daysSince} days ago). The typical 6–9 month re-cut window opens in ${daysUntilWindow} days — start the search this month, not next quarter.`;
  } else if (daysSince <= windowEndDays) {
    windowStatus = "in-window";
    const daysIntoWindow = daysSince - windowStartDays;
    const daysLeftInWindow = windowEndDays - daysSince;
    verdict = `Last cut was ${formatLayoffDate(lastCut.date)} (${daysSince} days ago) — you are ${daysIntoWindow} days into the typical re-cut window with ${daysLeftInWindow} days remaining. This is the highest-density period for second-wave announcements.`;
  } else {
    windowStatus = "past-window";
    const daysPast = daysSince - windowEndDays;
    verdict = `Last cut was ${formatLayoffDate(lastCut.date)} (${daysSince} days ago) — ${daysPast} days past the typical re-cut window. Either the company stabilised or the next round is overdue; check forward-looking signals (hiring freeze, guidance cuts) to disambiguate.`;
  }

  // Multi-round pattern note appended for chronic restructurers.
  if (totalRounds >= 2) {
    verdict += ` Pattern: ${totalRounds} rounds tracked in 24 months.`;
  }

  return {
    daysSinceLastCut: daysSince,
    totalRoundsTracked: totalRounds,
    windowStatus,
    daysUntilWindow,
    verdict,
  };
};

// ─── Recommendations (Action Plan) ───
//
// Personalization model: every recommendation must compose four context
// layers so that two users with the same risk band but different
// (industry, region, role, tenure, performance, layoff history) receive
// materially different guidance — not the same template with names swapped.
//
//   1. Company-specific signal: actual layoff date / cut size / stock move,
//      not "elevated".
//   2. Industry-specific signal: growth outlook, AI adoption, sector
//      layoff rate — pulled from industryData.
//   3. Role-specific tooling: which AI tools actually displace this role
//      (selected from a small role-keyword map below).
//   4. User-specific protection: tenure bracket + performance tier
//      determines which protective tactics apply (probationary employees
//      cannot lean on relationship capital; senior employees cannot rely
//      on "tenure protection").
//
// The previous implementation interpolated company / role / score values
// into a fixed narrative skeleton. The uniqueness probe in
// __tests__/uniqueness-probe.test.ts measures Jaccard similarity across
// (company × role × tenure) permutations to keep this function honest.

// Map keyword → AI tools currently displacing that role's primary tasks.
// Keyed by lowercase substring match in roleTitle / department so unknown
// titles still get a sensible default rather than silence.
const ROLE_AI_TOOLS: Array<{ match: RegExp; tools: string; tasks: string }> = [
  { match: /\b(software|developer|engineer|swe|backend|frontend)\b/i, tools: "Claude Code, GitHub Copilot, Cursor, and Devin", tasks: "boilerplate code, unit tests, refactors, and PR reviews" },
  { match: /\b(data scientist|ml engineer|analyst)\b/i, tools: "Hex Magic, ChatGPT Advanced Data, Julius, and Bedrock notebooks", tasks: "exploratory analysis, dashboards, and model prototyping" },
  { match: /\b(designer|ux|ui|product designer)\b/i, tools: "Figma AI, Galileo, Uizard, and v0", tasks: "wireframes, design variants, copy iteration, and component generation" },
  { match: /\b(marketing|content|copywrit|seo|growth)\b/i, tools: "Jasper, Copy.ai, Lavender, and HubSpot Content Assistant", tasks: "copy drafts, A/B variants, segmentation briefs, and SEO outlines" },
  { match: /\b(sales|account executive|sdr|bdr)\b/i, tools: "Gong, Clari Copilot, Apollo AI, and 11x", tasks: "prospecting lists, call summaries, and follow-up sequencing" },
  { match: /\b(customer support|customer success|csm|service rep)\b/i, tools: "Intercom Fin, Ada, Kustomer IQ, and Decagon", tasks: "tier-1 ticket resolution, knowledge-base search, and macro selection" },
  { match: /\b(hr|recruit|talent|people ops)\b/i, tools: "Eightfold, HiredScore, Paradox, and Workday Illuminate", tasks: "candidate sourcing, screening, scheduling, and policy Q&A" },
  { match: /\b(legal|paralegal|counsel|attorney)\b/i, tools: "Harvey, Spellbook, Casetext CoCounsel, and Thomson Reuters CoCounsel Core", tasks: "contract markup, due-diligence review, and case-law research" },
  { match: /\b(finance|accounting|controller|auditor|bookkeep)\b/i, tools: "Microsoft Copilot for Finance, Vic.ai, Trullion, and Tabs", tasks: "AP/AR reconciliation, audit prep, and variance analysis" },
  { match: /\b(physician|nurse|clinician|therapist|surgeon)\b/i, tools: "ambient AI scribes (Abridge, Suki, Nuance DAX)", tasks: "documentation and clinical notes — but bedside judgement remains protected" },
  { match: /\b(teacher|professor|instructor|tutor)\b/i, tools: "Khanmigo, MagicSchool, and Brisk Teaching", tasks: "lesson plans, rubric drafting, and individualized feedback" },
  { match: /\b(operations|supply chain|logistics|warehouse)\b/i, tools: "o9, Blue Yonder Cognitive Demand, and Pactum AI", tasks: "demand forecasting, vendor negotiation, and routing optimization" },
  { match: /\b(business analyst|product analyst|bi)\b/i, tools: "ThoughtSpot Sage, Domo AI, and Tableau Pulse", tasks: "ad-hoc reporting, requirements gathering, and dashboard authoring" },
];

const getRoleToolingContext = (roleTitle: string, department: string): { tools: string; tasks: string } => {
  const search = `${roleTitle} ${department}`;
  for (const entry of ROLE_AI_TOOLS) {
    if (entry.match.test(search)) return { tools: entry.tools, tasks: entry.tasks };
  }
  return { tools: "general-purpose copilots (ChatGPT, Claude, Microsoft 365 Copilot, Gemini)", tasks: "drafting, summarization, and routine analysis common to your function" };
};

// Region → labour-market specifics that change the *protective* tactic
// (severance norms, notice periods, hiring velocity).
const REGION_CONTEXT: Record<string, { jobMarketHint: string; severanceNote: string; networkChannel: string }> = {
  US: {
    jobMarketHint: "WARN Act gives 60-day notice for cuts >50 people at sites of ≥100 — track your state's listings",
    severanceNote: "negotiate severance in writing before signing; 2 weeks per year of service is the median floor",
    networkChannel: "LinkedIn + sector-specific Slack communities (Lenny's, Pavilion, RevGenius)",
  },
  EU: {
    jobMarketHint: "EU works-council notice typically runs 30–90 days — ask HR what consultation phase you are in",
    severanceNote: "statutory minimums vary by country (1–3 months); collective agreement may add more",
    networkChannel: "Xing (DACH), Welcome to the Jungle (FR), and country-specific LinkedIn groups",
  },
  IN: {
    jobMarketHint: "Indian IT hiring is rebounding in GCCs (capability centres) — focus there first, services firms second",
    severanceNote: "Industrial Disputes Act protects workmen-grade roles; managerial cuts get 1–3 months in lieu",
    networkChannel: "Naukri + LinkedIn India + Telegram alumni groups (IIT/IIM/NIT/BITS)",
  },
  APAC: {
    jobMarketHint: "Singapore + Australia tech hiring is highest in the region; Japan continues hiring engineers in JP-tech firms",
    severanceNote: "Singapore offers minimal statutory severance; Australia mandates redundancy pay after 1 year",
    networkChannel: "LinkedIn APAC + JobStreet (SEA) + Seek (AU/NZ)",
  },
  GLOBAL: {
    jobMarketHint: "remote-friendly companies (Deel, Remote, Toptal network) absorb cross-border talent fastest",
    severanceNote: "severance varies by entity-of-employment — confirm which country's law applies before signing",
    networkChannel: "LinkedIn + remote-job boards (We Work Remotely, Remote OK, AngelList Talent)",
  },
};

// Tenure bracket → which protection / search tactic actually applies.
const tenureGuidance = (tenureYears: number): { bracket: string; protection: string; searchTactic: string } => {
  if (tenureYears < 1) return {
    bracket: "probationary",
    protection: "you have minimal severance entitlement — prioritize building a 6-week runway over relationship investment",
    searchTactic: "lean on prior-employer references; first-year exits are common and explainable in interviews",
  };
  if (tenureYears < 3) return {
    bracket: "early",
    protection: "document one quantifiable win per quarter and ensure your manager's manager knows your name — visibility outranks tenure here",
    searchTactic: "you can move laterally without resume penalty; target adjacent companies where your shipped work is recognizable",
  };
  if (tenureYears < 7) return {
    bracket: "established",
    protection: "your relationship capital is your strongest defence — schedule one cross-functional 1:1 per week and chair at least one initiative",
    searchTactic: "warm intros from past colleagues now in senior roles outperform cold applications 5:1 — prioritize that channel",
  };
  if (tenureYears < 15) return {
    bracket: "senior",
    protection: "you are at higher payroll cost — convert that into irreplaceability via cross-team mandate, mentorship, or owned domain",
    searchTactic: "executive recruiters (Heidrick, Spencer Stuart, sector boutiques) reach out via LinkedIn — keep your headline current and accept calls",
  };
  return {
    bracket: "principal",
    protection: "preserve institutional memory by writing it down (architecture decisions, customer history) — this is harder to cut than redundant headcount",
    searchTactic: "advisory, fractional, and board-track roles are your fastest path; sector-specific Slack groups + alumni networks beat job boards",
  };
};

const generateRecommendations = (
  breakdown: ScoreBreakdown,
  companyData: CompanyData,
  roleTitle?: string,
  department?: string,
  userFactors?: UserFactors,
  industryData?: IndustryRisk,
  probabilityForecast?: LayoffProbabilityForecast,
  timing?: LayoffTiming,
): ActionPlanItem[] => {
  const plans: ActionPlanItem[] = [];
  const company = companyData.name || "your company";
  const role = roleTitle || "your role";
  const dept = department || "your department";
  const industry = companyData.industry || "your industry";
  const region = (companyData.region as keyof typeof REGION_CONTEXT) || "GLOBAL";
  const regionCtx = REGION_CONTEXT[region] ?? REGION_CONTEXT.GLOBAL;
  const tooling = getRoleToolingContext(role, dept);
  const tenure = tenureGuidance(userFactors?.tenureYears ?? 3);
  const performance = userFactors?.performanceTier ?? "unknown";
  const promoted = userFactors?.hasRecentPromotion ?? false;
  const lastLayoff = (companyData.layoffsLast24Months ?? [])[0];
  const lastLayoffPhrase = lastLayoff
    ? `${formatLayoffDate(lastLayoff.date)} cut ${lastLayoff.percentCut}% of staff`
    : null;
  const stockPhrase =
    companyData.stock90DayChange != null
      ? `${companyData.stock90DayChange > 0 ? "+" : ""}${companyData.stock90DayChange}% stock move over 90 days`
      : null;
  const revenuePhrase =
    companyData.revenueGrowthYoY != null
      ? `${companyData.revenueGrowthYoY > 0 ? "+" : ""}${companyData.revenueGrowthYoY}% YoY revenue`
      : null;
  const aiSignal = companyData.aiInvestmentSignal ?? "medium";
  const sectorLayoffRate = industryData?.avgLayoffRate2025 != null
    ? `${Math.round(industryData.avgLayoffRate2025 * 100)}% of ${industry} firms cut staff in the last cycle`
    : null;
  const growthOutlook = industryData?.growthOutlook ?? "stable";

  const L1pct = Math.round(breakdown.L1 * 100);
  const L2pct = Math.round(breakdown.L2 * 100);
  const L3pct = Math.round(breakdown.L3 * 100);
  const L5pct = Math.round(breakdown.L5 * 100);
  const D6pct = Math.round((breakdown.D6 ?? 0) * 100);
  const D7pct = Math.round((breakdown.D7 ?? 0) * 100);

  // Forecast-driven critical: bypass per-layer gating when the probability
  // engine says the next 90 days carry meaningful layoff probability.
  // Surfacing the modeled number rather than a label gives the reader a
  // concrete decision threshold to act on.
  if (probabilityForecast && probabilityForecast.next90Days >= 0.35) {
    const pct = Math.round(probabilityForecast.next90Days * 100);
    const top3 = probabilityForecast.multipliers
      .slice()
      .sort((a, b) => b.factor - a.factor)
      .slice(0, 3);
    const driverSummary = top3.length
      ? top3.map((m) => `${m.reason} (×${m.factor.toFixed(2)})`).join("; ")
      : "compounded sector + company-specific stress signals";
    plans.push({
      id: "forecast-90d",
      title: `Modeled ${pct}% Probability of Layoff Round at ${company} in Next 90 Days`,
      description: `${probabilityForecast.verdict} Top drivers: ${driverSummary}. Treat this as a decision threshold — ${pct >= 60 ? "actively interview, do not just \"warm the network\"" : "begin two external conversations this week and refresh your resume"}. ${regionCtx.severanceNote}.`,
      priority: pct >= 60 ? "Critical" : "High",
      layerFocus: "Probability Forecast",
      riskReductionPct: 0,
      deadline: pct >= 60 ? "7 days" : "14 days",
      evidence: [
        { signal: `Modeled probability ${pct}% (next 90d)`, source: "computed: sector base × multiplier chain", confidence: "medium" },
        ...top3.map((m) => ({
          signal: m.reason,
          source: m.name === "recent-cut" || m.name === "chronic-restructuring" || m.name === "second-wave"
            ? `companyData.layoffsLast24Months`
            : m.name.includes("financial")
              ? `derived: L1 score ${Math.round(breakdown.L1 * 100)}/100`
              : m.name.includes("sector")
                ? `industryData.growthOutlook`
                : `companyData.stock90DayChange`,
          confidence: "medium" as const,
        })),
      ],
    });
  }

  // Timing-driven critical: re-cut window awareness — distinct from the
  // 90-day probability above because it surfaces calendar position even
  // when the probability-multiplier chain is moderate.
  if (timing && (timing.windowStatus === "in-window" || timing.windowStatus === "approaching-window")) {
    plans.push({
      id: "recut-timing",
      title: timing.windowStatus === "in-window"
        ? `You Are Inside ${company}'s Typical Re-cut Window Right Now`
        : `${company}'s Typical Re-cut Window Opens in ${timing.daysUntilWindow ?? "?"} Days`,
      description: `${timing.verdict} The actionable inference: schedule recruiter conversations now (recruiter pipelines take 3–6 weeks; second-wave announcements give 1–2 weeks of warning at most).`,
      priority: timing.windowStatus === "in-window" ? "Critical" : "High",
      layerFocus: "Timing",
      riskReductionPct: 0,
      deadline: timing.windowStatus === "in-window" ? "3 days" : "10 days",
      evidence: [
        { signal: `${timing.daysSinceLastCut} days since last documented cut`, source: "companyData.layoffsLast24Months[0].date", confidence: "high" },
        { signal: `Typical re-cut window: ${RECUT_WINDOW_START_MONTHS}–${RECUT_WINDOW_END_MONTHS} months after prior round`, source: "empirical pattern (computed)", confidence: "medium" },
      ],
    });
  }

  // CRITICAL: Dual-signal high risk — company health AND layoff history both elevated.
  if (breakdown.L1 > 0.7 && breakdown.L2 > 0.6) {
    const evidence = [stockPhrase, revenuePhrase, lastLayoffPhrase].filter(Boolean).join("; ");
    plans.push({
      id: "critical-dual",
      title: `Dual Crisis Signal: ${company} Is Under Severe Pressure`,
      description: `Both company health (${L1pct}/100) and layoff history (${L2pct}/100) are critically elevated — evidence: ${evidence || "multi-quarter financial weakness"}. ${sectorLayoffRate ?? `The ${industry} sector overall has been cutting`}, so internal moves inside ${company} are unlikely to insulate you. Begin external search this week using ${regionCtx.networkChannel}; ${regionCtx.severanceNote}.`,
      priority: "Critical",
      layerFocus: "Company Health + Layoff History",
      riskReductionPct: 0,
      deadline: "7 days",
      evidence: [
        stockPhrase ? { signal: stockPhrase, source: "companyData.stock90DayChange", confidence: "high" as const } : null,
        revenuePhrase ? { signal: revenuePhrase, source: "companyData.revenueGrowthYoY", confidence: "high" as const } : null,
        lastLayoffPhrase ? { signal: lastLayoffPhrase, source: "companyData.layoffsLast24Months[0]", confidence: "high" as const } : null,
        { signal: `L1 ${L1pct}/100 + L2 ${L2pct}/100`, source: "computed: layoffScoreEngine.calculateLayoffScore", confidence: "high" as const },
      ].filter(Boolean) as Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>,
    });
  }

  if (breakdown.L1 > 0.6 && breakdown.L2 <= 0.6) {
    const evidence = [stockPhrase, revenuePhrase].filter(Boolean).join(" and ") || "multi-signal financial stress";
    plans.push({
      id: "l1-high",
      title: `${company}'s Finances Are Weakening (${evidence})`,
      description: `Health score ${L1pct}/100 — driven primarily by ${evidence}. The ${industry} sector outlook is ${growthOutlook}, which ${growthOutlook === "growing" ? "means recovery is plausible if you can wait 2–3 quarters" : growthOutlook === "declining" ? "compounds the company-specific risk: peers are cutting too" : "limits how much sector tailwind can rescue the P&L"}. Build a ${tenure.bracket === "probationary" ? "6-week" : "3-month"} runway, refresh your resume, and begin two ${regionCtx.networkChannel.split(" + ")[0]} conversations this week.`,
      priority: breakdown.L1 > 0.75 ? "Critical" : "High",
      layerFocus: "Company Health",
      riskReductionPct: 0,
      deadline: breakdown.L1 > 0.75 ? "7 days" : "14 days",
      evidence: [
        stockPhrase ? { signal: stockPhrase, source: "companyData.stock90DayChange", confidence: "high" as const } : null,
        revenuePhrase ? { signal: revenuePhrase, source: "companyData.revenueGrowthYoY", confidence: "high" as const } : null,
        { signal: `Sector outlook: ${growthOutlook}`, source: "industryData.growthOutlook", confidence: "medium" as const },
      ].filter(Boolean) as Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>,
    });
  }

  if (breakdown.L2 > 0.7) {
    plans.push({
      id: "l2-high",
      title: lastLayoffPhrase
        ? `${company} Already Cut Staff (${lastLayoffPhrase}) — Pattern Likely Continues`
        : `${company} Has a Repeat Layoff Pattern`,
      description: `Layoff-history score ${L2pct}/100. ${lastLayoffPhrase ? `The ${formatLayoffDate(lastLayoff!.date)} round affected roughly ${Math.round((companyData.employeeCount ?? 0) * lastLayoff!.percentCut / 100).toLocaleString()} people — second waves typically follow within 6–9 months.` : `${companyData.layoffRounds ?? 1} round(s) in 24 months indicates structural cost pressure.`} ${sectorLayoffRate ?? "Sector contagion is elevated"}, so prioritize cross-industry recruiter conversations: ${regionCtx.jobMarketHint}.`,
      priority: "High",
      layerFocus: "Layoff History",
      riskReductionPct: 0,
      deadline: "14 days",
      evidence: [
        lastLayoffPhrase ? { signal: lastLayoffPhrase, source: "companyData.layoffsLast24Months[0]", confidence: "high" as const } : null,
        { signal: `${companyData.layoffRounds ?? 1} round(s) tracked in 24mo`, source: "companyData.layoffRounds", confidence: "high" as const },
        sectorLayoffRate ? { signal: sectorLayoffRate, source: "industryData.avgLayoffRate2025", confidence: "medium" as const } : null,
      ].filter(Boolean) as Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>,
    });
  }

  if (breakdown.L3 > 0.5) {
    const tenureHook = tenure.bracket === "principal" || tenure.bracket === "senior"
      ? `As a ${tenure.bracket}-tier ${role}, your protected lane is the part of the work that requires accountability and authority — not raw output speed.`
      : tenure.bracket === "established"
        ? `At ${tenure.bracket} tenure your fastest defence is to own the AI-tool selection and rollout for ${dept} — being the person who decides which tool, not the person the tool replaces.`
        : `At ${tenure.bracket} tenure you should treat the AI tools as a force-multiplier on your output, not a threat — being measurably faster than peers buys you the next promotion cycle.`;
    plans.push({
      id: "l3-high",
      title: `${role} Tasks Are Being Absorbed by ${tooling.tools.split(",")[0]}`,
      description: `Role-exposure score ${L3pct}/100. In ${company}'s ${aiSignal}-AI-investment environment, ${tooling.tools} are already absorbing ${tooling.tasks}. ${tenureHook} Add one demonstrable AI-collaboration project to your profile within 30 days.`,
      priority: "Medium",
      layerFocus: "Role Exposure",
      riskReductionPct: 8,
      deadline: "30 days",
      evidence: [
        { signal: `Role exposure ${L3pct}/100 for ${role}`, source: "computed: roleExposureData + companyRoleRisk", confidence: "high" },
        { signal: `${aiSignal} AI-investment signal at ${company}`, source: "companyData.aiInvestmentSignal", confidence: "medium" },
        { signal: `Tooling map: ${tooling.tools}`, source: "ROLE_AI_TOOLS keyword map", confidence: "medium" },
      ],
    });
  }

  if (breakdown.L4 > 0.5) {
    const tenureBridgeNote = tenure.bracket === "probationary" || tenure.bracket === "early"
      ? "At your tenure the bridge is straightforward — you have not yet been pigeonholed into one sector's identity."
      : tenure.bracket === "established"
        ? "At your tenure, lead with portable outcomes (revenue impact, system reliability, team-building) rather than sector-specific keywords."
        : `At ${tenure.bracket} tenure, position the move as a deliberate vertical rotation — your authority transfers, the domain learning is the trade-off.`;
    plans.push({
      id: "l4-high",
      title: `${industry} Sector Is ${growthOutlook === "declining" ? "Contracting" : growthOutlook === "volatile" ? "Volatile" : "Soft"} — Plan a Cross-Sector Bridge`,
      description: `Sector pressure (${L4pct(breakdown)}/100) reflects ${industry}'s ${growthOutlook} outlook${sectorLayoffRate ? ` and the fact that ${sectorLayoffRate}` : ""}. Map the 2–3 adjacent sectors where your skills transfer (e.g. ${suggestAdjacentSectors(industry).join(", ")}) and reach out to one hiring manager per week. ${tenureBridgeNote} ${regionCtx.jobMarketHint}.`,
      priority: "Medium",
      layerFocus: "Market Conditions",
      riskReductionPct: 3,
      deadline: "60 days",
      evidence: [
        { signal: `${industry} outlook: ${growthOutlook}`, source: "industryData.growthOutlook", confidence: "medium" },
        sectorLayoffRate ? { signal: sectorLayoffRate, source: "industryData.avgLayoffRate2025", confidence: "medium" as const } : null,
        { signal: `Region: ${region}`, source: "companyData.region", confidence: "high" as const },
      ].filter(Boolean) as Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>,
    });
  }

  if (breakdown.L5 > 0.6) {
    const performanceNote = performance === "top"
      ? "your top-performer rating is the strongest internal protection — make sure your skip-level knows it (calibration meetings only see what is documented)"
      : performance === "below"
        ? "your current performance signal is below bar — close that gap before any cost-cutting cycle, ideally with a written improvement plan you co-author"
        : "average performance is the most exposed band in cost-cuts — the question becomes 'what is unique about this person?', so over-index on visible cross-functional wins this quarter";
    plans.push({
      id: "l5-high",
      title: promoted
        ? `Reinforce Your Recent Promotion in ${dept}`
        : `${tenure.bracket === "principal" ? "Principal-Level" : tenure.bracket === "senior" ? "Senior" : "Mid-Level"} Position in ${dept} Needs Active Defence`,
      description: `Personal-exposure score ${L5pct}/100. ${tenure.protection} — and ${performanceNote}. Specifically: book 1:1s with two stakeholders outside ${dept} this month, write down your last three quantifiable wins, and request your manager's view of your role's strategic priority for FY26.`,
      priority: "Medium",
      layerFocus: "Employee Factors",
      riskReductionPct: 10,
      deadline: "30 days",
      evidence: [
        { signal: `Tenure: ${userFactors?.tenureYears ?? "?"}yr (${tenure.bracket})`, source: "userFactors.tenureYears", confidence: "high" },
        { signal: `Performance tier: ${performance}`, source: "userFactors.performanceTier", confidence: "high" },
        promoted ? { signal: "Recent promotion on record", source: "userFactors.hasRecentPromotion", confidence: "high" as const } : null,
      ].filter(Boolean) as Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>,
    });
  }

  // D6 — Autonomous-agent coverage of role tasks
  if ((breakdown.D6 ?? 0) > 0.65) {
    plans.push({
      id: "d6-high",
      title: `Autonomous Agents Now Handle ~${D6pct}% of ${role} Workflows`,
      description: `Agent-capability score ${D6pct}/100 reflects how much of ${role} can already run end-to-end without human handoff. For ${dept}, the practical exposure is ${tooling.tasks}. Move toward judgement-heavy work agents cannot own: cross-team prioritization, customer-facing decisions, and any task whose failure cost cannot be absorbed by a retry. ${tenure.searchTactic}.`,
      priority: (breakdown.D6 ?? 0) > 0.8 ? "Critical" : "High",
      layerFocus: "AI Agent Capability",
      riskReductionPct: 12,
      deadline: "45 days",
      evidence: [
        { signal: `Agent-capability score ${D6pct}/100`, source: "computed: D6 dimension (calculateAgentCapabilityScore)", confidence: "high" },
        { signal: `Role tooling map: ${tooling.tasks}`, source: "ROLE_AI_TOOLS", confidence: "medium" },
      ],
    });
  }

  // D7 — Unified company-health distress
  if ((breakdown.D7 ?? 0) > 0.6) {
    const composite = [revenuePhrase, stockPhrase, aiSignal === "high" || aiSignal === "very-high" ? `aggressive AI capex (${aiSignal})` : null].filter(Boolean).join("; ");
    plans.push({
      id: "d7-high",
      title: `${company} Composite Health Risk: ${D7pct}/100`,
      description: `Aggregated signals — ${composite || "financial stress, sector position, and AI adoption pace"} — combine to a distress score of ${D7pct}/100. This is independent of role-level AI risk: even an irreplaceable individual gets cut when the employer balance sheet forces it. ${regionCtx.severanceNote}; build a ${tenure.bracket === "probationary" ? "6-week" : "3-month"} runway in parallel with your search.`,
      priority: (breakdown.D7 ?? 0) > 0.75 ? "Critical" : "High",
      layerFocus: "Company Health Risk",
      riskReductionPct: 0,
      deadline: "14 days",
      evidence: [
        { signal: `D7 composite ${D7pct}/100`, source: "computed: D7 dimension (calculateCompanyHealthRisk)", confidence: "high" },
        revenuePhrase ? { signal: revenuePhrase, source: "companyData.revenueGrowthYoY", confidence: "high" as const } : null,
        stockPhrase ? { signal: stockPhrase, source: "companyData.stock90DayChange", confidence: "high" as const } : null,
      ].filter(Boolean) as Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>,
    });
  }

  // Skill-bridge recommendation — only surfaces when the user's role has
  // seeded career intelligence. Cross-references the top safe skill (the
  // durable anchor) with the top career path (the pivot target) to produce
  // a concrete bridge rather than generic "find adjacent sectors" advice.
  // Positioned near the end so it reads as a follow-up to the diagnostic
  // recommendations above, not a lead.
  const intel = roleTitle ? getCareerIntelligence(roleTitle) : null;
  if (intel && (intel.skills.safe?.length ?? 0) > 0 && (intel.careerPaths?.length ?? 0) > 0) {
    const safeAnchor = intel.skills.safe[0];
    const topPivot = intel.careerPaths![0];
    const atRisk = intel.skills.at_risk?.[0] ?? intel.skills.obsolete?.[0];
    // Surface the bridge as "your safe skill X is the ticket to pivot Y" —
    // grounded in the intel record rather than a generic template.
    const bridgeNarrative = atRisk
      ? `Your durable skill "${safeAnchor.skill}" (${safeAnchor.whySafe}) is what transfers to a ${topPivot.role} seat — the ${topPivot.skillGap} gap can be closed in ${topPivot.timeToTransition}, and ${topPivot.salaryDelta} vs. today. The automatable piece of your current role ("${atRisk.skill}") is not an obstacle — the pivot target values ${safeAnchor.skill} and doesn't assume you still do ${atRisk.skill} manually.`
      : `Your durable skill "${safeAnchor.skill}" transfers directly to a ${topPivot.role} seat — the ${topPivot.skillGap} gap can be closed in ${topPivot.timeToTransition}, salary delta ${topPivot.salaryDelta}.`;
    plans.push({
      id: "skill-bridge",
      title: `Bridge From ${role} To ${topPivot.role} Using Your ${safeAnchor.skill}`,
      description: `${bridgeNarrative} Start by: (1) re-titling this skill on your resume using ${topPivot.role} keywords, (2) completing one public artefact that demonstrates ${safeAnchor.skill} in the ${topPivot.industryMapping[0] ?? "target"} context, and (3) reaching out to 3 people currently in ${topPivot.role} for informational conversations in the next 30 days.`,
      priority: (probabilityForecast?.next90Days ?? 0) >= 0.35 ? "High" : "Medium",
      layerFocus: "Skill Bridge",
      riskReductionPct: Math.min(12, topPivot.riskReduction),
      deadline: "30 days",
      evidence: [
        { signal: `Safe anchor: ${safeAnchor.skill} (${safeAnchor.longTermValue}/100 durability)`, source: `career intelligence for ${intel.displayRole}`, confidence: "medium" },
        { signal: `Pivot target: ${topPivot.role} (${topPivot.transitionDifficulty} difficulty, ${topPivot.timeToTransition})`, source: `career intelligence careerPaths[0]`, confidence: "medium" },
        atRisk ? { signal: `Displaces: ${atRisk.skill}`, source: `career intelligence skills.at_risk[0]`, confidence: "medium" as const } : null,
      ].filter(Boolean) as Array<{ signal: string; source: string; confidence: "high" | "medium" | "low" }>,
    });
  }

  if (plans.length === 0) {
    plans.push({
      id: "all-good",
      title: `${tenure.bracket === "principal" || tenure.bracket === "senior" ? "Sustain" : "Build"} Your Edge at ${company}`,
      description: `All seven risk dimensions are currently low for a ${tenure.bracket} ${role} at a ${growthOutlook}-outlook ${industry} firm. ${promoted ? "Use the post-promotion window to expand scope before the next review cycle." : performance === "top" ? "Convert your top-performer status into a stretch project that locks in visibility for FY26." : "Set a quarterly skills review and warm two external relationships per month — cheap insurance while conditions are mild."}`,
      priority: "Low",
      layerFocus: "General",
      riskReductionPct: 2,
      deadline: "90 days",
      evidence: probabilityForecast
        ? [{ signal: `${Math.round(probabilityForecast.next90Days * 100)}% modeled 90-day probability — at/below sector base rate`, source: "computed: probability forecast", confidence: "medium" }]
        : [],
    });
  }

  return plans;
};

// L4 percentage helper — breakdown does not always expose L4 in the
// destructure block above; keep the calculation co-located.
function L4pct(breakdown: ScoreBreakdown): number {
  return Math.round((breakdown.L4 ?? 0) * 100);
}

// Adjacent-sector suggestions per industry. Kept short (2–3 entries) so the
// prose stays readable; fallback covers anything not enumerated.
const ADJACENT_SECTORS: Record<string, string[]> = {
  Technology: ["Cybersecurity", "Biotech tooling", "Climate-tech infra"],
  "E-commerce": ["Logistics tech", "Fintech payments", "B2B SaaS"],
  Gaming: ["EdTech simulation", "AR/VR enterprise", "Adjacent media"],
  Cybersecurity: ["Critical-infra OT security", "Identity & compliance", "GovTech"],
  "Financial Services": ["RegTech", "Climate-finance", "Embedded fintech"],
  Insurance: ["Healthtech claims", "Climate-risk modelling", "InsurTech infra"],
  Consulting: ["Private-equity advisory", "Specialist boutiques", "In-house strategy at portfolio companies"],
  "Real Estate": ["PropTech SaaS", "Construction tech", "Logistics real assets"],
  Healthcare: ["Health-AI tooling", "Public-health data", "Pharma adjacencies"],
  "Biotech/Pharma": ["Diagnostics", "Med-device", "Health-data SaaS"],
  Manufacturing: ["Industrial AI", "Climate-tech hardware", "Supply-chain SaaS"],
  Energy: ["Climate-tech storage", "Grid SaaS", "Critical minerals"],
  Construction: ["PropTech", "Climate-resilient infra", "Modular housing"],
  Agriculture: ["AgTech sensors", "Food-supply SaaS", "Climate adaptation"],
  "Media & Publishing": ["Creator-economy tooling", "B2B content", "EdTech publishing"],
  Telecom: ["Network-AI ops", "5G enterprise", "Adjacent infra"],
  Education: ["Workforce-development SaaS", "Corporate L&D", "EdTech tooling"],
  Government: ["GovTech vendors", "Defence-tech", "Civic-tech nonprofits"],
  Hospitality: ["Travel-tech SaaS", "Property-tech", "Adjacent consumer experience"],
  Retail: ["E-commerce ops", "Supply-chain tech", "Consumer-fintech"],
  Legal: ["LegalTech vendors", "Compliance SaaS", "In-house counsel at tech firms"],
  Transportation: ["Logistics SaaS", "Mobility-tech", "Climate-aware fleet"],
  "Startups (pre-seed)": ["Established Series-B+ peers in the same vertical", "Adjacent fast-growth verticals", "Big-tech rotation programs"],
  "Startups (seed)": ["Series-B+ in the same vertical", "Strategic acquirers", "PE-backed roll-ups"],
  "Startups (Series A)": ["Series-C/D peers", "Strategic acquirers", "Vertical-leader incumbents"],
  "Startups (Series B+)": ["Adjacent vertical leaders", "Public peers", "Global expansion roles in the same vertical"],
  Nonprofit: ["Mission-aligned for-profits (B-corps)", "Foundation operations", "Government partnerships"],
};

function suggestAdjacentSectors(industry: string): string[] {
  return ADJACENT_SECTORS[industry] ?? ["adjacent verticals where your domain knowledge transfers", "consulting / advisory in the same domain", "in-house roles at customers of your current sector"];
}

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

  // L3: blend global role exposure (70%) with company-specific risk from Supabase (30%)
  const globalL3 = calculateRoleExposureScore(roleTitle, department, inputs.roleExposureOverride);
  const companyRoleRisk = getCompanyRoleRisk(companyData, roleTitle);
  const L3 = companyRoleRisk !== null
    ? globalL3 * 0.70 + companyRoleRisk * 0.30
    : globalL3;
  const L4 = calculateMarketConditionsScore(companyData.industry, industryData);
  const L5 = calculateEmployeeFactorsScore(userFactors);

  // Resolve raw role exposure for D2/D3/D6 sub-calculations
  const rawRoleExposure: RoleExposure =
    inputs.roleExposureOverride ??
    roleExposureData[roleTitle] ??
    inferRoleRisk(roleTitle);

  // ── 9-Term blended formula (sum = 100%) ───────────────────────────────────
  // The 7-dimension AI-displacement model under-weighted company-specific and
  // PPP-sensitive signals: L1 only flowed via D7 (effective weight 7%×30% =
  // 2.1%), so a $0.0525 swing in L1 from PPP adjustment vanished into rounding
  // — the geographic regression test caught this as identical US/IN scores.
  // Tier-boundary tests showed the symmetric problem at the personal end:
  // exceptionally protected employees couldn't pull final scores into the
  // "Very low risk" band because L5 max-protection only contributed ~0.7
  // points at 14% weight.
  //
  // Rebalance: keep D1/D2/D3/D6 as the AI-displacement core (now 52% combined
  // vs 69% before), reintroduce L1+L2 as direct terms so company financial
  // health and PPP differential land in the score, and bump L5 from 14%→18%
  // so personal protection (top performance + long tenure + key relationships)
  // moves the needle the way users expect.
  //
  // D1 (18%) Task Automatability     = L3 (role exposure blending aiRisk + layoffRisk)
  // D2 (14%) AI Tool Maturity        = company AI signal × domain maturity
  // D3 (14%) Augmentation Potential  = (1-D3) applied → low augmentation = high risk
  // D4 (18%) Experience Protection   = L5 (employee factors, seniority-based)
  // D5 (03%) Country/Market Context  = L4 (market conditions — already partially in D7)
  // D6 (06%) AI Agent Capability     = autonomous agent coverage for this role
  // D7 (07%) Company Health Risk     = unified L1+L2+AI adoption signal
  // L1 (16%) Direct company health   = PPP-aware financial signal
  // L2 (04%) Direct layoff history   = recent regulatory/news layoff events
  //
  // L4 is intentionally weighted lighter than the dimension-spec default (07%)
  // because Tech-industry baseline lands near 0.80 — applying the higher
  // weight pushed Google-SWE-with-all-protections into Moderate-risk
  // territory and stuck PPP-protected India tech firms above the Low-risk
  // boundary. The shifted weight goes to L1, where company-specific +
  // PPP-adjusted signals belong.
  const D6 = calculateAIAgentCapability(roleTitle, rawRoleExposure.aiRisk);
  const D7 = calculateD7CompanyHealthRisk(L1, L2, L4, companyData);
  const D2 = calculateAIToolMaturity(companyData, rawRoleExposure.aiRisk, rawRoleExposure.demandTrend);
  const D3risk = calculateAugmentationRisk(rawRoleExposure.aiRisk, rawRoleExposure.demandTrend);

  const rawScore =
    L3      * 0.18 +  // D1 — task automatability
    D2      * 0.14 +  // D2 — AI tool maturity
    D3risk  * 0.14 +  // D3 risk — low augmentation potential
    L5      * 0.18 +  // D4 — experience protection
    L4      * 0.03 +  // D5 — country/market context (light: also in D7)
    D6      * 0.06 +  // D6 — AI agent capability
    D7      * 0.07 +  // D7 — unified company health risk
    L1      * 0.16 +  // direct company health (PPP-sensitive)
    L2      * 0.04;   // direct layoff history

  const finalScore = Math.round(clamp(rawScore) * 100);

  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 7);

  const breakdown = { L1, L2, L3, L4, L5, D6, D7 };
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
  const signalQuality = analyzeSignalQuality(companyData, L1, L2, L3, L4, L5, D6, D7);

  // Calendar-aware probability + timing — built once and shared between the
  // top-level result fields and the recommendation prose so the numbers in
  // both places agree exactly (no separate computation paths to drift).
  const now = new Date();
  const probabilityForecast = computeLayoffProbabilityForecast(
    companyData,
    inputs.industryData,
    breakdown,
    now,
  );
  const timing = computeLayoffTiming(companyData, now);

  return {
    score: finalScore,
    confidenceInterval,
    confidencePercent,
    tier: getScoreTier(finalScore),
    breakdown,
    confidence,
    calculatedAt: now.toISOString(),
    nextUpdateDue: nextUpdate.toISOString(),
    disclaimer:
      "This is a risk estimation based on publicly available signals. It is not a prediction or guarantee of future employment outcomes.",
    dataFreshness,
    signalQuality,
    probabilityForecast,
    timing,
    recommendations: generateRecommendations(
      breakdown,
      companyData,
      inputs.roleTitle,
      inputs.department,
      inputs.userFactors,
      inputs.industryData,
      probabilityForecast,
      timing,
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
