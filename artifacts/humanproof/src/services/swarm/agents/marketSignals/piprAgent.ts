// piprAgent.ts
// Market Signal — Public Interest / Press mentions via NewsAPI sentiment.
// LIVE: NewsAPI.org (100 req/day free) with heuristic fallback.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const NEWSAPI_BASE = 'https://newsapi.org/v2/everything';

const NEGATIVE_KEYWORDS = ['layoff', 'fired', 'bankrupt', 'debt', 'loss', 'decline', 'cut', 'crisis', 'restructur', 'downsize'];
const POSITIVE_KEYWORDS = ['growth', 'profit', 'expansion', 'hiring', 'record', 'milestone', 'invest'];

const heuristicPIPR = (input: SwarmInput): number => {
  // Fall back to layoff history as proxy for negative press
  const layoffs = input.companyData.layoffsLast24Months ?? [];
  if (layoffs.length >= 3) return 0.75;
  if (layoffs.length === 2) return 0.58;
  if (layoffs.length === 1) return 0.42;
  return 0.25;
};

const scoreSentiment = (articles: any[]): number => {
  if (articles.length === 0) return 0.30;
  let negCount = 0;
  let posCount = 0;
  for (const a of articles) {
    const text = `${a.title ?? ''} ${a.description ?? ''}`.toLowerCase();
    NEGATIVE_KEYWORDS.forEach(kw => { if (text.includes(kw)) negCount++; });
    POSITIVE_KEYWORDS.forEach(kw => { if (text.includes(kw)) posCount++; });
  }
  const total = negCount + posCount;
  if (total === 0) return 0.30;
  const negRatio = negCount / total;
  // Map neg sentiment ratio to risk signal
  if (negRatio > 0.75) return 0.88;
  if (negRatio > 0.55) return 0.70;
  if (negRatio > 0.40) return 0.52;
  if (negRatio > 0.25) return 0.38;
  return 0.20;
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const apiKey = (import.meta as any).env?.VITE_NEWSAPI_KEY;

  if (apiKey) {
    try {
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const url  = `${NEWSAPI_BASE}?q=${encodeURIComponent(input.companyName)}&from=${from}&language=en&sortBy=relevancy&pageSize=20&apiKey=${apiKey}`;
      const res  = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const json = await res.json();
      if (json.status === 'ok') {
        const signal = scoreSentiment(json.articles ?? []);
        return {
          agentId:    'piprAgent',
          category:   'market',
          signal,
          confidence: 0.72,
          sourceType: 'live-api',
          ageInDays:  0,
          metadata:   { articles: json.totalResults, windowDays: 30 },
        };
      }
    } catch (e: any) {
      console.warn('[piprAgent] API failed:', e.message);
    }
  }

  const signal = heuristicPIPR(input);
  return {
    agentId:    'piprAgent',
    category:   'market',
    signal,
    confidence: 0.40,
    sourceType: 'heuristic',
    ageInDays:  7,
    metadata:   { fallback: true },
  };
};

export const piprAgent: AgentFn = { id: 'piprAgent', run };
