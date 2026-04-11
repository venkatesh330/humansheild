// swarmContextBuilder.ts
// Converts SwarmReport into a compact prompt fragment for AI models.
// Target: < 400 tokens. Injected into Gemma, DeepSeek, Llama, Gemini prompts.

import { SwarmReport } from './swarmTypes';

/**
 * Builds a compact swarm intelligence context string.
 * Designed to be appended to any AI model prompt without significantly
 * increasing token cost (< 400 tokens).
 */
export const buildSwarmContext = (report: SwarmReport | null): string => {
  if (!report) return '';

  const {
    swarmRiskScore,
    swarmConfidence,
    dominantSignals,
    anomalies,
    categoryBreakdown,
    liveAgentsUsed,
    totalAgentsRun,
  } = report;

  // ── Dominant signal summary (top 3) ──────────────────────────────────────
  const topSignals = dominantSignals.slice(0, 3)
    .map(s => `${s.agentId.replace('Agent', '')}:${(s.signal * 100).toFixed(0)}%`)
    .join(', ');

  // ── Category breakdown line ───────────────────────────────────────────────
  const catLine = `Market:${categoryBreakdown.market} Company:${categoryBreakdown.company} AI:${categoryBreakdown.ai} Ext:${categoryBreakdown.external}`;

  // ── Anomaly summary (max 1 line) ──────────────────────────────────────────
  const anomalyLine = anomalies.length > 0
    ? `Anomaly: ${anomalies[0].slice(0, 80)}`
    : 'No anomalies detected';

  // ── Data freshness indicator ──────────────────────────────────────────────
  const freshness = liveAgentsUsed > 0
    ? `${liveAgentsUsed} live-API signals`
    : 'heuristic signals only';

  const context = `
[SWARM INTELLIGENCE CONTEXT — ${totalAgentsRun}/30 agents]
Swarm Risk Score: ${swarmRiskScore}/100 | Confidence: ${swarmConfidence}% | ${freshness}
Category Scores: ${catLine}
Dominant Signals: ${topSignals || 'none above threshold'}
${anomalyLine}
NOTE: Weight these swarm signals at ~15% alongside your own analysis. Higher swarm score = more evidence of structural risk.`.trim();

  return context;
};

/**
 * Returns true if swarmContext is non-empty and meaningful.
 */
export const hasSwarmContext = (context: string | undefined): boolean => {
  return !!context && context.length > 50;
};
