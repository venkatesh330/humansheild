// PHASE-1: Backend API Routes
// File: artifacts/api-server/src/routes/journal.ts
// Human Edge Journal - Cloud sync endpoints

import { Router, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// Initialize Supabase client (reuse from config)
const supabaseUrl =
  process.env.SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get user ID from headers
const getUserId = (req: Request): string | null => {
  return (req.headers["x-user-id"] as string) || null;
};

// GET /api/journal - List user entries
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID required" });
    }

    const { limit = 100, offset = 0, dimension, search } = req.query;

    let query = supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (dimension) {
      query = query.eq("dimension", dimension);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Journal] Fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      entries: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error("[Journal] Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/journal/stats - Get tag stats and streaks
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID required" });
    }

    // Get tag stats
    const { data: tagStats } = await supabase.rpc("get_journal_tag_stats", {
      p_user_id: userId,
    });

    // Get streak data
    const { data: streakData } = await supabase.rpc("get_journal_streak", {
      p_user_id: userId,
    });

    // Get total entries count
    const { count } = await supabase
      .from("journal_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    res.json({
      tags: tagStats || [],
      streak: streakData?.[0] || {
        current_streak: 0,
        longest_streak: 0,
        total_entries: 0,
      },
      totalEntries: count || 0,
    });
  } catch (error) {
    console.error("[Journal] Stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/journal - Create new entry
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID required" });
    }

    const {
      dimension,
      title,
      body,
      tags,
      scores,
      linkedCourseId,
      linkedRoadmapItemId,
    } = req.body;

    // Validate required fields
    if (!dimension || !title || !body) {
      return res
        .status(400)
        .json({ error: "Missing required fields: dimension, title, body" });
    }

    const validDimensions = [
      "empathic",
      "moral",
      "creative",
      "physical",
      "social",
      "contextual",
    ];
    if (!validDimensions.includes(dimension)) {
      return res.status(400).json({ error: "Invalid dimension" });
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        dimension,
        title: title.slice(0, 200),
        body: body.slice(0, 10000),
        tags: (tags || []).slice(0, 10),
        human_score: scores?.human ?? null,
        job_risk_score: scores?.job ?? null,
        skill_risk_score: scores?.skill ?? null,
        assessment_date: scores?.date || null,
        linked_course_id: linkedCourseId || null,
        linked_roadmap_item_id: linkedRoadmapItemId || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[Journal] Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ entry: data });
  } catch (error) {
    console.error("[Journal] Create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/journal/:id - Update entry
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID required" });
    }

    const { id } = req.params;
    const { dimension, title, body, tags } = req.body;

    // First check ownership
    const { data: existing } = await supabase
      .from("journal_entries")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ error: "Entry not found" });
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .update({
        dimension,
        title: title?.slice(0, 200),
        body: body?.slice(0, 10000),
        tags: tags?.slice(0, 10),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[Journal] Update error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ entry: data });
  } catch (error) {
    console.error("[Journal] Update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/journal/:id - Delete entry
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID required" });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[Journal] Delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[Journal] Delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/journal/sync - Bulk sync from localStorage
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID required" });
    }

    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "Invalid entries array" });
    }

    // Prepare entries for upsert
    const operations = entries.map((entry: any) => ({
      id: entry.id || undefined, // Will generate new UUID if not provided
      user_id: userId,
      dimension: entry.dimension,
      title: entry.title,
      body: entry.body,
      tags: entry.tags || [],
      human_score: entry.humanScore ?? null,
      job_risk_score: entry.jobRiskScore ?? null,
      skill_risk_score: entry.skillRiskScore ?? null,
      assessment_date: entry.assessmentDate || null,
      linked_course_id: entry.linkedCourseId || null,
      linked_roadmap_item_id: entry.linkedRoadmapItemId || null,
    }));

    const { data, error } = await supabase
      .from("journal_entries")
      .upsert(operations, { onConflict: "id,user_id" })
      .select();

    if (error) {
      console.error("[Journal] Sync error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      synced: data?.length || 0,
    });
  } catch (error) {
    console.error("[Journal] Sync error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/journal/tag/rename - Rename a tag across all entries
router.put("/tag/rename", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID required" });
    }

    const { oldTag, newTag } = req.body;

    if (!oldTag || !newTag) {
      return res.status(400).json({ error: "oldTag and newTag required" });
    }

    const { data, error } = await supabase.rpc("rename_journal_tag", {
      p_user_id: userId,
      p_old_tag: oldTag,
      p_new_tag: newTag,
    });

    if (error) {
      console.error("[Journal] Tag rename error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ updated: data });
  } catch (error) {
    console.error("[Journal] Tag rename error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
