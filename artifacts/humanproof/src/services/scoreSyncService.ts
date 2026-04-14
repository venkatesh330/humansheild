// Unified Score Service - Cloud Sync
// Coordinates between localStorage and Supabase

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabase) supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
};

export interface ScoreSyncEntry {
  id?: string;
  user_id?: string;
  source: "job" | "skill" | "human-index" | "layoff";
  score: number;
  plot_score: number;
  data_version: string;
  app_version: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

class ScoreSyncService {
  private userId: string | null = null;
  private syncInProgress = false;

  setUserId(userId: string) {
    this.userId = userId;
  }

  isConfigured(): boolean {
    return !!getSupabase();
  }

  async syncFromLocal(
    entries: ScoreSyncEntry[],
  ): Promise<{ success: boolean; synced: number }> {
    const client = getSupabase();
    if (!client || !this.userId || this.syncInProgress)
      return { success: false, synced: 0 };

    this.syncInProgress = true;
    try {
      const ops = entries.map((e) => ({
        ...e,
        user_id: this.userId,
        created_at: e.created_at || new Date().toISOString(),
      }));

      const { data, error } = await client
        .from("score_history")
        .upsert(ops, { onConflict: "id,user_id" })
        .select();

      return { success: !error, synced: data?.length || 0 };
    } catch {
      return { success: false, synced: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  async loadFromCloud(): Promise<ScoreSyncEntry[]> {
    const client = getSupabase();
    if (!client || !this.userId) return [];

    const { data } = await client
      .from("score_history")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false })
      .limit(200);

    return (data || []).map((row) => ({
      id: row.id,
      source: row.source,
      score: row.score,
      plot_score: row.plot_score,
      data_version: row.data_version,
      app_version: row.app_version,
      created_at: row.created_at,
    }));
  }

  async saveToCloud(entry: ScoreSyncEntry): Promise<boolean> {
    const client = getSupabase();
    if (!client || !this.userId) return false;

    const { error } = await client
      .from("score_history")
      .insert({ ...entry, user_id: this.userId });

    return !error;
  }
}

export const scoreSyncService = new ScoreSyncService();
