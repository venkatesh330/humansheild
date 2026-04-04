import { useState, useMemo, useEffect, useRef } from 'react';
import PeerBenchmark from './PeerBenchmark';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts';
import { skillsDataNew, Skill } from '../data/skillsDataNew';
import { getRiskLabel } from '../utils/riskCalculations';
import { useHumanProof } from '../context/HumanProofContext';
import { SKILL_INSIGHTS_2026, SkillInsight } from '../data/skillInsights';
import { RESEARCH_SOURCES_2026 } from '../data/sources2026';
import { projectSkillRisk, getProjectionGuidance, aggregatePortfolioRisk } from '../utils/riskProjection';

const MAX_SKILLS = 50;

const INDUSTRY_MULT: Record<string, number> = {
  'Finance': 1.35, 'Accounting': 1.40, 'Legal': 1.20, 'Technology': 1.15,
  'Analytics': 1.25, 'Marketing': 1.20, 'Creative': 1.30, 'Education': 0.75,
  'Healthcare': 0.70, 'People Ops': 1.10, 'Sales': 1.05,
};

const HUMAN_KEYWORDS = [
  'empathy', 'relationship', 'trust', 'leadership', 'judgment', 'ethics',
  'counsel', 'mentor', 'coach', 'presence', 'culture', 'crisis', 'community',
  'facilitat', 'negotiat', 'creativit', 'vision', 'compassion', 'intuition',
  'persuasion', 'listen', 'collaborat', 'diplomat', 'inspir', 'storytell',
  'conflict', 'wellbeing', 'emotional', 'spiritual', 'grief', 'motivat',
];
const TECH_KEYWORDS = [
  'code', 'script', 'automate', 'generate', 'report', 'analys', 'analyze',
  'data', 'document', 'draft', 'write', 'research', 'review', 'model',
  'test', 'audit', 'transcri', 'translat', 'classif', 'predict', 'detect',
  'index', 'extract', 'process', 'entry', 'log', 'monitor', 'schedule',
];

// Section 2.2 — Improved custom skill scoring with three-layer approach
function scoreCustomSkill(skillName: string, industry?: string | null): number {
  const name = skillName.toLowerCase();

  // Layer 1: Protective skills that contain tech-sounding keywords but are NOT automatable
  const PROTECTIVE_DESPITE_TECH = [
    'ai ethics', 'ai governance', 'ai audit', 'machine learning ethics',
    'algorithm bias', 'responsible ai', 'ai policy', 'tech regulation',
    'data privacy', 'cybersecurity strategy', 'digital transformation leadership',
    'prompt engineering oversight', 'ai risk management', 'ai safety',
    'responsible technology', 'algorithmic fairness',
  ];
  if (PROTECTIVE_DESPITE_TECH.some(p => name.includes(p))) {
    return Math.round(8 + Math.random() * 7);
  }

  // Layer 2: Skills that sound human but are actually highly automatable
  const AUTOMATABLE_DESPITE_HUMAN_SOUND = [
    'data entry', 'form filling', 'scheduling', 'appointment booking',
    'invoice processing', 'expense reporting', 'basic bookkeeping',
    'file organization', 'file organisation', 'meeting notes', 'email sorting',
    'data migration', 'report generation', 'transcript creation',
    'basic translation', 'content moderation', 'cv screening', 'resume screening',
  ];
  if (AUTOMATABLE_DESPITE_HUMAN_SOUND.some(p => name.includes(p))) {
    return Math.round(82 + Math.random() * 10);
  }

  // Layer 3: Keyword-based scoring with improved weights
  const humanHits = HUMAN_KEYWORDS.filter(k => name.includes(k)).length;
  const techHits = TECH_KEYWORDS.filter(k => name.includes(k)).length;
  const total = humanHits + techHits;
  // Use 10-82 base range (not 10-86) to avoid overestimating pure tech skill risk
  let base = total === 0
    ? 50
    : Math.round((techHits / total) * 82 + (humanHits / total) * 10);

  // Layer 4: Industry context modifier
  const INDUSTRY_RISK_MODIFIERS: Record<string, number> = {
    'Finance': 1.12, 'Accounting': 1.15, 'Legal': 1.10, 'Marketing': 1.08,
    'Healthcare': 0.82, 'Mental Health': 0.72, 'Education': 0.88,
    'Social Work': 0.70, 'Architecture': 0.85, 'People Ops': 0.95,
  };
  const mult = industry ? (INDUSTRY_RISK_MODIFIERS[industry] || INDUSTRY_MULT[industry] || 1.0) : 1.0;
  return Math.min(92, Math.max(8, Math.round(base * mult)));
}

// Section 2.3 — Industry-aware AI tools filtering
const TOOL_INDUSTRY_EXCLUSIONS: Record<string, string[]> = {
  'Healthcare': ['Midjourney', 'DALL-E', 'Jasper', 'Copy.ai', 'Gamma', 'RunwayML', 'Sora', 'ElevenLabs'],
  'Legal': ['Midjourney', 'DALL-E', 'Stable Diffusion', 'RunwayML', 'Sora', 'Jasper'],
  'Education': ['RunwayML', 'Sora', 'ElevenLabs', 'Jasper', 'Copy.ai'],
  'Social Work': ['Midjourney', 'DALL-E', 'Jasper', 'RunwayML', 'Sora', 'Copy.ai'],
  'Mental Health': ['Midjourney', 'DALL-E', 'Jasper', 'Copy.ai', 'RunwayML', 'Sora'],
};

function getRelevantAITools(insight: SkillInsight, industry: string | null): string[] {
  const allTools = insight.aiTools || [];
  if (!industry || !TOOL_INDUSTRY_EXCLUSIONS[industry]) return allTools;
  const excluded = TOOL_INDUSTRY_EXCLUSIONS[industry];
  const filtered = allTools.filter(tool => !excluded.includes(tool));
  return filtered.length > 0 ? filtered : allTools.slice(0, 2);
}

function getSkillInsight(skill: Skill): SkillInsight {
  const explicit = SKILL_INSIGHTS_2026[skill.name];
  if (explicit) return explicit;
  if (skill.riskScore < 30) {
    return {
      why_protected: `${skill.name} requires human judgment, trust, or embodied experience that AI cannot reliably replicate.`,
      action: `Document measurable outcomes where your ${skill.name.toLowerCase()} created irreplaceable value.`,
    };
  } else if (skill.riskScore >= 70) {
    return {
      threat: `AI tooling is automating core ${skill.name.toLowerCase()} workflows. Score ${skill.riskScore} places this in the high-displacement zone.`,
      pivot: `Identify the highest-complexity applications of ${skill.name.toLowerCase()} that require uniquely human judgment and reposition there.`,
    };
  }
  return {
    threat: `${skill.name} sits in a mid-range risk zone — parts are automatable, others are not.`,
    action: `Focus on the most judgment-intensive applications of ${skill.name.toLowerCase()} and document your edge.`,
  };
}

const LS_KEY = 'hp_skill_selections';

interface WeightedSkill extends Skill {
  weight: 0.5 | 1 | 2;
  // Section 2.5 — trend delta from pre-2026 baseline
  trendDelta?: number;
}

// Section 2.5 — Trend delta computation
function getTrendArrow(delta?: number): { arrow: string; color: string; label: string } | null {
  if (delta === undefined) return null;
  if (delta > 5) return { arrow: '↑', color: 'var(--red)', label: `+${delta} since 2025` };
  if (delta < -5) return { arrow: '↓', color: 'var(--emerald)', label: `${delta} since 2025` };
  return { arrow: '→', color: 'var(--text2)', label: 'Stable since 2025' };
}

export default function SkillRiskCalculator({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { state, dispatch } = useHumanProof();
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<WeightedSkill[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<1 | 3 | 5>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [dropdownOpen]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WeightedSkill[];
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedSkills(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(selectedSkills));
    } catch {}
  }, [selectedSkills]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const selectedIds = new Set(selectedSkills.map(s => s.id));
    return q
      ? skillsDataNew.filter(s => !selectedIds.has(s.id) && (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)))
      : skillsDataNew.filter(s => !selectedIds.has(s.id));
  }, [search, selectedSkills]);

  const addSkill = (skill: Skill) => {
    if (selectedSkills.length >= MAX_SKILLS) return;
    setSelectedSkills(prev => [...prev, { ...skill, weight: 1 }]);
    setSearch('');
    setDropdownOpen(false); // Close dropdown after selection
  };

  const removeSkill = (id: number) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== id));
    if (showResults) setShowResults(false);
  };

  const setWeight = (id: number, weight: 0.5 | 1 | 2) => {
    setSelectedSkills(prev => prev.map(s => s.id === id ? { ...s, weight } : s));
  };

  const addCustomSkill = () => {
    if (!customSkill.trim() || selectedSkills.length >= MAX_SKILLS) return;
    const riskScore = scoreCustomSkill(customSkill, state.industry);
    const newSkill: WeightedSkill = {
      id: Date.now(),
      name: customSkill.trim(),
      category: 'Custom',
      riskScore,
      trend: 'rising',
      weight: 1,
    };
    setSelectedSkills(prev => [...prev, newSkill]);
    setCustomSkill('');
  };

  const hasCustomWeights = selectedSkills.some(s => s.weight !== 1);

  const weightedScore = selectedSkills.length > 0
    ? Math.round(
        selectedSkills.reduce((sum, s) => sum + s.riskScore * s.weight, 0) /
        selectedSkills.reduce((sum, s) => sum + s.weight, 0)
      )
    : 0;

  const sorted = [...selectedSkills].sort((a, b) => a.riskScore - b.riskScore);
  const safestTake = Math.min(3, Math.max(1, Math.floor(sorted.length / 2)));
  const safest = sorted.slice(0, safestTake);
  const safestIds = new Set(safest.map(s => s.id));
  const riskiest = [...sorted].reverse().slice(0, 3).filter(s => !safestIds.has(s.id));

  const radarData = selectedSkills.map(s => ({
    skill: s.name.length > 14 ? s.name.slice(0, 13) + '…' : s.name,
    score: s.riskScore,
  }));

  const barData = selectedSkills.map(s => ({
    name: s.name.length > 20 ? s.name.slice(0, 19) + '…' : s.name,
    score: s.riskScore,
    color: getRiskLabel(s.riskScore).cssVar,
  }));

  const handleCalculate = () => {
    if (selectedSkills.length === 0) return;
    setShowResults(true);
    dispatch({ type: 'SET_SKILL_RISK', score: weightedScore, skills: selectedSkills, breakdown: selectedSkills });
  };

  const riskInfo = getRiskLabel(weightedScore);

  const weightBtn = (id: number, w: 0.5 | 1 | 2, label: string, current: 0.5 | 1 | 2) => (
    <button
      key={w}
      onClick={() => setWeight(id, w)}
      style={{
        background: current === w ? 'rgba(0,245,255,0.15)' : 'transparent',
        border: `1px solid ${current === w ? 'var(--cyan)' : 'var(--border)'}`,
        color: current === w ? 'var(--cyan)' : 'var(--text2)',
        borderRadius: 4, padding: '2px 8px',
        fontFamily: 'var(--mono)', fontSize: '0.65rem', cursor: 'pointer', transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: '40px 0', maxWidth: 900, margin: '0 auto' }}>
      <div className="reveal" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 32, background: 'var(--cyan)', borderRadius: 2 }} />
          <h2 style={{ fontFamily: 'var(--mono)', fontSize: '1.5rem', color: 'var(--cyan)' }}>
            Skill Risk Calculator
          </h2>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginLeft: 16 }}>
          Search from <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>228 verified skills</span> & add up to {MAX_SKILLS} to your portfolio for risk analysis.
        </p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <label style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Search Skills
          </label>
          <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontFamily: 'var(--mono)' }}>
            228 available • {selectedSkills.length}/{MAX_SKILLS} selected
          </div>
        </div>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Search 228 skills by name or category…"
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.9rem', outline: 'none' }}
          />
          {dropdownOpen && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#111128', border: '1px solid var(--border2)', borderRadius: 8, maxHeight: 280, overflowY: 'auto', marginTop: 4 }} onClick={() => setDropdownOpen(false)}>
              {filtered.map(skill => {
                const { label, cssVar } = getRiskLabel(skill.riskScore);
                // Section 2.5 — show trend arrow in dropdown
                const trend = getTrendArrow((skill as any).trendDelta);
                return (
                  <div
                    key={skill.id}
                    onClick={() => addSkill(skill)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ color: 'var(--text)', fontSize: '0.875rem' }}>{skill.name}</div>
                      <div style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>{skill.category}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {trend && (
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: trend.color }} title={trend.label}>
                          {trend.arrow}
                        </span>
                      )}
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: cssVar }}>{skill.riskScore}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, border: `1px solid ${cssVar}`, color: cssVar }}>{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input
            type="text"
            value={customSkill}
            onChange={e => setCustomSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
            placeholder="Or type a custom skill…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.875rem', outline: 'none' }}
          />
          <button onClick={addCustomSkill} style={{ background: 'transparent', border: '1px solid var(--cyan)', color: 'var(--cyan)', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Add
          </button>
        </div>
        {customSkill && (
          <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text2)' }}>
            Estimated score: <span style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)' }}>{scoreCustomSkill(customSkill, state.industry)}</span>
            {' '}— based on 2026 keyword + industry analysis
          </div>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
          {selectedSkills.map(skill => {
            const { label, cssVar } = getRiskLabel(skill.riskScore);
            const trend = getTrendArrow(skill.trendDelta);
            return (
              <div key={skill.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cssVar}30`, borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ color: 'var(--text)', fontSize: '0.875rem', fontWeight: 500 }}>{skill.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '1rem', color: cssVar, fontWeight: 700 }}>{skill.riskScore}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: `${cssVar}15`, color: cssVar }}>{label}</span>
                      {/* Section 2.5 — trend arrow on selected skill card */}
                      {trend && (
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: trend.color }} title={trend.label}>{trend.arrow} {trend.label}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeSkill(skill.id)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1.1rem', padding: 4 }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text2)', marginRight: 4 }}>Weight:</span>
                  {([0.5, 1, 2] as const).map(w => weightBtn(skill.id, w, w === 0.5 ? '½×' : w === 1 ? '1×' : '2×', skill.weight))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSkills.length > 0 && !showResults && (
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <button
            onClick={handleCalculate}
            style={{ background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '12px 32px', fontFamily: 'var(--mono)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Analyse My Skill Profile →
          </button>
        </div>
      )}

      {showResults && selectedSkills.length > 0 && (
        <div className="reveal">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, marginBottom: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              {hasCustomWeights ? 'Weighted' : 'Average'} Skill Risk Score (2026)
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '4rem', fontWeight: 700, color: riskInfo.cssVar, lineHeight: 1 }}>{weightedScore}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
              <div style={{ fontSize: '0.85rem', padding: '4px 16px', borderRadius: 20, border: `1px solid ${riskInfo.cssVar}`, color: riskInfo.cssVar }}>{riskInfo.label}</div>
              {hasCustomWeights && (
                <div style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: 12, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--cyan)' }}>
                  Weighted analysis
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Future Year Projections</div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[1, 3, 5].map(year => {
                  const proj = aggregatePortfolioRisk(selectedSkills, year as 1 | 3 | 5);
                  const projInfo = getRiskLabel(proj);
                  return (
                    <button
                      key={year}
                      onClick={() => setSelectedTimeframe(year as 1 | 3 | 5)}
                      style={{
                        background: selectedTimeframe === year ? `${projInfo.cssVar}20` : 'transparent',
                        border: `1px solid ${selectedTimeframe === year ? projInfo.cssVar : 'var(--border2)'}`,
                        borderRadius: 8,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '1.2rem', fontWeight: 700, color: projInfo.cssVar }}>{proj}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text2)', marginTop: 4 }}>Year {2026 + year}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text2)', fontStyle: 'italic' }}>
                {getProjectionGuidance(weightedScore, aggregatePortfolioRisk(selectedSkills, 5), selectedSkills.length > 0 ? (selectedSkills.some(s => s.trend === 'rising') ? 'rising' : 'stable') : 'stable')}
              </div>
            </div>
          </div>

          {/* NEW-01: Peer Benchmark for Skill Risk */}
          <PeerBenchmark
            score={weightedScore}
            scoreType="skill"
            jobTitle={state.jobTitle}
            industry={state.industry}
          />

          {/* v3 FIX: show radar at 4+ skills (triangle at 3 looks odd); bar chart for ≤3 */}
          {selectedSkills.length >= 4 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Skill Risk Radar</div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0,245,255,0.12)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text2)', fontSize: 11 }} />
                  <Radar name="Risk Score" dataKey="score" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ background: '#111128', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Skill Risk Breakdown</div>
              <ResponsiveContainer width="100%" height={Math.max(80, selectedSkills.length * 52)}>
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text2)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fill: 'var(--text2)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} />
                  <Tooltip contentStyle={{ background: '#111128', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} formatter={(val: any) => [`${val} risk score`, 'AI Risk']} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'rgba(0,255,159,0.05)', border: '1px solid rgba(0,255,159,0.2)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>✓ Your Safest Skills</div>
              {safest.map(s => {
                const insight = getSkillInsight(s);
                return (
                  <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--emerald)', fontWeight: 700 }}>{s.riskScore}</span>
                    </div>
                    {insight.why_protected && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>{insight.why_protected}</div>}
                    {insight.action && <div style={{ fontSize: '0.72rem', color: 'var(--cyan)', marginTop: 4 }}>→ {insight.action}</div>}
                    {insight.source && <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Source: {insight.source}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ background: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>⚠ Highest Risk Skills</div>
              {riskiest.map(s => {
                const insight = getSkillInsight(s);
                // Section 2.3 — filter aiTools by industry
                const relevantTools = getRelevantAITools(insight, state.industry);
                return (
                  <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Section 2.5 — trend arrow on results */}
                        {s.trendDelta && s.trendDelta > 5 && (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--red)' }} title={`+${s.trendDelta} risk increase since 2025`}>↑</span>
                        )}
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--red)', fontWeight: 700 }}>{s.riskScore}</span>
                      </div>
                    </div>
                    {insight.threat && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>{insight.threat}</div>}
                    {relevantTools.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                        {relevantTools.map(tool => (
                          <span key={tool} style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: 'var(--text2)', border: '1px solid rgba(255,255,255,0.12)' }}>{tool}</span>
                        ))}
                      </div>
                    )}
                    {insight.pivot && <div style={{ fontSize: '0.72rem', color: 'var(--cyan)', marginTop: 4 }}>→ {insight.pivot}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowSources(v => !v)}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 6, padding: '6px 14px', fontFamily: 'var(--mono)', fontSize: '0.7rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {showSources ? '▲ Hide' : '▼ Show'} 2026 Research Sources
            </button>
            {showSources && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RESEARCH_SOURCES_2026.map((src, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 500 }}>{src.name}</a>
                    <div style={{ color: 'var(--text2)', fontSize: '0.75rem', marginTop: 4 }}>{src.key_finding}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate?.('roadmap')}
              style={{ flex: 1, minWidth: 180, background: 'var(--cyan)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '12px 20px', fontFamily: 'var(--mono)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              See Upskilling Roadmap →
            </button>
            <button
              onClick={() => onNavigate?.('progress')}
              style={{ flex: 1, minWidth: 180, background: 'transparent', border: '1px solid var(--violet)', color: 'var(--violet-light)', borderRadius: 8, padding: '12px 20px', fontFamily: 'var(--mono)', fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              Share My Profile →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
