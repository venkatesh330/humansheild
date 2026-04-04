import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLayoff } from '../../context/LayoffContext';
import { lookupCompany } from '../../data/companyDatabase';
import { industryRiskData } from '../../data/industryRiskData';
import { getAllRoleTitles } from '../../data/roleExposureData';
import { CompanyData } from '../../data/companyDatabase';

interface Props {
  onNext: () => void;
}

const ToggleGroup: React.FC<{
  options: string[];
  value: string;
  onChange: (val: string) => void;
  ariaLabel: string;
}> = ({ options, value, onChange, ariaLabel }) => (
  <div role="radiogroup" aria-label={ariaLabel} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
    {options.map(opt => (
      <button
        key={opt}
        role="radio"
        aria-checked={value === opt}
        tabIndex={0}
        onClick={() => onChange(opt)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(opt); } }}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: `1px solid ${value === opt ? 'var(--cyan, #00F5FF)' : 'rgba(255,255,255,0.1)'}`,
          background: value === opt ? 'rgba(0,245,255,0.1)' : 'transparent',
          color: value === opt ? 'var(--cyan, #00F5FF)' : '#d1d5db',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '0.9rem',
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
  const [companySearch, setCompanySearch] = useState(state.companyName || '');
  const [searchResults, setSearchResults] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(state.companyData || null);
  const [roleTitle, setRoleTitle] = useState(state.roleTitle || '');
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [department, setDepartment] = useState(state.department || 'Engineering');
  const [manualIndustry, setManualIndustry] = useState('Technology');
  const roleInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [tenureYears, setTenureYears] = useState(state.userFactors?.tenureYears || 1.5);
  const [isUniqueRole, setIsUniqueRole] = useState(state.userFactors?.isUniqueRole ?? false);
  const [performanceTier, setPerformanceTier] = useState(state.userFactors?.performanceTier || 'average');
  const [hasRecentPromotion, setHasRecentPromotion] = useState(state.userFactors?.hasRecentPromotion ?? false);
  const [hasKeyRelationships, setHasKeyRelationships] = useState(state.userFactors?.hasKeyRelationships ?? false);

  const allRoles = useMemo(() => getAllRoleTitles(), []);

  const handleCompanySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCompanySearch(val);
    setSelectedCompany(null);
    if (!val || val.length < 2) {
      setSearchResults([]);
      return;
    }
    if (!manualMode) {
      setSearchResults(lookupCompany(val));
    }
  };

  const selectCompany = (comp: CompanyData) => {
    setSelectedCompany(comp);
    setCompanySearch(comp.name);
    setSearchResults([]);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (roleTitle.length >= 2) {
        const q = roleTitle.toLowerCase();
        // Smarter search: prioritize roles that start with the query, then simply contain it
        const matches = allRoles
          .filter(r => r.toLowerCase().includes(q))
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
      if (roleInputRef.current && !roleInputRef.current.contains(e.target as Node)) {
        setShowRoleSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNextStep1 = () => {
    let finalCompany = selectedCompany;
    if (manualMode && companySearch) {
      finalCompany = {
        name: companySearch,
        isPublic: false,
        industry: manualIndustry,
        region: 'US',
        employeeCount: 500,
        revenueGrowthYoY: null,
        stock90DayChange: null,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 150000,
        aiInvestmentSignal: 'medium',
        source: 'User Input',
        lastUpdated: new Date().toISOString(),
      };
    }

    if (!finalCompany && !manualMode) return;
    if (!roleTitle.trim()) return;

    // Store company data in context (NOT window global)
    if (finalCompany) {
      dispatch({ type: 'SET_COMPANY_DATA', payload: finalCompany });
    }
    dispatch({
      type: 'SET_INPUTS',
      payload: { roleTitle: roleTitle.trim(), department },
    });

    setStep(2);
  };

  const handleCalculate = () => {
    dispatch({
      type: 'SET_INPUTS',
      payload: {
        userFactors: {
          tenureYears,
          isUniqueRole,
          performanceTier: performanceTier as 'top' | 'average' | 'below' | 'unknown',
          hasRecentPromotion,
          hasKeyRelationships,
        },
      },
    });
    onNext();
  };

  const canProceedStep1 = companySearch.trim().length > 0 && roleTitle.trim().length > 0;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    marginBottom: '16px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.9rem' };

  const departments = [
    'Engineering', 'Sales', 'Product', 'Marketing', 'HR', 'Finance',
    'Operations', 'Legal', 'Customer Support', 'Research', 'Design',
    'Data', 'IT', 'Supply Chain', 'Administration',
  ];

  if (step === 1) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in' }}>
        <h2 style={{ color: '#fff', marginBottom: '24px' }}>Let's check your exposure</h2>

        <label htmlFor="company-input" style={labelStyle}>Company Name</label>
        <div style={{ position: 'relative' }}>
          <input
            id="company-input"
            type="text"
            placeholder="Search company (e.g. Google, Tesla, TCS)"
            value={companySearch}
            onChange={handleCompanySearch}
            autoComplete="off"
            style={{
              ...inputStyle,
              borderColor: selectedCompany ? 'var(--cyan, #00F5FF)' : 'rgba(255,255,255,0.1)',
            }}
          />
          {selectedCompany && (
            <div style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--cyan, #00F5FF)', fontSize: '0.8rem' }}>
              ✓ matched
            </div>
          )}
          {!manualMode && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'var(--bg2, #111827)', border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 10, borderRadius: '8px', overflow: 'hidden', maxHeight: '240px', overflowY: 'auto',
            }}>
              {searchResults.map(res => (
                <div
                  key={res.name}
                  onClick={() => selectCompany(res)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') selectCompany(res); }}
                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ color: '#fff' }}>{res.name} {res.ticker ? `(${res.ticker})` : ''}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ba5b4' }}>
                    {res.industry} · {res.employeeCount.toLocaleString()} employees · {res.region}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <button
            style={{ background: 'none', border: 'none', color: '#9ba5b4', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
            onClick={() => { setManualMode(!manualMode); setSearchResults([]); setSelectedCompany(null); }}
          >
            {manualMode ? '← Back to search' : "My company isn't listed"}
          </button>
        </div>

        {manualMode && (
          <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <label htmlFor="industry-select" style={labelStyle}>Select Industry</label>
            <select id="industry-select" value={manualIndustry} onChange={e => setManualIndustry(e.target.value)} style={inputStyle}>
              {Object.keys(industryRiskData).map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        )}

        <label htmlFor="role-input" style={labelStyle}>Your Job Title</label>
        <div ref={roleInputRef} style={{ position: 'relative' }}>
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
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'var(--bg2, #111827)', border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 10, borderRadius: '8px', overflow: 'hidden',
            }}>
              {roleSuggestions.map(r => (
                <div
                  key={r}
                  onClick={() => selectRole(r)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') selectRole(r); }}
                  style={{ padding: '10px 16px', cursor: 'pointer', color: '#d1d5db', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}
                >
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>

        <label htmlFor="dept-select" style={labelStyle}>Department</label>
        <select id="dept-select" value={department} onChange={e => setDepartment(e.target.value)} style={inputStyle}>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <button
          onClick={handleNextStep1}
          disabled={!canProceedStep1}
          aria-label="Continue to profile step"
          style={{
            width: '100%',
            padding: '14px',
            background: !canProceedStep1 ? 'rgba(255,255,255,0.1)' : 'var(--cyan, #00F5FF)',
            color: !canProceedStep1 ? '#6b7280' : '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: !canProceedStep1 ? 'not-allowed' : 'pointer',
            marginTop: '16px',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
        >
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in' }}>
      <h2 style={{ color: '#fff', marginBottom: '8px' }}>Your Profile</h2>
      <p style={{ color: '#9ba5b4', marginBottom: '24px' }}>These factors are private and stay on your device.</p>

      <label htmlFor="tenure-select" style={labelStyle}>How long have you worked at this company?</label>
      <select id="tenure-select" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} style={inputStyle}>
        <option value={0.3}>Less than 6 months</option>
        <option value={0.75}>6–12 months</option>
        <option value={1.5}>1–2 years</option>
        <option value={3}>3–4 years</option>
        <option value={6}>5–7 years</option>
        <option value={10}>8–12 years</option>
        <option value={15}>13+ years</option>
      </select>

      <label style={labelStyle}>Are you the only person in your role on your team?</label>
      <ToggleGroup
        ariaLabel="Role uniqueness"
        options={["Yes, I'm unique", 'No, others do what I do']}
        value={isUniqueRole ? "Yes, I'm unique" : 'No, others do what I do'}
        onChange={v => setIsUniqueRole(v === "Yes, I'm unique")}
      />

      <label style={labelStyle}>How would you rate your recent performance?</label>
      <ToggleGroup
        ariaLabel="Performance tier"
        options={['Top performer', 'Meeting expectations', 'Below expectations', 'Not sure']}
        value={{ top: 'Top performer', average: 'Meeting expectations', below: 'Below expectations', unknown: 'Not sure' }[performanceTier] || 'Meeting expectations'}
        onChange={v => {
          const map: Record<string, 'top' | 'average' | 'below' | 'unknown'> = {
            'Top performer': 'top',
            'Meeting expectations': 'average',
            'Below expectations': 'below',
            'Not sure': 'unknown',
          };
          setPerformanceTier(map[v] ?? 'average');
        }}
      />

      <label style={labelStyle}>Have you been promoted in the last 12 months?</label>
      <ToggleGroup ariaLabel="Recent promotion" options={['Yes', 'No']} value={hasRecentPromotion ? 'Yes' : 'No'} onChange={v => setHasRecentPromotion(v === 'Yes')} />

      <label style={labelStyle}>Do you have key client or stakeholder relationships?</label>
      <ToggleGroup ariaLabel="Key relationships" options={['Yes', 'No']} value={hasKeyRelationships ? 'Yes' : 'No'} onChange={v => setHasKeyRelationships(v === 'Yes')} />

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button
          onClick={() => setStep(1)}
          aria-label="Go back to company step"
          style={{ width: '30%', padding: '14px', background: 'transparent', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <button
          onClick={handleCalculate}
          aria-label="Calculate layoff risk"
          style={{ width: '70%', padding: '14px', background: 'var(--cyan, #00F5FF)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
        >
          Calculate my risk →
        </button>
      </div>
    </div>
  );
};
