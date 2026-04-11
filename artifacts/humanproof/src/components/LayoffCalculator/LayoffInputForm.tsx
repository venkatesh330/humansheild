import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLayoff } from "../../context/LayoffContext";
import { lookupCompany } from "../../data/companyDatabase";
import { industryRiskData } from "../../data/industryRiskData";
import { getAllRoleTitles } from "../../data/roleExposureData";
import { CompanyData } from "../../data/companyDatabase";
import { profileUnknownCompany } from "../../services/ensemble/quickProfilerAgent";
import { Building, Search, Briefcase, Globe, Info } from "lucide-react";

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

export const LayoffInputForm: React.FC<Props> = ({ onNext }) => {
  const { state, dispatch } = useLayoff();
  const [step, setStep] = useState(1);
  const [manualMode, setManualMode] = useState(false);

  // Step 1 state
  const [companySearch, setCompanySearch] = useState(state.companyName || "");
  const [searchResults, setSearchResults] = useState<
    (CompanyData & { logo?: string; domain?: string; isExternal?: boolean })[]
  >([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    state.companyData || null,
  );
  const [isProfiling, setIsProfiling] = useState(false);
  const [roleTitle, setRoleTitle] = useState(state.roleTitle || "");
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [department, setDepartment] = useState(
    state.department || "Engineering",
  );
  const roleInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [tenureYears, setTenureYears] = useState(
    state.userFactors?.tenureYears || 1.5,
  );
  const [isUniqueRole, setIsUniqueRole] = useState(
    state.userFactors?.isUniqueRole ?? false,
  );
  const [performanceTier, setPerformanceTier] = useState(
    state.userFactors?.performanceTier || "average",
  );
  const [hasRecentPromotion, setHasRecentPromotion] = useState(
    state.userFactors?.hasRecentPromotion ?? false,
  );
  const [hasKeyRelationships, setHasKeyRelationships] = useState(
    state.userFactors?.hasKeyRelationships ?? false,
  );

  const allRoles = useMemo(() => getAllRoleTitles(), []);

  const handleCompanySearch = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setCompanySearch(val);
    setSelectedCompany(null);

    if (!val || val.length < 2) {
      setSearchResults([]);
      return;
    }

    // 1. Local Search (Instant)
    const local = lookupCompany(val).map((c) => ({ ...c, isExternal: false }));
    setSearchResults(local);

    // 2. Clearbit Autocomplete (Global)
    try {
      const resp = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${val}`,
      );
      if (resp.ok) {
        const external = await resp.json();
        // Merge results, removing duplicates based on name match
        const merged = [...local];
        external.forEach((ext: any) => {
          if (
            !merged.find((m) => m.name.toLowerCase() === ext.name.toLowerCase())
          ) {
            merged.push({
              name: ext.name,
              logo: ext.logo,
              domain: ext.domain,
              isPublic: false, // will profile later
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
      }
    } catch (err) {
      // ignore network errors for suggestions
    }
  };

  const selectCompany = async (comp: any) => {
    setCompanySearch(comp.name);
    setSearchResults([]);

    if (comp.isExternal) {
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
        // Fallback if AI fails
        setSelectedCompany({
          ...comp,
          industry: "Technology",
          employeeCount: 500,
          source: "User Entry",
        } as CompanyData);
      }
    } else {
      setSelectedCompany(comp);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (roleTitle.length >= 2) {
        const q = roleTitle.toLowerCase();
        // Smarter search: prioritize roles that start with the query, then simply contain it
        const matches = allRoles
          .filter((r) => r.toLowerCase().includes(q))
          .sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aIndex = aLower.indexOf(q);
            const bIndex = bLower.indexOf(q);
            if (aIndex === bIndex) return aLower.length - bLower.length; // shorter first if tied
            return aIndex - bIndex; // earlier match first
          })
          .slice(0, 6);
        setRoleSuggestions(matches);
        setShowRoleSuggestions(matches.length > 0);
      } else {
        setShowRoleSuggestions(false);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(timeoutId);
  }, [roleTitle, allRoles]);

  const handleRoleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleTitle(e.target.value);
  };

  const selectRole = (role: string) => {
    setRoleTitle(role);
    setShowRoleSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        roleInputRef.current &&
        !roleInputRef.current.contains(e.target as Node)
      ) {
        setShowRoleSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNextStep1 = async () => {
    if (!companySearch || !roleTitle.trim()) return;

    let finalCompany = selectedCompany;
    if (!finalCompany) {
      setIsProfiling(true);
      const profile = await profileUnknownCompany(companySearch);
      setIsProfiling(false);

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

    dispatch({ type: "SET_COMPANY_DATA", payload: finalCompany });
    dispatch({
      type: "SET_INPUTS",
      payload: {
        companyName: finalCompany.name,
        roleTitle: roleTitle.trim(),
        department,
      },
    });

    setStep(2);
  };

  const handleCalculate = () => {
    dispatch({
      type: "SET_INPUTS",
      payload: {
        userFactors: {
          tenureYears,
          isUniqueRole,
          performanceTier: performanceTier as
            | "top"
            | "average"
            | "below"
            | "unknown",
          hasRecentPromotion,
          hasKeyRelationships,
        },
      },
    });
    onNext();
  };

  const canProceedStep1 =
    companySearch.trim().length > 0 && roleTitle.trim().length > 0;

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

  const departments = [
    "Engineering",
    "Sales",
    "Product",
    "Marketing",
    "HR",
    "Finance",
    "Operations",
    "Legal",
    "Customer Support",
    "Research",
    "Design",
    "Data",
    "IT",
    "Supply Chain",
    "Administration",
  ];

  const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);
  const [deptSearch, setDeptSearch] = useState(department);
  const deptInputRef = useRef<HTMLInputElement>(null);

  const filteredDepartments = useMemo(() => {
    if (!deptSearch) return departments;
    const q = deptSearch.toLowerCase();
    return departments.filter((d) => d.toLowerCase().includes(q));
  }, [deptSearch]);

  // Close department suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        deptInputRef.current &&
        !deptInputRef.current.contains(e.target as Node)
      ) {
        setShowDeptSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectDepartment = (dept: string) => {
    setDepartment(dept);
    setDeptSearch(dept);
    setShowDeptSuggestions(false);
  };

  if (step === 1) {
    return (
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          animation: "fadeIn 0.3s ease-in",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: "24px" }}>
          Let's check your exposure
        </h2>

        <label htmlFor="company-input" style={labelStyle}>
          Company Name
        </label>
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
              borderColor: selectedCompany
                ? "var(--cyan, #00F5FF)"
                : "rgba(255,255,255,0.1)",
            }}
          />
          {isProfiling && (
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid rgba(0,245,255,0.2)",
                  borderTopColor: "var(--cyan)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#9ba5b4" }}>
                profiling...
              </span>
            </div>
          )}
          {selectedCompany && !isProfiling && (
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  color: "var(--cyan, #00F5FF)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                MATCHED
              </span>
              {selectedCompany.ticker && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#4b5563",
                    background: "rgba(255,255,255,0.05)",
                    padding: "1px 4px",
                    borderRadius: "4px",
                  }}
                >
                  {selectedCompany.ticker}
                </span>
              )}
            </div>
          )}
          {searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg2, #111827)",
                border: "1px solid rgba(255,255,255,0.1)",
                zIndex: 10,
                borderRadius: "8px",
                overflow: "hidden",
                maxHeight: "320px",
                overflowY: "auto",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                marginTop: "4px",
              }}
            >
              {searchResults.map((res) => (
                <div
                  key={res.name + (res.domain || "")}
                  onClick={() => selectCompany(res)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") selectCompany(res);
                  }}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.05)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {res.logo ? (
                      <img
                        src={res.logo}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Building size={16} color="#4b5563" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {res.name}
                      {res.isPublic && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            background: "rgba(0,245,255,0.1)",
                            color: "var(--cyan)",
                            padding: "1px 4px",
                            borderRadius: "4px",
                          }}
                        >
                          PUBLIC
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {res.industry !== "Detecting..."
                        ? res.industry
                        : res.domain || "Global Search"}{" "}
                      ·{" "}
                      {res.employeeCount > 0
                        ? `${res.employeeCount.toLocaleString()} employees`
                        : "Select to profile"}
                    </div>
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.02)",
                  color: "#4b5563",
                  fontSize: "0.72rem",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Search powered by Clearbit & AI Intelligence
              </div>
            </div>
          )}
        </div>

        {selectedCompany && (
          <div
            style={{
              margin: "4px 0 20px",
              padding: "10px 14px",
              background: "rgba(0,245,255,0.03)",
              border: "1px solid rgba(0,245,255,0.1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              animation: "slideDown 0.3s ease-out",
            }}
          >
            <Info
              size={14}
              color="var(--cyan)"
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <div
              style={{ fontSize: "0.82rem", color: "#9ba5b4", lineHeight: 1.4 }}
            >
              <strong style={{ color: "var(--cyan)" }}>
                Analysis Profile:
              </strong>{" "}
              {selectedCompany.industry} (
              {selectedCompany.employeeCount?.toLocaleString()} staff) in{" "}
              {selectedCompany.region}. AI agents will now scan this profile for
              risk.
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        <label htmlFor="role-input" style={labelStyle}>
          Your Job Title
        </label>
        <div ref={roleInputRef} style={{ position: "relative" }}>
          <input
            id="role-input"
            type="text"
            placeholder="e.g. Software Engineer, Marketing Manager"
            value={roleTitle}
            onChange={handleRoleSearch}
            autoComplete="off"
            style={inputStyle}
          />
          {showRoleSuggestions && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg2, #111827)",
                border: "1px solid rgba(255,255,255,0.1)",
                zIndex: 10,
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {roleSuggestions.map((r) => (
                <div
                  key={r}
                  onClick={() => selectRole(r)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") selectRole(r);
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    color: "#d1d5db",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "0.9rem",
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>

        <label htmlFor="dept-input" style={labelStyle}>
          Department
        </label>
        <div ref={deptInputRef} style={{ position: "relative" }}>
          <input
            id="dept-input"
            type="text"
            placeholder="Search department..."
            value={deptSearch}
            onChange={(e) => {
              setDeptSearch(e.target.value);
              setShowDeptSuggestions(true);
            }}
            onFocus={() => setShowDeptSuggestions(true)}
            autoComplete="off"
            style={{
              ...inputStyle,
              cursor: "pointer",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              pointerEvents: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          {showDeptSuggestions && filteredDepartments.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--bg2, #111827)",
                border: "1px solid rgba(0,245,255,0.2)",
                zIndex: 10,
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                marginTop: "4px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {filteredDepartments.map((d) => (
                <div
                  key={d}
                  onClick={() => selectDepartment(d)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") selectDepartment(d);
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    color:
                      d === department ? "var(--cyan, #00F5FF)" : "#d1d5db",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "0.9rem",
                    background:
                      d === department ? "rgba(0,245,255,0.1)" : "transparent",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (d !== department)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (d !== department)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleNextStep1}
          disabled={!canProceedStep1}
          aria-label="Continue to profile step"
          style={{
            width: "100%",
            padding: "14px",
            background: !canProceedStep1
              ? "rgba(255,255,255,0.1)"
              : "var(--cyan, #00F5FF)",
            color: !canProceedStep1 ? "#6b7280" : "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: !canProceedStep1 ? "not-allowed" : "pointer",
            marginTop: "16px",
            fontSize: "1rem",
            transition: "all 0.2s",
          }}
        >
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        animation: "fadeIn 0.3s ease-in",
      }}
    >
      <h2 style={{ color: "#fff", marginBottom: "8px" }}>Your Profile</h2>
      <p style={{ color: "#9ba5b4", marginBottom: "24px" }}>
        These factors are private and stay on your device.
      </p>

      <label htmlFor="tenure-select" style={labelStyle}>
        How long have you worked at this company?
      </label>
      <select
        id="tenure-select"
        value={tenureYears}
        onChange={(e) => setTenureYears(Number(e.target.value))}
        style={inputStyle}
      >
        <option value={0.3}>Less than 6 months</option>
        <option value={0.75}>6–12 months</option>
        <option value={1.5}>1–2 years</option>
        <option value={3}>3–4 years</option>
        <option value={6}>5–7 years</option>
        <option value={10}>8–12 years</option>
        <option value={15}>13+ years</option>
      </select>

      <label style={labelStyle}>
        Are you the only person in your role on your team?
      </label>
      <ToggleGroup
        ariaLabel="Role uniqueness"
        options={["Yes, I'm unique", "No, others do what I do"]}
        value={isUniqueRole ? "Yes, I'm unique" : "No, others do what I do"}
        onChange={(v) => setIsUniqueRole(v === "Yes, I'm unique")}
      />

      <label style={labelStyle}>
        How would you rate your recent performance?
      </label>
      <ToggleGroup
        ariaLabel="Performance tier"
        options={[
          "Top performer",
          "Meeting expectations",
          "Below expectations",
          "Not sure",
        ]}
        value={
          {
            top: "Top performer",
            average: "Meeting expectations",
            below: "Below expectations",
            unknown: "Not sure",
          }[performanceTier] || "Meeting expectations"
        }
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

      <label style={labelStyle}>
        Have you been promoted in the last 12 months?
      </label>
      <ToggleGroup
        ariaLabel="Recent promotion"
        options={["Yes", "No"]}
        value={hasRecentPromotion ? "Yes" : "No"}
        onChange={(v) => setHasRecentPromotion(v === "Yes")}
      />

      <label style={labelStyle}>
        Do you have key client or stakeholder relationships?
      </label>
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
            width: "30%",
            padding: "14px",
            background: "transparent",
            color: "#d1d5db",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleCalculate}
          aria-label="Calculate layoff risk"
          style={{
            width: "70%",
            padding: "14px",
            background: "var(--cyan, #00F5FF)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Calculate my risk →
        </button>
      </div>
    </div>
  );
};
