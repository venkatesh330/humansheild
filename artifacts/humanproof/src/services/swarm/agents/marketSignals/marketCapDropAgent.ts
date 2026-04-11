// marketCapDropAgent.ts
// Market Signal — Market cap delta vs sector benchmark (52-week high comparison).
// LIVE: Alpha Vantage OVERVIEW endpoint with heuristic fallback.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const ALPHA_BASE = 'https://www.alphavantage.co/query';

const heuristicMarketCap = (input: SwarmInput): number => {
  const change = input.companyData.stock90DayChange ?? 0;
  // Use 90-day stock change as market cap proxy
  if (change < -40) return 0.95;
  if (change < -25) return 0.78;
  if (change < -15) return 0.60;
  if (change < -5)  return 0.42;
  if (change < 0)   return 0.32;
  return 0.20;
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const apiKey = (import.meta as any).env?.VITE_ALPHAVANTAGE_KEY;

  if (apiKey && input.companyData.isPublic) {
    try {
      const ticker = input.companyData.stockTicker ?? input.companyData.ticker ?? input.companyName.toUpperCase().slice(0, 4);
      const url    = `${ALPHA_BASE}?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
      const res    = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const json   = await res.json();
      const high52  = parseFloat(json['52WeekHigh']  ?? '0');
      const low52   = parseFloat(json['52WeekLow']   ?? '0');
      const current = parseFloat(json['50DayMovingAverage'] ?? '0');
      if (high52 > 0 && current > 0) {
        const dropFromHigh = ((high52 - current) / high52) * 100;
        const rangeSize    = high52 - low52;
        const inRange      = rangeSize > 0 ? (current - low52) / rangeSize : 0.5;
        // Closer to 52w low = higher risk
        const signal = Math.max(0.05, Math.min(0.95, (1 - inRange) * 0.7 + (dropFromHigh / 100) * 0.3));
        return {
          agentId:    'marketCapDropAgent',
          category:   'market',
          signal,
          confidence: 0.80,
          sourceType: 'live-api',
          ageInDays:  0,
          metadata:   { high52, low52, current, dropFromHighPct: dropFromHigh.toFixed(1) },
        };
      }
    } catch (e: any) {
      console.warn('[marketCapDropAgent] API failed:', e.message);
    }
  }

  const signal = heuristicMarketCap(input);
  return {
    agentId:    'marketCapDropAgent',
    category:   'market',
    signal,
    confidence: input.companyData.isPublic ? 0.50 : 0.30,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { fallback: true },
  };
};

export const marketCapDropAgent: AgentFn = { id: 'marketCapDropAgent', run };
