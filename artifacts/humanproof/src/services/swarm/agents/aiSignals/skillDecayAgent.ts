// skillDecayAgent.ts
// AI Signal — Rate of skill obsolescence for this role (how fast does expertise expire?).
// HEURISTIC — combines industry velocity + role type + tenure.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Skill half-life in years by role type (shorter = faster decay)
const SKILL_HALFLIFE: Record<string, number> = {
  'software engineer':  3.5, 'developer':           3.5, 'programmer':          3.0,
  'data scientist':     3.0, 'ml engineer':         2.5, 'ai engineer':         2.0,
  'devops':             3.0, 'security':            3.5, 'cloud':               3.0,
  'blockchain':         2.0, 'web developer':       3.0, 'mobile':              3.5,
  'designer':           4.5, 'ux ':                 4.0, 'product manager':     5.0,
  'marketing':          4.0, 'content':             3.5, 'seo':                 2.5,
  'analyst':            4.5, 'data analyst':        4.0, 'financial analyst':   5.0,
  'accountant':         7.0, 'bookkeeper':          6.0, 'legal':               8.0,
  'paralegal':          6.0, 'hr ':                 6.0, 'recruiter':           4.5,
  'sales':              5.0, 'customer service':    5.0, 'teacher':             8.0,
  'nurse':              5.0, 'doctor':              6.0, 'therapist':           9.0,
  'manager':            7.0, 'executive':          10.0, 'researcher':          5.0,
  'default':            5.0,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const roleLower  = input.roleTitle.toLowerCase();
  const matchedKey = Object.keys(SKILL_HALFLIFE).find(k => roleLower.includes(k)) ?? 'default';
  const halfLife   = SKILL_HALFLIFE[matchedKey];

  // If tenure exceeds 2x the half-life, skills are likely stale
  const halfLivesElapsed = input.tenureYears / halfLife;
  let signal: number;
  if (halfLivesElapsed > 2.0) signal = 0.85;
  else if (halfLivesElapsed > 1.5) signal = 0.68;
  else if (halfLivesElapsed > 1.0) signal = 0.50;
  else if (halfLivesElapsed > 0.5) signal = 0.32;
  else signal = 0.15;

  // Fast-moving industries compound decay
  const fastIndustries = ['Technology', 'Software', 'Media', 'E-commerce'];
  if (fastIndustries.includes(input.industry)) signal = Math.min(0.95, signal * 1.18);

  return {
    agentId:    'skillDecayAgent',
    category:   'ai',
    signal,
    confidence: 0.68,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { matchedKey, skillHalfLifeYears: halfLife, halfLivesElapsed: halfLivesElapsed.toFixed(2) },
  };
};

export const skillDecayAgent: AgentFn = { id: 'skillDecayAgent', run };
