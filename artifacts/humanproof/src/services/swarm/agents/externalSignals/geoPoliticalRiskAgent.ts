// geoPoliticalRiskAgent.ts
// External Signal — Country / region geopolitical instability risk.
// HEURISTIC — lookup table by region with industry amplifiers.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const REGION_GEO_RISK: Record<string, { signal: number; label: string }> = {
  'US':             { signal: 0.25, label: 'Stable' },
  'UK':             { signal: 0.30, label: 'Moderate' },
  'EU':             { signal: 0.28, label: 'Stable' },
  'Germany':        { signal: 0.22, label: 'Stable' },
  'France':         { signal: 0.32, label: 'Moderate' },
  'Canada':         { signal: 0.22, label: 'Stable' },
  'Australia':      { signal: 0.22, label: 'Stable' },
  'Japan':          { signal: 0.20, label: 'Stable' },
  'South Korea':    { signal: 0.28, label: 'Moderate' },
  'China':          { signal: 0.55, label: 'Elevated' },
  'India':          { signal: 0.40, label: 'Moderate' },
  'Singapore':      { signal: 0.18, label: 'Low' },
  'Brazil':         { signal: 0.58, label: 'Elevated' },
  'Mexico':         { signal: 0.52, label: 'Elevated' },
  'Russia':         { signal: 0.90, label: 'Critical' },
  'Ukraine':        { signal: 0.95, label: 'Critical' },
  'Middle East':    { signal: 0.70, label: 'High' },
  'Africa':         { signal: 0.62, label: 'High' },
  'Southeast Asia': { signal: 0.45, label: 'Moderate' },
  'default':        { signal: 0.40, label: 'Unknown' },
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const region  = input.companyData.region ?? 'default';
  const geo     = REGION_GEO_RISK[region] ?? REGION_GEO_RISK['default'];

  // Tech companies more exposed to geopolitical sanctions/restrictions
  const geoSensitive = ['Technology', 'Finance', 'Telecom', 'Energy'];
  const amplifier    = geoSensitive.includes(input.industry) ? 1.15 : 1.0;
  const signal       = Math.min(0.95, geo.signal * amplifier);

  return {
    agentId:    'geoPoliticalRiskAgent',
    category:   'external',
    signal,
    confidence: region !== 'default' ? 0.68 : 0.35,
    sourceType: 'heuristic',
    ageInDays:  7,
    metadata:   { region, riskLabel: geo.label, amplifier },
  };
};

export const geoPoliticalRiskAgent: AgentFn = { id: 'geoPoliticalRiskAgent', run };
