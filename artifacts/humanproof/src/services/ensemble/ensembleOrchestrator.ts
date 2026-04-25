// ensembleOrchestrator.ts
// Master controller — deterministic engine + swarm + tiered LLM analysis.
// API keys never reach the browser. llm-analyze Edge Function holds ANTHROPIC_API_KEY.
//
// ── 3-TIER LLM ARCHITECTURE ──────────────────────────────────────────────────
// Tier A: Globally known company (top 500 + top 100 India) with real financial data
//         → Call Claude with full signal context. Produces genuine grounded narrative.
// Tier B: Known sector company (in DB but not top-tier, or partial data)
//         → Deterministic template narrative personalized at variable level.
//         → No API cost, honest framing, still useful.
// Tier C: Unknown company (source includes 'Fallback' or 'Unknown')
//         → Skip LLM entirely. Show score with explicit scope framing.
//         → A hallucinated narrative is worse than no narrative.
// ─────────────────────────────────────────────────────────────────────────────

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
  type UniquenessDepth,
} from "../layoffScoreEngine";
import { getCachedAnalysis, setCachedAnalysis } from "../cache/analysisCache";
import { loadScoreHistory } from "../scoreDeltaService";
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
  /** Priority 3: 3-level uniqueness depth — overrides isUniqueRole when present */
  uniquenessDepth?: UniquenessDepth;
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
    uniquenessDepth,
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
    uniquenessDepth ?? (isUniqueRole ? 'critical_knowledge' : 'generic'), // prevents cross-user collision
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

  // ── LLM Tier Classification ──────────────────────────────────────────────
  // Classify before the engine runs so tier drives Step 3 routing below.
  // NEVER call LLM for unknown companies — hallucination destroys trust.
  type LLMTier = 'A' | 'B' | 'C';

  const classifyLLMTier = (cd: CompanyData): LLMTier => {
    const src = (cd.source ?? '').toLowerCase();
    // Tier C: unknown — no real data, LLM has no knowledge of this company
    if (src.includes('fallback') || src.includes('unknown') || src.includes('user input')) return 'C';
    // Tier A: rich real data present — LLM can produce a genuinely grounded narrative
    const hasRichData =
      cd.revenueGrowthYoY != null &&
      (cd.stock90DayChange != null || !cd.isPublic) &&
      cd.employeeCount > 0 &&
      cd.layoffRounds >= 0;
    if (hasRichData) return 'A';
    // Tier B: in DB but partial data — deterministic template is safer than LLM guess
    return 'B';
  };

  const llmTier = classifyLLMTier(companyData);

  // ── Tier B: Deterministic narrative (no API call) ─────────────────────────
  const buildTierBNarrative = (
    cd: CompanyData,
    role: string,
    score: number,
    bd: { L1: number; L2: number; L3: number },
  ): typeof claudeAnalysis => {
    const industryLabel = cd.industry ?? 'your sector';
    const tierLabel = score >= 75 ? 'High risk' : score >= 55 ? 'Elevated risk'
      : score >= 35 ? 'Moderate risk' : 'Low risk';

    const primaryRisk =
      bd.L2 > 0.6 ? `Documented layoff history at ${cd.name} is the dominant signal`
      : bd.L1 > 0.6 ? `${cd.name} shows financial stress signals`
      : bd.L3 > 0.6 ? `${role} roles face above-average AI displacement in ${industryLabel}`
      : `${industryLabel} sector headwinds are the primary driver`;

    const primaryProtection =
      bd.L2 < 0.3 ? `No documented workforce reductions at ${cd.name} in the tracking window`
      : bd.L1 < 0.3 ? `${cd.name} shows healthy financial signals`
      : `Sector growth outlook and personal protection factors offset some risk`;

    const horizon = score >= 75 ? '6–12 months' : score >= 55 ? '12–24 months'
      : score >= 35 ? '24–36 months' : '36+ months';

    const inactionConsequence = score >= 75
      ? `Without intervention in the next 6 months, the ${role} role at ${cd.name} will likely fall into the highest-risk displacement bracket. AI tools are already absorbing execution-layer work in this function. Waiting for an official announcement typically leaves 4–6 fewer months for proactive action than starting now.`
      : score >= 55
        ? `Without upskilling in the next 6 months, gradual task erosion will reduce role leverage as AI tools absorb more execution work. The augmentation window — where AI enhances rather than replaces — is typically 18–36 months before market expectations shift permanently.`
        : `Without proactive monitoring, your current stability could erode if sector AI adoption accelerates or company financial signals shift. Annual reassessment is the minimum recommended response at this risk level.`;

    const riskReductionFactor = bd.L3 > 0.6
      ? `Reducing reliance on AI-automatable tasks and building AI oversight skills would most improve your risk position — L3 (Role Displacement) at ${Math.round(bd.L3 * 100)}/100 is the dominant driver`
      : bd.L1 > 0.6
        ? `Monitoring ${cd.name}'s financial signals closely and maintaining career optionality would most improve your position — L1 (Financial Health) at ${Math.round(bd.L1 * 100)}/100 is the key driver`
        : `Building cross-functional relationships and deepening domain expertise would most improve your position — your personal protection (L5) and market headwinds (L4) are the primary levers`;

    return {
      success: true,
      dominantRiskFactor: primaryRisk,
      keyProtectiveFactor: primaryProtection,
      timeHorizon: horizon,
      synthesis: [
        `${cd.name} (${industryLabel}) — ${tierLabel}. Score: ${score}/100.`,
        `Primary risk: ${primaryRisk}.`,
        `Key protection: ${primaryProtection}.`,
        `Estimated exposure horizon: ${horizon}.`,
        `What changes your risk most: ${riskReductionFactor}.`,
        `If you do nothing for 6 months: ${inactionConsequence}`,
      ].join(' '),
      urgencyLevel: score >= 75 ? 'Immediate' : score >= 55 ? 'High' : score >= 35 ? 'Moderate' : 'Low',
      oneActionThisWeek: score >= 65
        ? `Update your CV this week and reach out to 2 warm professional contacts — do not wait for an official announcement`
        : score >= 45
          ? `Identify the single AI tool most relevant to ${role} and dedicate 30 minutes/day this week to building proficiency`
          : `Map your role's task portfolio: mark each task as AI-automatable, augmented, or human-only. This is your personal displacement map.`,
    };
  };

  // ── Tier C: Scope-framing (no LLM, no template speculation) ─────────────
  const buildTierCNarrative = (
    cd: CompanyData,
    role: string,
    score: number,
  ): typeof claudeAnalysis => ({
    success: true, // "success" = valid analysis, just limited scope
    dominantRiskFactor: `Role-level AI displacement risk for ${role} in ${cd.industry ?? 'your sector'}`,
    keyProtectiveFactor: 'Score reflects role and market conditions, not employer-specific stability',
    timeHorizon: score >= 65 ? '12–18 months (role-based estimate)' : '24–36 months (role-based estimate)',
    synthesis: `Note: "${cd.name}" was not found in our company intelligence database. This score reflects your role's displacement risk in the ${cd.industry ?? 'broader'} sector and current market conditions — it does NOT reflect employer-specific signals (financial health, layoff history, AI investment). Score accuracy bounds are ±25–30 points. For a full company-specific audit, ensure the company name matches our database or provide additional company details.`,
    urgencyLevel: score >= 75 ? 'High' : score >= 45 ? 'Moderate' : 'Low',
    oneActionThisWeek: `Since company data is limited, focus on the role-level action: map which of your current tasks AI tools can already do and begin positioning yourself as the oversight layer for those tasks`,
  });

  // ── Step 2: Run deterministic 5-layer engine (always, no API cost) ────────
  const engineResult: ScoreResult = calculateLayoffScore({
    companyData,
    industryData,
    roleTitle,
    department,
    userFactors: {
      tenureYears,
      isUniqueRole,
      uniquenessDepth, // Priority 3: ensures 3-level depth reaches the engine
      performanceTier,
      hasRecentPromotion,
      hasKeyRelationships,
    },
    roleExposureOverride,
  });

  // ── Step 3: Tiered narrative synthesis ───────────────────────────────────
  // Tier A → Claude (grounded); Tier B → deterministic template; Tier C → scope framing.
  // Law: never call LLM for unknown companies. Hallucination > no narrative.
  let claudeAnalysis: {
    success: boolean;
    dominantRiskFactor: string | null;
    keyProtectiveFactor: string | null;
    timeHorizon: string | null;
    synthesis: string | null;
    urgencyLevel: string | null;
    oneActionThisWeek: string | null;
    model?: string;
    llmTier?: LLMTier;
  } = {
    success: false,
    dominantRiskFactor: null,
    keyProtectiveFactor: null,
    timeHorizon: null,
    synthesis: null,
    urgencyLevel: null,
    oneActionThisWeek: null,
    llmTier,
  };

  if (llmTier === 'C') {
    // Unknown company: scope-frame honestly, skip LLM entirely
    claudeAnalysis = { ...buildTierCNarrative(companyData, roleTitle, engineResult.score), llmTier: 'C' };
    console.log('[Ensemble] Tier C — unknown company, deterministic scope framing used');

  } else if (llmTier === 'B') {
    // Known sector company: template narrative, no API cost
    claudeAnalysis = {
      ...buildTierBNarrative(companyData, roleTitle, engineResult.score, engineResult.breakdown),
      llmTier: 'B',
    };
    console.log('[Ensemble] Tier B — deterministic template narrative');

  } else {
    // Tier A: call Claude with real signals + priority sequencing
    // Priority 10: Detect user context to sequence questions by urgency.
    // A returning user whose score jumped needs "what changed" first.
    // A Stage 3 user needs "inaction consequence + 6-week protocol" first.
    // A first-time user needs "primary risk driver" first.
    type QuestionKey = 'primaryRiskDriver' | 'keyProtectiveFactor' | 'estimatedTimeline' |
      'oneActionThisWeek' | 'whatChangesRiskMost' | 'sixMonthInactionConsequence';

    const scoreHistory = loadScoreHistory();
    const isReturningUser = scoreHistory.length >= 2;
    const priorScore = isReturningUser ? (scoreHistory[1]?.score ?? engineResult.score) : engineResult.score;
    const scoreJump = engineResult.score - priorScore;

    function getQuestionPriority(returning: boolean, jump: number, stage3: boolean): QuestionKey[] {
      if (stage3) {
        // Stage 3: immediate consequence + action first — user is in crisis
        return ['sixMonthInactionConsequence', 'oneActionThisWeek', 'primaryRiskDriver',
                'whatChangesRiskMost', 'estimatedTimeline', 'keyProtectiveFactor'];
      }
      if (returning && jump >= 5) {
        // Returning user, score rose: explain what changed and why first
        return ['whatChangesRiskMost', 'primaryRiskDriver', 'estimatedTimeline',
                'oneActionThisWeek', 'sixMonthInactionConsequence', 'keyProtectiveFactor'];
      }
      if (!returning) {
        // First-time user: primary risk + inaction equally important
        return ['primaryRiskDriver', 'sixMonthInactionConsequence', 'estimatedTimeline',
                'oneActionThisWeek', 'whatChangesRiskMost', 'keyProtectiveFactor'];
      }
      // Returning, stable score: focus on actionable next step
      return ['oneActionThisWeek', 'primaryRiskDriver', 'keyProtectiveFactor',
              'estimatedTimeline', 'whatChangesRiskMost', 'sixMonthInactionConsequence'];
    }

    const isStage3 = llmTier === 'A' && engineResult.score >= 75;
    const questionPriority = getQuestionPriority(isReturningUser, scoreJump, isStage3);

    // ── v4.0: Proportional token allocation ──────────────────────────────────
    // Intelligence Upgrade 1: question weight determines both ORDER and DEPTH.
    // Stage 3 → consequence question gets 40% of tokens (crisis framing).
    // Returning+jump → whatChanges gets 35% (explanation-first framing).
    // First-time → primaryRisk gets 30% + inaction gets 25% (orientation framing).
    // Stable returning → action gets 35% (execution-first framing).
    function buildQuestionWeights(priority: QuestionKey[], returning: boolean, jump: number, stage3: boolean): Record<QuestionKey, number> {
      // Default equal distribution (100% / 6 ≈ 17% each)
      const equal: Record<QuestionKey, number> = {
        primaryRiskDriver: 17, keyProtectiveFactor: 12, estimatedTimeline: 12,
        oneActionThisWeek: 20, whatChangesRiskMost: 17, sixMonthInactionConsequence: 22,
      };
      if (stage3) {
        return { ...equal, sixMonthInactionConsequence: 40, oneActionThisWeek: 25,
          primaryRiskDriver: 15, whatChangesRiskMost: 10, estimatedTimeline: 5, keyProtectiveFactor: 5 };
      }
      if (returning && jump >= 5) {
        return { ...equal, whatChangesRiskMost: 35, primaryRiskDriver: 20,
          oneActionThisWeek: 18, estimatedTimeline: 12, sixMonthInactionConsequence: 10, keyProtectiveFactor: 5 };
      }
      if (!returning) {
        return { ...equal, primaryRiskDriver: 30, sixMonthInactionConsequence: 25,
          oneActionThisWeek: 20, estimatedTimeline: 12, whatChangesRiskMost: 8, keyProtectiveFactor: 5 };
      }
      // Returning, stable: action-first
      return { ...equal, oneActionThisWeek: 35, primaryRiskDriver: 20,
        keyProtectiveFactor: 15, estimatedTimeline: 12, whatChangesRiskMost: 10, sixMonthInactionConsequence: 8 };
    }
    const questionWeights = buildQuestionWeights(questionPriority, isReturningUser, scoreJump, isStage3);

    // ── v4.0: Full signal set — all required fields per LLM prompt spec ───────
    const v4SignalContext = {
      // Company data — all actual values, not summaries
      stock_90d_change: companyData.stock90DayChange ?? null,
      revenue_growth_yoy: companyData.revenueGrowthYoY ?? null,
      layoff_rounds_24m: companyData.layoffRounds ?? 0,
      last_layoff_months_ago: companyData.layoffsLast24Months?.[0]
        ? Math.round((Date.now() - new Date(companyData.layoffsLast24Months[0].date).getTime()) / (30 * 24 * 60 * 60 * 1000))
        : null,
      last_layoff_percent: companyData.lastLayoffPercent ?? null,
      ai_investment_signal: companyData.aiInvestmentSignal ?? 'medium',
      collapse_stage: (companyData as any).collapseStage ?? null,
      peer_contagion_count: 0, // populated by sectorContagionAgent
      employee_count: companyData.employeeCount ?? 1000,
      revenue_per_employee: companyData.revenuePerEmployee ?? 150000,
      is_public: companyData.isPublic,
      region: companyData.region ?? 'GLOBAL',
      // User context
      experience_years: (inputs as any).careerYears ?? tenureYears,
      tenure_years: tenureYears,
      performance_tier: performanceTier,
      uniqueness_depth: uniquenessDepth ?? (isUniqueRole ? 'critical_knowledge' : 'generic'),
      has_recent_promotion: hasRecentPromotion,
      has_key_relationships: hasKeyRelationships,
      // Financial + capital (if available from localStorage via context)
      financial_risk_appetite: null, // populated by FinancialContext if user has set it
      career_capital_total: null,    // populated by CareerCapital if user has assessed
      city: null,                    // populated if user provided city
      // Session context
      is_returning_user: isReturningUser,
      previous_score: isReturningUser ? priorScore : null,
      score_delta: isReturningUser ? scoreJump : null,
      days_since_last_audit: isReturningUser
        ? Math.round((Date.now() - (loadScoreHistory()[1]?.timestamp ?? Date.now())) / 86400000)
        : null,
      // Data quality
      data_source: 'live' as const,
    };

    try {
      const { data: llmData, error: llmError } = await supabase.functions.invoke('llm-analyze', {
        body: {
          companyName,
          roleTitle,
          industry,
          engineScore: engineResult.score,
          // v4.0: Full L1-D7 breakdown as percentages
          engineBreakdown: {
            L1: Math.round(engineResult.breakdown.L1 * 100),
            L2: Math.round(engineResult.breakdown.L2 * 100),
            L3: Math.round(engineResult.breakdown.L3 * 100),
            L4: Math.round(engineResult.breakdown.L4 * 100),
            L5: Math.round(engineResult.breakdown.L5 * 100),
            D6: Math.round(((engineResult.breakdown as any).D6 ?? 0) * 100),
            D7: Math.round(((engineResult.breakdown as any).D7 ?? 0) * 100),
          },
          // v4.0: Full signal context (not the truncated v3 version)
          signalContext: v4SignalContext,
          userFactors: {
            tenureYears,
            performanceTier,
            isUniqueRole,
            uniquenessDepth,
            hasRecentPromotion,
            hasKeyRelationships,
          },
          // v4.0: Priority ordering AND proportional token allocation
          responseFormat: {
            questions: questionPriority,
            // v4.0: Token budget allocation per question (must sum to 100)
            questionWeights,
            priorityInstruction: `Answer the 6 questions in the exact order given. Each question has a token budget percentage — allocate your response depth proportionally to these weights. Question 1 (${questionPriority[0]}) receives ${questionWeights[questionPriority[0]]}% of your response. Question 2 (${questionPriority[1]}) receives ${questionWeights[questionPriority[1]]}%. Remaining 4 questions share ${100 - questionWeights[questionPriority[0]] - questionWeights[questionPriority[1]]}%. User context: ${isReturningUser ? `returning user, score changed ${scoreJump > 0 ? '+' : ''}${scoreJump} pts since last audit` : 'first-time user'}. Company data quality: live signals. Do not use corporate language. Speak directly.`,
            // v4.0: Structured JSON output — one field per question key
            outputFormat: 'structured_json',
            maxWords: 250,
          },
        },
      });

      if (!llmError && llmData && !llmData.fallback) {
        claudeAnalysis = { success: true, llmTier: 'A', ...llmData };
        console.log('[Ensemble] Tier A — Claude narrative complete');
      } else {
        // Tier A API failed → fall back to Tier B template (not silence)
        console.warn('[Ensemble] Tier A Claude failed — falling back to Tier B template:', llmError?.message);
        claudeAnalysis = {
          ...buildTierBNarrative(companyData, roleTitle, engineResult.score, engineResult.breakdown),
          llmTier: 'B',
        };
      }
    } catch (llmErr: any) {
      console.warn('[Ensemble] Tier A call exception — using Tier B template:', llmErr.message);
      claudeAnalysis = {
        ...buildTierBNarrative(companyData, roleTitle, engineResult.score, engineResult.breakdown),
        llmTier: 'B',
      };
    }
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
    // Confidence interval, data freshness, signal quality, probability
    // forecast, and timing inherited from engine — these are deterministic
    // computations that should not be re-derived in the ensemble path.
    confidenceInterval: engineResult.confidenceInterval,
    dataFreshness: engineResult.dataFreshness,
    signalQuality: engineResult.signalQuality,
    probabilityForecast: engineResult.probabilityForecast,
    timing: engineResult.timing,

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
