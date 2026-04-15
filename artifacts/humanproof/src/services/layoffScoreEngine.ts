// layoffScoreEngine.ts
// Core 5-layer scoring algorithm — v2.0 (all audit fixes applied)

import { CompanyData, getPPPMultiplier } from '../data/companyDatabase';
import { IndustryRisk } from '../data/industryRiskData';
import { calculateRoleExposureScore, RoleExposure } from '../data/roleExposureData';
import { layoffNewsCache } from '../data/layoffNewsCache';

// ─── Interfaces ───

export interface UserFactors {
  tenureYears: number;
  /** Total career years across ALL jobs — distinct from tenureYears at current company.
   *  Used for Oracle experience bracket (D4) and Displacement Trajectory modifiers.
   *  Falls back to tenureYears if not supplied. */
  careerYears?: number;
  isUniqueRole: boolean;
  performanceTier: 'top' | 'average' | 'below' | 'unknown';
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
  priority: 'High' | 'Medium' | 'Low';
  layerFocus: string;
}

export interface ScoreResult {
  score: number;
  tier: ScoreTier;
  breakdown: ScoreBreakdown;
  confidence: 'High' | 'Medium' | 'Low';
  calculatedAt: string;
  nextUpdateDue: string;
  disclaimer: string;
  recommendations: ActionPlanItem[];
}

// ─── Utility ───

const weightedAverage = (signals: Record<string, number>, weights: Record<string, number>): number => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0.5;
  return Object.entries(signals).reduce((sum, [key, val]) => {
    return sum + (val * ((weights[key] || 0) / totalWeight));
  }, 0);
};

const clamp = (val: number, min = 0, max = 1): number => Math.max(min, Math.min(max, val));

const monthsDifference = (dateStr: string, now: Date): number => {
  const d = new Date(dateStr);
  return Math.abs((now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
};

// ─── Layer 1: Company Health (30%) ───

const mapRevenueGrowth = (yoyPercent: number | null): number => {
  if (yoyPercent === null) return 0.5;
  if (yoyPercent < -20) return 0.95;
  if (yoyPercent < -10) return 0.85;
  if (yoyPercent < 0)   return 0.72;
  if (yoyPercent < 5)   return 0.55;
  if (yoyPercent < 10)  return 0.42;
  if (yoyPercent < 20)  return 0.30;
  if (yoyPercent < 30)  return 0.18;
  return 0.10;
};

const mapStockTrend = (change90Day: number | null): number => {
  if (change90Day === null) return 0.5;
  if (change90Day < -30) return 0.95;
  if (change90Day < -15) return 0.80;
  if (change90Day < -5)  return 0.60;
  if (change90Day < 5)   return 0.42;
  if (change90Day < 15)  return 0.28;
  if (change90Day < 30)  return 0.15;
  return 0.08;
};

const mapFundingStatus = (lastRound: string | undefined, monthsSince: number | undefined): number => {
  if (lastRound === 'bootstrapped') return 0.35;
  if (monthsSince === undefined) return 0.5;
  if (monthsSince < 6)  return 0.12;
  if (monthsSince < 12) return 0.28;
  if (monthsSince < 18) return 0.50;
  if (monthsSince < 24) return 0.72;
  return 0.88;
};

const mapCompanySize = (count: number): number => {
  if (count <= 50)   return 0.70;
  if (count <= 200)  return 0.58;
  if (count <= 1000) return 0.48;
  if (count <= 5000) return 0.40;
  if (count <= 50000) return 0.35;
  return 0.32;
};

// PPP-adjusted overstaffing: uses regional multiplier to normalize revenue/employee
const mapOverstaffing = (revenuePerEmp: number, region: string = 'US'): number => {
  const ppp = getPPPMultiplier(region as any);
  const adjusted = revenuePerEmp / ppp; // normalize to US-equivalent
  
  // BUG-DA3 FIX: Slightly more aggressive thresholds for overstaffing risk
  // based on 2024-2025 tech efficiency benchmarks.
  if (adjusted < 95000)  return 0.85; // High Risk: Under $95k/emp (adjusted)
  if (adjusted < 180000) return 0.65; // Elevated
  if (adjusted < 350000) return 0.45; // Moderate
  if (adjusted < 700000) return 0.25; // Low
  return 0.10; // Very Low: Over $700k/emp
};

export const calculateCompanyHealthScore = (companyData: CompanyData): number => {
  const signals = {
    revenueGrowthRisk: mapRevenueGrowth(companyData.revenueGrowthYoY),
    stockTrendRisk: companyData.isPublic
      ? mapStockTrend(companyData.stock90DayChange)
      : 0.40,
    fundingRisk: companyData.isPublic
      ? 0.30
      : mapFundingStatus(companyData.lastFundingRound, companyData.monthsSinceLastFunding),
    sizeRisk: mapCompanySize(companyData.employeeCount),
    overstaffingRisk: mapOverstaffing(companyData.revenuePerEmployee, companyData.region),
  };

  return weightedAverage(signals, {
    revenueGrowthRisk: 0.35,
    stockTrendRisk: 0.25,
    fundingRisk: 0.15,
    sizeRisk: 0.10,
    overstaffingRisk: 0.15,
  });
};

// ─── Layer 2: Layoff History (25%) ───

const calculateRecentLayoffRisk = (layoffs: { date: string; percentCut: number }[]): number => {
  if (!layoffs || layoffs.length === 0) return 0.05;
  // Sort by date descending to get most recent first
  const sorted = [...layoffs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const mostRecent = sorted[0];
  const monthsAgo = monthsDifference(mostRecent.date, new Date());

  if (monthsAgo < 3)  return 0.95;
  if (monthsAgo < 6)  return 0.80;
  if (monthsAgo < 12) return 0.62;
  if (monthsAgo < 18) return 0.42;
  if (monthsAgo < 24) return 0.28;
  return 0.15;
};

// BUG-DA4 FIX: Round frequency now considers recency alongside count.
// Older layoff patterns are less predictive than recent ones.
const calculateRoundFrequency = (rounds: number, layoffs?: { date: string; percentCut: number }[]): number => {
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
    const avgMonthsAgo = layoffs.reduce((sum, l) => sum + monthsDifference(l.date, now), 0) / layoffs.length;
    if (avgMonthsAgo > 24) return base * 0.65;  // very old pattern — much less predictive
    if (avgMonthsAgo > 18) return base * 0.80;  // old pattern — somewhat discounted
    if (avgMonthsAgo > 12) return base * 0.90;  // moderately old
  }
  return base;
};

// Continuous sector contagion (replaces binary threshold)
const calculateSectorContagion = (industryData?: IndustryRisk): number => {
  if (!industryData) return 0.40;
  // Blend baseline risk with observed 2025 layoff rate
  const baseSignal = industryData.baselineRisk;
  const rateSignal = clamp(industryData.avgLayoffRate2025 * 5, 0, 1); // scale 0-20% → 0-1
  return (baseSignal * 0.6) + (rateSignal * 0.4);
};

export const calculateLayoffHistoryScore = (companyData: CompanyData, industryData?: IndustryRisk, department?: string): number => {
  const relevantNews = layoffNewsCache.find(n => n.companyName.toLowerCase() === companyData.name.toLowerCase());
  const hasDepartmentNews = relevantNews && department && relevantNews.affectedDepartments.includes(department);

  const signals = {
    recentLayoffRisk: calculateRecentLayoffRisk(companyData.layoffsLast24Months),
    // BUG-DA4 FIX: Pass actual layoff records for recency-weighted frequency scoring
    roundFrequencyRisk: calculateRoundFrequency(companyData.layoffRounds, companyData.layoffsLast24Months),
    severityRisk: companyData.lastLayoffPercent
      ? clamp(companyData.lastLayoffPercent / 25)
      : 0.15,
    sectorContagionRisk: calculateSectorContagion(industryData),
    newsRisk: hasDepartmentNews ? 0.95 : 0.10,
  };

  return weightedAverage(signals, {
    recentLayoffRisk: 0.30,
    roundFrequencyRisk: 0.25,
    severityRisk: 0.15,
    sectorContagionRisk: 0.20,
    newsRisk: 0.10,
  });
};

// ─── Layer 4: Market Conditions (12%) ───

export const calculateMarketConditionsScore = (industry: string, industryData?: IndustryRisk): number => {
  if (!industryData) return 0.50;

  const growthModifier: Record<string, number> = {
    'growing':   -0.12,
    'stable':     0.00,
    'volatile':   0.10,
    'declining':  0.18,
  };

  // Now uses aiAdoptionRate as a signal (previously dead data)
  const aiDisruptionFactor = industryData.aiAdoptionRate * 0.15; // 0-15% contribution

  const base = industryData.baselineRisk
    + (growthModifier[industryData.growthOutlook] || 0)
    + aiDisruptionFactor;

  return clamp(base);
};

// ─── Layer 5: Employee Factors (8%) ───

const mapTenure = (years: number): number => {
  if (years < 0.5) return 0.82;
  if (years < 1)   return 0.70;
  if (years < 2)   return 0.58;
  if (years < 4)   return 0.42;
  if (years < 7)   return 0.28;
  if (years < 12)  return 0.18;
  return 0.12;
};

export const calculateEmployeeFactorsScore = (userFactors: UserFactors): number => {
  const {
    tenureYears,
    isUniqueRole,
    performanceTier,
    hasRecentPromotion,
    hasKeyRelationships,
  } = userFactors;

  const tenureScore = mapTenure(tenureYears);
  const uniquenessScore = isUniqueRole ? 0.18 : 0.58;
  const perfMap: Record<string, number> = { top: 0.10, average: 0.48, below: 0.82, unknown: 0.42 };
  const performanceScore = perfMap[performanceTier] ?? 0.48;

  const base = weightedAverage({
    tenureScore,
    uniquenessScore,
    performanceScore,
  }, { tenureScore: 0.40, uniquenessScore: 0.32, performanceScore: 0.28 });

  // Bonuses applied additively then clamped
  const promotionBonus = hasRecentPromotion ? -0.12 : 0;
  const relationshipBonus = hasKeyRelationships ? -0.10 : 0;

  return clamp(base + promotionBonus + relationshipBonus, 0.05, 0.95);
};

// ─── Score Tier ───

const getScoreTier = (score: number): ScoreTier => {
  if (score >= 75) return { label: 'High risk',     color: 'red',    advice: 'Take action now — update your CV, activate your network, and explore open roles this week.' };
  if (score >= 55) return { label: 'Elevated risk', color: 'orange', advice: 'Stay alert — strengthen your position internally and build your external safety net.' };
  if (score >= 35) return { label: 'Moderate risk', color: 'amber',  advice: 'Monitor closely — you are not in immediate danger, but preparation is wise.' };
  if (score >= 15) return { label: 'Low risk',      color: 'green',  advice: 'Relatively stable — keep growing your skills and maintaining key relationships.' };
  return                   { label: 'Very low risk', color: 'teal',   advice: 'Strong position — focus on career growth rather than defence.' };
};

// ─── Confidence ───

const calculateConfidence = (companyData: CompanyData): 'High' | 'Medium' | 'Low' => {
  let score = 0;
  if (companyData.revenueGrowthYoY !== null) score += 1;
  if (companyData.isPublic && companyData.stock90DayChange !== null) score += 1;
  if (companyData.layoffsLast24Months && companyData.layoffsLast24Months.length > 0) score += 1;
  if (companyData.employeeCount > 0) score += 1;
  if (companyData.lastLayoffPercent !== null) score += 0.5;
  if (companyData.source !== 'User Input' && companyData.source !== 'Fallback') score += 0.5;

  if (score >= 4) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
};

// ─── Recommendations (Action Plan) ───

const generateRecommendations = (breakdown: ScoreBreakdown, companyData: CompanyData, roleTitle?: string, department?: string): ActionPlanItem[] => {
  const plans: ActionPlanItem[] = [];
  const company = companyData.name || 'your company';
  const role = roleTitle || 'your role';
  const dept = department || 'your department';
  const L1pct = Math.round(breakdown.L1 * 100);
  const L2pct = Math.round(breakdown.L2 * 100);
  const L3pct = Math.round(breakdown.L3 * 100);
  const L5pct = Math.round(breakdown.L5 * 100);

  if (breakdown.L1 > 0.6) {
    plans.push({
      id: 'l1-high',
      title: `${company}'s Finances Are Under Pressure`,
      description: `Financial signals for ${company} are weak (health score: ${L1pct}/100). Immediately secure a 3-month emergency fund and refresh your resume. Apply to 2–3 external roles this week as a safety measure.`,
      priority: 'High',
      layerFocus: 'Company Health'
    });
  }

  if (breakdown.L2 > 0.7) {
    plans.push({
      id: 'l2-high',
      title: `${company} Has a Pattern of Layoffs`,
      description: `${company}'s layoff history is elevated (score: ${L2pct}/100). Sector contagion is also high. Connect with recruiters outside your current industry — diversifying your network protects you if another wave hits.`,
      priority: 'High',
      layerFocus: 'Layoff History'
    });
  }

  if (breakdown.L3 > 0.5) {
    plans.push({
      id: 'l3-high',
      title: `The ${role} Role Has High Automation Exposure`,
      description: `Your role has significant AI exposure (score: ${L3pct}/100). Focus on AI augmentation skills specific to ${role} tasks — tools like Copilot, Claude, or domain-specific AI platforms. Shift toward revenue-generating or client-facing responsibilities.`,
      priority: 'Medium',
      layerFocus: 'Role Exposure'
    });
  }

  if (breakdown.L4 > 0.5) {
    plans.push({
      id: 'l4-high',
      title: 'Market Headwinds in Your Industry',
      description: `${company}'s industry is facing difficult macro conditions. Monitor competitor moves and explore adjacent sectors where your skills transfer well. Consider part-time consulting on the side to reduce income dependence.`,
      priority: 'Medium',
      layerFocus: 'Market Conditions'
    });
  }

  if (breakdown.L5 > 0.6) {
    plans.push({
      id: 'l5-high',
      title: 'Your Internal Position Needs Strengthening',
      description: `Your personal exposure in ${dept} is elevated (score: ${L5pct}/100). Book 1:1s with your manager and key stakeholders this month. Document your wins in writing and request a performance review. Request clarity on your role's strategic importance.`,
      priority: 'Medium',
      layerFocus: 'Employee Factors'
    });
  }

  if (plans.length === 0) {
    plans.push({
      id: 'all-good',
      title: 'Keep Your Edge Sharp',
      description: `Your risk across all 5 dimensions at ${company} is currently low. Stay ahead by setting a quarterly skills review and keeping your network warm so you hold the advantage if conditions shift.`,
      priority: 'Low',
      layerFocus: 'General'
    });
  }

  return plans;
};

// ─── Scenario Simulation (What-If) ───

export interface ScenarioOverrides {
  department?: string;
  performanceTier?: UserFactors['performanceTier'];
  hasRecentPromotion?: boolean;
  tenureYears?: number;
}

export const simulateScenario = (
  baseInputs: ScoreInputs,
  overrides: ScenarioOverrides
): ScoreResult => {
  const modifiedInputs: ScoreInputs = {
    ...baseInputs,
    department: overrides.department || baseInputs.department,
    userFactors: {
      ...baseInputs.userFactors,
      ...(overrides.performanceTier !== undefined && { performanceTier: overrides.performanceTier }),
      ...(overrides.hasRecentPromotion !== undefined && { hasRecentPromotion: overrides.hasRecentPromotion }),
      ...(overrides.tenureYears !== undefined && { tenureYears: overrides.tenureYears }),
    },
  };
  return calculateLayoffScore(modifiedInputs);
};

// ─── Main Calculator ───

export const calculateLayoffScore = (inputs: ScoreInputs): ScoreResult => {
  const {
    companyData,
    industryData,
    roleTitle,
    department,
    userFactors,
  } = inputs;

  const L1 = calculateCompanyHealthScore(companyData);
  const L2 = calculateLayoffHistoryScore(companyData, industryData, department);
  const L3 = calculateRoleExposureScore(roleTitle, department, inputs.roleExposureOverride);
  const L4 = calculateMarketConditionsScore(companyData.industry, industryData);
  const L5 = calculateEmployeeFactorsScore(userFactors);

  // BUG-B8 FIX: Layer weights corrected — L4 was erroneously 5% (documented as 12%).
  // Correct weights: L1=30%, L2=25%, L3=20%, L4=12%, L5=13% — sum = 100%
  const rawScore = (L1 * 0.30) + (L2 * 0.25) + (L3 * 0.20) + (L4 * 0.12) + (L5 * 0.13);
  const finalScore = Math.round(clamp(rawScore) * 100);

  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 7);

  const breakdown = { L1, L2, L3, L4, L5 };

  return {
    score: finalScore,
    tier: getScoreTier(finalScore),
    breakdown,
    confidence: calculateConfidence(companyData),
    calculatedAt: new Date().toISOString(),
    nextUpdateDue: nextUpdate.toISOString(),
    disclaimer: 'This is a risk estimation based on publicly available signals. It is not a prediction or guarantee of future employment outcomes.',
    recommendations: generateRecommendations(breakdown, companyData, inputs.roleTitle, inputs.department),
  };
};

