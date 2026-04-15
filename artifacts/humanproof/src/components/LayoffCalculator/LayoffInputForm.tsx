import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLayoff } from "../../context/LayoffContext";
import { lookupCompany } from "../../data/companyDatabase";
import { CompanyData } from "../../data/companyDatabase";
import { profileUnknownCompany } from "../../services/ensemble/quickProfilerAgent";
import { Building, Info, Zap, Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  searchOracleRoles,
  getAutoDeducedDepartment,
  riskScoreColor,
  riskScoreLabel,
  OracleRoleEntry,
} from "../../data/oracleRoleIndex";

interface Props {
  onNext: () => void;
}

const ToggleGroup: React.FC<{
  options: string[];
  value: string;
  onChange: (val: string) => void;
  ariaLabel: string;
}> = ({ options, value, onChange, ariaLabel }) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    style={{
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginBottom: "20px",
    }}
  >
    {options.map((opt) => (
      <button
        key={opt}
        role="radio"
        aria-checked={value === opt}
        tabIndex={0}
        onClick={() => onChange(opt)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(opt);
          }
        }}
        style={{
          padding: "8px 16px",
          borderRadius: "20px",
          border: `1px solid ${value === opt ? "var(--cyan, #00F5FF)" : "rgba(255,255,255,0.1)"}`,
          background: value === opt ? "rgba(0,245,255,0.1)" : "transparent",
          color: value === opt ? "var(--cyan, #00F5FF)" : "#d1d5db",
          cursor: "pointer",
          transition: "all 0.2s",
          fontSize: "0.9rem",
        }}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ── Mini risk trend sparkline ────────────────────────────────────────────
const MiniSparkline: React.FC<{ trend: { riskScore: number }[]; color: string }> = ({
  trend,
  color,
}) => {
  if (!trend || trend.length < 2) return null;
  const W = 52,
    H = 20;
  const min = Math.min(...trend.map((t) => t.riskScore));
  const max = Math.max(...trend.map((t) => t.riskScore));
  const range = max - min || 1;
  const toX = (i: number) => (i / (trend.length - 1)) * W;
  const toY = (v: number) => H - ((v - min) / range) * H;
  const path = trend
    .map((t, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(t.riskScore).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Risk direction icon ──────────────────────────────────────────────────
const DirectionIcon: React.FC<{ direction: OracleRoleEntry["riskDirection"]; size?: number }> = ({
  direction,
  size = 12,
}) => {
  if (direction === "rising")
    return <TrendingUp size={size} color="#ef4444" />;
  if (direction === "falling")
    return <TrendingDown size={size} color="#10b981" />;
  return <Minus size={size} color="#f59e0b" />;
};

// ── Role Intelligence Preview Card (shown after role selection) ──────────
const RoleIntelPreviewCard: React.FC<{ entry: OracleRoleEntry }> = ({ entry }) => {
  const riskColor = riskScoreColor(entry.currentRiskScore);
  return (
    <div
      style={{
        margin: "8px 0 20px",
        padding: "14px 16px",
        background: `${riskColor}08`,
        border: `1px solid ${riskColor}30`,
        borderRadius: "10px",
        animation: "slideDown 0.25s ease-out",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div
            style={{
              color: riskColor,
              fontSize: "0.62rem",
              letterSpacing: "1.5px",
              fontFamily: "monospace",
              marginBottom: "2px",
              textTransform: "uppercase",
            }}
          >
            ORACLE ROLE INTELLIGENCE
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
            {entry.displayTitle}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <div
            style={{
              background: `${riskColor}18`,
              border: `1px solid ${riskColor}40`,
              borderRadius: "6px",
              padding: "3px 10px",
              color: riskColor,
              fontSize: "0.85rem",
              fontWeight: 800,
              fontFamily: "monospace",
            }}
          >
            {entry.currentRiskScore}%
          </div>
          <div style={{ color: "#6b7280", fontSize: "0.62rem", fontFamily: "monospace" }}>
            {riskScoreLabel(entry.currentRiskScore)}
          </div>
        </div>
      </div>

      {/* Summary */}
      <p style={{ margin: "0 0 10px", color: "#9ba5b4", fontSize: "0.82rem", lineHeight: 1.5 }}>
        {entry.summary.length > 120 ? entry.summary.slice(0, 120) + "…" : entry.summary}
      </p>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        {/* Safe skill */}
        {entry.topSafeSkill && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.72rem",
              color: "#10b981",
            }}
          >
            <Shield size={10} />
            {entry.topSafeSkill.length > 28 ? entry.topSafeSkill.slice(0, 28) + "…" : entry.topSafeSkill}
          </div>
        )}
        {/* At-risk skill */}
        {entry.topAtRiskSkill && entry.topAtRiskSkill !== "None" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.72rem",
              color: "#f59e0b",
            }}
          >
            <Zap size={10} />
            {entry.topAtRiskSkill.length > 28 ? entry.topAtRiskSkill.slice(0, 28) + "…" : entry.topAtRiskSkill}
          </div>
        )}
      </div>

      {/* Trend + tags */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <MiniSparkline trend={entry.riskTrend} color={riskColor} />
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <DirectionIcon direction={entry.riskDirection} size={11} />
            <span
              style={{
                color: entry.riskDirection === "rising" ? "#ef4444" : entry.riskDirection === "falling" ? "#10b981" : "#f59e0b",
                fontSize: "0.65rem",
                fontFamily: "monospace",
              }}
            >
              {entry.riskDirection === "rising" ? "Risk rising" : entry.riskDirection === "falling" ? "Risk falling" : "Stable"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {entry.contextTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                background: "rgba(124,58,255,0.12)",
                border: "1px solid rgba(124,58,255,0.25)",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "0.6rem",
                color: "#a78bfa",
                fontFamily: "monospace",
                letterSpacing: "0.5px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div
        style={{
          marginTop: "8px",
          fontSize: "0.62rem",
          color: "#4b5563",
          fontFamily: "monospace",
          textAlign: "right",
        }}
      >
        Oracle confidence: {entry.confidenceScore}%
      </div>
    </div>
  );
};

export const LayoffInputForm: React.FC<Props> = ({ onNext }) => {
  const { state, dispatch } = useLayoff();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [companySearch, setCompanySearch] = useState(state.companyName || "");
  const [searchResults, setSearchResults] = useState<
    (CompanyData & { logo?: string; domain?: string; isExternal?: boolean })[]
  >([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    state.companyData || null
  );
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileFailed, setProfileFailed] = useState(false);

  // Role search state — oracle-backed
  const [roleTitle, setRoleTitle] = useState(state.roleTitle || "");
  const [selectedOracleEntry, setSelectedOracleEntry] = useState<OracleRoleEntry | null>(null);
  const [roleSuggestions, setRoleSuggestions] = useState<OracleRoleEntry[]>([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const roleInputRef = useRef<HTMLInputElement>(null);

  // ── Company search with debounce — BUG-B6 FIX ────────────────────────
  useEffect(() => {
    const tid = setTimeout(async () => {
      if (!companySearch || companySearch.length < 2 || selectedCompany) {
        setSearchResults([]);
        return;
      }

      // Local lookup is fast, do it immediately but display with external
      const local = lookupCompany(companySearch).map((c) => ({ ...c, isExternal: false }));

      try {
        const resp = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${companySearch}`);
        if (resp.ok) {
          const external = await resp.json();
          const merged = [...local];
          external.forEach((ext: any) => {
            if (!merged.find((m) => m.name.toLowerCase() === ext.name.toLowerCase())) {
              merged.push({
                name: ext.name,
                logo: ext.logo,
                domain: ext.domain,
                isPublic: false,
                industry: "Detecting...",
                region: "GLOBAL",
                employeeCount: 0,
                layoffsLast24Months: [],
                layoffRounds: 0,
                lastLayoffPercent: null,
                revenuePerEmployee: 150000,
                aiInvestmentSignal: "medium",
                source: "Clearbit",
                lastUpdated: new Date().toISOString(),
                isExternal: true,
              } as any);
            }
          });
          setSearchResults(merged.slice(0, 8));
        } else {
          setSearchResults(local);
        }
      } catch (_) {
        setSearchResults(local);
      }
    }, 300);
    return () => clearTimeout(tid);
  }, [companySearch, selectedCompany]);

  // Step 2 state
  const [tenureYears, setTenureYears] = useState(state.userFactors?.tenureYears || 1.5);
  /** BUG-C1 FIX: Total career years across ALL jobs (not just current company) */
  const [careerYears, setCareerYears] = useState(state.userFactors?.careerYears ?? 5);
  const [isUniqueRole, setIsUniqueRole] = useState(state.userFactors?.isUniqueRole ?? false);
  const [performanceTier, setPerformanceTier] = useState(
    state.userFactors?.performanceTier || "average"
  );
  const [hasRecentPromotion, setHasRecentPromotion] = useState(
    state.userFactors?.hasRecentPromotion ?? false
  );
  const [hasKeyRelationships, setHasKeyRelationships] = useState(
    state.userFactors?.hasKeyRelationships ?? false
  );

  // ── Oracle role search with debounce ─────────────────────────────────
  useEffect(() => {
    const tid = setTimeout(() => {
      if (roleTitle.length >= 2) {
        const results = searchOracleRoles(roleTitle, 8);
        setRoleSuggestions(results);
        setShowRoleSuggestions(results.length > 0);
        setFocusedSuggestionIndex(-1);
        // If user typed something that no longer matches current selection, clear it
        if (selectedOracleEntry && !selectedOracleEntry.displayTitle.toLowerCase().includes(roleTitle.toLowerCase())) {
          setSelectedOracleEntry(null);
        }
      } else {
        setShowRoleSuggestions(false);
        setRoleSuggestions([]);
        setFocusedSuggestionIndex(-1);
      }
    }, 180);
    return () => clearTimeout(tid);
  }, [roleTitle]);

  const selectRole = (entry: OracleRoleEntry) => {
    setRoleTitle(entry.displayTitle);
    setSelectedOracleEntry(entry);
    setShowRoleSuggestions(false);
  };

  // Handle keyboard navigation for role suggestions — ENHANCEMENT-E3
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!showRoleSuggestions || roleSuggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev < roleSuggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && focusedSuggestionIndex >= 0) {
        e.preventDefault();
        selectRole(roleSuggestions[focusedSuggestionIndex]);
      } else if (e.key === "Escape") {
        setShowRoleSuggestions(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showRoleSuggestions, roleSuggestions, focusedSuggestionIndex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleInputRef.current && !roleInputRef.current.contains(e.target as Node)) {
        setShowRoleSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Company search trigger ──────────────────────────────────────────
  const handleCompanySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCompanySearch(val);
    setSelectedCompany(null);
  };

  const selectCompany = async (comp: any) => {
    setCompanySearch(comp.name);
    setSearchResults([]);
    if (comp.isExternal) {
      // BUG-B20 FIX: Quick re-lookup in local DB before firing expensive profile API.
      // Clearbit might return "Meta" while DB has "Meta Platforms" — we want to find the DB entry if possible.
      const localMatch = lookupCompany(comp.name)?.[0];
      if (localMatch && localMatch.name.toLowerCase() === comp.name.toLowerCase()) {
        setSelectedCompany(localMatch);
        return;
      }

      setIsProfiling(true);
      const profile = await profileUnknownCompany(comp.name);
      setIsProfiling(false);
      if (profile) {
        const fullComp: CompanyData = {
          ...comp,
          industry: profile.industry,
          isPublic: profile.isPublic,
          employeeCount: profile.employeeCount,
          region: profile.region,
          ticker: profile.ticker,
          source: `AI Profile (${comp.name})`,
        };
        setSelectedCompany(fullComp);
      } else {
        setSelectedCompany({ ...comp, industry: "Technology", employeeCount: 500, source: "User Entry" } as CompanyData);
      }
    } else {
      setSelectedCompany(comp);
    }
  };

  const handleNextStep1 = async () => {
    if (!companySearch || !roleTitle.trim()) return;
    let finalCompany = selectedCompany;
    if (!finalCompany) {
      setIsProfiling(true);
      const profile = await profileUnknownCompany(companySearch);
      setIsProfiling(false);
      if (!profile) setProfileFailed(true);
      else setProfileFailed(false);
      finalCompany = {
        name: companySearch,
        isPublic: profile?.isPublic ?? false,
        industry: profile?.industry ?? "Technology",
        region: profile?.region ?? "GLOBAL",
        employeeCount: profile?.employeeCount ?? 500,
        ticker: profile?.ticker,
        revenueGrowthYoY: null,
        stock90DayChange: null,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 150000,
        aiInvestmentSignal: "medium",
        source: profile ? `AI Profile (${companySearch})` : "User Input",
        lastUpdated: new Date().toISOString(),
      };
    }

    // Auto-derive department from oracle key
    const department = selectedOracleEntry
      ? getAutoDeducedDepartment(selectedOracleEntry.oracleKey)
      : "Operations";

    dispatch({ type: "SET_COMPANY_DATA", payload: finalCompany });
    dispatch({
      type: "SET_INPUTS",
      payload: {
        companyName: finalCompany.name,
        roleTitle: roleTitle.trim(),
        department,
        oracleKey: selectedOracleEntry?.oracleKey ?? null,
      },
    });
    setStep(2);
  };

  const handleCalculate = () => {
    // BUG-GAP8 FIX: Logic validation — career years cannot be less than company tenure
    let validatedCareerYears = careerYears;
    if (careerYears < tenureYears) {
      validatedCareerYears = tenureYears;
      setCareerYears(tenureYears);
    }

    dispatch({
      type: "SET_INPUTS",
      payload: {
        userFactors: {
          tenureYears,
          careerYears: validatedCareerYears,
          isUniqueRole,
          performanceTier: performanceTier as "top" | "average" | "below" | "unknown",
          hasRecentPromotion,
          hasKeyRelationships,
        },
      },
    });
    onNext();
  };

  const canProceedStep1 = companySearch.trim().length > 0 && roleTitle.trim().length > 0;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    marginBottom: "16px",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    color: "#d1d5db",
    fontSize: "0.9rem",
  };

  // ── Step 1 render ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ maxWidth: "500px", margin: "0 auto", animation: "fadeIn 0.3s ease-in" }}>
        <h2 style={{ color: "#fff", marginBottom: "24px" }}>Let's check your exposure</h2>

        {profileFailed && (
          <div style={{
            background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b",
            borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
            fontSize: "0.82rem", color: "#f59e0b", display: "flex", gap: "8px",
          }}>
            <span>⚠</span>
            <span>
              <strong>Company not found in our database.</strong> We'll use Technology industry
              defaults. For best accuracy, try the company's full registered name.
            </span>
          </div>
        )}

        {/* ── Company search ── */}
        <label htmlFor="company-input" style={labelStyle}>Company Name</label>
        <div style={{ position: "relative" }}>
          <input
            id="company-input"
            type="text"
            placeholder="Search company (e.g. Google, Tesla, TCS)"
            value={companySearch}
            onChange={handleCompanySearch}
            autoComplete="off"
            style={{
              ...inputStyle,
              borderColor: selectedCompany ? "var(--cyan, #00F5FF)" : "rgba(255,255,255,0.1)",
            }}
          />
          {isProfiling && (
            <div style={{ position: "absolute", right: "12px", top: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "12px", border: "2px solid rgba(0,245,255,0.2)", borderTopColor: "var(--cyan)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: "0.75rem", color: "#9ba5b4" }}>profiling…</span>
            </div>
          )}
          {selectedCompany && !isProfiling && (
            <div style={{ position: "absolute", right: "12px", top: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--cyan, #00F5FF)", fontSize: "0.8rem", fontWeight: 600 }}>MATCHED</span>
              {selectedCompany.ticker && (
                <span style={{ fontSize: "0.75rem", color: "#4b5563", background: "rgba(255,255,255,0.05)", padding: "1px 4px", borderRadius: "4px" }}>
                  {selectedCompany.ticker}
                </span>
              )}
            </div>
          )}
          {searchResults.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "var(--bg2, #111827)", border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 10, borderRadius: "8px", overflow: "hidden",
              maxHeight: "320px", overflowY: "auto",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)", marginTop: "4px",
            }}>
              {searchResults.map((res) => (
                <div
                  key={res.name + ((res as any).domain || "")}
                  onClick={() => selectCompany(res)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") selectCompany(res); }}
                  style={{
                    padding: "12px 16px", cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", gap: "14px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "6px",
                    background: "rgba(255,255,255,0.05)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                  }}>
                    {(res as any).logo ? (
                      <img src={(res as any).logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <Building size={16} color="#4b5563" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 500 }}>{res.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {res.industry !== "Detecting..." ? res.industry : (res as any).domain || "Global"}{" "}·{" "}
                      {res.employeeCount > 0 ? `${res.employeeCount.toLocaleString()} employees` : "Select to profile"}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.02)", color: "#4b5563", fontSize: "0.72rem", fontStyle: "italic", textAlign: "center" }}>
                Search powered by Clearbit & AI Intelligence
              </div>
            </div>
          )}
        </div>

        {selectedCompany && (
          <div style={{
            margin: "4px 0 20px", padding: "10px 14px",
            background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.1)",
            borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "10px",
            animation: "slideDown 0.3s ease-out",
          }}>
            <Info size={14} color="var(--cyan)" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div style={{ fontSize: "0.82rem", color: "#9ba5b4", lineHeight: 1.4 }}>
              <strong style={{ color: "var(--cyan)" }}>Analysis Profile:</strong>{" "}
              {selectedCompany.industry} ({selectedCompany.employeeCount?.toLocaleString()} staff) in{" "}
              {selectedCompany.region}. AI agents will now scan this profile for risk.
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* ── Role Intelligence Search Bar ── */}
        <label htmlFor="role-input" style={labelStyle}>
          Job Role
          <span style={{ color: "#6b7280", fontSize: "0.75rem", marginLeft: "8px", fontFamily: "monospace" }}>
            — powered by Risk Oracle Engine (400+ roles)
          </span>
        </label>
        <div ref={roleInputRef} style={{ position: "relative" }}>
          <input
            id="role-input"
            type="text"
            placeholder="e.g. Software Engineer, Financial Analyst, Nurse…"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            autoComplete="off"
            style={{
              ...inputStyle,
              borderColor: selectedOracleEntry ? "var(--cyan, #00F5FF)" : "rgba(255,255,255,0.1)",
            }}
          />
          {selectedOracleEntry && (
            <div style={{
              position: "absolute", right: "12px", top: "12px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <span style={{ color: "var(--cyan, #00F5FF)", fontSize: "0.75rem", fontWeight: 600, fontFamily: "monospace" }}>
                ORACLE ✓
              </span>
              <span
                style={{
                  background: `${riskScoreColor(selectedOracleEntry.currentRiskScore)}18`,
                  color: riskScoreColor(selectedOracleEntry.currentRiskScore),
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "4px",
                  border: `1px solid ${riskScoreColor(selectedOracleEntry.currentRiskScore)}40`,
                }}
              >
                {selectedOracleEntry.currentRiskScore}% risk
              </span>
            </div>
          )}

          {/* Oracle-powered suggestions dropdown */}
          {showRoleSuggestions && roleSuggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "var(--bg2, #111827)", border: "1px solid rgba(0,245,255,0.15)",
              zIndex: 10, borderRadius: "10px", overflow: "hidden",
              maxHeight: "380px", overflowY: "auto",
              boxShadow: "0 12px 30px -5px rgba(0,0,0,0.6)", marginTop: "4px",
            }}>
              <div style={{
                padding: "8px 14px 4px",
                fontSize: "0.62rem",
                color: "#6b7280",
                fontFamily: "monospace",
                letterSpacing: "1px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                ORACLE ROLE INTELLIGENCE — {roleSuggestions.length} MATCH{roleSuggestions.length !== 1 ? "ES" : ""}
              </div>
              {roleSuggestions.map((entry) => {
                const rc = riskScoreColor(entry.currentRiskScore);
                return (
                  <div
                    key={entry.oracleKey}
                    onClick={() => selectRole(entry)}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") selectRole(entry); }}
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background 0.15s",
                      background: focusedSuggestionIndex === roleSuggestions.indexOf(entry) ? "rgba(0,245,255,0.08)" : "transparent",
                      outline: focusedSuggestionIndex === roleSuggestions.indexOf(entry) ? "1px solid rgba(0,245,255,0.2)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      setFocusedSuggestionIndex(roleSuggestions.indexOf(entry));
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600 }}>
                          {entry.displayTitle}
                        </span>
                        {entry.contextTags.slice(0, 1).map((t) => (
                          <span key={t} style={{
                            background: "rgba(124,58,255,0.12)", border: "1px solid rgba(124,58,255,0.2)",
                            borderRadius: "4px", padding: "1px 5px",
                            fontSize: "0.58rem", color: "#a78bfa", fontFamily: "monospace",
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MiniSparkline trend={entry.riskTrend} color={rc} />
                        <span style={{
                          background: `${rc}18`, color: rc,
                          fontSize: "0.72rem", fontWeight: 700,
                          fontFamily: "monospace", padding: "2px 6px",
                          borderRadius: "4px", border: `1px solid ${rc}35`,
                          whiteSpace: "nowrap",
                        }}>
                          {entry.currentRiskScore}%
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.4 }}>
                      {entry.summary.length > 90 ? entry.summary.slice(0, 90) + "…" : entry.summary}
                    </div>
                  </div>
                );
              })}
              <div style={{
                padding: "8px 14px", background: "rgba(0,245,255,0.02)",
                color: "#4b5563", fontSize: "0.68rem", fontFamily: "monospace",
                textAlign: "center",
              }}>
                Risk Oracle Engine · 400+ roles · WEF Future of Jobs 2025
              </div>
            </div>
          )}
        </div>

        {/* Oracle Role Intelligence Preview Card */}
        {selectedOracleEntry && <RoleIntelPreviewCard entry={selectedOracleEntry} />}

        {/* Department: hidden, auto-derived — show as readonly info */}
        {selectedOracleEntry && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 12px", background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px",
            marginBottom: "20px", fontSize: "0.8rem", color: "#6b7280",
          }}>
            <span>Auto-detected department:</span>
            <span style={{ color: "#9ba5b4", fontWeight: 600 }}>
              {getAutoDeducedDepartment(selectedOracleEntry.oracleKey)}
            </span>
          </div>
        )}

        <button
          onClick={handleNextStep1}
          disabled={!canProceedStep1}
          aria-label="Continue to profile step"
          style={{
            width: "100%",
            padding: "14px",
            background: !canProceedStep1 ? "rgba(255,255,255,0.1)" : "var(--cyan, #00F5FF)",
            color: !canProceedStep1 ? "#6b7280" : "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: !canProceedStep1 ? "not-allowed" : "pointer",
            marginTop: selectedOracleEntry ? "0" : "16px",
            fontSize: "1rem",
            transition: "all 0.2s",
          }}
        >
          Continue →
        </button>
      </div>
    );
  }

  // ── Step 2 render ─────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", animation: "fadeIn 0.3s ease-in" }}>
      <h2 style={{ color: "#fff", marginBottom: "8px" }}>Your Profile</h2>
      <p style={{ color: "#9ba5b4", marginBottom: "24px" }}>
        These factors are private and stay on your device.
      </p>

      <label htmlFor="tenure-select" style={labelStyle}>
        How long have you worked at this company?
      </label>
      <select id="tenure-select" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} style={inputStyle}>
        <option value={0.3}>Less than 6 months</option>
        <option value={0.75}>6–12 months</option>
        <option value={1.5}>1–2 years</option>
        <option value={3}>3–4 years</option>
        <option value={6}>5–7 years</option>
        <option value={10}>8–12 years</option>
        <option value={15}>13+ years</option>
      </select>

      {/* BUG-C1 FIX: Career years across ALL jobs — used for Oracle D4 shield */}
      <label htmlFor="career-years-select" style={labelStyle}>
        Total years of professional experience <span style={{ color: '#6b7280', fontWeight: 400 }}>(across all employers)</span>
      </label>
      <select
        id="career-years-select"
        value={careerYears}
        onChange={(e) => setCareerYears(Number(e.target.value))}
        style={inputStyle}
      >
        <option value={1}>Less than 2 years</option>
        <option value={3}>2–5 years</option>
        <option value={7}>5–10 years</option>
        <option value={12}>10–15 years</option>
        <option value={18}>15+ years</option>
      </select>

      <label style={labelStyle}>Are you the only person in your role on your team?</label>
      <ToggleGroup
        ariaLabel="Role uniqueness"
        options={["Yes, I'm unique", "No, others do what I do"]}
        value={isUniqueRole ? "Yes, I'm unique" : "No, others do what I do"}
        onChange={(v) => setIsUniqueRole(v === "Yes, I'm unique")}
      />

      <label style={labelStyle}>How would you rate your recent performance?</label>
      <ToggleGroup
        ariaLabel="Performance tier"
        options={["Top performer", "Meeting expectations", "Below expectations", "Not sure"]}
        value={{ top: "Top performer", average: "Meeting expectations", below: "Below expectations", unknown: "Not sure" }[performanceTier] || "Meeting expectations"}
        onChange={(v) => {
          const map: Record<string, "top" | "average" | "below" | "unknown"> = {
            "Top performer": "top",
            "Meeting expectations": "average",
            "Below expectations": "below",
            "Not sure": "unknown",
          };
          setPerformanceTier(map[v] ?? "average");
        }}
      />

      <label style={labelStyle}>Have you been promoted in the last 12 months?</label>
      <ToggleGroup
        ariaLabel="Recent promotion"
        options={["Yes", "No"]}
        value={hasRecentPromotion ? "Yes" : "No"}
        onChange={(v) => setHasRecentPromotion(v === "Yes")}
      />

      <label style={labelStyle}>Do you have key client or stakeholder relationships?</label>
      <ToggleGroup
        ariaLabel="Key relationships"
        options={["Yes", "No"]}
        value={hasKeyRelationships ? "Yes" : "No"}
        onChange={(v) => setHasKeyRelationships(v === "Yes")}
      />

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button
          onClick={() => setStep(1)}
          aria-label="Go back to company step"
          style={{
            width: "30%", padding: "14px",
            background: "transparent", color: "#d1d5db",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleCalculate}
          aria-label="Calculate layoff risk"
          style={{
            width: "70%", padding: "14px",
            background: "var(--cyan, #00F5FF)", color: "#000",
            border: "none", borderRadius: "8px",
            fontWeight: 600, cursor: "pointer", fontSize: "1rem",
          }}
        >
          Calculate my risk →
        </button>
      </div>
    </div>
  );
};
