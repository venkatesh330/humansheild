// ensembleAggregator.ts
// Weighted consensus engine — combines all model outputs using trust-adjusted voting.
// Outlier models get halved weight. Gemini synthesis gets 30% of the final blend.

import { GemmaResult } from './gemmaAgent';
import { DeepSeekResult } from './deepseekAgent';
import { LlamaResult } from './llamaAgent';
import { GeminiResult } from './geminiAgent';

// ── Base trust weights (sum = 1.0) ──────────────────────────────────────────
// Adjusted by model confidence and outlier detection at runtime.
const MODEL_BASE_WEIGHTS: Record<string, number> = {
  'gemma-3-27b':    0.20,   // OSINT specialist
  'deepseek-v3':    0.25,   // Financial specialist (highest base weight — most grounded)
  'llama-3.3-70b':  0.20,   // Role specialist
  'gemini-2.0-flash': 0.15, // Synthesis verifier
  'engine':         0.20,   // Deterministic 5-layer (always runs — never fails)
};

export interface IndividualScore {
  model: string;
  score: number;        // 0–100
  confidence: number;   // 0–1
  weight: number;
}

export interface AccuracyLabel {
  label: string;
  color: 'teal' | 'green' | 'amber' | 'gray';
  detail: string;
}

export interface AggregateResult {
  finalScore: number;
  finalConfidence: number;
  agreementPercent: number;
  hasOutlier: boolean;
  outlierModels: string[];
  individualScores: IndividualScore[];
  geminiSynthesis: GeminiResult['synthesis'];
  debugLog: any[];
  accuracyLabel: AccuracyLabel;
}

const weightedMean = (items: { v: number; w: number }[]): number => {
  const totalWeight = items.reduce((a, i) => a + i.w, 0);
  if (totalWeight === 0) return 0.5;
  return items.reduce((sum, i) => sum + (i.v * i.w), 0) / totalWeight;
};

const getAccuracyLabel = (confidence: number, agreement: number): AccuracyLabel => {
  const avg = (confidence + agreement) / 2;
  if (avg >= 90) return { label: 'Very high accuracy', color: 'teal',  detail: '4 AI models in strong agreement' };
  if (avg >= 75) return { label: 'High accuracy',      color: 'green', detail: '3-4 models agree on this assessment' };
  if (avg >= 58) return { label: 'Moderate accuracy',  color: 'amber', detail: '2-3 models agree — limited company data' };
  return              { label: 'Estimated',            color: 'gray',  detail: 'Low company data — industry average used' };
};

export const aggregateEnsembleResults = ({
  gemmaResult,
  deepseekResult,
  llamaResult,
  geminiResult,
  engineScore,
  swarmScore,
}: {
  gemmaResult: GemmaResult;
  deepseekResult: DeepSeekResult;
  llamaResult: LlamaResult;
  geminiResult: GeminiResult | null;
  engineScore: number;
  swarmScore?: number;    // [SWARM] Optional swarm risk score (0–100)
}): AggregateResult => {
  const scores: IndividualScore[] = [];
  const debugLog: any[] = [];

  // ── Extract normalised risk scores from each model ───────────────────────

  // Gemma: weighted blend of all signal fields
  if (gemmaResult?.success && gemmaResult.signals) {
    const g = gemmaResult.signals;
    const gemmaComposite = weightedMean([
      { v: g.companyHealthSignal,   w: 0.25 },
      { v: g.recentLayoffSignal,    w: 0.30 },
      { v: g.financialStressSignal, w: 0.20 },
      { v: g.aiAdoptionThreat,      w: 0.15 },
      { v: g.roleSpecificRisk,      w: 0.10 },
    ]);
    // Trust adjustment: models that are less confident get partially discounted
    const trustAdjusted = gemmaComposite * (0.7 + g.confidence * 0.3);
    scores.push({ model: 'gemma-3-27b', score: trustAdjusted * 100, confidence: g.confidence, weight: MODEL_BASE_WEIGHTS['gemma-3-27b'] });
    debugLog.push({ model: 'gemma', rawComposite: gemmaComposite, trustAdjusted });
  }

  // DeepSeek: use compositeFinancialRisk directly
  if (deepseekResult?.success && deepseekResult.signals) {
    const d = deepseekResult.signals;
    const trustAdjusted = d.compositeFinancialRisk * (0.7 + d.confidence * 0.3);
    scores.push({ model: 'deepseek-v3', score: trustAdjusted * 100, confidence: d.confidence, weight: MODEL_BASE_WEIGHTS['deepseek-v3'] });
    debugLog.push({ model: 'deepseek', rawComposite: d.compositeFinancialRisk, trustAdjusted });
  }

  // Llama: compositeRoleRisk, minus protection bonuses
  if (llamaResult?.success && llamaResult.signals) {
    const l = llamaResult.signals;
    const tenureProtect  = l.tenureProtection     * 0.10;  // tenure reduces risk
    const uniqueProtect  = l.uniquenessProtection * 0.05;  // uniqueness reduces risk slightly
    const adjustedRole   = Math.max(0, l.compositeRoleRisk - tenureProtect - uniqueProtect);
    const trustAdjusted  = adjustedRole * (0.7 + l.confidence * 0.3);
    scores.push({ model: 'llama-3.3-70b', score: trustAdjusted * 100, confidence: l.confidence, weight: MODEL_BASE_WEIGHTS['llama-3.3-70b'] });
    debugLog.push({ model: 'llama', rawComposite: adjustedRole, trustAdjusted });
  }

  // Engine: deterministic, always included, fixed confidence baseline
  scores.push({
    model: 'engine',
    score: engineScore,
    confidence: 0.80,  // deterministic = reliable baseline
    weight: MODEL_BASE_WEIGHTS['engine'],
  });

  // ── Outlier detection ────────────────────────────────────────────────────
  const scoreValues = scores.map(s => s.score);
  const mean    = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  const stdDev  = Math.sqrt(
    scoreValues.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / scoreValues.length
  );

  // Models > 1.5σ from the mean are considered outliers
  const threshold = 1.5 * stdDev;
  const outliers  = scores.filter(s => Math.abs(s.score - mean) > threshold && stdDev > 8);
  const hasOutlier = outliers.length > 0;

  // ── Model agreement ──────────────────────────────────────────────────────
  // Higher stdDev relative to mean = lower agreement
  const agreementPercent = Math.max(0, Math.min(100, Math.round(100 - (stdDev / Math.max(mean, 1)) * 100)));

  // ── Weighted consensus ───────────────────────────────────────────────────
  // Outlier models get halved weight to reduce their distorting influence
  const adjustedScores = scores.map(s => ({
    ...s,
    effectiveWeight: outliers.find(o => o.model === s.model) ? s.weight * 0.5 : s.weight,
  }));

  const totalWeight    = adjustedScores.reduce((a, s) => a + s.effectiveWeight, 0);
  const consensusScore = adjustedScores.reduce((sum, s) => sum + (s.score * (s.effectiveWeight / totalWeight)), 0);

  // ── Apply Gemini synthesis override (30% blend) ─────────────────────────
  let finalScore      = Math.round(consensusScore);
  let finalConfidence = agreementPercent;

  if (geminiResult?.success && geminiResult.synthesis) {
    const g = geminiResult.synthesis;
    finalScore      = Math.round(consensusScore * 0.70 + g.finalScore * 0.30);
    finalConfidence = Math.min(98, Math.round((agreementPercent * 0.6) + (g.confidencePercent * 0.4)));
  }

  // ── [SWARM] Blend swarm score into final (configurable weight, default 15%) ──
  if (swarmScore !== undefined && swarmScore >= 0 && swarmScore <= 100) {
    const rawBlend = parseFloat(
      (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SWARM_BLEND_WEIGHT : undefined) ?? '0.15'
    );
    const safeWeight = Math.max(0.05, Math.min(0.35, isNaN(rawBlend) ? 0.15 : rawBlend));
    finalScore = Math.round(finalScore * (1 - safeWeight) + swarmScore * safeWeight);
    console.log(`[Ensemble] Swarm blend: final=${finalScore} (weight=${safeWeight.toFixed(2)})`);
  }

  // ── Clamp: never claim 0% or 100% certainty ─────────────────────────────
  finalScore = Math.max(2, Math.min(97, finalScore));

  return {
    finalScore,
    finalConfidence,
    agreementPercent,
    hasOutlier,
    outlierModels:    outliers.map(o => o.model),
    individualScores: scores,
    geminiSynthesis:  geminiResult?.synthesis || null,
    debugLog,
    accuracyLabel:    getAccuracyLabel(finalConfidence, agreementPercent),
  };
};
