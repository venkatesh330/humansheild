// ════════════════════════════════════════════════════════════════
// riskFormula.ts — Core Risk Engine Calculation & Confidence Logic
// ════════════════════════════════════════════════════════════════

/**
 * 3-Tier Confidence System (BUG-004)
 * DQ_FULL: Research-backed data (±3% error)
 * DQ_PARTIAL: Partially attributed data (±7% error)
 * Limited: Sparse data points (±12% error)
 */
export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface ScoreResult {
  total: number;
  dimensions: {
    label: string;
    score: number;
    weight: number;
  }[];
  confidence: ConfidenceLevel;
  dataQuality: 'DQ_FULL' | 'DQ_PARTIAL' | 'Limited';
}

/**
 * Enhanced projectSafeScore with upskilling factor (BUG-012)
 * @param currentScore Initial risk score
 * @param years Number of years to project
 * @param upskillingFactor 0 to 1 value (1.0 = maximum upskilling, 0 = none)
 */
export const projectSafeScore = (
  currentScore: number,
  years: number,
  upskillingFactor: number = 0
): number => {
  // Base decay rate of 5% per year due to AI advancement
  const baseDecay = 0.05 * years;
  
  // Upskilling reduces decay. Max upskilling (1.0) can neutralize base decay.
  const mitigatedDecay = baseDecay * (1 - upskillingFactor);
  
  // Risk grows over time as AI capabilities expand
  const projectedRisk = currentScore + (mitigagedDecay * 100);
  
  return Math.min(Math.max(projectedRisk, 0), 100);
};

export const getConfidenceLevel = (dq: string): ConfidenceLevel => {
  if (dq === 'DQ_FULL') return 'HIGH';
  if (dq === 'DQ_PARTIAL') return 'MODERATE';
  return 'LOW';
};

export const calcDimensionScore = (base: number, volatility: number): number => {
  return Math.min(Math.max(base * volatility, 0), 100);
};

// Stub implementations for missing functions
export const calculateScore = (workType: string, industry: string): number => {
  // Simplified calculation - return a mock score based on workType
  return Math.floor(Math.random() * 100);
};

export const getScoreColor = (score: number): string => {
  if (score < 30) return '#10b981'; // green
  if (score < 60) return '#f59e0b'; // orange
  return '#ef4444'; // red
};

export const getVerdict = (score: number): string => {
  if (score < 30) return 'Low Risk';
  if (score < 60) return 'Moderate Risk';
  return 'High Risk';
};

export const getTimeline = (score: number): string => {
  if (score < 30) return '10+ years';
  if (score < 60) return '5-10 years';
  return '2-5 years';
};

export const getUrgency = (score: number): string => {
  if (score < 30) return 'Low';
  if (score < 60) return 'Medium';
  return 'High';
};

export const getConfidence = (score: number): ConfidenceLevel => {
  return 'MODERATE';
};

export const getAutomationExp = (workType: string): string => {
  return 'Moderate';
};

export const projectScore = (score: number, years: number): number => {
  return Math.min(100, score + (years * 5));
};
