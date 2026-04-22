// bseConnector.ts
// BSE India API connector — free, official BSE data for listed Indian companies.
// Endpoint: https://api.bseindia.com/BseIndiaAPI/api/
// No API key required for basic company financials (public endpoint).

export interface BSECompanyData {
  scripCode: string;
  companyName: string;
  marketCap: number | null;       // in crores INR
  revenueYoY: number | null;      // % change year-over-year
  stock52wHigh: number | null;
  stock52wLow: number | null;
  stock90DayChange: number | null; // % change
  peRatio: number | null;
  isPublic: true;
  source: 'BSE India';
  fetchedAt: string;
}

const BSE_BASE = 'https://api.bseindia.com/BseIndiaAPI/api';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const cache = new Map<string, { data: BSECompanyData; ts: number }>();

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(tid);
  }
}

export async function fetchBSECompanyData(
  scripCode: string,
): Promise<BSECompanyData | null> {
  const cached = cache.get(scripCode);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;

  try {
    // BSE quote endpoint (public, no auth)
    const quoteRes = await fetchWithTimeout(
      `${BSE_BASE}/ComHeader/w?quotetype=EQ&scripcode=${scripCode}`,
    );
    if (!quoteRes.ok) return null;
    const quote = await quoteRes.json();

    const data: BSECompanyData = {
      scripCode,
      companyName: quote.CompanyName ?? '',
      marketCap: quote.MKTCAP ? parseFloat(quote.MKTCAP) : null,
      revenueYoY: null, // requires separate earnings call
      stock52wHigh: quote['52WeekHigh'] ? parseFloat(quote['52WeekHigh']) : null,
      stock52wLow: quote['52WeekLow'] ? parseFloat(quote['52WeekLow']) : null,
      stock90DayChange: deriveChange90d(quote.CurrRate, quote['52WeekLow'], quote['52WeekHigh']),
      peRatio: quote.PE ? parseFloat(quote.PE) : null,
      isPublic: true,
      source: 'BSE India',
      fetchedAt: new Date().toISOString(),
    };

    cache.set(scripCode, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

// Lookup BSE scrip code by company name (approximate match via BSE search)
export async function findBSEScripCode(companyName: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `${BSE_BASE}/InstantSearch/w?val=${encodeURIComponent(companyName)}`,
    );
    if (!res.ok) return null;
    const results = await res.json();
    const match = results?.Table?.[0];
    return match?.SCRIP_CD ? String(match.SCRIP_CD) : null;
  } catch {
    return null;
  }
}

// Derive approx 90-day change from 52w range + current price
function deriveChange90d(
  current: string | undefined,
  low52w: string | undefined,
  high52w: string | undefined,
): number | null {
  if (!current || !low52w || !high52w) return null;
  const cur = parseFloat(current);
  const hi = parseFloat(high52w);
  if (!cur || !hi || hi === 0) return null;
  // Rough proxy: position in 52w range vs upper quartile
  return Math.round(((cur - hi * 0.75) / (hi * 0.75)) * 100);
}
