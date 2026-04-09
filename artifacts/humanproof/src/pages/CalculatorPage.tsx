import { useState, useRef, useEffect } from 'react';
import { INDUSTRIES, WORK_TYPES, COUNTRIES } from '../data/catalogData';
import {
  calculateScore,
  getScoreColor,
  getVerdict,
  getTimeline,
  getUrgency,
} from '../data/riskEngine';
import { useHumanProof } from '../context/HumanProofContext';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';
import { ScoreComparison } from '../components/ScoreComparison';
import { PortfolioShield } from '../components/PortfolioShield';
import { downloadAssessmentPDF, generateAssessmentSnapshot, generateShareableLink } from '../utils/assessmentExport';
import { supabase } from '../utils/supabase';
import { getCachedRisk, setCachedRisk } from '../services/cache/riskCache';

const EXPERIENCE_LEVELS = [
  { key: '0-2',   label: '0–2 years (Entry)' },
  { key: '2-5',   label: '2–5 years (Early)' },
  { key: '5-10',  label: '5–10 years (Mid)' },
  { key: '10-20', label: '10–20 years (Senior)' },
  { key: '20+',   label: '20+ years (Principal)' },
];

const DIM_INFO: Record<string, { icon: string; label: string }> = {
  D1: { icon: '⚡', label: 'Task Automatability' },
  D2: { icon: '🛠',  label: 'AI Tool Maturity'    },
  D3: { icon: '🔄', label: 'Human Amplification'  },
  D4: { icon: '🛡',  label: 'Experience Shield'   },
  D5: { icon: '🌍', label: 'Country Exposure'     },
  D6: { icon: '🤝', label: 'Social Capital Moat'  },
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 12px ${color}50)` }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em', color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-3)', letterSpacing: '0.1em', marginTop: '4px' }}>RISK %</div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  const { saveAssessment } = useHumanProof();
  const [industryKey, setIndustryKey] = useState('');
  const [workTypeKey, setWorkTypeKey] = useState('');
  const [countryKey, setCountryKey] = useState('usa');
  const [experience, setExperience] = useState('5-10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingText, setLoadingText] = useState('Initializing Generator Agent...');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    const phrases = [
      'Initializing Generator Agent...',
      'Cross-referencing D1-D6 market tables...',
      'Generator drafting assessment...',
      'Critic Agent reviewing draft...',
      'Validating 6-Dimension output...',
      'Finalizing analysis...'
    ];
    let idx = 0;
    setLoadingText(phrases[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setLoadingText(phrases[idx]);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleCalculate = async () => {
    if (!industryKey || !workTypeKey || !countryKey) return;

    // ── Check Cache ────────────────────────────────────────────────────────
    const cached = getCachedRisk({ roleKey: workTypeKey, industry: industryKey, country: countryKey, experience });
    if (cached) {
      setResult({ ...cached, fromCache: true });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = (supabase as any).supabaseUrl;
      const resp = await fetch(`${supabaseUrl}/functions/v1/calculate-grounded-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ roleKey: workTypeKey, industry: industryKey, country: countryKey, experience }),
      });
      if (!resp.ok) throw new Error('Grounded Engine Offline');
      const aiResult = await resp.json();
      const finalResult = { ...aiResult, workTypeKey, industryKey, countryKey, experience };

      // ── Save to Cache ──────────────────────────────────────────────────────
      setCachedRisk({ roleKey: workTypeKey, industry: industryKey, country: countryKey, experience }, finalResult);

      setResult(finalResult);
      await saveAssessment({ industry: industryKey, workType: workTypeKey, country: countryKey, experience, score: aiResult.total, details: finalResult });
    } catch {

      const scoreOperations = calculateScore(workTypeKey, industryKey, experience, countryKey);
      const fallbackResult = { ...scoreOperations, workTypeKey, industryKey, countryKey, experience, isGrounded: false };
      setResult(fallbackResult);
      await saveAssessment({ industry: industryKey, workType: workTypeKey, country: countryKey, experience, score: scoreOperations.total, details: fallbackResult });
    } finally {
      setLoading(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  };

  const workTypes = industryKey ? (WORK_TYPES[industryKey] ?? []) : [];
  const scoreColor = result ? getScoreColor(result.total) : 'var(--cyan)';

  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 860 }}>

        {/* Page header */}
        <div className="section-hero reveal" style={{ marginBottom: '48px' }}>
          <div className="badge badge-ghost" style={{ marginBottom: '20px' }}>Sensor Input Required</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: '16px' }}>
            Risk Oracle
          </h1>
          <p style={{ color: 'var(--text-2)', fontWeight: 500, maxWidth: 480, lineHeight: 1.6 }}>
            Initializing 6-Dimension labor analysis on Q1 2026 verified dataset.
          </p>
        </div>

        {/* Form Card */}
        <div className="card reveal" style={{ padding: '40px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, marginBottom: '28px', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Configure Parameters
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            <div className="input-wrap">
              <label className="input-label">Industry Cluster</label>
              <select
                value={industryKey}
                onChange={e => { setIndustryKey(e.target.value); setWorkTypeKey(''); }}
                className="input"
              >
                <option value="">Select domain...</option>
                {INDUSTRIES.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
              </select>
            </div>

            <div className="input-wrap">
              <label className="input-label">Role Designation</label>
              <select
                value={workTypeKey}
                onChange={e => setWorkTypeKey(e.target.value)}
                disabled={!industryKey}
                className="input"
                style={{ opacity: !industryKey ? 0.4 : 1 }}
              >
                <option value="">Select role...</option>
                {workTypes.map((w: any) => <option key={w.key} value={w.key}>{w.label}</option>)}
              </select>
            </div>

            <div className="input-wrap">
              <label className="input-label">Experience Level <span style={{ color: 'var(--cyan)', fontSize: '0.6rem' }}>D4</span></label>
              <select value={experience} onChange={e => setExperience(e.target.value)} className="input">
                {EXPERIENCE_LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </div>

            <div className="input-wrap">
              <label className="input-label">Territory Exposure <span style={{ color: 'var(--cyan)', fontSize: '0.6rem' }}>D5</span></label>
              <select value={countryKey} onChange={e => setCountryKey(e.target.value)} className="input">
                {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.flag} {c.label}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!industryKey || !workTypeKey || loading}
            className="btn btn-primary btn-full btn-lg"
            style={{
              background: !industryKey || !workTypeKey ? 'rgba(255,255,255,0.1)' : 'var(--text)',
              letterSpacing: '-0.01em',
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                {loadingText}
              </>
            ) : (
              'Execute Displacement Audit'
            )}
          </button>
        </div>

        {/* Results */}
        {result && !loading && (
          <div ref={resultRef} className="reveal">

            {/* Score Hero */}
            <div className="card" style={{ padding: '40px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: `radial-gradient(circle, ${scoreColor}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
                <ScoreRing score={result.total} color={scoreColor} />

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="badge badge-ghost" style={{ marginBottom: '12px' }}>Assessment Complete</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '12px', color: scoreColor }}>
                    {getVerdict(result.total)} Risk Profile
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <span className="badge badge-ghost">⏱ {getTimeline(result.total)}</span>
                    <span className="badge badge-ghost">Urgency: {getUrgency(result.total)}</span>
                    <span className={`badge ${result.confidence === 'HIGH' || result.content_confidence >= 80 ? 'badge-emerald' : 'badge-amber'}`}>
                      {result.confidence === 'HIGH' || result.content_confidence >= 80 ? '✓ High Confidence' : `⚠ Mod Confidence ${result.content_confidence ? `(${result.content_confidence}%)` : ''}`}
                    </span>
                    {result.isGrounded && <span className="badge badge-cyan">AI Verified</span>}
                    {result.isSeeded && <span className="badge" style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>Intelligence Seeded</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        const snap = generateAssessmentSnapshot(result.total, workTypeKey, 0, 0);
                        await downloadAssessmentPDF(snap, 'audit-snapshot');
                      }}
                    >
                      ↓ Download PDF
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + generateShareableLink());
                      }}
                    >
                      ↗ Share Link
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            {result.reasoning && (
              <div className="card card-cyan" style={{ padding: '28px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: 6, height: 6, background: 'var(--cyan)', borderRadius: '50%', animation: 'pulse-dot 2s infinite' }} />
                    <span className="label-xs" style={{ color: 'var(--cyan)' }}>AI Reasoning Synthesis</span>
                  </div>
                  {result.agentChain && (
                    <span className="label-xs" style={{ opacity: 0.5, fontSize: '0.65rem' }}>Agent Chain: {result.agentChain}</span>
                  )}
                </div>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: '0.9rem' }}>{result.reasoning}</p>
              </div>
            )}

            {/* 6D Bars */}
            <div className="card" style={{ padding: '32px', marginBottom: '20px' }}>
              <h3 className="label-xs" style={{ marginBottom: '24px' }}>6-Dimension Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {result.dimensions?.map((dim: any) => (
                  <div key={dim.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{DIM_INFO[dim.key]?.icon}</span>
                        {DIM_INFO[dim.key]?.label || dim.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: getScoreColor(dim.score) }}>
                        {dim.score}%
                      </span>
                    </div>
                    <div className="gauge-track" style={{ marginBottom: '8px' }}>
                      <div className="gauge-fill" style={{ width: `${dim.score}%`, background: getScoreColor(dim.score) }} />
                    </div>
                    {dim.reason && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5, paddingLeft: '28px', opacity: 0.8 }}>
                        {dim.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Career Transformation Engine */}
            <div className="card" style={{ padding: '32px', marginBottom: '20px', borderLeft: '4px solid var(--cyan)' }}>
              <h2 className="label-xs" style={{ marginBottom: '24px', color: 'var(--cyan)' }}>Career Transformation Engine</h2>
              
              {/* Risk Trend */}
              {result.riskTrend && result.riskTrend.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', width: '100%', marginBottom: '4px' }}>Risk Horizon Forecast</div>
                  {result.riskTrend.map((t: any, i: number) => (
                    <div key={i} className="badge badge-ghost" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 14px', minWidth: '80px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '4px' }}>{t.year}</span>
                       <span style={{ color: getScoreColor(t.score), fontWeight: 800, fontSize: '1rem' }}>{t.score}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost of Inaction */}
              {result.inaction_scenario && (
                <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginBottom: '24px' }}>
                  <p style={{ color: 'var(--red)', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ Cost of Inaction: {result.inaction_scenario}</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* AI Risk Skills Accordion */}
                {result.ai_risk_skills && (
                  <details style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <summary style={{ padding: '16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', outline: 'none' }}>
                      ▶ View AI Risk Skill Matrix
                    </summary>
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {/* Obsolete */}
                      <div><h4 style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase' }}>❌ Obsolete Skills</h4>
                        {result.ai_risk_skills.obsolete?.map((s:any, i:number) => (
                          <div key={i} style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.skill}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.reason}</div>
                          </div>
                        ))}
                      </div>
                      {/* At Risk */}
                      <div><h4 style={{ color: 'var(--amber)', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase' }}>⚠️ At-Risk Skills</h4>
                        {result.ai_risk_skills.at_risk?.map((s:any, i:number) => (
                          <div key={i} style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.skill}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.reason}</div>
                          </div>
                        ))}
                      </div>
                      {/* Safe */}
                      <div><h4 style={{ color: 'var(--emerald)', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase' }}>✅ Safe Skills</h4>
                        {result.ai_risk_skills.safe?.map((s:any, i:number) => (
                          <div key={i} style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.skill}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                )}

                {/* Safer Career Paths Accordion */}
                {result.safer_career_paths && result.safer_career_paths.length > 0 && (
                  <details style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <summary style={{ padding: '16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', outline: 'none' }}>
                      ▶ View Safer Career Pivot Paths
                    </summary>
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {result.safer_career_paths.map((path:any, i:number) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{path.role}</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                               {path.salary_delta && <div className="badge badge-amber">{path.salary_delta}</div>}
                               {path.time_to_transition && <div className="badge badge-ghost">⏱ {path.time_to_transition}</div>}
                               <div className="badge badge-emerald">Risk -{path.risk_reduction_pct}%</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '8px' }}><span style={{ color: 'var(--text)' }}>Gap:</span> {path.skill_gap}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Difficulty: {path.transition_difficulty}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Roadmap Accordion */}
                {result.roadmap && (
                  <details open style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <summary style={{ padding: '16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', outline: 'none' }}>
                      ▶ View Strategic Transformation Roadmap
                    </summary>
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                       {['phase_1', 'phase_2', 'phase_3'].map((phaseKey) => {
                         const phase = result.roadmap[phaseKey];
                         if (!phase) return null;
                         return (
                           <div key={phaseKey} style={{ marginBottom: '24px' }}>
                             <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '12px', textTransform: 'uppercase' }}>
                               {phaseKey.replace('_', ' ')} <span style={{ opacity: 0.5 }}>({phase.timeline})</span>
                             </h4>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                               {phase.actions?.map((act:any, idx:number) => (
                                 <div key={idx} style={{ paddingLeft: '16px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                   <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{act.action}</div>
                                   <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: '4px' }}>Why: {act.why}</div>
                                   <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '4px' }}>Outcome: {act.outcome}</div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  </details>
                )}
              </div>
            </div>

            <ScoreComparison />
            <PortfolioShield />

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <DataFreshnessBadge roleKey={result.workTypeKey} fallbackScore={result.total} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
