// roleObsolescenceAgent.ts
// AI Signal — Percentage of role tasks AI-completable (obsolescence probability).
// HEURISTIC — task decomposition table by role keyword.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Percentage of role tasks that AI can handle autonomously (2025 estimate)
const ROLE_TASK_AI_PCT: Record<string, number> = {
  'data entry':        0.96, 'cashier':           0.90, 'telemarketer':      0.88,
  'bookkeeper':        0.85, 'loan officer':      0.75, 'paralegal':         0.68,
  'translator':        0.82, 'customer service':  0.70, 'content writer':    0.72,
  'copywriter':        0.70, 'research assistant':0.68, 'analyst':           0.55,
  'accountant':        0.72, 'financial analyst': 0.58, 'auditor':           0.62,
  'recruiter':         0.65, 'hr ':               0.58, 'marketing':         0.55,
  'sales':             0.48, 'software engineer': 0.32, 'developer':         0.35,
  'programmer':        0.38, 'data scientist':    0.38, 'ml engineer':       0.28,
  'product manager':   0.30, 'designer':          0.42, 'ux ':               0.38,
  'manager':           0.30, 'director':          0.22, 'executive':         0.18,
  'nurse':             0.12, 'doctor':            0.10, 'therapist':         0.08,
  'teacher':           0.22, 'researcher':        0.35, 'scientist':         0.32,
  'default':           0.45,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const roleLower  = input.roleTitle.toLowerCase();
  const matchedKey = Object.keys(ROLE_TASK_AI_PCT).find(k => roleLower.includes(k)) ?? 'default';
  const pct        = ROLE_TASK_AI_PCT[matchedKey];

  // Direct mapping — higher pct = higher obsolescence risk
  const signal = Math.min(0.95, pct);

  return {
    agentId:    'roleObsolescenceAgent',
    category:   'ai',
    signal,
    confidence: matchedKey !== 'default' ? 0.75 : 0.42,
    sourceType: 'heuristic',
    ageInDays:  30,
    metadata:   { matchedKey, aiCompletablePct: (pct * 100).toFixed(0) + '%' },
  };
};

export const roleObsolescenceAgent: AgentFn = { id: 'roleObsolescenceAgent', run };
