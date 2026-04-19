import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { StrategicRoadmap } from '../components/StrategicRoadmap';
import { getCareerIntelligence } from '../data/intelligence/index';
import { DimensionRadar } from '../components/DimensionRadar';
import { AIRiskSkillMatrix } from '../components/AIRiskSkillMatrix';
import { RoleRiskComparison } from '../components/RoleRiskComparison';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function AuditTerminalPage({ embedded = false }: { embedded?: boolean } = {}) {
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
    <div className="page-wrap" style={{ background: 'var(--bg)', perspective: '1000px' }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="config"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="section-hero" style={{ marginBottom: '40px', padding: 0 }}>
                <div className="badge badge-cyan" style={{ marginBottom: '16px' }}>ORACLE CONFIGURATION</div>
                <h1 className="display-2" style={{ marginBottom: '16px' }}>Configure Parameters</h1>
                <p style={{ color: 'var(--text-2)', maxWidth: 600, margin: '0 auto' }}>
                  Finalize your professional profile details to generate a high-fidelity displacement audit.
                </p>
              </div>

              <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px', borderRadius: 'var(--radius-xl)' }} className="glass-panel">
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Industry Selection Dropdown — Simple Management */}
                  <PremiumSelect
                    label="Select Your Domain"
                    value={industryKey}
                    onChange={(val) => { 
                      setIndustryKey(val); 
                      setWorkTypeKey(""); // Reset role selection when industry changes
                    }}
                    options={INDUSTRIES.map(i => ({
                      key: i.key,
                      label: i.label,
                      icon: i.icon,
                      color: CAT_COLORS[i.cat]
                    }))}
                  />

                  {industryKey && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <PremiumSelect
                          label="Role Designation"
                          value={workTypeKey}
                          onChange={(val) => { setWorkTypeKey(val); }}
                          options={workTypes.map((w: any) => ({
                            key: w.key,
                            label: w.label,
                            icon: getRoleIcon(w.label),
                            color: CAT_COLORS[INDUSTRIES.find(i => i.key === industryKey)?.cat || '']
                          }))}
                        />

                        <div className="grid-2">
                          <PremiumSelect
                            label="Years of Experience"
                            value={experience}
                            onChange={(val) => setExperience(val)}
                            options={EXPERIENCE_LEVELS.map(l => ({
                              key: l.key,
                              label: l.label,
                              icon: getExperienceIcon(l.key)
                            }))}
                          />
                          <PremiumSelect
                            label="Target Market / Region"
                            value={countryKey}
                            onChange={(val) => setCountryKey(val)}
                            options={COUNTRIES.map(c => ({
                              key: c.key,
                              label: c.label,
                              icon: c.flag
                            }))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={() => handleCalculate()}
                    disabled={!industryKey || !workTypeKey || loading}
                    className="btn btn-cyan btn-lg btn-full"
                    style={{ marginTop: '12px' }}
                  >
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="spinner" />
                        <span>Scanning Neural Pathways…</span>
                      </div>
                    ) : 'Execute Deep Audit'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
               <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'start' }}>
                
                {/* Main Results Panel — Responsive Flexbox */}
                <div style={{ flex: '1 1 600px', minWidth: 0 }}>
                  <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'transparent' }}>
                  
                  {/* Results Sub-Nav */}
                  <div className="tabs-wrap no-scrollbar" style={{ marginBottom: '24px', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '12px', width: 'fit-content' }}>
                    {[ 
                      { id: 'audit', label: '1. Risk Audit' }, 
                      { id: 'matrix', label: '2. Skill Matrix' }, 
                      { id: 'roadmap', label: '3. Strategic Roadmap' },
                      { id: 'forecast', label: '4. Trajectory' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        style={{ height: '44px' }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
                    {activeTab === 'audit' && (
                      <div className="fade-in">
                        <div style={{ display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
                          <ScoreRing score={result.total} color={scoreColor} />
                          <div style={{ flex: 1, minWidth: 280 }}>
                            <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>Oracle Analysis Live</div>
                            <h2 className="display-3" style={{ marginBottom: '16px', color: scoreColor }}>
                              {getVerdict(result.total)} Risk Profile
                            </h2>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
                              <span className="badge badge-ghost">⏱ {getTimeline(result.total)}</span>
                              <span className="badge badge-ghost">Urgency: {getUrgency(result.total)}</span>
                              {result.isGrounded && <span className="badge badge-cyan">AI-Verified Data</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                               <button className="btn btn-primary btn-sm" onClick={async () => { const snap = generateAssessmentSnapshot(result.total, workTypeKey, 0, 0); await downloadAssessmentPDF(snap, 'audit-report'); }}>↓ Download Audit</button>
                               <button className="btn btn-secondary btn-sm" onClick={() => { setIndustryKey(""); setWorkTypeKey(""); setResult(null); }}>↻ New Audit</button>
                             </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                            <h3 className="label-xs" style={{ marginBottom: '32px' }}>Dimension Analysis</h3>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <DimensionRadar 
                                dimensions={result.dimensions?.map((d: any) => ({
                                  key: d.key,
                                  label: DIM_INFO[d.key]?.label || d.label,
                                  score: d.score
                                })) || []} 
                                size={340}
                                color={scoreColor}
                              />
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                              <h3 className="label-xs" style={{ margin: 0 }}>AI Synthesis</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,212,224,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(0,212,224,0.2)' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: '0.6rem', color: 'var(--cyan)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>LIVE SIGNAL</span>
                              </div>
                            </div>
                            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
                              <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--cyan)' }} />
                              <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.8, fontStyle: 'italic', margin: 0 }}>
                                "{result.reasoning || 'Analyzing displacement markers and economic vectors for this specific role and region to generate a strategic synthesis...'}"
                              </p>
                              <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                                <div style={{ 
                                  width: 36, height: 36, borderRadius: '10px', 
                                  background: 'linear-gradient(135deg, var(--cyan), var(--violet))', 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  fontSize: '11px', color: '#000', fontWeight: 900,
                                  boxShadow: '0 0 15px rgba(0,212,224,0.3)'
                                }}>AI</div>
                                <div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Verified Strategy Engine</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>v4.0.21 Deterministic Proxy</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    )}

                    {activeTab === 'matrix' && (
                      <div className="fade-in">
                        {getCareerIntelligence(result.workTypeKey || workTypeKey) ? (
                          <AIRiskSkillMatrix intel={getCareerIntelligence(result.workTypeKey || workTypeKey)} scoreColor={scoreColor} roleKey={result.workTypeKey || workTypeKey} />
                        ) : (
                          <div style={{ textAlign: 'center', padding: 64, opacity: 0.5 }}>
                            <Cpu size={48} style={{ marginBottom: '16px' }} />
                            <p className="label-xs">No deep intelligence available for this specific role.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'roadmap' && (
                      <div className="fade-in">
                         {getCareerIntelligence(result.workTypeKey || workTypeKey) ? (
                          <StrategicRoadmap intel={getCareerIntelligence(result.workTypeKey || workTypeKey)} experience={experience} scoreColor={scoreColor} score={result.total} />
                         ) : (
                           <div style={{ textAlign: 'center', padding: 64, opacity: 0.5 }}>
                             <ShieldCheck size={48} style={{ marginBottom: '16px' }} />
                             <p className="label-xs">Strategic Roadmap unavailable.</p>
                           </div>
                         )}
                      </div>
                    )}

                    {activeTab === 'forecast' && (
                      <div className="fade-in">
                        <h3 className="label-xs" style={{ marginBottom: '32px' }}>Temporal Displacement Trajectory</h3>
                        {result.riskTrend && result.riskTrend.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '40px' }}>
                            {result.riskTrend.map((t: any, i: number) => {
                              const val = t.score ?? t.riskScore ?? 0;
                              const color = getScoreColor(val);
                              return (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="glass-panel" 
                                  style={{ padding: '20px 12px', textAlign: 'center', borderRadius: '16px' }}
                                >
                                  <div style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>{t.year}</div>
                                  <div style={{ fontWeight: 900, fontSize: '1.5rem', color, fontFamily: 'var(--font-display)' }}>{val}%</div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: 32, opacity: 0.5 }}>NO FORECAST DATA</div>
                        )}
                        <ScoreComparison />
                      </div>
                    )}
                  </div>
                </div>
              </div>


                {/* Right Panel — Responsive Flex item */}
                <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="card-cyan" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 className="label-xs" style={{ color: 'var(--cyan)', marginBottom: '16px' }}>Sensor Insights</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                      Our sensors indicate high AI volatility in the <strong>{INDUSTRIES.find(i => i.key === (result.industryKey || industryKey))?.cat || 'Strategic'}</strong> sector. Role-specific task automation is projected to increase significantly by Q3 2026.
                    </p>
                  </div>
                  <PortfolioShield />
                  <RoleRiskComparison currentRoleKey={result.workTypeKey || workTypeKey} currentScore={result.total} />
                  <DataFreshnessBadge roleKey={result?.workTypeKey || workTypeKey} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
