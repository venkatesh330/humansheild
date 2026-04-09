import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';
import { WORK_TYPES, INDUSTRIES } from '../data/catalogData';
import { calculateScore, getScoreColor } from '../data/riskEngine';

export const PortfolioShield: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [showTooltips, setShowTooltips] = useState(false);

  // Fix: WORK_TYPES is an object keyed by industry, not a flat array
  const rolesInIndustry = industry ? (WORK_TYPES[industry as keyof typeof WORK_TYPES] ?? []) : [];
  const score = (industry && role) ? calculateScore(role, industry) : null;

  return (
    <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
      
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Portfolio Shield</h3>
            <p className="text-sm text-slate-400 font-medium">Verify your career protection level</p>
          </div>
        </div>
        <button 
          onClick={() => setShowTooltips(!showTooltips)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Baseline Industry</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
              value={industry}
              onChange={(e) => { setIndustry(e.target.value); setRole(''); }}
            >
              <option value="">Select Industry</option>
              {INDUSTRIES.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Target Role</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-all disabled:opacity-40"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!industry}
            >
              <option value="">Select Role</option>
              {rolesInIndustry.map((r: any) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-950/50 rounded-[2rem] border border-white/5 shadow-inner min-h-[220px]">
          {score ? (
            <div className="text-center animate-in zoom-in duration-500">
              <div className="relative inline-block mb-4">
                 {score.total < 30 ? (
                   <ShieldCheck className="w-16 h-16 text-emerald-400" />
                 ) : score.total < 60 ? (
                   <Shield className="w-16 h-16 text-blue-400" />
                 ) : (
                   <ShieldAlert className="w-16 h-16 text-rose-400" />
                 )}
                 <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full -z-10" />
              </div>
              <div className="text-4xl font-black text-white mb-1">{100 - score.total}%</div>
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Protection Factor</div>
            </div>
          ) : (
            <div className="text-center text-slate-600">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-medium italic">Select a role to verify its Shield Level</p>
            </div>
          )}
        </div>
      </div>

      {showTooltips && (
        <div className="mt-6 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs text-slate-400 leading-relaxed">
          The **Protection Factor** represents the inverse of AI Displacement Risk. A score of 80% means your chosen role currently has an 80% shield against immediate automation in 2026.
        </div>
      )}
    </div>
  );
};
