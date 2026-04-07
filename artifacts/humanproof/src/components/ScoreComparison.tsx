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
              </div>
            </div>
          )}
        </div>

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
