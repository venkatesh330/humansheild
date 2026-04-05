import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, TrendingUp, DollarSign, Wifi, WifiOff, GraduationCap, ChevronRight, Filter, RotateCcw, Star } from 'lucide-react';
import { useHumanProof } from '../context/HumanProofContext';

interface SafeCareer {
  id: string;
  roleKey: string;
  roleTitle: string;
  industryKey: string;
  industryLabel: string;
  riskScore: number;
  growthProjection: number | null;
  medianSalaryUsd: number | null;
  remoteViable: 'yes' | 'partial' | 'no';
  educationRequired: string;
  automationD1: number | null;
  augmentationD3: number | null;
  safetyReason: string | null;
}

interface Filters {
  industry: string;
  remote: string;
  education: string;
  maxRisk: number;
  minGrowth: number;
  q: string;
  sort: 'risk' | 'growth' | 'salary';
}

const EDUCATION_LABELS: Record<string, string> = {
  high_school: 'High School', associate: 'Associate', bachelor: 'Bachelor\'s',
  master: 'Master\'s', phd: 'PhD / Doctorate',
};
const REMOTE_LABELS: Record<string, string> = { yes: 'Fully Remote', partial: 'Hybrid', no: 'On-site Only' };
const REMOTE_COLORS: Record<string, string> = { yes: 'var(--emerald)', partial: 'var(--cyan)', no: 'var(--text3)' };

function SafetyScore({ score }: { score: number }) {
  const safetyPct = Math.round(100 - score);
  const color = score <= 20 ? 'var(--emerald)' : score <= 35 ? 'var(--cyan)' : 'var(--yellow)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 60, height: 60 }}>
        <svg viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="30" cy="30" r="24" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (score / 100)}`}
            strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', fontWeight: 700, color, fontFamily: 'var(--mono)' }}>
          {safetyPct}
        </div>
      </div>
      <span style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.05em' }}>SAFETY</span>
    </div>
  );
}

function CareerCard({ career, onSelect }: { career: SafeCareer; onSelect: (c: SafeCareer) => void }) {
  const salaryK = career.medianSalaryUsd ? `$${Math.round(career.medianSalaryUsd / 1000)}K` : '—';
  const growthStr = career.growthProjection !== null
    ? `${career.growthProjection >= 0 ? '+' : ''}${career.growthProjection.toFixed(1)}%` : '—';

  return (
    <div onClick={() => onSelect(career)} style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 20,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'grid',
      gridTemplateColumns: '60px 1fr auto',
      gap: 16,
      alignItems: 'center',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--cyan)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
      }}
    >
      <SafetyScore score={career.riskScore} />

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text1)' }}>{career.roleTitle}</h3>
          {career.riskScore <= 20 && (
            <span style={{ background: 'rgba(0,255,159,0.15)', color: 'var(--emerald)', fontSize: '0.65rem',
              padding: '2px 8px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.05em' }}>
              ⭐ SAFEST
            </span>
          )}
        </div>
        <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginBottom: 10 }}>{career.industryLabel}</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text2)' }}>
            <TrendingUp size={13} style={{ color: career.growthProjection && career.growthProjection > 0 ? 'var(--emerald)' : 'var(--text3)' }} />
            {growthStr} growth
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text2)' }}>
            <DollarSign size={13} style={{ color: 'var(--yellow)' }} />
            {salaryK} median
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
            color: REMOTE_COLORS[career.remoteViable] }}>
            {career.remoteViable === 'no' ? <WifiOff size={13} /> : <Wifi size={13} />}
            {REMOTE_LABELS[career.remoteViable]}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text3)' }}>
            <GraduationCap size={13} />
            {EDUCATION_LABELS[career.educationRequired] || career.educationRequired}
          </span>
        </div>
        {career.safetyReason && (
          <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--cyan)', fontStyle: 'italic' }}>
            {career.safetyReason}
          </div>
        )}
      </div>

      <ChevronRight size={18} style={{ color: 'var(--text3)', flexShrink: 0 }} />
    </div>
  );
}

function FilterPanel({ filters, industries, onChange, onReset }: {
  filters: Filters;
  industries: { key: string; label: string }[];
  onChange: (f: Partial<Filters>) => void;
  onReset: () => void;
}) {
  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '8px 12px', color: 'var(--text1)', fontSize: '0.85rem', width: '100%',
    outline: 'none',
  };
  const labelStyle = { fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4, display: 'block', letterSpacing: '0.05em' };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--text1)' }}>
          <Filter size={15} /> Filters
        </span>
        <button onClick={onReset} style={{
          background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
          fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div>
        <label style={labelStyle}>INDUSTRY</label>
        <select value={filters.industry} onChange={e => onChange({ industry: e.target.value })} style={inputStyle}>
          <option value="">All Industries</option>
          {industries.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>REMOTE WORK</label>
        <select value={filters.remote} onChange={e => onChange({ remote: e.target.value })} style={inputStyle}>
          <option value="">Any</option>
          <option value="yes">Fully Remote</option>
          <option value="partial">Hybrid</option>
          <option value="no">On-site</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>EDUCATION</label>
        <select value={filters.education} onChange={e => onChange({ education: e.target.value })} style={inputStyle}>
          <option value="">Any Level</option>
          {Object.entries(EDUCATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>MAX RISK SCORE: {filters.maxRisk}</label>
        <input type="range" min={10} max={60} step={5} value={filters.maxRisk}
          onChange={e => onChange({ maxRisk: parseInt(e.target.value, 10) })}
          style={{ width: '100%', accentColor: 'var(--cyan)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text3)' }}>
          <span>Very Safe</span><span>Moderate</span>
        </div>
      </div>

      <div>
        <label style={labelStyle}>MIN GROWTH %: {filters.minGrowth > 0 ? `+${filters.minGrowth}%` : 'Any'}</label>
        <input type="range" min={0} max={20} step={2} value={filters.minGrowth}
          onChange={e => onChange({ minGrowth: parseInt(e.target.value, 10) })}
          style={{ width: '100%', accentColor: 'var(--emerald)' }} />
      </div>

      <div>
        <label style={labelStyle}>SORT BY</label>
        <select value={filters.sort} onChange={e => onChange({ sort: e.target.value as Filters['sort'] })} style={inputStyle}>
          <option value="risk">Safety Score</option>
          <option value="growth">Growth Projection</option>
          <option value="salary">Median Salary</option>
        </select>
      </div>
    </div>
  );
}

const DEFAULT_FILTERS: Filters = {
  industry: '', remote: '', education: '', maxRisk: 45, minGrowth: 0, q: '', sort: 'risk',
};

export function SafeCareersPage() {
  const { state } = useHumanProof();
  const [careers, setCareers] = useState<SafeCareer[]>([]);
  const [industries, setIndustries] = useState<{ key: string; label: string }[]>([]);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    industry: state.industry || '',
  });
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SafeCareer | null>(null);
  const LIMIT = 18;

  const buildQuery = useCallback((f: Filters, off: number) => {
    const params = new URLSearchParams();
    if (f.industry)   params.set('industry',   f.industry);
    if (f.remote)     params.set('remote',     f.remote);
    if (f.education)  params.set('education',  f.education);
    if (f.q)          params.set('q',          f.q);
    params.set('maxRisk',   String(f.maxRisk));
    params.set('minGrowth', String(f.minGrowth));
    params.set('sort',      f.sort);
    params.set('limit',     String(LIMIT));
    params.set('offset',    String(off));
    return params.toString();
  }, []);

  const fetchCareers = useCallback(async (f: Filters, off: number) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/safe-careers?${buildQuery(f, off)}`);
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch careers');
      }
      const json = await resp.json();
      if (off === 0) setCareers(json.data);
      else setCareers(prev => [...prev, ...json.data]);
      setTotal(json.pagination.total);
    } catch (err: any) {
      console.error("[SafeCareers]", err);
      setError(err.message || 'An error occurred while loading careers.');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const fetchIndustries = useCallback(async () => {
    try {
      const resp = await fetch('/api/safe-careers/industries');
      const json = await resp.json();
      setIndustries(json.map((r: { key: string; label: string }) => ({ key: r.key, label: r.label })));
    } catch {}
  }, []);

  useEffect(() => { fetchIndustries(); }, [fetchIndustries]);
  useEffect(() => { setOffset(0); fetchCareers(filters, 0); }, [filters, fetchCareers]);

  const updateFilter = (patch: Partial<Filters>) => setFilters(prev => ({ ...prev, ...patch }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const loadMore = () => { const next = offset + LIMIT; setOffset(next); fetchCareers(filters, next); };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Shield size={28} style={{ color: 'var(--emerald)' }} />
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text1)' }}>
            Safe & Future-Proof Careers
          </h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text2)', fontSize: '0.95rem', maxWidth: 600 }}>
          Roles with the lowest AI displacement risk through 2030+, ranked by safety score.
          Data sourced from BLS employment projections and live market signals.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          type="text"
          placeholder="Search roles, industries…"
          value={filters.q}
          onChange={e => updateFilter({ q: e.target.value })}
          style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '12px 16px 12px 40px', color: 'var(--text1)',
            fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Filter panel */}
        <div style={{ position: 'sticky', top: 20 }}>
          <FilterPanel filters={filters} industries={industries} onChange={updateFilter} onReset={resetFilters} />
        </div>

        {/* Results */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>
              {loading ? 'Loading…' : `${total} career${total !== 1 ? 's' : ''} found`}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--emerald)' }}>
              <Star size={12} /> BLS 2023-2033 projections
            </span>
          </div>

          {/* Error and Empty states */}
          {error ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 16 }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--red)' }}>Service Unavailable</h3>
              <p style={{ margin: '0 0 20px 0', color: 'var(--text2)', fontSize: '0.85rem' }}>{error}</p>
              <button onClick={() => fetchCareers(filters, 0)} style={{
                background: 'var(--red)', color: 'white', border: 'none', borderRadius: 8,
                padding: '8px 24px', cursor: 'pointer', fontWeight: 600,
              }}>Try Again</button>
            </div>
          ) : !loading && careers.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)', background: 'var(--surface)', borderRadius: 16, border: '1px dashed var(--border)' }}>
              <Shield size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: '1.1rem', color: 'var(--text2)', fontWeight: 600, marginBottom: 4 }}>No future-proof roles found</div>
              <p style={{ fontSize: '0.85rem', maxWidth: 400, margin: '0 auto 20px auto' }}>
                Your current filters (Risk &lt; {filters.maxRisk}) might be too restrictive. 
                Most roles have some AI exposure; try increasing your risk threshold.
              </p>
              <button onClick={resetFilters} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 20px', color: 'var(--text2)', cursor: 'pointer',
              }}>Reset All Filters</button>
            </div>
          )}

          {/* Career grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {careers.map(c => (
              <CareerCard key={c.id} career={c} onSelect={setSelected} />
            ))}
          </div>

          {/* Load more */}
          {!loading && careers.length < total && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={loadMore} style={{
                background: 'var(--surface)', border: '1px solid var(--cyan)', borderRadius: 10,
                padding: '10px 32px', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.9rem',
              }}>
                Load more ({total - careers.length} remaining)
              </button>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton-loader" style={{ height: 100, width: '100%', marginBottom: 0 }}></div>)}
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg)', width: 420, padding: 32, overflowY: 'auto',
            borderLeft: '1px solid var(--border)',
          }}>
            <button onClick={() => setSelected(null)} style={{
              background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
              fontSize: '1.2rem', marginBottom: 24,
            }}>✕ Close</button>
            <SafetyScore score={selected.riskScore} />
            <h2 style={{ marginTop: 16, color: 'var(--text1)' }}>{selected.roleTitle}</h2>
            <div style={{ color: 'var(--text3)', marginBottom: 24 }}>{selected.industryLabel}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Safety Score', value: `${100 - selected.riskScore}/100` },
                { label: 'BLS Growth (2033)', value: selected.growthProjection !== null ? `${selected.growthProjection >= 0 ? '+' : ''}${selected.growthProjection.toFixed(1)}%` : 'N/A' },
                { label: 'Median Salary', value: selected.medianSalaryUsd ? `$${(selected.medianSalaryUsd / 1000).toFixed(0)}K / year` : 'N/A' },
                { label: 'Remote Viable', value: REMOTE_LABELS[selected.remoteViable] },
                { label: 'Education', value: EDUCATION_LABELS[selected.educationRequired] || selected.educationRequired },
                { label: 'Task Automation Risk (D1)', value: selected.automationD1 !== null ? `${Math.round(selected.automationD1)}%` : 'N/A' },
                { label: 'AI Augmentation (D3)', value: selected.augmentationD3 !== null ? `${Math.round(selected.augmentationD3)}%` : 'N/A' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{row.label}</span>
                  <span style={{ color: 'var(--text1)', fontSize: '0.85rem', fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
            {selected.safetyReason && (
              <div style={{ marginTop: 20, padding: 14, background: 'rgba(0,245,255,0.06)',
                borderRadius: 10, borderLeft: '3px solid var(--cyan)', fontSize: '0.85rem', color: 'var(--cyan)' }}>
                {selected.safetyReason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
