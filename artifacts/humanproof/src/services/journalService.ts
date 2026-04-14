// PHASE-1: Frontend Service Layer
// File: artifacts/humanproof/src/services/journalService.ts
// Human Edge Journal - Cloud sync service

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { JournalEntry } from "../components/HumanEdgeJournal";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[JournalService] Supabase not configured - using localStorage only",
    );
    return null;
  }
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};

export interface JournalStats {
  tags: { tag_name: string; usage_count: number }[];
  streak: {
    current_streak: number;
    longest_streak: number;
    total_entries: number;
  };
  totalEntries: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  error?: string;
}

class JournalService {
  private userId: string | null = null;
  private syncInProgress = false;
  private lastSyncHash: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  isConfigured(): boolean {
    return !!getSupabase();
  }

  // Load entries from cloud
  async loadEntries(): Promise<JournalEntry[]> {
    const client = getSupabase();
    if (!client || !this.userId) {
      return [];
    }

    try {
      const { data, error } = await client
        .from("journal_entries")
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        console.error("[JournalService] Load error:", error);
        return [];
      }

      return this.mapFromDb(data || []);
    } catch (error) {
      console.error("[JournalService] Load error:", error);
      return [];
    }
  }

  // Create a new entry in cloud
  async saveEntry(
    entry: Omit<JournalEntry, "id">,
  ): Promise<JournalEntry | null> {
    const client = getSupabase();
    if (!client || !this.userId) {
      return null;
    }

    try {
      const { data, error } = await client
        .from("journal_entries")
        .insert(this.mapToDb(entry))
        .select()
        .single();

      if (error) {
        console.error("[JournalService] Save error:", error);
        return null;
      }

      return this.mapFromDb([data])[0];
    } catch (error) {
      console.error("[JournalService] Save error:", error);
      return null;
    }
  }

  // Update an existing entry
  async updateEntry(
    id: string,
    updates: Partial<JournalEntry>,
  ): Promise<JournalEntry | null> {
    const client = getSupabase();
    if (!client || !this.userId) {
      return null;
    }

    try {
      const { data, error } = await client
        .from("journal_entries")
        .update(this.mapToDb(updates))
        .eq("id", id)
        .eq("user_id", this.userId)
        .select()
        .single();

      if (error) {
        console.error("[JournalService] Update error:", error);
        return null;
      }

      return this.mapFromDb([data])[0];
    } catch (error) {
      console.error("[JournalService] Update error:", error);
      return null;
    }
  }

  // Delete an entry
  async deleteEntry(id: string): Promise<boolean> {
    const client = getSupabase();
    if (!client || !this.userId) {
      return false;
    }

    try {
      const { error } = await client
        .from("journal_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", this.userId);

      if (error) {
        console.error("[JournalService] Delete error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[JournalService] Delete error:", error);
      return false;
    }
  }

  // Get stats (tags, streaks)
  async getStats(): Promise<JournalStats | null> {
    const client = getSupabase();
    if (!client || !this.userId) {
      return null;
    }

    try {
      const { data: tagStats } = await client.rpc("get_journal_tag_stats", {
        p_user_id: this.userId,
      });

      const { data: streakData } = await client.rpc("get_journal_streak", {
        p_user_id: this.userId,
      });

      const { count } = await client
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", this.userId);

      return {
        tags: tagStats || [],
        streak: streakData?.[0] || {
          current_streak: 0,
          longest_streak: 0,
          total_entries: 0,
        },
        totalEntries: count || 0,
      };
    } catch (error) {
      console.error("[JournalService] Stats error:", error);
      return null;
    }
  }

  // Sync local entries to cloud
  async syncFromLocal(entries: JournalEntry[]): Promise<SyncResult> {
    if (this.syncInProgress || !this.userId) {
      return { success: false, synced: 0 };
    }

    const client = getSupabase();
    if (!client) {
      return { success: false, synced: 0 };
    }

    // Check if anything changed
    const currentHash = JSON.stringify(entries.map((e) => e.id).sort());
    if (currentHash === this.lastSyncHash) {
      return { success: true, synced: 0 };
    }

    this.syncInProgress = true;

    try {
      const operations = entries.map((entry) => ({
        id: entry.id,
        user_id: this.userId,
        dimension: entry.dimension,
        title: entry.title,
        body: entry.body,
        tags: entry.tags,
        human_score: entry.humanScore,
        job_risk_score: entry.jobRiskScore,
        skill_risk_score: entry.skillRiskScore,
        assessment_date: entry.assessmentDate,
        linked_course_id: entry.linkedCourseId,
        linked_roadmap_item_id: entry.linkedRoadmapItemId,
      }));

      const { data, error } = await client
        .from("journal_entries")
        .upsert(operations, { onConflict: "id,user_id" })
        .select();

      if (error) {
        console.error("[JournalService] Sync error:", error);
        return { success: false, synced: 0, error: error.message };
      }

      this.lastSyncHash = currentHash;
      return { success: true, synced: data?.length || 0 };
    } catch (error) {
      console.error("[JournalService] Sync error:", error);
      return { success: false, synced: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Rename tag across all entries
  async renameTag(oldTag: string, newTag: string): Promise<number> {
    const client = getSupabase();
    if (!client || !this.userId) {
      return 0;
    }

    try {
      const { data, error } = await client.rpc("rename_journal_tag", {
        p_user_id: this.userId,
        p_old_tag: oldTag,
        p_new_tag: newTag,
      });

      if (error) {
        console.error("[JournalService] Tag rename error:", error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error("[JournalService] Tag rename error:", error);
      return 0;
    }
  }

  // Map database record to JournalEntry
  private mapFromDb(data: any[]): JournalEntry[] {
    return data.map((row) => ({
      id: row.id,
      date: row.created_at?.split("T")[0] || row.date,
      createdAt: row.created_at,
      dimension: row.dimension,
      title: row.title,
      body: row.body,
      tags: row.tags || [],
      humanScore: row.human_score,
      jobRiskScore: row.job_risk_score,
      skillRiskScore: row.skill_risk_score,
      assessmentDate: row.assessment_date,
      linkedCourseId: row.linked_course_id,
      linkedRoadmapItemId: row.linked_roadmap_item_id,
    }));
  }

  // Map JournalEntry to database format
  private mapToDb(entry: any): any {
    return {
      id: entry.id,
      dimension: entry.dimension,
      title: entry.title,
      body: entry.body,
      tags: entry.tags,
      human_score: entry.humanScore,
      job_risk_score: entry.jobRiskScore,
      skill_risk_score: entry.skillRiskScore,
      assessment_date: entry.assessmentDate,
      linked_course_id: entry.linkedCourseId,
      linked_roadmap_item_id: entry.linkedRoadmapItemId,
    };
  }
}

export const journalService = new JournalService();
