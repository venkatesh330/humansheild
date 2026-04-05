import { useState, useRef, useEffect } from 'react';
import { INDUSTRIES, WORK_TYPES, COUNTRIES } from '../data/catalogData';
import type { Industry, WorkType, Country } from '../data/catalogData';
import {
  calculateScore,
  getScoreColor,
  getVerdict,
  getTimeline,
  getUrgency,
  getConfidence,
  getAutomationExp,
} from '../data/riskEngine';
import { DANGER_SKILLS, SAFE_SKILLS, TRANSITION_RECS } from '../data/skillsData';
import { useHumanProof } from '../context/HumanProofContext';
import PeerBenchmark from '../components/PeerBenchmark';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';

// NEW-08: Career Pivot Simulator — map common pivot labels to known work type keys
// Allows calculateScore to estimate risk for a pivot target
const PIVOT_WORK_KEY_MAP: Record<string, string> = {
  'ai engineering lead': 'sw_ml',
  'platform engineering': 'sw_devops',
  'developer relations': 'sw_lead',
  'ai product designer': 'des_ux',
  'full-stack ai integrations': 'sw_fullstack',
  'developer advocate': 'cnt_tech_write',
  'ai application developer': 'sw_fullstack',
  'saas product manager': 'sw_lead',
  'indie hacker': 'sw_fullstack',
  'ai infrastructure engineer': 'sw_devops',
  'platform engineer': 'sw_devops',
  'cloud finops specialist': 'sw_cloud',
  'chief ai officer': 'sw_arch',
  'ai systems architect': 'sw_arch',
  'technology advisory': 'con_it',
  'ai quality engineer': 'sw_testing',
  'ai governance analyst': 'fin_compliance',
  'process automation designer': 'con_it',
  'cfo office ai strategist': 'fin_fp',
  'fp&a analyst': 'fin_fp',
  'financial controller': 'fin_reporting',
  'hr technology consultant': 'hr_hris',
  'people analytics manager': 'hr_ld',
  'compensation & benefits specialist': 'hr_comp',
  'ai content strategist': 'cnt_blog',
  'brand narrative lead': 'mkt_brand',
  'content operations manager': 'cnt_blog',
  'seo strategy lead': 'mkt_seo',
  'content marketing manager': 'cnt_blog',
  'digital pr specialist': 'mkt_brand',
  'customer experience designer': 'des_ux',
  'cx technology specialist': 'hr_hris',
  'voice of customer analyst': 'mkt_analytics',
  'ai operations specialist': 'con_it',
  'process improvement analyst': 'con_change',
  'data quality manager': 'sw_db',
  'clinical documentation specialist': 'hc_admin_hc',
  'health informatics analyst': 'sw_db',
  'healthcare operations manager': 'hc_admin_hc',
  'ai radiology specialist': 'hc_radiology',
  'clinical ai trainer': 'sw_ml',
  'radiology research lead': 'hc_radiology',
  'legal technology specialist': 'leg_legaltech',
  'legal project manager': 'leg_compliance',
  'contract intelligence analyst': 'leg_legaltech',
  'creative director': 'des_graphic',
  'ai art director': 'des_graphic',
  'brand experience designer': 'mkt_brand',
  'talent intelligence specialist': 'hr_recruit',
  'employer brand manager': 'mkt_brand',
  'people analytics lead': 'hr_hris',
  'seo strategy director': 'mkt_seo',
  'content intelligence lead': 'cnt_seo_content',
  'digital marketing director': 'mkt_brand',
  'ai augmentation specialist': 'con_it',
  'change management consultant': 'con_change',
  'learning & development designer': 'hr_ld',
};

function pivotLabelToWorkKey(pivotLabel: string): string | null {
  const lower = pivotLabel.toLowerCase().split(' — ')[0].trim();
  for (const [keyword, key] of Object.entries(PIVOT_WORK_KEY_MAP)) {
    if (lower.includes(keyword)) return key;
  }
  return null;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.substring(0, idx)}
      <span className="ac-match">{text.substring(idx, idx + query.length)}</span>
      {text.substring(idx + query.length)}
    </>
  );
}

interface ACFieldProps {
  type: 'industry' | 'worktype' | 'country';
  placeholder: string;
  selectedIndustryKey?: string;
  onSelect: (key: string, label: string) => void;
  value: string;
}

function ACField({ type, placeholder, selectedIndustryKey, onSelect, value }: ACFieldProps) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!value) setQuery(''); }, [value]);

  const getOptions = () => {
    const q = query.toLowerCase().trim();
    if (type === 'industry') {
      return q ? INDUSTRIES.filter(i => i.label.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q)) : INDUSTRIES;
    }
    if (type === 'worktype') {
      if (!selectedIndustryKey) return [];
      const types = WORK_TYPES[selectedIndustryKey] || WORK_TYPES.default;
      return q ? types.filter(t => t.label.toLowerCase().includes(q)) : types;
    }
    if (type === 'country') {
      return q ? COUNTRIES.filter(c => c.label.toLowerCase().includes(q)) : COUNTRIES;
    }
    return [];
  };

  const opts = getOptions();

  const handleSelect = (key: string, label: string) => {
    setQuery(label);
    setOpen(false);
    setFocusIdx(-1);
    onSelect(key, label);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, opts.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && focusIdx >= 0) {
      e.preventDefault();
      const opt = opts[focusIdx] as any;
      handleSelect(opt.key, opt.label);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ddRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const renderOptions = () => {
    if (type === 'worktype' && !selectedIndustryKey) {
      return <div className="ac-no-results">🔍 Select an industry first</div>;
    }
    if (opts.length === 0) {
      return <div className="ac-no-results">No matches found</div>;
    }
    if (type === 'industry') {
      const inds = opts as Industry[];
      const cats = [...new Set(inds.map(o => o.cat))];
      let globalIdx = 0;
      return cats.map(cat => {
        const items = inds.filter(o => o.cat === cat);
        return (
          <div key={cat}>
            <div className="ac-category-header">{cat}</div>
            {items.map(item => {
              const idx = globalIdx++;
              return (
                <div
                  key={item.key}
                  className={`ac-option${focusIdx === idx ? ' focused' : ''}`}
                  onMouseDown={() => handleSelect(item.key, item.label)}
                >
                  <span className="ac-icon">{item.icon}</span>
                  <span>{highlight(item.label, query)}</span>
                </div>
              );
            })}
          </div>
        );
      });
    }
    if (type === 'country') {
      return (opts as Country[]).map((item, idx) => (
        <div
          key={item.key}
          className={`ac-option${focusIdx === idx ? ' focused' : ''}`}
          onMouseDown={() => handleSelect(item.key, item.label)}
        >
          <span className="ac-icon">{item.flag}</span>
          <span>{highlight(item.label, query)}</span>
        </div>
      ));
    }
    return (opts as WorkType[]).map((item, idx) => (
      <div
        key={item.key}
        className={`ac-option${focusIdx === idx ? ' focused' : ''}`}
        onMouseDown={() => handleSelect(item.key, item.label)}
      >
        <span className="ac-icon">🔹</span>
        <span>{highlight(item.label, query)}</span>
      </div>
    ));
  };

  return (
    <div className="ac-wrap">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); setFocusIdx(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <div ref={ddRef} className={`ac-dropdown${open ? ' open' : ''}`}>
        {renderOptions()}
      </div>
    </div>
  );
}

interface ResultData {
  score: number;
  d1: number; d2: number; d3: number; d4: number; d5: number; d6: number;
  augVal: number; networkMoat: number;
  industryKey: string;
  workTypeKey: string;
  workTypeLabel: string;
  exp: string;
  countryKey: string;
  countryLabel: string;
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'linear-gradient(90deg, #ff4757, #ff6b6b)';
  if (score >= 65) return 'linear-gradient(90deg, #ff7043, #ffa726)';
  if (score >= 50) return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
  if (score >= 35) return 'linear-gradient(90deg, #00F5FF, #00b4d8)';
  return 'linear-gradient(90deg, #00FF9F, #00cc7d)';
}

function ResultPanel({ data }: { data: ResultData }) {
  const { score, d1, d2, d3, d4, d5, d6, augVal, networkMoat, workTypeKey, workTypeLabel, exp, countryLabel, countryKey, industryKey } = data;
  const [showCalcPanel, setShowCalcPanel] = useState(false);
  const [selectedPivot, setSelectedPivot] = useState<string | null>(null);
  const [pivotResult, setPivotResult] = useState<{ score: number; label: string } | null>(null);
  const color = getScoreColor(score);
  const conf = getConfidence(workTypeKey);
  const dangerList = DANGER_SKILLS[workTypeKey] || DANGER_SKILLS.default;
  const safeList = SAFE_SKILLS[workTypeKey] || SAFE_SKILLS.default;
  const transList = TRANSITION_RECS[workTypeKey] || TRANSITION_RECS.default;

  const expLabel: Record<string, string> = {
    '0-2': '0–2 yrs (Entry)', '2-5': '2–5 yrs', '5-10': '5–10 yrs', '10-20': '10–20 yrs', '20+': '20+ yrs'
  };

  const skillCount = score >= 75 ? 5 : score >= 50 ? 4 : 3;

  const dims = [
    { label: 'D1 · Task Automatability (26%)', val: d1, color: '#ff4757', tooltip: 'What % of tasks AI can do today' },
    { label: 'D2 · AI Tool Maturity (18%)', val: d2, color: '#ff7043', tooltip: 'Production-readiness of role-specific AI tools' },
    { label: 'D3 · Human Amplification (20%)', val: d3, color: '#7C3AFF', tooltip: 'Lower = AI amplifies you, not replaces you' },
    { label: 'D4 · Experience Shield (16%)', val: d4, color: '#00F5FF', tooltip: 'How much seniority protects this role' },
    { label: 'D5 · Country Exposure (9%)', val: d5, color: '#00FF9F', tooltip: 'Net AI exposure: adoption minus regulatory protection' },
    { label: 'D6 · Social Capital Moat (11%)', val: d6, color: '#a78bfa', tooltip: 'Network strength and relationship dependencies (lower = more protected)' },
  ];

  return (
    <div className="result-panel">
      <div className="result-header">
        <div className="result-score-wrap">
          <div className="result-score" style={{ color }}>{score}</div>
          <div>
            <div className="result-score-label">AI Displacement Index</div>
            <div className="result-verdict" style={{ color }}>{getVerdict(score)}</div>
            <div className="result-timeline">Est. displacement timeline: <strong style={{ color }}>{getTimeline(score)}</strong> · Urgency: {getUrgency(score)}</div>
          </div>
        </div>
        <div className="result-conf">
          <div style={{ marginBottom: 4 }}>Confidence</div>
          <div style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>{conf.stars}</div>
          <div style={{ fontSize: '0.68rem', marginTop: 2 }}>{conf.label}</div>
        </div>
      </div>

      <div className="result-gauge">
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', marginBottom: 10 }}>
          {workTypeLabel} · {expLabel[exp] || exp} · {countryLabel}
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${score}%`, background: getScoreGradient(score) }} />
        </div>
        <div className="gauge-labels">
          <span>0 · Safe</span>
          <span>25 · Lower Risk</span>
          <span>50 · Moderate</span>
          <span>75 · High</span>
          <span>100 · Critical</span>
        </div>
        <div className="gauge-zone">
          <div className="gz"><div className="gz-dot" style={{ background: '#00FF9F' }} />AI-Resistant (0–34)</div>
          <div className="gz"><div className="gz-dot" style={{ background: '#00F5FF' }} />Low-Moderate (35–49)</div>
          <div className="gz"><div className="gz-dot" style={{ background: '#fbbf24' }} />Moderate (50–64)</div>
          <div className="gz"><div className="gz-dot" style={{ background: '#ff7043' }} />High (65–79)</div>
          <div className="gz"><div className="gz-dot" style={{ background: '#ff4757' }} />Critical (80–100)</div>
        </div>
      </div>

      <div className="dim-bars">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h4 style={{ margin: 0 }}>Score Breakdown — 6 Dimensions</h4>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--cyan)',
            background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)',
            padding: '3px 10px', borderRadius: 20, cursor: 'default',
          }} title="Data sourced from McKinsey, WEF, Stanford HAI, Goldman Sachs, OECD, MIT — published 2024–2025">Data: 2024–2025 sources</span>
        </div>
        {dims.map(d => (
          <div key={d.label} className="dim-row" title={d.tooltip}>
            <div className="dim-label">{d.label}</div>
            <div className="dim-track">
              <div className="dim-fill" style={{ width: `${d.val}%`, background: d.color }} />
            </div>
            <div className="dim-val" style={{ color: d.color }}>{d.val}</div>
          </div>
        ))}
        <div style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)' }}>
          AI Augmentation Value: <strong style={{ color: augVal > 60 ? 'var(--emerald)' : 'var(--orange)' }}>{augVal}%</strong>
          &nbsp;·&nbsp;Task Automation: <strong style={{ color: d1 > 70 ? 'var(--red)' : d1 > 50 ? 'var(--orange)' : 'var(--cyan)' }}>{getAutomationExp(d1)}</strong>
          &nbsp;·&nbsp;Network Moat: <strong style={{ color: networkMoat < 30 ? 'var(--emerald)' : networkMoat < 60 ? 'var(--cyan)' : 'var(--orange)' }}>{networkMoat < 30 ? 'Strong' : networkMoat < 60 ? 'Moderate' : 'Weak'} ({networkMoat})</strong>
        </div>

        {/* Live data trust panel — DataFreshnessBadge */}
        <div style={{ marginTop: 16 }}>
          <DataFreshnessBadge roleKey={workTypeKey} fallbackScore={score} expanded />
        </div>
      </div>

      {/* UX FIX 5: Collapsible "How was this calculated?" transparency panel */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setShowCalcPanel(p => !p)}
          style={{
            background: 'none', border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: 8, padding: '8px 16px', color: 'var(--text2)',
            cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--mono)',
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            justifyContent: 'space-between',
          }}
          aria-expanded={showCalcPanel}
        >
          <span>How was this score calculated?</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', transition: 'transform 0.2s', transform: showCalcPanel ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>
        {showCalcPanel && (
          <div style={{
            marginTop: 8, padding: '16px 20px',
            background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.12)',
            borderRadius: 8, fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.8,
          }}>
            <div style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)', marginBottom: 10, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              6-Dimension Formula
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text)', marginBottom: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
              rawScore = D1×0.26 + D2×0.18 + D3×0.20 + D4×0.16 + D5×0.09 + D6×0.11
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', marginBottom: 12 }}>
              <div><span style={{ color: '#ff4757' }}>D1={d1}</span> · Task Automatability (Oxford/GPT-4 audit)</div>
              <div><span style={{ color: '#ff7043' }}>D2={d2}</span> · AI Tool Maturity (Stanford HAI 2024)</div>
              <div><span style={{ color: '#7C3AFF' }}>D3={d3}</span> · Human Amplification (BCG 2024, curved inversion)</div>
              <div><span style={{ color: '#00F5FF' }}>D4={d4}</span> · Experience Shield (exp: {exp}yrs)</div>
              <div><span style={{ color: '#00FF9F' }}>D5={d5}</span> · Country Exposure (net: adoption × regulatory discount)</div>
              <div><span style={{ color: '#a78bfa' }}>D6={d6}</span> · Social Capital Moat (MIT Sloan 2024)</div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, fontSize: '0.76rem' }}>
              {/* v3 FIX: Updated boost formula description — interaction term, not average-based */}
              <strong style={{ color: 'var(--text)' }}>v3 Boost:</strong> Interaction term applied only when both D1&gt;70 AND D2&gt;70: <span style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)' }}>boost = (D1−70)×(D2−70)×0.001</span>. Models compounding risk when tasks are highly automatable AND mature AI tools exist.
              &nbsp;·&nbsp;<strong style={{ color: 'var(--text)' }}>D4 floor:</strong> Experience shield only activates for high-risk roles (base&gt;50).
              &nbsp;·&nbsp;<strong style={{ color: 'var(--text)' }}>Final range:</strong> 3–97 (hard clamp).
            </div>
          </div>
        )}
      </div>

      <div className="skill-sections">
        <div className="skill-cols">
          <div className="skill-col">
            <div className="skill-col-header danger">
              <span>⚠</span> At-Risk Tasks (AI Does These Now)
            </div>
            <ul className="skill-list">
              {dangerList.slice(0, skillCount).map((s, i) => (
                <li key={i}><span className="skill-bullet danger">▪</span><span>{s}</span></li>
              ))}
            </ul>
          </div>
          <div className="skill-col">
            <div className="skill-col-header safe">
              <span>✓</span> AI-Resistant Strengths (Protect These)
            </div>
            <ul className="skill-list">
              {safeList.slice(0, skillCount).map((s, i) => (
                <li key={i}><span className="skill-bullet safe">▪</span><span>{s}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* NEW-01: Peer Benchmark Panel — below score breakdown */}
      <PeerBenchmark
        score={score}
        scoreType="job"
        jobTitle={workTypeLabel}
        industry={industryKey}
      />

      {/* Pivot Bridge CTA */}
      {score > 60 && (
        <div style={{ margin: '24px 0', padding: 24, background: 'rgba(0, 255, 159, 0.06)', border: '1px dashed var(--emerald)', borderRadius: 12, textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--emerald)', fontSize: '1.2rem' }}>High Risk Detected: Explore Safe Pivots</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text2)' }}>
            Your score indicates significant AI exposure. Browse our curated database of high-growth, low-risk career transitions matching your profile.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'safe-careers' }))}
            style={{ background: 'var(--emerald)', color: 'var(--bg)', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Find Safe Careers →
          </button>
        </div>
      )}

      <div className="transition-section">
        <h4>→ Recommended Career Pivots</h4>

        {/* NEW-08: Career Pivot Simulator */}
        <div style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--text2)' }}>
          Click any pivot below to simulate your AI risk score in that role.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {transList.slice(0, 3).map((t, i) => {
            const pivotTitle = t.split(' — ')[0];
            const pivotDesc = t.split(' — ').slice(1).join(' — ');
            const targetKey = pivotLabelToWorkKey(t);
            const isSelected = selectedPivot === t;

            const handleSimulate = () => {
              if (isSelected) {
                setSelectedPivot(null);
                setPivotResult(null);
                return;
              }
              setSelectedPivot(t);
              if (targetKey) {
                const { score: pivotScore } = calculateScore(industryKey, targetKey, exp, countryKey, pivotTitle);
                setPivotResult({ score: pivotScore, label: pivotTitle });
              } else {
                setPivotResult(null);
              }
            };

            return (
              <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: isSelected ? '1px solid rgba(0,245,255,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={handleSimulate}
                  style={{
                    width: '100%', background: isSelected ? 'rgba(0,245,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: 'none', padding: '12px 16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                  }}
                >
                  <span style={{ color: 'var(--cyan)', fontSize: '1rem', flexShrink: 0 }}>→</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{pivotTitle}</div>
                    {pivotDesc && <div style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>{pivotDesc}</div>}
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--cyan)', flexShrink: 0, opacity: isSelected ? 1 : 0.6 }}>
                    {isSelected ? '▲ Hide' : targetKey ? '▼ Simulate' : '— No data'}
                  </span>
                </button>

                {isSelected && (
                  <div style={{ padding: '12px 16px', background: 'rgba(0,245,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {pivotResult ? (
                      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text2)', marginBottom: 4 }}>CURRENT · {workTypeLabel}</div>
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(score) }}>{score}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{getVerdict(score)}</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--text2)' }}>→</div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text2)', marginBottom: 4 }}>TARGET · {pivotResult.label}</div>
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(pivotResult.score) }}>{pivotResult.score}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{getVerdict(pivotResult.score)}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 140 }}>
                          {pivotResult.score < score ? (
                            <div style={{ color: 'var(--emerald)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                              <strong>↓ {score - pivotResult.score} point improvement</strong> in AI resilience. This pivot reduces your displacement risk{score - pivotResult.score > 20 ? ' significantly' : ''}.
                            </div>
                          ) : pivotResult.score > score ? (
                            <div style={{ color: 'var(--orange)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                              <strong>↑ {pivotResult.score - score} point increase</strong> in risk. This pivot may expose you to more automation pressure — weigh the trade-offs.
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>Similar risk profile. Your resilience transfers well to this role.</div>
                          )}
                          <div style={{ marginTop: 6, fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text2)' }}>
                            Same country · Same experience · Same industry
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>
                        Score estimate not available for this pivot — insufficient role data. Use the calculator above to manually evaluate this role.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="result-disclaimer">
        <strong style={{ color: 'var(--cyan)' }}>Note:</strong> This score is an evidence-based estimate, not a certainty. AI displacement is probabilistic and depends on factors including individual skill depth, organisational adoption pace, and regulatory environment. Sources: McKinsey Global Institute 2024–2025, Goldman Sachs AI Labour Market Report Q3 2024, WEF Future of Jobs Report 2025, OECD Employment Outlook 2024, BCG AI at Work 2024, Stanford HAI AI Index 2024, MIT Work of the Future 2024–2025, Anthropic Economic Index 2025. Scores are calibrated against published occupational task analyses and updated quarterly.
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  const { dispatch } = useHumanProof();
  const [industryKey, setIndustryKey] = useState('');
  const [industryLabel, setIndustryLabel] = useState('');
  const [workTypeKey, setWorkTypeKey] = useState('');
  const [workTypeLabel, setWorkTypeLabel] = useState('');
  const [countryKey, setCountryKey] = useState('');
  const [countryLabel, setCountryLabel] = useState('');
  const [exp, setExp] = useState('5-10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const expOptions = [
    { key: '0-2', label: '0–2 yrs' },
    { key: '2-5', label: '2–5 yrs' },
    { key: '5-10', label: '5–10 yrs' },
    { key: '10-20', label: '10–20 yrs' },
    { key: '20+', label: '20+ yrs' },
  ];

  const canCalculate = industryKey && workTypeKey && countryKey && exp;

  const handleCalculate = () => {
    if (!canCalculate) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const { score, d1, d2, d3, d4, d5, d6, augVal, networkMoat } = calculateScore(industryKey, workTypeKey, exp, countryKey, workTypeLabel);
      setResult({ score, d1, d2, d3, d4, d5, d6, augVal, networkMoat, industryKey, workTypeKey, workTypeLabel, exp, countryKey, countryLabel });
      dispatch({ type: 'SET_JOB_RISK', score, title: workTypeLabel, industry: industryLabel });
      setLoading(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }, 900);
  };

  return (
    <div className="calc-page">
      <div className="calc-hero">
        <div className="hero-geo" style={{ position: 'absolute', inset: 0 }}>
          <div className="orb orb-2" style={{ opacity: 0.5 }} />
        </div>
        <h1>AI Displacement Calculator</h1>
        <p>250+ job types · 70+ countries · 6-dimension model · Q1 2026 data</p>
      </div>
      <div className="calc-wrapper">
        <div className="calc-card">
          <div className="calc-grid">
            <div className="calc-field">
              <label className="calc-label">Industry / Sector</label>
              <ACField
                type="industry"
                placeholder="Search industry (e.g. Software, Finance…)"
                onSelect={(key, label) => {
                  setIndustryKey(key);
                  setIndustryLabel(label);
                  setWorkTypeKey('');
                  setWorkTypeLabel('');
                }}
                value={industryLabel}
              />
            </div>
            <div className="calc-field">
              <label className="calc-label">Work Type / Role</label>
              <ACField
                type="worktype"
                placeholder="Search role (e.g. Backend Dev…)"
                selectedIndustryKey={industryKey}
                onSelect={(key, label) => { setWorkTypeKey(key); setWorkTypeLabel(label); }}
                value={workTypeLabel}
              />
            </div>
            <div className="calc-field">
              <label className="calc-label">Country / Location</label>
              <ACField
                type="country"
                placeholder="Search country (e.g. India, USA…)"
                onSelect={(key, label) => { setCountryKey(key); setCountryLabel(label); }}
                value={countryLabel}
              />
            </div>
            <div className="calc-field">
              <label className="calc-label">Years of Experience</label>
              <div className="exp-band">
                {expOptions.map(o => (
                  <button
                    key={o.key}
                    className={`exp-btn${exp === o.key ? ' selected' : ''}`}
                    onClick={() => setExp(o.key)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            className="calc-btn"
            onClick={handleCalculate}
            disabled={!canCalculate || loading}
          >
            {loading ? 'Analysing...' : '→ Calculate My AI Risk Score'}
          </button>
        </div>

        {loading && (
          <div className="calc-loading">
            <div className="loading-text">Analysing 6 dimensions across 2026 data...</div>
            <div className="loading-bar"><div className="loading-bar-fill" /></div>
          </div>
        )}

        {result && !loading && (
          <div ref={resultRef}>
            <ResultPanel data={result} />
          </div>
        )}
      </div>
    </div>
  );
}
