// fundingDryupAgent.ts
// Market Signal — Months since last funding round (for private companies).
// HEURISTIC — exponential risk curve as time-since-funding increases.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const cd = input.companyData;

  if (cd.isPublic) {
    // Public companies don't rely on funding rounds
    return {
      agentId: 'fundingDryupAgent', category: 'market',
      signal: 0.15, confidence: 0.80, sourceType: 'heuristic', ageInDays: 1,
      metadata: { isPublic: true, note: 'Public company — funding risk not applicable' },
    };
  }

  const monthsSince = cd.monthsSinceLastFunding;
  const lastRound   = cd.lastFundingRound ?? 'unknown';

  let signal: number;
  if (lastRound === 'bootstrapped') {
    signal = 0.30; // bootstrapped — inherently lower burn risk
  } else if (monthsSince === undefined || monthsSince === null) {
    signal = 0.50; // unknown
  } else if (monthsSince < 6)  { signal = 0.10; }
  else if (monthsSince < 12)   { signal = 0.28; }
  else if (monthsSince < 18)   { signal = 0.52; }
  else if (monthsSince < 24)   { signal = 0.72; }
  else if (monthsSince < 36)   { signal = 0.85; }
  else                         { signal = 0.93; }

  // Stage modifier — late-stage companies survive longer without new funding
  const stageModifiers: Record<string, number> = {
    'Series A': 1.10, 'Series B': 1.05, 'Series C': 1.0,
    'Series D': 0.90, 'Series E+': 0.82, 'IPO': 0.70,
    'bootstrapped': 0.95, 'unknown': 1.0,
  };
  signal = Math.min(0.95, signal * (stageModifiers[lastRound] ?? 1.0));

  return {
    agentId:    'fundingDryupAgent',
    category:   'market',
    signal,
    confidence: monthsSince !== undefined ? 0.72 : 0.40,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { monthsSince, lastRound },
  };
};

export const fundingDryupAgent: AgentFn = { id: 'fundingDryupAgent', run };
