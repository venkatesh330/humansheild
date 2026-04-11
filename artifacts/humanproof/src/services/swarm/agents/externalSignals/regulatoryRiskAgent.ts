// regulatoryRiskAgent.ts
// External Signal — Regulatory pressure on AI/automation in the industry.
// HEURISTIC — combines sector-specific regulatory exposure with role type.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Regulatory pressure levels (0 = no regulation accelerating layoffs, 1 = maximum)
// Note: High AI regulation = SLOWER displacement = LOWER risk for humans
// High automation-friendly regulation = HIGHER displacement risk
const INDUSTRY_REG_RISK: Record<string, { aiReg: number; laborReg: number }> = {
  'Technology':    { aiReg: 0.45, laborReg: 0.35 }, // Some AI regulation, weak labor protection
  'Software':      { aiReg: 0.42, laborReg: 0.32 },
  'Finance':       { aiReg: 0.55, laborReg: 0.48 }, // Strong industry regulation
  'Banking':       { aiReg: 0.58, laborReg: 0.52 },
  'Healthcare':    { aiReg: 0.72, laborReg: 0.68 }, // Very tightly regulated — human required
  'Legal':         { aiReg: 0.65, laborReg: 0.60 }, // Professional licensing protects humans
  'Education':     { aiReg: 0.60, laborReg: 0.72 }, // Strong union protections (in some regions)
  'Manufacturing': { aiReg: 0.30, laborReg: 0.40 },
  'Energy':        { aiReg: 0.40, laborReg: 0.42 },
  'Telecom':       { aiReg: 0.48, laborReg: 0.38 },
  'Government':    { aiReg: 0.68, laborReg: 0.80 }, // Civil service protections
  'default':       { aiReg: 0.45, laborReg: 0.42 },
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const reg = INDUSTRY_REG_RISK[input.industry] ?? INDUSTRY_REG_RISK['default'];

  // Higher AI regulation = lower risk for humans (AI is slowed)
  // Higher labor regulation = lower risk for workers
  // Combine: (1 - aiReg) + (1 - laborReg) → average → risk signal
  const aiRegProtection    = reg.aiReg;      // More regulation = more protection
  const laborRegProtection = reg.laborReg;
  const protectionScore    = (aiRegProtection * 0.50) + (laborRegProtection * 0.50);

  // Risk signal is inverse of protection (well-regulated = low risk)
  const signal = Math.max(0.08, 1 - protectionScore);

  return {
    agentId:    'regulatoryRiskAgent',
    category:   'external',
    signal,
    confidence: 0.62,
    sourceType: 'heuristic',
    ageInDays:  30,
    metadata:   { aiReg: reg.aiReg, laborReg: reg.laborReg, protectionScore: protectionScore.toFixed(2) },
  };
};

export const regulatoryRiskAgent: AgentFn = { id: 'regulatoryRiskAgent', run };
