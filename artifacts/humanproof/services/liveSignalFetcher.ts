// liveSignalFetcher.ts
// Fetches real-time market data from authoritative APIs.
// Caches results in live_signals_v2 table for consensus engine.

import { createClient } from "../lib/supabase";

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";
const NEWSAPI_BASE = "https://newsapi.org/v2/everything";

export interface FetchedSignal {
  signalType: string;
  signalValue: number; // 0–1 normalized
  rawValue: string | number; // original API value
  unit: string;
  sourceName: string;
  sourceUrl?: string;
  signalTimestamp: string; // when the event occurred
  fetchedAt: string;
  confidence: number;
  decayRate: number;
  evidence?: string[]; // article URLs, etc.
}

/**
 * Fetch all live signals for a given company ticker or name.
 * Populates live_signals_v2 table (idempotent upsert).
 */
export async function fetchCompanyLiveSignals(
  companyName: string,
  ticker?: string,
): Promise<FetchedSignal[]> {
  const signals: FetchedSignal[] = [];
  const supabase = createClient();

  // ── 1. Stock data via Alpha Vantage (if public + ticker known) ──────────
  if (ticker) {
    const apiKey = import.meta.env.VITE_ALPHAVANTAGE_KEY;
    if (apiKey) {
      try {
        // Daily time series (last 90 days)
        const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${apiKey}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
        const json = await res.json();

        if (json["Time Series (Daily)"]) {
          const closes = Object.values(json["Time Series (Daily)"])
            .slice(0, 90)
            .map((d: any) => parseFloat(d["4. close"]));

          if (closes.length >= 90) {
            // Compute 90-day return: (today - 90days ago) / 90d-ago
            const today = closes[0];
            const ago90 = closes[89];
            const pctChange = (today - ago90) / ago90;

            signals.push({
              signalType: "stock90DayChange",
              signalValue: normalizeStockReturn(pctChange),
              rawValue: (pctChange * 100).toFixed(2) + "%",
              unit: "percent_return",
              sourceName: "alpha_vantage",
              sourceUrl: `https://www.alphavantage.co/query?symbol=${ticker}`,
              signalTimestamp: Object.keys(json["Time Series (Daily)"])[0]
                ? new Date().toISOString()
                : new Date().toISOString(),
              fetchedAt: new Date().toISOString(),
              confidence: 0.92,
              decayRate: 0.1, // half-life ~7d
              evidence: [],
            });

            // Also compute volatility from daily log returns
            const returns = closes
              .slice(1)
              .map((p, i) => Math.log(p / closes[i]));
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance =
              returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
              returns.length;
            const stdDev = Math.sqrt(variance);
            const annualizedVol = stdDev * Math.sqrt(252);
            signals.push({
              signalType: "stockVolatility",
              signalValue: Math.min(1, annualizedVol / 0.6), // 60% vol = 0.95 risk
              rawValue: (annualizedVol * 100).toFixed(1) + "%",
              unit: "annualized_volatility",
              sourceName: "alpha_vantage",
              sourceUrl: "",
              signalTimestamp: new Date().toISOString(),
              fetchedAt: new Date().toISOString(),
              confidence: 0.9,
              decayRate: 0.1,
              evidence: [],
            });
          }
        }
      } catch (e) {
        console.warn("[AlphaVantage] failed:", e);
      }
    }
  }

  // ── 2. Layoff news via NewsAPI ─────────────────────────────────────────
  const newsKey = import.meta.env.VITE_NEWSAPI_KEY;
  if (newsKey && companyName) {
    try {
      const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const query = `${companyName} (layoff OR "job cuts" OR "workforce reduction" OR restructuring)`;
      const url = `${NEWSAPI_BASE}?q=${encodeURIComponent(query)}&from=${from}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const json = await res.json();

      if (json.status === "ok" && json.totalResults > 0) {
        const articles = json.articles;
        // Signal strength: # articles + recency weighting
        let signalValue = 0;
        const evidence: string[] = [];
        for (const article of articles) {
          const ageDays =
            (Date.now() - new Date(article.publishedAt).getTime()) /
            (1000 * 60 * 60 * 24);
          const weight = Math.exp(-0.1 * ageDays); // decay over days
          signalValue += weight;
          evidence.push(article.url);
        }
        signalValue = Math.min(1, signalValue / 3); // normalize: 3+ recent articles = 1.0

        signals.push({
          signalType: "recentLayoffNews",
          signalValue,
          rawValue: articles.length.toString(),
          unit: "news_count_weighted",
          sourceName: "newsapi",
          sourceUrl: url,
          signalTimestamp: articles[0].publishedAt,
          fetchedAt: new Date().toISOString(),
          confidence: 0.85,
          decayRate: 0.05, // half-life 14d
          evidence,
        });
      }
    } catch (e) {
      console.warn("[NewsAPI] failed:", e);
    }
  }

  // ── 3. Persist to live_signals_v2 (upsert by company + type) ─────────────
  for (const signal of signals) {
    await supabase.from("live_signals_v2").upsert(
      {
        company_name: companyName,
        signal_type: signal.signalType,
        signal_value: signal.signalValue,
        raw_value: signal.rawValue,
        unit: signal.unit,
        source_name: signal.sourceName,
        source_url: signal.sourceUrl,
        signal_timestamp: signal.signalTimestamp,
        fetched_at: signal.fetchedAt,
        confidence: signal.confidence,
        decay_rate: signal.decayRate,
        evidence: signal.evidence,
      },
      {
        onConflict: "company_name, signal_type, signal_timestamp", // natural key
      },
    );
  }

  return signals;
}

// ── Normalization helpers ─────────────────────────────────────────────────

function normalizeStockReturn(pct: number): number {
  // Convert % return to risk score: negative = higher risk, positive = lower risk
  // Using logistic transformation for smooth non-linear mapping
  // -30% crash → ~0.83 risk, +20% rally → ~0.34 risk, 0% → 0.5
  return 1 / (1 + Math.exp(pct * 5));
}

// Exported for use in API routes
export { fetchCompanyLiveSignals as default };
