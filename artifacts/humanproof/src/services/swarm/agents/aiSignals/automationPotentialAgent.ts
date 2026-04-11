// automationPotentialAgent.ts
// AI Signal — Routine task percentage for role (O*NET-inspired automation probability).
// HEURISTIC — lookup table by role keyword.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Automation risk by role keyword (Oxford-style, updated 2025)
const ROLE_AUTOMATION: Record<string, number> = {
  'data entry':          0.97, 'accounts payable':    0.94, 'cashier':             0.92,
  'telemarketer':        0.95, 'loan officer':        0.82, 'bookkeeper':          0.90,
  'paralegal':           0.72, 'radiology':           0.65, 'research assistant':  0.78,
  'customer service':    0.75, 'support':             0.70, 'analyst':             0.52,
  'content writer':      0.62, 'copywriter':          0.65, 'translator':          0.70,
  'recruiter':           0.68, 'hr ':                 0.62, 'marketing':           0.58,
  'financial analyst':   0.50, 'accountant':          0.74, 'auditor':             0.65,
  'project manager':     0.38, 'product manager':     0.32, 'software engineer':   0.25,
  'developer':           0.28, 'programmer':          0.30, 'architect':           0.22,
  'designer':            0.42, 'ux ':                 0.38, 'data scientist':      0.28,
  'ml engineer':         0.20, 'ai engineer':         0.15, 'researcher':          0.38,
  'therapist':           0.08, 'nurse':               0.12, 'doctor':              0.10,
  'surgeon':             0.05, 'teacher':             0.18, 'social worker':       0.10,
  'manager':             0.35, 'director':            0.28, 'executive':           0.20,
  'ceo':                 0.15, 'cto':                 0.18, 'cfo':                 0.40,
  'default':             0.45,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const roleLower = input.roleTitle.toLowerCase();
  const matchedKey = Object.keys(ROLE_AUTOMATION).find(k => roleLower.includes(k)) ?? 'default';
  const signal = ROLE_AUTOMATION[matchedKey];

  return {
    agentId:    'automationPotentialAgent',
    category:   'ai',
    signal,
    confidence: matchedKey !== 'default' ? 0.80 : 0.45,
    sourceType: 'heuristic',
    ageInDays:  30, // This data updates infrequently
    metadata:   { roleTitle: input.roleTitle, matchedKey, automationProbability: signal },
  };
};

export const automationPotentialAgent: AgentFn = { id: 'automationPotentialAgent', run };
