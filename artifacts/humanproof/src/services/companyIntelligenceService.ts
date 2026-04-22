// companyIntelligenceService.ts
// Supabase-backed company intelligence lookup — replaces all code-side company datasets.
// Queries the `company_intelligence` table (2000+ records) with exact + fuzzy matching.
// Also owns the learning loop (confidence_score updates) and discovery queue capture.

import { supabase } from '../utils/supabase';
import { CompanyProfile } from '../data/companyIntelligenceDB';
import { companyProfileToData } from '../data/companyIntelligenceBridge';
import type { CompanyData } from '../data/companyDatabase';

// ── Row shape from Supabase company_intelligence table ────────────────────────
// Supports both jsonb-nested and flat column layouts — reads whichever is present.
interface CIRow {
  id?: string;
  company_name: string;
  industry: string;
  company_size?: string;
  stage?: string;
  stock_ticker?: string;
  region?: string;
  // jsonb columns (nested) — preferred
  financial_signals?: Record<string, any>;
  layoff_history?: Record<string, any>;
  hiring_signals?: Record<string, any>;
  role_risk_map?: Record<string, any>;
  // flat column fallbacks
  revenue_trend?: string;
  funding_stage?: string;
  burn_rate_estimate?: string;
  last_funding_date?: string;
  total_layoffs?: number;
  last_layoff_date?: string;
  layoff_frequency?: string;
  affected_departments?: string[];
  hiring_velocity?: string;
  hiring_freeze_score?: number;
  // scores
  ai_exposure_index?: number;
  market_risk_score?: number;
  company_risk_score?: number;
  confidence_score?: number;
  last_updated?: string;
}

// ── Map Supabase row → CompanyProfile ─────────────────────────────────────────

function rowToProfile(row: CIRow): CompanyProfile {
  const fin = row.financial_signals ?? {};
  const lay = row.layoff_history ?? {};
  const hire = row.hiring_signals ?? {};
  const risk = row.role_risk_map ?? {};

  return {
    companyName: row.company_name,
    industry: row.industry,
    companySize: (row.company_size ?? 'mid') as CompanyProfile['companySize'],
    stage: (row.stage ?? 'mature') as CompanyProfile['stage'],
    stockTicker: row.stock_ticker ?? undefined,

    financialSignals: {
      revenueTrend: (fin.revenueTrend ?? row.revenue_trend ?? 'stable') as CompanyProfile['financialSignals']['revenueTrend'],
      fundingStage: (fin.fundingStage ?? row.funding_stage ?? 'public') as CompanyProfile['financialSignals']['fundingStage'],
      burnRateEstimate: (fin.burnRateEstimate ?? row.burn_rate_estimate ?? 'moderate') as CompanyProfile['financialSignals']['burnRateEstimate'],
      lastFundingDate: fin.lastFundingDate ?? row.last_funding_date,
    },

    layoffHistory: {
      totalLayoffs: lay.totalLayoffs ?? row.total_layoffs ?? 0,
      lastLayoffDate: lay.lastLayoffDate ?? row.last_layoff_date ?? 'none',
      layoffFrequency: (lay.layoffFrequency ?? row.layoff_frequency ?? 'none') as CompanyProfile['layoffHistory']['layoffFrequency'],
      affectedDepartments: lay.affectedDepartments ?? row.affected_departments ?? [],
    },

    hiringSignals: {
      hiringVelocity: (hire.hiringVelocity ?? row.hiring_velocity ?? 'moderate') as CompanyProfile['hiringSignals']['hiringVelocity'],
      hiringFreezeScore: hire.hiringFreezeScore ?? row.hiring_freeze_score ?? 0.3,
    },

    roleRiskMap: {
      softwareEngineer: risk.softwareEngineer ?? risk.software_engineer ?? 0.4,
      productManager:   risk.productManager ?? risk.product_manager ?? 0.35,
      dataScientist:    risk.dataScientist ?? risk.data_scientist ?? 0.3,
      designer:         risk.designer ?? 0.35,
      hrRecruiter:      risk.hrRecruiter ?? risk.hr_recruiter ?? 0.55,
      sales:            risk.sales ?? 0.45,
    },

    aiExposureIndex: row.ai_exposure_index ?? 0.5,
    marketRiskScore: row.market_risk_score ?? 0.4,
    companyRiskScore: row.company_risk_score ?? 0.4,
    confidenceScore: row.confidence_score ?? 0.5,
    lastUpdated: row.last_updated ?? new Date().toISOString(),
  };
}

// ── Cache — avoid repeated Supabase calls for the same company in a session ───
const sessionCache = new Map<string, CompanyData | null>();

// ── Primary lookup: exact name match, then ILIKE fuzzy ───────────────────────

export async function queryCompanyIntelligence(
  companyName: string,
): Promise<CompanyData | null> {
  const cacheKey = companyName.toLowerCase().trim();
  if (sessionCache.has(cacheKey)) return sessionCache.get(cacheKey)!;

  try {
    // 1. Exact match (case-insensitive)
    const { data: exactRows, error: exactErr } = await supabase
      .from('company_intelligence')
      .select('*')
      .ilike('company_name', companyName.trim())
      .limit(1);

    if (!exactErr && exactRows && exactRows.length > 0) {
      const profile = rowToProfile(exactRows[0] as CIRow);
      const companyKey = companyName.toLowerCase().replace(/[\s.&()/]+/g, '_').replace(/[^a-z0-9_]/g, '');
      const companyData = companyProfileToData(profile, companyKey);
      sessionCache.set(cacheKey, companyData);
      return companyData;
    }

    // 2. Fuzzy ILIKE — partial word match
    const { data: fuzzyRows, error: fuzzyErr } = await supabase
      .from('company_intelligence')
      .select('*')
      .ilike('company_name', `%${companyName.trim()}%`)
      .limit(1);

    if (!fuzzyErr && fuzzyRows && fuzzyRows.length > 0) {
      const profile = rowToProfile(fuzzyRows[0] as CIRow);
      const companyKey = (fuzzyRows[0] as CIRow).company_name
        .toLowerCase().replace(/[\s.&()/]+/g, '_').replace(/[^a-z0-9_]/g, '');
      const companyData = companyProfileToData(profile, companyKey);
      sessionCache.set(cacheKey, companyData);
      return companyData;
    }
  } catch (err) {
    console.warn('[CompanyIntelligence] Supabase query failed:', err);
  }

  sessionCache.set(cacheKey, null);
  return null;
}

// ── Discovery queue — capture unknown companies for enrichment ────────────────

export async function saveToDiscoveryQueue(
  companyName: string,
  industry: string,
  roleTitle: string,
): Promise<void> {
  try {
    await supabase.from('company_discovery_queue').insert({
      company_name: companyName,
      industry,
      role_searched: roleTitle,
      searched_at: new Date().toISOString(),
      status: 'pending',
    });
  } catch {
    // Fire-and-forget — never block the audit flow
  }
}

// ── Learning loop — update confidence_score after audit outcome feedback ───────

export async function updateCompanyConfidence(
  companyName: string,
  delta: number, // +0.05 for correct prediction, -0.05 for incorrect
): Promise<void> {
  try {
    // Read current confidence
    const { data } = await supabase
      .from('company_intelligence')
      .select('id, confidence_score')
      .ilike('company_name', companyName)
      .limit(1);

    if (!data || data.length === 0) return;

    const row = data[0] as { id: string; confidence_score: number };
    const newScore = Math.max(0.1, Math.min(1.0, (row.confidence_score ?? 0.5) + delta));

    await supabase
      .from('company_intelligence')
      .update({ confidence_score: newScore, last_updated: new Date().toISOString() })
      .eq('id', row.id);

    // Invalidate session cache so next query gets fresh confidence
    sessionCache.delete(companyName.toLowerCase().trim());
  } catch {
    // Learning loop is non-critical — never block
  }
}

// ── Search helper — for UI autocomplete / CompanyWatchPanel ──────────────────

export async function searchCompanies(
  query: string,
  limit = 10,
): Promise<{ name: string; industry: string; riskScore: number }[]> {
  try {
    const { data, error } = await supabase
      .from('company_intelligence')
      .select('company_name, industry, company_risk_score')
      .ilike('company_name', `%${query}%`)
      .limit(limit);

    if (error || !data) return [];
    return (data as any[]).map(r => ({
      name: r.company_name,
      industry: r.industry,
      riskScore: Math.round((r.company_risk_score ?? 0.4) * 100),
    }));
  } catch {
    return [];
  }
}
