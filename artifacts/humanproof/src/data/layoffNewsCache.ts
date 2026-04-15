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
