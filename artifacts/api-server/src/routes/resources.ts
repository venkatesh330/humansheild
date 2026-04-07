import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { freeResources } from "@workspace/db/schema";
import { and, asc, eq, sql, inArray, arrayContains } from "drizzle-orm";
import { userResourceProgress } from "@workspace/db/schema";

const router: IRouter = Router();

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
];

/**
 * GET /api/resources
 * Query params:
 *   roleKey      — filter by exact role key match in target_role_keys array
 *   dimension    — 'D1' | 'D2' | 'D3' | 'D6' | 'general'
 *   riskLevel    — 'critical' | 'high' | 'moderate' | 'all'
 *   language     — ISO 639-1 code (en, es, fr, de, zh, hi, pt, ar)
 *   level        — 'beginner' | 'intermediate' | 'advanced'
 *   isFree       — 'yes' | 'audit' | 'scholarship' (default: all)
 *   q            — search in title, provider, tags
 *   limit        — number (default: 12, max: 40)
 *   offset       — number (default: 0)
 */
router.get("/", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" });

    const {
      roleKey,
      dimension,
      riskLevel,
      language,
      level,
      isFree,
      q,
      limit = "12",
      offset = "0",
    } = req.query as Record<string, string>;

    const parsedLimit  = Math.min(40, Math.max(1, parseInt(limit, 10) || 12));
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

    const conditions: any[] = [];

    if (language) conditions.push(eq(freeResources.language, language));
    if (level)    conditions.push(eq(freeResources.level, level as "beginner" | "intermediate" | "advanced"));
    if (isFree)   conditions.push(eq(freeResources.isFree, isFree as "yes" | "audit" | "scholarship"));

    // Filter dimension (D1/D2/D3/D6/general)
    if (dimension) {
      conditions.push(
        sql`(${freeResources.targetDimension} = ${dimension} OR ${freeResources.targetDimension} = 'general')`
      );
    }

    // Filter by risk level (critical resources appear for all risk levels)
    if (riskLevel && riskLevel !== "all") {
      const riskOrder: Record<string, string[]> = {
        critical: ["critical", "all"],
        high:     ["critical", "high", "all"],
        moderate: ["critical", "high", "moderate", "all"],
      };
      const allowed = riskOrder[riskLevel] ?? ["all"];
      conditions.push(inArray(freeResources.riskLevelTarget, allowed));
    }

    // Filter by role key: check if roleKey is in the target_role_keys array
    if (roleKey) {
      conditions.push(arrayContains(freeResources.targetRoleKeys, [roleKey]));
    }

    // Free-text search
    if (q) {
      const term = `%${q.toLowerCase()}%`;
      conditions.push(
        sql`(lower(${freeResources.title}) like ${term} OR lower(${freeResources.provider}) like ${term} OR EXISTS (SELECT 1 FROM unnest(${freeResources.tags}::text[]) tag WHERE lower(tag) like ${term}))`
      );
    }

    const results = await db
      .select()
      .from(freeResources)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(freeResources.level))
      .limit(parsedLimit)
      .offset(parsedOffset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(freeResources)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return res.json({
      data: results,
      pagination: {
        total: Number(count),
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedOffset + parsedLimit < Number(count),
      },
      supportedLanguages: SUPPORTED_LANGUAGES,
    });
  } catch (e: any) {
    console.error("[resources]", e);
    return res.status(500).json({ error: "Failed to fetch resources", details: e.message });
  }
});

/**
 * GET /api/resources/languages
 * Returns all languages available in the database (for filter chips)
 */
router.get("/languages", async (_req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const rows = await db
      .selectDistinct({ code: freeResources.language, label: freeResources.languageLabel })
      .from(freeResources)
      .orderBy(asc(freeResources.languageLabel));
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Middleware to extract user
const getUserId = (req: any) => req.headers['x-user-id'] || null;

/**
 * GET /api/resources/progress
 * Fetch progress for authenticated user
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
    return res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/resources/:id/progress
 */
router.post("/:id/progress", async (req: any, res: any) => {
  try {
    if (!db) return res.status(503).json({ error: "DB not connected" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const { id } = req.params;
    const { status, isBookmarked } = req.body;
    
    // allow partial updates
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (isBookmarked !== undefined) updates.isBookmarked = isBookmarked;
    if (status === 'completed') updates.completedAt = sql`now()`;

    const existing = await db
      .select()
      .from(userResourceProgress)
      .where(and(eq(userResourceProgress.userId, userId), eq(userResourceProgress.resourceId, id)))
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
          status: updates.status || 'not_started',
          isBookmarked: updates.isBookmarked || false,
        })
        .returning();
      return res.json({ data: inserted[0] });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
