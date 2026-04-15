import { useState, useRef, useEffect, useMemo } from 'react';
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
import { downloadAssessmentPDF, generateAssessmentSnapshot } from '../utils/assessmentExport';
import { supabase } from '../utils/supabase';
import { getCachedRisk, setCachedRisk } from '../services/cache/riskCache';
import { recordScore, getScoreDelta, type ScoreDelta } from '../services/scoreDeltaService';
import { PremiumSelect, SelectOption } from '../components/ui/PremiumSelect';
import { AIRiskSkillMatrix } from '../components/AIRiskSkillMatrix';
import { StrategicRoadmap } from '../components/StrategicRoadmap';
import { getCareerIntelligence } from '../data/intelligence/index';
import { 
  Briefcase, 
  Cpu, 
  Database, 
  Globe, 
  Layout, 
  Lock, 
  Smartphone, 
  Users, 
  ShieldCheck, 
  BarChart, 
  PenTool, 
  Stethoscope, 
  Gavel, 
  GraduationCap, 
  Factory, 
  ShoppingBag, 
  Zap,
  Clock,
  User,
  Star,
  Shield,
  Search
} from 'lucide-react';

const EXPERIENCE_LEVELS = [
  { key: '0-2',   label: '0–2 years (Entry)' },
  { key: '2-5',   label: '2–5 years (Early)' },
  { key: '5-10',  label: '5–10 years (Mid)' },
  { key: '10-20', label: '10–20 years (Senior)' },
  { key: '20+',   label: '20+ years (Principal)' },
];

const CAT_COLORS: Record<string, string> = {
  'Technology': 'var(--cyan)',
  'Finance & Business': 'var(--emerald)',
  'Media & Creative': 'var(--violet)',
  'Services': 'var(--amber)',
  'Healthcare & Science': 'var(--red)',
  'Education': '#38bdf8',
  'Industry & Engineering': '#94a3b8',
  'Retail & Consumer': '#f472b6',
  'Government & Social': '#4ade80',
};

const getRoleIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('backend') || l.includes('api') || l.includes('db') || l.includes('sql')) return <Database className="w-4 h-4" />;
  if (l.includes('frontend') || l.includes('web') || l.includes('react') || l.includes('ui') || l.includes('ux') || l.includes('design')) return <Layout className="w-4 h-4" />;
  if (l.includes('mobile') || l.includes('ios') || l.includes('android')) return <Smartphone className="w-4 h-4" />;
  if (l.includes('ai') || l.includes('ml') || l.includes('model') || l.includes('data')) return <Cpu className="w-4 h-4" />;
  if (l.includes('security') || l.includes('cyber')) return <Lock className="w-4 h-4" />;
  if (l.includes('manager') || l.includes('lead') || l.includes('product') || l.includes('pm')) return <Briefcase className="w-4 h-4" />;
  if (l.includes('test') || l.includes('qa')) return <Search className="w-4 h-4" />;
  if (l.includes('devops') || l.includes('cloud') || l.includes('infra')) return <Globe className="w-4 h-4" />;
  if (l.includes('content') || l.includes('write') || l.includes('copy')) return <PenTool className="w-4 h-4" />;
  if (l.includes('marketing') || l.includes('seo') || l.includes('ads')) return <BarChart className="w-4 h-4" />;
  if (l.includes('doctor') || l.includes('nurse') || l.includes('specialist')) return <Stethoscope className="w-4 h-4" />;
  if (l.includes('legal') || l.includes('law')) return <Gavel className="w-4 h-4" />;
  if (l.includes('teach') || l.includes('learn') || l.includes('edu')) return <GraduationCap className="w-4 h-4" />;
  if (l.includes('mfg') || l.includes('eng') || l.includes('production')) return <Factory className="w-4 h-4" />;
  if (l.includes('retail') || l.includes('shop') || l.includes('ecom')) return <ShoppingBag className="w-4 h-4" />;
  return <Briefcase className="w-4 h-4" />;
};

const getExperienceIcon = (key: string) => {
  if (key === '0-2') return <Zap className="w-4 h-4" />;
  if (key === '2-5') return <Clock className="w-4 h-4" />;
  if (key === '5-10') return <User className="w-4 h-4" />;
  if (key === '10-20') return <Star className="w-4 h-4" />;
  if (key === '20+') return <ShieldCheck className="w-4 h-4" />;
  return <Briefcase className="w-4 h-4" />;
};

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

export default function AuditTerminalPage() {
  const { state, saveAssessment, dispatch } = useHumanProof();
  const [industryKey, setIndustryKey] = useState(state.initialIndustryKey || '');
  const [workTypeKey, setWorkTypeKey] = useState(state.initialWorkTypeKey || '');
  const [countryKey, setCountryKey] = useState('usa');
  const [experience, setExperience] = useState('5-10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scoreDelta, setScoreDelta] = useState<ScoreDelta | null>(null);
  const [loadingText, setLoadingText] = useState('Initializing Generator Agent...');
  const resultRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);


  useEffect(() => {
    if (!loading) return;
    setLoadingText('Connecting to Edge Inference Router...');
  }, [loading]);

  const handleCalculate = async (ind?: string, wt?: string) => {
    const finalInd = ind || industryKey;
    const finalWt = wt || workTypeKey;

    if (!finalInd || !finalWt || !countryKey) return;

    // ── Check Cache ────────────────────────────────────────────────────────
    const cached = getCachedRisk({ roleKey: finalWt, industry: finalInd, country: countryKey, experience });
    if (cached) {
      setResult({ ...cached, fromCache: true });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
      const resp = await fetch(`${apiBase}/api/v1/grounded-risk`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session?.access_token || ''}` 
        },
        body: JSON.stringify({ roleKey: finalWt, industry: finalInd, country: countryKey, experience }),
      });
      if (!resp.ok) throw new Error('Grounded Engine Offline');
      const aiResult = await resp.json();
      const finalResult = { ...aiResult, workTypeKey: finalWt, industryKey: finalInd, countryKey, experience };

      // ── Save to Cache ──────────────────────────────────────────────────────
      setCachedRisk({ roleKey: finalWt, industry: finalInd, country: countryKey, experience }, finalResult);

      // ── Track Score Delta ─────────────────────────────────────────────────
      recordScore({ roleKey: finalWt, industryKey: finalInd, countryKey, experience, score: aiResult.total, timestamp: Date.now(), isGrounded: true });
      setScoreDelta(getScoreDelta(finalWt, aiResult.total, experience, countryKey));

      setResult(finalResult);
      await saveAssessment({ industry: finalInd, workType: finalWt, country: countryKey, experience, score: aiResult.total, details: finalResult });
    } catch {
      const scoreOperations = calculateScore(finalWt, finalInd, experience, countryKey);
      const fallbackResult = { ...scoreOperations, workTypeKey: finalWt, industryKey: finalInd, countryKey, experience, isGrounded: false };

      // ── Track Score Delta (fallback) ──────────────────────────────────────
      recordScore({ roleKey: finalWt, industryKey: finalInd, countryKey, experience, score: scoreOperations.total, timestamp: Date.now(), isGrounded: false });
      setScoreDelta(getScoreDelta(finalWt, scoreOperations.total, experience, countryKey));

      setResult(fallbackResult);
      await saveAssessment({ industry: finalInd, workType: finalWt, country: countryKey, experience, score: scoreOperations.total, details: fallbackResult });
    } finally {
      setLoading(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  };
  
  // Auto-fill from context and trigger calculation if coming from the modal
  useEffect(() => {
    if (state.initialIndustryKey && state.initialWorkTypeKey && !hasTriggered.current) {
      hasTriggered.current = true;
      
      const targetInd = state.initialIndustryKey;
      const targetWt = state.initialWorkTypeKey;

      // Small delay to ensure UI components are hydrated
      const timer = setTimeout(() => {
        setIndustryKey(targetInd);
        setWorkTypeKey(targetWt);
        handleCalculate(targetInd, targetWt);
        
        // Clear the initial role from context once consumed
        dispatch({ type: 'CLEAR_INITIAL_ROLE' });
      }, 300); // Slightly longer delay for stability
      
      return () => clearTimeout(timer);
    }
  }, [state.initialIndustryKey, state.initialWorkTypeKey, dispatch]);

  const workTypes = industryKey ? (WORK_TYPES[industryKey] ?? []) : [];
  const scoreColor = result ? getScoreColor(result.total) : 'var(--cyan)';

  const [activeTab, setActiveTab] = useState<'audit' | 'matrix' | 'roadmap' | 'forecast'>('audit');

  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Terminal Header */}
        <div className="section-hero reveal" style={{ marginBottom: '40px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: '16px' }}>SENSOR INPUT REQUIRED</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: '16px' }}>
              Risk Oracle
            </h1>
            <p style={{ color: 'var(--text-2)', fontWeight: 500, maxWidth: 480, lineHeight: 1.6 }}>
              Central command for your career displacement analytics. Configure parameters below to generate your 6-Dimension risk profile across all engines.
            </p>
          </div>
        </div>

        <div className="grid-3" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 2.5fr)', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Panel: Configuration Form */}
          <div className="card reveal" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
            <h2 className="label-xs" style={{ marginBottom: '24px' }}>System Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <PremiumSelect
                label="Industry Cluster"
                value={industryKey}
                onChange={val => { setIndustryKey(val); setWorkTypeKey(''); setResult(null); }}
                options={INDUSTRIES.map(i => ({
                  key: i.key,
                  label: i.label,
                  icon: i.icon,
                  cat: i.cat,
                  color: CAT_COLORS[i.cat]
                }))}
                placeholder="Select domain..."
                groups={useMemo(() => {
                  const grps: Record<string, SelectOption[]> = {};
                  INDUSTRIES.forEach(i => {
                    if (!grps[i.cat]) grps[i.cat] = [];
                    grps[i.cat].push({
                      key: i.key,
                      label: i.label,
                      icon: i.icon,
                      cat: i.cat,
                      color: CAT_COLORS[i.cat]
                    });
                  });
                  return grps;
                }, [])}
              />

              <PremiumSelect
                label="Role Designation"
                value={workTypeKey}
                onChange={(val) => { setWorkTypeKey(val); setResult(null); }}
                disabled={!industryKey}
                placeholder={!industryKey ? "Select industry first..." : "Select role..."}
                options={workTypes.map((w: any) => ({
                  key: w.key,
                  label: w.label,
                  icon: getRoleIcon(w.label),
                  color: industryKey ? CAT_COLORS[INDUSTRIES.find(i => i.key === industryKey)?.cat || ''] : undefined
                }))}
              />

              <PremiumSelect
                label="Experience Level"
                value={experience}
                onChange={(val) => { setExperience(val); setResult(null); }}
                options={EXPERIENCE_LEVELS.map(l => ({
                  key: l.key,
                  label: l.label,
                  icon: getExperienceIcon(l.key)
                }))}
              />

              <PremiumSelect
                label="Territory Exposure"
                value={countryKey}
                onChange={(val) => { setCountryKey(val); setResult(null); }}
                options={COUNTRIES.map(c => ({
                  key: c.key,
                  label: c.label,
                  icon: c.flag
                }))}
              />
            </div>

            <button
              onClick={() => handleCalculate()}
              disabled={!industryKey || !workTypeKey || loading}
              className="btn btn-primary btn-full btn-lg"
              style={{
                background: !industryKey || !workTypeKey ? 'rgba(255,255,255,0.1)' : 'var(--cyan)',
                color: !industryKey || !workTypeKey ? 'var(--text-3)' : '#000',
                letterSpacing: '-0.01em',
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
                  {loadingText}
                </>
              ) : (
                'Execute Risk Audit'
              )}
            </button>
          </div>

          {/* Right Panel: Output Terminal */}
          <div className="card reveal" style={{ minHeight: '600px', background: 'var(--bg-raised)', padding: 0, overflow: 'hidden' }}>
            
            {/* Terminal Output Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', padding: '0 16px', overflowX: 'auto' }}>
              {[ 
                { id: 'audit', label: '1. Risk Audit' }, 
                { id: 'matrix', label: '2. Skill Matrix', disabled: !result }, 
                { id: 'roadmap', label: '3. Strategic Roadmap', disabled: !result },
                { id: 'forecast', label: '4. Trajectory', disabled: !result }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                  style={{
                    padding: '16px 24px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--text)' : tab.disabled ? 'var(--text-3)' : 'var(--text-2)',
                    fontSize: '0.85rem',
                    fontWeight: activeTab === tab.id ? 800 : 500,
                    cursor: tab.disabled ? 'not-allowed' : 'pointer',
                    opacity: tab.disabled ? 0.5 : 1,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '32px' }} ref={resultRef}>
              {!result && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', opacity: 0.5 }}>
                  <ShieldCheck size={48} style={{ marginBottom: '16px' }} />
                  <p className="label-xs">AWAITING SYSTEM PARAMETERS</p>
                </div>
              )}

              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
                  <div className="spinner" style={{ width: 40, height: 40, marginBottom: '20px' }} />
                  <p className="label-xs text-glow" style={{ color: 'var(--cyan)' }}>Running Deep Neural Analysis...</p>
                </div>
              )}

              {result && !loading && (() => {
                const seededIntel = getCareerIntelligence(result.workTypeKey || workTypeKey);
                const hasSeeded = !!seededIntel;

                return (
                  <div>
                    {/* TAB: AUDIT */}
                    {activeTab === 'audit' && (
                      <div className="fade-in">
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
                          <ScoreRing score={result.total} color={scoreColor} />
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div className="badge badge-ghost" style={{ marginBottom: '12px' }}>Assessment Complete</div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '12px', color: scoreColor }}>
                              {getVerdict(result.total)} Risk Profile
                            </h2>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                              <span className="badge badge-ghost">⏱ {getTimeline(result.total)}</span>
                              <span className="badge badge-ghost">Urgency: {getUrgency(result.total)}</span>
                              {result.isGrounded && <span className="badge badge-cyan">AI Verified</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                               <button className="btn btn-secondary btn-sm" onClick={async () => { const snap = generateAssessmentSnapshot(result.total, workTypeKey, 0, 0); await downloadAssessmentPDF(snap, 'audit-snapshot'); }}>↓ Download PDF</button>
                               <button className="btn btn-ghost btn-sm" onClick={() => { const params = new URLSearchParams({ industry: result.industryKey || industryKey, role: result.workTypeKey || workTypeKey, country: result.countryKey || countryKey, exp: result.experience || experience, score: String(result.total) }); navigator.clipboard.writeText(`${window.location.origin}/terminal?${params.toString()}`); }}>↗ Share Link</button>
                            </div>
                          </div>
                        </div>

                        {result.reasoning && (
                          <div className="card card-ghost" style={{ padding: '24px', marginBottom: '32px', background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.1)' }}>
                            <h3 className="label-xs" style={{ color: 'var(--cyan)', marginBottom: '12px' }}>AI Synthesis</h3>
                            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7 }}>{result.reasoning}</p>
                          </div>
                        )}

                        <h3 className="label-xs" style={{ marginBottom: '24px' }}>6-Dimension Breakdown</h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                          {result.dimensions?.map((dim: any) => (
                            <div key={dim.key}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                                  <span style={{ marginRight: 8, opacity: 0.7 }}>{DIM_INFO[dim.key]?.icon}</span>
                                  {DIM_INFO[dim.key]?.label || dim.label}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: getScoreColor(dim.score) }}>
                                  {dim.score}%
                                </span>
                              </div>
                              <div className="gauge-track" style={{ marginBottom: '8px', height: 4 }}>
                                <div className="gauge-fill" style={{ width: `${dim.score}%`, background: getScoreColor(dim.score) }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB: MATRIX */}
                    {activeTab === 'matrix' && (
                      <div className="fade-in">
                        {hasSeeded ? (
                          <AIRiskSkillMatrix intel={seededIntel} scoreColor={scoreColor} roleKey={result.workTypeKey || workTypeKey} />
                        ) : (
                          <div style={{ textAlign: 'center', padding: 32 }}>
                            <p className="label-xs" style={{ color: 'var(--text-3)' }}>Matrix generation unavailable for this specific sub-role.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: ROADMAP */}
                    {activeTab === 'roadmap' && (
                      <div className="fade-in">
                         {hasSeeded ? (
                          <StrategicRoadmap intel={seededIntel} experience={experience} scoreColor={scoreColor} score={result.total} />
                         ) : (
                           <div style={{ textAlign: 'center', padding: 32 }}>
                             <p className="label-xs" style={{ color: 'var(--text-3)' }}>Strategic Roadmap unavailable for this specific sub-role.</p>
                           </div>
                         )}
                      </div>
                    )}

                    {/* TAB: FORECAST */}
                    {activeTab === 'forecast' && (
                      <div className="fade-in">
                        <h3 className="label-xs" style={{ marginBottom: '24px' }}>Displacement Trajectory</h3>
                        {result.riskTrend && result.riskTrend.length > 0 ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', overflowX: 'auto', paddingBottom: 16 }}>
                            {result.riskTrend.map((t: any, i: number) => {
                              const val = t.score ?? t.riskScore ?? 0;
                              const color = getScoreColor(val);
                              const isNow = i === 0;
                              return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                                  <div style={{ padding: '16px 12px', background: isNow ? `${color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${isNow ? color : 'var(--border)'}`, borderRadius: '12px', textAlign: 'center', width: '100%' }}>
                                    <div style={{ fontWeight: 900, fontSize: '1.25rem', color, fontFamily: 'var(--font-display)' }}>{val}%</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>{t.year}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: 32 }}>
                            <p className="label-xs" style={{ color: 'var(--text-3)' }}>Forecast data generation unavailable.</p>
                          </div>
                        )}
                        <ScoreComparison />
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
