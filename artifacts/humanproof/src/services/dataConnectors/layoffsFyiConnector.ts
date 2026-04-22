// layoffsFyiConnector.ts
// layoffs.fyi data connector — confirmed global tech layoffs.
// Uses the public GitHub-hosted JSON dataset (no key required).
// Dataset: https://github.com/rogerh2/layoffs-data (CSV mirrored as JSON)

export interface LayoffRecord {
  company: string;
  headcount: number | null;
  percentCut: number | null;
  date: string;            // ISO date
  industry: string;
  country: string;
  stage: string;           // e.g. "Post-IPO", "Series B"
  sources: string[];
}

export interface CompanyLayoffSummary {
  company: string;
  totalLayoffs: number;
  rounds: number;
  mostRecentDate: string;
  mostRecentPct: number | null;
  records: LayoffRecord[];
  peerCount: number;       // companies in same industry that also laid off
}

// Public JSON endpoint — updated weekly by community
const DATASET_URL =
  'https://raw.githubusercontent.com/datasets/layoffs/main/data/layoffs.json';

const CACHE_KEY = 'hp_layoffs_fyi_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let memCache: { records: LayoffRecord[]; ts: number } | null = null;

async function loadDataset(): Promise<LayoffRecord[]> {
  if (memCache && Date.now() - memCache.ts < CACHE_TTL_MS) return memCache.records;

  // Check localStorage first
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.ts < CACHE_TTL_MS) {
        memCache = parsed;
        return parsed.records;
      }
    }
  } catch { /* ignore */ }

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(DATASET_URL, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) return [];
    const raw: any[] = await res.json();
    const records: LayoffRecord[] = raw.map(r => ({
      company: r.Company ?? r.company ?? '',
      headcount: r['Laid_Off_Count'] ?? r.headcount ?? null,
      percentCut: r.Percentage ? parseFloat(r.Percentage) : null,
      date: r.Date ?? r.date ?? '',
      industry: r.Industry ?? r.industry ?? 'Unknown',
      country: r.Country ?? r.country ?? 'Unknown',
      stage: r.Stage ?? r.stage ?? 'Unknown',
      sources: r.Source ? [r.Source] : [],
    })).filter(r => r.company && r.date);

    memCache = { records, ts: Date.now() };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(memCache)); } catch { /* quota */ }
    return records;
  } catch {
    return [];
  }
}

export async function getCompanyLayoffs(companyName: string): Promise<CompanyLayoffSummary | null> {
  const records = await loadDataset();
  const name = companyName.toLowerCase();
  const matches = records.filter(r =>
    r.company.toLowerCase().includes(name) || name.includes(r.company.toLowerCase()),
  );
  if (matches.length === 0) return null;

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const industry = sorted[0].industry;
  const peerCount = records.filter(r =>
    r.industry === industry && r.company.toLowerCase() !== name,
  ).length;

  return {
    company: companyName,
    totalLayoffs: matches.reduce((s, r) => s + (r.headcount ?? 0), 0),
    rounds: matches.length,
    mostRecentDate: sorted[0].date,
    mostRecentPct: sorted[0].percentCut,
    records: sorted,
    peerCount,
  };
}

export async function getSectorLayoffCount(industry: string, days = 180): Promise<number> {
  const records = await loadDataset();
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return records.filter(r =>
    r.industry.toLowerCase().includes(industry.toLowerCase()) &&
    r.date >= cutoff,
  ).length;
}

export async function getRecentLayoffs(days = 90): Promise<LayoffRecord[]> {
  const records = await loadDataset();
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return records.filter(r => r.date >= cutoff).sort((a, b) => b.date.localeCompare(a.date));
}
