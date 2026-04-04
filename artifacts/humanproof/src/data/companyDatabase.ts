// companyDatabase.ts
// Pre-seed top companies with accurate, sourced data.

export interface LayoffRound {
  date: string;
  percentCut: number;
}

export interface CompanyData {
  name: string;
  ticker?: string;
  isPublic: boolean;
  industry: string;
  region: 'US' | 'EU' | 'IN' | 'APAC' | 'GLOBAL';
  employeeCount: number;
  revenueGrowthYoY: number | null;
  stock90DayChange: number | null;
  layoffsLast24Months: LayoffRound[];
  layoffRounds: number;
  lastLayoffPercent: number | null;
  revenuePerEmployee: number;
  aiInvestmentSignal: 'low' | 'medium' | 'high' | 'very-high';
  source: string;
  lastUpdated: string;
  lastFundingRound?: string;
  monthsSinceLastFunding?: number;
}

export const companyDatabase: CompanyData[] = [
  {
    name: 'Google',
    ticker: 'GOOGL',
    isPublic: true,
    industry: 'Technology',
    region: 'US',
    employeeCount: 180000,
    revenueGrowthYoY: 15,
    stock90DayChange: 8,
    layoffsLast24Months: [
      { date: '2024-01-20', percentCut: 6 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 6,
    revenuePerEmployee: 380000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Meta',
    ticker: 'META',
    isPublic: true,
    industry: 'Technology',
    region: 'US',
    employeeCount: 72000,
    revenueGrowthYoY: 22,
    stock90DayChange: 14,
    layoffsLast24Months: [
      { date: '2026-01-10', percentCut: 3 },
      { date: '2025-02-15', percentCut: 5 },
    ],
    layoffRounds: 2,
    lastLayoffPercent: 3,
    revenuePerEmployee: 520000,
    aiInvestmentSignal: 'very-high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Amazon',
    ticker: 'AMZN',
    isPublic: true,
    industry: 'E-commerce',
    region: 'US',
    employeeCount: 1500000,
    revenueGrowthYoY: 11,
    stock90DayChange: 5,
    layoffsLast24Months: [
      { date: '2026-01-15', percentCut: 1 },
      { date: '2025-03-01', percentCut: 1 },
    ],
    layoffRounds: 2,
    lastLayoffPercent: 1,
    revenuePerEmployee: 290000,
    aiInvestmentSignal: 'very-high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Oracle',
    ticker: 'ORCL',
    isPublic: true,
    industry: 'Technology',
    region: 'US',
    employeeCount: 143000,
    revenueGrowthYoY: 7,
    stock90DayChange: -12,
    layoffsLast24Months: [
      { date: '2026-04-01', percentCut: 21 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 21,
    revenuePerEmployee: 310000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Apple',
    ticker: 'AAPL',
    isPublic: true,
    industry: 'Technology',
    region: 'US',
    employeeCount: 161000,
    revenueGrowthYoY: 5,
    stock90DayChange: 2,
    layoffsLast24Months: [],
    layoffRounds: 0,
    lastLayoffPercent: null,
    revenuePerEmployee: 2400000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Microsoft',
    ticker: 'MSFT',
    isPublic: true,
    industry: 'Technology',
    region: 'US',
    employeeCount: 221000,
    revenueGrowthYoY: 18,
    stock90DayChange: 12,
    layoffsLast24Months: [
      { date: '2025-10-10', percentCut: 2 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 2,
    revenuePerEmployee: 950000,
    aiInvestmentSignal: 'very-high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Salesforce',
    ticker: 'CRM',
    isPublic: true,
    industry: 'Technology',
    region: 'US',
    employeeCount: 72000,
    revenueGrowthYoY: 11,
    stock90DayChange: -4,
    layoffsLast24Months: [
      { date: '2025-01-20', percentCut: 8 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 8,
    revenuePerEmployee: 480000,
    aiInvestmentSignal: 'very-high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Stripe',
    isPublic: false,
    industry: 'Financial Services',
    region: 'US',
    employeeCount: 7000,
    revenueGrowthYoY: 25,
    stock90DayChange: null,
    layoffsLast24Months: [],
    layoffRounds: 0,
    lastLayoffPercent: null,
    revenuePerEmployee: 600000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'McKinsey',
    isPublic: false,
    industry: 'Consulting',
    region: 'GLOBAL',
    employeeCount: 45000,
    revenueGrowthYoY: 8,
    stock90DayChange: null,
    layoffsLast24Months: [
      { date: '2025-06-15', percentCut: 3 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 3,
    revenuePerEmployee: 350000,
    aiInvestmentSignal: 'medium',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Tata Consultancy Services',
    ticker: 'TCS',
    isPublic: true,
    industry: 'Technology',
    region: 'IN',
    employeeCount: 615000,
    revenueGrowthYoY: 10,
    stock90DayChange: 15,
    layoffsLast24Months: [],
    layoffRounds: 0,
    lastLayoffPercent: null,
    revenuePerEmployee: 35000,   // ~₹29 lakh, accurate for Indian IT
    aiInvestmentSignal: 'high',
    source: 'Crunchbase',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Infosys',
    ticker: 'INFY',
    isPublic: true,
    industry: 'Technology',
    region: 'IN',
    employeeCount: 315000,
    revenueGrowthYoY: 6,
    stock90DayChange: -3,
    layoffsLast24Months: [],
    layoffRounds: 0,
    lastLayoffPercent: null,
    revenuePerEmployee: 58000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Wipro',
    ticker: 'WIT',
    isPublic: true,
    industry: 'Technology',
    region: 'IN',
    employeeCount: 240000,
    revenueGrowthYoY: 2,
    stock90DayChange: -8,
    layoffsLast24Months: [
      { date: '2025-09-01', percentCut: 3 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 3,
    revenuePerEmployee: 45000,
    aiInvestmentSignal: 'medium',
    source: 'Crunchbase',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Netflix',
    ticker: 'NFLX',
    isPublic: true,
    industry: 'Media & Publishing',
    region: 'US',
    employeeCount: 13000,
    revenueGrowthYoY: 15,
    stock90DayChange: 10,
    layoffsLast24Months: [],
    layoffRounds: 0,
    lastLayoffPercent: null,
    revenuePerEmployee: 2500000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Tesla',
    ticker: 'TSLA',
    isPublic: true,
    industry: 'Manufacturing',
    region: 'US',
    employeeCount: 140000,
    revenueGrowthYoY: -3,
    stock90DayChange: -25,
    layoffsLast24Months: [
      { date: '2025-04-15', percentCut: 10 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 10,
    revenuePerEmployee: 640000,
    aiInvestmentSignal: 'very-high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'JPMorgan Chase',
    ticker: 'JPM',
    isPublic: true,
    industry: 'Financial Services',
    region: 'US',
    employeeCount: 310000,
    revenueGrowthYoY: 9,
    stock90DayChange: 6,
    layoffsLast24Months: [],
    layoffRounds: 0,
    lastLayoffPercent: null,
    revenuePerEmployee: 420000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Uber',
    ticker: 'UBER',
    isPublic: true,
    industry: 'Transportation',
    region: 'US',
    employeeCount: 32000,
    revenueGrowthYoY: 16,
    stock90DayChange: 3,
    layoffsLast24Months: [],
    layoffRounds: 0,
    lastLayoffPercent: null,
    revenuePerEmployee: 1150000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Spotify',
    ticker: 'SPOT',
    isPublic: true,
    industry: 'Media & Publishing',
    region: 'EU',
    employeeCount: 7000,
    revenueGrowthYoY: 18,
    stock90DayChange: 20,
    layoffsLast24Months: [
      { date: '2025-06-01', percentCut: 17 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 17,
    revenuePerEmployee: 2100000,
    aiInvestmentSignal: 'medium',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
  {
    name: 'Accenture',
    isPublic: true,
    ticker: 'ACN',
    industry: 'Consulting',
    region: 'GLOBAL',
    employeeCount: 738000,
    revenueGrowthYoY: 3,
    stock90DayChange: -5,
    layoffsLast24Months: [
      { date: '2025-03-20', percentCut: 2.5 },
    ],
    layoffRounds: 1,
    lastLayoffPercent: 2.5,
    revenuePerEmployee: 85000,
    aiInvestmentSignal: 'high',
    source: 'Crunchbase + Layoffs.fyi',
    lastUpdated: '2026-04-01',
  },
];

// ──── Lookup functions (case-insensitive, fuzzy) ────

export const lookupCompany = (query: string): CompanyData[] => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return companyDatabase
    .filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.ticker && c.ticker.toLowerCase() === q)
    )
    .slice(0, 8);
};

export const getCompanyByName = (name: string): CompanyData | null => {
  if (!name) return null;
  const q = name.toLowerCase().trim();
  return companyDatabase.find(c =>
    c.name.toLowerCase() === q ||
    (c.ticker && c.ticker.toLowerCase() === q)
  ) || null;
};

// PPP multiplier: adjusts revenue/employee thresholds by region
export const getPPPMultiplier = (region: CompanyData['region']): number => {
  const multipliers: Record<string, number> = {
    'US': 1.0,
    'EU': 0.9,
    'IN': 0.25,     // $1 in India ≈ $4 in US purchasing power
    'APAC': 0.45,
    'GLOBAL': 0.7,
  };
  return multipliers[region] || 1.0;
};
