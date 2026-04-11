// ═══════════════════════════════════════════════════════════
// riskEngine.ts — Re-exports from riskData + riskFormula
// Maintained for backward compatibility with existing imports
// ═══════════════════════════════════════════════════════════

export * from "./riskData";
export * from "./riskFormula";

// Legacy aliases kept for backward compat
export {
  calculateD1 as getD1,
  calculateD2 as getD2,
  calculateD3 as getD3,
  calculateD5 as getCountryRisk,
} from "./riskFormula";
export { calculateD4 as getExpRisk_v2 } from "./riskFormula";
export { calculateScore, getScoreColor } from "./riskFormula";
