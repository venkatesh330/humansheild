const API_BASE = '/api';
import { supabase } from './supabase';

const getHeaders = async () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
};
interface Assessment {
  id: string;
  userId: string;
  type: 'job' | 'skill' | 'human-index';
  score: number;
  metadata: Record<string, any>;
  createdAt: number;
}

export const assessmentAPI = {
  async saveAssessment(userId: string, type: 'job' | 'skill' | 'human-index', score: number, metadata: Record<string, any>) {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ userId, type, score, metadata }),
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to save assessment:', e);
      return null;
    }
  },

  async getAssessments(userId: string): Promise<Assessment[]> {
    try {
      const res = await fetch(`${API_BASE}/assessments/${userId}`, {
        headers: await getHeaders()
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch assessments:', e);
      return [];
    }
  },

  async exportAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}/export`, { 
        method: 'POST',
        headers: await getHeaders()
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to export assessment:', e);
      return null;
    }
  },

  async shareAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}/share`, { 
        method: 'POST',
        headers: await getHeaders()
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to share assessment:', e);
      return null;
    }
  },

  async deleteAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}`, { 
        method: 'DELETE',
        headers: await getHeaders()
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to delete assessment:', e);
      return null;
    }
  },
};

export const digestAPI = {
  async subscribe(email: string) {
    try {
      const res = await fetch(`${API_BASE}/digest/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to subscribe:', e);
      return null;
    }
  },

  async unsubscribe(email: string) {
    try {
      const res = await fetch(`${API_BASE}/digest/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to unsubscribe:', e);
      return null;
    }
  },

  async checkStatus(email: string) {
    try {
      const res = await fetch(`${API_BASE}/digest/status/${email}`);
      return await res.json();
    } catch (e) {
      console.error('Failed to check status:', e);
      return null;
    }
  },
};
