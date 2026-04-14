// ═══════════════════════════════════════════════════════════════════════════════
// StrategicRoadmap.tsx — Career Transformation Roadmap Visualization
// Shows: experience-specific phased roadmap with actionable steps,
// career pivot paths with risk-reduction metrics, and timeline visualization.
// ═══════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { CareerIntelligence, ExperienceRoadmap } from '../data/intelligence/types.ts';
import {
  ArrowRight, Target, TrendingUp, Clock, Layers, ChevronRight,
  CheckCircle2, Sparkles, AlertCircle, BarChart2, Flame
} from 'lucide-react';

interface Props {
  intel: CareerIntelligence;
  experience: string;  // '0-2' | '2-5' | '5-10' | '10-20' | '20+'
  scoreColor: string;
  score: number;
}

// ── Experience level metadata ─────────────────────────────────────────────────
const EXP_META: Record<string, { label: string; persona: string; urgencyMod: string }> = {
  '0-2':   { label: 'Entry Level',     persona: 'You have the most time advantage — but also the most skill debt.',     urgencyMod: 'Your career is still being shaped. Pivoting now costs almost nothing.' },
  '2-5':   { label: 'Early Career',    persona: 'You have enough experience to pivot with your existing foundation.',    urgencyMod: 'This is the ideal pivot window — skills are real, identity is still flexible.' },
  '5-10':  { label: 'Mid-Level',       persona: 'You have deep skills worth protecting and augmenting — not abandoning.', urgencyMod: '12–18 months to decisively shift direction before the market prices you out.' },
  '10-20': { label: 'Senior',          persona: 'Your authority and network are your primary assets. Protect and lever them.', urgencyMod: 'Senior roles are shrinking in your function. Act on transformation strategy now.' },
  '20+':   { label: 'Principal/Lead',  persona: 'Your irreplaceable value is in judgment and institutional memory.',      urgencyMod: 'The window for executive repositioning is measured in months, not years.' },
};

// ── Find the best available roadmap for a given experience key ────────────────
const FALLBACK_ORDER: string[] = ['5-10', '2-5', '10-20', '0-2', '20+'];
const findBestRoadmap = (intel: CareerIntelligence, expKey: string): ExperienceRoadmap | null => {
  if (!intel.roadmap) return null;
  if (intel.roadmap[expKey as keyof typeof intel.roadmap]) return intel.roadmap[expKey as keyof typeof intel.roadmap]!;
  // Fallback: nearest available
  const order = [expKey, ...FALLBACK_ORDER.filter(k => k !== expKey)];
  for (const k of order) {
    if (intel.roadmap[k as keyof typeof intel.roadmap]) return intel.roadmap[k as keyof typeof intel.roadmap]!;
  }
  return null;
};

// ── Pivot Card ────────────────────────────────────────────────────────────────
const PivotCard = ({
  path, rank, scoreColor,
}: {
  path: CareerIntelligence['careerPaths'][0];
  rank: number;
  scoreColor: string;
}) => {
  const [expanded, setExpanded] = useState(rank === 0);

  const diffColor = (d: string) =>
    d === 'Very Hard' ? '#ef4444' :
    d === 'Hard' ? '#f59e0b' :
    d === 'Medium' ? '#3b82f6' : '#10b981';

  const salaryIsPositive = path.salaryDelta.startsWith('+');

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: rank === 0 ? `linear-gradient(135deg, ${scoreColor}08, ${scoreColor}04)` : 'rgba(255,255,255,0.025)',
        border: rank === 0 ? `1px solid ${scoreColor}30` : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: 10,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {rank === 0 && (
        <div style={{
          position: 'absolute', top: 10, right: 12,
          background: `${scoreColor}20`, color: scoreColor,
          borderRadius: 6, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em',
        }}>BEST FIT</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Rank badge */}
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: rank === 0 ? scoreColor : 'rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 900,
          color: rank === 0 ? '#fff' : 'var(--text-3)',
        }}>
          {rank + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h5 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem',
            letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 6px',
          }}>{path.role}</h5>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: expanded ? 14 : 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(16,185,129,0.12)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.25)', borderRadius: 6,
              padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
            }}>
              <TrendingUp size={9} /> -{path.riskReduction}% risk
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: salaryIsPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: salaryIsPositive ? '#10b981' : '#ef4444',
              borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700,
              border: `1px solid ${salaryIsPositive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              💰 {path.salaryDelta}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)',
              borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Clock size={9} /> {path.timeToTransition}
            </span>
            <span style={{
              background: `${diffColor(path.transitionDifficulty)}15`,
              color: diffColor(path.transitionDifficulty),
              borderRadius: 6, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800,
              border: `1px solid ${diffColor(path.transitionDifficulty)}25`,
            }}>{path.transitionDifficulty?.toUpperCase()}</span>
          </div>

          {expanded && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skill Gap to Close</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{path.skillGap}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Industries</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {path.industryMapping.map(ind => (
                    <span key={ind} style={{
                      background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)',
                      borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>{ind}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <ChevronRight
          size={14}
          color="var(--text-3)"
          style={{ flexShrink: 0, marginTop: 4, transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        />
      </div>
    </div>
  );
};

// ── Phase Card ────────────────────────────────────────────────────────────────
const PhaseCard = ({
  phase, phaseNum, isActive, scoreColor,
}: {
  phase: NonNullable<ExperienceRoadmap['phase_1']>;
  phaseNum: number;
  isActive: boolean;
  scoreColor: string;
}) => {
  const phaseColors = ['#3b82f6', '#8b5cf6', '#10b981'];
  const color = phaseColors[phaseNum - 1] ?? scoreColor;

  return (
    <div style={{
      position: 'relative',
      paddingLeft: 28,
      paddingBottom: phaseNum < 3 ? 24 : 0,
    }}>
      {/* Timeline line */}
      {phaseNum < 3 && (
        <div style={{
          position: 'absolute', left: 11, top: 32, bottom: 0,
          width: 2, background: `linear-gradient(to bottom, ${color}40, transparent)`,
        }} />
      )}

      {/* Phase dot */}
      <div style={{
        position: 'absolute', left: 0, top: 8,
        width: 22, height: 22, borderRadius: '50%',
        background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.65rem', fontWeight: 900, color: '#fff',
        boxShadow: `0 0 12px ${color}50`,
      }}>{phaseNum}</div>

      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 12,
        border: `1px solid ${color}25`,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color, letterSpacing: '-0.02em' }}>
              {phase.focus}
            </span>
            <span style={{
              marginLeft: 10, background: `${color}15`, color,
              borderRadius: 6, padding: '1px 8px', fontSize: '0.65rem', fontWeight: 700,
            }}>
              ⏱ {phase.timeline}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {phase.actions.map((action, i) => (
            <div key={i} style={{
              background: `${color}08`, borderRadius: 8,
              padding: '10px 12px', borderLeft: `3px solid ${color}40`,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, background: `${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CheckCircle2 size={11} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1.4 }}>
                    {action.action}
                  </p>
                  {action.why && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                      <span style={{ color, fontWeight: 700 }}>Why: </span>{action.why}
                    </p>
                  )}
                  {action.outcome && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <Sparkles size={10} color={color} />
                      <span style={{ fontSize: '0.7rem', color, fontWeight: 700 }}>{action.outcome}</span>
                    </div>
                  )}
                  {action.tool && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
                        borderRadius: 4, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700,
                        fontFamily: 'var(--font-mono, monospace)',
                      }}>🔧 {action.tool}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const StrategicRoadmap = ({ intel, experience, scoreColor, score }: Props) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'pivots'>('roadmap');
  const expMeta = EXP_META[experience] ?? EXP_META['5-10'];
  const roadmap = findBestRoadmap(intel, experience);
  const careerPaths = intel.careerPaths ?? [];

  const phases = roadmap
    ? [roadmap.phase_1, roadmap.phase_2, roadmap.phase_3].filter(Boolean)
    : [];

  const urgencyColor = score >= 70 ? '#ef4444' : score >= 45 ? '#f59e0b' : '#10b981';

  return (
    <div>
      {/* Title Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem',
            letterSpacing: '-0.03em', color: 'var(--text)', margin: 0,
          }}>Strategic Transformation Roadmap</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-3)' }}>
            {expMeta.label} · {expMeta.persona}
          </p>
        </div>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: 10, padding: 3, border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {[
            { key: 'roadmap' as const, label: '📋 Roadmap', icon: <Layers size={12} /> },
            { key: 'pivots' as const, label: `🔀 Pivots (${careerPaths.length})`, icon: <ArrowRight size={12} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeTab === tab.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text)' : 'var(--text-3)',
                fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency Banner */}
      {score >= 45 && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          background: `${urgencyColor}08`, border: `1px solid ${urgencyColor}25`,
          borderRadius: 10, padding: '12px 14px', marginBottom: 20,
        }}>
          <Flame size={14} color={urgencyColor} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            <strong style={{ color: urgencyColor }}>Transition Intelligence:</strong>{' '}
            {expMeta.urgencyMod}
          </p>
        </div>
      )}

      {/* Tab: Roadmap */}
      {activeTab === 'roadmap' && (
        <div>
          {phases.length > 0 ? (
            <div>
              {phases.map((phase, i) => phase && (
                <PhaseCard
                  key={i}
                  phase={phase}
                  phaseNum={i + 1}
                  isActive={i === 0}
                  scoreColor={scoreColor}
                />
              ))}
            </div>
          ) : (
            /* Generative fallback when no data for experience level */
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)', padding: 24,
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                <AlertCircle size={16} color={scoreColor} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)', fontWeight: 700 }}>
                    Universal Transformation Protocol — {expMeta.label}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    Applied when no role-specific roadmap is available for your experience band
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  {
                    step: 'AI Skill Audit (Week 1)',
                    desc: 'List every task you perform. Mark each as: Automatable, Augmented, or Human-only. This is your personal risk map.',
                    color: '#3b82f6',
                  },
                  {
                    step: 'Build One AI-Native Skill (Month 1-2)',
                    desc: 'Pick the single AI tool most relevant to your domain. Commit 30 mins/day until you are measurably in the top 10% of your team in that specific tool.',
                    color: '#8b5cf6',
                  },
                  {
                    step: 'Pivot Positioning (Month 3-6)',
                    desc: `Identify which of the ${careerPaths.length} pivot paths fits your existing strengths and network. Begin making 3 connections per week in that direction.`,
                    color: '#10b981',
                  },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, background: `${item.color}08`,
                    borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${item.color}40`,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 8,
                      background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '0.75rem', fontWeight: 900, color: item.color,
                    }}>{i + 1}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', color: item.color }}>{item.step}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Career Pivots */}
      {activeTab === 'pivots' && (
        <div>
          {careerPaths.length > 0 ? (
            <div>
              <div style={{
                display: 'flex', gap: 12, marginBottom: 16,
                padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
                flexWrap: 'wrap',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: scoreColor }}>{careerPaths.length}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pivot Paths</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>-{Math.max(...careerPaths.map(p => p.riskReduction))}%</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Risk Drop</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b' }}>{careerPaths[0]?.salaryDelta}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Salary △</div>
                </div>
              </div>
              {careerPaths.map((path, i) => (
                <PivotCard key={path.role} path={path} rank={i} scoreColor={scoreColor} />
              ))}
            </div>
          ) : (
            <div style={{
              padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
              textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem',
            }}>
              Career pivot data not yet available for this role.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StrategicRoadmap;
