// ═══════════════════════════════════════════════════════════
// riskEngine.ts — Re-exports from riskData + riskFormula
// Maintained for backward compatibility with existing imports
// ═══════════════════════════════════════════════════════════

// Legacy re-exports maintained for backward compatibility with existing imports
export { 
  calculateD1 as getD1,
  calculateD2 as getD2,
  calculateD3 as getD3,
  calculateD5 as getCountryRisk,
  calculateD4 as getExpRisk_v2,
  calculateScore,
  getScoreColor
} from "./riskFormula";
import { calculateScore } from "./riskFormula";

/**
 * Legacy compatibility functions for v1.0 UI remnants
 */
export const getVerdict = (score: number): string => {
  if (score >= 80) return "Critical risk";
  if (score >= 60) return "High risk";
  if (score >= 40) return "Moderate risk";
  return "Low risk";
};

export const getTimeline = (score: number): string => {
  if (score >= 80) return "6-12 months";
  if (score >= 60) return "1-2 years";
  if (score >= 40) return "2-5 years";
  return "5+ years";
};

export const getUrgency = (score: number): string => {
  if (score >= 80) return "Immediate Action";
  if (score >= 60) return "High Urgency";
  if (score >= 40) return "Moderate Urgency";
  return "Planned Transition";
};

export { calculateScore as default, calculateScore as calculateScoreDefault };



