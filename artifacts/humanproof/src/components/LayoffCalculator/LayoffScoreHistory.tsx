import React, { useEffect, useState } from 'react';
import { getLayoffScoreHistory, ScoreHistoryEntry, clearLayoffScoreHistory } from '../../services/scoreStorageService';

interface Props {
  refreshKey?: number;
}

export const LayoffScoreHistory: React.FC<Props> = ({ refreshKey = 0 }) => {
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    // Reverse so newest is first; refreshKey dependency triggers re-fetch after save
    const data = getLayoffScoreHistory().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setHistory(data);
  }, [refreshKey]);

  if (history.length === 0) return null;

  const handleClearRequest = () => setConfirmClear(true);

  const handleClearConfirm = () => {
    clearLayoffScoreHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  const getTierHex = (c: string) => {
    const map: Record<string, string> = {
      red: '#ef4444', orange: '#f97316', amber: '#f59e0b', green: '#10b981', teal: '#14b8a6',
    };
    return map[c] || '#00F5FF';
  };

  return (
    <div style={{
      marginTop: '40px',
      padding: '24px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ color: '#fff', margin: 0 }}>Your Score History</h3>

        {/* Inline confirm — replaces window.confirm() */}
        {confirmClear ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#9ba5b4', fontSize: '0.8rem' }}>Clear all?</span>
            <button
              onClick={handleClearConfirm}
              aria-label="Confirm clear history"
              style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
                color: '#ef4444', padding: '4px 10px', borderRadius: '4px',
                cursor: 'pointer', fontSize: '0.8rem',
              }}
            >
              Yes, clear
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              aria-label="Cancel clear history"
              style={{
                background: 'none', border: 'none',
                color: '#9ba5b4', cursor: 'pointer', fontSize: '0.8rem',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleClearRequest}
            aria-label="Clear history"
            style={{
              background: 'none', border: 'none', color: '#6b7280',
              fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
        {history.map((entry) => {
          const d = new Date(entry.timestamp);
          const hex = getTierHex(entry.tierColor);
          return (
            <div key={entry.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg2, #111827)',
              borderRadius: '8px',
              borderLeft: `4px solid ${hex}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>{entry.score}%</div>
                <div style={{ color: '#9ba5b4', fontSize: '0.85rem', marginTop: '2px' }}>
                  {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {entry.companyName}
                </div>
                {entry.roleTitle && (
                  <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '2px' }}>
                    {entry.roleTitle} {entry.department ? `(${entry.department})` : ''}
                  </div>
                )}
              </div>
              <div style={{
                background: `${hex}15`,
                color: hex,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 500,
                border: `1px solid ${hex}30`,
              }}>
                {entry.tier}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
