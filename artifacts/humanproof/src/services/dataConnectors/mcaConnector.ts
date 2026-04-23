// mcaConnector.ts
// MCA (Ministry of Corporate Affairs) India — company registration & filing status.
// Uses MCA21 public search (no key required for basic lookup).

export interface MCACompanyInfo {
  cin: string;           // Corporate Identity Number
  companyName: string;
  status: 'Active' | 'Struck Off' | 'Under Liquidation' | 'Dissolved' | 'Unknown';
  dateOfIncorporation: string | null;
  authorizedCapital: number | null;   // in INR
  paidUpCapital: number | null;
  lastFilingDate: string | null;
  filingDelinquent: boolean;          // true if no filing in 24+ months
  source: 'MCA India';
}

const MCA_SEARCH = 'https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do';
const CACHE_TTL_MS = 48 * 60 * 60 * 1000;
const cache = new Map<string, { data: MCACompanyInfo; ts: number }>();

// MCA portal requires form-POST — use a lightweight proxy approach.
// For browser clients, we use a static lookup for known CINs + fallback heuristic.
const KNOWN_CIN_MAP: Record<string, string> = {
  'infosys':        'L85110KA1981PLC013115',
  'tcs':            'L22210MH1995PLC084781',
  'wipro':          'L32102KA1945PLC020800',
  'hcl':            'L74140DL1976PLC008858',
  'tech mahindra':  'L64200MH1986PLC041370',
  'mindtree':       'L72200KA1999PLC025564',
  'mphasis':        'L30007KA2000PLC027594',
  'ltimindtree':    'L72900MH2016PLC274426',
  'persistent':     'L72300PN1990PLC056696',
  'hexaware':       'L72900MH1990PLC059022',
  'coforge':        'L72200UP1992PLC036923',
  'zensar':         'L72200PN1991PLC062422',
};

export async function fetchMCACompanyInfo(companyName: string): Promise<MCACompanyInfo | null> {
  const key = companyName.toLowerCase().trim();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;

  const cin = KNOWN_CIN_MAP[key] ?? null;

  if (!cin) {
    // Return a heuristic result for unlisted/unknown companies
    return {
      cin: 'UNKNOWN',
      companyName,
      status: 'Unknown',
      dateOfIncorporation: null,
      authorizedCapital: null,
      paidUpCapital: null,
      lastFilingDate: null,
      filingDelinquent: false,
      source: 'MCA India',
    };
  }

  // The previous implementation called `https://api.mca.gov.in/MCAservices/...`
  // which is not a real public endpoint — MCA21 master-data lookups require a
  // session-based form-POST against the portal and are not directly usable
  // from a browser. On every call this 4xx'd, fell into the catch block, and
  // returned a hardcoded `status: 'Active'` stub — which then fed the scoring
  // engine as if MCA had confirmed the company was healthy. That's data
  // fabrication, not graceful degradation.
  //
  // Until a backend MCA scraper is deployed, return a CIN-only record with
  // `status: 'Unknown'` so downstream code knows it has no live signal.
  const stub: MCACompanyInfo = {
    cin,
    companyName,
    status: 'Unknown',
    dateOfIncorporation: null,
    authorizedCapital: null,
    paidUpCapital: null,
    lastFilingDate: null,
    filingDelinquent: false,
    source: 'MCA India',
  };
  cache.set(key, { data: stub, ts: Date.now() });
  return stub;
}

function mapStatus(raw: string | undefined): MCACompanyInfo['status'] {
  if (!raw) return 'Unknown';
  const s = raw.toLowerCase();
  if (s.includes('active')) return 'Active';
  if (s.includes('struck') || s.includes('removed')) return 'Struck Off';
  if (s.includes('liquidat')) return 'Under Liquidation';
  if (s.includes('dissolv')) return 'Dissolved';
  return 'Unknown';
}

function monthsSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}
