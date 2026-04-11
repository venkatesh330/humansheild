// peerCompanyAgent.ts
// External Signal — Peer company comparative risk (sector benchmark layoff patterns).
// HEURISTIC — uses industryData to benchmark this company vs peers.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Average layoff %, revenue growth, and sector health by industry for 2025
const PEER_BENCHMARKS: Record<string, { avgLayoffPct: number; avgRevGrowth: number; stressScore: number }> = {
  'Technology':       { avgLayoffPct: 8.5,  avgRevGrowth: 12.0, stressScore: 0.55 },
  'Software':         { avgLayoffPct: 7.0,  avgRevGrowth: 15.0, stressScore: 0.48 },
  'Finance':          { avgLayoffPct: 5.0,  avgRevGrowth: 6.0,  stressScore: 0.42 },
  'Banking':          { avgLayoffPct: 6.0,  avgRevGrowth: 4.0,  stressScore: 0.45 },
  'Media':            { avgLayoffPct: 12.0, avgRevGrowth: -2.0, stressScore: 0.72 },
  'E-commerce':       { avgLayoffPct: 10.0, avgRevGrowth: 8.0,  stressScore: 0.60 },
  'Retail':           { avgLayoffPct: 7.5,  avgRevGrowth: 2.0,  stressScore: 0.58 },
  'Healthcare':       { avgLayoffPct: 3.0,  avgRevGrowth: 5.0,  stressScore: 0.28 },
  'Manufacturing':    { avgLayoffPct: 5.5,  avgRevGrowth: 3.0,  stressScore: 0.40 },
  'Energy':           { avgLayoffPct: 6.0,  avgRevGrowth: 4.0,  stressScore: 0.38 },
  'Consulting':       { avgLayoffPct: 9.0,  avgRevGrowth: 5.0,  stressScore: 0.52 },
  'Telecom':          { avgLayoffPct: 7.0,  avgRevGrowth: 2.0,  stressScore: 0.50 },
  'default':          { avgLayoffPct: 7.0,  avgRevGrowth: 5.0,  stressScore: 0.50 },
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const cd        = input.companyData;
  const benchmark = PEER_BENCHMARKS[input.industry] ?? PEER_BENCHMARKS['default'];

  let signal = benchmark.stressScore; // Start with sector baseline

  // Compare company vs peers on revenue growth
  if (cd.revenueGrowthYoY !== null && cd.revenueGrowthYoY !== undefined) {
    const delta = cd.revenueGrowthYoY - benchmark.avgRevGrowth;
    if (delta < -15) signal = Math.min(0.95, signal + 0.20);
    else if (delta < -5) signal = Math.min(0.95, signal + 0.10);
    else if (delta > 10) signal = Math.max(0.05, signal - 0.12);
  }

  // Compare layoff history vs peer average
  const companyLayoffPct = cd.layoffsLast24Months
    ?.reduce((a, l) => a + l.percentCut, 0) ?? 0;
  if (companyLayoffPct > benchmark.avgLayoffPct * 2) signal = Math.min(0.95, signal + 0.15);
  else if (companyLayoffPct < benchmark.avgLayoffPct * 0.5) signal = Math.max(0.05, signal - 0.10);

  return {
    agentId:    'peerCompanyAgent',
    category:   'external',
    signal,
    confidence: 0.65,
    sourceType: 'heuristic',
    ageInDays:  7,
    metadata:   {
      industry: input.industry,
      peerAvgLayoffPct: benchmark.avgLayoffPct,
      peerAvgRevGrowth: benchmark.avgRevGrowth,
      companyLayoffPct: companyLayoffPct.toFixed(1),
    },
  };
};

export const peerCompanyAgent: AgentFn = { id: 'peerCompanyAgent', run };
