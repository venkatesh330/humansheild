// nsConnector.ts
// NSE India API connector — free official NSE equity data.
// NSE provides JSON endpoints without auth for listed company data.

export interface NSECompanyData {
  symbol: string;
  companyName: string;
  lastPrice: number | null;
  change: number | null;         // absolute price change
  pChange: number | null;        // % change (day)
  high52: number | null;
  low52: number | null;
  totalBuyQty: number | null;    // proxy for buy pressure / momentum
  pe: number | null;
  eps: number | null;
  isPublic: true;
  source: 'NSE India';
  fetchedAt: string;
}

const NSE_BASE = 'https://www.nseindia.com/api';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

const cache = new Map<string, { data: NSECompanyData; ts: number }>();

// NSE requires session cookies — no public CORS proxy reliably carries them.
// We try two proxies in sequence; if both fail the caller gets null (graceful).
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function nseGet(path: string): Promise<any> {
  const url = `${NSE_BASE}${path}`;
  for (const buildProxy of CORS_PROXIES) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(buildProxy(url), {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(tid);
      if (!res.ok) continue;
      const json = await res.json();
      if (json && typeof json === 'object') return json;
    } catch {
      clearTimeout(tid);
      // try next proxy
    }
  }
  return null;
}

export async function fetchNSECompanyData(symbol: string): Promise<NSECompanyData | null> {
  const key = symbol.toUpperCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;

  const json = await nseGet(`/quote-equity?symbol=${encodeURIComponent(key)}`);
  if (!json?.priceInfo) return null;

  const p = json.priceInfo;
  const md = json.metadata ?? {};

  const data: NSECompanyData = {
    symbol: key,
    companyName: md.companyName ?? key,
    lastPrice: p.lastPrice ?? null,
    change: p.change ?? null,
    pChange: p.pChange ?? null,
    high52: p['52WeekHigh'] ?? null,
    low52: p['52WeekLow'] ?? null,
    totalBuyQty: p.totalBuyQuantity ?? null,
    pe: json.metadata?.pdSymbolPe ? parseFloat(json.metadata.pdSymbolPe) : null,
    eps: null,
    isPublic: true,
    source: 'NSE India',
    fetchedAt: new Date().toISOString(),
  };

  cache.set(key, { data, ts: Date.now() });
  return data;
}

// Derives a 90-day stock change proxy from 52-week range position
export function derive90dChangeFromNSE(data: NSECompanyData): number | null {
  if (!data.lastPrice || !data.high52 || !data.low52) return null;
  const midYear = (data.high52 + data.low52) / 2;
  if (midYear === 0) return null;
  return Math.round(((data.lastPrice - midYear) / midYear) * 100);
}
