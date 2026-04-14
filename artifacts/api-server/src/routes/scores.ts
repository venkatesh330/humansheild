// PHASE-2: Backend API Routes
// File: artifacts/api-server/src/routes/scores.ts
// Score History - Cloud sync endpoints

import { Router, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl =
  process.env.SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const getUserId = (req: Request): string | null =>
  (req.headers["x-user-id"] as string) || null;

// GET /api/scores/history - Get user's score history
router.get("/history", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { limit = 200 } = req.query;
    const { data, error } = await supabase
      .from("score_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    if (error) return res.status(500).json({ error: error.message });
    res.json({ entries: data || [], total: data?.length || 0 });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/scores/latest - Get latest score by source
router.get("/latest", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { source } = req.query;
    const sources = ["job", "skill", "human-index"];
    if (source && !sources.includes(source as string)) {
      return res.status(400).json({ error: "Invalid source" });
    }

    const query = supabase
      .from("score_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (source) query.eq("source", source);
    else {
      const { data: latest } = await query.limit(3);
      res.json({ entries: latest || [] });
      return;
    }

    const { data, error } = await query.limit(1).single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ entry: data });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/scores/trend - Get trend analysis
router.get("/trend", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { source, days = 30 } = req.query;
    const { data, error } = await supabase.rpc("get_score_trend", {
      p_user_id: userId,
      p_source: (source as string) || "job",
      p_days: Number(days),
    });

    if (error) return res.status(500).json({ error: error.message });
    res.json({
      trend: data?.[0] || { change: 0, direction: "stable", pct_change: 0 },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/scores/sync - Sync scores from localStorage
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "Invalid entries" });
    }

    const ops = entries.map((e: any) => ({
      user_id: userId,
      source: e.source,
      score: e.score,
      plot_score: e.plotScore,
      data_version: e.dataVersion,
      app_version: e.appVersion,
    }));

    const { data, error } = await supabase
      .from("score_history")
      .upsert(ops, { onConflict: "id,user_id" })
      .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, synced: data?.length || 0 });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/scores - Clear all scores for user
router.delete("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { error } = await supabase
      .from("score_history")
      .delete()
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
