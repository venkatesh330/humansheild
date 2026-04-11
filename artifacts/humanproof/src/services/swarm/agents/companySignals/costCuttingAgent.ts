// costCuttingAgent.ts
// Company Signal — Real cost-cutting and hiring freeze language in news.
// LIVE: NewsAPI.org search for cost-cut language with heuristic fallback.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const NEWSAPI_BASE = 'https://newsapi.org/v2/everything';
const COST_TERMS   = ['hiring freeze', 'cost cut', 'belt tighten', 'spending cut', 'budget cut', 'axe', 'slash costs'];

const heuristicCostCut = (input: SwarmInput): number => {
  const cd = input.companyData;
  // Infer cost-cutting pressure from revenue decline and layoff patterns
  const revenueDecline = (cd.revenueGrowthYoY ?? 0) < -5;
  const hasLayoffs     = (cd.layoffsLast24Months?.length ?? 0) > 0;
  const stockDrop      = (cd.stock90DayChange ?? 0) < -15;

  const signals = [revenueDecline, hasLayoffs, stockDrop].filter(Boolean).length;
  if (signals >= 3) return 0.85;
  if (signals === 2) return 0.65;
  if (signals === 1) return 0.42;
  return 0.20;
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const apiKey = (import.meta as any).env?.VITE_NEWSAPI_KEY;

  if (apiKey) {
    try {
      const from  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const query = `"${input.companyName}" (${COST_TERMS.slice(0, 4).join(' OR ')})`;
      const url   = `${NEWSAPI_BASE}?q=${encodeURIComponent(query)}&from=${from}&language=en&pageSize=10&apiKey=${apiKey}`;
      const res   = await fetch(url);
      const json  = await res.json();

      if (json.status === 'ok') {
        const count = json.totalResults ?? 0;
        let signal: number;
        if (count >= 5)      signal = 0.90;
        else if (count >= 3) signal = 0.72;
        else if (count >= 1) signal = 0.52;
        else                 signal = 0.15;

        return {
          agentId:    'costCuttingAgent',
          category:   'company',
          signal,
          confidence: 0.78,
          sourceType: 'live-api',
          ageInDays:  0,
          metadata:   { articlesFound: count, windowDays: 30 },
        };
      }
    } catch (e: any) {
      console.warn('[costCuttingAgent] API failed:', e.message);
    }
  }

  const signal = heuristicCostCut(input);
  return {
    agentId:    'costCuttingAgent',
    category:   'company',
    signal,
    confidence: 0.55,
    sourceType: 'heuristic',
    ageInDays:  7,
    metadata:   { fallback: true },
  };
};

export const costCuttingAgent: AgentFn = { id: 'costCuttingAgent', run };
