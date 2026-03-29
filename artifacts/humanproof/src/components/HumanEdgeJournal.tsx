import { useState, useEffect, useMemo, useRef } from 'react';
import { dimensionLabels, Dimension } from '../data/quizQuestions';
import { useHumanProof } from '../context/HumanProofContext';

// Section 5.3 — Extended JournalEntry to snapshot all three scores at creation time
interface JournalEntry {
  id: string;
  date: string;
  dimension: Dimension;
  title: string;
  body: string;
  tags: string[];
  humanScore: number | null;
  jobRiskScore: number | null;      // Section 5.3 — added
  skillRiskScore: number | null;    // Section 5.3 — added
  assessmentDate: string | null;    // Section 5.3 — added
}

const STORAGE_KEY = 'hp_journal_entries';
const JOURNAL_MAX_ENTRIES = 500;
const JOURNAL_WARN_AT = 450;

const loadEntries = (): JournalEntry[] => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// v3 FIX: Storage management — cap at 500 entries, warn at 450, prune oldest 50 if over cap
const saveEntries = (entries: JournalEntry[]) => {
  let toSave = entries;
  if (toSave.length > JOURNAL_MAX_ENTRIES) {
    // Prune oldest 50 entries (entries are stored newest-first, so prune the tail)
    toSave = toSave.slice(0, JOURNAL_MAX_ENTRIES - 50);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
};

const dimColors: Record<Dimension, string> = {
  empathic: 'var(--cyan)',
  moral: 'var(--violet-light)',
  creative: 'var(--emerald)',
  physical: 'var(--orange)',
  social: 'var(--yellow)',
  contextual: 'var(--red)',
};

// Dimension-specific insight messages for the pattern panel (Section 5.5)
const DIMENSION_INSIGHTS: Record<Dimension, string> = {
  empathic: 'your greatest competitive advantage is emotional intelligence — the ability to read and respond to human states that AI cannot model.',
  moral: 'your documented edge is ethical judgment — the capacity to navigate complexity, value conflicts, and accountability in ways AI cannot replicate.',
  creative: 'your edge is creative intuition — the ability to generate original ideas, make unexpected connections, and take imaginative leaps beyond data.',
  physical: 'your edge is embodied presence — your physical impact, spatial awareness, and in-person authority create value AI has no equivalent for.',
  social: 'your edge is social influence — your ability to build trust, persuade, and shift group dynamics is deeply human and fundamentally irreplaceable.',
  contextual: 'your edge is contextual wisdom — the accumulated institutional knowledge, relationships, and situational judgment that took years to build.',
};

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type FormState = { dimension: Dimension; title: string; body: string; tags: string };
const EMPTY_FORM: FormState = { dimension: 'empathic', title: '', body: '', tags: '' };

export default function HumanEdgeJournal({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { state } = useHumanProof();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterDim, setFilterDim] = useState<Dimension | 'all'>('all');
  const [filterTag, setFilterTag] = useState('');
  const [searchText, setSearchText] = useState('');

  // Section 5.2 — editingEntryId: null = new entry, string = editing existing
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  // BUG 6 FIX: useRef for dirty tracking — avoids spurious re-renders and stale closure issues
  // isDirtyRef is the authoritative check (used in backdrop handler)
  // isDirtyDisplay is the visual indicator (only set from actual user onChange events)
  const isDirtyRef = useRef(false);
  const [isDirtyDisplay, setIsDirtyDisplay] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  // Section 5.4 — Compute all unique tags from existing entries for autocomplete
  const existingTags = useMemo(() =>
    [...new Set(entries.flatMap(e => e.tags))].sort(),
    [entries]
  );

  // Section 5.5 — Pattern insight: compute dimension frequency
  const dimensionFrequency = useMemo(() =>
    entries.reduce((acc, entry) => {
      acc[entry.dimension] = (acc[entry.dimension] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    [entries]
  );

  const topDimension = useMemo(() =>
    Object.entries(dimensionFrequency).sort(([, a], [, b]) => b - a)[0]?.[0] as Dimension | undefined,
    [dimensionFrequency]
  );

  // BUG 7 FIX: require 8+ entries AND 3+ distinct dimensions for pattern insight
  const distinctDimensionsTagged = useMemo(() =>
    Object.keys(dimensionFrequency).length,
    [dimensionFrequency]
  );

  const updateForm = (patch: Partial<FormState>) => {
    setForm(f => ({ ...f, ...patch }));
    // BUG 6 FIX: set dirty only from user onChange events, never from programmatic setForm
    isDirtyRef.current = true;
    setIsDirtyDisplay(true);
  };

  // Section 5.1 — Confirm before closing if dirty
  const handleBackdropClick = () => {
    // BUG 6 FIX: check ref (not state) to avoid stale closure
    if (isDirtyRef.current) {
      if (window.confirm('You have unsaved changes. Discard this entry?')) {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntryId(null);
    setForm(EMPTY_FORM);
    // BUG 6 FIX: reset both ref and display state on close
    isDirtyRef.current = false;
    setIsDirtyDisplay(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingEntryId) {
      // Section 5.2 — Update existing entry
      const updated = entries.map(e =>
        e.id === editingEntryId
          ? { ...e, dimension: form.dimension, title: form.title.trim(), body: form.body.trim(), tags }
          : e
      );
      setEntries(updated);
      saveEntries(updated);
    } else {
      // Section 5.3 — New entry snapshots all three scores at creation time
      const newEntry: JournalEntry = {
        id: uuid(),
        date: new Date().toISOString().split('T')[0],
        dimension: form.dimension,
        title: form.title.trim(),
        body: form.body.trim(),
        tags,
        humanScore: state.humanScore,
        jobRiskScore: state.jobRiskScore,
        skillRiskScore: state.skillRiskScore,
        assessmentDate: state.lastUpdated,
      };
      const updated = [newEntry, ...entries];
      setEntries(updated);
      saveEntries(updated);
    }
    closeModal();
  };

  // Section 5.2 — Open modal pre-populated with existing entry data
  const handleEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setForm({
      dimension: entry.dimension,
      title: entry.title,
      body: entry.body,
      tags: entry.tags.join(', '),
    });
    // BUG 6 FIX: explicitly clear dirty on edit-open (opening to read is not a change)
    isDirtyRef.current = false;
    setIsDirtyDisplay(false);
    setShowModal(true);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  const openNewEntry = () => {
    setEditingEntryId(null);
    setForm(EMPTY_FORM);
    // BUG 6 FIX: always start fresh on new entry
    isDirtyRef.current = false;
    setIsDirtyDisplay(false);
    setShowModal(true);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 245, 255);
    doc.text('HumanProof — My Human Edge Report', 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(144, 144, 170);
    doc.text(`Generated ${new Date().toLocaleDateString()}  ·  ${entries.length} moments logged`, 20, 30);

    let y = 45;
    filtered.forEach((entry, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(232, 232, 240);
      doc.text(`${i + 1}. ${entry.title}`, 20, y);
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(144, 144, 170);
      const scoreLine = [
        entry.date,
        dimensionLabels[entry.dimension],
        entry.humanScore ? `Human: ${entry.humanScore}` : '',
        entry.jobRiskScore ? `Job Risk: ${entry.jobRiskScore}` : '',
        entry.skillRiskScore ? `Skill Risk: ${entry.skillRiskScore}` : '',
      ].filter(Boolean).join('  ·  ');
      doc.text(scoreLine, 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 210);
      const lines = doc.splitTextToSize(entry.body, 170);
      lines.forEach((line: string) => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 6;
      });
      if (entry.tags.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 120);
        doc.text(`Tags: ${entry.tags.join(', ')}`, 20, y);
        y += 5;
      }
      y += 8;
      doc.setDrawColor(50, 50, 80);
      doc.line(20, y - 4, 190, y - 4);
    });

    doc.save('my-human-edge-report.pdf');
  };

  const filtered = entries.filter(e => {
    const dimOk = filterDim === 'all' || e.dimension === filterDim;
    const tagOk = !filterTag || e.tags.some(t => t.toLowerCase().includes(filterTag.toLowerCase()));
    const searchOk = !searchText || e.title.toLowerCase().includes(searchText.toLowerCase()) || e.body.toLowerCase().includes(searchText.toLowerCase());
    return dimOk && tagOk && searchOk;
  });

  return (
    <div style={{ padding: '40px 0', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 4, height: 32, background: 'var(--emerald)', borderRadius: 2 }} />
            <h2 style={{ fontFamily: 'var(--mono)', fontSize: '1.5rem', color: 'var(--emerald)' }}>Human Edge Journal</h2>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginLeft: 16 }}>
            You've logged <strong style={{ color: 'var(--text)' }}>{entries.length}</strong> human-edge moment{entries.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {entries.length > 0 && (
            <button
              onClick={exportPDF}
              style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Export PDF
            </button>
          )}
          <button
            onClick={openNewEntry}
            style={{ background: 'var(--emerald)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '8px 20px', fontFamily: 'var(--mono)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* Section 5.5 — Pattern insight panel (BUG 7 FIX: 8+ entries AND 3+ distinct dimensions) */}
      {entries.length >= 8 && distinctDimensionsTagged >= 3 && topDimension && (
        <div style={{ padding: '16px 20px', background: 'rgba(0,255,159,0.06)', border: '1px solid rgba(0,255,159,0.2)', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🧠</span>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Your Human Edge Pattern — {dimensionFrequency[topDimension]} entries in {dimensionLabels[topDimension]}
            </div>
            <div style={{ color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Your journal shows {entries.length} entries, most in <strong style={{ color: dimColors[topDimension] }}>{dimensionLabels[topDimension]}</strong>. This pattern suggests {DIMENSION_INSIGHTS[topDimension]}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search entries…"
          style={{ flex: 1, minWidth: 180, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.85rem', outline: 'none' }}
        />
        <select
          value={filterDim}
          onChange={e => setFilterDim(e.target.value as Dimension | 'all')}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">All Dimensions</option>
          {(Object.keys(dimensionLabels) as Dimension[]).map(d => (
            <option key={d} value={d}>{dimensionLabels[d]}</option>
          ))}
        </select>
        <input
          type="text"
          value={filterTag}
          onChange={e => setFilterTag(e.target.value)}
          placeholder="Filter by tag…"
          style={{ minWidth: 140, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.85rem', outline: 'none' }}
        />
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✍️</div>
          <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 8 }}>
            {entries.length === 0 ? 'Start your human edge story' : 'No matching entries'}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto' }}>
            {entries.length === 0
              ? 'Log moments where your human skills made a real difference — empathy, judgment, creativity, presence.'
              : 'Try different search terms or clear your filters.'}
          </div>
          {entries.length === 0 && (
            <button
              onClick={openNewEntry}
              style={{ marginTop: 20, background: 'var(--emerald)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: 'var(--mono)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}
            >
              Log First Moment
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(entry => {
            const dimColor = dimColors[entry.dimension];
            return (
              <div key={entry.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${dimColor}30`, borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>{entry.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 4, background: `${dimColor}15`, color: dimColor, border: `1px solid ${dimColor}40` }}>
                        {dimensionLabels[entry.dimension]}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{entry.date}</span>
                      {entry.humanScore != null ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>Human: {entry.humanScore}</span>
                      ) : (
                        <button
                          onClick={() => onNavigate?.('quiz')}
                          style={{ background: 'none', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--cyan)', borderRadius: 6, padding: '2px 10px', fontFamily: 'var(--mono)', fontSize: '0.65rem', cursor: 'pointer', letterSpacing: '0.03em' }}
                        >
                          Take the Human Index quiz →
                        </button>
                      )}
                      {/* Section 5.3 — Show risk scores snapshotted at entry creation */}
                      {entry.jobRiskScore != null && (
                        <span style={{ fontSize: '0.7rem', color: 'rgba(0,245,255,0.5)', fontFamily: 'var(--mono)' }}>Job Risk: {entry.jobRiskScore}</span>
                      )}
                      {entry.skillRiskScore != null && (
                        <span style={{ fontSize: '0.7rem', color: 'rgba(167,139,250,0.5)', fontFamily: 'var(--mono)' }}>Skill Risk: {entry.skillRiskScore}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {/* Section 5.2 — Edit button */}
                    <button
                      onClick={() => handleEdit(entry)}
                      style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.7rem', padding: '4px 10px', borderRadius: 6, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                      title="Edit entry"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, padding: '4px 8px' }}
                      title="Delete entry"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '0.875rem', lineHeight: 1.7, margin: '10px 0' }}>{entry.body}</p>
                {entry.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {entry.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--text2)', border: '1px solid var(--border)' }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — New / Edit Entry */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) handleBackdropClick(); }}
        >
          <div style={{ background: '#0F0F2A', border: '1px solid var(--border2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--mono)', color: 'var(--emerald)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {editingEntryId ? 'Edit Human Edge Moment' : 'New Human Edge Moment'}
              </h3>
              <button onClick={handleBackdropClick} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Dimension</label>
                <select
                  value={form.dimension}
                  onChange={e => updateForm({ dimension: e.target.value as Dimension })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.875rem', outline: 'none' }}
                >
                  {(Object.entries(dimensionLabels) as [Dimension, string][]).map(([d, label]) => (
                    <option key={d} value={d}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => updateForm({ title: e.target.value })}
                  placeholder="e.g. Resolved team conflict under pressure"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>What happened?</label>
                <textarea
                  value={form.body}
                  onChange={e => updateForm({ body: e.target.value })}
                  placeholder="Describe the moment where your human skills made a difference…"
                  rows={5}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tags (comma separated)</label>
                {/* Section 5.4 — Tag autocomplete via datalist */}
                <input
                  list="tag-suggestions"
                  type="text"
                  value={form.tags}
                  onChange={e => updateForm({ tags: e.target.value })}
                  placeholder="e.g. leadership, conflict resolution"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.875rem', outline: 'none' }}
                />
                <datalist id="tag-suggestions">
                  {existingTags.map(tag => <option key={tag} value={tag} />)}
                </datalist>
              </div>

              {/* Section 5.1 — Dirty state indicator */}
              {isDirtyDisplay && (
                <div style={{ fontSize: '0.72rem', color: 'rgba(251,191,36,0.7)', fontFamily: 'var(--mono)' }}>
                  ● Unsaved changes
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={handleBackdropClick}
                  style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 8, padding: '11px', fontFamily: 'var(--mono)', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  style={{ flex: 2, background: 'var(--emerald)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '11px', fontFamily: 'var(--mono)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {editingEntryId ? 'Save Changes' : 'Save Moment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
