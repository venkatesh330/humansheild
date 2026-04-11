// augmentationOpportunityAgent.ts
// AI Signal — Human+AI synergy potential (high synergy = LOWER risk signal).
// HEURISTIC — roles with high synergy are augmented rather than replaced.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Augmentation score — how well can a human use AI to become more productive?
// High augmentation = lower displacement risk (inverse of automation)
const ROLE_AUGMENTATION: Record<string, number> = {
  'software engineer':  0.92, 'developer':          0.90, 'data scientist':     0.88,
  'ml engineer':        0.85, 'researcher':         0.82, 'product manager':    0.80,
  'designer':           0.78, 'ux ':                0.80, 'architect':          0.85,
  'manager':            0.72, 'director':           0.75, 'executive':          0.78,
  'nurse':              0.70, 'doctor':             0.72, 'therapist':          0.68,
  'teacher':            0.75, 'legal':              0.70, 'paralegal':          0.55,
  'marketing':          0.72, 'sales':              0.68, 'financial analyst':  0.65,
  'accountant':         0.52, 'hr ':                0.60, 'recruiter':          0.62,
  'content':            0.65, 'copywriter':         0.62, 'translator':         0.42,
  'customer service':   0.55, 'support':            0.52, 'data entry':         0.28,
  'cashier':            0.25, 'bookkeeper':         0.40,
  'default':            0.55,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const roleLower     = input.roleTitle.toLowerCase();
  const matchedKey    = Object.keys(ROLE_AUGMENTATION).find(k => roleLower.includes(k)) ?? 'default';
  const augmentation  = ROLE_AUGMENTATION[matchedKey];

  // Signal is INVERTED — high augmentation = low risk
  const signal = 1 - augmentation;

  return {
    agentId:    'augmentationOpportunityAgent',
    category:   'ai',
    signal,
    confidence: matchedKey !== 'default' ? 0.70 : 0.40,
    sourceType: 'heuristic',
    ageInDays:  30,
    metadata:   { matchedKey, augmentationScore: augmentation, riskSignal: signal },
  };
};

export const augmentationOpportunityAgent: AgentFn = { id: 'augmentationOpportunityAgent', run };
