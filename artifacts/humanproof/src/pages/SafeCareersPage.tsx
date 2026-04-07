import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, DollarSign, Building2, Search, Filter, ArrowRight, X } from 'lucide-react';

interface CareerStats {
  total: number;
  avgSalary: number;
  topSector: string;
}

interface Career {
  id: string;
  title: string;
  sector: string;
  growth_rate: string;
  avg_salary: number;
  human_factor: number;
  ai_resistance: 'High' | 'Very High' | 'Critical';
  why_safe: string;
  skills: string[];
}

export const SafeCareersPage: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [stats, setStats] = useState<CareerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [careersRes, statsRes] = await Promise.all([
        fetch('/api/safe-careers'),
        fetch('/api/safe-careers/stats')
      ]);
      
      const careersData = await careersRes.json();
      const statsData = await statsRes.json();
      
      setCareers(careersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch career data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers = careers.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSafetyColor = (resistance: string) => {
    // Standardized 4-tier risk color logic (BUG-018)
    switch (resistance) {
      case 'Critical': return '#00f5ff'; // Cyan
      case 'Very High': return '#10b981'; // Emerald
      case 'High': return '#3b82f6'; // Blue
      default: return '#94a3b8'; // Slate
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">SAFE <span className="text-cyan-500">CAREERS</span></h1>
          <p className="text-slate-400">Roles with the highest resistance to AI displacement.</p>
        </div>

        {stats && (
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Safe Roles</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Avg Salary</div>
              <div className="text-2xl font-bold text-emerald-400">${(stats.avgSalary/1000).toFixed(0)}k</div>
            </div>
            <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Top Sector</div>
              <div className="text-2xl font-bold text-cyan-400">{stats.topSector}</div>
            </div>
          </div>
        )}
      </div>

      <div className="relative mb-12 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Search anti-fragile roles, sectors or skills..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-cyan-500 transition-all text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="h-64 bg-slate-900/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map(career => (
            <div 
              key={career.id}
              onClick={() => setSelectedCareer(career)}
              className="group p-8 bg-slate-950/50 border border-slate-800 rounded-3xl hover:border-cyan-500/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-24 h-24 text-white" />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold border" style={{ 
                  color: getSafetyColor(career.ai_resistance),
                  borderColor: `${getSafetyColor(career.ai_resistance)}33`,
                  backgroundColor: `${getSafetyColor(career.ai_resistance)}11`
                }}>
                  {career.ai_resistance.toUpperCase()} RESISTANCE
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{career.title}</h3>
              <p className="text-slate-500 text-sm mb-6">{career.sector}</p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <div>
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Avg Salary</div>
                  <div className="text-lg font-bold text-white">${(career.avg_salary/1000).toFixed(0)}k</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Human Factor</div>
                  <div className="text-lg font-bold text-cyan-400">{career.human_factor}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedCareer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="h-full w-full max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right-full duration-500 rounded-2xl md:rounded-l-3xl md:rounded-r-none">
            <button 
              onClick={() => setSelectedCareer(null)}
              className="mb-8 p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="mb-8">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold border" style={{ 
                color: getSafetyColor(selectedCareer.ai_resistance),
                borderColor: `${getSafetyColor(selectedCareer.ai_resistance)}33`,
                backgroundColor: `${getSafetyColor(selectedCareer.ai_resistance)}11`
              }}>
                {selectedCareer.ai_resistance.toUpperCase()} RESISTANCE
              </span>
              <h2 className="text-4xl font-black text-white mt-4 mb-2">{selectedCareer.title}</h2>
              <p className="text-slate-500 text-lg">{selectedCareer.sector}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-2xl font-bold text-white">${(selectedCareer.avg_salary/1000).toFixed(0)}k</div>
                <div className="text-[10px] text-slate-500 font-black uppercase">Average Salary</div>
              </div>
              <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                <TrendingUp className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="text-2xl font-bold text-white">{selectedCareer.growth_rate}</div>
                <div className="text-[10px] text-slate-500 font-black uppercase">Projected Growth</div>
              </div>
            </div>

            <div className="mb-12">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Why it's AI-Resistant</h4>
              <p className="text-slate-400 leading-relaxed bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50">
                {selectedCareer.why_safe}
              </p>
            </div>

            <div className="mb-12">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Critical Human Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCareer.skills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'learning-hub', params: { roleKey: selectedCareer.title } } }))}
              className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
            >
              Start Upskilling Path <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
