const API_BASE = '/api';

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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/assessments/${userId}`);
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch assessments:', e);
      return [];
    }
  },

  async exportAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}/export`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      console.error('Failed to export assessment:', e);
      return null;
    }
  },

  async shareAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}/share`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      console.error('Failed to share assessment:', e);
      return null;
    }
  },

  async deleteAssessment(id: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}`, { method: 'DELETE' });
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
