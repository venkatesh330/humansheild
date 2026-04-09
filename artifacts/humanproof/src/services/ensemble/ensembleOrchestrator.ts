// ensembleOrchestrator.ts
// Master controller — wires all agents, runs in parallel, aggregates results.
// Returns a result compatible with the existing LayoffCalculator.tsx interface.

import { runGemmaOSINT, GemmaResult } from './gemmaAgent';
import { runDeepSeekFinancial, DeepSeekResult } from './deepseekAgent';
import { runLlamaRoleValidation, LlamaResult } from './llamaAgent';
import { runGeminiSynthesis, GeminiResult } from './geminiAgent';
import { aggregateEnsembleResults, AggregateResult } from './ensembleAggregator';
import { calculateLayoffScore, ScoreResult, ScoreTier, ScoreBreakdown, UserFactors } from '../layoffScoreEngine';
import { getCachedAnalysis, setCachedAnalysis } from '../cache/analysisCache';
import { CompanyData } from '../../data/companyDatabase';
import { IndustryRisk } from '../../data/industryRiskData';
import { RoleExposure } from '../../data/roleExposureData';

// ── Extended result type (superset of ScoreResult) ──────────────────────────
export interface EnsembleResult extends ScoreResult {
  // Ensemble additions
  ensembleScore:     number;          // Final AI-consensus score (may differ from engine score)
  engineScore:       number;          // Deterministic 5-layer engine score (always present)
  confidence:        'High' | 'Medium' | 'Low';   // existing field, now richer
  confidencePercent: number;          // 0–100 numeric version
  modelAgreement:    number;          // 0–100
  hasOutlier:        boolean;
  outlierModels:     string[];
  individualScores:  AggregateResult['individualScores'];
  accuracyLabel:     AggregateResult['accuracyLabel'];
  dominantRisk:      string | null;
  keyProtection:     string | null;
  timeHorizon:       string | null;
  patternMatch:      string | null;
  geminiSynthesis:   GeminiResult['synthesis'];
  modelsUsed:        string[];
  fromCache:         boolean;
}

export interface EnsembleInputs {
  companyName:        string;
  companyData:        CompanyData;
  industry:           string;
  industryData?:      IndustryRisk;
  roleTitle:          string;
  department:         string;
  tenureYears:        number;
  isUniqueRole:       boolean;
  performanceTier:    UserFactors['performanceTier'];
  hasRecentPromotion: boolean;
  hasKeyRelationships: boolean;
  roleExposureOverride?: RoleExposure;
  forceRefresh?:      boolean;
}

const getScoreTier = (score: number): ScoreTier => {
  if (score >= 75) return { label: 'High risk',     color: 'red',    advice: 'Take action now — update your CV, activate your network, and explore open roles this week.' };
  if (score >= 55) return { label: 'Elevated risk', color: 'orange', advice: 'Stay alert — strengthen your position internally and build your external safety net.' };
  if (score >= 35) return { label: 'Moderate risk', color: 'amber',  advice: 'Monitor closely — you are not in immediate danger, but preparation is wise.' };
  if (score >= 15) return { label: 'Low risk',      color: 'green',  advice: 'Relatively stable — keep growing your skills and maintaining key relationships.' };
  return                  { label: 'Very low risk', color: 'teal',   advice: 'Strong position — focus on career growth rather than defence.' };
};

const confidenceFromPercent = (pct: number): 'High' | 'Medium' | 'Low' => {
  if (pct >= 75) return 'High';
  if (pct >= 50) return 'Medium';
  return 'Low';
};

export const runFullEnsembleAnalysis = async (inputs: EnsembleInputs): Promise<EnsembleResult> => {
  const {
    companyName, companyData, industry, industryData, roleTitle,
    department, tenureYears, isUniqueRole, performanceTier,
    hasRecentPromotion, hasKeyRelationships, roleExposureOverride,
    forceRefresh = false,
  } = inputs;

  // ── Step 1: Cache check ───────────────────────────────────────────────────
  const cacheKey = `${companyName.toLowerCase()}::${roleTitle.toLowerCase()}::${department.toLowerCase()}`;
  if (!forceRefresh) {
    const cached = await getCachedAnalysis(cacheKey);
    if (cached) {
      console.log('[Ensemble] Cache hit — returning cached result');
      return { ...cached, fromCache: true };
    }
  }

  // ── Step 2: Run deterministic 5-layer engine (always, no API cost) ────────
  const engineResult: ScoreResult = calculateLayoffScore({
    companyData,
    industryData,
    roleTitle,
    department,
    userFactors: { tenureYears, isUniqueRole, performanceTier, hasRecentPromotion, hasKeyRelationships },
    roleExposureOverride,
  });

  // ── Step 3: Fire Gemma, DeepSeek, Llama in PARALLEL ──────────────────────
  const [gemmaSettled, deepseekSettled, llamaSettled] = await Promise.allSettled([
    runGemmaOSINT(companyName, industry, roleTitle),
    runDeepSeekFinancial(companyName, industry, companyData?.employeeCount ?? 'unknown', companyData?.layoffsLast24Months ?? []),
    runLlamaRoleValidation(roleTitle, department, industry, tenureYears, isUniqueRole),
  ]);

  // Safely unwrap settled results
  const gemmaResult: GemmaResult = gemmaSettled.status === 'fulfilled'
    ? gemmaSettled.value
    : { model: 'gemma-3-27b', success: false, signals: null, rawConfidence: 0 };

  const deepseekResult: DeepSeekResult = deepseekSettled.status === 'fulfilled'
    ? deepseekSettled.value
    : { model: 'deepseek-v3', success: false, signals: null, rawConfidence: 0 };

  const llamaResult: LlamaResult = llamaSettled.status === 'fulfilled'
    ? llamaSettled.value
    : { model: 'llama-3.3-70b', success: false, signals: null, rawConfidence: 0 };

  console.log('[Ensemble] Agent results —',
    'Gemma:', gemmaResult.success,
    'DeepSeek:', deepseekResult.success,
    'Llama:', llamaResult.success
  );

  // ── Step 4: Run Gemini as final synthesis judge ───────────────────────────
  const geminiResult: GeminiResult = await runGeminiSynthesis({
    companyName,
    roleTitle,
    gemmaOutput:     gemmaResult,
    deepseekOutput:  deepseekResult,
    llamaOutput:     llamaResult,
    engineScore:     engineResult.score,
    engineBreakdown: engineResult.breakdown,
  });

  console.log('[Ensemble] Gemini synthesis:', geminiResult.success);

  // ── Step 5: Final aggregation with all models ─────────────────────────────
  const aggregate = aggregateEnsembleResults({
    gemmaResult,
    deepseekResult,
    llamaResult,
    geminiResult,
    engineScore: engineResult.score,
  });

  // ── Step 6: Determine which models actually contributed ───────────────────
  const modelsUsed = [
    'engine',
    ...(gemmaResult.success    ? ['gemma-3-27b']     : []),
    ...(deepseekResult.success ? ['deepseek-v3']     : []),
    ...(llamaResult.success    ? ['llama-3.3-70b']   : []),
    ...(geminiResult.success   ? ['gemini-2.0-flash'] : []),
  ];

  // ── Step 7: Compose final output ─────────────────────────────────────────
  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 7);

  const output: EnsembleResult = {
    // Core score fields (using ensemble score as the primary score)
    score:          aggregate.finalScore,
    tier:           getScoreTier(aggregate.finalScore),
    breakdown:      engineResult.breakdown,     // keep 5-bar display
    confidence:     confidenceFromPercent(aggregate.finalConfidence),
    calculatedAt:   new Date().toISOString(),
    nextUpdateDue:  nextUpdate.toISOString(),
    disclaimer:     'Risk estimation based on 4-model AI ensemble analysis of public signals. Not a prediction or guarantee of future employment outcomes.',
    recommendations: engineResult.recommendations,

    // Ensemble-specific additions
    ensembleScore:     aggregate.finalScore,
    engineScore:       engineResult.score,
    confidencePercent: aggregate.finalConfidence,
    modelAgreement:    aggregate.agreementPercent,
    hasOutlier:        aggregate.hasOutlier,
    outlierModels:     aggregate.outlierModels,
    individualScores:  aggregate.individualScores,
    accuracyLabel:     aggregate.accuracyLabel,
    dominantRisk:      geminiResult.synthesis?.dominantRiskFactor   || null,
    keyProtection:     geminiResult.synthesis?.keyProtectiveFactor  || null,
    timeHorizon:       deepseekResult.signals?.timeHorizon          || null,
    patternMatch:      deepseekResult.signals?.patternMatch         || null,
    geminiSynthesis:   geminiResult.synthesis,
    modelsUsed,
    fromCache:         false,
  };

  // ── Step 8: Cache for future requests ────────────────────────────────────
  await setCachedAnalysis(cacheKey, output);

  return output;
};
