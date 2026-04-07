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
