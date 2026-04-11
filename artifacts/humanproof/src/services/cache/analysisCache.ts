// analysisCache.ts
// Dual-layer cache: localStorage (24h) → Supabase (7-day TTL)
// Table required: layoff_analysis_cache (id UUID, key TEXT UNIQUE, data JSONB, created_at TIMESTAMPTZ)

import { supabase } from '../../utils/supabase';

const LOCAL_TTL_MS  = 1000 * 60 * 60 * 24;      // 24 hours
const REMOTE_TTL_MS = 1000 * 60 * 60 * 24 * 7;  // 7 days

// BUG-09 FIX: strip heavy swarm visualization data before caching to prevent
// localStorage quota overflow (~80KB → ~5KB per entry)
const slimForCache = (value: any): any => {
  if (!value) return value;
  const slim = { ...value };
  if (slim.swarmReport) {
    slim.swarmReport = {
      swarmRiskScore:    slim.swarmReport.swarmRiskScore,
      swarmConfidence:   slim.swarmReport.swarmConfidence,
      categoryBreakdown: slim.swarmReport.categoryBreakdown,
      liveAgentsUsed:    slim.swarmReport.liveAgentsUsed,
      totalAgentsRun:    slim.swarmReport.totalAgentsRun,
      generatedAt:       slim.swarmReport.generatedAt,
      anomalies:         slim.swarmReport.anomalies?.slice(0, 3) ?? [],
      dominantSignals:   slim.swarmReport.dominantSignals?.slice(0, 3).map((s: any) => ({
        agentId: s.agentId, signal: s.signal, category: s.category,
      })) ?? [],
      // Omit visualizationGraph (nodes array) and full agent metadata
    };
  }
  return slim;
};

export const getCachedAnalysis = async (key: string): Promise<any | null> => {
  // ── Layer 1: localStorage (instant, per-device) ──
  try {
    const raw = localStorage.getItem(`hp_ensemble_${key}`);
    if (raw) {
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < LOCAL_TTL_MS) {
        console.log('[Cache] HIT localStorage:', key);
        return data;
      }
    }
  } catch {
    // ignore parse errors
  }

  // ── Layer 2: Supabase (shared across devices) ──
  try {
    const { data } = await supabase
      .from('layoff_analysis_cache')
      .select('data, created_at')
      .eq('key', key)
      .single();

    if (data && (Date.now() - new Date(data.created_at).getTime()) < REMOTE_TTL_MS) {
      console.log('[Cache] HIT Supabase:', key);
      // Promote to localStorage for faster next access
      try {
        localStorage.setItem(
          `hp_ensemble_${key}`,
          JSON.stringify({ data: data.data, timestamp: Date.now() })
        );
      } catch { /* storage full */ }
      return data.data;
    }
  } catch {
    // Supabase unavailable — continue
  }

  console.log('[Cache] MISS:', key);
  return null;
};

export const setCachedAnalysis = async (key: string, value: any): Promise<void> => {
  const slim = slimForCache(value); // BUG-09 FIX: strip heavy data before storing

  // Save to localStorage immediately (synchronous)
  try {
    localStorage.setItem(
      `hp_ensemble_${key}`,
      JSON.stringify({ data: slim, timestamp: Date.now() })
    );
  } catch {
    // localStorage full — skip silently
  }

  // Save to Supabase async — don't block the UI
  supabase
    .from('layoff_analysis_cache')
    .upsert({ key, data: slim, created_at: new Date().toISOString() }, { onConflict: 'key' })
    .then(({ error }) => {
      if (error) console.warn('[Cache] Supabase upsert failed:', error.message);
      else console.log('[Cache] Saved to Supabase:', key);
    });
};
