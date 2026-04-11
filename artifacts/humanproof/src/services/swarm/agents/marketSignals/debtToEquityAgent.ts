// debtToEquityAgent.ts
// Market Signal — Leverage risk via debt load indicator.
// HEURISTIC — uses debtLoad / financial stress fields from companyData.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const cd = input.companyData;

  // Use financialStressLevel if available (custom field), else infer from known data
  const stressLevel: string = (cd as any).financialStressLevel ?? 'unknown';

  const stressMap: Record<string, number> = {
    'critical': 0.95,
    'high':     0.78,
    'elevated': 0.58,
    'moderate': 0.38,
    'low':      0.18,
    'none':     0.08,
    'unknown':  0.40,
  };

  // Infer from available signals if stress level not explicit
  let signal = stressMap[stressLevel] ?? 0.40;

  // Boost signal if multiple negative signals present
  const negativeFactors: boolean[] = [
    (cd.revenueGrowthYoY ?? 0) < -10,
    (cd.stock90DayChange ?? 0) < -20,
    (cd.layoffRounds ?? 0) >= 3,
    (cd.monthsSinceLastFunding ?? 0) > 18 && !cd.isPublic,
  ];
  const negCount = negativeFactors.filter(Boolean).length;
  if (negCount >= 3) signal = Math.min(0.95, signal * 1.25);
  else if (negCount >= 2) signal = Math.min(0.95, signal * 1.12);

  return {
    agentId:    'debtToEquityAgent',
    category:   'market',
    signal,
    confidence: stressLevel !== 'unknown' ? 0.72 : 0.45,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { stressLevel, inferredNegFactors: negCount },
  };
};

export const debtToEquityAgent: AgentFn = { id: 'debtToEquityAgent', run };
