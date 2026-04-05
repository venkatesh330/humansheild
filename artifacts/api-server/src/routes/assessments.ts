import { Router, type IRouter } from "express";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@workspace/db";
import { assessments, shareEntries } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
// import { requireAuth } from "../middlewares/auth"; // Will uncomment once full auth enforcement verified

const router: IRouter = Router();

// Zod validation schemas
const createAssessmentSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  type: z.enum(['job', 'skill', 'human-index']),
  score: z.number().min(0).max(100),
  metadata: z.record(z.any()).optional().default({}),
});

// POST /api/assessments - Save assessment
router.post("/", async (req: any, res: any) => {
  try {
    const parsed = createAssessmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    
    // In strict auth mode, we'd ensure req.userId === parsed.data.userId
    
    if (!db) {
       return res.status(503).json({ error: "Database not connected" });
    }

    const newId = crypto.randomUUID();
    const result = await db.insert(assessments).values({
      id: newId,
      userId: parsed.data.userId,
      type: parsed.data.type,
      score: parsed.data.score,
      metadata: parsed.data.metadata,
      createdAt: new Date(),
    }).returning();

    return res.json({
       ...result[0],
       createdAt: result[0].createdAt.getTime(),
    });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Failed to save assessment", details: e.message });
  }
});

// GET /api/assessments/:userId - Get user's assessments
router.get("/:userId", async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });

    const userAssessments = await db.select()
      .from(assessments)
      .where(eq(assessments.userId, userId));
      
    const mapped = userAssessments.map(a => ({
        ...a,
        createdAt: a.createdAt.getTime()
    }));
      
    return res.json(mapped);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// POST /api/assessments/:id/export - Export assessment as JSON/PDF
router.post("/:id/export", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });

    const records = await db.select().from(assessments).where(eq(assessments.id, id));
    if (records.length === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    
    const assessment = records[0];
    return res.json({
      assessment,
      exportUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(assessment)).toString('base64')}`,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to export" });
  }
});

// POST /api/assessments/:id/share - Generate shareable link
router.post("/:id/share", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });

    const records = await db.select().from(assessments).where(eq(assessments.id, id));
    if (records.length === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    
    const shareCode = crypto.randomUUID().substring(0, 8).toUpperCase();
    await db.insert(shareEntries).values({
      code: shareCode,
      assessmentId: id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return res.json({
      shareCode,
      shareUrl: `${process.env.BASE_URL || 'http://localhost:5173'}/share/${shareCode}`,
      expiresIn: '7d',
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to generate share link" });
  }
});

// GET /api/assessments/share/:code - Resolve a share code back to an assessment
router.get("/share/:code", async (req: any, res: any) => {
  try {
    const { code } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });

    const shares = await db.select().from(shareEntries).where(eq(shareEntries.code, code.toUpperCase()));
    if (shares.length === 0) {
      return res.status(404).json({ error: "Share link not found or expired" });
    }
    
    const entry = shares[0];
    if (Date.now() > entry.expiresAt.getTime()) {
      return res.status(410).json({ error: "Share link has expired" });
    }
    
    const assessmentRecords = await db.select().from(assessments).where(eq(assessments.id, entry.assessmentId));
    if (assessmentRecords.length === 0) {
      return res.status(404).json({ error: "Assessment no longer exists" });
    }
    
    return res.json({ assessment: assessmentRecords[0], expiresAt: entry.expiresAt.toISOString() });
  } catch (e) {
    return res.status(500).json({ error: "Failed to resolve share link" });
  }
});

// DELETE /api/assessments/:id - Delete assessment
router.delete("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });

    // Ensure we delete share entries first to satisfy foreign key constraints
    await db.delete(shareEntries).where(eq(shareEntries.assessmentId, id));
    await db.delete(assessments).where(eq(assessments.id, id));
    
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
