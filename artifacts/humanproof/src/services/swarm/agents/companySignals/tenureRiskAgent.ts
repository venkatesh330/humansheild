// tenureRiskAgent.ts
// Company Signal — Employee tenure distribution risk.
// HEURISTIC — uses tenureYears against elimination pattern curve.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const tenure = input.tenureYears;

  // Non-linear tenure risk — low tenure AND very high tenure both carry risk
  let signal: number;
  if (tenure < 0.5) {
    signal = 0.85; // Probationary — highest risk
  } else if (tenure < 1) {
    signal = 0.72;
  } else if (tenure < 2) {
    signal = 0.58;
  } else if (tenure < 4) {
    signal = 0.40;
  } else if (tenure < 7) {
    signal = 0.25;
  } else if (tenure < 12) {
    signal = 0.18;
  } else if (tenure < 20) {
    signal = 0.20; // Long tenure — slight risk re: expensive salary
  } else {
    signal = 0.28; // Very long — highest salary, restructuring target
  }

  // Promotion bonus reduces tenure risk
  const promotionBonus = input.userFactors.hasRecentPromotion ? -0.12 : 0;
  signal = Math.max(0.05, signal + promotionBonus);

  return {
    agentId:    'tenureRiskAgent',
    category:   'company',
    signal,
    confidence: 0.78,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { tenureYears: tenure, promotionBonus },
  };
};

export const tenureRiskAgent: AgentFn = { id: 'tenureRiskAgent', run };
