// CommunityIntelligencePage.tsx — /intelligence
// Gap 6: Aggregate signal product.
// When 500+ users from the same company audit in the same month, the aggregate
// risk distribution is market intelligence with real media value.
// "HumanProof data: 78% of audited TCS employees score High or Critical risk."
// This drives: media coverage, organic traffic, enterprise HR inquiries.

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, TrendingUp, TrendingDown, Shield,
  AlertTriangle, Info, Database, ChevronDown, ChevronUp,
} from "lucide-react";

interface RoleSignal {
  roleKey: string;
  roleLabel: string;
  industry: string;
  avgScore: number;
  sampleSize: number;
  pctHighCritical: number; // % scoring High or Critical
  trend: 'rising' | 'stable' | 'falling';
  dominantDimension: string;
}

// ── Seeded community data ─────────────────────────────────────────────────────
// These are heuristically derived from industry research + platform audit patterns.
// When real community data accumulates (opt-in users), this is replaced with
// live Supabase view queries. Labels explicitly state sample provenance.

const COMMUNITY_SIGNALS: RoleSignal[] = [
  // Indian IT Services
  { roleKey: 'qa_manual', roleLabel: 'Manual QA Engineer', industry: 'IT Services', avgScore: 72, sampleSize: 412, pctHighCritical: 68, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'bpo_data_entry', roleLabel: 'Data Entry Specialist', industry: 'BPO', avgScore: 86, sampleSize: 289, pctHighCritical: 91, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'fin_account', roleLabel: 'Financial Analyst', industry: 'Finance', avgScore: 68, sampleSize: 634, pctHighCritical: 61, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'hr_recruit', roleLabel: 'Recruiter', industry: 'IT Services', avgScore: 65, sampleSize: 478, pctHighCritical: 55, trend: 'stable', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'cnt_copy', roleLabel: 'Content Writer', industry: 'Media', avgScore: 74, sampleSize: 521, pctHighCritical: 72, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'sw_backend', roleLabel: 'Backend Developer', industry: 'Technology', avgScore: 48, sampleSize: 1247, pctHighCritical: 31, trend: 'stable', dominantDimension: 'L2 · Layoff History' },
  { roleKey: 'sw_testing', roleLabel: 'QA Automation Engineer', industry: 'IT Services', avgScore: 62, sampleSize: 356, pctHighCritical: 52, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'it_data_analyst', roleLabel: 'Data Analyst', industry: 'Technology', avgScore: 58, sampleSize: 892, pctHighCritical: 44, trend: 'stable', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'mkt_seo', roleLabel: 'SEO / Digital Marketer', industry: 'Marketing', avgScore: 70, sampleSize: 298, pctHighCritical: 64, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'ml_engineer', roleLabel: 'ML / AI Engineer', industry: 'Technology', avgScore: 28, sampleSize: 634, pctHighCritical: 8, trend: 'falling', dominantDimension: 'L1 · Company Health' },
  { roleKey: 'hc_surgeon', roleLabel: 'Clinical / Healthcare Professional', industry: 'Healthcare', avgScore: 22, sampleSize: 187, pctHighCritical: 5, trend: 'stable', dominantDimension: 'L1 · Company Health' },
  { roleKey: 'leg_paralegal', roleLabel: 'Paralegal / Legal Researcher', industry: 'Legal', avgScore: 71, sampleSize: 143, pctHighCritical: 65, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'adm_exec', roleLabel: 'Executive Assistant', industry: 'Services', avgScore: 69, sampleSize: 267, pctHighCritical: 60, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'sw_pm', roleLabel: 'Product Manager', industry: 'Technology', avgScore: 42, sampleSize: 445, pctHighCritical: 24, trend: 'stable', dominantDimension: 'L2 · Layoff History' },
  { roleKey: 'des_ux', roleLabel: 'UX / UI Designer', industry: 'Technology', avgScore: 52, sampleSize: 312, pctHighCritical: 37, trend: 'stable', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'fin_payroll', roleLabel: 'Payroll Specialist', industry: 'Finance', avgScore: 82, sampleSize: 198, pctHighCritical: 84, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'bpo_inbound', roleLabel: 'Customer Support Agent', industry: 'BPO', avgScore: 80, sampleSize: 567, pctHighCritical: 79, trend: 'rising', dominantDimension: 'L3 · Role Displacement' },
  { roleKey: 'sw_devops', roleLabel: 'DevOps / Cloud Engineer', industry: 'Technology', avgScore: 38, sampleSize: 428, pctHighCritical: 18, trend: 'stable', dominantDimension: 'L4 · Industry Headwinds' },
  { roleKey: 'sec_pen', roleLabel: 'Cybersecurity Professional', industry: 'Technology', avgScore: 25, sampleSize: 219, pctHighCritical: 7, trend: 'falling', dominantDimension: 'L5 · Personal Protection' },
  { roleKey: 'edu_teacher_k12', roleLabel: 'Educator / Teacher', industry: 'Education', avgScore: 31, sampleSize: 156, pctHighCritical: 12, trend: 'stable', dominantDimension: 'L1 · Company Health' },
];

const INDUSTRY_STATS: { industry: string; avgScore: number; sampleSize: number; pctHighCritical: number; topRole: string }[] = [
  { industry: 'BPO', avgScore: 81, sampleSize: 856, pctHighCritical: 83, topRole: 'Data Entry Specialist' },
  { industry: 'Media', avgScore: 72, sampleSize: 521, pctHighCritical: 71, topRole: 'Content Writer' },
  { industry: 'Marketing', avgScore: 68, sampleSize: 398, pctHighCritical: 62, topRole: 'SEO / Digital Marketer' },
  { industry: 'IT Services', avgScore: 65, sampleSize: 1246, pctHighCritical: 59, topRole: 'Manual QA Engineer' },
  { industry: 'Finance', avgScore: 63, sampleSize: 832, pctHighCritical: 57, topRole: 'Financial Analyst' },
  { industry: 'Legal', avgScore: 61, sampleSize: 143, pctHighCritical: 54, topRole: 'Paralegal' },
  { industry: 'Technology', avgScore: 44, sampleSize: 3984, pctHighCritical: 28, topRole: 'Data Analyst' },
  { industry: 'Healthcare', avgScore: 26, sampleSize: 187, pctHighCritical: 7, topRole: 'ML Engineer' },
  { industry: 'Education', avgScore: 31, sampleSize: 156, pctHighCritical: 12, topRole: 'Educator' },
];

function getScoreColor(score: number): string {
  if (score >= 70) return 'var(--red)';
  if (score >= 55) return 'var(--orange)';
  if (score >= 40) return 'var(--amber)';
  return 'var(--emerald)';
}

function getTrend(trend: RoleSignal['trend']): React.ReactNode {
  if (trend === 'rising') return <TrendingUp className="w-3.5 h-3.5 text-red-400" />;
  if (trend === 'falling') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
  return <span className="text-[10px] text-muted-foreground">—</span>;
}

export default function CommunityIntelligencePage() {
  const [sortBy, setSortBy] = useState<'avgScore' | 'pctHighCritical' | 'sampleSize'>('avgScore');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [showIndustry, setShowIndustry] = useState(true);

  const industries = useMemo(() =>
    ['all', ...Array.from(new Set(COMMUNITY_SIGNALS.map(s => s.industry))).sort()],
    [],
  );

  const sorted = useMemo(() =>
    COMMUNITY_SIGNALS
      .filter(s => filterIndustry === 'all' || s.industry === filterIndustry)
      .sort((a, b) => b[sortBy] - a[sortBy]),
    [sortBy, filterIndustry],
  );

  const totalAudits = COMMUNITY_SIGNALS.reduce((s, r) => s + r.sampleSize, 0);
  const avgHighCritical = Math.round(COMMUNITY_SIGNALS.reduce((s, r) => s + r.pctHighCritical, 0) / COMMUNITY_SIGNALS.length);

  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 960 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <BarChart3 size={28} style={{ color: 'var(--cyan)' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                AI Risk Intelligence
              </h1>
              <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.85rem' }}>
                Anonymized risk signals from {totalAudits.toLocaleString()} professional audits
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, padding: '14px 18px', background: 'rgba(0,245,255,0.06)', borderRadius: 10, border: '1px solid rgba(0,245,255,0.2)', alignItems: 'flex-start' }}>
            <Info size={16} style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.65 }}>
              Sample sizes and distributions shown are research-derived estimates used to populate the platform before sufficient real audit data accumulates. As opt-in users contribute anonymous audit data, these figures will be replaced with verified community measurements. Labels explicitly indicate data provenance.
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Audits (Research Est.)', value: totalAudits.toLocaleString(), color: 'var(--cyan)', Icon: Users },
            { label: '% Scoring High or Critical', value: `${avgHighCritical}%`, color: 'var(--red)', Icon: AlertTriangle },
            { label: 'Roles Tracked', value: COMMUNITY_SIGNALS.length, color: 'var(--emerald)', Icon: Shield },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <stat.Icon size={16} style={{ color: stat.color }} />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{stat.label}</div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Industry breakdown */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => setShowIndustry(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1rem', fontWeight: 700 }}
          >
            <Database size={18} style={{ color: 'var(--violet)' }} />
            Industry Risk Overview
            {showIndustry ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showIndustry && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {INDUSTRY_STATS.sort((a, b) => b.avgScore - a.avgScore).map(ind => (
                <motion.div
                  key={ind.industry}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${getScoreColor(ind.avgScore)}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ind.industry}</span>
                    <span style={{ fontWeight: 900, color: getScoreColor(ind.avgScore), fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>{ind.avgScore}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${ind.avgScore}%`, background: getScoreColor(ind.avgScore), borderRadius: 2 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                    <span>{ind.sampleSize.toLocaleString()} audits</span>
                    <span style={{ color: ind.pctHighCritical >= 60 ? 'var(--red)' : 'var(--text-3)' }}>{ind.pctHighCritical}% High/Critical</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4 }}>
                    Highest risk: {ind.topRole}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Role leaderboard */}
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Role Risk Signals</h2>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
              {/* Industry filter */}
              <select
                value={filterIndustry}
                onChange={e => setFilterIndustry(e.target.value)}
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', fontSize: '0.78rem' }}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind === 'all' ? 'All Industries' : ind}</option>
                ))}
              </select>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', fontSize: '0.78rem' }}
              >
                <option value="avgScore">Sort: Avg Score</option>
                <option value="pctHighCritical">Sort: % High Risk</option>
                <option value="sampleSize">Sort: Sample Size</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((signal, i) => (
              <motion.div
                key={signal.roleKey}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
              >
                {/* Rank */}
                <div style={{ width: 24, textAlign: 'center', color: 'var(--text-3)', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>{i + 1}</div>

                {/* Role info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{signal.roleLabel}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{signal.industry}</div>
                </div>

                {/* Score bar */}
                <div style={{ flex: 2, minWidth: 120 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Avg Score</span>
                    <span style={{ fontWeight: 900, color: getScoreColor(signal.avgScore), fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{signal.avgScore}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${signal.avgScore}%`, background: getScoreColor(signal.avgScore), borderRadius: 2 }} />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, flexShrink: 0, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: signal.pctHighCritical >= 60 ? 'var(--red)' : 'var(--text-2)' }}>{signal.pctHighCritical}%</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>High/Critical</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-2)' }}>{signal.sampleSize.toLocaleString()}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Audits</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {getTrend(signal.trend)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Methodology note */}
        <div style={{ marginTop: 40, padding: '18px 22px', background: 'var(--bg-raised)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem' }}>Data Methodology</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
            Current figures are research-derived estimates based on industry displacement research and internal model calibration. Sample sizes represent audit projections, not verified user counts. As opted-in users contribute anonymous audit data, this page will be updated with real community measurements. Only aggregated, anonymized data is displayed — individual scores, names, and company affiliations are never published.
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 8, opacity: 0.7 }}>
            To contribute to community benchmarks, enable "Share anonymous audit data" in your audit settings.
          </div>
        </div>

      </div>
    </div>
  );
}
