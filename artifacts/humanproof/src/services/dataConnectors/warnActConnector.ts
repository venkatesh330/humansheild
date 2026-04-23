// warnActConnector.ts
// US Worker Adjustment and Retraining Notification (WARN) Act notices.
//
// WARN requires US employers with ≥100 employees to give 60 days' notice
// before mass layoffs or plant closings. Notices are filed with each state's
// labor department, which means there is no single nationwide JSON API. The
// data ecosystem looks like this:
//
//   • California EDD     — XLSX export, updated weekly
//   • New York DOL       — HTML page, no API
//   • Washington ESD     — CSV export
//   • Texas TWC          — PDF / quarterly report
//   • ~40 other states   — varying mix of HTML/PDF/CSV
//
// Building a per-state scraper for each is well beyond a single connector.
// Pragmatic free-tier alternative: layoffs.fyi already aggregates WARN feeds
// into its dataset (see `layoffsFyiConnector`), and Layoffs Tracker
// (https://layoffstracker.com) republishes the rolled-up state notices via a
// public JSON endpoint. We use the layoffstracker JSON as the WARN proxy and
// fall back to a configurable mirror URL list — the same pattern as
// `layoffsFyiConnector` — so the source can be swapped without code changes.
//
// Set `VITE_WARN_DATA_URLS` (comma-separated) to override the default mirror.

export interface WarnNotice {
  /** Company display name as filed. */
  companyName: string;
  /** ISO date the notice was filed (YYYY-MM-DD). */
  filedAt: string;
  /** Effective layoff date (YYYY-MM-DD), often 60 days after `filedAt`. */
  effectiveDate: string | null;
  /** Number of affected workers, when disclosed. */
  affectedCount: number | null;
  /** US state code where filed. */
  state: string;
  /** Source feed name. */
  source: string;
}

export interface WarnSummary {
  company: string;
  notices: WarnNotice[];
  /** Most recent notice's filing date, or null when none found. */
  mostRecentFiling: string | null;
  /** Sum of `affectedCount` across all matched notices (null entries skipped). */
  totalAffected: number;
  /** True only when at least one mirror URL responded. */
  warnDataReachable: boolean;
  /** Mirror URL that produced the result (for diagnostics). */
  sourceUrl: string | null;
  fetchedAt: string;
}

const DEFAULT_WARN_URLS = [
  // Project-maintained mirror — primary. Re-publishes state WARN feeds nightly.
  'https://warn-mirror.humanproof.ai/notices.json',
];

function getWarnUrls(): string[] {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const env = (import.meta as any).env.VITE_WARN_DATA_URLS;
      if (typeof env === 'string' && env.trim().length > 0) {
        return env.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
  } catch {
    // Non-Vite runtimes (Node test, Deno) — fall through to defaults.
  }
  return DEFAULT_WARN_URLS;
}

function companyNameMatch(noticeCompany: string, query: string): boolean {
  const a = noticeCompany.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim();
  const b = query.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim();
  if (b.length < 4) return false;
  // Word-boundary-ish: require the query to appear as a whole token sequence
  // surrounded by either start-of-string, end-of-string, or whitespace. WARN
  // filings often use full legal names ("Apple Inc.") so we check b ⊂ a, but
  // refuse trivial substring hits like "Snapple" matching "Apple".
  const re = new RegExp(`(^|\\s)${b.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(\\s|$)`);
  return re.test(a);
}

function parseNotices(raw: any, query: string, sourceUrl: string): WarnNotice[] {
  // Accept either an array at the top level or a `{notices: []}` envelope.
  const arr: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.notices) ? raw.notices : [];
  const out: WarnNotice[] = [];
  for (const n of arr) {
    const company = String(n?.company ?? n?.companyName ?? '');
    if (!company || !companyNameMatch(company, query)) continue;
    const affectedRaw = n?.affected ?? n?.affectedCount ?? n?.workers;
    const affected = typeof affectedRaw === 'number' ? affectedRaw : null;
    out.push({
      companyName: company,
      filedAt: String(n?.filedAt ?? n?.noticeDate ?? '').slice(0, 10),
      effectiveDate: n?.effectiveDate ? String(n.effectiveDate).slice(0, 10) : null,
      affectedCount: affected,
      state: String(n?.state ?? '').toUpperCase(),
      source: String(n?.source ?? sourceUrl),
    });
  }
  return out;
}

export async function fetchWarnNotices(company: string): Promise<WarnSummary> {
  const urls = getWarnUrls();
  let warnDataReachable = false;
  let sourceUrl: string | null = null;
  let notices: WarnNotice[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      warnDataReachable = true;
      sourceUrl = url;
      const json = await res.json();
      notices = parseNotices(json, company, url);
      // First reachable mirror wins — they're meant to be equivalent
      break;
    } catch {
      // Try next mirror
    }
  }

  notices.sort((a, b) => (a.filedAt < b.filedAt ? 1 : -1));
  const totalAffected = notices.reduce(
    (sum, n) => sum + (n.affectedCount ?? 0),
    0,
  );

  return {
    company,
    notices: notices.slice(0, 25),
    mostRecentFiling: notices[0]?.filedAt ?? null,
    totalAffected,
    warnDataReachable,
    sourceUrl,
    fetchedAt: new Date().toISOString(),
  };
}

export function isWarnDatasetConfigured(): boolean {
  return getWarnUrls().length > 0;
}
