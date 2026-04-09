// ════════════════════════════════════════════════════════════════
// learning.ts — REST API for free learning resources
// BUG-C4 FIX: Was using Supabase JS client with wrong table name
// 'learning_resources'. The actual DB table is 'free_resources'
// via Drizzle ORM. Rewritten to match resources.ts pattern.
// ════════════════════════════════════════════════════════════════
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { freeResources, userResourceProgress } from "@workspace/db/schema";
import { and, asc, desc, eq, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

const getUserId = (req: any) => req.headers["x-user-id"] || null;

/**
 * GET /api/learning/resources
 * Query params: q, dimension, level, language, roleKey, isFree, limit, offset
 */
router.get("/resources", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });

    const {
      q,
      dimension,
      level,
      language,
      roleKey,
      isFree,
      limit = "12",
      offset = "0",
    } = req.query as Record<string, string>;

    const parsedLimit = Math.min(40, Math.max(1, parseInt(limit, 10) || 12));
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

    const conditions: any[] = [];

    if (level)    conditions.push(eq(freeResources.level, level as "beginner" | "intermediate" | "advanced"));
    if (language) conditions.push(eq(freeResources.language, language));
    if (isFree)   conditions.push(eq(freeResources.isFree, isFree as "yes" | "audit" | "scholarship"));

    if (dimension) {
      conditions.push(
        sql`(${freeResources.targetDimension} = ${dimension} OR ${freeResources.targetDimension} = 'general')`
      );
    }

    if (roleKey) {
      // Drizzle arrayContains for Postgres array column
      conditions.push(
        sql`${freeResources.targetRoleKeys} @> ARRAY[${roleKey}]::text[]`
      );
    }

    if (q) {
      const term = `%${q.toLowerCase()}%`;
      conditions.push(
        sql`(lower(${freeResources.title}) like ${term} OR lower(${freeResources.provider}) like ${term})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(freeResources)
      .where(whereClause)
      .orderBy(asc(freeResources.level))
      .limit(parsedLimit)
      .offset(parsedOffset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(freeResources)
      .where(whereClause);

    return res.json({
      data: results,
      pagination: {
        total: Number(count),
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedOffset + parsedLimit < Number(count),
      },
    });
  } catch (e: any) {
    console.error("[learning/resources]", e);
    return res.status(500).json({ error: "Failed to fetch resources", details: e.message });
  }
});

/**
 * GET /api/learning/progress
 * Returns real persisted progress for authenticated user
 */
router.get("/progress", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const progress = await db
      .select()
      .from(userResourceProgress)
      .where(eq(userResourceProgress.userId, userId));

    return res.json({ data: progress });
  } catch (e: any) {
    console.error("[learning/progress]", e);
    return res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/learning/resources/:id/progress
 * Upserts progress status for a resource
 */
router.post("/resources/:id/progress", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { status, isBookmarked } = req.body;

    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (isBookmarked !== undefined) updates.isBookmarked = isBookmarked;
    if (status === "completed") updates.completedAt = sql`now()`;

    const existing = await db
      .select()
      .from(userResourceProgress)
      .where(
        and(
          eq(userResourceProgress.userId, userId),
          eq(userResourceProgress.resourceId, id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(userResourceProgress)
        .set(updates)
        .where(eq(userResourceProgress.id, existing[0].id))
        .returning();
      return res.json({ data: updated[0] });
    } else {
      const inserted = await db
        .insert(userResourceProgress)
        .values({
          userId,
          resourceId: id,
          status: updates.status ?? "not_started",
          isBookmarked: updates.isBookmarked ?? false,
        })
        .returning();
      return res.json({ data: inserted[0] });
    }
  } catch (e: any) {
    console.error("[learning/progress/upsert]", e);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
