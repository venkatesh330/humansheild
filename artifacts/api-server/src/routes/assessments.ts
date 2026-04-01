import { Router, type IRouter } from "express";
import { z } from "zod";
import crypto from "crypto";

const router: IRouter = Router();

// In-memory store (in production, use database)
interface Assessment {
  id: string;
  userId: string;
  type: 'job' | 'skill' | 'human-index';
  score: number;
  metadata: Record<string, any>;
  createdAt: number;
}

interface ShareEntry {
  code: string;
  assessmentId: string;
  createdAt: number;
  expiresAt: number;
}

const assessments: Assessment[] = [];
const shareEntries: ShareEntry[] = [];

// Zod validation schemas
const createAssessmentSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  type: z.enum(['job', 'skill', 'human-index']),
  score: z.number().min(0).max(100),
  metadata: z.record(z.any()).optional().default({}),
});

// POST /api/assessments - Save assessment
router.post("/", (req, res) => {
  try {
    const parsed = createAssessmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    const { userId, type, score, metadata } = parsed.data;
    // BUG 8 FIX: Use crypto.randomUUID() instead of Date.now() to prevent ID collisions
    const assessment: Assessment = {
      id: crypto.randomUUID(),
      userId,
      type,
      score,
      metadata,
      createdAt: Date.now(),
    };
    assessments.push(assessment);
    res.json(assessment);
  } catch (e) {
    res.status(500).json({ error: "Failed to save assessment" });
  }
});

// GET /api/assessments/:userId - Get user's assessments
router.get("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const userAssessments = assessments.filter(a => a.userId === userId);
    res.json(userAssessments);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// POST /api/assessments/:id/export - Export assessment as JSON/PDF
router.post("/:id/export", (req, res) => {
  try {
    const { id } = req.params;
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.json({
      assessment,
      exportUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(assessment)).toString('base64')}`,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to export" });
  }
});

// POST /api/assessments/:id/share - Generate shareable link
// BUG 1 FIX: Share codes are now stored and can be resolved via GET /share/:code
router.post("/:id/share", (req, res) => {
  try {
    const { id } = req.params;
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    const shareCode = crypto.randomUUID().substring(0, 8).toUpperCase();
    const shareEntry: ShareEntry = {
      code: shareCode,
      assessmentId: id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    shareEntries.push(shareEntry);
    res.json({
      shareCode,
      shareUrl: `${process.env.BASE_URL || 'http://localhost:5173'}/share/${shareCode}`,
      expiresIn: '7d',
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate share link" });
  }
});

// GET /api/assessments/share/:code - Resolve a share code back to an assessment
router.get("/share/:code", (req, res) => {
  try {
    const { code } = req.params;
    const entry = shareEntries.find(s => s.code === code.toUpperCase());
    if (!entry) {
      return res.status(404).json({ error: "Share link not found or expired" });
    }
    if (Date.now() > entry.expiresAt) {
      return res.status(410).json({ error: "Share link has expired" });
    }
    const assessment = assessments.find(a => a.id === entry.assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment no longer exists" });
    }
    res.json({ assessment, expiresAt: new Date(entry.expiresAt).toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Failed to resolve share link" });
  }
});

// DELETE /api/assessments/:id - Delete assessment
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const idx = assessments.findIndex(a => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    assessments.splice(idx, 1);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
