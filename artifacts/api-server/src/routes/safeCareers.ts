<<<<<<< HEAD
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { safeCareers } from "@workspace/db/schema";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
=======
import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
>>>>>>> audit-fixes-2026-04-07

const router = Router();

// Get all safe careers
router.get('/', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .order('ai_resistance', { ascending: false });

<<<<<<< HEAD
    const {
      industry,
      remote,
      education,
      maxRisk = "45",
      minGrowth = "0",
      minSalary,
      isSmeStable,
      sort = "risk",
      limit = "20",
      offset = "0",
      q,
    } = req.query as Record<string, string>;

    const parsedLimit  = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedMaxRisk = Math.min(97, Math.max(3, parseFloat(maxRisk) || 45));
    const parsedMinGrowth = parseFloat(minGrowth) || 0;

    const conditions = [
      lte(safeCareers.riskScore, parsedMaxRisk),
    ];

    if (industry) conditions.push(eq(safeCareers.industryKey, industry));
    if (remote)   conditions.push(eq(safeCareers.remoteViable, remote));
    if (education) conditions.push(eq(safeCareers.educationRequired, education));
    if (isSmeStable === 'true') conditions.push(eq(safeCareers.isSmeStable, 1));
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
    const sortMap: Record<string, ReturnType<typeof asc | typeof desc>> = {
      risk:   asc(safeCareers.riskScore),
      growth: desc(sql`COALESCE(${safeCareers.growthProjection}, 0)`),
      salary: desc(sql`COALESCE(${safeCareers.medianSalaryUsd}, 0)`),
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
 * GET /api/safe-careers/stats
 * Returns aggregate statistics: total count, avg salary, top sector
 * FIX: Replaces the wasteful 200-record frontend fetch just for header stats
 */
router.get("/stats", async (_req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });

    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        avgSalary: sql<number>`round(avg(${safeCareers.medianSalaryUsd}))`,
      })
      .from(safeCareers);

    // Top sector by role count
    const sectorCounts = await db
      .select({ label: safeCareers.industryLabel, count: sql<number>`count(*)` })
      .from(safeCareers)
      .groupBy(safeCareers.industryLabel)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    return res.json({
      total: Number(stats.total),
      avgSalaryK: stats.avgSalary ? Math.round(Number(stats.avgSalary) / 1000) : 0,
      topSector: sectorCounts[0]?.label || '',
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/safe-careers/industries
 * Returns distinct industry keys + labels for the filter dropdown
 */
router.get("/industries", async (_req: any, res: any) => {
=======
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// New Endpoint: Stats aggregate (BUG-006)
// Provides header statistics in a single call instead of fetching all records
router.get('/stats', async (req: Request, res: Response) => {
>>>>>>> audit-fixes-2026-04-07
  try {
    const { data: careers, error } = await supabase
      .from('careers')
      .select('avg_salary, sector');

    if (error) throw error;
    if (!careers || careers.length === 0) {
      return res.json({ total: 0, avgSalary: 0, topSector: 'None' });
    }

    const total = careers.length;
    const avgSalary = careers.reduce((acc, c) => acc + c.avg_salary, 0) / total;
    
    // Simple frequency count for top sector
    const sectors = careers.reduce((acc: any, c) => {
      acc[c.sector] = (acc[c.sector] || 0) + 1;
      return acc;
    }, {});
    const topSector = Object.keys(sectors).sort((a, b) => sectors[b] - sectors[a])[0];

    res.json({ total, avgSalary, topSector });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
 Simon
