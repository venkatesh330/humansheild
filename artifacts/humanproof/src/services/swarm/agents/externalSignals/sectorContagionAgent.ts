// sectorContagionAgent.ts
// External Signal — Sector-wide layoff contagion spread.
// HEURISTIC — uses industryData.avgLayoffRate2025 + baselineRisk.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Sector-level contagion score if industryData unavailable
const SECTOR_CONTAGION: Record<string, number> = {
  'Technology':       0.70, 'Software':         0.65, 'Finance':          0.55,
  'Banking':          0.50, 'Media':            0.72, 'E-commerce':       0.60,
  'Retail':           0.58, 'Healthcare':       0.28, 'Manufacturing':    0.42,
  'Energy':           0.38, 'Telecom':          0.48, 'Consulting':       0.52,
  'Legal':            0.30, 'Education':        0.25, 'Government':       0.15,
  'Nonprofit':        0.20, 'Real Estate':      0.45, 'Hospitality':      0.55,
  'default':          0.45,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  if (input.industryData) {
    const id = input.industryData;
    // Blend baseline risk with observed 2025 layoff rate (continuous sigmoid)
    const baseSignal = id.baselineRisk;
    const rateSignal = Math.min(1.0, id.avgLayoffRate2025 * 5); // 0-20% → 0-1
    const signal     = (baseSignal * 0.60) + (rateSignal * 0.40);
    return {
      agentId:    'sectorContagionAgent',
      category:   'external',
      signal:     Math.min(0.95, signal),
      confidence: 0.78,
      sourceType: 'heuristic',
      ageInDays:  7,
      metadata:   { baseSignal, rateSignal, growthOutlook: id.growthOutlook },
    };
  }

  const signal = SECTOR_CONTAGION[input.industry] ?? SECTOR_CONTAGION['default'];
  return {
    agentId:    'sectorContagionAgent',
    category:   'external',
    signal,
    confidence: 0.52,
    sourceType: 'heuristic',
    ageInDays:  30,
    metadata:   { industry: input.industry, fallback: true },
  };
};

export const sectorContagionAgent: AgentFn = { id: 'sectorContagionAgent', run };
