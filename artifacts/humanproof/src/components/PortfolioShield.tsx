<<<<<<< HEAD
// ════════════════════════════════════════════════════════════════
// PortfolioShield.tsx — Multi-role blended risk calculator
// NEW FEATURE: "I work 60% backend dev, 30% team lead, 10% consulting"
// Computes a weighted blend of role scores for hybrid careers
// ════════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import { calculateScore } from '../data/riskFormula';

interface RoleSlice {
  id: string;
  workType: string;
  industryKey: string;
  workTypeLabel: string;
  experience: string;
  countryKey: string;
  weight: number; // 0-100
}

const DEFAULT_ROLES: RoleSlice[] = [
  { id: '1', workType: 'sw_backend', industryKey: 'it_software', workTypeLabel: 'Backend Developer', experience: '5-10', countryKey: 'usa', weight: 60 },
  { id: '2', workType: 'sw_lead', industryKey: 'it_software', workTypeLabel: 'Tech Lead', experience: '5-10', countryKey: 'usa', weight: 40 },
];

const QUICK_ROLE_OPTIONS = [
  { workType: 'sw_backend', industryKey: 'it_software', label: 'Backend Developer' },
  { workType: 'sw_frontend', industryKey: 'it_software', label: 'Frontend Developer' },
  { workType: 'sw_lead', industryKey: 'it_software', label: 'Tech Lead' },
  { workType: 'sw_arch', industryKey: 'it_software', label: 'Software Architect' },
  { workType: 'con_strategy', industryKey: 'consulting', label: 'Strategy Consultant' },
  { workType: 'des_ux', industryKey: 'design', label: 'UX Designer' },
  { workType: 'ml_data', industryKey: 'it_ai_ml', label: 'Data Scientist' },
  { workType: 'fin_risk', industryKey: 'finance', label: 'Risk Manager' },
  { workType: 'mkt_product', industryKey: 'marketing', label: 'Product Marketer' },
  { workType: 'hr_hrbp', industryKey: 'hr', label: 'HRBP' },
  { workType: 'cnt_blog', industryKey: 'content', label: 'Content Writer' },
  { workType: 'fin_account', industryKey: 'finance', label: 'Accountant' },
  { workType: 'leg_litigation', industryKey: 'legal', label: 'Litigation Lawyer' },
  { workType: 'hc_doctor', industryKey: 'healthcare', label: 'Doctor' },
  { workType: 'edu_teach', industryKey: 'education', label: 'Teacher' },
  { workType: 'con_mgmt', industryKey: 'consulting', label: 'Management Consultant' },
];

const EXP_OPTIONS = ['0-2', '2-5', '5-10', '10-20', '20+'];
const COUNTRY_OPTIONS = ['usa', 'uk', 'india', 'germany', 'singapore', 'australia', 'canada', 'france'];

function getRiskColor(score: number) {
  if (score >= 80) return '#ff4757';
  if (score >= 65) return '#ff7f50';
  if (score >= 40) return '#fbbf24'; 
  if (score >= 25) return '#00F5FF';
  return '#00FF9F';
}

function getRiskLabel(score: number) {
  if (score >= 80) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 40) return 'Moderate';
  if (score >= 25) return 'Low';
  return 'AI-Resistant';
}

export function PortfolioShield() {
  const [roles, setRoles] = useState<RoleSlice[]>(DEFAULT_ROLES);
  const [visible, setVisible] = useState(false);

  const totalWeight = roles.reduce((s, r) => s + r.weight, 0);

  const blendedScore = useMemo(() => {
    if (totalWeight === 0 || roles.length === 0) return null;
    let weighted = 0;
    for (const role of roles) {
      try {
        const result = calculateScore(role.industryKey, role.workType, role.experience, role.countryKey, role.workTypeLabel);
        weighted += result.score * (role.weight / totalWeight);
      } catch {}
    }
    return Math.round(weighted);
  }, [roles, totalWeight]);

  const addRole = () => {
    const opt = QUICK_ROLE_OPTIONS[roles.length % QUICK_ROLE_OPTIONS.length];
    setRoles(prev => [...prev, {
      id: Date.now().toString(),
      workType: opt.workType,
      industryKey: opt.industryKey,
      workTypeLabel: opt.label,
      experience: '5-10',
      countryKey: 'usa',
      weight: 20,
    }]);
  };

  const updateRole = (id: string, field: keyof RoleSlice, value: string | number) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (field === 'workType') {
        const opt = QUICK_ROLE_OPTIONS.find(o => o.workType === value);
        return { ...r, workType: value as string, workTypeLabel: opt?.label || r.workTypeLabel, industryKey: opt?.industryKey || r.industryKey };
      }
      return { ...r, [field]: value };
    }));
  };

  return (
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 32, paddingTop: 32 }}>
      <button
        onClick={() => setVisible(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'none',
          border: '1px solid rgba(124,58,255,0.4)', color: '#a78bfa', padding: '10px 20px',
          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
        }}
      >
        🛡️ Portfolio Shield Score {visible ? '↑' : '↓'}
      </button>

      {visible && (
        <div style={{ marginTop: 20, animation: 'fadeIn 0.3s ease-out' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: 20 }}>
            Map your actual career split. A hybrid portfolio often has a very different risk profile than any single role.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {roles.map(role => (
              <div key={role.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 36px', gap: 10, alignItems: 'center', background: 'var(--surface)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <select
                  value={role.workType}
                  onChange={e => updateRole(role.id, 'workType', e.target.value)}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'white', padding: '8px', borderRadius: 6, fontSize: '0.85rem' }}
                >
                  {QUICK_ROLE_OPTIONS.map(o => <option key={o.workType} value={o.workType}>{o.label}</option>)}
                </select>
                <select
                  value={role.experience}
                  onChange={e => updateRole(role.id, 'experience', e.target.value)}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'white', padding: '8px', borderRadius: 6, fontSize: '0.85rem' }}
                >
                  {EXP_OPTIONS.map(e => <option key={e} value={e}>{e} yrs</option>)}
                </select>
                <select
                  value={role.countryKey}
                  onChange={e => updateRole(role.id, 'countryKey', e.target.value)}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'white', padding: '8px', borderRadius: 6, fontSize: '0.85rem' }}
                >
                  {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    value={role.weight}
                    min={0}
                    max={100}
                    onChange={e => updateRole(role.id, 'weight', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'white', padding: '8px', borderRadius: 6, fontSize: '0.85rem', textAlign: 'center' }}
                  />
                  <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>%</span>
                </div>
                <button
                  onClick={() => setRoles(prev => prev.filter(r => r.id !== role.id))}
                  style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff4757', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}
                >×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
            <button onClick={addRole} style={{ background: 'rgba(0,245,255,0.08)', border: '1px dashed rgba(0,245,255,0.3)', color: 'var(--cyan)', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
              + Add Role
            </button>
            <span style={{ fontSize: '0.8rem', color: totalWeight !== 100 ? '#ff4757' : '#00FF9F' }}>
              {totalWeight !== 100 ? `⚠ Weights sum to ${totalWeight}% (should be 100%)` : '✓ Weights balanced'}
            </span>
          </div>

          {blendedScore !== null && (
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: `2px solid ${getRiskColor(blendedScore)}` }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: 8 }}>BLENDED PORTFOLIO RISK SCORE</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: getRiskColor(blendedScore), fontFamily: 'var(--mono)', lineHeight: 1 }}>{blendedScore}</div>
                <div>
                  <div style={{ color: getRiskColor(blendedScore), fontWeight: 700, fontSize: '1.2rem' }}>{getRiskLabel(blendedScore)}</div>
                  <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 4 }}>Weighted across {roles.length} career components</div>
                </div>
              </div>

              {/* Per-role breakdown bars */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {roles.map(role => {
                  let score = 0;
                  try { score = calculateScore(role.industryKey, role.workType, role.experience, role.countryKey, role.workTypeLabel).score; } catch {}
                  return (
                    <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text2)', width: 150, flexShrink: 0 }}>{role.workTypeLabel} ({role.weight}%)</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${score}%`, background: getRiskColor(score), borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: getRiskColor(score), fontFamily: 'var(--mono)', fontWeight: 700, width: 32 }}>{score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
=======
import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Sliders } from 'lucide-react';
import { calculateScore, getScoreColor, getVerdict } from '../data/riskEngine';
import { WORK_TYPES, INDUSTRIES } from '../data/catalogData';

interface BlendedRole {
  id: string;
  workType: string;
  industry: string;
  weight: number;
}

export const PortfolioShield: React.FC = () => {
  const [roles, setRoles] = useState<BlendedRole[]>([
    { id: '1', workType: '', industry: '', weight: 50 },
  ]);

  const addRole = () => {
    setRoles([...roles, { id: Math.random().toString(), workType: '', industry: '', weight: 10 }]);
  };

  const removeRole = (id: string) => {
    if (roles.length > 1) setRoles(roles.filter(r => r.id !== id));
  };

  const updateRole = (id: string, updates: Partial<BlendedRole>) => {
    setRoles(roles.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const totalWeight = roles.reduce((sum, r) => sum + r.weight, 0);
  
  const blendedScore = roles.reduce((acc, r) => {
    if (!r.workType || !r.industry) return acc;
    const score = calculateScore(r.workType, r.industry).total;
    return acc + (score * (r.weight / totalWeight));
  }, 0);

  return (
    <div className="mt-8 p-8 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Portfolio Risk Shield</h3>
          <p className="text-sm text-slate-400">Calculate your blended risk across multiple income streams</p>
        </div>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 items-center">
            <select 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm"
              value={role.workType}
              onChange={(e) => updateRole(role.id, { workType: e.target.value })}
            >
              <option value="">Work Type</option>
              {WORK_TYPES.map(wt => <option key={wt.key} value={wt.key}>{wt.label}</option>)}
            </select>
            <select 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm"
              value={role.industry}
              onChange={(e) => updateRole(role.id, { industry: e.target.value })}
            >
              <option value="">Industry</option>
              {INDUSTRIES.map(ind => <option key={ind.key} value={ind.key}>{ind.label}</option>)}
            </select>
            
            <div className="flex items-center gap-2 w-full md:w-48">
              <span className="text-[10px] text-slate-500 uppercase font-bold w-12">Weight</span>
              <input 
                type="range" min="1" max="100" 
                value={role.weight}
                onChange={(e) => updateRole(role.id, { weight: parseInt(e.target.value) })}
                className="flex-1 accent-emerald-500"
              />
              <span className="text-xs font-mono text-emerald-400 w-8">{Math.round((role.weight/totalWeight)*100)}%</span>
            </div>

            <button onClick={() => removeRole(role.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800 pt-6">
        <button 
          onClick={addRole}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Income Stream
        </button>

        {blendedScore > 0 && (
          <div className="text-center md:text-right">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Blended Risk Score</div>
            <div className="text-4xl font-black" style={{ color: getScoreColor(blendedScore) }}>
              {Math.round(blendedScore)}%
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
              Overall Portfolio: {getVerdict(blendedScore)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
>>>>>>> audit-fixes-2026-04-07
