const API_BASE = "/api";
import { supabase } from "./supabase";

const getHeaders = async () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
};
interface Assessment {
  id: string;
  userId: string;
  type: "job" | "skill" | "human-index";
  score: number;
  metadata: Record<string, any>;
  createdAt: number;
}

export const assessmentAPI = {
  // BUG-C6 FIX: was hitting /api/assessments/:userId (404) — endpoint is just /api/assessments
  async getAssessments(): Promise<Assessment[]> {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        headers: await getHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch assessments:", e);
      return [];
    }
  },

  // Save assessment from context (named differently to avoid confusion)
  async saveAssessmentData(
    industry: string,
    workType: string,
    country: string,
    score: number,
    details: Record<string, any>,
  ) {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({ industry, workType, country, score, details }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Failed to save assessment:", e);
      return null;
    }
  },

  // Legacy overload kept for backward compat
  async saveAssessment(
    userId: string,
    type: "job" | "skill" | "human-index",
    score: number,
    metadata: Record<string, any>,
  ) {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({ userId, type, score, metadata }),
      });
      return await res.json();
    } catch (e) {
      console.error("Failed to save assessment:", e);
      return null;
    }
  },

  async exportAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}/export`, {
        method: "POST",
        headers: await getHeaders(),
      });
      return await res.json();
    } catch (e) {
      console.error("Failed to export assessment:", e);
      return null;
    }
  },

  async shareAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}/share`, {
        method: "POST",
        headers: await getHeaders(),
      });
      return await res.json();
    } catch (e) {
      console.error("Failed to share assessment:", e);
      return null;
    }
  },

  // BUG-C7 FIX: HTTP 204 No Content — cannot call .json() on empty body
  async deleteAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}`, {
        method: "DELETE",
        headers: await getHeaders(),
      });
      if (res.status === 204) return { success: true };
      return await res.json();
    } catch (e) {
      console.error("Failed to delete assessment:", e);
      return null;
    }
  },
};

export const digestAPI = {
  async subscribe(email: string) {
    try {
      const res = await fetch(`${API_BASE}/digest/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (e) {
      console.error("Failed to subscribe:", e);
      return null;
    }
  },

  async unsubscribe(email: string) {
    try {
      const res = await fetch(`${API_BASE}/digest/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (e) {
      console.error("Failed to unsubscribe:", e);
      return null;
    }
  },

  async checkStatus(email: string) {
    try {
      const res = await fetch(`${API_BASE}/digest/status/${email}`);
      return await res.json();
    } catch (e) {
      console.error("Failed to check status:", e);
      return null;
    }
  },
};

export interface RoadmapProgressData {
  user_id?: string;
  role_key: string;
  completed_courses: string[];
  completed_milestones: string[];
  course_completion_dates?: Record<string, string>;
  milestone_completion_dates?: Record<string, string>;
  current_phase?: number;
}

export const roadmapAPI = {
  async getProgress(roleKey: string): Promise<RoadmapProgressData | null> {
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${API_BASE}/roadmap/progress/${encodeURIComponent(roleKey)}`,
        {
          headers,
        },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch roadmap progress:", e);
      return null;
    }
  },

  async saveProgress(
    progress: RoadmapProgressData,
  ): Promise<RoadmapProgressData | null> {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_BASE}/roadmap/progress`, {
        method: "POST",
        headers,
        body: JSON.stringify(progress),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Failed to save roadmap progress:", e);
      return null;
    }
  },

  async updateProgress(
    roleKey: string,
    updates: Partial<{
      completed_courses: string[];
      completed_milestones: string[];
      current_phase: number;
    }>,
  ): Promise<RoadmapProgressData | null> {
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${API_BASE}/roadmap/progress/${encodeURIComponent(roleKey)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(updates),
        },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Failed to update roadmap progress:", e);
      return null;
    }
  },

  async deleteProgress(roleKey: string): Promise<boolean> {
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${API_BASE}/roadmap/progress/${encodeURIComponent(roleKey)}`,
        {
          method: "DELETE",
          headers,
        },
      );
      return res.ok;
    } catch (e) {
      console.error("Failed to delete roadmap progress:", e);
      return false;
    }
  },

  async syncFromCloud(roleKey: string): Promise<RoadmapProgressData | null> {
    const cloudData = await this.getProgress(roleKey);
    if (!cloudData) return null;

    const localData = localStorage.getItem("hp_roadmap_progress");
    if (!localData) return cloudData;

    try {
      const local = JSON.parse(localData);
      const merged = {
        completed_courses: [
          ...new Set([
            ...cloudData.completed_courses,
            ...local.completedCourses,
          ]),
        ],
        completed_milestones: [
          ...new Set([
            ...cloudData.completed_milestones,
            ...local.completedMilestones,
          ]),
        ],
      };

      await this.updateProgress(roleKey, merged);
      return { ...cloudData, ...merged };
    } catch {
      return cloudData;
    }
  },
};
