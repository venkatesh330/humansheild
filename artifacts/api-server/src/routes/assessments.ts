import { Router, type IRouter } from "express";
import { z } from "zod";

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

const assessments: Assessment[] = [];

// POST /api/assessments - Save assessment
router.post("/", (req, res) => {
  try {
    const { userId, type, score, metadata } = req.body;
    if (!userId || !type || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const assessment: Assessment = {
      id: `${type}-${Date.now()}`,
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
router.post("/:id/share", (req, res) => {
  try {
    const { id } = req.params;
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    const shareCode = Math.random().toString(36).substring(2, 8);
    res.json({
      shareCode,
      shareUrl: `${process.env.BASE_URL || 'https://humanproof.ai'}/share/${shareCode}`,
      expiresIn: '7d',
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate share link" });
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
