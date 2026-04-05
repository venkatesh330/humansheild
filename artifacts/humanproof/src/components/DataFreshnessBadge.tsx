import { useEffect, useState } from 'react';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface LiveScoreData {
  calibrated: boolean;
  roleKey?: string;
  score?: number;
  confidence?: {
    pct: number;
    band: number;
    label: string;
  };
  sources?: string[];
  freshness?: {
    computedAt: string;
    hoursAgo: number;
    validUntil: string;
  };
}

interface DataFreshnessBadgeProps {
  roleKey: string | null;
  fallbackScore?: number | null;
  /** If true, show a full panel; if false, show a compact badge */
  expanded?: boolean;
}

export function DataFreshnessBadge({ roleKey, fallbackScore, expanded = false }: DataFreshnessBadgeProps) {
  const [data, setData] = useState<LiveScoreData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roleKey) return;
    setLoading(true);
    fetch(`/api/live-data/score/${encodeURIComponent(roleKey)}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [roleKey]);

  if (!roleKey || loading) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
        <Database size={10} />
        static data
      </span>
    );
  }

  if (!data || !data.calibrated) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
        <Database size={10} />
        baseline data
      </span>
    );
  }

  const { confidence, sources = [], freshness } = data;
  const isStale = freshness && freshness.hoursAgo > 48;
  const freshnessLabel = freshness
    ? freshness.hoursAgo < 1
      ? 'just now'
      : freshness.hoursAgo < 24
        ? `${freshness.hoursAgo}h ago`
        : `${Math.round(freshness.hoursAgo / 24)}d ago`
    : '';

  const confidencePct = confidence?.pct ?? 50;
  const band = confidence?.band ?? 12;
  const color = confidencePct >= 80 ? 'var(--emerald)' : confidencePct >= 60 ? 'var(--cyan)' : 'var(--yellow)';

  if (!expanded) {
    // Compact inline badge
    return (
      <span title={`${confidence?.label} | Sources: ${sources.join(', ')}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '0.72rem', color, fontFamily: 'var(--mono)' }}>
        {isStale ? <AlertCircle size={10} /> : <CheckCircle size={10} />}
        ±{band}% · {freshnessLabel} · {sources.join('+')}
      </span>
    );
  }

  // Expanded trust panel
  return (
    <div style={{
      background: 'rgba(0,245,255,0.04)', border: `1px solid ${color}44`,
      borderRadius: 10, padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.05em' }}>
          DATA CONFIDENCE
        </span>
        {isStale && (
          <span style={{ fontSize: '0.7rem', color: 'var(--yellow)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={11} /> Stale — refresh pending
          </span>
        )}
      </div>

      {/* Confidence bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{confidence?.label}</span>
          <span style={{ fontSize: '0.7rem', color, fontFamily: 'var(--mono)', fontWeight: 700 }}>
            ±{band}%
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${confidencePct}%`, background: color, borderRadius: 4,
            transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Sources */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sources.map(s => (
          <span key={s} style={{
            background: `${color}15`, color,
            fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, letterSpacing: '0.04em',
          }}>
            {s}
          </span>
        ))}
      </div>

      {/* Freshness */}
      {freshness && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5,
          fontSize: '0.7rem', color: 'var(--text3)' }}>
          <RefreshCw size={10} />
          Updated {freshnessLabel} · Valid until {new Date(freshness.validUntil).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
