// aiToolMaturityAgent.ts
// AI Signal — AI tooling maturity in role's domain (how ready is AI to do this job).
// HEURISTIC — maturity scores by role + industry combination.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// AI tool maturity score by role category (0=immature, 1=fully mature AI tooling available)
const ROLE_AI_MATURITY: Record<string, number> = {
  'content':       0.90, 'copywriter':  0.88, 'writer':      0.85,
  'translator':    0.95, 'customer':    0.80, 'support':     0.82,
  'analyst':       0.72, 'data':        0.70, 'research':    0.65,
  'financial':     0.68, 'accountant':  0.75, 'bookkeeper':  0.85,
  'recruiter':     0.70, 'hr':          0.65, 'marketing':   0.72,
  'developer':     0.55, 'engineer':    0.52, 'programmer':  0.58,
  'designer':      0.62, 'ux':          0.58, 'product':     0.42,
  'manager':       0.38, 'executive':   0.28, 'director':    0.32,
  'scientist':     0.48, 'ml':          0.40, 'ai':          0.35,
  'legal':         0.55, 'paralegal':   0.72, 'compliance':  0.60,
  'nurse':         0.28, 'doctor':      0.20, 'therapist':   0.15,
  'teacher':       0.45, 'instructor':  0.42,
  'default':       0.50,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const roleLower   = input.roleTitle.toLowerCase();
  const matchedKey  = Object.keys(ROLE_AI_MATURITY).find(k => roleLower.includes(k)) ?? 'default';
  const maturity    = ROLE_AI_MATURITY[matchedKey];

  // Industry accelerates tool maturity adoption
  const techy = ['Technology', 'Software', 'Finance', 'Media', 'E-commerce'];
  const industryMultiplier = techy.includes(input.industry) ? 1.15 : 0.90;
  const signal = Math.min(0.95, maturity * industryMultiplier);

  return {
    agentId:    'aiToolMaturityAgent',
    category:   'ai',
    signal,
    confidence: matchedKey !== 'default' ? 0.75 : 0.45,
    sourceType: 'heuristic',
    ageInDays:  30,
    metadata:   { matchedKey, rawMaturity: maturity, industryMultiplier },
  };
};

export const aiToolMaturityAgent: AgentFn = { id: 'aiToolMaturityAgent', run };
