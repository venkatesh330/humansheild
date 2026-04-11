// recentLayoffAgent.ts
// Company Signal — Real layoff news detection (past 14 days).
// LIVE: NewsAPI.org with heuristic fallback from companyData layoff history.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const NEWSAPI_BASE = 'https://newsapi.org/v2/everything';
const LAYOFF_TERMS = ['layoff', 'laid off', 'job cuts', 'workforce reduction', 'restructuring', 'retrenchment', 'redundancies'];

const heuristicLayoff = (input: SwarmInput): number => {
  const layoffs = input.companyData.layoffsLast24Months ?? [];
  if (layoffs.length === 0) return 0.08;
  const sorted  = [...layoffs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const mAgo    = (Date.now() - new Date(sorted[0].date).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (mAgo < 3)  return 0.92;
  if (mAgo < 6)  return 0.75;
  if (mAgo < 12) return 0.55;
  if (mAgo < 18) return 0.35;
  return 0.20;
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const apiKey = (import.meta as any).env?.VITE_NEWSAPI_KEY;

  if (apiKey) {
    try {
      const from  = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const query = `${input.companyName} (${LAYOFF_TERMS.slice(0,4).join(' OR ')})`;
      const url   = `${NEWSAPI_BASE}?q=${encodeURIComponent(query)}&from=${from}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
      const res   = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const json  = await res.json();

      if (json.status === 'ok') {
        const count = json.totalResults ?? 0;
        // More recent articles about layoffs = higher signal
        let signal: number;
        if (count >= 10) signal = 0.95;
        else if (count >= 5) signal = 0.82;
        else if (count >= 2) signal = 0.65;
        else if (count === 1) signal = 0.50;
        else signal = 0.10;

        return {
          agentId:    'recentLayoffAgent',
          category:   'company',
          signal,
          confidence: 0.88,
          sourceType: 'live-api',
          ageInDays:  0,
          metadata:   { articlesFound: count, windowDays: 14 },
        };
      }
    } catch (e: any) {
      console.warn('[recentLayoffAgent] API failed:', e.message);
    }
  }

  const signal = heuristicLayoff(input);
  return {
    agentId:    'recentLayoffAgent',
    category:   'company',
    signal,
    confidence: 0.65,
    sourceType: 'heuristic',
    ageInDays:  7,
    metadata:   { fallback: true },
  };
};

export const recentLayoffAgent: AgentFn = { id: 'recentLayoffAgent', run };
