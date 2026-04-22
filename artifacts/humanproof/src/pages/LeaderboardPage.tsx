// LeaderboardPage.tsx
// Public industry risk leaderboard — no auth required.
// Route: /leaderboard
// Data sourced from useIndustryLeaderboard() which enriches from Supabase + layoffs.fyi.

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart2, Loader2, RefreshCw } from "lucide-react";
import { useIndustryLeaderboard } from "../services/industryLeaderboard";
import type { RoleRiskEntry } from "../services/industryLeaderboard";

// ── Risk bar ─────────────────────────────────────────────────────────────────

const RiskBar: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 70 ? "bg-red-500" : score >= 45 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
};

// ── Trend icon ────────────────────────────────────────────────────────────────

const TrendIcon: React.FC<{ trend: RoleRiskEntry["trend"] }> = ({ trend }) => {
  if (trend === "rising")  return <TrendingUp  className="w-4 h-4 text-red-400"     aria-label="Rising" />;
  if (trend === "falling") return <TrendingDown className="w-4 h-4 text-emerald-400" aria-label="Falling" />;
  return <Minus className="w-4 h-4 text-muted-foreground" aria-label="Stable" />;
};

// ── Role card ─────────────────────────────────────────────────────────────────

const RoleCard: React.FC<{ entry: RoleRiskEntry; delay: number }> = ({ entry, delay }) => {
  const scoreColor =
    entry.riskScore >= 70 ? "text-red-400" :
    entry.riskScore >= 45 ? "text-amber-400" : "text-emerald-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-muted-foreground opacity-50">#{entry.rank}</span>
            <span className="font-bold text-sm truncate">{entry.roleTitle}</span>
            {entry.badgeLabel && (
              <span className="text-[9px] font-black bg-white/10 border border-white/15 px-1.5 py-0.5 rounded whitespace-nowrap">
                {entry.badgeLabel}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{entry.industry}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <TrendIcon trend={entry.trend} />
          <span className={`text-xl font-black tabular-nums ${scoreColor}`}>
            {entry.riskScore}
          </span>
        </div>
      </div>

      <RiskBar score={entry.riskScore} />

      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">AI Displacement</div>
          <div className="text-xs font-bold">{entry.aiDisplacementPct}%</div>
        </div>
        <div className="text-center border-x border-white/10">
          <div className="text-[10px] text-muted-foreground">Layoffs (180d)</div>
          <div className="text-xs font-bold">{entry.confirmedLayoffs180d.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground">Sample</div>
          <div className="text-xs font-bold">{entry.sampleSize.toLocaleString()}</div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Section ───────────────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  subtitle: string;
  entries: RoleRiskEntry[];
  startDelay?: number;
}> = ({ title, subtitle, entries, startDelay = 0 }) => (
  <div>
    <div className="mb-4">
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map((e, i) => (
        <RoleCard key={`${e.roleTitle}-${e.rank}`} entry={e} delay={startDelay + i * 0.06} />
      ))}
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const LeaderboardPage: React.FC = () => {
  const { board, loading } = useIndustryLeaderboard();
  const [tab, setTab] = useState<"atRisk" | "safe" | "rising">("atRisk");

  const tabs = [
    { key: "atRisk" as const,  label: "Most At Risk",      count: board?.topAtRisk.length },
    { key: "safe"  as const,   label: "Safest Roles",      count: board?.safestRoles.length },
    { key: "rising" as const,  label: "Fastest Rising",    count: board?.fastestRisingRisk.length },
  ];

  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="leaderboard-hero">
        <div className="container" style={{ maxWidth: 1100 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(0,213,224,0.08)', border: '1px solid rgba(0,213,224,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={20} style={{ color: 'var(--cyan)' }} />
              </div>
              <span className="badge badge-cyan">
                AI Risk Index {board?.quarter ?? "Q1 2026"}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '12px', color: 'var(--text)' }}>
              {board?.title ?? "Industry Risk Index"}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', maxWidth: 600, lineHeight: 1.65 }}>
              {board?.subtitle ?? "Live AI displacement signals, confirmed layoff data, and 25,000+ HumanProof audits — updated daily."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: 1100, paddingTop: '40px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '80px 0', color: 'var(--text-3)' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.875rem' }}>Loading leaderboard data…</span>
          </div>
        ) : !board ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)' }}>
            <BarChart2 size={36} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
            <p>Failed to load leaderboard. Please try again.</p>
            <button onClick={() => window.location.reload()} className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Segment tabs */}
            <div className="tabs-wrap no-scrollbar" style={{ marginBottom: '32px', width: 'fit-content' }}>
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                >
                  {t.label}
                  {t.count != null && (
                    <span style={{ marginLeft: '6px', fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Active section */}
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "atRisk" && (
                <Section title="Most At-Risk Roles" subtitle="Roles facing highest AI displacement pressure and confirmed layoff activity" entries={board.topAtRisk} />
              )}
              {tab === "safe" && (
                <Section title="Safest Roles" subtitle="Roles with strong human moats, low AI substitution, and rising demand" entries={board.safestRoles} startDelay={0.1} />
              )}
              {tab === "rising" && (
                <Section title="Fastest Rising Risk" subtitle="Roles where AI disruption is accelerating most rapidly quarter-over-quarter" entries={board.fastestRisingRisk} startDelay={0.1} />
              )}
            </motion.div>

            {/* Footer meta */}
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                Last updated: {new Date(board.generatedAt).toLocaleDateString()} · Data refreshes daily
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                <RefreshCw size={13} />
                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
