// skillRisk.ts
// Unified types for the Decision Intelligence System

export interface RiskFactors {
  automation: number; // 0-100 (Feasibility of AI automation)
  judgment: number;   // 0-100 (Requirement for complex human judgment)
  physical: number;   // 0-100 (Degree of physical/embodied work)
  creativity: number; // 0-100 (Human creative/originality requirement)
}

export interface SubSkill {
  name: string;
  riskScore: number;
}

export interface SkillInsight {
  threat?: string;
  pivot?: string;
  why_protected?: string;
  action?: string;
  aiTools?: string[];
  source?: string;
  factors?: RiskFactors;
  subSkills?: SubSkill[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  riskScore: number;
  trend: 'rising' | 'stable' | 'declining';
  factors?: RiskFactors;
  subSkills?: SubSkill[];
}

export interface WeightedSkill extends Skill {
  weight: 0.5 | 1 | 2;
  trendDelta?: number;
}
