import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLayoff } from "../../context/LayoffContext";
import { searchAllCompanies, resolveCompanyData } from "../../data/companyIntelligenceBridge";
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
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onNext: () => void;
}

const ToggleGroup: React.FC<{
  options: { value: string; label: string; icon?: React.ReactNode; desc?: string }[];
  value: string;
  onChange: (val: string) => void;
  ariaLabel: string;
}> = ({ options, value, onChange, ariaLabel }) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    style={{
      display: "grid",
      gridTemplateColumns: options.length > 2 ? "repeat(auto-fit, minmax(120px, 1fr))" : "1fr 1fr",
      gap: "10px",
      marginBottom: "20px",
    }}
  >
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          role="radio"
          aria-checked={active}
          onClick={() => onChange(opt.value)}
          className={`card card-hover ${active ? "glow-border" : ""}`}
          style={{
            padding: "12px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            background: active ? "var(--cyan-dim)" : "rgba(255,255,255,0.03)",
            borderColor: active ? "var(--cyan)" : "var(--border)",
            cursor: "pointer",
            transition: "all 0.2s ease-out",
          }}
        >
          {opt.icon && <div style={{ fontSize: "1.2rem", color: active ? "var(--cyan)" : "var(--text-3)" }}>{opt.icon}</div>}
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: active ? "var(--text)" : "var(--text-2)" }}>{opt.label}</div>
          {opt.desc && <div style={{ fontSize: "0.65rem", color: "var(--text-3)", lineHeight: 1.2 }}>{opt.desc}</div>}
        </button>
      );
    })}
  </div>
);

const RiskPulse: React.FC<{ score: number }> = ({ score }) => {
  const color = riskScoreColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
      <div style={{ position: 'relative', width: 12, height: 12 }}>
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: color }} 
        />
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-3)' }}>LIVE RISK PULSE</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}>{score}%</span>
        </div>
        <div className="gauge-track" style={{ height: 4 }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ type: "spring", damping: 20 }}
            className="gauge-fill" 
            style={{ background: color }} 
          />
        </div>
      </div>
    </div>
  );
};

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

  // ── Step 2 Logic Hits Unconditionally ────────────────────────────────
  // Simple heuristic for "Pulse" score calculation
  const pulseScore = useMemo(() => {
    let base = selectedOracleEntry?.currentRiskScore || 45;
    if (performanceTier === 'top') base -= 15;
    if (performanceTier === 'below') base += 25;
    if (tenureYears < 1) base += 10;
    if (tenureYears > 8) base -= 12;
    if (isUniqueRole) base -= 10;
    if (hasRecentPromotion) base -= 8;
    if (hasKeyRelationships) base -= 5;
    return Math.min(99, Math.max(1, base));
  }, [selectedOracleEntry, performanceTier, tenureYears, isUniqueRole, hasRecentPromotion, hasKeyRelationships]);

  // ── Company search with debounce — BUG-B6 FIX ────────────────────────
  useEffect(() => {
    const tid = setTimeout(async () => {
      if (!companySearch || companySearch.length < 2 || selectedCompany) {
        setSearchResults([]);
        return;
      }

      // Local lookup is fast, do it immediately but display with external
      const local = searchAllCompanies(companySearch).map((c) => {
        const fullData = resolveCompanyData(c.key);
        return { ...(fullData as any), isExternal: false };
      });

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
      const localMatch = resolveCompanyData(comp.name);
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


  return (
    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="glass-panel"
          style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}
        >
          {step === 1 ? (
             <div>
              <header style={{ marginBottom: '32px' }}>
                <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>STEP 01/02</div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '8px' }}>Target Identification</h2>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Specify the company and role to initialize the Oracle sensors.</p>
              </header>

              {profileFailed && (
                <div style={{
                  background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b",
                  borderRadius: "8px", padding: "12px", marginBottom: "20px",
                  fontSize: "0.82rem", color: "#f59e0b", display: "flex", gap: "10px",
                }}>
                  <span>⚠</span>
                  <p>Company not found in our verified database. Using industry defaults.</p>
                </div>
              )}

              <div className="input-wrap" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.05em' }}>COMPANY NAME</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search company..."
                    value={companySearch}
                    onChange={handleCompanySearch}
                    className="input"
                    style={{ paddingRight: '100px' }}
                  />
                  {isProfiling && <div style={{ position: 'absolute', right: '12px', top: '16px' }} className="spinner" />}
                  {selectedCompany && !isProfiling && <span style={{ position: 'absolute', right: '12px', top: '16px', fontSize: '0.65rem', color: 'var(--cyan)', fontWeight: 800 }}>VERIFIED</span>}
                </div>
                {searchResults.length > 0 && (
                  <div className="glass-panel-heavy" style={{ position: "absolute", zIndex: 100, width: '100%', marginTop: '56px', borderRadius: '12px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
                    {searchResults.map(res => (
                      <div key={res.name} onClick={() => selectCompany(res)} className="tab-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 16px', height: 'auto', borderRadius: 0, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontWeight: 700 }}>{res.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{res.industry}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-wrap" style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.05em' }}>JOB ROLE</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search role..."
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="input"
                  />
                </div>
                {showRoleSuggestions && (
                   <div className="glass-panel-heavy" style={{ position: "absolute", zIndex: 100, width: '100%', marginTop: '80px', borderRadius: '12px', overflow: 'hidden', maxHeight: '300px', overflowY: 'auto' }}>
                    {roleSuggestions.map(entry => (
                      <div key={entry.oracleKey} onClick={() => selectRole(entry)} className="tab-btn" style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px', height: 'auto', borderRadius: 0, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700 }}>{entry.displayTitle}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{entry.summary.slice(0, 40)}...</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: riskScoreColor(entry.currentRiskScore) }}>{entry.currentRiskScore}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedOracleEntry && <RoleIntelPreviewCard entry={selectedOracleEntry} />}

              <button
                onClick={handleNextStep1}
                disabled={!canProceedStep1}
                className="btn btn-cyan btn-lg btn-full"
                style={{ marginTop: '24px' }}
              >
                Continue Analysis →
              </button>
            </div>
          ) : (
            <div>
              <header style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                   <div className="badge badge-cyan">STEP 02/02</div>
                   <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm" style={{ padding: 0, color: 'var(--text-3)' }}>← Back</button>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '8px' }}>Individual Factors</h2>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Contextual data for human amplification and shield metrics.</p>
              </header>

              <RiskPulse score={pulseScore} />

              <div className="grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
                 <div className="input-wrap">
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)' }}>COMPANY TENURE</label>
                    <select value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="input">
                      <option value={0.3}>&lt; 6 months</option>
                      <option value={1.5}>1–2 years</option>
                      <option value={5}>5+ years</option>
                    </select>
                 </div>
                 <div className="input-wrap">
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)' }}>TOTAL EXPERIENCE</label>
                    <select value={careerYears} onChange={(e) => setCareerYears(Number(e.target.value))} className="input">
                      <option value={2}>&lt; 2 years</option>
                      <option value={7}>5–10 years</option>
                      <option value={15}>15+ years</option>
                    </select>
                 </div>
              </div>

              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: '8px' }}>PERFORMANCE TIER</label>
              <ToggleGroup
                ariaLabel="Performance"
                options={[
                  { value: 'top', label: 'Top', icon: '★', desc: 'Exceeding targets' },
                  { value: 'average', label: 'High', icon: '✔', desc: 'Meeting goals' },
                  { value: 'below', label: 'Dev', icon: '⚠', desc: 'Needs improvement' }
                ]}
                value={performanceTier}
                onChange={v => setPerformanceTier(v as "top" | "average" | "below" | "unknown")}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {[
                    { key: 'unique', label: 'Role Uniqueness', active: isUniqueRole, setter: setIsUniqueRole, icon: '💎' },
                    { key: 'promo', label: 'Recent Promotion', active: hasRecentPromotion, setter: setHasRecentPromotion, icon: '↗' },
                    { key: 'stake', label: 'Key Relationships', active: hasKeyRelationships, setter: setHasKeyRelationships, icon: '🤝' }
                  ].map(item => (
                    <button 
                      key={item.key} 
                      onClick={() => item.setter(!item.active)}
                      className="card card-hover"
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        background: item.active ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.03)',
                        borderColor: item.active ? 'var(--cyan)' : 'var(--border)',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <div style={{ fontSize: '1rem' }}>{item.icon}</div>
                      <div style={{ flex: 1, textAlign: 'left', fontSize: '0.85rem', fontWeight: 700 }}>{item.label}</div>
                      {item.active && <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 800 }}>ACTIVE</div>}
                    </button>
                  ))}
              </div>

              <button
                onClick={handleCalculate}
                className="btn btn-primary btn-lg btn-full"
                style={{ background: 'var(--text)', color: 'var(--bg)' }}
              >
                Execute Full Audit →
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
