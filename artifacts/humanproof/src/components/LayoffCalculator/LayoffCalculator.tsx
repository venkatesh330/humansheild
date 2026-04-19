import React, { useState, useRef } from "react";
import { useLayoff } from "../../context/LayoffContext";
import { LayoffInputForm } from "./LayoffInputForm";
import { LayoffScoreDisplay } from "./LayoffScoreDisplay";
import {
  calculateLayoffScore,
  simulateScenario,
  createUnknownCompanyFallback,
  ScoreInputs,
  ScenarioOverrides,
} from "../../services/layoffScoreEngine";
import { runFullEnsembleAnalysis } from "../../services/ensemble/ensembleOrchestrator";
import { LayoffActionPlan } from "./LayoffActionPlan";
import { layoffNewsCache } from "../../data/layoffNewsCache";
import { AgentNetworkDisplay } from "./AgentNetworkDisplay";
import {
  AgentBreakdownPanel,
  transformSignalsForDisplay,
} from "./AgentBreakdownPanel";
import { DisplacementTrajectoryPanel } from "./DisplacementTrajectoryPanel";
import { OracleResult } from "../../services/DisplacementTrajectoryEngine";
import { OracleInsightsPanel } from "./OracleInsightsPanel";
import { ScoreConfidenceInterval } from "./ScoreConfidenceInterval";
import { WhatIfSkillSimulator } from "./WhatIfSkillSimulator";
import { KeyRiskDriversPanel } from "./KeyRiskDriversPanel";
import { LayoffAuditDashboard } from "./LayoffAuditDashboard";
import { mapToHybridResult } from "../../utils/hybridResultMapper";
import { resolveCompanyData } from "../../data/companyIntelligenceBridge";
import { COMPANY_INTELLIGENCE_DB } from "../../data/companyIntelligenceDB";
import { getCompanyByName, CompanyData } from "../../data/companyDatabase";
import { industryRiskData, IndustryRisk } from "../../data/industryRiskData";
import { RoleExposure } from "../../data/roleExposureData";
import { saveLayoffScore } from "../../services/scoreStorageService";
import { LayoffAlertBanner } from "./LayoffAlertBanner";
import { LayoffShareCard } from "./LayoffShareCard";
import { LayoffScoreHistory } from "./LayoffScoreHistory";
import { LayoffScenarioPanel } from "./LayoffScenarioPanel";
import { RecommendationPanel } from "./RecommendationPanel";
import { MissionBriefing, recommendationsToMissions } from "./MissionBriefing";
import { SpyLoadingState } from "./SpyLoadingState";
import { supabase } from "../../utils/supabase";
import {
  getCareerIntelligence,
  CareerIntelligence,
} from "../../data/intelligence/index";
import { getAutoDeducedDepartment } from "../../data/oracleRoleIndex";
import { countryCodeToD5Key } from "../../data/companyDatabase";
import { injectLayoffEvent } from "../../data/layoffNewsCache";

interface Props {
  /** Optional: passed from ToolsPage so action plan links can switch tabs */
  onSwitchTab?: (tabId: string) => void;
}

// ── Helper: derive experience bracket from tenure years ───────────────────────
const deriveExperience = (tenureYears: number): string => {
  if (tenureYears < 2) return "0-2";
  if (tenureYears < 5) return "2-5";
  if (tenureYears < 10) return "5-10";
  if (tenureYears < 15) return "10-15";
  return "15+";
};

// Toast notification — replaces alert()
const Toast: React.FC<{
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Determine styles and icon based on type
  const getStyle = () => {
    switch (type) {
      case "success":
        return { bg: "rgba(16,185,129,0.95)", icon: "✓" };
      case "error":
        return { bg: "rgba(239,68,68,0.95)", icon: "✗" };
      case "warning":
        return { bg: "rgba(245,158,11,0.95)", icon: "⚠" };
      case "info":
        return { bg: "rgba(59,130,246,0.95)", icon: "ℹ" };
    }
  };
  const { bg, icon } = getStyle();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 10000,
        background: bg,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        animation: "fadeIn 0.3s ease-in",
      }}
    >
      {icon} {message}
    </div>
  );
};

export const LayoffCalculator: React.FC<Props> = ({ onSwitchTab }) => {
  const { state, dispatch } = useLayoff();
  const [showShareCard, setShowShareCard] = useState(false);
  const [lastScoreInputs, setLastScoreInputs] = useState<ScoreInputs | null>(
    null,
  );
  // 0=idle, 1=engine+agents running, 2=gemini synthesizing, 3=done
  const [ensembleStage, setEnsembleStage] = useState(0);
  // Data quality flag: 'live' | 'partial' | 'fallback'
  const [dataQuality, setDataQuality] = useState<
    "live" | "partial" | "fallback"
  >("live");
  // ── [TRAJECTORY] Oracle result for Displacement Trajectory panel ──────────
  const [oracleResult, setOracleResult] = useState<OracleResult | null>(null);
  // ── [INTEL] Local CareerIntelligence for OracleInsightsPanel ─────────────
  const [careerIntelligence, setCareerIntelligence] =
    useState<CareerIntelligence | null>(null);

  // ── BUG FIX: Double-submit guard ─────────────────────────────────────────
  const isSubmitting = useRef(false);

  // ── ARCHITECTURE: Session result cache ────────────────────────────────────
  // Key = companyName + roleKey + experience + country hash (10-min TTL)
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  const buildCacheKey = (
    company: string,
    roleKey: string,
    exp: string,
    country: string,
  ) => `hp_score_cache__${company.toLowerCase()}_${roleKey}_${exp}_${country}`;

  // Restore last cached result on mount (so page refresh re-surfaces last session)
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem("hp_last_score_session");
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (!cached?.result || !cached?.ts) return;
      if (Date.now() - cached.ts > CACHE_TTL_MS) return;
      // Only restore if calculator is idle and has no result yet
      if (!state.hasCompletedAssessment && !state.isCalculating) {
        dispatch({ type: "SET_SCORE_RESULT", payload: cached.result });
        // SET_INPUTS accepts a partial payload for companyName and roleTitle
        dispatch({
          type: "SET_INPUTS",
          payload: {
            companyName: cached.companyName ?? null,
            roleTitle: cached.roleTitle ?? null,
          },
        });
        if (cached.dataQuality) setDataQuality(cached.dataQuality);
        if (cached.oracleResult) setOracleResult(cached.oracleResult);
        if (cached.careerIntel) setCareerIntelligence(cached.careerIntel);
      }
    } catch {
      /* sessionStorage unavailable — ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── ARCHITECTURE: Circuit breaker for Oracle fetch ─────────────────────────
  // Retries up to 2 times with 500ms backoff before returning null (silent fallback).
  const fetchOracleWithRetry = async (
    url: string,
    body: object,
    retries = 2,
  ): Promise<Response | null> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000), // 8s timeout per attempt
        });
        if (res.ok) return res;
        if (res.status >= 400 && res.status < 500) return null; // Client error — don't retry
        throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1))); // 500ms, 1000ms
          continue;
        }
        console.warn(
          `[Oracle] All ${retries + 1} attempts failed — using fallback`,
          err,
        );
        return null;
      }
    }
    return null;
  };

  const handleCalculate = async () => {
    // ── BUG FIX: Prevent concurrent submissions ────────────────────────────
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    dispatch({ type: "SET_CALCULATING", payload: true });
    setEnsembleStage(0);
    setDataQuality("live");
    setOracleResult(null);
    setCareerIntelligence(null);

    // BUG-C4 FIX: Track data quality locally through each OSINT branch then
    // refine after ensemble resolves — avoids stale React async state closure.
    let computedQuality: "live" | "partial" | "fallback" = "fallback";

    try {
      let companyData: CompanyData | null = null;
      let companyFallback: CompanyData | null = state.companyData || null;

      if (state.companyName) {
        // Fetch dynamic data from OSINT Edge Function for ALL companies
        const reqBody: any = { companyName: state.companyName };
        if (state.companyData?.source === "User Input") {
          reqBody.employeeCount = state.companyData.employeeCount;
          reqBody.isPublic = state.companyData.isPublic;
          reqBody.industry = state.companyData.industry;
        }

        const { data, error } = await supabase.functions.invoke(
          "fetch-company-data",
          { body: reqBody },
        );

        if (data && !error && data.data) {
          const osintData = data.data;

          const resolvedIsPublic = Boolean(
            osintData.is_public === true || osintData.is_public === "true",
          );

          const resolvedLayoffs: { date: string; percentCut: number }[] =
            Array.isArray(osintData.recent_layoffs)
              ? osintData.recent_layoffs.map((l: any) => ({
                  date: l.date ?? new Date().toISOString(),
                  percentCut:
                    typeof l.percent_cut === "number" ? l.percent_cut : 5,
                }))
              : osintData.recent_layoff_news
                ? [
                    {
                      date: new Date().toISOString(),
                      percentCut: osintData.last_layoff_percent ?? 5,
                    },
                  ]
                : [];

          const resolvedLayoffRounds =
            typeof osintData.layoff_rounds === "number"
              ? osintData.layoff_rounds
              : resolvedLayoffs.length;

          const resolvedRevPerEmp: number =
            typeof osintData.revenue_per_employee === "number"
              ? osintData.revenue_per_employee
              : osintData.annual_revenue && osintData.employee_count
                ? Math.round(
                    osintData.annual_revenue / osintData.employee_count,
                  )
                : 150_000;

          companyData = {
            name: osintData.company_name,
            ticker: osintData.ticker ?? osintData.stock_ticker,
            isPublic: resolvedIsPublic,
            industry: osintData.industry || "Technology",
            region: osintData.region ?? osintData.country_code ?? "GLOBAL",
            employeeCount: osintData.employee_count || 500,
            revenueGrowthYoY: osintData.revenue_yoy ?? null,
            stock90DayChange: osintData.stock_90d_change ?? null,
            layoffsLast24Months: resolvedLayoffs,
            layoffRounds: resolvedLayoffRounds,
            lastLayoffPercent:
              osintData.last_layoff_percent ??
              (resolvedLayoffs.length > 0
                ? resolvedLayoffs[0].percentCut
                : null),
            revenuePerEmployee: resolvedRevPerEmp,
            aiInvestmentSignal: osintData.ai_investment_signal ?? "medium",
            source: data.source || "Live OSINT Database",
            lastUpdated: osintData.last_updated ?? new Date().toISOString(),
          };

          // ── BUG-C3 FIX: Inject live layoff news from OSINT into runtime cache ──
          // This makes `newsRisk` (L2) active for any company the OSINT layer returns
          // layoff data for, not just the 3 companies seeded in layoffNewsCache.
          if (
            companyData.layoffsLast24Months &&
            companyData.layoffsLast24Months.length > 0
          ) {
            const latestLayoff = companyData.layoffsLast24Months[0];
            injectLayoffEvent({
              companyName: companyData.name,
              date: latestLayoff.date,
              headline: `${companyData.name} reduced headcount by ${latestLayoff.percentCut}% — live OSINT signal`,
              percentCut: latestLayoff.percentCut,
              source: companyData.source || "Live OSINT",
              url: "",
              affectedDepartments: ["All Departments"],
            });
          }

          // ── BUG-C4 FIX: Track data quality as local var — will be refined after ensemble ──
          const hasRichData =
            companyData.revenueGrowthYoY !== null ||
            companyData.layoffsLast24Months.length > 0;
          computedQuality = hasRichData ? "live" : "partial";
          setDataQuality(computedQuality);

          dispatch({
            type: "SHOW_TOAST",
            payload: {
              message: `Live data loaded — ${data.source ?? "OSINT"}`,
              type: "success",
            },
          });

          if (data?.dataFreshness?.stale) {
            dispatch({
              type: "SHOW_TOAST",
              payload: {
                message: `Data is stale (${data.dataFreshness.staleThresholdHours}h SLA) — confidence has been reduced`,
                type: "warning",
              },
            });
          }
        } else {
          console.warn("Fallback: Failed to fetch live data", error);
          companyData =
            companyFallback || getCompanyByName(state.companyName || "");
          // ── BUG FIX: Make fallback visible to user ─────────────────────────
          setDataQuality("fallback");
        }
      }

      if (!companyData) {
        companyData = {
          name: state.companyName || "Unknown",
          isPublic: false,
          industry: "Technology",
          region: "GLOBAL",
          employeeCount: 500,
          revenueGrowthYoY: null,
          stock90DayChange: null,
          layoffsLast24Months: [],
          layoffRounds: 0,
          lastLayoffPercent: null,
          revenuePerEmployee: 150000,
          aiInvestmentSignal: "medium",
          source: "Fallback",
          lastUpdated: new Date().toISOString(),
        };
        computedQuality = "fallback";
        setDataQuality("fallback");
      }

      let fetchedIndustryData: IndustryRisk | undefined;
      let fetchedRoleExposure: RoleExposure | undefined;

      try {
        const [indRes, roleRes] = await Promise.all([
          supabase
            .from("industry_risk_data")
            .select("*")
            .eq("sector_name", companyData.industry)
            .maybeSingle(),
          supabase
            .from("role_exposure_data")
            .select("*")
            .ilike("role_title", state.roleTitle || "")
            .maybeSingle(),
        ]);

        if (indRes.data) {
          fetchedIndustryData = {
            baselineRisk: indRes.data.baseline_risk,
            aiAdoptionRate: indRes.data.ai_adoption_rate,
            growthOutlook: indRes.data.growth_outlook,
            avgLayoffRate2025: indRes.data.avg_layoff_rate_2025,
          };
        }
        if (roleRes.data) {
          fetchedRoleExposure = {
            aiRisk: roleRes.data.ai_risk,
            layoffRisk: roleRes.data.layoff_risk,
            demandTrend: roleRes.data.demand_trend,
          };
        }
      } catch (e) {
        console.warn("Failed to fetch dynamic risk tables", e);
      }

      const industryData: IndustryRisk | undefined =
        fetchedIndustryData || industryRiskData[companyData.industry];

      const inputs: ScoreInputs = {
        companyData,
        industryData,
        roleTitle: state.roleTitle || "Employee",
        department: state.department || "Operations",
        userFactors: state.userFactors || {
          tenureYears: 1.5,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: false,
        },
        roleExposureOverride: fetchedRoleExposure,
      };
      setLastScoreInputs(inputs);

      // ── [INTELLIGENCE] Resolve oracle role key: prefer context key set by form,
      //    fall back to experience-based derivation for manual text input.
      const oracleRoleKey = state.oracleKey || "generic";

      // ── BUG-C1 FIX: Use total career experience (careerYears) for D4/Oracle
      //    bracket, NOT company tenure. A 15-yr veteran who joined 1yr ago should
      //    NOT be classified as junior ("0-2" bracket).
      const careerExp =
        inputs.userFactors?.careerYears ?? inputs.userFactors.tenureYears;
      const oracleExp = deriveExperience(careerExp);

      // ── BUG-M1 FIX: Normalise region/country to COUNTRY_RISK_PROFILES key
      //    OSINT populates companyData.region with codes like "IN", "US", "EU".
      //    countryCodeToD5Key() maps them to "india", "usa", "germany" etc.
      //    which match the keys used in COUNTRY_RISK_PROFILES for D5 scoring.
      const rawRegion = companyData.region || "GLOBAL";
      const d5CountryKey = countryCodeToD5Key(rawRegion);

      // ── [INTELLIGENCE] Load CareerIntelligence from local DB immediately ──
      const localIntel = getCareerIntelligence(oracleRoleKey);
      if (localIntel) setCareerIntelligence(localIntel);

      // ── [INTELLIGENCE] Auto-derive department if not already set ─────────
      if (!inputs.department && oracleRoleKey !== "generic") {
        inputs.department = getAutoDeducedDepartment(oracleRoleKey);
      }

      // ── BUG FIX: Stage 1 — Swarm + engine firing ─────────────────────────
      setEnsembleStage(1);

      // ── [TRAJECTORY] Fire Oracle + Ensemble in PARALLEL ──────────────────
      const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";
      const oracleBody = {
        roleKey: oracleRoleKey,
        industry: companyData.industry,
        experience: oracleExp,
        // BUG-M1 FIX: Send the normalised D5 country key (e.g. 'india', 'uk')
        // not the raw region string ('IN', 'EU') which doesn't match COUNTRY_RISK_PROFILES
        country: d5CountryKey,
      };

      // ── ARCHITECTURE: Check session cache before firing API ──────────────────
      const cacheKey = buildCacheKey(
        companyData.name,
        oracleRoleKey,
        oracleExp,
        d5CountryKey,
      );
      let cachedOracleResult: OracleResult | null = null;
      try {
        const rawCache = sessionStorage.getItem(cacheKey);
        if (rawCache) {
          const { value, ts } = JSON.parse(rawCache);
          if (Date.now() - ts < CACHE_TTL_MS) cachedOracleResult = value;
        }
      } catch {
        /* ignore */
      }

      const oraclePromise = cachedOracleResult
        ? Promise.resolve(cachedOracleResult)
        : fetchOracleWithRetry(`${apiBase}/api/v1/grounded-risk`, oracleBody)
            .then((res) => (res ? res.json() : null))
            .then((data) => {
              if (data && Array.isArray(data.dimensions)) {
                // Store in session cache for this input combination
                try {
                  sessionStorage.setItem(
                    cacheKey,
                    JSON.stringify({ value: data, ts: Date.now() }),
                  );
                } catch {
                  /* quota exceeded — ignore */
                }
                setOracleResult(data as OracleResult);
                return data as OracleResult;
              }
              return null;
            })
            .catch((err) => {
              console.warn(
                "[Trajectory] Oracle circuit breaker exhausted — using fallback:",
                err,
              );
              return null;
            });

      // ── BUG FIX: Stage transitions driven by orchestrator callbacks ─────────
      // We start the analysis and trigger stage 2 based on swarm completion
      let swarmDone = false;
      const analysisPromise = runFullEnsembleAnalysis({
        companyName: companyData.name,
        companyData,
        industry: companyData.industry,
        industryData,
        roleTitle: inputs.roleTitle,
        department: inputs.department,
        tenureYears: inputs.userFactors.tenureYears,
        isUniqueRole: inputs.userFactors.isUniqueRole,
        performanceTier: inputs.userFactors.performanceTier,
        hasRecentPromotion: inputs.userFactors.hasRecentPromotion,
        hasKeyRelationships: inputs.userFactors.hasKeyRelationships,
        roleExposureOverride: fetchedRoleExposure,
        onSwarmComplete: () => {
          // Swarm done → advance to Gemini synthesis stage
          swarmDone = true;
          setEnsembleStage(2);
        },
      });

      // Fallback stage advance after 4s if swarm completes very quickly (no callback yet)
      const stageTimer = setTimeout(() => {
        // BUG-B2 FIX: Use functional update to avoid stale closure of ensembleStage
        if (!swarmDone) {
          setEnsembleStage((prev) => (prev < 2 ? 2 : prev));
        }
      }, 4000);

      // Await both in parallel — ensemble drives the main result, oracle enriches it
      let ensembleResult: any;
      let resolvedOracle: any;

      try {
        [ensembleResult, resolvedOracle] = await Promise.all([
          analysisPromise,
          oraclePromise,
        ]);
      } catch (err) {
        console.warn(
          "[Ensemble] Critical failure, falling back to deterministic engine:",
          err,
        );
        // BUG-E4 FIX: Manual fallback to deterministic engine if ensemble crashes
        const engineOnly = calculateLayoffScore(inputs);
        ensembleResult = {
          score: engineOnly.score,
          confidence: 45,
          confidencePercent: 45,
          tier: engineOnly.tier,
          breakdown: engineOnly.breakdown,
          recommendations: engineOnly.recommendations,
          modelsUsed: [],
          isFallback: true, // Flag for UI to show "Limited Mode"
        };
        resolvedOracle = null;
      }

      clearTimeout(stageTimer);

      // Stage 3: Done — result is ready
      setEnsembleStage(3);

      // ── BUG-C4 FIX: Refine dataQuality AFTER both promises resolve ─────────
      // Previously dataQuality was set during OSINT (before ensemble ran).
      // Now we upgrade it based on actual ensemble quality: if Oracle succeeded
      // AND 3+ models responded, we have genuine live data. Otherwise downgrade.
      const finalQuality: "live" | "partial" | "fallback" =
        resolvedOracle && (ensembleResult.modelsUsed?.length ?? 0) >= 3
          ? "live"
          : (ensembleResult.modelsUsed?.length ?? 0) >= 2
            ? computedQuality === "fallback"
              ? "fallback"
              : "partial"
            : computedQuality;
      setDataQuality(finalQuality);

      // ── ENHANCEMENT: Enhance result with dataQuality + oracle + career intel ─
      const enrichedResult = {
        ...ensembleResult,
        dataQuality: finalQuality,
        oracleResult: resolvedOracle ?? undefined,
        careerIntelligence: localIntel ?? undefined,
      };

      dispatch({ type: "SET_SCORE_RESULT", payload: enrichedResult });

      const modelCount = ensembleResult.modelsUsed?.length || 1;
      const liveAgents = ensembleResult.swarmReport?.liveAgentsUsed ?? 0;
      const swarmInfo = liveAgents > 0 ? ` · ${liveAgents} live signals` : "";
      dispatch({
        type: "SHOW_TOAST",
        payload: {
          message:
            modelCount >= 4
              ? `4-model ensemble · ${ensembleResult.confidencePercent}% confidence${swarmInfo}`
              : `Analysis complete · ${ensembleResult.confidence} confidence`,
          type: "success",
        },
      });

      // ── ENHANCEMENT: Server-side score sync for authenticated users ──────────
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id && state.companyName && state.roleTitle) {
          // BUG-05 FIX: Use finalQuality (local const) not dataQuality state —
          // React state is async; dataQuality may be stale at this point in the closure.
          await supabase.from("layoff_scores").insert({
            user_id: session.user.id,
            company_name: state.companyName,
            role_title: state.roleTitle,
            department: state.department || "",
            score: ensembleResult.score,
            tier: ensembleResult.tier.label,
            tier_color: ensembleResult.tier.color,
            confidence: ensembleResult.confidence,
            breakdown: ensembleResult.breakdown,
            models_used: ensembleResult.modelsUsed,
            data_quality: finalQuality, // ← local const, not stale state
            calculated_at: new Date().toISOString(),
          });
        }
      } catch (syncError) {
        console.warn("[Layoff] Server score sync failed:", syncError);
      }

      // ── ARCHITECTURE: Persist result to sessionStorage for page-refresh recovery
      try {
        sessionStorage.setItem(
          "hp_last_score_session",
          JSON.stringify({
            result: enrichedResult,
            companyName: state.companyName,
            roleTitle: state.roleTitle,
            dataQuality: finalQuality,
            oracleResult: resolvedOracle ?? null,
            careerIntel: localIntel ?? null,
            ts: Date.now(),
          }),
        );
      } catch {
        /* quota exceeded — ignore */
      }
    } catch (e) {
      console.error(e);

      // ── HIERARCHICAL FALLBACK: Post-Generation Recovery ──────────────
      // If the cloud ensemble fails, we attempt a seamless fallback to the
      // local 2000+ company intelligence database before giving up.
      try {
        console.log("[AuditPipeline] Ensemble failed, attempting local DB fallback...");
        const fallbackCD = resolveCompanyData(state.companyName || "") || createUnknownCompanyFallback(state.companyName || "Unknown");
        const engineOnly = calculateLayoffScore({
          companyData: fallbackCD,
          roleTitle: state.roleTitle || "Unknown",
          department: state.department || "",
          userFactors: state.userFactors || { tenureYears: 3, isUniqueRole: false, performanceTier: "average", hasRecentPromotion: false, hasKeyRelationships: false }
        });

        const fallbackResult = {
          ...engineOnly,
          ensembleScore: engineOnly.score,
          engineScore: engineOnly.score,
          modelsUsed: [],
          isFallback: true,
          dataQuality: "fallback" as const
        };

        dispatch({ type: "SET_SCORE_RESULT", payload: fallbackResult });
        setDataQuality("fallback");
        setEnsembleStage(3);
        
        dispatch({
          type: "SHOW_TOAST",
          payload: {
            message: "Using local intelligence database fallback.",
            type: "success",
          },
        });
        return;
      } catch (fallbackError) {
        dispatch({
          type: "SHOW_TOAST",
          payload: {
            message: "Analysis failed — please try again.",
            type: "error",
          },
        });
      }
    } finally {
      // ── BUG FIX: ALWAYS reset isCalculating, success or failure ──────────
      dispatch({ type: "SET_CALCULATING", payload: false });
      isSubmitting.current = false;
    }
  };

  const handleSave = () => {
    if (state.scoreResult && state.companyName && state.roleTitle) {
      saveLayoffScore(
        state.scoreResult,
        state.companyName,
        state.roleTitle,
        state.department || "",
      );
      dispatch({ type: "INCREMENT_SAVE_COUNTER" });
      dispatch({
        type: "SHOW_TOAST",
        payload: { message: "Score saved to your history!", type: "success" },
      });
    }
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  const handleRetake = () => {
    dispatch({ type: "RESET" });
    setLastScoreInputs(null);
    isSubmitting.current = false;
  };

  const handleScenarioSimulate = (overrides: ScenarioOverrides) => {
    if (!lastScoreInputs) return null;
    return simulateScenario(lastScoreInputs, overrides);
  };

  return (
    <div className="layoff-calculator-wrapper" style={{ padding: "24px 0" }}>
      {!state.hasCompletedAssessment && !state.isCalculating && (
        <>
          <LayoffAlertBanner />
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                color: "#fff",
                marginBottom: "8px",
                fontWeight: 700,
              }}
            >
              Layoff Risk Estimator
            </h1>
            <p
              style={{
                color: "#9ba5b4",
                fontSize: "1.1rem",
                maxWidth: "480px",
                margin: "0 auto",
              }}
            >
              Know your layoff risk before it knows you. Powered by real company
              signals, role data, and market trends.
            </p>
          </div>
          <LayoffInputForm onNext={handleCalculate} />
        </>
      )}

      {state.isCalculating && (
        <SpyLoadingState
          stage={ensembleStage}
          companyName={state.companyName}
          roleTitle={state.roleTitle}
          agentCount={30}
        />
      )}

      {state.hasCompletedAssessment &&
        state.scoreResult &&
        !state.isCalculating && (
          <LayoffAuditDashboard
            result={mapToHybridResult(
              state.scoreResult,
              state.companyData || (state.scoreResult as any).companyData || { name: state.companyName || "Unknown", industry: "Technology", region: "GLOBAL", employeeCount: 500, isPublic: false, revenuePerEmployee: 150000, aiInvestmentSignal: "medium", source: "Fallback", lastUpdated: new Date().toISOString() },
              {
                roleTitle: state.roleTitle || "",
                department: state.department || "",
                tenureYears: state.userFactors?.tenureYears || 3,
                oracleKey: state.oracleKey,
                experience: deriveExperience(state.userFactors?.careerYears ?? state.userFactors?.tenureYears ?? 3)
              },
              dataQuality
            )}
            companyData={
              state.companyData || (state.scoreResult as any).companyData || { name: state.companyName || "Unknown", industry: "Technology", region: "GLOBAL", employeeCount: 500, isPublic: false, revenuePerEmployee: 150000, aiInvestmentSignal: "medium", source: "Fallback", lastUpdated: new Date().toISOString() }
            }
            onRetake={handleRetake}
          />
        )}

      {showShareCard && state.scoreResult && (
        <LayoffShareCard
          score={state.scoreResult.score}
          tier={state.scoreResult.tier}
          companyName={state.companyName || "Unknown"}
          roleTitle={state.roleTitle || "Unknown"}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {state.showToast && (
        <Toast
          message={state.showToast.message}
          type={state.showToast.type}
          onClose={() => dispatch({ type: "HIDE_TOAST" })}
        />
      )}
    </div>
  );
};
