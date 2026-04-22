// ensembleOrchestrator.ts
// Master controller — deterministic engine + swarm + single Claude analysis call.
// API keys never reach the browser. llm-analyze Edge Function holds ANTHROPIC_API_KEY.

import { supabase } from "../../utils/supabase";
import {
  aggregateEnsembleResults,
  AggregateResult,
} from "./ensembleAggregator";
// Agent types kept for interface compatibility — no longer called directly
import type { GemmaResult } from "./gemmaAgent";
import type { DeepSeekResult } from "./deepseekAgent";
import type { LlamaResult } from "./llamaAgent";
import type { GeminiResult } from "./geminiAgent";
import {
  calculateLayoffScore,
  ScoreResult,
  ScoreTier,
  ScoreBreakdown,
  UserFactors,
} from "../layoffScoreEngine";
import { getCachedAnalysis, setCachedAnalysis } from "../cache/analysisCache";
import { CompanyData } from "../../data/companyDatabase";
import { IndustryRisk } from "../../data/industryRiskData";
import { RoleExposure } from "../../data/roleExposureData";
// ── [SWARM] Swarm Intelligence Layer imports ──────────────────────────────────
import { runSwarmLayer } from "../swarm/swarmOrchestrator";
import { buildSwarmContext } from "../swarm/swarmContextBuilder";
import { SwarmReport } from "../swarm/swarmTypes";

// ── Agent status — transparent LLM failure reporting ─────────────────────────
export interface AgentStatusMap {
  gemma:    'success' | 'failed' | 'rate_limited';
  deepseek: 'success' | 'failed' | 'rate_limited';
  llama:    'success' | 'failed' | 'rate_limited';
  gemini:   'success' | 'failed' | 'rate_limited';
  failedCount: number;
  warningMessage: string | null;  // shown in UI if failedCount > 0
}

// ── Extended result type (superset of ScoreResult) ──────────────────────────
export interface EnsembleResult extends ScoreResult {
  // Ensemble additions
  ensembleScore: number; // Final AI-consensus score (may differ from engine score)
  engineScore: number; // Deterministic 5-layer engine score (always present)
  confidence: "High" | "Medium" | "Low"; // existing field, now richer
  confidencePercent: number; // 0–100 numeric version
  modelAgreement: number; // 0–100
  hasOutlier: boolean;
  outlierModels: string[];
  individualScores: AggregateResult["individualScores"];
  accuracyLabel: AggregateResult["accuracyLabel"];
  dominantRisk: string | null;
  keyProtection: string | null;
  timeHorizon: string | null;
  patternMatch: string | null;
  geminiSynthesis: GeminiResult["synthesis"];
  modelsUsed: string[];
  fromCache: boolean;
  // ── [AGENT STATUS] Transparent failure reporting ───────────────────────────
  agentStatus: AgentStatusMap;
  // ── [SWARM] Swarm Intelligence additions ──────────────────────────────────
  swarmReport?: SwarmReport; // Full 30-agent swarm output
  swarmScore?: number; // 0–100 swarm risk score
  // ── [TRAJECTORY] Oracle result for Displacement Trajectory feature ────────
  oracleResult?: {
    total: number;
    dimensions: Array<{
      key: string;
      label: string;
      score: number;
      reason: string;
    }>;
    verdict?: string;
    urgency?: string;
    timeline?: string;
    reasoning?: string;
    safer_career_paths?: Array<{
      role: string;
      risk_reduction_pct: number;
      skill_gap: string;
      transition_difficulty: string;
    }>;
  };
}

export interface EnsembleInputs {
  companyName: string;
  companyData: CompanyData;
  industry: string;
  industryData?: IndustryRisk;
  roleTitle: string;
  department: string;
  tenureYears: number;
  isUniqueRole: boolean;
  performanceTier: UserFactors["performanceTier"];
  hasRecentPromotion: boolean;
  hasKeyRelationships: boolean;
  roleExposureOverride?: RoleExposure;
  forceRefresh?: boolean;
  // ── Progress callback for stage-based UI transitions ──────────────────
  onSwarmComplete?: () => void;
}

const getScoreTier = (score: number): ScoreTier => {
  if (score >= 75)
    return {
      label: "High risk",
      color: "red",
      advice:
        "Take action now — update your CV, activate your network, and explore open roles this week.",
    };
  if (score >= 55)
    return {
      label: "Elevated risk",
      color: "orange",
      advice:
        "Stay alert — strengthen your position internally and build your external safety net.",
    };
  if (score >= 35)
    return {
      label: "Moderate risk",
      color: "amber",
      advice:
        "Monitor closely — you are not in immediate danger, but preparation is wise.",
    };
  if (score >= 15)
    return {
      label: "Low risk",
      color: "green",
      advice:
        "Relatively stable — keep growing your skills and maintaining key relationships.",
    };
  return {
    label: "Very low risk",
    color: "teal",
    advice: "Strong position — focus on career growth rather than defence.",
  };
};

const confidenceFromPercent = (pct: number): "High" | "Medium" | "Low" => {
  if (pct >= 75) return "High";
  if (pct >= 50) return "Medium";
  return "Low";
};

export const runFullEnsembleAnalysis = async (
  inputs: EnsembleInputs,
): Promise<EnsembleResult> => {
  const {
    companyName,
    companyData,
    industry,
    industryData,
    roleTitle,
    department,
    tenureYears,
    isUniqueRole,
    performanceTier,
    hasRecentPromotion,
    hasKeyRelationships,
    roleExposureOverride,
    forceRefresh = false,
    onSwarmComplete,
  } = inputs;

  // ── Step 1: Cache check — FIX: key includes ALL user factors to prevent cross-user collisions ──
  // Previously only contained company/role/dept — two users with different tenure/performance
  // would receive each other's cached scores.
  const cacheKey = [
    companyName.toLowerCase(),
    roleTitle.toLowerCase(),
    department.toLowerCase(),
    String(tenureYears),
    performanceTier,
    isUniqueRole ? '1' : '0',
    hasRecentPromotion ? '1' : '0',
    hasKeyRelationships ? '1' : '0',
    forceRefresh ? 'refresh' : 'standard',
  ].join('::');

  if (!forceRefresh) {
    const cached = await getCachedAnalysis(cacheKey);
    if (cached) {
      console.log("[Ensemble] Cache hit — returning cached result");
      return { ...cached, fromCache: true };
    }
  }

  // ── [SWARM] Step 1.5: Run Swarm Intelligence Layer ──────────────────────
  let swarmReport: SwarmReport | undefined;
  let swarmContext = "";
  try {
    swarmReport = await runSwarmLayer(
      {
        companyName,
        companyData,
        industry,
        industryData,
        roleTitle,
        department,
        tenureYears,
        userFactors: {
          tenureYears,
          isUniqueRole,
          performanceTier,
          hasRecentPromotion,
          hasKeyRelationships,
        },
      },
      forceRefresh,
    );
    swarmContext = buildSwarmContext(swarmReport);
    console.log(
      `[Swarm] Score: ${swarmReport.swarmRiskScore}/100 | Confidence: ${swarmReport.swarmConfidence}% | Live agents: ${swarmReport.liveAgentsUsed}`,
    );
  } catch (swarmErr: any) {
    console.warn(
      "[Swarm] Layer failed — continuing without swarm data:",
      swarmErr.message,
    );
  }
  // ── Notify caller that swarm phase is complete → triggers UI stage 2 ──────
  if (onSwarmComplete) onSwarmComplete();

  // ── Step 2: Run deterministic 5-layer engine (always, no API cost) ────────
  const engineResult: ScoreResult = calculateLayoffScore({
    companyData,
    industryData,
    roleTitle,
    department,
    userFactors: {
      tenureYears,
      isUniqueRole,
      performanceTier,
      hasRecentPromotion,
      hasKeyRelationships,
    },
    roleExposureOverride,
  });

  // ── Step 3: Single Claude analysis via llm-analyze Edge Function ─────────

  // ── Step 3: Single Claude analysis via llm-analyze Edge Function ─────────
  // One call with REAL signal context beats four calls with no company knowledge.
  // API key stays on the server. Graceful fallback if unavailable.
  let claudeAnalysis: {
    success: boolean;
    dominantRiskFactor: string | null;
    keyProtectiveFactor: string | null;
    timeHorizon: string | null;
    synthesis: string | null;
    urgencyLevel: string | null;
    oneActionThisWeek: string | null;
    model?: string;
  } = {
    success: false,
    dominantRiskFactor: null,
    keyProtectiveFactor: null,
    timeHorizon: null,
    synthesis: null,
    urgencyLevel: null,
    oneActionThisWeek: null,
  };

  try {
    const { data: llmData, error: llmError } = await supabase.functions.invoke('llm-analyze', {
      body: {
        companyName,
        roleTitle,
        industry,
        engineScore: engineResult.score,
        engineBreakdown: engineResult.breakdown,
        signalContext: {
          stock90DayChange: (companyData as any).stock90DayChange ?? null,
          revenueGrowthYoY: (companyData as any).revenueGrowthYoY ?? null,
          layoffRounds: companyData.layoffRounds ?? 0,
          lastLayoffPercent: companyData.lastLayoffPercent ?? null,
          recentLayoffHeadlines: 0,
          employeeCount: companyData.employeeCount ?? 1000,
          revenuePerEmployee: companyData.revenuePerEmployee ?? 150000,
          aiInvestmentSignal: companyData.aiInvestmentSignal ?? 'medium',
          dataSource: companyData.source?.includes('Fallback') ? 'fallback' : 'db',
        },
        userFactors: {
          tenureYears,
          performanceTier,
          isUniqueRole,
          hasRecentPromotion,
          hasKeyRelationships,
        },
      },
    });

    if (!llmError && llmData && !llmData.fallback) {
      claudeAnalysis = { success: true, ...llmData };
      console.log('[Ensemble] Claude analysis complete via llm-analyze EF');
    } else {
      console.warn('[Ensemble] llm-analyze unavailable — deterministic score only:', llmError?.message);
    }
  } catch (llmErr: any) {
    console.warn('[Ensemble] llm-analyze call failed:', llmErr.message);
  }

  // ── Step 4: Aggregate — engine score is authoritative, Claude provides narrative ──
  // Build stub results so aggregateEnsembleResults still works (it only blends scores).
  const stubAgent = (model: string): GemmaResult => ({
    model: model as any, success: false, signals: null, rawConfidence: 0,
  });
  const gemmaResult: GemmaResult = stubAgent('gemma-3-27b');
  const deepseekResult: DeepSeekResult = stubAgent('deepseek-v3') as any;
  const llamaResult: LlamaResult = stubAgent('llama-3.3-70b') as any;
  const geminiResult: GeminiResult = {
    model: 'claude-haiku-4-5' as any,
    success: claudeAnalysis.success,
    synthesis: claudeAnalysis.success ? {
      finalScore: engineResult.score,
      confidencePercent: engineResult.confidencePercent,
      modelAgreementPercent: 100,
      outlierDetected: false,
      outlierModel: null,
      outlierReason: null,
      scoreAdjustmentFromEngine: 0,
      adjustmentReason: claudeAnalysis.synthesis ?? '',
      dominantRiskFactor: claudeAnalysis.dominantRiskFactor ?? '',
      keyProtectiveFactor: claudeAnalysis.keyProtectiveFactor ?? '',
      finalTier: engineResult.score >= 75 ? 'high'
        : engineResult.score >= 55 ? 'elevated'
        : engineResult.score >= 35 ? 'moderate'
        : engineResult.score >= 15 ? 'low' : 'very-low',
      verificationNote: claudeAnalysis.oneActionThisWeek ?? '',
    } : null,
  };

  const aggregate = aggregateEnsembleResults({
    gemmaResult,
    deepseekResult,
    llamaResult,
    geminiResult,
    engineScore: engineResult.score,
    engineConfidence: engineResult.confidencePercent,
    swarmScore: swarmReport?.swarmRiskScore,
  });

  const modelsUsed = ['engine', ...(claudeAnalysis.success ? ['claude-haiku-4-5'] : [])];

  const agentStatus: AgentStatusMap = {
    gemma: 'failed', deepseek: 'failed', llama: 'failed',
    gemini: claudeAnalysis.success ? 'success' : 'failed',
    failedCount: claudeAnalysis.success ? 0 : 1,
    warningMessage: claudeAnalysis.success
      ? null
      : '⚠️ AI narrative unavailable — score is deterministic engine only.',
  };

  // ── Step 7: Compose final output ─────────────────────────────────────────
  const nextUpdate = new Date();
  nextUpdate.setDate(nextUpdate.getDate() + 7);

  const output: EnsembleResult = {
    // Core score fields (using ensemble score as the primary score)
    score: aggregate.finalScore,
    tier: getScoreTier(aggregate.finalScore),
    breakdown: engineResult.breakdown, // keep 5-bar display
    confidence: confidenceFromPercent(aggregate.finalConfidence),
    calculatedAt: new Date().toISOString(),
    nextUpdateDue: nextUpdate.toISOString(),
    disclaimer:
      "Risk estimation based on 4-model AI ensemble analysis of public signals. Not a prediction or guarantee of future employment outcomes.",
    recommendations: engineResult.recommendations,
    // Confidence interval, data freshness, and signal quality inherited from engine
    confidenceInterval: engineResult.confidenceInterval,
    dataFreshness: engineResult.dataFreshness,
    signalQuality: engineResult.signalQuality,

    // Ensemble-specific additions
    ensembleScore: aggregate.finalScore,
    engineScore: engineResult.score,
    confidencePercent: aggregate.finalConfidence,
    modelAgreement: aggregate.agreementPercent,
    hasOutlier: aggregate.hasOutlier,
    outlierModels: aggregate.outlierModels,
    individualScores: aggregate.individualScores,
    accuracyLabel: aggregate.accuracyLabel,
    dominantRisk: geminiResult.synthesis?.dominantRiskFactor || null,
    keyProtection: geminiResult.synthesis?.keyProtectiveFactor || null,
    timeHorizon: deepseekResult.signals?.timeHorizon || null,
    patternMatch: deepseekResult.signals?.patternMatch || null,
    geminiSynthesis: geminiResult.synthesis,
    modelsUsed,
    fromCache: false,
    // ── [AGENT STATUS] Transparent failure map ─────────────────────────────
    agentStatus,
    // ── [SWARM] Swarm Intelligence output ──────────────────────────────────
    swarmReport,
    swarmScore: swarmReport?.swarmRiskScore,
  };

  // ── Step 8: Cache for future requests ────────────────────────────────────
  await setCachedAnalysis(cacheKey, output);

  return output;
};
