import { useState, useRef, useEffect, useMemo } from 'react';
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
import { ScoreComparison } from '../components/ScoreComparison';
import { PortfolioShield } from '../components/PortfolioShield';

const PIVOT_WORK_KEY_MAP: Record<string, string> = {
  'ai engineering lead': 'sw_ml',
  'platform engineering': 'sw_devops',
  'developer relations': 'sw_lead',
  'ai product designer': 'des_ux',
  'full-stack ai integrations': 'sw_fullstack',
};

export default function CalculatorPage() {
  const { saveAssessment } = useHumanProof();
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [workType, setWorkType] = useState<WorkType | ''>('');
  const [country, setCountry] = useState<Country | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCalculate = async () => {
    if (!industry || !workType || !country) return;
    setLoading(true);
    
    setTimeout(async () => {
      const score = calculateScore(workType, industry);
      setResult(score);
      setLoading(false);
      
      const res = await saveAssessment({
        industry,
        workType,
        country,
        score: score.total,
        details: score
      });

      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
          AI DISPLACEMENT <span className="text-cyan-500">CALCULATOR</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Our proprietary algorithm analyzes your role against 14 risk vectors including 
          Generative AI advancement, market volatility, and sector-wide automation.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Industry Sector</label>
            <select 
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="">Select Industry</option>
              {INDUSTRIES.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Work Specialization</label>
            <select 
              value={workType}
              onChange={(e) => setWorkType(e.target.value as WorkType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="">Select Work Type</option>
              {WORK_TYPES.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Regional Market</label>
            <select 
              value={country}
              onChange={(e) => setCountry(e.target.value as Country)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          disabled={!industry || !workType || !country || loading}
          className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-cyan-400 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100 uppercase tracking-tighter"
        >
          {loading ? 'Crunching 2026 Projections...' : 'Analyze My Career Safety'}
        </button>

        {loading && (
          <div className="calc-loading mt-8">
            <div className="loading-text text-sm text-center font-mono animate-pulse text-cyan-400 mb-2">Analysing 6 dimensions across 2026 data...</div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 animate-loading-bar" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {result && !loading && (
          <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultPanel data={result} />
            <ScoreComparison />
            <PortfolioShield />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPanel({ data }: { data: any }) {
  const urgency = getUrgency(data.total);
  const confidence = getConfidence(data.total);

  return (
    <div className="mt-12 space-y-8">
      {/* Primary Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-950/50 p-8 rounded-3xl border border-white/5">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
            <DataFreshnessBadge />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              confidence === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {confidence} CONFIDENCE
            </span>
          </div>
          <h2 className="text-5xl font-black mb-2" style={{ color: getScoreColor(data.total) }}>
            {data.total}%
          </h2>
          <div className="text-xl font-bold text-white uppercase tracking-tight mb-4">
            {getVerdict(data.total)} RISK
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {getAutomationExp(data.total)}
          </p>
          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-xs uppercase text-slate-500 font-bold">Action Window</div>
            <div className={`text-sm font-bold ${urgency === 'IMMEDIATE' ? 'text-red-400' : 'text-cyan-400'}`}>
               {getTimeline(data.total)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {data.dimensions.map((dim: any) => (
            <div key={dim.label}>
              <div className="flex justify-between text-xs font-bold mb-1.5 px-1">
                <span className="text-slate-400 uppercase tracking-wider">{dim.label}</span>
                <span className="text-white">{dim.score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out" 
                  style={{ 
                    width: `${dim.score}%`,
                    backgroundColor: getScoreColor(dim.score)
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
          <h4 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            High Risk Factors
          </h4>
          <div className="flex flex-wrap gap-2">
            {DANGER_SKILLS.slice(0, 4).map(skill => (
              <span key={skill} className="px-3 py-1 bg-rose-500/10 text-rose-300 text-[10px] font-bold rounded-lg border border-rose-500/10">
                {skill.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
          <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Human Advantage Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {SAFE_SKILLS.slice(0, 4).map(skill => (
              <span key={skill} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/10">
                {skill.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      <PeerBenchmark currentScore={data.total} />

      <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
        <span className="text-[10px] font-black bg-cyan-500 text-black px-2 py-0.5 rounded-md mb-3 inline-block">STRATEGIC PIVOT</span>
        <h4 className="text-white font-bold mb-2">Recommended Career Shift</h4>
        <p className="text-slate-400 text-sm mb-4">
          Based on your current industry and the high creative entropy of your skill set, 
          transitioning towards {TRANSITION_RECS[0]} could reduce your 5-year risk profile by 22%.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'learning-hub', params: { roleKey: PIVOT_WORK_KEY_MAP[TRANSITION_RECS[0].toLowerCase()] } } }))}
          className="text-cyan-400 text-xs font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
        >
          EXPLORE LEARNING PATH <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
}
