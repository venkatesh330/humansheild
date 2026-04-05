import { useEffect, useState } from 'react';
import { History, Database, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string;
  changeReason: string | null;
  sourceName: string | null;
  changedAt: string;
}

const ENTITY_COLORS: Record<string, string> = {
  live_signal:     'var(--cyan)',
  validated_score: 'var(--emerald)',
  signal_weight:   'var(--yellow)',
  pipeline_run:    'var(--text3)',
};

const ENTITY_LABELS: Record<string, string> = {
  live_signal:     '📡 Signal',
  validated_score: '✅ Score',
  signal_weight:   '⚖️ Weights',
  pipeline_run:    '🔄 Pipeline',
};

function AuditRow({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const color = ENTITY_COLORS[entry.entityType] ?? 'var(--text3)';
  const label = ENTITY_LABELS[entry.entityType] ?? entry.entityType;
  const timeAgo = new Date(entry.changedAt).toLocaleString();

  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: `${color}18`, color, fontSize: '0.7rem', fontWeight: 700,
            padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
            {label}
          </span>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text1)', fontWeight: 600,
              fontFamily: 'var(--mono)' }}>
              {entry.entityId}
            </span>
            {entry.changeReason && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text3)', marginLeft: 8 }}>
                — {entry.changeReason}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {entry.sourceName && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              {entry.sourceName}
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{timeAgo}</span>
          {expanded ? <ChevronUp size={14} style={{ color: 'var(--text3)' }} /> :
            <ChevronDown size={14} style={{ color: 'var(--text3)' }} />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, display: 'flex', gap: 16, paddingLeft: 8 }}>
          {entry.oldValue !== null && (
            <div style={{ flex: 1, background: 'rgba(255,71,87,0.08)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--red)', marginBottom: 4, letterSpacing: '0.05em' }}>— BEFORE</div>
              <code style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{entry.oldValue}</code>
            </div>
          )}
          <div style={{ flex: 1, background: 'rgba(0,255,159,0.08)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--emerald)', marginBottom: 4, letterSpacing: '0.05em' }}>+ AFTER</div>
            <code style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{entry.newValue}</code>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const LIMIT = 25;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/live-data/audit?limit=${LIMIT}&offset=${offset}`)
      .then(r => r.json())
      .then(d => {
        if (offset === 0) setEntries(d.data ?? []);
        else setEntries(prev => [...prev, ...(d.data ?? [])]);
        setTotal(d.pagination?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [offset]);

  const displayed = filter
    ? entries.filter(e =>
        e.entityType.includes(filter) ||
        e.entityId.toLowerCase().includes(filter.toLowerCase()) ||
        e.sourceName?.toLowerCase().includes(filter.toLowerCase())
      )
    : entries;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <History size={26} style={{ color: 'var(--cyan)' }} />
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>Data Audit Log</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text2)', fontSize: '0.88rem' }}>
          Full transparency into every data change made by the automation engine.
          Every score update, signal ingestion, and weight calibration is recorded here.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Changes', value: total, color: 'var(--cyan)' },
          { label: 'Data Sources', value: 'BLS · HN · Adzuna', color: 'var(--emerald)' },
          { label: 'Update Cycle', value: 'Every 6 hours', color: 'var(--yellow)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginBottom: 4, letterSpacing: '0.06em' }}>
              {stat.label.toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, color: stat.color, fontFamily: 'var(--mono)', fontSize: '0.95rem' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <Database size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text3)' }} />
        <input type="text" placeholder="Filter by role key, source, type…"
          value={filter} onChange={e => setFilter(e.target.value)}
          style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 16px 10px 36px', color: 'var(--text1)',
            fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(ENTITY_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(filter === key ? '' : key)} style={{
            background: filter === key ? `${ENTITY_COLORS[key]}18` : 'transparent',
            border: `1px solid ${filter === key ? ENTITY_COLORS[key] : 'var(--border)'}`,
            color: filter === key ? ENTITY_COLORS[key] : 'var(--text3)',
            borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: '0.75rem',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Log entries */}
      {loading && offset === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          Loading audit log…
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <History size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>No log entries yet. Run the pipeline to see data changes here.</div>
        </div>
      ) : (
        <div>
          {displayed.map(e => <AuditRow key={e.id} entry={e} />)}
          {!loading && entries.length < total && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={() => setOffset(prev => prev + LIMIT)} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '10px 28px', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.88rem',
              }}>
                Load more ({total - entries.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
