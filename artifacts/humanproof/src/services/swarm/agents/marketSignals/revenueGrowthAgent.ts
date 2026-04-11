// revenueGrowthAgent.ts
// Market Signal — Year-over-year revenue growth trajectory.
// LIVE: Alpha Vantage INCOME_STATEMENT endpoint with heuristic fallback.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const ALPHA_BASE = 'https://www.alphavantage.co/query';

const heuristicRevenue = (input: SwarmInput): number => {
  const yoy = input.companyData.revenueGrowthYoY;
  if (yoy === null || yoy === undefined) return 0.50;
  if (yoy < -20) return 0.95;
  if (yoy < -10) return 0.82;
  if (yoy < 0)   return 0.65;
  if (yoy < 5)   return 0.50;
  if (yoy < 15)  return 0.32;
  if (yoy < 30)  return 0.18;
  return 0.10;
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const apiKey = (import.meta as any).env?.VITE_ALPHAVANTAGE_KEY;

  if (apiKey && input.companyData.isPublic) {
    try {
      const ticker = input.companyData.stockTicker ?? input.companyData.ticker ?? input.companyName.toUpperCase().slice(0, 4);
      const url    = `${ALPHA_BASE}?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${apiKey}`;
      const res    = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const json   = await res.json();
      const reports: any[] = json.annualReports ?? [];
      if (reports.length >= 2) {
        const latest   = parseFloat(reports[0].totalRevenue ?? '0');
        const previous = parseFloat(reports[1].totalRevenue ?? '0');
        const yoyPct   = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
        const signal   = heuristicRevenue({ ...input, companyData: { ...input.companyData, revenueGrowthYoY: yoyPct } });
        return {
          agentId:    'revenueGrowthAgent',
          category:   'market',
          signal,
          confidence: 0.82,
          sourceType: 'live-api',
          ageInDays:  0,
          metadata:   { yoyPct: yoyPct.toFixed(1), latestRevenue: latest, ticker },
        };
      }
    } catch (e: any) {
      console.warn('[revenueGrowthAgent] API failed:', e.message);
    }
  }

  const signal = heuristicRevenue(input);
  return {
    agentId:    'revenueGrowthAgent',
    category:   'market',
    signal,
    confidence: input.companyData.revenueGrowthYoY !== null ? 0.65 : 0.35,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { yoy: input.companyData.revenueGrowthYoY, fallback: true },
  };
};

export const revenueGrowthAgent: AgentFn = { id: 'revenueGrowthAgent', run };
