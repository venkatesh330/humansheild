import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { validatedScores, liveSignals } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

// Logistic math function
// f(t) = L / (1 + e^(-k(t - t0)))
// L is max cap, typically 100
// k is steepness/velocity
// t0 is midpoint year
function calculateS_Curve(baseRisk: number, kMultipler: number, yearOffset: number): number {
  const L = 100; // max risk cap
  // Calculate the current t0 implied by baseRisk
  // If baseRisk = 50, then t0 is year 0.
  // L / (1 + e^(-k * -t0)) = baseRisk
  // 100 / baseRisk - 1 = e^(k*t0)
  // ln(100/baseRisk - 1) = k*t0
  // t0 = ln(100/baseRisk - 1) / k
  
  // Guard against extreme baseRisk
  const safeBase = Math.min(Math.max(baseRisk, 1), 99);
  
  const t0_implied = Math.log(100 / safeBase - 1) / kMultipler;
  
  // Now solve for future year
  const projected = L / (1 + Math.exp(-kMultipler * (yearOffset - t0_implied)));
  return Math.min(Math.max(Math.round(projected), 0), 100);
}

// Role baseline S-curve parameters
// k: steepness of displacement curve (higher k = faster displacement)
// kOptimistic: best-case slope (active upskilling, favourable regulation)
// kPessimistic: worst-case slope (rapid AI capability jump, sector contraction)
const ROLE_BASE_DATA: Record<string, { defaultRisk: number; threshold: number; k: number; kOptimistic: number; kPessimistic: number }> = {
  // Tech
  software_engineer:      { defaultRisk: 62, threshold: 70, k: 0.30, kOptimistic: 0.12, kPessimistic: 0.50 },
  sw_backend:             { defaultRisk: 60, threshold: 70, k: 0.28, kOptimistic: 0.12, kPessimistic: 0.48 },
  sw_frontend:            { defaultRisk: 65, threshold: 72, k: 0.32, kOptimistic: 0.14, kPessimistic: 0.52 },
  ml_engineer:            { defaultRisk: 30, threshold: 45, k: 0.18, kOptimistic: 0.08, kPessimistic: 0.32 },
  it_cybersec:            { defaultRisk: 25, threshold: 40, k: 0.15, kOptimistic: 0.07, kPessimistic: 0.28 },
  // Data & Analytics
  data_scientist:         { defaultRisk: 55, threshold: 68, k: 0.35, kOptimistic: 0.15, kPessimistic: 0.55 },
  data_analyst:           { defaultRisk: 68, threshold: 75, k: 0.42, kOptimistic: 0.20, kPessimistic: 0.65 },
  // Business & Finance
  finance_analyst:        { defaultRisk: 70, threshold: 78, k: 0.45, kOptimistic: 0.22, kPessimistic: 0.68 },
  fin_account:            { defaultRisk: 78, threshold: 85, k: 0.52, kOptimistic: 0.28, kPessimistic: 0.75 },
  marketing:              { defaultRisk: 68, threshold: 76, k: 0.40, kOptimistic: 0.20, kPessimistic: 0.62 },
  // Legal & Healthcare
  lawyer:                 { defaultRisk: 52, threshold: 62, k: 0.25, kOptimistic: 0.12, kPessimistic: 0.42 },
  hc_surgeon:             { defaultRisk: 12, threshold: 25, k: 0.10, kOptimistic: 0.05, kPessimistic: 0.18 },
  // BPO / High risk
  bpo_data_entry:         { defaultRisk: 92, threshold: 95, k: 0.72, kOptimistic: 0.45, kPessimistic: 0.90 },
  cnt_seo_content:        { defaultRisk: 82, threshold: 90, k: 0.62, kOptimistic: 0.38, kPessimistic: 0.82 },
  // Fallback
  default:                { defaultRisk: 62, threshold: 70, k: 0.32, kOptimistic: 0.16, kPessimistic: 0.52 },
};

function getRoleData(jobKey: string) {
  return ROLE_BASE_DATA[jobKey] ?? ROLE_BASE_DATA.default;
}

router.get("/:jobKey", async (req: any, res: any) => {
  try {
    const { jobKey } = req.params;
    let baseRisk = 60; // fallback default
    
    // Default config based on generic role mappings
    const roleConfig = getRoleData(jobKey);
    let { k, kOptimistic, kPessimistic } = roleConfig;

    if (db) {
      // 1. Fetch current calibrated baseline from validatedScores
      const scoreRows = await db
        .select()
        .from(validatedScores)
        .where(eq(validatedScores.roleKey, jobKey))
        .limit(1);

      if (scoreRows.length > 0) {
        baseRisk = scoreRows[0].finalScore;
      } else {
        baseRisk = roleConfig.defaultRisk;
      }

      // 2. Adjust steepness (k) based on liveSignals from Swarm
      const signalRows = await db
        .select()
        .from(liveSignals)
        .where(eq(liveSignals.roleKey, jobKey))
        .orderBy(desc(liveSignals.fetchedAt))
        .limit(5);

      if (signalRows.length > 0) {
        // rawValue is stored as 0–100 severity metric.
        // BUG-01 FIX: Normalize to 0–1 before computing kAdjustment.
        // Without this, kAdjustment was ~100x too large (e.g. 19.8 instead of 0.198),
        // making the S-curve project 100% risk immediately.
        const avgRaw = signalRows.reduce((acc, row) => acc + (row.rawValue ?? 50), 0) / signalRows.length;
        const avgVelocityNorm = Math.min(Math.max(avgRaw / 100, 0), 1); // normalize to 0–1

        // kAdjustment: range -0.2 to +0.2 for k, centered at velocity=0.5
        const kAdjustment = (avgVelocityNorm - 0.5) * 0.4;
        k = Math.max(k + kAdjustment, 0.05);
        kOptimistic = Math.max(kOptimistic + kAdjustment * 0.5, 0.05);
        kPessimistic = Math.max(kPessimistic + kAdjustment * 1.5, 0.05);
      }
    } else {
       baseRisk = roleConfig.defaultRisk;
    }

    // Final safety clamp (kAdjustment block now also clamps, this is a belt-and-suspenders guard)
    k = Math.min(Math.max(k, 0.05), 1.5);
    kOptimistic = Math.min(Math.max(kOptimistic, 0.05), 1.2);
    kPessimistic = Math.min(Math.max(kPessimistic, 0.05), 2.0);

    const currentYear = new Date().getFullYear();
    const timeline = [];

    // Construct exactly 6 years of projection
    for (let yr = 0; yr <= 5; yr++) {
      timeline.push({
        year: String(currentYear + yr),
        optimistic: calculateS_Curve(baseRisk, kOptimistic, yr),
        base: calculateS_Curve(baseRisk, k, yr),
        pessimistic: calculateS_Curve(baseRisk, kPessimistic, yr)
      });
    }

    return res.json({
      roleKey: jobKey,
      baseRisk,
      threshold: roleConfig.threshold,
      timeline,
      sources: ["Swarm Intelligence Agentic Signals", "Macroeconomic Aggregators (Live)"]
    });

  } catch (e: any) {
    console.error("Forecast Error:", e);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
