import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface CareerStats {
  total: number;
  avgSalary: number;
  topSector: string;
}

interface Career {
  id: string;
  title: string;
  sector: string;
  growth_rate: string;
  avg_salary: number;
  human_factor: number;
  ai_resistance: 'High' | 'Very High' | 'Critical';
  why_safe: string;
  skills: string[];
}

const RESISTANCE_MAP: Record<string, { color: string; bg: string }> = {
  'Critical':  { color: 'var(--cyan)',     bg: 'var(--cyan-dim)' },
  'Very High': { color: 'var(--emerald)',  bg: 'var(--emerald-dim)' },
  'High':      { color: '#818cf8',         bg: 'var(--violet-dim)' },
};

export const SafeCareersPage: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [stats, setStats] = useState<CareerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [careersRes, statsRes] = await Promise.all([
        fetch('/api/safe-careers'),
        fetch('/api/safe-careers/stats'),
      ]);
      const careersData = await careersRes.json();
      const statsData = await statsRes.json();
      setCareers(careersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch career data:', err);
    } finally {
      setLoading(false);
    }
  };

  const sectors = [...new Set(careers.map(c => c.sector))].sort();
  const filtered = careers.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.skills?.some(s => s.toLowerCase().includes(q));
    const matchesSector = !selectedSector || c.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const visibleCareers = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      <div className="container">

        {/* Page Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
          <div className="badge badge-ghost reveal" style={{ width: 'fit-content' }}>Secure Protocol</div>
          <h1 className="reveal" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
          }}>
            Anti-Fragile<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--text) 0%, var(--text-3) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontStyle: 'italic',
            }}>Careers.</span>
          </h1>
          <p className="reveal" style={{ color: 'var(--text-2)', maxWidth: 520, lineHeight: 1.7, fontWeight: 500 }}>
            Verified roles with maximum protection from current and projected AI automation cycles.
          </p>
        </div>

        {/* Stats Banner */}
        {stats && (
          <div className="reveal" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <div className="card" style={{ padding: '20px 28px', display: 'flex', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.75rem', color: 'var(--text)' }}>{stats.total}</div>
                <div className="stat-label">Safe Roles</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.75rem', color: 'var(--emerald)' }}>${(stats.avgSalary / 1000).toFixed(0)}k</div>
                <div className="stat-label">Avg. Salary</div>
              </div>
              {stats.topSector && (
                <>
                  <div style={{ width: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '1.1rem', color: 'var(--cyan)', whiteSpace: 'nowrap' }}>{stats.topSector}</div>
                    <div className="stat-label">Top Sector</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <div className="input-prefix-wrap reveal" style={{ flex: 1, minWidth: 240 }}>
            <Search size={16} className="input-prefix-icon" />
            <input
              type="text"
              placeholder="Search careers, sectors, skills..."
              className="input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className="input reveal"
            style={{ width: 'auto', minWidth: 180 }}
          >
            <option value="">All Sectors</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Career Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.1rem' }}>No results found</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>Try a different search or clear filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {visibleCareers.map((career, i) => {
              const r = RESISTANCE_MAP[career.ai_resistance] || RESISTANCE_MAP['High'];
              return (
                <div key={career.id} className={`card card-hover reveal reveal-delay-${(i % 3) + 1}`} style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <span className="badge" style={{ color: r.color, background: r.bg, borderColor: `${r.color}33` }}>
                      {career.ai_resistance}
                    </span>
                    <span className="badge badge-ghost" style={{ fontSize: '0.62rem' }}>{career.growth_rate}</span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '4px', lineHeight: 1.2 }}>{career.title}</h3>
                  <p className="label-xs" style={{ marginBottom: '16px', color: 'var(--text-3)' }}>{career.sector}</p>

                  {career.why_safe && (
                    <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.65, marginBottom: '20px' }}>{career.why_safe}</p>
                  )}

                  {career.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                      {career.skills.slice(0, 3).map(s => (
                        <span key={s} className="badge badge-ghost" style={{ fontSize: '0.6rem' }}>{s}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div className="stat-label" style={{ marginBottom: '4px' }}>Salary</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>${(career.avg_salary / 1000).toFixed(0)}k</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="stat-label" style={{ marginBottom: '4px' }}>Human Factor</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--cyan)' }}>{career.human_factor}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px', marginBottom: '80px' }}>
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="btn btn-premium reveal"
              style={{ padding: '16px 40px', fontSize: '0.9rem' }}
            >
              Load More Pathways
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
