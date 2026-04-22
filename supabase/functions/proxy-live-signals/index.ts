// proxy-live-signals — multi-source proxy for stock and news signals.
// Stock: Yahoo Finance v7/quote (primary) + v8/chart (90d change) → FMP fallback
// News:  NewsAPI (primary) → GNews API (fallback) → Google News RSS (last resort)
// Cross-match filter: title-match required (description optional) to eliminate false positives.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Browser-like headers — required for Yahoo Finance v10/v11 without crumb
const YAHOO_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Referer": "https://finance.yahoo.com/",
  "Origin": "https://finance.yahoo.com",
};

// ── STOCK: Yahoo Finance crumb auth (required for v10 quoteSummary fundamentals) ─

interface YahooCrumb { crumb: string; cookies: string }

// Cache crumb for the lifetime of this function instance (warm invocations reuse it)
let _crumbCache: YahooCrumb | null = null;
let _crumbFetchedAt = 0;
const CRUMB_TTL_MS = 20 * 60 * 1000; // 20 min

async function getYahooCrumb(): Promise<YahooCrumb> {
  const now = Date.now();
  if (_crumbCache && now - _crumbFetchedAt < CRUMB_TTL_MS) return _crumbCache;

  // Step 1: hit Yahoo Finance consent GDC endpoint to get cookies
  const consentRes = await fetch("https://guce.yahoo.com/consent?sessionId=1&lang=en-US&inline=false", {
    headers: YAHOO_HEADERS,
    redirect: "manual",
    signal: AbortSignal.timeout(8_000),
  });
  const rawCookies = consentRes.headers.get("set-cookie") ?? "";
  const cookieStr = rawCookies.split(",").map((s) => s.split(";")[0].trim()).join("; ");

  // Step 2: get crumb using those cookies
  const crumbRes = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
    headers: { ...YAHOO_HEADERS, "Cookie": cookieStr },
    signal: AbortSignal.timeout(8_000),
  });
  if (!crumbRes.ok) throw new Error(`Yahoo crumb HTTP ${crumbRes.status}`);
  const crumb = await crumbRes.text();
  if (!crumb || crumb.startsWith("{")) throw new Error("Yahoo crumb: invalid response");

  _crumbCache = { crumb: crumb.trim(), cookies: cookieStr };
  _crumbFetchedAt = now;
  return _crumbCache;
}

// ── STOCK: Yahoo Finance v10 quoteSummary (detailed fundamentals) ─────────────

async function getYahooSummary(ticker: string): Promise<any> {
  const { crumb, cookies } = await getYahooCrumb();
  const modules = "financialData,defaultKeyStatistics,summaryDetail,assetProfile";
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules}&formatted=false&crumb=${encodeURIComponent(crumb)}`;
  const res = await fetch(url, {
    headers: { ...YAHOO_HEADERS, "Cookie": cookies },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Yahoo summary HTTP ${res.status}`);
  const data = await res.json();
  if (data?.quoteSummary?.error) throw new Error(data.quoteSummary.error.description ?? "Yahoo summary error");
  return data?.quoteSummary?.result?.[0] ?? null;
}

// ── STOCK: Yahoo Finance v8 chart (90-day price change) ───────────────────────

async function getYahooChart(ticker: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`;
  const res = await fetch(url, {
    headers: YAHOO_HEADERS,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Yahoo chart HTTP ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error("Yahoo chart: no data returned");
  return result;
}

async function getStockSignals(ticker: string) {
  // Chart always works (no crumb required); summary needs crumb and is optional
  const [chart, summary] = await Promise.all([
    getYahooChart(ticker),
    getYahooSummary(ticker).catch((e: Error) => {
      console.warn(`[proxy] Yahoo summary failed: ${e.message}`);
      return null;
    }),
  ]);

  // 90-day price change from chart close prices
  let price90DayChange: number | null = null;
  const closes: number[] = chart.indicators?.quote?.[0]?.close ?? [];
  const validCloses = closes.filter((v: number | null) => v != null);
  if (validCloses.length >= 2) {
    const oldest = validCloses[0];
    const newest = validCloses[validCloses.length - 1];
    if (oldest > 0) {
      price90DayChange = Math.round(((newest - oldest) / oldest) * 1000) / 10;
    }
  }

  const fin = summary?.financialData ?? {};
  const stats = summary?.defaultKeyStatistics ?? {};
  const profile = summary?.assetProfile ?? {};

  // Revenue growth: v10 financialData.revenueGrowth (raw decimal, e.g. 0.12 = 12%)
  const revenueGrowthRaw = fin.revenueGrowth?.raw ?? fin.revenueGrowth ?? null;
  const revenueGrowthYoY = revenueGrowthRaw != null
    ? Math.round(revenueGrowthRaw * 100)
    : null;

  const employeeCount = profile.fullTimeEmployees ?? null;
  const marketCap = stats.marketCap?.raw ?? stats.marketCap ?? chart.meta?.marketCap ?? null;
  const forwardPE = fin.forwardPE?.raw ?? fin.forwardPE ?? null;
  const currentPrice = fin.currentPrice?.raw ?? fin.currentPrice ?? chart.meta?.regularMarketPrice ?? null;
  const targetPrice = fin.targetMeanPrice?.raw ?? fin.targetMeanPrice ?? null;
  const analystRecommendation = fin.recommendationKey ?? null;
  const debtToEquity = fin.debtToEquity?.raw ?? fin.debtToEquity ?? null;
  const totalRevenue = fin.totalRevenue?.raw ?? fin.totalRevenue ?? null;
  const revenuePerEmployee = (totalRevenue && employeeCount)
    ? Math.round(totalRevenue / employeeCount)
    : null;

  return {
    price90DayChange,
    revenueGrowthYoY,
    marketCap,
    forwardPE,
    employeeCount,
    currentPrice,
    targetPrice,
    analystRecommendation,
    debtToEquity,
    revenuePerEmployee,
    source: "yahoo-finance",
  };
}

// ── STOCK: FMP fallback (optional, if FMP_KEY env is set) ────────────────────

async function getStockSignalsFMP(ticker: string, fmpKey: string) {
  const [quoteRes, profileRes] = await Promise.all([
    fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${fmpKey}`, { signal: AbortSignal.timeout(8_000) }),
    fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpKey}`, { signal: AbortSignal.timeout(8_000) }),
  ]);

  if (!quoteRes.ok) throw new Error(`FMP quote HTTP ${quoteRes.status}`);
  const quotes = await quoteRes.json();
  const profiles = profileRes.ok ? await profileRes.json() : [];
  const q = Array.isArray(quotes) ? quotes[0] : null;
  const p = Array.isArray(profiles) ? profiles[0] : null;
  if (!q) throw new Error("FMP: empty quote response");

  return {
    price90DayChange: q.changesPercentage ?? null,
    revenueGrowthYoY: null,  // not available in free FMP
    marketCap: q.marketCap ?? null,
    employeeCount: p?.fullTimeEmployees ?? null,
    currentPrice: q.price ?? null,
    analystRecommendation: null,
    source: "fmp",
  };
}

// ── NEWS: Source 1 — NewsAPI ──────────────────────────────────────────────────

const LAYOFF_KEYWORDS = ["layoff", "job cut", "workforce reduction", "restructuring", "headcount", "redundan", "retrench"];

// Word-boundary match prevents false positives from package names like "tabsdata-salesforce" or "trytond-stripe".
// Regex: not preceded/followed by alphanumeric or hyphen so "salesforce" won't match "tabsdata-salesforce".
function companyWordBoundaryMatch(text: string, companyLower: string): boolean {
  const escaped = companyLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![a-z0-9-])${escaped}(?![a-z0-9-])`, "i");
  return re.test(text);
}

function articleMatchesCompany(a: any, companyLower: string): boolean {
  const title = (a.title || "").toLowerCase();
  const desc = (a.description || "").toLowerCase();
  if (companyWordBoundaryMatch(title, companyLower)) return true;
  // Allow description-only match when a layoff keyword is also present
  if (companyWordBoundaryMatch(desc, companyLower) && LAYOFF_KEYWORDS.some((kw) => desc.includes(kw))) return true;
  return false;
}

async function getNewsAPISignals(companyName: string, newsKey: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const from = thirtyDaysAgo.toISOString().split("T")[0];

  // Exact company name in quotes for better precision
  const query = encodeURIComponent(`"${companyName}" layoff OR "job cuts" OR restructuring`);
  const url = `https://newsapi.org/v2/everything?q=${query}&from=${from}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${newsKey}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(9_000) });
  if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== "ok") throw new Error(data.message || "NewsAPI error");

  const companyLower = companyName.toLowerCase();
  const articles = (data.articles || []).filter((a: any) => articleMatchesCompany(a, companyLower));

  return parseArticles(articles, companyName, "newsapi");
}

// ── NEWS: Source 2 — GNews API (100 free req/day) ────────────────────────────

async function getGNewsSignals(companyName: string, gnewsKey: string) {
  const query = encodeURIComponent(`"${companyName}" layoff`);
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&sortby=publishedAt&apikey=${gnewsKey}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`GNews HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.articles)) throw new Error("GNews: unexpected response shape");

  const companyLower = companyName.toLowerCase();
  const normalized = data.articles.map((a: any) => ({
    title: a.title,
    description: a.description,
    publishedAt: a.publishedAt,
    url: a.url,
    source: { name: a.source?.name },
  }));
  const articles = normalized.filter((a: any) => articleMatchesCompany(a, companyLower));

  return parseArticles(articles, companyName, "gnews");
}

// ── NEWS: Source 3 — Google News RSS (no key needed) ─────────────────────────

async function getGoogleNewsRSS(companyName: string) {
  const query = encodeURIComponent(`"${companyName}" layoff`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en&gl=US&ceid=US:en`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Google News RSS HTTP ${res.status}`);
  const xml = await res.text();

  // Simple RSS parser — extract <item> blocks
  const items: any[] = [];
  const companyLower = companyName.toLowerCase();
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const block = match[1];
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const descMatch = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
    const pubDateMatch = block.match(/<pubDate>(.*?)<\/pubDate>/);
    const linkMatch = block.match(/<link>(.*?)<\/link>/);
    const sourceMatch = block.match(/<source[^>]*>(.*?)<\/source>/);

    const title = titleMatch?.[1] ?? "";
    const desc = descMatch?.[1]?.replace(/<[^>]+>/g, "") ?? "";

    // Only include if article genuinely references the company (title-match required or desc+layoff keyword)
    if (!articleMatchesCompany({ title, description: desc }, companyLower)) continue;

    items.push({
      title,
      description: desc,
      publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
      url: linkMatch?.[1] ?? "",
      source: { name: sourceMatch?.[1]?.trim() ?? "Google News" },
    });
    if (items.length >= 10) break;
  }

  return parseArticles(items, companyName, "google-news-rss");
}

// ── NEWS: Source 4 — Reddit r/layoffs (no key, signals depth) ────────────────

async function getRedditLayoffs(companyName: string) {
  const query = encodeURIComponent(companyName);
  const url = `https://www.reddit.com/r/layoffs/search.json?q=${query}&sort=new&limit=10&restrict_sr=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "HumanProof/1.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
  const data = await res.json();
  const posts = data?.data?.children ?? [];

  const companyLower = companyName.toLowerCase();
  const articles = posts
    .filter((p: any) =>
      (p.data?.title || "").toLowerCase().includes(companyLower) ||
      (p.data?.selftext || "").toLowerCase().includes(companyLower)
    )
    .map((p: any) => ({
      title: p.data.title,
      description: p.data.selftext?.slice(0, 300) ?? "",
      publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
      url: `https://reddit.com${p.data.permalink}`,
      source: { name: "Reddit r/layoffs" },
    }));

  return parseArticles(articles, companyName, "reddit-layoffs");
}

// ── Shared article parser ─────────────────────────────────────────────────────

function parseArticles(articles: any[], companyName: string, source: string) {
  const recentCount = articles.length;
  let latestLayoffEvent: any = null;

  for (const a of articles) {
    const title = (a.title || "").toLowerCase();
    const combined = title + " " + (a.description || "").toLowerCase();
    if (LAYOFF_KEYWORDS.some((kw) => combined.includes(kw))) {
      const pctMatch = (a.title + " " + (a.description || "")).match(/(\d+(?:\.\d+)?)\s*%/);
      latestLayoffEvent = {
        companyName,
        date: (a.publishedAt ?? "").slice(0, 10),
        headline: a.title,
        percentCut: pctMatch ? parseFloat(pctMatch[1]) : null,
        source: a.source?.name ?? source,
        url: a.url ?? "",
      };
      break;
    }
  }

  return {
    latestLayoffEvent,
    recentHeadlineCount: recentCount,
    sentimentSignal: Math.min(1, recentCount / 5),
    source,
    articles: articles.slice(0, 5).map((a) => ({
      headline: a.title,
      date: (a.publishedAt ?? "").slice(0, 10),
      source: a.source?.name ?? source,
      url: a.url ?? "",
    })),
    fetchedAt: new Date().toISOString(),
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { companyName, ticker, action } = await req.json();
    if (!action) return json({ error: "action required (stock|news|both)" }, 400);

    const newsKey   = Deno.env.get("NEWSAPI_KEY");
    const gnewsKey  = Deno.env.get("GNEWS_KEY");
    const fmpKey    = Deno.env.get("FMP_KEY");

    const result: any = { fetchedAt: new Date().toISOString(), errors: [] };

    // ── Stock signals: Yahoo Finance primary, FMP fallback ────────────────────
    if ((action === "stock" || action === "both")) {
      if (!ticker) {
        result.stockData = null;
        result.errors.push("No ticker provided for stock signals");
      } else {
        try {
          result.stockData = await getStockSignals(ticker);
          console.log(`[proxy] Yahoo Finance ✓ — ${ticker} 90d: ${result.stockData.price90DayChange}%`);
        } catch (yahooErr: any) {
          console.warn(`[proxy] Yahoo Finance failed (${yahooErr.message}) — trying FMP`);
          result.errors.push(`Yahoo Finance: ${yahooErr.message}`);
          if (fmpKey) {
            try {
              result.stockData = await getStockSignalsFMP(ticker, fmpKey);
              console.log(`[proxy] FMP ✓ — ${ticker}`);
            } catch (fmpErr: any) {
              result.errors.push(`FMP: ${fmpErr.message}`);
              result.stockData = null;
            }
          } else {
            result.stockData = null;
          }
        }
      }
    }

    // ── News signals: NewsAPI → GNews → Google RSS → Reddit ──────────────────
    if (action === "news" || action === "both") {
      if (!companyName) {
        result.newsData = null;
        result.errors.push("companyName required for news signals");
      } else {
        let newsData: any = null;

        // Source 1: NewsAPI
        if (newsKey) {
          try {
            newsData = await getNewsAPISignals(companyName, newsKey);
            console.log(`[proxy] NewsAPI ✓ — ${newsData.recentHeadlineCount} articles for "${companyName}"`);
          } catch (e: any) {
            result.errors.push(`NewsAPI: ${e.message}`);
            console.warn(`[proxy] NewsAPI failed: ${e.message}`);
          }
        }

        // Source 2: GNews (fallback or supplement if NewsAPI returned 0)
        if ((!newsData || newsData.recentHeadlineCount === 0) && gnewsKey) {
          try {
            newsData = await getGNewsSignals(companyName, gnewsKey);
            console.log(`[proxy] GNews ✓ — ${newsData.recentHeadlineCount} articles`);
          } catch (e: any) {
            result.errors.push(`GNews: ${e.message}`);
          }
        }

        // Source 3: Google News RSS (free, no key)
        if (!newsData || newsData.recentHeadlineCount === 0) {
          try {
            newsData = await getGoogleNewsRSS(companyName);
            console.log(`[proxy] Google News RSS ✓ — ${newsData.recentHeadlineCount} articles`);
          } catch (e: any) {
            result.errors.push(`Google RSS: ${e.message}`);
          }
        }

        // Source 4: Reddit r/layoffs (always run for supplemental signal)
        try {
          const reddit = await getRedditLayoffs(companyName);
          if (reddit.recentHeadlineCount > 0) {
            console.log(`[proxy] Reddit ✓ — ${reddit.recentHeadlineCount} posts`);
            // Merge reddit layoff event if newsData has none
            if (newsData && !newsData.latestLayoffEvent && reddit.latestLayoffEvent) {
              newsData.latestLayoffEvent = reddit.latestLayoffEvent;
            }
            // Add reddit headline count as supplemental signal
            if (newsData) {
              newsData.redditSignalCount = reddit.recentHeadlineCount;
            }
          }
        } catch (e: any) {
          // Reddit is optional — suppress errors
        }

        result.newsData = newsData ?? { recentHeadlineCount: 0, latestLayoffEvent: null, sentimentSignal: 0, articles: [], source: "none" };
      }
    }

    return json(result);
  } catch (err: any) {
    console.error("[proxy-live-signals] Fatal:", err);
    return json({ error: err.message }, 500);
  }
});
