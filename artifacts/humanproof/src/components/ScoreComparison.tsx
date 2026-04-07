<<<<<<< HEAD
// ════════════════════════════════════════════════════════════════
// ScoreComparison.tsx — A vs B role comparison panel
// NEW FEATURE: Compare 2 roles side-by-side with full dimension breakdown
// ════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { calculateScore, getConfidence } from '../data/riskFormula';
import { TASK_AUTO } from '../data/riskData';

interface RoleInput {
  industryKey: string;
  workType: string;
  experience: string;
  countryKey: string;
  workTypeLabel: string;
}

interface ScoreResult {
  score: number;
  d1: number; d2: number; d3: number; d4: number; d5: number; d6: number;
  label: string;
  color: string;
  confidence: { band: number; label: string; stars: string };
}

const DIMENSION_LABELS = ['D1 Task Risk', 'D2 AI Tools', 'D3 Augmentation', 'D4 Experience', 'D5 Country', 'D6 Network'];
const DIMENSION_COLORS = ['#ff4757', '#ff7f50', '#00F5FF', '#4CD964', '#7c3aff', '#fbbf24'];

function getRiskColor(score: number) {
  if (score >= 80) return '#ff4757';
  if (score >= 65) return '#ff7f50';
  if (score >= 40) return '#fbbf24';
  if (score >= 25) return '#00F5FF';
  return '#00FF9F';
}

function getRiskLabel(score: number) {
  if (score >= 80) return 'Critical Risk';
  if (score >= 65) return 'High Risk';
  if (score >= 40) return 'Moderate Risk';
  if (score >= 25) return 'Low Risk';
  return 'AI-Resistant';
}

function calcFull(role: RoleInput): ScoreResult | null {
  if (!role.workType || !role.industryKey) return null;
  try {
    const result = calculateScore(role.industryKey, role.workType, role.experience, role.countryKey, role.workTypeLabel);
    return {
      score: result.score,
      d1: result.d1, d2: result.d2, d3: result.d3,
      d4: result.d4, d5: result.d5, d6: result.d6,
      label: getRiskLabel(result.score),
      color: getRiskColor(result.score),
      confidence: getConfidence(role.workType),
    };
  } catch { return null; }
}

const QUICK_ROLES = [
  { label: 'SEO Content Writer', industryKey: 'content', workType: 'cnt_seo_content', experience: '2-5', countryKey: 'usa', workTypeLabel: 'SEO Content Writer' },
  { label: 'Software Architect', industryKey: 'it_software', workType: 'sw_arch', experience: '10-20', countryKey: 'usa', workTypeLabel: 'Software Architect' },
  { label: 'BPO Chat Agent', industryKey: 'bpo', workType: 'bpo_chat', experience: '0-2', countryKey: 'india', workTypeLabel: 'BPO Chat Agent' },
  { label: 'Crisis Therapist', industryKey: 'mental_health', workType: 'mh_crisis', experience: '5-10', countryKey: 'usa', workTypeLabel: 'Crisis Therapist' },
  { label: 'UX Designer', industryKey: 'design', workType: 'des_ux', experience: '5-10', countryKey: 'uk', workTypeLabel: 'UX Designer' },
  { label: 'Payroll Processor', industryKey: 'finance', workType: 'fin_payroll', experience: '2-5', countryKey: 'usa', workTypeLabel: 'Payroll Processor' },
  { label: 'Data Scientist', industryKey: 'it_ai_ml', workType: 'ml_data', experience: '5-10', countryKey: 'usa', workTypeLabel: 'Data Scientist' },
  { label: 'Surgeon', industryKey: 'healthcare', workType: 'hc_surgeon', experience: '10-20', countryKey: 'germany', workTypeLabel: 'Surgeon' },
];

export function ScoreComparison() {
  const [roleA, setRoleA] = useState(QUICK_ROLES[0]);
  const [roleB, setRoleB] = useState(QUICK_ROLES[1]);
  const [visible, setVisible] = useState(false);

  const resultA = calcFull(roleA);
  const resultB = calcFull(roleB);

  const dims = resultA && resultB
    ? [
        [resultA.d1, resultB.d1],
        [resultA.d2, resultB.d2],
        [resultA.d3, resultB.d3],
        [resultA.d4, resultB.d4],
        [resultA.d5, resultB.d5],
        [resultA.d6, resultB.d6],
      ]
    : [];

  return (
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 32 }}>
      <button
        onClick={() => setVisible(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'none',
          border: '1px solid rgba(0,245,255,0.3)', color: 'var(--cyan)', padding: '10px 20px',
          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
          transition: 'all 0.2s',
        }}
      >
        ⚡ Compare Two Roles {visible ? '↑' : '↓'}
      </button>

      {visible && (
        <div style={{ marginTop: 20, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 12, alignItems: 'center', marginBottom: 24 }}>
            {/* Role A */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>ROLE A</div>
              <select
                value={roleA.workType}
                onChange={e => setRoleA(QUICK_ROLES.find(r => r.workType === e.target.value) || roleA)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '10px 14px', borderRadius: 8, fontSize: '0.9rem' }}
              >
                {QUICK_ROLES.map(r => <option key={r.workType} value={r.workType}>{r.label}</option>)}
              </select>
            </div>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text3)' }}>vs</div>
            {/* Role B */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>ROLE B</div>
              <select
                value={roleB.workType}
                onChange={e => setRoleB(QUICK_ROLES.find(r => r.workType === e.target.value) || roleB)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '10px 14px', borderRadius: 8, fontSize: '0.9rem' }}
              >
                {QUICK_ROLES.map(r => <option key={r.workType} value={r.workType}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {resultA && resultB && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Score badges */}
              {[{ result: resultA, role: roleA }, { result: resultB, role: roleB }].map(({ result, role }) => (
                <div key={role.workType} style={{ background: 'var(--surface)', border: `2px solid ${result.color}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: 8 }}>{role.label}</div>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: result.color, fontFamily: 'var(--mono)', lineHeight: 1 }}>
                    {result.score}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: result.color, fontWeight: 600, marginTop: 4 }}>{result.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 8 }}>{result.confidence.stars} {result.confidence.label}</div>
                </div>
              ))}

              {/* Dimension bars */}
              {DIMENSION_LABELS.map((label, i) => {
                const valA = dims[i][0];
                const valB = dims[i][1];
                const winsA = valA < valB; // lower = safer for most dims
                return (
                  <div key={label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: '0.7rem', color: DIMENSION_COLORS[i] }}>●</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: winsA ? '#00FF9F' : '#ff4757', width: 32, textAlign: 'right', fontFamily: 'var(--mono)' }}>{valA}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${valA}%`, background: winsA ? '#00FF9F' : '#ff4757', borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${valB}%`, background: !winsA ? '#00FF9F' : '#ff4757', borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: !winsA ? '#00FF9F' : '#ff4757', width: 32, fontFamily: 'var(--mono)' }}>{valB}</span>
                    </div>
                  </div>
                );
              })}

              {/* Verdict */}
              <div style={{ gridColumn: '1 / -1', background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                {resultA.score < resultB.score ? (
                  <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>
                    ✓ <strong>{roleA.label}</strong> is <strong style={{ color: '#00FF9F' }}>{resultB.score - resultA.score} points safer</strong> than {roleB.label}
                  </span>
                ) : resultB.score < resultA.score ? (
                  <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>
                    ✓ <strong>{roleB.label}</strong> is <strong style={{ color: '#00FF9F' }}>{resultA.score - resultB.score} points safer</strong> than {roleA.label}
                  </span>
                ) : (
                  <span style={{ color: 'var(--yellow)' }}>⚡ Both roles have identical risk scores</span>
                )}
=======
import React, { useState } from 'react';
import { BarChart2, Compare, Scissors, ArrowRightLeft } from 'lucide-react';
import { calculateScore, getScoreColor, getVerdict } from '../data/riskEngine';
import { WORK_TYPES, INDUSTRIES } from '../data/catalogData';

export const ScoreComparison: React.FC = () => {
  const [roleA, setRoleA] = useState({ workType: '', industry: '' });
  const [roleB, setRoleB] = useState({ workType: '', industry: '' });

  const scoreA = roleA.workType && roleA.industry ? calculateScore(roleA.workType, roleA.industry) : null;
  const scoreB = roleB.workType && roleB.industry ? calculateScore(roleB.workType, roleB.industry) : null;

  return (
    <div className="mt-12 p-8 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <ArrowRightLeft className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Career Pivot Comparison</h3>
          <p className="text-sm text-slate-400">Compare your current role with a potential target</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center z-10 hidden md:flex">
          <span className="text-xs font-bold text-slate-500">VS</span>
        </div>

        {/* Role A */}
        <div className="space-y-4 p-6 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Role A (Current)</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm"
            onChange={(e) => setRoleA({ ...roleA, workType: e.target.value })}
          >
            <option value="">Select Work Type</option>
            {WORK_TYPES.map(wt => <option key={wt.key} value={wt.key}>{wt.label}</option>)}
          </select>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm"
            onChange={(e) => setRoleA({ ...roleA, industry: e.target.value })}
          >
            <option value="">Select Industry</option>
            {INDUSTRIES.map(ind => <option key={ind.key} value={ind.key}>{ind.label}</option>)}
          </select>

          {scoreA && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-3xl font-bold" style={{ color: getScoreColor(scoreA.total) }}>{scoreA.total}%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase">{getVerdict(scoreA.total)} RISK</div>
              <div className="mt-3 space-y-1.5">
                {scoreA.dimensions.map(d => (
                  <div key={d.label} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{d.label}</span>
                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                ))}
>>>>>>> audit-fixes-2026-04-07
              </div>
            </div>
          )}
        </div>
<<<<<<< HEAD
      )}
    </div>
  );
}
=======

        {/* Role B */}
        <div className="space-y-4 p-6 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Role B (Target)</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm"
            onChange={(e) => setRoleB({ ...roleB, workType: e.target.value })}
          >
            <option value="">Select Work Type</option>
            {WORK_TYPES.map(wt => <option key={wt.key} value={wt.key}>{wt.label}</option>)}
          </select>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm"
            onChange={(e) => setRoleB({ ...roleB, industry: e.target.value })}
          >
            <option value="">Select Industry</option>
            {INDUSTRIES.map(ind => <option key={ind.key} value={ind.key}>{ind.label}</option>)}
          </select>

          {scoreB && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-3xl font-bold" style={{ color: getScoreColor(scoreB.total) }}>{scoreB.total}%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase">{getVerdict(scoreB.total)} RISK</div>
              <div className="mt-3 space-y-1.5">
                {scoreB.dimensions.map(d => (
                  <div key={d.label} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{d.label}</span>
                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
>>>>>>> audit-fixes-2026-04-07
