import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { liveSignals, validatedScores, dataAuditLog, signalWeights } from "@workspace/db/schema";
import { desc, eq, gt, sql } from "drizzle-orm";

const router: IRouter = Router();

/**
 * GET /api/live-data/score/:roleKey
 * Returns the validated calibrated score + confidence + sources for a specific role
 */
router.get("/score/:roleKey", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const { roleKey } = req.params;

    const rows = await db
      .select()
      .from(validatedScores)
      .where(eq(validatedScores.roleKey, roleKey))
      .limit(1);

    if (rows.length === 0) return res.json({ calibrated: false, roleKey });

    const score = rows[0];
    const freshnessHrs = Math.round((Date.now() - new Date(score.computedAt).getTime()) / 3600000);

    return res.json({
      calibrated: true,
      roleKey,
      score: score.finalScore,
      dimensions: { d1: score.d1, d2: score.d2, d3: score.d3, d4: score.d4, d5: score.d5, d6: score.d6 },
      confidence: {
        pct:   score.confidencePct,
        band:  confidenceBand(score.confidencePct),
        label: confidenceLabel(score.confidencePct),
      },
      sources:  score.sourcesUsed ?? [],
      outliers: score.outliersRemoved ?? [],
      freshness: { computedAt: score.computedAt, hoursAgo: freshnessHrs, validUntil: score.validUntil },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/live-data/weights
 * Returns the current calibrated D1-D6 weights
 */
router.get("/weights", async (_req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const rows = await db
      .select()
      .from(signalWeights)
      .orderBy(desc(signalWeights.createdAt))
      .limit(1);
    if (rows.length === 0) {
      return res.json({ d1: 0.26, d2: 0.18, d3: 0.20, d4: 0.16, d5: 0.09, d6: 0.11, source: "static_baseline" });
    }
    const w = rows[0];
    return res.json({
      d1: w.d1Weight, d2: w.d2Weight, d3: w.d3Weight,
      d4: w.d4Weight, d5: w.d5Weight, d6: w.d6Weight,
      reason: w.reason, calibratedBy: w.calibratedBy, updatedAt: w.createdAt,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/live-data/audit?limit=20&offset=0
 * Returns the audit log (full data transparency endpoint)
 */
router.get("/audit", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const limit  = Math.min(100, parseInt(req.query.limit  ?? "20", 10));
    const offset = Math.max(0,   parseInt(req.query.offset ?? "0",  10));

    const rows = await db
      .select()
      .from(dataAuditLog)
      .orderBy(desc(dataAuditLog.changedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(dataAuditLog);

    return res.json({ data: rows, pagination: { total: Number(count), limit, offset } });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/live-data/signals/:roleKey
 * Returns raw live signals for a role (used by the audit log UI)
 */
router.get("/signals/:roleKey", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const { roleKey } = req.params;
    const now = new Date().toISOString();

    const rows = await db
      .select()
      .from(liveSignals)
      .where(eq(liveSignals.roleKey, roleKey))
      .orderBy(desc(liveSignals.fetchedAt))
      .limit(50);

    return res.json({ roleKey, signals: rows, freshSignals: rows.filter(r => r.validUntil > new Date(now)) });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Helpers ──────────────────────────────────────────────────
function confidenceBand(pct: number): number {
  if (pct >= 85) return 3;
  if (pct >= 70) return 5;
  if (pct >= 55) return 8;
  return 12;
}

function confidenceLabel(pct: number): string {
  if (pct >= 85) return "Very high confidence";
  if (pct >= 70) return "High confidence";
  if (pct >= 55) return "Moderate confidence";
  return "Low confidence — more sources needed";
}

export default router;
