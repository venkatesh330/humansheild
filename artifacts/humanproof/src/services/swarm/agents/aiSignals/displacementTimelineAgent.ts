// displacementTimelineAgent.ts
// AI Signal — Estimated AI displacement timeline (shorter = higher signal).
// HEURISTIC — maps automation potential to years remaining estimate.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const ROLE_TIMELINE_YEARS: Record<string, number> = {
  'data entry':       1.5, 'cashier':          1.0, 'telemarketer':     1.0,
  'bookkeeper':       2.0, 'translator':       2.0, 'customer service': 3.0,
  'support':          3.0, 'content writer':   3.0, 'copywriter':       2.5,
  'analyst':          4.0, 'financial':        4.0, 'accountant':       3.0,
  'recruiter':        4.0, 'marketing':        4.0, 'hr ':              4.5,
  'software':         7.0, 'developer':        7.0, 'engineer':         8.0,
  'data scientist':   8.0, 'ml':              10.0, 'ai engineer':     12.0,
  'designer':         5.0, 'ux ':              5.0, 'product':          7.0,
  'manager':          8.0, 'director':        10.0, 'executive':        15.0,
  'nurse':           15.0, 'doctor':          18.0, 'therapist':        20.0,
  'teacher':          9.0, 'researcher':      10.0,
  'default':          6.0,
};

const timelineToSignal = (years: number): number => {
  // Shorter timeline = higher risk
  if (years <= 1)  return 0.97;
  if (years <= 2)  return 0.88;
  if (years <= 3)  return 0.75;
  if (years <= 5)  return 0.58;
  if (years <= 7)  return 0.40;
  if (years <= 10) return 0.25;
  if (years <= 15) return 0.15;
  return 0.08;
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const roleLower  = input.roleTitle.toLowerCase();
  const matchedKey = Object.keys(ROLE_TIMELINE_YEARS).find(k => roleLower.includes(k)) ?? 'default';
  const years      = ROLE_TIMELINE_YEARS[matchedKey];
  const signal     = timelineToSignal(years);

  return {
    agentId:    'displacementTimelineAgent',
    category:   'ai',
    signal,
    confidence: matchedKey !== 'default' ? 0.72 : 0.40,
    sourceType: 'heuristic',
    ageInDays:  30,
    metadata:   { matchedKey, estimatedYears: years },
  };
};

export const displacementTimelineAgent: AgentFn = { id: 'displacementTimelineAgent', run };
