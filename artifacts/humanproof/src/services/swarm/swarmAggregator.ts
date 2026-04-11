// swarmAggregator.ts
// 4-step aggregation pipeline: normalization → time decay → diversity weighting → SwarmScore.
// Outputs a full SwarmReport with categoryBreakdown and visualizationGraph.

import { AgentSignal, AgentCategory, SwarmReport, RiskCluster, GraphNode, GraphEdge } from './swarmTypes';

// ── Category impact weights ───────────────────────────────────────────────────
const CATEGORY_WEIGHTS: Record<AgentCategory, number> = {
  market:   0.32,
  company:  0.30,
  ai:       0.22,
  external: 0.16,
};

// ── Correlated signal clusters (diversity weighting) ─────────────────────────
// Agents in the same cluster compete against each other to prevent over-counting
const SIGNAL_CLUSTERS: { name: string; agents: string[] }[] = [
  { name: 'financial_stress',    agents: ['stockVolatilityAgent', 'revenueGrowthAgent', 'marketCapDropAgent', 'debtToEquityAgent'] },
  { name: 'layoff_evidence',     agents: ['recentLayoffAgent', 'layoffVelocityAgent', 'costCuttingAgent', 'piprAgent'] },
  { name: 'ai_displacement',     agents: ['automationPotentialAgent', 'displacementTimelineAgent', 'roleObsolescenceAgent', 'aiReplacementPatternAgent'] },
  { name: 'macro_environment',   agents: ['macroRecessionAgent', 'sectorContagionAgent', 'laborMarketTightAgent', 'regulatoryRiskAgent'] },
  { name: 'company_stability',   agents: ['departmentRiskAgent', 'leadershipChurnAgent', 'offshoreRiskAgent', 'tenureRiskAgent'] },
  { name: 'personal_protection', agents: ['performanceAgent', 'proRelationshipAgent', 'tenureRiskAgent', 'skillDecayAgent'] },
];

const TIME_DECAY_LAMBDA = 0.05; // e^(-λ × days), λ=0.05 → 50% weight at 14 days

// ── Step 1: Normalize a signal ────────────────────────────────────────────────
const normalizeSignal = (s: AgentSignal): number => {
  return s.signal * s.confidence * (s.sourceType === 'live-api' ? 1.0 : 0.92);
};

// ── Step 2: Time decay weight ─────────────────────────────────────────────────
const timeDecay = (ageInDays: number): number => {
  return Math.exp(-TIME_DECAY_LAMBDA * ageInDays);
};

// ── Step 3: Diversity weight (cluster-level weight reduction) ─────────────────
const buildDiversityWeights = (signals: AgentSignal[]): Map<string, number> => {
  const weights = new Map<string, number>();
  signals.forEach(s => weights.set(s.agentId, 1.0)); // default weight

  for (const cluster of SIGNAL_CLUSTERS) {
    const clusterSignals = signals.filter(s => cluster.agents.includes(s.agentId));
    if (clusterSignals.length <= 1) continue;

    // Reduce each agent's weight within cluster proportionally
    // Formula: clusterWeight = 1 / sqrt(n) per agent in cluster
    const diversityFactor = 1 / Math.sqrt(clusterSignals.length);
    clusterSignals.forEach(s => {
      weights.set(s.agentId, diversityFactor);
    });
  }

  return weights;
};

// ── Step 4: Category breakdown ───────────────────────────────────────────────
const computeCategoryBreakdown = (
  signals: AgentSignal[],
  diversityWeights: Map<string, number>
): Record<AgentCategory, number> => {
  const catScores: Record<AgentCategory, { sum: number; count: number }> = {
    market: { sum: 0, count: 0 }, company: { sum: 0, count: 0 },
    ai:     { sum: 0, count: 0 }, external: { sum: 0, count: 0 },
  };

  signals.forEach(s => {
    const norm    = normalizeSignal(s);
    const tw      = timeDecay(s.ageInDays);
    const dw      = diversityWeights.get(s.agentId) ?? 1.0;
    const score   = norm * tw * dw;
    catScores[s.category].sum   += score;
    catScores[s.category].count += 1;
  });

  return {
    market:   catScores.market.count   > 0 ? Math.round((catScores.market.sum   / catScores.market.count)   * 100) : 0,
    company:  catScores.company.count  > 0 ? Math.round((catScores.company.sum  / catScores.company.count)  * 100) : 0,
    ai:       catScores.ai.count       > 0 ? Math.round((catScores.ai.sum       / catScores.ai.count)       * 100) : 0,
    external: catScores.external.count > 0 ? Math.round((catScores.external.sum / catScores.external.count) * 100) : 0,
  };
};

// ── Build visualization graph ─────────────────────────────────────────────────
const buildVisualizationGraph = (
  signals: AgentSignal[],
  diversityWeights: Map<string, number>
) => {
  const nodes: GraphNode[] = signals.map(s => ({
    id:       s.agentId,
    category: s.category,
    signal:   parseFloat(s.signal.toFixed(3)),
    weight:   parseFloat((diversityWeights.get(s.agentId) ?? 1.0).toFixed(3)),
  }));

  const riskClusters: RiskCluster[] = SIGNAL_CLUSTERS.map(cluster => {
    const clusterSignals = signals.filter(s => cluster.agents.includes(s.agentId));
    const combinedSignal = clusterSignals.length > 0
      ? clusterSignals.reduce((sum, s) => sum + s.signal, 0) / clusterSignals.length
      : 0;
    return { cluster: cluster.name, agents: clusterSignals.map(s => s.agentId), combinedSignal };
  }).filter(c => c.agents.length > 0);

  const dominantEdges: GraphEdge[] = signals
    .filter(s => s.signal > 0.6)
    .sort((a, b) => b.signal - a.signal)
    .slice(0, 8)
    .map(s => ({
      from:         s.agentId,
      to:           'swarmScore',
      contribution: parseFloat(((normalizeSignal(s) * timeDecay(s.ageInDays)) * CATEGORY_WEIGHTS[s.category]).toFixed(3)),
    }));

  return { nodes, riskClusters, dominantEdges };
};

// ── Main Aggregation Function ─────────────────────────────────────────────────

export const aggregateSwarmResults = (
  signals: AgentSignal[],
  resolvedCount: number,
  totalAgents: number
): SwarmReport => {
  if (signals.length === 0) {
    return {
      swarmRiskScore: 50, swarmConfidence: 10,
      dominantSignals: [], weakSignals: [], anomalies: ['All agents failed'],
      categoryBreakdown: { market: 50, company: 50, ai: 50, external: 50 },
      visualizationGraph: { nodes: [], riskClusters: [], dominantEdges: [] },
      liveAgentsUsed: 0, totalAgentsRun: resolvedCount,
      generatedAt: new Date().toISOString(),
    };
  }

  const diversityWeights = buildDiversityWeights(signals);

  // ── Compute weighted SwarmScore ────────────────────────────────────────────
  let totalWeightedScore = 0;
  let totalWeight        = 0;

  signals.forEach(s => {
    const norm     = normalizeSignal(s);
    const tw       = timeDecay(s.ageInDays);
    const dw       = diversityWeights.get(s.agentId) ?? 1.0;
    const catW     = CATEGORY_WEIGHTS[s.category];
    // FIX: dw only penalises the numerator contribution — denominator uses pure catW
    // so correlated agents genuinely contribute less to the final score
    const combined = norm * tw * dw * catW;  // numerator: diversity-penalised
    totalWeightedScore += combined;
    totalWeight        += tw * catW;          // denominator: pure time × category
  });

  const rawScore     = totalWeight > 0 ? totalWeightedScore / totalWeight : 0.5;
  const swarmRiskScore = Math.max(2, Math.min(97, Math.round(rawScore * 100)));

  // ── Confidence from live API usage + resolution rate ─────────────────────
  const liveCount     = signals.filter(s => s.sourceType === 'live-api').length;
  const resolutionPct = (resolvedCount / totalAgents) * 100;
  const liveBonus     = liveCount * 3;
  const avgConfidence = signals.reduce((a, s) => a + s.confidence, 0) / signals.length;
  const swarmConfidence = Math.round(Math.min(95, (avgConfidence * 100 * 0.6) + (resolutionPct * 0.25) + liveBonus));

  // ── Classify signals ──────────────────────────────────────────────────────
  const dominantSignals = signals.filter(s => s.signal > 0.62).sort((a, b) => b.signal - a.signal);
  const weakSignals     = signals.filter(s => s.signal >= 0.30 && s.signal <= 0.62).sort((a, b) => b.signal - a.signal);

  // ── Anomaly detection ─────────────────────────────────────────────────────
  const anomalies: string[] = [];
  const signalValues = signals.map(s => s.signal);
  const mean   = signalValues.reduce((a, b) => a + b, 0) / signalValues.length;
  const stdDev = Math.sqrt(signalValues.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / signalValues.length);
  const outlierAgents = signals.filter(s => Math.abs(s.signal - mean) > 2 * stdDev && stdDev > 0.1);
  outlierAgents.forEach(a => anomalies.push(`${a.agentId}: outlier signal ${(a.signal * 100).toFixed(0)}% (avg ${(mean * 100).toFixed(0)}%)`));
  if (liveCount === 0) anomalies.push('No live-API agents ran — add VITE_ALPHAVANTAGE_KEY, VITE_NEWSAPI_KEY, VITE_FRED_API_KEY for real-time signals');

  const categoryBreakdown  = computeCategoryBreakdown(signals, diversityWeights);
  const visualizationGraph = buildVisualizationGraph(signals, diversityWeights);

  return {
    swarmRiskScore,
    swarmConfidence,
    dominantSignals: dominantSignals.slice(0, 5),
    weakSignals:     weakSignals.slice(0, 5),
    anomalies,
    categoryBreakdown,
    visualizationGraph,
    liveAgentsUsed: liveCount,
    totalAgentsRun: resolvedCount,
    generatedAt:    new Date().toISOString(),
  };
};
