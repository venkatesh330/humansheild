// apiRateLimiter.ts
// Prevents burning free-tier API quotas.
// Limits: OpenRouter 180/hr, Groq 500/hr, Gemini 900/hr

type ApiName = 'openrouter' | 'groq' | 'gemini';

interface LimitConfig {
  maxPerHour: number;
  storageKey: string;
}

const LIMITS: Record<ApiName, LimitConfig> = {
  openrouter: { maxPerHour: 180,  storageKey: 'hp_rl_openrouter' },  // free: 200 req/day
  groq:       { maxPerHour: 500,  storageKey: 'hp_rl_groq' },        // free: 14,400/day
  gemini:     { maxPerHour: 900,  storageKey: 'hp_rl_gemini' },      // free: 1M tokens/day
};

interface RateRecord {
  count: number;
  hourStart: number;
}

/**
 * Returns true if the API call is allowed, false if rate limit has been reached.
 * Always call this before making any AI agent request.
 */
export const checkRateLimit = (api: ApiName): boolean => {
  const limit = LIMITS[api];
  const hourMs = 60 * 60 * 1000;
  const now = Date.now();

  let record: RateRecord = { count: 0, hourStart: now };
  try {
    const stored = localStorage.getItem(limit.storageKey);
    if (stored) record = JSON.parse(stored);
  } catch { /* ignore */ }

  // Reset counter if new hour window
  if (now - record.hourStart > hourMs) {
    record = { count: 1, hourStart: now };
    try { localStorage.setItem(limit.storageKey, JSON.stringify(record)); } catch { /* ignore */ }
    return true;
  }

  if (record.count >= limit.maxPerHour) {
    console.warn(`[RateLimit] ${api} blocked: ${record.count}/${limit.maxPerHour} this hour`);
    return false;
  }

  record.count++;
  try { localStorage.setItem(limit.storageKey, JSON.stringify(record)); } catch { /* ignore */ }
  return true;
};

/**
 * Returns stats for debugging / admin panels.
 */
export const getRateLimitStatus = (): Record<ApiName, { used: number; limit: number; resetIn: string }> => {
  const hourMs = 60 * 60 * 1000;
  const now = Date.now();
  const result: any = {};

  for (const [api, cfg] of Object.entries(LIMITS) as [ApiName, LimitConfig][]) {
    let record: RateRecord = { count: 0, hourStart: now };
    try {
      const stored = localStorage.getItem(cfg.storageKey);
      if (stored) record = JSON.parse(stored);
    } catch { /* ignore */ }

    const msSinceReset = now - record.hourStart;
    const resetIn = Math.max(0, hourMs - msSinceReset);
    const mins = Math.ceil(resetIn / 60000);

    result[api] = {
      used: record.count,
      limit: cfg.maxPerHour,
      resetIn: `${mins}m`,
    };
  }
  return result;
};
