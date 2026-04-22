// dataConnectors/index.ts
// Unified data connector orchestrator — combines BSE, NSE, layoffs.fyi, MCA, Naukri, RSS.
// All sources are free-tier; degrades gracefully when unavailable.

import { fetchBSECompanyData, findBSEScripCode } from './bseConnector';
import { fetchNSECompanyData, derive90dChangeFromNSE } from './nsConnector';
import { getCompanyLayoffs, getSectorLayoffCount } from './layoffsFyiConnector';
import { fetchMCACompanyInfo } from './mcaConnector';
import { fetchRoleDemandSignal } from './naukriConnector';
import { fetchCompanyNewsSignals } from './rssNewsConnector';

export interface EnrichedCompanySignals {
  companyName: string;
  // Financial
  stock90DayChange: number | null;
  revenueYoY: number | null;
  marketCapCr: number | null;
  peRatio: number | null;
  // Layoff
  confirmedLayoffRounds: number;
  mostRecentLayoffDate: string | null;
  mostRecentLayoffPct: number | null;
  sectorLayoff180d: number;           // peer companies laid off in 180 days
  // Corporate health
  mcaStatus: 'Active' | 'Struck Off' | 'Under Liquidation' | 'Dissolved' | 'Unknown';
  filingDelinquent: boolean;
  // Demand
  roleDemandTrend: 'rising' | 'stable' | 'falling';
  hiringFreezeScore: number;
  // News sentiment
  newsSentimentScore: number;
  layoffNewsCount: number;
  // Meta
  sourcesUsed: string[];
  fetchedAt: string;
}

export async function enrichCompanySignals(
  companyName: string,
  roleTitle: string,
  industry: string,
): Promise<EnrichedCompanySignals> {
  const sourcesUsed: string[] = [];

  // Run all fetches in parallel — each degrades gracefully
  const [bseCode, layoffData, mcaData, roleData, newsData] = await Promise.all([
    findBSEScripCode(companyName),
    getCompanyLayoffs(companyName),
    fetchMCACompanyInfo(companyName),
    fetchRoleDemandSignal(roleTitle, companyName),
    fetchCompanyNewsSignals(companyName),
  ]);

  // BSE + NSE — attempt after scrip code resolved
  let stock90d: number | null = null;
  let revenueYoY: number | null = null;
  let marketCap: number | null = null;
  let pe: number | null = null;

  if (bseCode) {
    const bse = await fetchBSECompanyData(bseCode);
    if (bse) {
      stock90d = bse.stock90DayChange;
      marketCap = bse.marketCap;
      pe = bse.peRatio;
      sourcesUsed.push('BSE India');
    }
  }

  // Try NSE if BSE didn't give stock change
  if (stock90d === null) {
    const nseTicker = companyName.toUpperCase().replace(/\s+/g, '');
    const nse = await fetchNSECompanyData(nseTicker);
    if (nse) {
      stock90d = derive90dChangeFromNSE(nse);
      pe = pe ?? nse.pe;
      sourcesUsed.push('NSE India');
    }
  }

  if (layoffData) sourcesUsed.push('layoffs.fyi');
  if (mcaData && mcaData.cin !== 'UNKNOWN') sourcesUsed.push('MCA India');
  sourcesUsed.push(roleData.source);
  if (newsData.signals.length > 0) sourcesUsed.push('News RSS/HN');

  const sectorCount = await getSectorLayoffCount(industry, 180);

  return {
    companyName,
    stock90DayChange: stock90d,
    revenueYoY,
    marketCapCr: marketCap,
    peRatio: pe,
    confirmedLayoffRounds: layoffData?.rounds ?? 0,
    mostRecentLayoffDate: layoffData?.mostRecentDate ?? null,
    mostRecentLayoffPct: layoffData?.mostRecentPct ?? null,
    sectorLayoff180d: sectorCount,
    mcaStatus: mcaData?.status ?? 'Unknown',
    filingDelinquent: mcaData?.filingDelinquent ?? false,
    roleDemandTrend: roleData.demandTrend,
    hiringFreezeScore: roleData.hiringFreezeScore,
    newsSentimentScore: newsData.sentimentScore,
    layoffNewsCount: newsData.layoffSignalCount,
    sourcesUsed,
    fetchedAt: new Date().toISOString(),
  };
}
