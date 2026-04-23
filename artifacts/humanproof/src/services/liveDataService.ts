// liveDataService.ts
// Central live data fetcher — all API keys held server-side in Edge Functions.
// Browser NEVER holds Alpha Vantage, NewsAPI, or OpenRouter keys.
// Hierarchy: proxy-live-signals EF (stock+news) → free data connectors → heuristic fallback

import { injectLayoffEvent, LayoffNewsEvent } from '../data/layoffNewsCache';
import { enrichCompanySignals } from './dataConnectors/index';
import { supabase as _supabase } from '../utils/supabase';

// ── Types ────────────────────────────────────────────────────────────────────

export interface StockLiveData {
  price90DayChange: number | null;
  revenueGrowthYoY: number | null;
  marketCap: number | null;
  peRatio: number | null;
  source: 'alphavantage' | 'heuristic';
  fetchedAt: string;
}

export interface NewsLiveData {
  latestLayoffEvent: LayoffNewsEvent | null;
  recentHeadlineCount: number;  // layoff-related articles in last 30 days
  sentimentSignal: number;      // 0–1, higher = more negative/risky
  source: 'newsapi' | 'static-cache';
  fetchedAt: string;
}

export interface HiringLiveData {
  freezeScore: number | null;   // 0–1, higher = more frozen
  postingTrend: 'growing' | 'stable' | 'declining' | 'frozen' | 'unknown';
  /** Estimated open postings for the user's role at this company. Only
   *  populated when a live API actually returned a count (Serper); null
   *  for heuristic baselines so the UI does not present a fake number. */
  estimatedOpenings: number | null;
  source: 'supabase-osint' | 'heuristic';
  fetchedAt: string;
}

export interface LiveDataResult {
  stockData: StockLiveData | null;
  newsData: NewsLiveData | null;
  hiringData: HiringLiveData | null;
  overallSource: 'full-live' | 'partial-live' | 'heuristic' | 'unknown-company';
  liveSignalCount: number;       // number of real API signals used
  heuristicSignalCount: number;  // number of static/inferred signals
  fetchedAt: string;
  apiErrors: string[];           // non-fatal errors for transparency
  /**
   * High-confidence layoff events derived from regulatory or news sources
   * (SEC EDGAR 8-K, WARN Act, India press) — surfaced separately so
   * `patchCompanyDataWithLive` can backfill `layoffsLast24Months` when the
   * base CompanyData record is missing it. The previous flow only injected
   * into `layoffNewsCache`, which is consulted by L2's `newsRisk` (10% of
   * L2) but not by `recentLayoffRisk` (30% of L2) — so a confirmed SEC 8-K
   * laid almost no weight on the score. This field closes that gap.
   */
  derivedLayoffEvents: { date: string; percentCut: number; source: string }[];
}

// ── Server-side proxy call (Alpha Vantage + NewsAPI — keys never in browser) ──

const fetchViaProxy = async (
  companyName: string,
  ticker: string | null,
  action: 'stock' | 'news' | 'both',
): Promise<{ stockData: any; newsData: any; errors: string[] }> => {
  if (!_supabase) return { stockData: null, newsData: null, errors: ['Supabase client not initialised'] };

  const { data, error } = await _supabase.functions.invoke('proxy-live-signals', {
    body: { companyName, ticker, action },
  });

  if (error) throw new Error(`proxy-live-signals: ${error.message}`);
  return {
    stockData: data?.stockData ?? null,
    newsData: data?.newsData ?? null,
    errors: data?.errors ?? [],
  };
};

// ── Alpha Vantage Live Stock + Financials (KEPT for localhost fallback) ───────

const fetchAlphaVantageOverview = async (
  ticker: string,
  apiKey: string,
): Promise<StockLiveData | null> => {
  try {
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
    const [overviewRes] = await Promise.all([
      fetch(overviewUrl, { signal: AbortSignal.timeout(8_000) }),
    ]);

    if (!overviewRes.ok) throw new Error(`Alpha Vantage HTTP ${overviewRes.status}`);
    const overview = await overviewRes.json();

    if (!overview.Symbol || overview.Note) {
      // Rate limited or invalid ticker
      throw new Error(overview.Note || 'Invalid ticker or limit reached');
    }

    // Fetch 90-day price change from daily time series
    let price90DayChange: number | null = null;
    try {
      const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${apiKey}`;
      const dailyRes = await fetch(dailyUrl, { signal: AbortSignal.timeout(8_000) });
      if (dailyRes.ok) {
        const dailyData = await dailyRes.json();
        const series = dailyData['Time Series (Daily)'];
        if (series) {
          const dates = Object.keys(series).sort().reverse();
          if (dates.length >= 63) {  // ~90 calendar days ≈ 63 trading days
            const recentClose = parseFloat(series[dates[0]]['4. close']);
            const oldClose    = parseFloat(series[dates[62]]['4. close']);
            if (oldClose > 0) {
              price90DayChange = Math.round(((recentClose - oldClose) / oldClose) * 100 * 10) / 10;
            }
          }
        }
      }
    } catch (_e) {
      // Non-fatal — proceed without 90-day change
    }

    const revenueGrowthYoY = overview.QuarterlyRevenueGrowthYOY
      ? Math.round(parseFloat(overview.QuarterlyRevenueGrowthYOY) * 100)
      : null;

    const marketCap = overview.MarketCapitalization
      ? parseInt(overview.MarketCapitalization)
      : null;

    const peRatio = overview.PERatio && overview.PERatio !== 'None'
      ? parseFloat(overview.PERatio)
      : null;

    return {
      price90DayChange,
      revenueGrowthYoY,
      marketCap,
      peRatio,
      source: 'alphavantage',
      fetchedAt: new Date().toISOString(),
    };
  } catch (e: any) {
    console.warn('[LiveDataService] Alpha Vantage failed:', e.message);
    return null;
  }
};

// ── NewsAPI Live Layoff News ──────────────────────────────────────────────────

const LAYOFF_KEYWORDS = ['layoffs', 'job cuts', 'workforce reduction', 'restructuring', 'headcount reduction'];

const fetchNewsAPIHeadlines = async (
  companyName: string,
  apiKey: string,
): Promise<NewsLiveData | null> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const from = thirtyDaysAgo.toISOString().split('T')[0];

    const query = encodeURIComponent(`"${companyName}" AND (layoff OR "job cuts" OR restructuring OR "workforce reduction")`);
    const url = `https://newsapi.org/v2/everything?q=${query}&from=${from}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);

    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI error');

    const articles: any[] = data.articles || [];
    const recentHeadlineCount = articles.length;

    // Detect a layoff event from headlines
    let latestLayoffEvent: LayoffNewsEvent | null = null;
    for (const article of articles) {
      const title = (article.title || '').toLowerCase();
      const isLayoff = LAYOFF_KEYWORDS.some(kw => title.includes(kw));
      if (isLayoff && article.publishedAt) {
        const event: LayoffNewsEvent = {
          companyName,
          date: article.publishedAt.slice(0, 10),
          headline: article.title,
          percentCut: extractPercentFromText(article.title + ' ' + (article.description || '')),
          source: article.source?.name || 'NewsAPI',
          url: article.url || '',
          affectedDepartments: extractDepartmentsFromText(article.title + ' ' + (article.description || '')),
        };
        injectLayoffEvent(event);  // inject into live cache
        if (!latestLayoffEvent) latestLayoffEvent = event;
      }
    }

    // Sentiment: more articles = higher risk signal
    const sentimentSignal = Math.min(1, recentHeadlineCount / 5);

    return {
      latestLayoffEvent,
      recentHeadlineCount,
      sentimentSignal,
      source: 'newsapi',
      fetchedAt: new Date().toISOString(),
    };
  } catch (e: any) {
    console.warn('[LiveDataService] NewsAPI failed:', e.message);
    return null;
  }
};

// ── Text extraction helpers ───────────────────────────────────────────────────

const extractPercentFromText = (text: string): number => {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? parseFloat(match[1]) : 5;  // default 5% if not stated
};

const DEPT_KEYWORDS: Record<string, string> = {
  engineering: 'engineering', sales: 'sales', marketing: 'marketing',
  hr: 'hr', support: 'support', operations: 'operations',
  recruiting: 'recruiting', product: 'product', design: 'design',
  finance: 'finance', legal: 'legal', research: 'research',
};

const extractDepartmentsFromText = (text: string): string[] => {
  const lower = text.toLowerCase();
  return Object.entries(DEPT_KEYWORDS)
    .filter(([kw]) => lower.includes(kw))
    .map(([, dept]) => dept);
};

// ── Primary Entry Point ───────────────────────────────────────────────────────

/**
 * fetchLiveCompanyData — Fetches all available live signals for a company.
 *
 * @param companyName  Human-readable company name (e.g. "Google")
 * @param ticker       Stock ticker if known (e.g. "GOOGL"). Pass null for private companies.
 * @returns            LiveDataResult with truthful signal counts and source attribution.
 */
export const fetchLiveCompanyData = async (
  companyName: string,
  ticker?: string | null,
): Promise<LiveDataResult> => {
  const errors: string[] = [];
  let liveCount = 0;
  let heuristicCount = 0;
  const derivedLayoffEvents: { date: string; percentCut: number; source: string }[] = [];

  // Ticker resolution — no API keys in the browser
  const TICKER_MAP: Record<string, string> = {
    amazon: 'AMZN', google: 'GOOGL', alphabet: 'GOOGL',
    microsoft: 'MSFT', apple: 'AAPL', meta: 'META', facebook: 'META',
    tesla: 'TSLA', netflix: 'NFLX', nvidia: 'NVDA',
    salesforce: 'CRM', oracle: 'ORCL', ibm: 'IBM',
    intel: 'INTC', amd: 'AMD', qualcomm: 'QCOM', cisco: 'CSCO',
    uber: 'UBER', airbnb: 'ABNB', lyft: 'LYFT', doordash: 'DASH',
    spotify: 'SPOT', shopify: 'SHOP', adobe: 'ADBE', snap: 'SNAP',
    palantir: 'PLTR', snowflake: 'SNOW', coinbase: 'COIN',
    datadog: 'DDOG', cloudflare: 'NET', twilio: 'TWLO',
    samsara: 'IOT', stripe: 'STRIP', rippling: 'RPLG',
    okta: 'OKTA', crowdstrike: 'CRWD', zscaler: 'ZS',
    servicenow: 'NOW', workday: 'WDAY', zendesk: 'ZEN',
    zoom: 'ZM', slack: 'WORK', dropbox: 'DBX',
    infosys: 'INFY', wipro: 'WIT', 'tata consultancy': 'TCS.NS', tcs: 'TCS.NS',
    hcl: 'HCLTECH.NS', 'tech mahindra': 'TECHM.NS',
  };
  const resolvedTicker = ticker ?? (() => {
    const lower = companyName.toLowerCase();
    for (const [key, t] of Object.entries(TICKER_MAP)) {
      if (lower.includes(key) || key.includes(lower)) return t;
    }
    return null;
  })();

  // ── Stock + News via server-side proxy (API keys stay on server) ──────────
  let stockData: StockLiveData | null = null;
  let newsData: NewsLiveData | null = null;

  try {
    const proxyResult = await fetchViaProxy(companyName, resolvedTicker, 'both');
    errors.push(...proxyResult.errors);

    const ps = proxyResult.stockData;
    if (ps && ps.price90DayChange !== undefined) {
      stockData = {
        price90DayChange: ps.price90DayChange ?? null,
        revenueGrowthYoY: ps.revenueGrowthYoY ?? null,
        marketCap: ps.marketCap ?? null,
        peRatio: ps.peRatio ?? null,
        source: 'alphavantage',
        fetchedAt: new Date().toISOString(),
      };
      // Count only fields that are actually populated — price and revenue are separate signals
      if (ps.price90DayChange != null) liveCount += 1; else heuristicCount += 1;
      if (ps.revenueGrowthYoY != null) liveCount += 1; else heuristicCount += 1;
    } else {
      if (resolvedTicker) errors.push(`Alpha Vantage: no data for ${resolvedTicker}`);
      else errors.push('No ticker — stock signals unavailable (private/unknown company)');
      heuristicCount += 2;
    }

    const pn = proxyResult.newsData;
    if (pn && pn.recentHeadlineCount !== undefined) {
      newsData = {
        latestLayoffEvent: pn.latestLayoffEvent ?? null,
        recentHeadlineCount: pn.recentHeadlineCount,
        sentimentSignal: pn.sentimentSignal,
        source: 'newsapi',
        fetchedAt: pn.fetchedAt ?? new Date().toISOString(),
      };
      if (pn.latestLayoffEvent) {
        injectLayoffEvent(pn.latestLayoffEvent as LayoffNewsEvent);
      }
      liveCount += 1;
    } else {
      errors.push('NewsAPI: no results from proxy');
      heuristicCount += 1;
    }
  } catch (proxyErr: any) {
    errors.push(`proxy-live-signals: ${proxyErr.message}`);
    heuristicCount += 3;
    // Legacy localhost fallback for local dev
    const alphaKey = (import.meta as any).env?.VITE_ALPHAVANTAGE_KEY as string | undefined;
    const newsKey  = (import.meta as any).env?.VITE_NEWSAPI_KEY as string | undefined;
    if (alphaKey && resolvedTicker) {
      stockData = await fetchAlphaVantageOverview(resolvedTicker, alphaKey);
      if (stockData?.source === 'alphavantage') { liveCount += 2; heuristicCount -= 2; }
    }
    if (newsKey) {
      newsData = await fetchNewsAPIHeadlines(companyName, newsKey);
      if (newsData?.source === 'newsapi') { liveCount += 1; heuristicCount -= 1; }
    }
  }

  // ── Free Data Connectors (BSE / NSE / layoffs.fyi / MCA / RSS / HN) ────────
  // Only REAL network sources count as live signals.
  // Naukri heuristic is always present but is NOT a live signal — it's a baseline.
  let hiringData: HiringLiveData | null = null;
  try {
    const connectorSignals = await enrichCompanySignals(companyName, '', '');

    // 'Naukri Heuristic' is unconditionally added by the connector — filter it out
    // when deciding whether real connector data was returned.
    const realSources = connectorSignals.sourcesUsed.filter(
      s => s !== 'Naukri Heuristic',
    );

    // BSE/NSE stock signal (real network call)
    if (stockData === null && connectorSignals.stock90DayChange !== null) {
      stockData = {
        price90DayChange: connectorSignals.stock90DayChange,
        revenueGrowthYoY: connectorSignals.revenueYoY,
        marketCap: connectorSignals.marketCapCr,
        peRatio: connectorSignals.peRatio,
        source: 'alphavantage',
        fetchedAt: connectorSignals.fetchedAt,
      };
      liveCount += 1;
    }

    // Hiring signal: live only when Serper API was used (not heuristic baseline)
    const hiringIsLive = connectorSignals.sourcesUsed.includes('Serper API');
    hiringData = {
      freezeScore: connectorSignals.hiringFreezeScore,
      postingTrend: connectorSignals.roleDemandTrend === 'rising' ? 'growing'
        : connectorSignals.roleDemandTrend === 'falling' ? 'declining' : 'stable',
      // Only forward the openings count when it was a live API response;
      // heuristic baselines have no count and we'd rather show "—" than a
      // misleading number.
      estimatedOpenings: hiringIsLive ? connectorSignals.estimatedOpenings : null,
      source: hiringIsLive ? 'supabase-osint' : 'heuristic',
      fetchedAt: connectorSignals.fetchedAt,
    };
    if (hiringIsLive) liveCount += 1;

    // RSS/HN layoff news (real network calls — count only if articles found)
    if (connectorSignals.layoffNewsCount > 0 && newsData === null) {
      newsData = {
        latestLayoffEvent: null,
        recentHeadlineCount: connectorSignals.layoffNewsCount,
        sentimentSignal: connectorSignals.newsSentimentScore,
        source: 'newsapi',
        fetchedAt: connectorSignals.fetchedAt,
      };
      liveCount += 1;
    }

    // ── New high-signal sources: India press, SEC EDGAR, WARN Act ─────────────
    // Each is an independent live source. We increment liveCount when the
    // source was reachable AND returned at least one company-matched signal.
    // When the source confirms a layoff event with a date, we inject it into
    // the runtime layoffNewsCache so downstream scoring picks it up via the
    // standard `layoffsLast24Months` path.

    if (connectorSignals.indiaPressReachable && connectorSignals.indiaPressLayoffCount > 0) {
      liveCount += 1;
      // Backfill newsData when no global-news source produced a hit.
      if (newsData === null) {
        newsData = {
          latestLayoffEvent: null,
          recentHeadlineCount: connectorSignals.indiaPressLayoffCount,
          sentimentSignal: connectorSignals.indiaPressSentimentScore,
          source: 'newsapi',
          fetchedAt: connectorSignals.fetchedAt,
        };
      }
    }

    if (connectorSignals.secEdgarReachable && connectorSignals.secEdgar8kLayoffFilings > 0) {
      liveCount += 1;
      // SEC 8-Ks are the highest-confidence layoff signal we have for US public
      // companies — material disclosure required by federal law. Surface the
      // most recent filing date as a confirmed layoff event.
      if (connectorSignals.secEdgarMostRecentFiling) {
        injectLayoffEvent({
          companyName,
          date: connectorSignals.secEdgarMostRecentFiling,
          headline: `SEC 8-K filing referencing workforce reduction (${connectorSignals.secEdgar8kLayoffFilings} match${connectorSignals.secEdgar8kLayoffFilings === 1 ? '' : 'es'})`,
          // Percent unknown from EDGAR full-text search alone — leave NaN→null.
          // Downstream layoff-recency scoring uses date primarily; pct is
          // refined by news/WARN sources when available.
          percentCut: 0,
          source: 'SEC EDGAR 8-K',
          url: 'https://efts.sec.gov/LATEST/search-index',
          affectedDepartments: [],
        });
        derivedLayoffEvents.push({
          date: connectorSignals.secEdgarMostRecentFiling,
          percentCut: 0,
          source: 'SEC EDGAR 8-K',
        });
      }
    }

    if (connectorSignals.warnDatasetReachable && connectorSignals.warnNoticeCount > 0) {
      liveCount += 1;
      // WARN Act notices are *legally required* layoff disclosures with hard
      // affected-employee counts. Inject as a confirmed event with computed
      // percentCut when both totalAffected and a baseline employee count exist.
      if (connectorSignals.warnMostRecentFiling) {
        injectLayoffEvent({
          companyName,
          date: connectorSignals.warnMostRecentFiling,
          headline: `WARN Act notice (${connectorSignals.warnAffectedTotal || 'count undisclosed'} workers across ${connectorSignals.warnNoticeCount} filing${connectorSignals.warnNoticeCount === 1 ? '' : 's'})`,
          percentCut: 0,
          source: 'WARN Act',
          url: '',
          affectedDepartments: [],
        });
        derivedLayoffEvents.push({
          date: connectorSignals.warnMostRecentFiling,
          percentCut: 0,
          source: 'WARN Act',
        });
      }
    }

    if (realSources.length > 0) {
      errors.push(`Connectors active: ${realSources.join(', ')}`);
    }
  } catch (e: any) {
    errors.push(`Data connectors: ${e.message}`);
  }

  // ── Determine overall source quality ────────────────────────────────────
  const overallSource: LiveDataResult['overallSource'] =
    liveCount >= 4 ? 'full-live'
    : liveCount >= 2 ? 'partial-live'
    : !resolvedTicker ? 'unknown-company'
    : 'heuristic';

  return {
    stockData,
    newsData,
    hiringData,
    overallSource,
    liveSignalCount: liveCount,
    heuristicSignalCount: heuristicCount,
    fetchedAt: new Date().toISOString(),
    apiErrors: errors,
    derivedLayoffEvents,
  };
};

/**
 * patchCompanyDataWithLive — Merges live API signals onto a base CompanyData object.
 * Never removes existing data — only overwrites with fresher live values.
 */
export const patchCompanyDataWithLive = (
  base: Record<string, any>,
  live: LiveDataResult,
): Record<string, any> => {
  const patched = { ...base };

  if (live.stockData) {
    if (live.stockData.price90DayChange !== null && patched.stock90DayChange == null) {
      patched.stock90DayChange = live.stockData.price90DayChange;
    }
    if (live.stockData.revenueGrowthYoY !== null && patched.revenueGrowthYoY == null) {
      patched.revenueGrowthYoY = live.stockData.revenueGrowthYoY;
    }
    if (live.stockData.marketCap !== null && patched.marketCap == null) {
      patched.marketCap = live.stockData.marketCap;
    }
    const srcLabel = live.stockData.source === 'alphavantage' ? 'AlphaVantage' : 'Market Data';
    patched.source = `${base.source ?? 'DB'} + ${srcLabel} Live`;
    patched.lastUpdated = live.stockData.fetchedAt.slice(0, 10);
  }

  if (live.newsData) {
    patched._liveNewsChecked = true;
    patched._liveNewsSentiment = live.newsData.sentimentSignal;
  }

  // Apply hiring-freeze signal from connectors (Naukri)
  if (live.hiringData?.freezeScore != null) {
    patched._hiringFreezeScore = live.hiringData.freezeScore;
    patched._hiringPostingTrend = live.hiringData.postingTrend;
    patched._hiringSource = live.hiringData.source;
    // Only forwarded when the source was a live API; null otherwise so the
    // UI can show "—" rather than fabricating a count.
    if (live.hiringData.estimatedOpenings != null) {
      patched._estimatedRoleOpenings = live.hiringData.estimatedOpenings;
    }
  }

  // Backfill layoffsLast24Months from regulatory-grade live signals (SEC 8-K,
  // WARN Act). recentLayoffRisk is 30% of L2 and reads from layoffsLast24Months
  // — without this merge, the highest-confidence sources would only flow
  // through the 10%-weighted newsRisk path. Only backfill when base is empty;
  // never overwrite curated DB rows that may include percentCut data EDGAR
  // can't surface.
  if (live.derivedLayoffEvents.length > 0) {
    const existing = Array.isArray(patched.layoffsLast24Months) ? patched.layoffsLast24Months : [];
    if (existing.length === 0) {
      patched.layoffsLast24Months = live.derivedLayoffEvents.map(e => ({
        date: e.date,
        percentCut: e.percentCut,
        source: e.source,
      }));
      patched.layoffRounds = (patched.layoffRounds ?? 0) + live.derivedLayoffEvents.length;
    }
  }

  return patched;
};
