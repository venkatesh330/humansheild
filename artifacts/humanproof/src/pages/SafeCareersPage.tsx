<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Shield, TrendingUp, DollarSign, Wifi, WifiOff,
  GraduationCap, ChevronRight, Filter, RotateCcw, Star,
  ChevronDown, X, Zap, Globe, Building2, Briefcase, ExternalLink, BookOpen, ArrowRight
} from 'lucide-react';
import { useHumanProof } from '../context/HumanProofContext';

// ── Types ──────────────────────────────────────────────────────────────────
interface SafeCareer {
  id: string;
  roleKey: string;
  roleTitle: string;
  industryKey: string;
  industryLabel: string;
  riskScore: number;
  growthProjection: number | null;
  medianSalaryUsd: number | null;
  remoteViable: 'yes' | 'partial' | 'no';
  educationRequired: string;
  automationD1: number | null;
  augmentationD3: number | null;
  disruptionD2: number | null;
  isSmeStable: number;
  smeStabilityReason: string | null;
  safetyReason: string | null;
}

interface Filters {
  industry: string;
  remote: string;
  education: string;
  isSmeStable: boolean;
  maxRisk: number;
  minGrowth: number;
  q: string;
  sort: 'risk' | 'growth' | 'salary';
}

// ── Constants ──────────────────────────────────────────────────────────────
const EDUCATION_LABELS: Record<string, string> = {
  high_school: 'High School', associate: 'Associate', bachelor: "Bachelor's", master: "Master's", phd: 'PhD / Doctorate',
};
const REMOTE_LABELS: Record<string, string> = { yes: 'Fully Remote', partial: 'Hybrid', no: 'On-site' };
const REMOTE_COLORS: Record<string, string> = { yes: '#00FF9F', partial: '#00F5FF', no: '#9090AA' };
const DEFAULT_FILTERS: Filters = {
  industry: '', remote: '', education: '', isSmeStable: false, maxRisk: 50, minGrowth: 0, q: '', sort: 'risk'
};

// Sector quick-filters
const QUICK_SECTORS = [
  { key: 'technology',      label: '💻 Tech',         color: '#00F5FF' },
  { key: 'healthcare',      label: '🏥 Healthcare',   color: '#00FF9F' },
  { key: 'skilled_trades',  label: '🔧 Trades',       color: '#FBBF24' },
  { key: 'finance',         label: '📈 Finance',      color: '#7C3AFF' },
  { key: 'energy_environment', label: '⚡ Clean Energy', color: '#00FF9F' },
  { key: 'education',       label: '📚 Education',    color: '#00F5FF' },
  { key: 'creative_media',  label: '🎨 Creative',     color: '#FF7043' },
  { key: 'legal',           label: '⚖️ Legal',        color: '#9F6EFF' },
  { key: 'hr',              label: '👥 HR',            color: '#00F5FF' },
  { key: 'fitness',         label: '💪 Fitness',      color: '#00FF9F' },
  { key: 'nonprofit',       label: '🤲 NGO',          color: '#FBBF24' },
  { key: 'agriculture',     label: '🌾 Agriculture',  color: '#86EFAC' },
  { key: 'data_science',    label: '📊 Data',         color: '#7C3AFF' },
  { key: 'construction',    label: '🏗️ Construction', color: '#FB923C' },
];

// Industry icons for card display
const INDUSTRY_ICONS: Record<string, string> = {
  technology: '💻', healthcare: '🏥', skilled_trades: '🔧', finance: '💰',
  legal: '⚖️', education: '📚', creative_media: '🎨', construction: '🏗️',
  energy_environment: '⚡', government: '🏛️', real_estate: '🏠', logistics: '🚚',
  social_work: '🤝', hospitality: '🍽️', agriculture: '🌾', manufacturing: '🏭',
  pharma_biotech: '🧬', retail: '🛍️', insurance: '🛡️', marketing: '📣',
  data_science: '📊', cybersecurity: '🔒', telecom: '📡', aerospace: '✈️',
  maritime: '⚓', mining: '⛏️', public_health: '🌐', veterinary: '🐾',
  psychology: '🧠', architecture: '🏛️',
  hr: '👥', fitness: '💪', nonprofit: '🤲', beauty_wellness: '💅', wellness_care: '🧘',
  pro_services: '📋', tech_ops: '⚙️', energy_infra: '🔋', community_social: '🌍',
  specialty_finance: '🏦', data_analytics: '📈', bio_info: '🔬',
};

// BLS resource links per industry
const INDUSTRY_BLS_LINKS: Record<string, string> = {
  technology: 'https://www.bls.gov/ooh/computer-and-information-technology/',
  healthcare: 'https://www.bls.gov/ooh/healthcare/',
  skilled_trades: 'https://www.bls.gov/ooh/construction-and-extraction/',
  finance: 'https://www.bls.gov/ooh/business-and-financial/',
  legal: 'https://www.bls.gov/ooh/legal/',
  education: 'https://www.bls.gov/ooh/education-training-and-library/',
  energy_environment: 'https://www.bls.gov/ooh/architecture-and-engineering/wind-turbine-technicians.htm',
};

// ── SearchableSelect Component ──────────────────────────────────────────────
function SearchableSelect({
  value, options, placeholder, onChange, icon,
}: {
  value: string;
  options: { key: string; label: string }[];
  placeholder: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
  const selected = options.find(o => o.key === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setQ('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,245,255,0.15)',
          borderRadius: 10, padding: '9px 12px', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          fontSize: '0.85rem', transition: 'border-color 0.2s',
          ...(open ? { borderColor: 'var(--cyan)' } : {}),
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: selected ? 'white' : '#9090AA' }}>
          {icon && <span style={{ color: 'var(--cyan)' }}>{icon}</span>}
          {selected ? `${INDUSTRY_ICONS[selected.key] || ''} ${selected.label}` : placeholder}
        </span>
        {value
          ? <X size={14} style={{ color: '#9090AA', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }} />
          : <ChevronDown size={14} style={{ color: '#9090AA', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        }
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 9999,
          background: '#12122e', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 12,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)', overflow: 'hidden', maxHeight: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 10px' }}>
              <Search size={13} style={{ color: '#9090AA', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search industries…"
                style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 260, padding: '4px 0' }}>
            <div
              onClick={() => { onChange(''); setOpen(false); setQ(''); }}
              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '0.85rem', color: '#9090AA', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,245,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Globe size={13} /> All Industries
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '12px 14px', color: '#9090AA', fontSize: '0.82rem', textAlign: 'center' }}>No industries found</div>
            )}
            {filtered.map(o => (
              <div
                key={o.key}
                onClick={() => { onChange(o.key); setOpen(false); setQ(''); }}
                style={{
                  padding: '9px 14px', cursor: 'pointer', fontSize: '0.85rem', color: 'white',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: value === o.key ? 'rgba(0,245,255,0.12)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,245,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = value === o.key ? 'rgba(0,245,255,0.12)' : 'none')}
              >
                <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{INDUSTRY_ICONS[o.key] || '🏢'}</span>
                <span>{o.label}</span>
                {value === o.key && <span style={{ marginLeft: 'auto', color: 'var(--cyan)', fontSize: '0.7rem' }}>✓</span>}
              </div>
            ))}
=======
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
>>>>>>> audit-fixes-2026-04-07
          </div>
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
}

// ── SafetyRing Component ──────────────────────────────────────────────────
function SafetyRing({ score, size = 64 }: { score: number; size?: number }) {
  const safety = 100 - score;
  const color = score <= 15 ? '#00FF9F' : score <= 30 ? '#00F5FF' : score <= 45 ? '#FBBF24' : '#FF7043';
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={circ * (score / 100)}
            strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size < 56 ? '0.8rem' : '1rem', fontWeight: 700, color, fontFamily: 'var(--mono)',
        }}>
          {safety}
        </div>
      </div>
      <span style={{ fontSize: '0.55rem', color: '#9090AA', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Safety</span>
    </div>
  );
}

// ── AiRiskBar Component ──────────────────────────────────────────────────
function AiRiskBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  if (value === null) return null;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: '0.7rem', color: '#9090AA' }}>
        <span>{label}</span><span style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: `linear-gradient(90deg, ${color}55, ${color})`, borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ── CareerCard Component ──────────────────────────────────────────────────
function CareerCard({ career, onSelect }: { career: SafeCareer; onSelect: (c: SafeCareer) => void }) {
  const safetyColor = career.riskScore <= 15 ? '#00FF9F' : career.riskScore <= 30 ? '#00F5FF' : career.riskScore <= 45 ? '#FBBF24' : '#FF7043';
  const salaryK = career.medianSalaryUsd ? `$${Math.round(career.medianSalaryUsd / 1000)}K` : '—';
  const growth = career.growthProjection;
  const growthStr = growth !== null ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` : '—';

  return (
    <div
      onClick={() => onSelect(career)}
      className="career-card"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = safetyColor + '55';
        el.style.background = 'rgba(255,255,255,0.045)';
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = `0 16px 50px ${safetyColor}15`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'rgba(255,255,255,0.07)';
        el.style.background = 'rgba(255,255,255,0.025)';
        el.style.transform = 'none';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${safetyColor}88, ${safetyColor})` }} />

      <div style={{ padding: '18px 18px 16px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <SafetyRing score={career.riskScore} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row + badges */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
              {career.roleTitle}
            </span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {career.riskScore <= 15 && (
                <span style={{ background: 'rgba(0,255,159,0.12)', color: '#00FF9F', fontSize: '0.6rem', padding: '2px 7px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>⭐ SAFEST</span>
              )}
              {career.isSmeStable === 1 && (
                <span style={{ background: 'rgba(124,58,255,0.15)', color: '#9F6EFF', fontSize: '0.6rem', padding: '2px 7px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>🏢 SME</span>
              )}
              {growth !== null && growth >= 15 && (
                <span style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', fontSize: '0.6rem', padding: '2px 7px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>🚀 FAST GROWTH</span>
              )}
            </div>
          </div>

          {/* Industry */}
          <div style={{ fontSize: '0.78rem', color: '#9090AA', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>{INDUSTRY_ICONS[career.industryKey] || '🏢'}</span>
            <span>{career.industryLabel}</span>
          </div>

          {/* Pills row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {[
              { icon: <TrendingUp size={11} />, label: `${growthStr} growth`, col: growth && growth > 5 ? '#00FF9F' : '#9090AA' },
              { icon: <DollarSign size={11} />, label: salaryK, col: '#FBBF24' },
              { icon: career.remoteViable === 'no' ? <WifiOff size={11} /> : <Wifi size={11} />, label: REMOTE_LABELS[career.remoteViable], col: REMOTE_COLORS[career.remoteViable] },
              { icon: <GraduationCap size={11} />, label: EDUCATION_LABELS[career.educationRequired] || career.educationRequired, col: '#9090AA' },
            ].map((p, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: p.col }}>
                <span style={{ color: p.col }}>{p.icon}</span>{p.label}
              </span>
            ))}
          </div>

          {/* AI risk mini-bars */}
          <div style={{ marginBottom: 8 }}>
            <AiRiskBar label="AI Automation Risk" value={career.automationD1} color="#FF4757" />
            <AiRiskBar label="AI Augmentation Potential" value={career.augmentationD3} color="#00F5FF" />
          </div>

          {/* Safety reason snippet */}
          {career.safetyReason && (
            <div style={{ fontSize: '0.72rem', color: '#9090AA', fontStyle: 'italic', lineHeight: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{career.safetyReason}</span>
              <button
                onClick={e => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'learning-hub', params: { roleKey: career.roleKey } } })); }}
                style={{
                  background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)',
                  borderRadius: 6, padding: '3px 8px', color: '#00F5FF', cursor: 'pointer',
                  fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                }}
              >
                <BookOpen size={10} /> Learn
              </button>
            </div>
          )}
        </div>

        <ChevronRight size={16} style={{ color: '#9090AA', flexShrink: 0, marginTop: 4 }} />
      </div>
    </div>
  );
}

// ── FilterPanel ────────────────────────────────────────────────────────────
function FilterPanel({
  filters, industries, onChange, onReset, activeCount,
}: {
  filters: Filters;
  industries: { key: string; label: string }[];
  onChange: (f: Partial<Filters>) => void;
  onReset: () => void;
  activeCount: number;
}) {
  const labelStyle: React.CSSProperties = { fontSize: '0.68rem', color: '#9090AA', marginBottom: 6, display: 'block', letterSpacing: '0.1em', textTransform: 'uppercase' };
  const customSelectStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,245,255,0.15)',
    borderRadius: 10, padding: '9px 12px', color: 'white', fontSize: '0.85rem', outline: 'none',
    appearance: 'none', cursor: 'pointer',
  };

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(12,12,38,0.98) 0%, rgba(15,15,42,0.98) 100%)',
      border: '1px solid rgba(0,245,255,0.12)', borderRadius: 20,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
          <Filter size={15} style={{ color: '#00F5FF' }} />
          Filters
          {activeCount > 0 && (
            <span style={{ background: '#7C3AFF', color: 'white', borderRadius: 20, padding: '1px 8px', fontSize: '0.68rem', fontWeight: 700 }}>
              {activeCount}
            </span>
          )}
        </span>
        <button onClick={onReset} style={{ background: 'none', border: 'none', color: '#9090AA', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Industry searchable select */}
      <div>
        <label style={labelStyle}>Industry</label>
        <SearchableSelect
          value={filters.industry}
          options={industries}
          placeholder="All Industries"
          onChange={v => onChange({ industry: v })}
          icon={<Globe size={13} />}
        />
      </div>

      {/* Remote */}
      <div>
        <label style={labelStyle}>Remote Work</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ k: '', l: 'Any' }, { k: 'yes', l: '🌐 Remote' }, { k: 'partial', l: '🏠 Hybrid' }, { k: 'no', l: '🏢 On-site' }].map(o => (
            <button
              key={o.k}
              onClick={() => onChange({ remote: filters.remote === o.k ? '' : o.k })}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 8, border: '1px solid',
                fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: filters.remote === o.k ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.03)',
                borderColor: filters.remote === o.k ? '#00F5FF' : 'rgba(255,255,255,0.08)',
                color: filters.remote === o.k ? '#00F5FF' : '#9090AA',
              }}
            >{o.l}</button>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <label style={labelStyle}>Education</label>
        <select value={filters.education} onChange={e => onChange({ education: e.target.value })} style={customSelectStyle}>
          <option value="" style={{ background: '#12122e' }}>Any Level</option>
          {Object.entries(EDUCATION_LABELS).map(([k, v]) => (
            <option key={k} value={k} style={{ background: '#12122e' }}>{v}</option>
          ))}
        </select>
      </div>

      {/* Risk slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={labelStyle}>Max Risk Score</label>
          <span style={{ fontSize: '0.78rem', color: '#00F5FF', fontFamily: 'var(--mono)', fontWeight: 700 }}>{filters.maxRisk}</span>
        </div>
        <input type="range" min={10} max={60} step={5} value={filters.maxRisk}
          onChange={e => onChange({ maxRisk: parseInt(e.target.value, 10) })}
          style={{ width: '100%', accentColor: '#00F5FF' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#9090AA', marginTop: 4 }}>
          <span style={{ color: '#00FF9F' }}>Very Safe</span><span>Moderate Risk</span>
        </div>
      </div>

      {/* Growth slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={labelStyle}>Min BLS Growth</label>
          <span style={{ fontSize: '0.78rem', color: '#00FF9F', fontFamily: 'var(--mono)', fontWeight: 700 }}>
            {filters.minGrowth > 0 ? `+${filters.minGrowth}%` : 'Any'}
          </span>
        </div>
        <input type="range" min={0} max={30} step={2} value={filters.minGrowth}
          onChange={e => onChange({ minGrowth: parseInt(e.target.value, 10) })}
          style={{ width: '100%', accentColor: '#00FF9F' }} />
      </div>

      {/* SME toggle */}
      <div
        onClick={() => onChange({ isSmeStable: !filters.isSmeStable })}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
          background: filters.isSmeStable ? 'rgba(124,58,255,0.12)' : 'rgba(255,255,255,0.03)',
          borderRadius: 12, border: `1px solid ${filters.isSmeStable ? '#7C3AFF' : 'rgba(255,255,255,0.08)'}`,
          cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: filters.isSmeStable ? 'linear-gradient(90deg, #7C3AFF, #9F6EFF)' : 'rgba(255,255,255,0.1)',
          position: 'relative', transition: 'all 0.3s', flexShrink: 0,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: 'white',
            position: 'absolute', top: 2,
            left: filters.isSmeStable ? 18 : 2,
            transition: 'left 0.3s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </div>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: filters.isSmeStable ? '#9F6EFF' : 'white' }}>SME Stable Only 🏢</div>
          <div style={{ fontSize: '0.65rem', color: '#9090AA' }}>Roles resilient in small businesses</div>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label style={labelStyle}>Sort By</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ k: 'risk', l: '🛡️ Safety' }, { k: 'growth', l: '📈 Growth' }, { k: 'salary', l: '💰 Salary' }].map(o => (
            <button
              key={o.k}
              onClick={() => onChange({ sort: o.k as Filters['sort'] })}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, border: '1px solid',
                fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: filters.sort === o.k ? 'rgba(0,245,255,0.12)' : 'rgba(255,255,255,0.03)',
                borderColor: filters.sort === o.k ? '#00F5FF' : 'rgba(255,255,255,0.08)',
                color: filters.sort === o.k ? '#00F5FF' : '#9090AA',
              }}
            >{o.l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DetailDrawer ────────────────────────────────────────────────────────────
// BUG-018 FIX: safetyColor now uses 4-tier logic matching CareerCard exactly
function DetailDrawer({ career, onClose }: { career: SafeCareer; onClose: () => void }) {
  const safetyColor = career.riskScore <= 15 ? '#00FF9F' : career.riskScore <= 30 ? '#00F5FF' : career.riskScore <= 45 ? '#FBBF24' : '#FF7043';
  const blsLink = INDUSTRY_BLS_LINKS[career.industryKey] || 'https://www.bls.gov/ooh/';

  const stats = [
    { label: 'Safety Score', value: `${100 - career.riskScore} / 100`, col: safetyColor },
    { label: 'BLS Job Growth (2033)', value: career.growthProjection !== null ? `${career.growthProjection >= 0 ? '+' : ''}${career.growthProjection.toFixed(1)}%` : 'N/A', col: (career.growthProjection ?? 0) > 5 ? '#00FF9F' : '#9090AA' },
    { label: 'Median Salary (USD)', value: career.medianSalaryUsd ? `$${(career.medianSalaryUsd / 1000).toFixed(0)}K / yr` : 'N/A', col: '#FBBF24' },
    { label: 'Remote Viability', value: REMOTE_LABELS[career.remoteViable], col: REMOTE_COLORS[career.remoteViable] },
    { label: 'Education Required', value: EDUCATION_LABELS[career.educationRequired] || career.educationRequired, col: '#9090AA' },
    { label: 'AI Automation Risk (D1)', value: career.automationD1 !== null ? `${Math.round(career.automationD1)}%` : 'N/A', col: '#FF4757' },
    { label: 'AI Augmentation (D3)', value: career.augmentationD3 !== null ? `${Math.round(career.augmentationD3)}%` : 'N/A', col: '#00F5FF' },
    { label: 'Structural Disruption (D2)', value: career.disruptionD2 !== null ? `${Math.round(career.disruptionD2 ?? 0)}%` : 'N/A', col: '#FBBF24' },
  ];

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #0d0d2e 0%, #0a0a20 100%)',
          width: 460, maxWidth: '100%', padding: 0, overflowY: 'auto',
          borderLeft: '1px solid rgba(0,245,255,0.15)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Drawer header */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${safetyColor}88, ${safetyColor})` }} />
        <div style={{ padding: '24px 28px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, fontSize: '1.6rem',
                background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${safetyColor}33`,
              }}>
                {INDUSTRY_ICONS[career.industryKey] || '🏢'}
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#9090AA', marginBottom: 2, letterSpacing: '0.05em' }}>{career.industryLabel}</div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{career.roleTitle}</h2>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#9090AA', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', fontSize: '0.85rem' }}>✕</button>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {career.riskScore <= 15 && <span style={{ background: 'rgba(0,255,159,0.12)', color: '#00FF9F', fontSize: '0.65rem', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>⭐ SAFEST TIER</span>}
            {career.isSmeStable === 1 && <span style={{ background: 'rgba(124,58,255,0.15)', color: '#9F6EFF', fontSize: '0.65rem', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>🏢 SME STABLE</span>}
            {(career.growthProjection ?? 0) >= 15 && <span style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', fontSize: '0.65rem', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>🚀 FAST GROWTH</span>}
          </div>

          {/* Safety ring + overall score */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '16px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, marginBottom: 24, border: `1px solid ${safetyColor}22` }}>
            <SafetyRing score={career.riskScore} size={80} />
            <div>
              <div style={{ fontSize: '0.68rem', color: '#9090AA', marginBottom: 4 }}>OVERALL SAFETY SCORE</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: safetyColor, fontFamily: 'var(--mono)', lineHeight: 1 }}>{100 - career.riskScore}</div>
              <div style={{ fontSize: '0.78rem', color: '#9090AA', marginTop: 4 }}>
                {career.riskScore <= 15 ? 'Extremely Future-Proof' : career.riskScore <= 30 ? 'Very Safe' : career.riskScore <= 45 ? 'Moderately Safe' : 'Monitor Closely'}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {stats.map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.025)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.82rem', color: '#9090AA' }}>{s.label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: s.col }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* AI dimension bars */}
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.025)', borderRadius: 14, marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.68rem', color: '#9090AA', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Impact Analysis</div>
            <AiRiskBar label="🤖 AI Automation Risk (D1)" value={career.automationD1} color="#FF4757" />
            <div style={{ marginTop: 8 }}><AiRiskBar label="📉 Structural Disruption (D2)" value={career.disruptionD2} color="#FBBF24" /></div>
            <div style={{ marginTop: 8 }}><AiRiskBar label="🔮 AI Augmentation Potential (D3)" value={career.augmentationD3} color="#00F5FF" /></div>
            <div style={{ marginTop: 12, fontSize: '0.65rem', color: '#9090AA', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
              D1 = Task automation odds · D2 = Business model disruption · D3 = How much AI enhances 
              output for this role. Source: BLS O*NET + OSINT Modeling 2024.
            </div>
          </div>

          {/* SME Stability insight */}
          {career.isSmeStable === 1 && career.smeStabilityReason && (
            <div style={{ padding: '14px', background: 'rgba(124,58,255,0.08)', borderRadius: 12, border: '1px solid rgba(124,58,255,0.2)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.68rem', color: '#9F6EFF', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>🏢 SME Stability Insight</div>
              <p style={{ fontSize: '0.85rem', color: '#E8E8F0', lineHeight: 1.6 }}>{career.smeStabilityReason}</p>
            </div>
          )}

          {/* Safety reason */}
          {career.safetyReason && (
            <div style={{ padding: '14px', background: 'rgba(0,245,255,0.05)', borderRadius: 12, border: '1px solid rgba(0,245,255,0.12)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.68rem', color: '#00F5FF', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>🛡️ Why It's Future-Proof</div>
              <p style={{ fontSize: '0.85rem', color: '#E8E8F0', lineHeight: 1.6 }}>{career.safetyReason}</p>
            </div>
          )}

          {/* External links */}
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={blsLink} target="_blank" rel="noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)',
                borderRadius: 10, color: '#00F5FF', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
              }}
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={13} /> BLS Data
            </a>
            <button
              onClick={e => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'learning-hub', params: { roleKey: career.roleKey } } })); }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px', background: 'linear-gradient(135deg, rgba(124,58,255,0.2), rgba(0,245,255,0.12))',
                border: '1px solid rgba(124,58,255,0.3)', borderRadius: 10, color: 'white',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <BookOpen size={13} /> Learning Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export function SafeCareersPage() {
  const { state } = useHumanProof();
  const [careers, setCareers] = useState<SafeCareer[]>([]);
  const [industries, setIndustries] = useState<{ key: string; label: string }[]>([]);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, industry: state.industry || '' });
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SafeCareer | null>(null);
  const [headerStats, setHeaderStats] = useState({ total: 0, avgSalary: 0, topSector: '' });
  const LIMIT = 20;

  const activeFilterCount = [
    filters.industry, filters.remote, filters.education,
  ].filter(Boolean).length + (filters.isSmeStable ? 1 : 0) + (filters.minGrowth > 0 ? 1 : 0) + (filters.maxRisk < 50 ? 1 : 0);

  const buildQuery = useCallback((f: Filters, off: number) => {
    const p = new URLSearchParams();
    if (f.industry) p.set('industry', f.industry);
    if (f.remote) p.set('remote', f.remote);
    if (f.education) p.set('education', f.education);
    if (f.isSmeStable) p.set('isSmeStable', 'true');
    if (f.q) p.set('q', f.q);
    p.set('maxRisk', String(f.maxRisk));
    p.set('minGrowth', String(f.minGrowth));
    p.set('sort', f.sort);
    p.set('limit', String(LIMIT));
    p.set('offset', String(off));
    return p.toString();
  }, []);

  const fetchCareers = useCallback(async (f: Filters, off: number) => {
    setLoading(true); setError(null);
    try {
      const resp = await fetch(`/api/safe-careers?${buildQuery(f, off)}`);
      if (!resp.ok) { const j = await resp.json().catch(() => ({})); throw new Error(j.error || 'Failed'); }
      const json = await resp.json();
      if (off === 0) setCareers(json.data);
      else setCareers(prev => [...prev, ...json.data]);
      setTotal(json.pagination.total);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [buildQuery]);

  const fetchStats = useCallback(async () => {
    try {
      // BUG-006 FIX: Use dedicated stats endpoint instead of fetching 200 records
      const resp = await fetch('/api/safe-careers/stats');
      if (!resp.ok) return;
      const json = await resp.json();
      setHeaderStats({ total: json.total, avgSalary: json.avgSalaryK, topSector: json.topSector });
    } catch {}
  }, []);

  useEffect(() => {
    fetch('/api/safe-careers/industries').then(r => r.json()).then(data => {
      setIndustries(data.map((r: any) => ({ key: r.key, label: r.label })));
    }).catch(() => {});
    fetchStats();
  }, [fetchStats]);

  useEffect(() => { setOffset(0); fetchCareers(filters, 0); }, [filters, fetchCareers]);

  const updateFilter = (patch: Partial<Filters>) => setFilters(p => ({ ...p, ...patch }));
  const loadMore = () => { const n = offset + LIMIT; setOffset(n); fetchCareers(filters, n); };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ padding: '48px 40px 40px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, rgba(124,58,255,0.06) 0%, transparent 100%)' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF9F', boxShadow: '0 0 8px #00FF9F', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.7rem', color: '#00F5FF', fontFamily: 'var(--mono)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Live Career Intelligence</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>
                Safe & Future-Proof<br />
                <span style={{ color: '#00F5FF' }}>Careers</span> for Every Workforce
              </h1>
              <p style={{ color: '#9090AA', fontSize: '0.95rem', maxWidth: 520, lineHeight: 1.7 }}>
                Roles with the lowest AI displacement risk through 2030+. Ranked by live safety signals across <strong style={{ color: '#00F5FF' }}>45+ industries</strong> and <strong style={{ color: '#00FF9F' }}>150+ career paths</strong>.
              </p>
            </div>

            {/* Live stats - uses real DB aggregate data */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: '🛡️', val: `${headerStats.total || 87}+`, label: 'Safe Roles' },
                { icon: '💰', val: `$${headerStats.avgSalary || 82}K`, label: 'Avg Salary' },
                { icon: '🚀', val: headerStats.topSector || 'Healthcare', label: 'Top Sector' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00F5FF', fontFamily: 'var(--mono)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.68rem', color: '#9090AA', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick sector chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {QUICK_SECTORS.map(s => (
              <button
                key={s.key}
                onClick={() => updateFilter({ industry: filters.industry === s.key ? '' : s.key })}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1px solid',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: filters.industry === s.key ? `${s.color}18` : 'rgba(255,255,255,0.04)',
                  borderColor: filters.industry === s.key ? s.color : 'rgba(255,255,255,0.1)',
                  color: filters.industry === s.key ? s.color : '#9090AA',
                }}
              >{s.label}</button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9090AA', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search roles, industries, skills…"
              value={filters.q}
              onChange={e => updateFilter({ q: e.target.value })}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,245,255,0.15)',
                borderRadius: 14, padding: '14px 18px 14px 44px', color: 'white',
                fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#00F5FF')}
              onBlur={e => (e.target.style.borderColor = 'rgba(0,245,255,0.15)')}
            />
            {filters.q && (
              <button onClick={() => updateFilter({ q: '' })} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9090AA', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Filter sidebar (sticky) */}
        <div style={{ position: 'sticky', top: 90, zIndex: 10 }}>
          <FilterPanel
            filters={filters}
            industries={industries}
            onChange={updateFilter}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            activeCount={activeFilterCount}
          />
        </div>

        {/* Results column */}
        <div>
          {/* Results header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 2px' }}>
            <span style={{ color: '#9090AA', fontSize: '0.85rem' }}>
              {loading ? 'Loading…' : (
                <><span style={{ color: '#00F5FF', fontWeight: 700 }}>{total}</span> career{total !== 1 ? 's' : ''} found</>
              )}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#9090AA' }}>
              <Star size={11} style={{ color: '#FBBF24' }} /> BLS 2023–2033 Projections
            </span>
          </div>

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 20, marginBottom: 16 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
              <h3 style={{ color: '#FF4757', marginBottom: 8 }}>Service Unavailable</h3>
              <p style={{ color: '#9090AA', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>
              <button onClick={() => fetchCareers(filters, 0)} style={{ background: '#FF4757', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && careers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Shield size={40} style={{ color: '#9090AA', marginBottom: 16, opacity: 0.4 }} />
              <div style={{ fontSize: '1.1rem', color: 'white', fontWeight: 700, marginBottom: 8 }}>No careers match your filters</div>
              <p style={{ color: '#9090AA', fontSize: '0.85rem', marginBottom: 20 }}>Try increasing the Max Risk Score or clearing sector filters.</p>
              <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 10, padding: '10px 24px', color: '#00F5FF', cursor: 'pointer', fontWeight: 600 }}>Reset All Filters</button>
            </div>
          )}

          {/* Career list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {careers.map(c => <CareerCard key={c.id} career={c} onSelect={setSelected} />)}
          </div>

          {/* Skeleton loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-loader" style={{ height: 140, borderRadius: 18 }} />
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && careers.length < total && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={loadMore} style={{
                background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)',
                borderRadius: 12, padding: '12px 36px', color: '#00F5FF', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
              }}>
                <ArrowRight size={14} /> Load {Math.min(LIMIT, total - careers.length)} more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Research footnote */}
      <div style={{ textAlign: 'center', padding: '24px 40px 48px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: 30, padding: '8px 20px' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00FF9F', boxShadow: '0 0 6px #00FF9F' }} />
          <span style={{ fontSize: '0.7rem', color: '#9090AA', letterSpacing: '0.05em' }}>
            Data sourced from <strong style={{ color: '#00F5FF' }}>BLS Occupational Outlook Handbook 2023–2033</strong>,{' '}
            <strong style={{ color: '#00F5FF' }}>O*NET Online</strong>, and{' '}
            <strong style={{ color: '#00F5FF' }}>HumanProof OSINT Modeling</strong> · Assessments are probabilistic projections, not guarantees.
          </span>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && <DetailDrawer career={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
=======
};
>>>>>>> audit-fixes-2026-04-07
