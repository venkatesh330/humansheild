import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Globe, Search, Filter, ExternalLink, Clock, RotateCcw, Zap, Star } from 'lucide-react';
import { useHumanProof } from '../context/HumanProofContext';

interface Resource {
  id: string;
  title: string;
  provider: string;
  url: string;
  language: string;
  languageLabel: string;
  isFree: 'yes' | 'audit' | 'scholarship';
  level: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number | null;
  targetDimension: string | null;
  riskLevelTarget: string;
  tags: string[] | null;
}

interface LanguageOption { code: string; label: string }

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'var(--emerald)',
  intermediate: 'var(--yellow)',
  advanced:     'var(--orange)',
};

const DIM_LABELS: Record<string, string> = {
  D1: 'Reduce Task Risk', D2: 'AI Tool Skills',
  D3: 'Augmentation', D6: 'Network & Leadership', general: 'General AI Literacy',
};

const FREE_LABELS: Record<string, { label: string; color: string }> = {
  yes:         { label: 'FREE',        color: 'var(--emerald)' },
  audit:       { label: 'FREE AUDIT', color: 'var(--cyan)'    },
  scholarship: { label: 'SCHOLARSHIP', color: 'var(--yellow)' },
};

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', zh: '🇨🇳', hi: '🇮🇳', pt: '🇧🇷', ar: '🇸🇦',
};

function ResourceCard({ resource }: { resource: Resource }) {
  const freeInfo = FREE_LABELS[resource.isFree];
  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
        padding: '18px 20px', transition: 'all 0.2s', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 10, height: '100%',
      }}
        onMouseEnter={e => {
          (e.currentTarget).style.borderColor = 'var(--cyan)';
          (e.currentTarget).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget).style.borderColor = 'var(--border)';
          (e.currentTarget).style.transform = 'none';
        }}
      >
        {/* Top row: provider + free badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.04em' }}>
            {resource.provider}
          </span>
          <span style={{
            background: `${freeInfo.color}22`, color: freeInfo.color,
            fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px',
            borderRadius: 20, letterSpacing: '0.06em', flexShrink: 0,
          }}>
            {freeInfo.label}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text1)', lineHeight: 1.4 }}>
          {resource.title}
        </h3>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
          {/* Language */}
          <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
            {LANGUAGE_FLAGS[resource.language] ?? '🌐'} {resource.languageLabel}
          </span>

          {/* Level */}
          <span style={{ fontSize: '0.78rem', color: LEVEL_COLORS[resource.level], fontWeight: 600 }}>
            {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
          </span>

          {/* Duration */}
          {resource.durationHours && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--text3)' }}>
              <Clock size={11} /> {resource.durationHours}h
            </span>
          )}

          {/* Dimension tag */}
          {resource.targetDimension && resource.targetDimension !== 'general' && (
            <span style={{
              background: 'rgba(0,245,255,0.08)', color: 'var(--cyan)',
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20,
            }}>
              {DIM_LABELS[resource.targetDimension] ?? resource.targetDimension}
            </span>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {resource.tags.slice(0, 4).map(t => (
              <span key={t} style={{
                background: 'var(--surface2)', color: 'var(--text3)',
                fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20,
              }}>
                {t}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--cyan)', fontSize: '0.78rem', marginTop: 4 }}>
          <ExternalLink size={11} /> Open free resource
        </div>
      </div>
    </a>
  );
}

interface Filters {
  language: string;
  level: string;
  dimension: string;
  q: string;
}

const DEFAULT_FILTERS: Filters = { language: '', level: '', dimension: '', q: '' };

const ALL_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'ar', label: '🇸🇦 العربية' },
];

export function LearningHubPage() {
  const { state } = useHumanProof();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 18;

  // Determine the user's risk level from context to show personalised resources
  const jobRisk = state.jobRiskScore;
  const autoRiskLevel = jobRisk !== null
    ? (jobRisk >= 80 ? 'critical' : jobRisk >= 65 ? 'high' : jobRisk >= 40 ? 'moderate' : 'all')
    : 'all';

  const fetchResources = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.language)  params.set('language', f.language);
      if (f.level)     params.set('level',    f.level);
      if (f.dimension) params.set('dimension', f.dimension);
      if (f.q)         params.set('q',         f.q);
      if (state.jobId) params.set('roleKey',   state.jobId);
      if (autoRiskLevel !== 'all') params.set('riskLevel', autoRiskLevel);
      params.set('limit', String(LIMIT));

      const resp = await fetch(`/api/resources?${params.toString()}`);
      if (!resp.ok) throw new Error('API error');
      const json = await resp.json();
      setResources(json.data);
      setTotal(json.pagination.total);
    } catch {
      // keep existing if error
    } finally {
      setLoading(false);
    }
  }, [state.jobId, autoRiskLevel]);

  useEffect(() => { fetchResources(filters); }, [filters, fetchResources]);

  const input = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '8px 12px', color: 'var(--text1)', fontSize: '0.85rem', outline: 'none',
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <BookOpen size={28} style={{ color: 'var(--cyan)' }} />
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>
            Free Learning Hub
          </h1>
          <Globe size={18} style={{ color: 'var(--text3)' }} />
        </div>
        <p style={{ margin: 0, color: 'var(--text2)', fontSize: '0.9rem', maxWidth: 620 }}>
          Curated free resources in 8 languages. All resources are 100% free to access (no hidden paywall).
          {jobRisk !== null && (
            <span style={{ color: 'var(--cyan)' }}>
              {' '}Showing personalised picks for your {autoRiskLevel} risk profile.
            </span>
          )}
        </p>
      </div>

      {/* Language chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setFilters(f => ({ ...f, language: '' }))} style={{
          background: !filters.language ? 'var(--cyan)' : 'var(--surface)',
          border: `1px solid ${!filters.language ? 'var(--cyan)' : 'var(--border)'}`,
          color: !filters.language ? 'var(--bg)' : 'var(--text2)',
          borderRadius: 20, padding: '6px 16px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
        }}>
          🌍 All Languages
        </button>
        {ALL_LANGUAGES.map(lang => (
          <button key={lang.code}
            onClick={() => setFilters(f => ({ ...f, language: filters.language === lang.code ? '' : lang.code }))}
            style={{
              background: filters.language === lang.code ? 'rgba(0,245,255,0.12)' : 'var(--surface)',
              border: `1px solid ${filters.language === lang.code ? 'var(--cyan)' : 'var(--border)'}`,
              color: filters.language === lang.code ? 'var(--cyan)' : 'var(--text2)',
              borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem',
            }}>
            {lang.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input type="text" placeholder="Search resources…" value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
            style={{ ...input, paddingLeft: 32, width: '100%', boxSizing: 'border-box' }} />
        </div>

        <select value={filters.level} onChange={e => setFilters(f => ({ ...f, level: e.target.value }))} style={input}>
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select value={filters.dimension} onChange={e => setFilters(f => ({ ...f, dimension: e.target.value }))} style={input}>
          <option value="">All Goals</option>
          {Object.entries(DIM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {(filters.language || filters.level || filters.dimension || filters.q) && (
          <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '8px 14px', color: 'var(--text3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem',
          }}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>
          {loading ? 'Loading…' : `${total} resource${total !== 1 ? 's' : ''} found`}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--emerald)' }}>
          <Zap size={12} /> All free to access
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton-loader skeleton-card"></div>)}
        </div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>No resources match your filters.</div>
          <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{
            marginTop: 16, background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 20px', color: 'var(--text2)', cursor: 'pointer',
          }}>Reset Filters</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}

      {/* Attribution */}
      <div style={{ marginTop: 40, padding: 20, background: 'var(--surface)', borderRadius: 12,
        borderLeft: '3px solid var(--cyan)', fontSize: '0.8rem', color: 'var(--text3)' }}>
        <strong style={{ color: 'var(--text2)' }}>Resource Policy:</strong> All resources are hand-curated for free accessibility.
        "Free Audit" means you can access all content for free without earning a certificate.
        "Scholarship" means the provider offers full scholarships — apply directly on their site.
      </div>
    </div>
  );
}
