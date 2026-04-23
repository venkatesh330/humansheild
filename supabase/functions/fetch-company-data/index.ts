
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type JsonObject = Record<string, any>;

const STALE_HOURS = 24;

const toIsoDate = (value: unknown): string => {
  try {
    return new Date(String(value)).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const normalizeCompanyName = (name: string): string =>
  name.trim().toLowerCase();

const extractEmployeeCount = (row: JsonObject): number => {
  const fromSignals = row.financial_signals?.employee_count;
  if (typeof fromSignals === "number" && fromSignals > 0) return fromSignals;

  const sizeMap: Record<string, number> = {
    small: 60,
    mid: 500,
    large: 5000,
    enterprise: 50000,
  };
  return sizeMap[String(row.company_size || "").toLowerCase()] || 1000;
};

const normalizeFromCompanyIntel = (row: JsonObject) => {
  const financial = row.financial_signals || {};
  const layoffs = row.layoff_history || {};
  const hiring = row.hiring_signals || {};

  const lastUpdated = row.last_updated
    ? toIsoDate(row.last_updated)
    : new Date().toISOString();

  return {
    company_name: row.company_name,
    ticker:
      financial.ticker || financial.stock_ticker || financial.symbol || null,
    is_public:
      row.stage === "public" ||
      financial.is_public === true ||
      financial.public === true,
    industry: row.industry || "Technology",
    region: financial.region || financial.country_code || "GLOBAL",
    employee_count: extractEmployeeCount(row),
    revenue_yoy:
      typeof financial.revenue_yoy === "number"
        ? financial.revenue_yoy
        : typeof financial.revenue_growth_yoy === "number"
          ? financial.revenue_growth_yoy
          : null,
    stock_90d_change:
      typeof financial.stock_90d_change === "number"
        ? financial.stock_90d_change
        : typeof financial.stock_change_90d === "number"
          ? financial.stock_change_90d
          : null,
    annual_revenue:
      typeof financial.annual_revenue === "number"
        ? financial.annual_revenue
        : null,
    revenue_per_employee:
      typeof financial.revenue_per_employee === "number"
        ? financial.revenue_per_employee
        : null,
    recent_layoffs: Array.isArray(layoffs.recent_layoffs)
      ? layoffs.recent_layoffs
      : [],
    layoff_rounds:
      typeof layoffs.layoff_rounds === "number"
        ? layoffs.layoff_rounds
        : typeof layoffs.rounds === "number"
          ? layoffs.rounds
          : 0,
    last_layoff_percent:
      typeof layoffs.last_layoff_percent === "number"
        ? layoffs.last_layoff_percent
        : null,
    recent_layoff_news:
      layoffs.recent_layoff_news === true ||
      (Array.isArray(layoffs.recent_layoffs) &&
        layoffs.recent_layoffs.length > 0),
    ai_investment_signal:
      hiring.ai_investment_signal || financial.ai_investment_signal || "medium",
    last_updated: lastUpdated,
    source: row.data_source || "company_intelligence",
  };
};

const isStale = (isoDate: string): boolean => {
  const ageMs = Date.now() - new Date(isoDate).getTime();
  return ageMs > STALE_HOURS * 60 * 60 * 1000;
};

const tryFetchAlphaVantage90D = async (
  ticker: string,
  apiKey: string,
): Promise<number | null> => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(ticker)}&outputsize=compact&apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;

  const json = await res.json();
  const ts = json["Time Series (Daily)"];
  if (!ts || typeof ts !== "object") return null;

  const dates = Object.keys(ts).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
  if (dates.length < 2) return null;

  const latestDate = dates[0];
  const olderDate = dates[Math.min(89, dates.length - 1)];
  const latestClose = Number(ts[latestDate]?.["4. close"]);
  const olderClose = Number(ts[olderDate]?.["4. close"]);
  if (
    !Number.isFinite(latestClose) ||
    !Number.isFinite(olderClose) ||
    olderClose <= 0
  )
    return null;

  return Number((((latestClose - olderClose) / olderClose) * 100).toFixed(2));
};

const tryFetchLayoffNews = async (
  companyName: string,
  apiKey: string,
): Promise<{
  hasLayoffNews: boolean;
  layoffs: Array<{ date: string; percent_cut: number | null; headline: string; source: string }>;
}> => {
  // Require the company name in quotes so a 30-word article that mentions the
  // word "layoff" anywhere doesn't get attributed to this company.
  const query = `"${companyName}" AND (layoff OR layoffs OR "workforce reduction" OR "job cuts")`;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return { hasLayoffNews: false, layoffs: [] };

  const json = await res.json();
  const articles = Array.isArray(json.articles) ? json.articles : [];
  if (articles.length === 0) return { hasLayoffNews: false, layoffs: [] };

  // Stricter title-side match: the company name must appear in the headline.
  // A bare description match is too easy to false-positive on.
  const lowerName = companyName.toLowerCase();
  const matched = articles.filter((a: any) =>
    typeof a?.title === "string" && a.title.toLowerCase().includes(lowerName),
  );
  if (matched.length === 0) return { hasLayoffNews: false, layoffs: [] };

  // Extract a percent_cut from the article only if the headline/description
  // actually states one. Never default to a hardcoded percentage — that
  // fabricates a layoff event from a single news mention.
  const layoffs = matched.slice(0, 3).map((a: any) => {
    const text = `${a.title ?? ""} ${a.description ?? ""}`;
    const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    return {
      date: a.publishedAt || new Date().toISOString(),
      percent_cut: pctMatch ? parseFloat(pctMatch[1]) : null,
      headline: a.title ?? "",
      source: a.source?.name ?? "NewsAPI",
    };
  });

  return { hasLayoffNews: true, layoffs };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") || "" },
        },
      },
    );

    const body = await req.json();
    const companyName = String(body.companyName || "").trim();
    if (!companyName) throw new Error("companyName is required");

    const normalized = normalizeCompanyName(companyName);

    // Primary source: company_intelligence
    const { data: intelExact } = await supabaseClient
      .from("company_intelligence")
      .select("*")
      .ilike("company_name", companyName)
      .maybeSingle();

    let intelRow = intelExact;
    if (!intelRow) {
      const { data: intelFuzzy } = await supabaseClient
        .from("company_intelligence")
        .select("*")
        .ilike("company_name", `%${companyName}%`)
        .limit(1)
        .maybeSingle();
      intelRow = intelFuzzy;
    }

    let merged = intelRow
      ? normalizeFromCompanyIntel(intelRow)
      : {
          company_name: companyName,
          ticker: null,
          is_public: body.isPublic === true,
          industry: body.industry || "Technology",
          region: "GLOBAL",
          employee_count: body.employeeCount || 1000,
          revenue_yoy: null,
          stock_90d_change: null,
          annual_revenue: null,
          revenue_per_employee: null,
          recent_layoffs: [],
          layoff_rounds: 0,
          last_layoff_percent: null,
          recent_layoff_news: false,
          ai_investment_signal: "medium",
          last_updated: new Date().toISOString(),
          source: "fallback",
        };

    const provenance: string[] = [];
    provenance.push(
      intelRow ? "supabase.company_intelligence" : "fallback.input_defaults",
    );

    // optional enrichment when stale or missing critical fields
    const alphaKey =
      Deno.env.get("ALPHA_VANTAGE_API_KEY") ||
      Deno.env.get("ALPHA_VANTAGE_KEY") ||
      "";
    const newsKey =
      Deno.env.get("NEWS_API_KEY") || Deno.env.get("NEWSAPI_KEY") || "";

    const shouldEnrichStock =
      merged.is_public &&
      (merged.stock_90d_change === null || isStale(merged.last_updated));
    if (shouldEnrichStock && alphaKey && merged.ticker) {
      try {
        const stock90d = await tryFetchAlphaVantage90D(merged.ticker, alphaKey);
        if (stock90d !== null) {
          merged.stock_90d_change = stock90d;
          merged.last_updated = new Date().toISOString();
          provenance.push("alpha_vantage.stock_90d_change");
        }
      } catch {
        provenance.push("alpha_vantage.failed");
      }
    }

    const shouldEnrichNews =
      !merged.recent_layoff_news || isStale(merged.last_updated);
    if (shouldEnrichNews && newsKey) {
      try {
        const layoffNews = await tryFetchLayoffNews(
          merged.company_name,
          newsKey,
        );
        if (layoffNews.hasLayoffNews) {
          merged.recent_layoff_news = true;
          merged.recent_layoffs = layoffNews.layoffs;
          // Count distinct layoff *events* (events on different dates) rather
          // than article count — multiple outlets covering one round shouldn't
          // inflate `layoff_rounds`.
          const distinctEventDates = new Set(
            layoffNews.layoffs
              .map((l) => (typeof l.date === "string" ? l.date.slice(0, 10) : ""))
              .filter(Boolean),
          );
          merged.layoff_rounds = Math.max(
            merged.layoff_rounds || 0,
            distinctEventDates.size,
          );
          // Only update last_layoff_percent when a real % was parsed from
          // article text. Falling back to a hardcoded 5% silently fabricates
          // a layoff severity that the scoring engine then trusts.
          const observedPercents = layoffNews.layoffs
            .map((l) => l.percent_cut)
            .filter((p): p is number => typeof p === "number");
          if (observedPercents.length > 0) {
            merged.last_layoff_percent = Math.max(...observedPercents);
          }
          merged.last_updated = new Date().toISOString();
          provenance.push("newsapi.layoff_news");
        }
      } catch {
        provenance.push("newsapi.failed");
      }
    }

    if (
      !merged.revenue_per_employee &&
      merged.annual_revenue &&
      merged.employee_count
    ) {
      merged.revenue_per_employee = Math.round(
        merged.annual_revenue / merged.employee_count,
      );
    }

    // cache normalized payload for fast repeat access
    const nextRefresh = new Date();
    nextRefresh.setHours(nextRefresh.getHours() + STALE_HOURS);

    const cachePayload = {
      company_name: normalized,
      domain: `${normalized.replace(/\s+/g, "")}.com`,
      employee_count: merged.employee_count,
      revenue_yoy: merged.revenue_yoy,
      stock_90d_change: merged.stock_90d_change,
      recent_layoff_news: merged.recent_layoff_news,
      industry: merged.industry,
      is_public: merged.is_public,
      last_updated: merged.last_updated,
      next_refresh_due: nextRefresh.toISOString(),
    };

    await supabaseClient
      .from("cached_company_intelligence")
      .upsert(cachePayload, { onConflict: "company_name" });

    const stale = isStale(merged.last_updated);

    return new Response(
      JSON.stringify({
        data: merged,
        source: provenance.join(" | "),
        provenance,
        dataQuality: stale ? "PARTIAL_STALE" : "LIVE_OR_REFRESHED",
        dataFreshness: {
          lastUpdated: merged.last_updated,
          stale,
          staleThresholdHours: STALE_HOURS,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
