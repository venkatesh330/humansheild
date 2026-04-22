// hybridResult.ts
// Shared type contract for Audit Terminal v2.0 tabbed dashboard.
// All tabs receive a `HybridResult` prop; this is the single source of truth.

import type { ScoreResult } from "../services/layoffScoreEngine";

// ============================================================================
// Sub-Interfaces
// ============================================================================

/**
 * Score breakdown normalized 0–1 per layer.
 * L1–L5 correspond to the 5-layer risk engine.
 */
export interface ScoreBreakdown {
  L1: number; // Financial Vulnerability
  L2: number; // Layoff & Instability History
  L3: number; // Role Displacement Risk
  L4: number; // Industry Headwinds
  L5: number; // Regional Headwinds
}

/**
 * Human-readable verdict tier with styling hints.
 */
export interface ScoreTier {
  label: string; // e.g. "Elevated risk"
  color: string; // CSS color name or hex
  advice: string; // one-line actionable guidance
}

/**
 * Confidence interval representing uncertainty range.
 */
export interface ConfidenceInterval {
  low: number; // lower bound (0–100)
  high: number; // upper bound (0–100)
  range: number; // high - low
  isEstimate: boolean; // true if derived from sampled/partial data
}

/**
 * Data freshness & staleness metrics.
 */
export interface DataFreshness {
  lastUpdated: string; // ISO timestamp of newest signal
  ageInDays: number; // age of oldest signal used
  stalenessWarning: string | null; // user-facing warning if stale
  accuracyImpact: "Low" | "Medium" | "High" | "Critical"; // how staleness degrades confidence
}

/**
 * Signal quality, conflicts, and ingest metrics.
 */
export interface SignalQuality {
  hasConflicts: boolean;
  conflictingSignals: Array<{
    signalType: string;
    descriptions: string[];
    severity: "low" | "medium" | "high" | "critical";
    conflictingSources: Array<{
      source: string;
      value: number;
      timestamp: string;
    }>;
    recommendedResolution?: string;
  }>;
  liveSignals: number; // count of real-time API signals
  heuristicSignals: number; // count of rule-based/inferred signals
}

/**
 * Consensus snapshot — provenance of final signal values.
 */
export interface ConsensusSnapshot {
  primarySource: "live" | "db" | "hybrid";
  signalSources: string[]; // e.g. ["alpha_vantage", "newsapi", "company_db"]
  conflictCount: number;
  overridesApplied: string[]; // IDs of kill-switch overrides
  overallFreshness: number; // 0–1 freshness score
}

/**
 * Single action item in the personalized plan.
 */
export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  layerFocus: string; // which L1–L5 dimension this addresses
  riskReductionPct: number; // estimated reduction if completed (0–100)
  deadline: string; // human-readable (e.g. "14 days")
}

/**
 * UI-ready dimension entry (derived from ScoreBreakdown).
 */
export interface UIDimension {
  key: "L1" | "L2" | "L3" | "L4" | "L5" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7";
  label: string;
  score: number; // 0–100 (derived from breakdown * 100)
}

// ============================================================================
// Master Result Type
// ============================================================================

/**
 * HybridResult — canonical UI contract for Audit Terminal v2.0.
 *
 * Transform pipeline:
 *   API raw result (from calculateHybridLayoffScore) → add `total`, `dimensions`, `reasoning`
 *
 * Key invariants:
 * - `total` is 0–100
 * - `breakdown` values are normalized 0–1; `dimensions[*].score` are 0–100
 * - `recommendations` are sorted by priority (Critical → Low)
 * - All timestamps are ISO strings
 */
export interface HybridResult {
  // ── Core Score ────────────────────────────────────────────────────────────
  total: number; // 0–100 composite risk index
  breakdown: ScoreBreakdown; // raw L1–L5 (0–1)
  tier: ScoreTier;
  confidence: "High" | "Medium" | "Low";
  confidencePercent: number; // 0–100
  confidenceInterval: ConfidenceInterval;

  // ── Derived for UI (computed client-side from breakdown) ─────────────────
  dimensions: UIDimension[]; // ordered L1→L5 with labels & 0–100 scores
  reasoning: string; // concatenated recommendation descriptions

  // ── Extended / legacy fields (may be used by existing UI) ─────────────────
  /** Temporal projection data for risk trend chart */
  riskTrend?: Array<{ year: number; score?: number; riskScore?: number }>;

  // ── Transparency ─────────────────────────────────────────────────────────
  dataFreshness: DataFreshness;
  signalQuality: SignalQuality;
  consensusSnapshot?: ConsensusSnapshot;

  // ── Recommendations ──────────────────────────────────────────────────────
  recommendations: ActionPlanItem[];

  // ── Context ───────────────────────────────────────────────────────────────
  workTypeKey: string; // role key
  industryKey: string;
  countryKey: string;
  experience: string; // e.g. "5-10"
  tenureYears?: number;
  companyName?: string;

  // ── Ensemble / agent transparency ────────────────────────────────────────
  agentStatus?: {
    gemma?:    'success' | 'failed' | 'rate_limited';
    deepseek?: 'success' | 'failed' | 'rate_limited';
    llama?:    'success' | 'failed' | 'rate_limited';
    gemini?:   'success' | 'failed' | 'rate_limited';
    failedCount: number;
    warningMessage: string | null;
  };

  // ── Metadata (optional) ──────────────────────────────────────────────────
  meta?: {
    usedLiveSignals: boolean;
    liveSignalCount: number;
    swarmAgentCount: number;
    dbSource: string;
    calculationMode: string;
    timestamp: string;
    // Extensible: add `sourceVersion`, `cacheHit`, etc.
  };

  // Legacy compatibility: preserve original engine ScoreResult for fallback rendering
  _engineResult?: ScoreResult;
}

// ============================================================================
// Utility Type Guards
// ============================================================================

export function isHybridResult(obj: any): obj is HybridResult {
  if (!obj || typeof obj !== "object") return false;
  const required = [
    "total",
    "breakdown",
    "tier",
    "confidencePercent",
    "confidenceInterval",
    "dimensions",
    "reasoning",
    "dataFreshness",
    "signalQuality",
    "recommendations",
    "workTypeKey",
    "industryKey",
    "countryKey",
    "experience",
  ] as const;
  return required.every((key) => key in obj);
}

// ============================================================================
// Default / Fallback Values
// ============================================================================

export const DEFAULT_HYBRID_RESULT: HybridResult = {
  total: 50,
  breakdown: { L1: 0.5, L2: 0.5, L3: 0.5, L4: 0.5, L5: 0.5 },
  tier: { label: "Moderate risk", color: "amber", advice: "Monitor closely." },
  confidence: "Medium",
  confidencePercent: 50,
  confidenceInterval: { low: 40, high: 60, range: 20, isEstimate: true },
  dimensions: [
    { key: "L1", label: "Financial Vulnerability", score: 50 },
    { key: "L2", label: "Layoff & Instability History", score: 50 },
    { key: "L3", label: "Role Displacement Risk", score: 50 },
    { key: "L4", label: "Industry Headwinds", score: 50 },
    { key: "L5", label: "Regional Headwinds", score: 50 },
  ],
  reasoning: "Insufficient data for detailed assessment.",
  dataFreshness: {
    lastUpdated: new Date().toISOString(),
    ageInDays: 0,
    stalenessWarning: null,
    accuracyImpact: "Low",
  },
  signalQuality: {
    hasConflicts: false,
    conflictingSignals: [],
    liveSignals: 0,
    heuristicSignals: 0,
  },
  recommendations: [],
  workTypeKey: "",
  industryKey: "",
  countryKey: "usa",
  experience: "5-10",
  companyName: "Unknown",
  riskTrend: [],
};
