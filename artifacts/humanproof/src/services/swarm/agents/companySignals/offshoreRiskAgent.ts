// offshoreRiskAgent.ts
// Company Signal — Offshoring / restructuring cadence risk.
// HEURISTIC — region + industry offshoring probability lookup.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Offshoring propensity by industry
const INDUSTRY_OFFSHORE: Record<string, number> = {
  'Technology':       0.72,
  'Software':         0.68,
  'Finance':          0.60,
  'Customer Support': 0.85,
  'Manufacturing':    0.78,
  'Retail':           0.55,
  'Healthcare':       0.30,
  'Legal':            0.25,
  'Education':        0.20,
  'Energy':           0.30,
  'Media':            0.50,
  'Consulting':       0.58,
  'default':          0.45,
};

// Department-level offshorability
const DEPT_OFFSHORE: Record<string, number> = {
  'Engineering':      0.70,
  'Customer Support': 0.88,
  'IT':               0.75,
  'Data Science':     0.65,
  'Finance':          0.55,
  'Marketing':        0.40,
  'HR':               0.45,
  'Legal':            0.20,
  'Research':         0.50,
  'Design':           0.55,
  'Product':          0.38,
  'default':          0.45,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const industryBase = INDUSTRY_OFFSHORE[input.industry] ?? INDUSTRY_OFFSHORE['default'];
  const deptKey      = Object.keys(DEPT_OFFSHORE).find(k =>
    input.department.toLowerCase().includes(k.toLowerCase())
  ) ?? 'default';
  const deptBase     = DEPT_OFFSHORE[deptKey];

  // Blend industry and dept offshorability
  const offshoreRisk = industryBase * 0.50 + deptBase * 0.50;

  // Region modifier — some regions are actively offshored to
  const region   = input.companyData.region ?? 'US';
  const isHighCost = ['US', 'UK', 'EU', 'Canada', 'Australia'].includes(region);
  const signal   = isHighCost ? Math.min(0.95, offshoreRisk * 1.15) : offshoreRisk * 0.75;

  return {
    agentId:    'offshoreRiskAgent',
    category:   'company',
    signal,
    confidence: 0.65,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { industry: input.industry, department: deptKey, region, isHighCostRegion: isHighCost },
  };
};

export const offshoreRiskAgent: AgentFn = { id: 'offshoreRiskAgent', run };
