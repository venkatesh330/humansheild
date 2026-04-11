// industryAiAdoptionAgent.ts
// AI Signal — AI adoption rate in sector (uses industryData.aiAdoptionRate).
// HEURISTIC — pulls from existing industryData enriched with lookup table fallback.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// AI adoption rates by industry (2025 estimate, 0-1 scale)
const INDUSTRY_AI_ADOPTION: Record<string, number> = {
  'Technology':       0.88, 'Software':         0.85, 'Finance':          0.78,
  'Banking':          0.72, 'Healthcare':        0.65, 'Insurance':        0.70,
  'Media':            0.82, 'E-commerce':        0.80, 'Retail':           0.62,
  'Manufacturing':    0.58, 'Energy':            0.55, 'Telecom':          0.70,
  'Consulting':       0.75, 'Legal':             0.55, 'Education':        0.48,
  'Government':       0.38, 'Nonprofit':         0.30, 'Agriculture':      0.42,
  'Transportation':   0.60, 'Real Estate':       0.50, 'Hospitality':      0.45,
  'default':          0.55,
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  // Prefer live industryData.aiAdoptionRate if available
  const liveRate = input.industryData?.aiAdoptionRate;
  const tableRate = INDUSTRY_AI_ADOPTION[input.industry] ?? INDUSTRY_AI_ADOPTION['default'];

  const adoptionRate = liveRate ?? tableRate;
  // High adoption = higher disruption risk for humans in that industry
  const signal = Math.min(0.95, adoptionRate * 0.90); // soft cap at 95%

  return {
    agentId:    'industryAiAdoptionAgent',
    category:   'ai',
    signal,
    confidence: liveRate !== undefined ? 0.82 : 0.65,
    sourceType: 'heuristic',
    ageInDays:  liveRate !== undefined ? 1 : 30,
    metadata:   { industry: input.industry, adoptionRate, source: liveRate !== undefined ? 'industryData' : 'lookup' },
  };
};

export const industryAiAdoptionAgent: AgentFn = { id: 'industryAiAdoptionAgent', run };
