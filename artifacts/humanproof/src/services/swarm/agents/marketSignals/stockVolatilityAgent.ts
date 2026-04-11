// stockVolatilityAgent.ts
// Market Signal — 90-day stock price volatility index.
// LIVE: Alpha Vantage TIME_SERIES_DAILY (60 req/min free) with heuristic fallback.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

const ALPHA_BASE = 'https://www.alphavantage.co/query';

const heuristicVolatility = (input: SwarmInput): number => {
  const cd = input.companyData;
  // Use stock90DayChange from companyData as proxy for volatility
  const change = cd.stock90DayChange ?? 0;
  if (Math.abs(change) > 30) return 0.90;
  if (Math.abs(change) > 20) return 0.75;
  if (Math.abs(change) > 10) return 0.55;
  if (Math.abs(change) > 5)  return 0.38;
  return 0.25;
};

const calcVolatilityFromPrices = (closes: number[]): number => {
  if (closes.length < 10) return 0.50;
  const returns = closes.slice(1).map((p, i) => Math.log(p / closes[i]));
  const mean    = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev  = Math.sqrt(variance);
  const annualised = stdDev * Math.sqrt(252);
  // Map annualised volatility (0–60%+) to risk signal
  if (annualised > 0.60) return 0.95;
  if (annualised > 0.45) return 0.80;
  if (annualised > 0.30) return 0.62;
  if (annualised > 0.20) return 0.42;
  if (annualised > 0.12) return 0.25;
  return 0.12;
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const apiKey = (import.meta as any).env?.VITE_ALPHAVANTAGE_KEY;

  // ── Live API path ──────────────────────────────────────────────────────────
  if (apiKey && input.companyData.isPublic) {
    try {
      const ticker = input.companyData.stockTicker ?? input.companyData.ticker ?? input.companyName.toUpperCase().slice(0, 4);
      const url    = `${ALPHA_BASE}?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${apiKey}`;
      const res    = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const json   = await res.json();
      const series = json['Time Series (Daily)'];
      if (series) {
        const closes = Object.values(series)
          .slice(0, 90)
          .map((d: any) => parseFloat(d['4. close']));
        const signal = calcVolatilityFromPrices(closes);
        return {
          agentId:    'stockVolatilityAgent',
          category:   'market',
          signal,
          confidence: 0.87,
          sourceType: 'live-api',
          ageInDays:  0,
          metadata:   { ticker, dataPoints: closes.length, source: 'AlphaVantage' },
        };
      }
    } catch (e: any) {
      console.warn('[stockVolatilityAgent] API failed, falling back to heuristic:', e.message);
    }
  }

  // ── Heuristic fallback ─────────────────────────────────────────────────────
  const signal = heuristicVolatility(input);
  return {
    agentId:    'stockVolatilityAgent',
    category:   'market',
    signal,
    confidence: input.companyData.isPublic ? 0.55 : 0.35,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { usedField: 'stock90DayChange', fallback: true },
  };
};

export const stockVolatilityAgent: AgentFn = { id: 'stockVolatilityAgent', run };
