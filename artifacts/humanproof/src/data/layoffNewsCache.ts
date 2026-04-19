// layoffNewsCache.ts
// Layoff event store — seeded with major known events, dynamically expandable at runtime via OSINT.

export interface LayoffNewsEvent {
  companyName: string;
  date: string;
  headline: string;
  percentCut: number;
  source: string;
  url: string;
  affectedDepartments: string[];
}

// ── Seeded baseline events (refreshed quarterly) ────────────────────────────
export const layoffNewsCache: LayoffNewsEvent[] = [
  {
    companyName: 'Oracle',
    date: '2026-04-01',
    headline: 'Oracle begins laying off estimated 30,000 employees amid AI infrastructure spending concerns',
    percentCut: 21,
    source: 'Crunchbase News',
    url: 'https://news.crunchbase.com/',
    affectedDepartments: ['Sales', 'Marketing', 'HR', 'Finance'],
  },
  {
    companyName: 'Amazon',
    date: '2026-01-15',
    headline: 'Amazon lays off 16,000 employees to reduce management layers and reallocate to AI',
    percentCut: 1,
    source: 'TechCrunch',
    url: 'https://techcrunch.com/',
    affectedDepartments: ['Management', 'Sales', 'Operations'],
  },
  {
    companyName: 'Meta',
    date: '2026-01-10',
    headline: 'Meta cuts 1,500 employees from Reality Labs division',
    percentCut: 3,
    source: 'InformationWeek',
    url: 'https://www.informationweek.com/',
    affectedDepartments: ['VR/AR', 'Engineering', 'Research'],
  },
];

// ── Dynamic injection — called by LayoffCalculator after OSINT resolves ─────

/**
 * Inject a real-time layoff event from OSINT into the runtime cache.
 * Prevents duplicates by company name + date key.
 */
export const injectLayoffEvent = (event: LayoffNewsEvent): void => {
  const key = `${event.companyName.toLowerCase()}::${event.date.slice(0, 10)}`;
  const exists = layoffNewsCache.some(
    e => `${e.companyName.toLowerCase()}::${e.date.slice(0, 10)}` === key
  );
  if (!exists) {
    layoffNewsCache.push(event);
  }
};

/**
 * refreshFromNewsAPI — fetches live layoff headlines for a company and injects them.
 * Requires VITE_NEWSAPI_KEY. Returns count of events injected.
 */
export const refreshFromNewsAPI = async (companyName: string): Promise<number> => {
  const apiKey = (import.meta as any).env?.VITE_NEWSAPI_KEY as string | undefined;
  if (!apiKey) return 0;
  try {
    const thirty = new Date();
    thirty.setDate(thirty.getDate() - 30);
    const from = thirty.toISOString().split('T')[0];
    const q = encodeURIComponent(`"${companyName}" AND (layoff OR "job cuts" OR restructuring)`);
    const url = `https://newsapi.org/v2/everything?q=${q}&from=${from}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6_000) });
    if (!res.ok) return 0;
    const data = await res.json();
    if (data.status !== 'ok') return 0;
    let injected = 0;
    for (const article of (data.articles ?? [])) {
      const text = (article.title ?? '') + ' ' + (article.description ?? '');
      const lower = text.toLowerCase();
      if (lower.includes('layoff') || lower.includes('job cut') || lower.includes('restructur')) {
        const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
        injectLayoffEvent({
          companyName,
          date: (article.publishedAt ?? new Date().toISOString()).slice(0, 10),
          headline: article.title ?? '',
          percentCut: pctMatch ? parseFloat(pctMatch[1]) : 5,
          source: article.source?.name ?? 'NewsAPI',
          url: article.url ?? '',
          affectedDepartments: [],
        });
        injected++;
      }
    }
    return injected;
  } catch {
    return 0;
  }
};

/**
 * Look up the most recent layoff event for a company (case-insensitive).
 */
export const lookupLayoffEvent = (companyName: string): LayoffNewsEvent | null => {
  const q = companyName.toLowerCase().trim();
  const matches = layoffNewsCache
    .filter(e => e.companyName.toLowerCase() === q)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return matches[0] ?? null;
};

/**
 * Check if any layoff event exists for a company.
 */
export const hasLayoffEvent = (companyName: string): boolean => {
  const q = companyName.toLowerCase().trim();
  return layoffNewsCache.some(e => e.companyName.toLowerCase() === q);
};
