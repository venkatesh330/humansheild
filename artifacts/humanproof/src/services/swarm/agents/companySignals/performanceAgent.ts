// performanceAgent.ts
// Company Signal — Performance tier vs elimination likelihood.
// HEURISTIC — maps performanceTier to elimination pattern with contextual boost.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const tier = input.userFactors.performanceTier;

  const tierMap: Record<string, number> = {
    'top':     0.08,
    'average': 0.45,
    'below':   0.88,
    'unknown': 0.42,
  };

  let signal = tierMap[tier] ?? 0.42;

  // Context: in mass layoffs, even top performers are at risk
  const layoffs    = input.companyData.layoffsLast24Months ?? [];
  const hasMassLayoff = layoffs.some(l => l.percentCut >= 15);
  if (hasMassLayoff && tier !== 'top') {
    signal = Math.min(0.95, signal * 1.20);
  }
  if (hasMassLayoff && tier === 'top') {
    signal = Math.min(0.95, signal + 0.15); // Even top performers face risk in crisis
  }

  return {
    agentId:    'performanceAgent',
    category:   'company',
    signal,
    confidence: tier === 'unknown' ? 0.35 : 0.72,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { performanceTier: tier, hasMassLayoff },
  };
};

export const performanceAgent: AgentFn = { id: 'performanceAgent', run };
