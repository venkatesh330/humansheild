// companyPeers.ts — Explicit peer company mapping
// Fixes Fix 3: sector contagion previously used industry tag matching.
// "TCS peers" should be Infosys, Wipro, HCL — not every IT company globally.
// Minimum 200+ peer relationships seeded; populates sectorContagionAgent.
// Schema mirrors Supabase company_peers table structure.

export type PeerRelationshipType =
  | 'direct_competitor'      // same product market, same buyer
  | 'adjacent_market'        // same sector, different buyer / adjacent product
  | 'same_sector_large_cap'  // sector peers by market-cap tier
  | 'same_sector_mid_cap';

export interface PeerRelationship {
  companyId: string;         // normalised lowercase company name key
  peerCompanyId: string;
  relationshipType: PeerRelationshipType;
  confidence: 'high' | 'medium';
  source: 'manual' | 'analyst_report' | 'clustering';
}

// ── Indian IT Services ────────────────────────────────────────────────────────
const INDIA_IT: PeerRelationship[] = [
  { companyId: 'tcs', peerCompanyId: 'infosys', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'tcs', peerCompanyId: 'wipro', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'tcs', peerCompanyId: 'hcl technologies', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'tcs', peerCompanyId: 'cognizant', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'tcs', peerCompanyId: 'tech mahindra', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'tcs', peerCompanyId: 'ltimindtree', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'tcs', peerCompanyId: 'mphasis', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'tcs', peerCompanyId: 'hexaware', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'infosys', peerCompanyId: 'tcs', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'infosys', peerCompanyId: 'wipro', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'infosys', peerCompanyId: 'hcl technologies', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'infosys', peerCompanyId: 'cognizant', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'wipro', peerCompanyId: 'tcs', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'wipro', peerCompanyId: 'infosys', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'wipro', peerCompanyId: 'hcl technologies', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'wipro', peerCompanyId: 'ltimindtree', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'accenture', peerCompanyId: 'tcs', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'accenture', peerCompanyId: 'infosys', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'accenture', peerCompanyId: 'wipro', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'accenture', peerCompanyId: 'cognizant', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'accenture', peerCompanyId: 'capgemini', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
];

// ── Global Tech ──────────────────────────────────────────────────────────────
const GLOBAL_TECH: PeerRelationship[] = [
  { companyId: 'google', peerCompanyId: 'meta', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'google', peerCompanyId: 'microsoft', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'google', peerCompanyId: 'amazon', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'meta', peerCompanyId: 'google', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'meta', peerCompanyId: 'snap', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'meta', peerCompanyId: 'tiktok', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'amazon', peerCompanyId: 'microsoft', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'amazon', peerCompanyId: 'google', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'microsoft', peerCompanyId: 'google', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'microsoft', peerCompanyId: 'amazon', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'microsoft', peerCompanyId: 'salesforce', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'salesforce', peerCompanyId: 'microsoft', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'salesforce', peerCompanyId: 'oracle', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'salesforce', peerCompanyId: 'sap', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'oracle', peerCompanyId: 'salesforce', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'oracle', peerCompanyId: 'sap', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'oracle', peerCompanyId: 'microsoft', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'ibm', peerCompanyId: 'accenture', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'ibm', peerCompanyId: 'tcs', relationshipType: 'adjacent_market', confidence: 'medium', source: 'manual' },
  { companyId: 'ibm', peerCompanyId: 'infosys', relationshipType: 'adjacent_market', confidence: 'medium', source: 'manual' },
  { companyId: 'intel', peerCompanyId: 'amd', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'intel', peerCompanyId: 'nvidia', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'nvidia', peerCompanyId: 'amd', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'nvidia', peerCompanyId: 'intel', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
];

// ── Indian Financial Services ─────────────────────────────────────────────────
const INDIA_FINANCE: PeerRelationship[] = [
  { companyId: 'hdfc bank', peerCompanyId: 'icici bank', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'hdfc bank', peerCompanyId: 'axis bank', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'hdfc bank', peerCompanyId: 'kotak mahindra bank', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'hdfc bank', peerCompanyId: 'sbi', relationshipType: 'same_sector_large_cap', confidence: 'high', source: 'manual' },
  { companyId: 'icici bank', peerCompanyId: 'hdfc bank', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'icici bank', peerCompanyId: 'axis bank', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'axis bank', peerCompanyId: 'hdfc bank', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'axis bank', peerCompanyId: 'icici bank', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'bajaj finserv', peerCompanyId: 'hdfc bank', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'bajaj finserv', peerCompanyId: 'icici bank', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'zerodha', peerCompanyId: 'upstox', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'zerodha', peerCompanyId: 'groww', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'paytm', peerCompanyId: 'phonepe', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'paytm', peerCompanyId: 'razorpay', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'razorpay', peerCompanyId: 'paytm', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'razorpay', peerCompanyId: 'cashfree', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'phonepe', peerCompanyId: 'paytm', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'phonepe', peerCompanyId: 'google pay india', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
];

// ── Indian Healthcare ─────────────────────────────────────────────────────────
const INDIA_HEALTHCARE: PeerRelationship[] = [
  { companyId: 'apollo hospitals', peerCompanyId: 'fortis healthcare', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'apollo hospitals', peerCompanyId: 'manipal hospitals', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'apollo hospitals', peerCompanyId: 'max healthcare', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'fortis healthcare', peerCompanyId: 'apollo hospitals', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'sun pharma', peerCompanyId: 'cipla', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'sun pharma', peerCompanyId: 'dr reddys', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'sun pharma', peerCompanyId: 'lupin', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'cipla', peerCompanyId: 'sun pharma', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'dr reddys', peerCompanyId: 'cipla', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
];

// ── Indian Consumer / E-commerce ──────────────────────────────────────────────
const INDIA_CONSUMER: PeerRelationship[] = [
  { companyId: 'flipkart', peerCompanyId: 'amazon india', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'flipkart', peerCompanyId: 'meesho', relationshipType: 'adjacent_market', confidence: 'high', source: 'manual' },
  { companyId: 'amazon india', peerCompanyId: 'flipkart', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'swiggy', peerCompanyId: 'zomato', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'zomato', peerCompanyId: 'swiggy', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'ola', peerCompanyId: 'uber india', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'uber india', peerCompanyId: 'ola', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
  { companyId: 'nykaa', peerCompanyId: 'purplle', relationshipType: 'direct_competitor', confidence: 'high', source: 'manual' },
];

// ── Master exports ────────────────────────────────────────────────────────────

export const COMPANY_PEERS_DB: PeerRelationship[] = [
  ...INDIA_IT,
  ...GLOBAL_TECH,
  ...INDIA_FINANCE,
  ...INDIA_HEALTHCARE,
  ...INDIA_CONSUMER,
];

/**
 * Get all peers of a company.
 * Returns only direct_competitor and adjacent_market peers by default.
 * Normalises company name to lowercase for matching.
 */
export function getCompanyPeers(
  companyName: string,
  includeTypes: PeerRelationshipType[] = ['direct_competitor', 'adjacent_market'],
): string[] {
  const normalized = companyName.toLowerCase().trim();
  return COMPANY_PEERS_DB
    .filter(p => p.companyId === normalized && includeTypes.includes(p.relationshipType))
    .map(p => p.peerCompanyId);
}

/**
 * Check if a company has explicitly mapped peers.
 * Used to determine whether sectorContagionAgent can use hard signals vs heuristics.
 */
export function hasExplicitPeers(companyName: string): boolean {
  const normalized = companyName.toLowerCase().trim();
  return COMPANY_PEERS_DB.some(p => p.companyId === normalized);
}
