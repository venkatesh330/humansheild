// ═══════════════════════════════════════════════════════════════════════════
// types.ts — Career Intelligence Type Definitions
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
  difficulty: 'Low' | 'Medium' | 'High' | string;
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

export interface CareerIntelligence {
  displayRole: string;
  summary: string;
  skills: {
    obsolete?: SkillRisk[];
    at_risk?: SkillRisk[];
    safe: SafeSkill[];
  };
  careerPaths: CareerPath[];
  roadmap: {
    '0-2'?: ExperienceRoadmap;
    '2-5'?: ExperienceRoadmap;
    '5-10'?: ExperienceRoadmap;
    '10-20'?: ExperienceRoadmap;
    '20+'?: ExperienceRoadmap;
  };
  inactionScenario: string;
  riskTrend: TrendPoint[];
  confidenceScore: number;
}
