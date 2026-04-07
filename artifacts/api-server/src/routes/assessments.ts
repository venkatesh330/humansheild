<<<<<<< HEAD
import { Router, type IRouter } from "express";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@workspace/db";
import { assessments, shareEntries } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
=======
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middlewares/auth';
>>>>>>> audit-fixes-2026-04-07

const router = Router();

// Secure: Apply requireAuth globally to all assessment routes
router.use(requireAuth);

// Get user assessments (Secure: Only returns assessments owned by the logged-in user)
router.get('/', async (req: any, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

<<<<<<< HEAD
// POST /api/assessments - Save assessment (requires auth)
router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = createAssessmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    
    // SECURITY FIX: Enforce that the JWT userId matches the requested userId
    // This prevents IDOR — users cannot save assessments on behalf of others
    if (req.userId !== parsed.data.userId) {
      return res.status(403).json({ error: "Forbidden: userId mismatch with authenticated user" });
    }
    
    if (!db) {
       return res.status(503).json({ error: "Database not connected" });
    }
=======
// Create assessment
router.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const { industry, workType, country, score, details } = req.body;
  
  const { data, error } = await supabase
    .from('assessments')
    .insert([{ user_id: userId, industry, work_type: workType, country, score, details }])
    .select()
    .single();
>>>>>>> audit-fixes-2026-04-07

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

<<<<<<< HEAD
// GET /api/assessments/:userId - Get user's assessments (requires auth)
router.get("/:userId", requireAuth, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });
    
    // SECURITY FIX: Users can only read their own assessments
    if (req.userId !== userId) {
      return res.status(403).json({ error: "Forbidden: cannot access another user's assessments" });
    }
=======
// Delete assessment (Secure: Verifies ownership before deletion)
router.delete('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
>>>>>>> audit-fixes-2026-04-07

  const { data, error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId) // Ownership check
    .select();

  if (error) return res.status(500).json({ error: error.message });
  if (data.length === 0) return res.status(403).json({ error: 'Not authorized or not found' });
  
  res.status(204).end();
});

<<<<<<< HEAD
// POST /api/assessments/:id/export - Export assessment (requires auth)
router.post("/:id/export", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });
=======
// Share assessment (Mock implementation)
router.post('/:id/share', async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
>>>>>>> audit-fixes-2026-04-07

  // Verify ownership before allowing share link generation
  const { data, error } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

<<<<<<< HEAD
// POST /api/assessments/:id/share - Generate shareable link (requires auth)
router.post("/:id/share", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });

    const records = await db.select().from(assessments).where(eq(assessments.id, id));
    if (records.length === 0) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    
    // SECURITY FIX: Confirm ownership before sharing
    if (records[0].userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden: you don't own this assessment" });
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

// DELETE /api/assessments/:id - Delete assessment (requires auth + ownership)
router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!db) return res.status(503).json({ error: "DB not connected" });

    // SECURITY FIX: Verify ownership before deletion
    const records = await db.select().from(assessments).where(eq(assessments.id, id));
    if (records.length === 0) return res.status(404).json({ error: "Assessment not found" });
    if (records[0].userId !== req.userId) {
      return res.status(403).json({ error: "Forbidden: you don't own this assessment" });
    }

    // Delete share entries first to satisfy FK constraints
    await db.delete(shareEntries).where(eq(shareEntries.assessmentId, id));
    await db.delete(assessments).where(eq(assessments.id, id));
    
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete" });
  }
=======
  if (error || !data) return res.status(404).json({ error: 'Assessment not found or unauthorized' });

  res.json({ shareUrl: `https://humanproof.ai/share/${id}` });
>>>>>>> audit-fixes-2026-04-07
});

export default router;
