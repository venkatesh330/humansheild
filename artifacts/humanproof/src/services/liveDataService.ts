// liveDataService.ts
// Central live data fetcher — single entry point for ALL real-time signals.
// Hierarchy: Alpha Vantage (stock / financials) → NewsAPI (layoff news) → Supabase OSINT
// Gracefully degrades to heuristic on any API failure.

import { injectLayoffEvent, LayoffNewsEvent } from '../data/layoffNewsCache';

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
}

// ── Alpha Vantage Live Stock + Financials ────────────────────────────────────

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

  const alphaKey = (import.meta as any).env?.VITE_ALPHAVANTAGE_KEY as string | undefined;
  const newsKey  = (import.meta as any).env?.VITE_NEWSAPI_KEY as string | undefined;

  // ── Stock & Financials ───────────────────────────────────────────────────
  let stockData: StockLiveData | null = null;
  if (alphaKey && ticker) {
    stockData = await fetchAlphaVantageOverview(ticker, alphaKey);
    if (stockData?.source === 'alphavantage') {
      liveCount += 2;  // price + fundamentals = 2 signals
    } else {
      errors.push('Alpha Vantage: unavailable — stock signals will use DB proxy');
      heuristicCount += 2;
    }
  } else {
    if (!ticker) errors.push('No ticker known — stock signals unavailable (private/unknown company)');
    else if (!alphaKey) errors.push('VITE_ALPHAVANTAGE_KEY not set — add to .env for live stock data');
    heuristicCount += 2;
  }

  // ── News & Layoff Events ─────────────────────────────────────────────────
  let newsData: NewsLiveData | null = null;
  if (newsKey) {
    newsData = await fetchNewsAPIHeadlines(companyName, newsKey);
    if (newsData?.source === 'newsapi') {
      liveCount += 2;  // headline count + sentiment = 2 signals
    } else {
      errors.push('NewsAPI: unavailable — news signals will use static cache');
      heuristicCount += 2;
    }
  } else {
    errors.push('VITE_NEWSAPI_KEY not set — add to .env for live layoff news detection');
    heuristicCount += 2;
  }

  // ── Determine overall source quality ────────────────────────────────────
  let overallSource: LiveDataResult['overallSource'];
  if (liveCount >= 4) overallSource = 'full-live';
  else if (liveCount >= 2) overallSource = 'partial-live';
  else if (!ticker && !newsKey && !alphaKey) overallSource = 'unknown-company';
  else overallSource = 'heuristic';

  return {
    stockData,
    newsData,
    hiringData: null,  // Hiring signals come from Supabase OSINT in auditDataPipeline
    overallSource,
    liveSignalCount: liveCount,
    heuristicSignalCount: heuristicCount,
    fetchedAt: new Date().toISOString(),
    apiErrors: errors,
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

  if (live.stockData?.source === 'alphavantage') {
    if (live.stockData.price90DayChange !== null) {
      patched.stock90DayChange = live.stockData.price90DayChange;
    }
    if (live.stockData.revenueGrowthYoY !== null) {
      patched.revenueGrowthYoY = live.stockData.revenueGrowthYoY;
    }
    // Upgrade source attribution
    patched.source = `${base.source ?? 'DB'} + AlphaVantage Live`;
    patched.lastUpdated = live.stockData.fetchedAt.slice(0, 10);
  }

  if (live.newsData?.source === 'newsapi') {
    // The news injection into layoffNewsCache has already happened in fetchNewsAPIHeadlines.
    // We just need to flag that real news was fetched.
    patched._liveNewsChecked = true;
    patched._liveNewsSentiment = live.newsData.sentimentSignal;
  }

  return patched;
};
