import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { safeCareers } from "@workspace/db/schema";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";

const router: IRouter = Router();

/**
 * GET /api/safe-careers
 * Query params:
 *   industry     — filter by industry_key
 *   remote       — 'yes' | 'partial' | 'no'
 *   education    — 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd'
 *   maxRisk      — number 3–97 (default: 45)
 *   minGrowth    — number (default: 0)
 *   minSalary    — number USD
 *   q            — free-text search in role_title or industry_label
 *   sort         — 'risk' | 'growth' | 'salary' (default: 'risk')
 *   limit        — number (default: 20, max: 50)
 *   offset       — number (default: 0)
 */
router.get("/", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });

    const {
      industry,
      remote,
      education,
      maxRisk = "45",
      minGrowth = "0",
      minSalary,
      sort = "risk",
      limit = "20",
      offset = "0",
      q,
    } = req.query as Record<string, string>;

    const parsedLimit  = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedMaxRisk = Math.min(97, Math.max(3, parseFloat(maxRisk) || 45));
    const parsedMinGrowth = parseFloat(minGrowth) || 0;

    const conditions = [
      lte(safeCareers.riskScore, parsedMaxRisk),
    ];

    if (industry) conditions.push(eq(safeCareers.industryKey, industry));
    if (remote)   conditions.push(eq(safeCareers.remoteViable, remote));
    if (education) conditions.push(eq(safeCareers.educationRequired, education));
    if (minSalary) {
      conditions.push(gte(safeCareers.medianSalaryUsd, parseInt(minSalary, 10)));
    }
    if (parsedMinGrowth > 0) {
      conditions.push(gte(safeCareers.growthProjection, parsedMinGrowth));
    }
    if (q) {
      const term = `%${q.toLowerCase()}%`;
      conditions.push(
        sql`(lower(${safeCareers.roleTitle}) like ${term} or lower(${safeCareers.industryLabel}) like ${term})`
      );
    }

    // Determine sort column
    const sortMap: Record<string, ReturnType<typeof asc>> = {
      risk:   asc(safeCareers.riskScore),
      growth: asc(sql`COALESCE(${safeCareers.growthProjection}, 0) DESC`),
      salary: asc(sql`COALESCE(${safeCareers.medianSalaryUsd}, 0) DESC`),
    };
    const orderBy = sortMap[sort] ?? asc(safeCareers.riskScore);

    const results = await db
      .select()
      .from(safeCareers)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(parsedLimit)
      .offset(parsedOffset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(safeCareers)
      .where(and(...conditions));

    return res.json({
      data: results,
      pagination: {
        total: Number(count),
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedOffset + parsedLimit < Number(count),
      },
      filters: { industry, remote, education, maxRisk: parsedMaxRisk, minGrowth: parsedMinGrowth, q },
    });
  } catch (e: any) {
    console.error("[safe-careers]", e);
    return res.status(500).json({ error: "Failed to fetch safe careers", details: e.message });
  }
});

/**
 * GET /api/safe-careers/industries
 * Returns distinct industry keys + labels for the filter dropdown
 */
router.get("/industries", async (_req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const rows = await db
      .selectDistinct({ key: safeCareers.industryKey, label: safeCareers.industryLabel })
      .from(safeCareers)
      .orderBy(asc(safeCareers.industryLabel));
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
