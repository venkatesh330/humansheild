// proRelationshipAgent.ts
// Company Signal — Key relationship moat signal (inverse risk — protection factor).
// HEURISTIC — uses hasKeyRelationships and unique role signals.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const hasRelationships = input.userFactors.hasKeyRelationships;
  const isUnique         = input.userFactors.isUniqueRole;

  // Both factors together = strong moat
  let signal: number;
  if (hasRelationships && isUnique)   signal = 0.08;
  else if (hasRelationships)          signal = 0.18;
  else if (isUnique)                  signal = 0.25;
  else                                signal = 0.55;

  // Older employees with relationships are harder to replace
  const tenureMod = input.tenureYears > 5 ? -0.05 : 0;
  signal = Math.max(0.05, signal + tenureMod);

  return {
    agentId:    'proRelationshipAgent',
    category:   'company',
    signal,
    confidence: 0.65,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { hasKeyRelationships: hasRelationships, isUniqueRole: isUnique, tenureMod },
  };
};

export const proRelationshipAgent: AgentFn = { id: 'proRelationshipAgent', run };
