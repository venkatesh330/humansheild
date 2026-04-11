// leadershipChurnAgent.ts
// Company Signal — C-suite turnover frequency as instability proxy.
// HEURISTIC — uses leadership signals from companyData.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const cd = input.companyData;
  const churnLevel: string = (cd as any).leadershipChurn ?? 'unknown';

  const churnMap: Record<string, { signal: number; confidence: number }> = {
    'high':    { signal: 0.88, confidence: 0.80 },
    'medium':  { signal: 0.55, confidence: 0.75 },
    'low':     { signal: 0.18, confidence: 0.80 },
    'none':    { signal: 0.10, confidence: 0.85 },
    'unknown': { signal: 0.42, confidence: 0.35 },
  };

  const { signal, confidence } = churnMap[churnLevel] ?? churnMap['unknown'];

  // Additional signal: recent CEO or CFO change is a key warning sign
  const hasCEOChange: boolean = (cd as any).ceoChaneLast12Months ?? false;
  const hasCFOChange: boolean = (cd as any).cfoChaneLast12Months ?? false;
  let adjustedSignal = signal;
  if (hasCEOChange) adjustedSignal = Math.min(0.95, adjustedSignal + 0.15);
  if (hasCFOChange) adjustedSignal = Math.min(0.95, adjustedSignal + 0.10);

  return {
    agentId:    'leadershipChurnAgent',
    category:   'company',
    signal:     adjustedSignal,
    confidence,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { churnLevel, hasCEOChange, hasCFOChange },
  };
};

export const leadershipChurnAgent: AgentFn = { id: 'leadershipChurnAgent', run };
