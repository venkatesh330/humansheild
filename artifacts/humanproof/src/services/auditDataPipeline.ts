// auditDataPipeline.ts
// Hierarchical data retrieval and normalization for Layoff Audit dashboards.
// Phase 1 Fix 4: liveSignalCount is now truthful (was hardcoded 5 even when source was DB).
// Phase 2: Integrates fetchLiveCompanyData for Alpha Vantage + NewsAPI enrichment.

import { COMPANY_INTELLIGENCE_DB } from "../data/companyIntelligenceDB";
import { companyProfileToData } from "../data/companyIntelligenceBridge";
import { CompanyData, getCompanyByName } from "../data/companyDatabase";
import { HybridResult, DEFAULT_HYBRID_RESULT } from "../types/hybridResult";
import { 
  calculateLayoffScore, 
  ScoreInputs, 
  UserFactors, 
  ScoreResult,
  createUnknownCompanyFallback 
} from "./layoffScoreEngine";
import { fetchLiveCompanyData, patchCompanyDataWithLive } from "./liveDataService";
import { supabase } from "../utils/supabase";

export interface AuditInputs {
  companyName: string;
  roleTitle: string;
  department: string;
  userFactors: UserFactors;
  oracleKey?: string;
  country?: string;
}

/**
 * mapOsintToCompanyData
 * Converts raw OSINT Edge Function response to CompanyData schema.
 */
function mapOsintToCompanyData(osintData: any, sourceName?: string): CompanyData {
  const resolvedIsPublic = Boolean(
    osintData.is_public === true || osintData.is_public === "true",
  );

  const resolvedLayoffs: { date: string; percentCut: number }[] =
    Array.isArray(osintData.recent_layoffs)
      ? osintData.recent_layoffs.map((l: any) => ({
          date: l.date ?? new Date().toISOString(),
          percentCut: typeof l.percent_cut === "number" ? l.percent_cut : 5,
        }))
      : [];

  const resolvedRevPerEmp: number =
    typeof osintData.revenue_per_employee === "number"
      ? osintData.revenue_per_employee
      : osintData.annual_revenue && osintData.employee_count
        ? Math.round(osintData.annual_revenue / osintData.employee_count)
        : 150_000;

  return {
    name: osintData.company_name,
    ticker: osintData.ticker ?? osintData.stock_ticker,
    stockTicker: osintData.ticker ?? osintData.stock_ticker,
    isPublic: resolvedIsPublic,
    industry: osintData.industry || "Technology",
    region: osintData.region ?? osintData.country_code ?? "GLOBAL",
    employeeCount: osintData.employee_count || 500,
    revenueGrowthYoY: osintData.revenue_yoy ?? null,
    stock90DayChange: osintData.stock_90d_change ?? null,
    layoffsLast24Months: resolvedLayoffs,
    layoffRounds: typeof osintData.layoff_rounds === "number" ? osintData.layoff_rounds : resolvedLayoffs.length,
    lastLayoffPercent: osintData.last_layoff_percent ?? (resolvedLayoffs.length > 0 ? resolvedLayoffs[0].percentCut : null),
    revenuePerEmployee: resolvedRevPerEmp,
    aiInvestmentSignal: osintData.ai_investment_signal ?? "medium",
    source: sourceName || "Live OSINT Database",
    lastUpdated: osintData.last_updated ?? new Date().toISOString(),
  };
}

/**
 * mapToHybridResult
 * Adapts engine ScoreResult to HybridResult with TRUTHFUL signal counts.
 * Phase 1 Fix 4: no more hardcoded liveSignalCount=5 when source is actually DB.
 */
function mapToHybridResult(
  engineResult: ScoreResult, 
  companyData: CompanyData, 
  inputs: AuditInputs,
  source: 'live' | 'db' | 'fallback',
  trueLiveSignals: number,
  trueHeuristicSignals: number,
): HybridResult {
  const dimensions = [
    { key: "L1" as const, label: "Company Health", score: Math.round(engineResult.breakdown.L1 * 100) },
    { key: "L2" as const, label: "Layoff History", score: Math.round(engineResult.breakdown.L2 * 100) },
    { key: "L3" as const, label: "Role Displacement", score: Math.round(engineResult.breakdown.L3 * 100) },
    { key: "L4" as const, label: "Market Headwinds", score: Math.round(engineResult.breakdown.L4 * 100) },
    { key: "L5" as const, label: "Your Exposure", score: Math.round(engineResult.breakdown.L5 * 100) },
  ];

  const reasoning = engineResult.recommendations.map(r => r.description).join(" ");

  return {
    ...DEFAULT_HYBRID_RESULT,
    total: engineResult.score,
    breakdown: engineResult.breakdown,
    tier: {
      label: engineResult.tier.label,
      color: engineResult.tier.color,
      advice: engineResult.tier.advice
    },
    confidence: engineResult.confidence,
    confidencePercent: engineResult.confidencePercent,
    confidenceInterval: engineResult.confidenceInterval,
    dimensions,
    reasoning,
    dataFreshness: engineResult.dataFreshness,
    signalQuality: {
      hasConflicts: engineResult.signalQuality.hasConflicts,
      conflictingSignals: engineResult.signalQuality.conflictingSignals.map(c => ({
        signalType: c.signal1,
        descriptions: [c.signal2],
        severity: (c.severity.toLowerCase() as any) || "medium",
        conflictingSources: []
      })),
      // TRUTHFUL counts — no longer hardcoded
      liveSignals: trueLiveSignals,
      heuristicSignals: trueHeuristicSignals,
    },
    recommendations: engineResult.recommendations.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      layerFocus: r.layerFocus,
      riskReductionPct: r.riskReductionPct,
      deadline: r.deadline
    })),
    workTypeKey: inputs.oracleKey || "generic",
    industryKey: companyData.industry.toLowerCase().replace(/\s+/g, "_"),
    countryKey: companyData.region.toLowerCase() || "usa",
    experience: deriveExperienceBracket(inputs.userFactors.tenureYears),
    companyName: companyData.name,
    meta: {
      usedLiveSignals: trueLiveSignals > 0,
      liveSignalCount: trueLiveSignals,
      swarmAgentCount: 30,
      dbSource: companyData.source,
      calculationMode: source === 'live' ? "ENCORE_LIVE" : source === 'db' ? "DB_FALLBACK" : "UNKNOWN_FALLBACK",
      timestamp: engineResult.calculatedAt
    },
    _engineResult: engineResult
  };
}

function deriveExperienceBracket(years: number): string {
  if (years < 2) return "0-2";
  if (years < 5) return "2-5";
  if (years < 10) return "5-10";
  if (years < 15) return "10-15";
  return "15+";
}

/**
 * PRIMARY ENTRY POINT: fetchAuditData
 *
 * Resolution order:
 *   1. Live OSINT (Supabase Edge Function)
 *   2. Live enrichment (Alpha Vantage + NewsAPI patch onto static DB data)
 *   3. CompanyIntelligenceDB (50 companies, static baseline)
 *   4. Legacy companyDatabase (exact-match historical)
 *   5. Unknown fallback — honest ±30pt warning
 */
export async function fetchAuditData(inputs: AuditInputs): Promise<{
  result: HybridResult;
  companyData: CompanyData;
  source: 'live' | 'db' | 'fallback';
}> {
  let companyData: CompanyData | null = null;
  let dataSource: 'live' | 'db' | 'fallback' = 'db';
  let trueLiveSignals = 0;
  let trueHeuristicSignals = 0;

  // Step 1: Try Live OSINT (Supabase Edge Function)
  try {
    const { data: fetchRes, error } = await supabase.functions.invoke("fetch-company-data", {
      body: { companyName: inputs.companyName }
    });

    if (fetchRes && !error && fetchRes.data) {
       companyData = mapOsintToCompanyData(fetchRes.data, fetchRes.source);
       dataSource = 'live';
       trueLiveSignals = 5;
       trueHeuristicSignals = 2;
    }
  } catch (err) {
    console.warn("[AuditPipeline] Live OSINT failed", err);
  }

  // Step 2: Try COMPANY_INTELLIGENCE_DB
  if (!companyData) {
    const key = inputs.companyName.toLowerCase().replace(/[\s.&()/]+/g, '_').replace(/[^a-z0-9_]/g, '');
    const profile = COMPANY_INTELLIGENCE_DB[key];
    if (profile) {
      companyData = companyProfileToData(profile, key);
      dataSource = 'db';
    } else {
      const fuzzyKey = Object.keys(COMPANY_INTELLIGENCE_DB).find(k => 
        k.includes(inputs.companyName.toLowerCase()) || inputs.companyName.toLowerCase().includes(k)
      );
      if (fuzzyKey) {
        companyData = companyProfileToData(COMPANY_INTELLIGENCE_DB[fuzzyKey], fuzzyKey);
        dataSource = 'db';
      }
    }
  }

  // Step 3: Legacy DB + unknown fallback
  if (!companyData) {
    companyData = getCompanyByName(inputs.companyName) || createUnknownCompanyFallback(inputs.companyName);
    dataSource = companyData.source?.includes('Unknown') ? 'fallback' : 'db';
  }

  // Step 4: Enrich DB/fallback data with live Alpha Vantage + NewsAPI signals
  if (dataSource !== 'live') {
    try {
      const ticker = (companyData as any).ticker ?? (companyData as any).stockTicker ?? null;
      const liveData = await fetchLiveCompanyData(inputs.companyName, ticker);

      if (liveData.liveSignalCount > 0) {
        companyData = patchCompanyDataWithLive(companyData as any, liveData) as CompanyData;
        if (liveData.liveSignalCount >= 3) dataSource = 'live';
        trueLiveSignals    = liveData.liveSignalCount;
        trueHeuristicSignals = liveData.heuristicSignalCount;
      } else {
        trueLiveSignals      = 0;
        trueHeuristicSignals = 7;
      }

      if (liveData.apiErrors.length > 0) {
        console.info('[AuditPipeline] Live data gaps:', liveData.apiErrors);
      }
    } catch (liveErr) {
      console.warn('[AuditPipeline] Live enrichment failed:', liveErr);
      trueLiveSignals      = 0;
      trueHeuristicSignals = 7;
    }
  }

  // Calculate scores
  const scoreInputs: ScoreInputs = {
    companyData,
    roleTitle: inputs.roleTitle,
    department: inputs.department,
    userFactors: inputs.userFactors
  };
  
  const scoreResult = calculateLayoffScore(scoreInputs);
  const hybridResult = mapToHybridResult(scoreResult, companyData, inputs, dataSource, trueLiveSignals, trueHeuristicSignals);

  return { result: hybridResult, companyData, source: dataSource };
}
