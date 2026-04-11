// layoffVelocityAgent.ts
// Market Signal — Layoffs-per-quarter trend (acceleration matters).
// HEURISTIC — uses layoffsLast24Months from existing companyData.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const layoffs = input.companyData.layoffsLast24Months ?? [];

  if (layoffs.length === 0) {
    return {
      agentId: 'layoffVelocityAgent', category: 'market',
      signal: 0.08, confidence: 0.70, sourceType: 'heuristic', ageInDays: 1,
      metadata: { rounds: 0, trend: 'none' },
    };
  }

  // Sort chronologically and bucket into quarters
  const sorted = [...layoffs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const now    = Date.now();
  const qtrs   = [0, 0, 0, 0, 0, 0, 0, 0]; // 8 quarters = 24 months

  sorted.forEach(l => {
    const mAgo  = (now - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24 * 30);
    const qIdx  = Math.min(7, Math.floor(mAgo / 3));
    qtrs[qIdx] += l.percentCut;
  });

  // Compare recent quarters vs earlier quarters (acceleration)
  const recent = qtrs.slice(0, 4).reduce((a, b) => a + b, 0);
  const older  = qtrs.slice(4).reduce((a, b) => a + b, 0);
  const isAccelerating = recent > older;

  const totalPct = layoffs.reduce((a, l) => a + l.percentCut, 0);
  let signal = Math.min(0.95, totalPct / 40); // 40% cumulative = full signal
  if (isAccelerating) signal = Math.min(0.95, signal * 1.30); // 30% boost for acceleration

  return {
    agentId:    'layoffVelocityAgent',
    category:   'market',
    signal,
    confidence: 0.75,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { rounds: layoffs.length, totalCutPct: totalPct.toFixed(1), accelerating: isAccelerating },
  };
};

export const layoffVelocityAgent: AgentFn = { id: 'layoffVelocityAgent', run };
