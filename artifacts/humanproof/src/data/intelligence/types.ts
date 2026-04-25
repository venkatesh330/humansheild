// ═══════════════════════════════════════════════════════════════════════════
// types.ts — Career Intelligence Type Definitions v2.0
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillRisk {
  skill: string;
  riskScore: number;        // 0–100
  riskType: 'Automatable' | 'Augmented' | 'Safe' | string;
  horizon: '1-3yr' | '3-5yr' | '5yr+' | string;
  reason: string;
  aiReplacement: 'Full' | 'Partial' | 'None' | string;
  aiTool?: string;
}

export interface SafeSkill {
  skill: string;
  whySafe: string;
  longTermValue: number;    // 0–100
  difficulty: 'Low' | 'Medium' | 'High' | 'Very High' | 'Extremely High' | string;
  resource?: string;
}

export interface CareerPath {
  role: string;
  riskReduction: number;    // percentage points
  skillGap: string;
  transitionDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | string;
  industryMapping: string[];
  salaryDelta: string;
  timeToTransition: string;
  /** v4.0: Months from starting the transition to receiving first paycheck in the new role.
   *  Derived from career twin network data + labor market research.
   *  Lateral (same function): 2–4. Function pivot: 4–8. Cross-domain: 8–14. */
  months_to_first_income?: number;
  /** v4.0: Months of reduced (or zero) income during the transition window.
   *  0 = no income gap (internal move). 1–3 = short gap. 4–8 = significant gap. */
  income_dip_months?: number;
}

export interface RoadmapAction {
  action: string;
  why: string;
  outcome: string;
  tool?: string;
}

export interface RoadmapPhase {
  timeline: string;
  focus: string;
  actions: RoadmapAction[];
}

export interface ExperienceRoadmap {
  phase_1: RoadmapPhase;
  phase_2?: RoadmapPhase;
  phase_3?: RoadmapPhase;
}

export interface TrendPoint {
  year: number;
  riskScore: number;
  label: string;
}

/**
 * SeniorityProfile — multi-level risk differentiation per seniority band
 * Enables the system to show different risk/salary/pivot advice for juniors vs seniors
 */
export interface SeniorityProfile {
  level: 'entry' | 'mid' | 'senior' | 'principal' | 'executive';
  typicalYearsExp: string;       // e.g. '0-2', '5-10', '20+'
  riskDelta: number;             // offset from base total score (negative = more protected)
  keySkills: string[];           // skills that matter most at this level
  salaryBand: string;            // e.g. '$40k-$80k'
  primaryRisk: string;           // 1-line risk summary for this level
}

/**
 * CountryCluster — which regional cluster a country belongs to
 * Used by countryIntelligenceModifier.ts to apply localized intelligence overlays
 */
export type CountryCluster = 'south_asia' | 'north_america' | 'europe' | 'gcc' | 'sea' | 'latam' | 'africa' | 'east_asia' | 'oceania';

/**
 * CareerIntelligence — the core data record for every seeded role
 * v2.0 adds: contextTags, seniority, countryModifiers, evolutionHorizon
 */
export interface CareerIntelligence {
  displayRole: string;
  summary: string;
  skills: {
    obsolete?: SkillRisk[];
    at_risk?: SkillRisk[];
    safe: SafeSkill[];
  };
  careerPaths: CareerPath[];
  roadmap?: {
    '0-2'?: ExperienceRoadmap;
    '2-5'?: ExperienceRoadmap;
    '5-10'?: ExperienceRoadmap;
    '10-20'?: ExperienceRoadmap;
    '20+'?: ExperienceRoadmap;
  };
  inactionScenario?: string;
  riskTrend?: TrendPoint[];
  confidenceScore?: number;
  /** v2.0 additions below */
  contextTags?: string[];          // e.g. ['high-risk', 'tech', 'creative', 'entry-sensitive']
  seniority?: SeniorityProfile[];  // multi-level risk by experience band
  countryModifiers?: Partial<Record<CountryCluster, { // sparse country-specific overrides
    summaryAppend?: string;
    inactionAppend?: string;
    safeSkillAppend?: SafeSkill[];
    careerPathOverride?: CareerPath[];
    salaryContext?: string;
    platformRecs?: string[];
  }>>;
  evolutionHorizon?: string;        // e.g. '2027' — when to re-assess this role's risk data
}
