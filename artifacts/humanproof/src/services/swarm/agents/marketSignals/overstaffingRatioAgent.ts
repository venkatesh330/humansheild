// overstaffingRatioAgent.ts
// Market Signal — Revenue-per-employee vs sector benchmark.
// HEURISTIC — uses revenuePerEmployee + industry sector benchmarks.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Industry-specific revenue-per-employee benchmarks (USD, US-normalized)
const SECTOR_BENCHMARKS: Record<string, number> = {
  'Technology':            350_000,
  'Software':              400_000,
  'Finance':               500_000,
  'Banking':               350_000,
  'Healthcare':            250_000,
  'Retail':                150_000,
  'E-commerce':            200_000,
  'Manufacturing':         200_000,
  'Media':                 250_000,
  'Consulting':            180_000,
  'Telecom':               300_000,
  'Energy':                600_000,
  'Real Estate':           300_000,
  'Education':             100_000,
  'Nonprofit':              80_000,
  'default':               250_000,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const revPerEmp   = input.companyData.revenuePerEmployee ?? 0;
  const benchmark   = SECTOR_BENCHMARKS[input.industry] ?? SECTOR_BENCHMARKS['default'];

  if (revPerEmp === 0) {
    return {
      agentId: 'overstaffingRatioAgent', category: 'market',
      signal: 0.45, confidence: 0.30, sourceType: 'heuristic', ageInDays: 1,
      metadata: { note: 'Revenue per employee unknown' },
    };
  }

  const ratio = revPerEmp / benchmark;
  // ratio < 0.5 = overstaffed (high risk), ratio > 1.5 = lean (low risk)
  let signal: number;
  if (ratio < 0.30) signal = 0.92;
  else if (ratio < 0.50) signal = 0.78;
  else if (ratio < 0.70) signal = 0.62;
  else if (ratio < 0.90) signal = 0.45;
  else if (ratio < 1.20) signal = 0.28;
  else if (ratio < 1.50) signal = 0.15;
  else signal = 0.08;

  return {
    agentId:    'overstaffingRatioAgent',
    category:   'market',
    signal,
    confidence: 0.68,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { revPerEmp, benchmark, ratio: ratio.toFixed(2), sector: input.industry },
  };
};

export const overstaffingRatioAgent: AgentFn = { id: 'overstaffingRatioAgent', run };
