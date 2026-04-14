import { Router, type IRouter, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
};

router.get(
  "/progress/:roleKey",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { roleKey } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("roadmap_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("role_key", roleKey)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return res.json(data || null);
    } catch (err: any) {
      console.error("Error fetching roadmap progress:", err);
      return res.status(500).json({ error: err.message });
    }
  },
);

router.post("/progress", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { role_key, completed_courses, completed_milestones, current_phase } =
      req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!role_key) {
      return res.status(400).json({ error: "role_key is required" });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("roadmap_progress")
      .upsert(
        {
          user_id: userId,
          role_key,
          completed_courses: completed_courses || [],
          completed_milestones: completed_milestones || [],
          course_completion_dates: {},
          milestone_completion_dates: {},
          current_phase: current_phase || 1,
        },
        {
          onConflict: "user_id,role_key",
        },
      )
      .select()
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (err: any) {
    console.error("Error saving roadmap progress:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.patch(
  "/progress/:roleKey",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { roleKey } = req.params;
      const userId = (req as any).user?.id;
      const { completed_courses, completed_milestones, current_phase } =
        req.body;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const supabase = getSupabaseAdmin();
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (completed_courses !== undefined)
        updates.completed_courses = completed_courses;
      if (completed_milestones !== undefined)
        updates.completed_milestones = completed_milestones;
      if (current_phase !== undefined) updates.current_phase = current_phase;

      const { data, error } = await supabase
        .from("roadmap_progress")
        .update(updates)
        .eq("user_id", userId)
        .eq("role_key", roleKey)
        .select()
        .single();

      if (error) throw error;

      return res.json(data);
    } catch (err: any) {
      console.error("Error updating roadmap progress:", err);
      return res.status(500).json({ error: err.message });
    }
  },
);

router.delete(
  "/progress/:roleKey",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { roleKey } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("roadmap_progress")
        .delete()
        .eq("user_id", userId)
        .eq("role_key", roleKey);

      if (error) throw error;

      return res.status(204).send();
    } catch (err: any) {
      console.error("Error deleting roadmap progress:", err);
      return res.status(500).json({ error: err.message });
    }
  },
);

export default router;
