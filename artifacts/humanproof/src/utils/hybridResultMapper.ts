// hybridResultMapper.ts
// Maps various result types (ScoreResult, EnsembleResult) to the canonical HybridResult contract.

import { HybridResult, DEFAULT_HYBRID_RESULT } from "../types/hybridResult";
import { ScoreResult } from "../services/layoffScoreEngine";
import { EnsembleResult } from "../services/ensemble/ensembleOrchestrator";
import { CompanyData } from "../data/companyDatabase";

export function mapToHybridResult(
  result: ScoreResult | EnsembleResult,
  companyData: CompanyData,
  inputs: {
    roleTitle: string;
    department: string;
    tenureYears: number;
    oracleKey?: string;
    experience?: string;
  },
  _dataQuality: "live" | "partial" | "fallback" = "live",
  trueLiveSignals?: number,
  trueHeuristicSignals?: number,
): HybridResult {
  const isEnsemble = (r: any): r is EnsembleResult => "ensembleScore" in r;

  // Preserve core score
  const total = isEnsemble(result) ? result.ensembleScore : result.score;
  
  // Dimensions mapping (L1-L5)
  const dimensions = [
    { key: "L1" as const, label: "Company Health", score: Math.round(result.breakdown.L1 * 100) },
    { key: "L2" as const, label: "Layoff History", score: Math.round(result.breakdown.L2 * 100) },
    { key: "L3" as const, label: "Role Displacement", score: Math.round(result.breakdown.L3 * 100) },
    { key: "L4" as const, label: "Market Headwinds", score: Math.round(result.breakdown.L4 * 100) },
    { key: "L5" as const, label: "Your Exposure", score: Math.round(result.breakdown.L5 * 100) },
  ];

  // Reasoning concatenation
  const reasoning = result.recommendations.map(r => r.description).join(" ");

  // Map ActionPlanItems
  const recommendations = result.recommendations.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    priority: r.priority,
    layerFocus: r.layerFocus,
    riskReductionPct: r.riskReductionPct,
    deadline: r.deadline
  }));

  return {
    ...DEFAULT_HYBRID_RESULT,
    total,
    breakdown: result.breakdown,
    tier: {
      label: result.tier.label,
      color: result.tier.color,
      advice: result.tier.advice
    },
    confidence: result.confidence,
    confidencePercent: result.confidencePercent,
    confidenceInterval: result.confidenceInterval,
    dimensions,
    reasoning,
    dataFreshness: result.dataFreshness,
    signalQuality: {
      hasConflicts: result.signalQuality.hasConflicts,
      conflictingSignals: result.signalQuality.conflictingSignals.map(c => ({
        signalType: c.signal1,
        descriptions: [c.signal2],
        severity: (c.severity.toLowerCase() as any) || "medium",
        conflictingSources: []
      })),
      // Use pipeline-provided counts when available; fall back to engine's own count
      liveSignals: trueLiveSignals ?? result.signalQuality.liveSignals ?? 0,
      heuristicSignals: trueHeuristicSignals ?? result.signalQuality.heuristicSignals ?? 0,
    },
    recommendations,
    workTypeKey: inputs.oracleKey || "generic",
    industryKey: companyData.industry.toLowerCase().replace(/\s+/g, "_"),
    countryKey: companyData.region.toLowerCase() || "usa",
    experience: inputs.experience || "5-10",
    companyName: companyData.name,
    meta: {
      usedLiveSignals: (trueLiveSignals ?? result.signalQuality.liveSignals ?? 0) > 0,
      liveSignalCount: trueLiveSignals ?? result.signalQuality.liveSignals ?? 0,
      swarmAgentCount: 30,
      dbSource: companyData.source,
      calculationMode: isEnsemble(result) ? "ENSEMBLE_CORE" : "DETERMINISTIC_ENGINE",
      timestamp: result.calculatedAt
    },
    _engineResult: isEnsemble(result) ? undefined : result
  };
}
