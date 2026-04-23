// RiskBreakdownTab.tsx
// Detailed breakdown of risk dimensions — Answers "What dimensions are driving my risk?"
// Displays: 5/6 dimension score cards with narratives, radar, confidence interval,
//           key risk drivers, and data quality metrics.

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, BarChart, Clock, Activity, CheckSquare,
  TrendingUp, TrendingDown, DollarSign, Shield, Cpu,
  Globe, Briefcase, Users, Zap,
} from "lucide-react";
import { DimensionRadar } from "@/components/DimensionRadar";
import { KeyRiskDriversPanel } from "@/components/LayoffCalculator/KeyRiskDriversPanel";
import { StatCard } from "./common/StatCard";
import { SectionHeader } from "./common/SectionHeader";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import type { TabProps } from "./common/types";

// ---------------------------------------------------------------------------
// Dimension metadata — labels + weights + narrative generators
// ---------------------------------------------------------------------------

const getScoreColor = (score: number): string => {
  if (score < 30) return "var(--emerald)";
  if (score < 45) return "var(--green)";
  if (score < 60) return "var(--amber)";
  if (score < 75) return "var(--orange)";
  return "var(--red)";
};

interface DimMeta {
  label: string;
  fullLabel: string;
  weight: number;
  icon: React.ComponentType<{ className?: string }>;
  narrativeLow: string;
  narrativeMid: string;
  narrativeHigh: string;
}

const L_DIMENSIONS: Record<string, DimMeta> = {
  L1: {
    label: "Financial Health",
    fullLabel: "Company Financial Vulnerability",
    weight: 0.30,
    icon: DollarSign,
    narrativeLow:  "Company financials are stable. Revenue per employee, growth trajectory, and cash position are within healthy bounds for the sector.",
    narrativeMid:  "Moderate financial stress detected. Revenue deceleration or elevated cost ratios suggest near-term cost-containment pressure.",
    narrativeHigh: "Significant financial distress signals present. Revenue contraction, high burn rate, or unfavorable efficiency ratios indicate restructuring risk within 12 months.",
  },
  L2: {
    label: "Layoff History",
    fullLabel: "Layoff & Workforce Instability",
    weight: 0.25,
    icon: Users,
    narrativeLow:  "No material layoff history in the 24-month window. Workforce stability is a positive retention signal.",
    narrativeMid:  "One documented workforce reduction on record. Single events carry ~60% base rate for a follow-up within 9 months.",
    narrativeHigh: "Repeated workforce reductions detected. Chronic restructuring patterns significantly elevate individual-level displacement probability.",
  },
  L3: {
    label: "Role Displacement",
    fullLabel: "AI Role Displacement Risk",
    weight: 0.20,
    icon: Cpu,
    narrativeLow:  "Your role has strong structural protection against AI displacement. Human judgment, trust, and cross-context reasoning are core to value delivery.",
    narrativeMid:  "Moderate AI exposure in your role category. The execution layer is being augmented by AI, but oversight and strategy functions remain human-native.",
    narrativeHigh: "High task automatability in your role. AI tools are actively absorbing execution-layer work in this function across the market.",
  },
  L4: {
    label: "Industry Risk",
    fullLabel: "Industry & Market Headwinds",
    weight: 0.12,
    icon: BarChart,
    narrativeLow:  "Your industry sector has below-average AI disruption velocity and positive employment growth outlook.",
    narrativeMid:  "Sector-level AI adoption is accelerating at a moderate pace. Some functions are being consolidated across the industry.",
    narrativeHigh: "High sector AI adoption rate. Your industry is experiencing above-average workforce rationalization as AI tools mature.",
  },
  L5: {
    label: "Regional Risk",
    fullLabel: "Regional & Macro Headwinds",
    weight: 0.13,
    icon: Globe,
    narrativeLow:  "Your geographic market has a favorable labor demand profile and moderate AI adoption pace relative to global peers.",
    narrativeMid:  "Regional labor market conditions present moderate headwinds — some demand softness or above-average tech-sector job cuts in your region.",
    narrativeHigh: "Elevated regional risk: high AI adoption rate, labor market softness, or sector concentration that amplifies displacement probability in your geography.",
  },
};

const D_DIMENSIONS: Record<string, DimMeta> = {
  D1: {
    label: "Task Automatability",
    fullLabel: "Task Automatability Score",
    weight: 0.35,
    icon: Cpu,
    narrativeLow:  "Less than 30% of your daily tasks can be fully automated by current AI systems. High judgment and context requirements protect your work.",
    narrativeMid:  "Roughly 40–60% of task volume is automatable with enterprise AI today. Protecting the judgment and synthesis layer is key.",
    narrativeHigh: "Over 65% of your task portfolio is automatable with current-generation AI. This is the primary driver of your risk score.",
  },
  D2: {
    label: "AI Tool Maturity",
    fullLabel: "AI Tool Deployment Maturity",
    weight: 0.25,
    icon: Zap,
    narrativeLow:  "AI tools targeting this role are in early-stage or experimental deployment — not yet enterprise-ready at scale.",
    narrativeMid:  "AI tools for this role are in active but uneven deployment. Some organizations are using them; full saturation is 2–4 years away.",
    narrativeHigh: "Mature, enterprise-deployed AI tools are actively absorbing tasks in this role category across thousands of organizations today.",
  },
  D3: {
    label: "Human Amplification",
    fullLabel: "Human Amplification Value",
    weight: 0.15,
    icon: Users,
    narrativeLow:  "High human amplification — AI tools strongly benefit from human oversight, empathy, and contextual judgment in this role. Low automation risk.",
    narrativeMid:  "Moderate human value-add. Some functions benefit from human oversight, but significant task volume can proceed without it.",
    narrativeHigh: "Low human amplification advantage. AI systems can operate many functions in this role with minimal human intervention.",
  },
  D4: {
    label: "Experience Shield",
    fullLabel: "Experience & Seniority Shield",
    weight: 0.10,
    icon: Shield,
    narrativeLow:  "Strong experience protection. Seniority, track record, and accumulated institutional knowledge provide significant displacement buffering.",
    narrativeMid:  "Moderate experience shield. Some protection from seniority, but execution-layer skills that AI targets may offset the advantage.",
    narrativeHigh: "Experience shield is limited for this role at your level. AI displacement risk applies regardless of tenure in execution-heavy functions.",
  },
  D5: {
    label: "Country Exposure",
    fullLabel: "Country AI Adoption Exposure",
    weight: 0.08,
    icon: Globe,
    narrativeLow:  "Your country/region has moderate AI adoption pace — below the global vanguard, providing a relative time buffer.",
    narrativeMid:  "Your region is at the median of global AI adoption. No material amplification or dampening of global displacement trends.",
    narrativeHigh: "Your country is a high-velocity AI adopter. The local labor market is experiencing above-average AI-driven role restructuring.",
  },
  D6: {
    label: "Social Capital",
    fullLabel: "Social Capital & Network Moat",
    weight: 0.07,
    icon: Briefcase,
    narrativeLow:  "Strong network and stakeholder relationships provide meaningful protection — jobs are filled through warm referrals during downturns.",
    narrativeMid:  "Moderate professional network. Some insulation from relationships, but network density is below the level needed for proactive protection.",
    narrativeHigh: "Limited social capital signal for this role. Network moats are weak — active relationship building should be prioritized.",
  },
};

const getDimMeta = (key: string): DimMeta | null =>
  L_DIMENSIONS[key] ?? D_DIMENSIONS[key] ?? null;

const getNarrative = (meta: DimMeta, score: number): string => {
  if (score < 35) return meta.narrativeLow;
  if (score < 65) return meta.narrativeMid;
  return meta.narrativeHigh;
};

// ---------------------------------------------------------------------------
// LayerScoreCard — enhanced with narrative and change indicators
// ---------------------------------------------------------------------------

interface LayerScoreCardProps {
  dim: { key: string; label: string; score: number };
  weights: Record<string, number>;
}

const LayerScoreCard: React.FC<LayerScoreCardProps> = ({ dim, weights }) => {
  const meta = getDimMeta(dim.key);
  const weight = weights[dim.key] ?? 0;
  const score = dim.score; // 0–100
  const color = getScoreColor(score);
  const weightPct = Math.round(weight * 100);
  const contribution = Math.round((score / 100) * weight * 100);
  const narrative = meta ? getNarrative(meta, score) : null;
  const Icon = meta?.icon ?? Activity;

  const verdictLabel = score < 35 ? "PROTECTED" : score < 65 ? "MODERATE" : "ELEVATED";
  const verdictColor = score < 35 ? "var(--emerald)" : score < 65 ? "var(--amber)" : "var(--red)";

  return (
    <div
      className="layer-score-card glass-panel group transition-all duration-300 hover:border-[var(--border-cyan)]"
      style={{
        display: "flex", flexDirection: "column",
        padding: "var(--space-5)", borderRadius: "var(--radius-lg)", gap: "var(--space-3)",
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <div className="label-xs text-muted-foreground flex items-center gap-[var(--space-2)]">
            <span style={{ backgroundColor: `${color}22`, color, padding: "2px 8px", borderRadius: "var(--radius-sm)", fontWeight: 800, fontSize: "9px" }}>
              {dim.key}
            </span>
            <span className="font-semibold">{meta?.fullLabel ?? dim.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <div className="text-2xl font-black tracking-tighter" style={{ color }}>{score}</div>
            <span className="text-xs text-muted-foreground font-mono">/100</span>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded ml-1"
              style={{ background: `${verdictColor}15`, color: verdictColor, border: `1px solid ${verdictColor}30` }}
            >
              {verdictLabel}
            </span>
          </div>
        </div>
        <div className="p-[var(--space-2)] rounded-full bg-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Bar */}
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}44` }}
        />
      </div>

      {/* Weight + contribution */}
      <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider">
        <span className="text-muted-foreground">Weight <span className="text-[var(--text)] ml-1">{weightPct}%</span></span>
        <span className="text-muted-foreground">Contribution <span className="ml-1 font-bold" style={{ color }}>+{contribution} pts</span></span>
      </div>

      {/* Narrative */}
      {narrative && (
        <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-white/5 pt-3 mt-1">
          {narrative}
        </p>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Score Summary Banner
// ---------------------------------------------------------------------------

const ScoreSummaryBanner: React.FC<{ result: TabProps["result"] }> = ({ result }) => {
  const dims = result.dimensions;
  const topRisk = [...dims].sort((a, b) => b.score - a.score)[0];
  const topProtective = [...dims].sort((a, b) => a.score - b.score)[0];
  const topRiskMeta = topRisk ? getDimMeta(topRisk.key) : null;
  const topProtMeta = topProtective ? getDimMeta(topProtective.key) : null;

  if (!topRisk || !topProtective) return null;

  return (
    <div className="grid md:grid-cols-2 gap-3 mb-6">
      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Primary Risk Driver</div>
          <div className="text-sm font-bold">{topRiskMeta?.fullLabel ?? topRisk.label} — {topRisk.score}/100</div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {topRiskMeta ? getNarrative(topRiskMeta, topRisk.score) : "Highest-scoring dimension in your profile."}
          </p>
        </div>
      </div>
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
        <TrendingDown className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Strongest Protection</div>
          <div className="text-sm font-bold">{topProtMeta?.fullLabel ?? topProtective.label} — {topProtective.score}/100</div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {topProtMeta ? getNarrative(topProtMeta, topProtective.score) : "Lowest-scoring (most protected) dimension."}
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Score Confidence Interval display
// ---------------------------------------------------------------------------

const ScoreConfidenceInterval: React.FC<{
  score: number;
  confidenceInterval: { low: number; high: number };
  confidencePercent: number;
}> = ({ score, confidenceInterval, confidencePercent }) => {
  const { low, high } = confidenceInterval;
  const range = high - low;
  const color = getScoreColor(score / 100);

  return (
    <div className="glass-panel-heavy p-[var(--space-6)] rounded-xl border border-[var(--border-2)]">
      <div className="flex justify-between items-center mb-[var(--space-6)]">
        <div className="label-sm text-[var(--cyan)] tracking-[0.2em] font-black uppercase">Certainty Calibration</div>
        <div className="px-[var(--space-2)] py-1 bg-white/5 rounded text-[10px] font-mono text-muted-foreground">
          {confidencePercent}% CONFIDENCE
        </div>
      </div>

      <div className="h-12 relative flex items-center mb-6 px-1">
        <div className="w-full bg-white/5 h-1.5 rounded-full relative">
          <motion.div
            className="absolute h-full rounded-full"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{ left: `${low}%`, width: `${range}%`, backgroundColor: `${color}33`, originX: 0 }}
          />
          <div className="absolute h-6 w-[1px]" style={{ left: `${low}%`, top: "-10px", backgroundColor: "var(--border-2)" }}>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-muted-foreground">{low}%</div>
          </div>
          <div className="absolute h-6 w-[1px]" style={{ left: `${high}%`, top: "-10px", backgroundColor: "var(--border-2)" }}>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-muted-foreground">{high}%</div>
          </div>
          <motion.div
            className="absolute h-8 w-1 flex flex-col items-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: "spring" }}
            style={{ left: `${score}%`, top: "-12px", transform: "translateX(-50%)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff] mb-1" />
            <div className="w-[2px] h-full bg-white/80" />
            <div className="mt-2 font-black text-xs" style={{ color }}>{score}%</div>
          </motion.div>
        </div>
      </div>

      {range > 30 ? (
        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-amber-200/70">
            <strong>Ambiguity Warning:</strong> Dimensional signal variance exceeds 30pts ({low}–{high}). Human-in-the-loop validation of the highest-scoring dimensions is recommended before acting.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-start gap-3">
          <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-emerald-200/70">
            <strong>Signal Convergence:</strong> Tight confidence interval ({low}–{high}) indicates high internal consistency across all risk vectors. Score is stable at {confidencePercent}% confidence.
          </p>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Risk Dimension Trend Section (if riskTrend available)
// ---------------------------------------------------------------------------

const RiskTrendSection: React.FC<{ result: TabProps["result"] }> = ({ result }) => {
  const trend = result.riskTrend;
  if (!trend || trend.length < 2) return null;

  return (
    <div className="glass-panel p-5 rounded-xl mt-6">
      <div className="label-xs text-muted-foreground uppercase tracking-widest mb-4">Risk Trajectory</div>
      <div className="flex items-end gap-3 h-16">
        {trend.map((t, i) => {
          const val = t.score ?? (t as any).riskScore ?? 50;
          const color = getScoreColor(val / 100);
          const heightPct = Math.max(10, Math.min(100, val));
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="text-[10px] font-black font-mono" style={{ color }}>{val}%</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                className="w-full rounded-t-sm"
                style={{ background: `${color}44`, border: `1px solid ${color}66`, maxHeight: "48px", minHeight: "4px" }}
              />
              <div className="text-[9px] text-muted-foreground font-mono">{t.year}</div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        Projected risk trajectory if current role trajectory continues without strategic intervention.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// RiskBreakdownTab main component
// ---------------------------------------------------------------------------

export const RiskBreakdownTab: React.FC<TabProps> = ({ result, companyData }) => {
  const { width } = useAdaptiveSystem();
  const isMobile = width < 768;

  const isOracle = result.dimensions.some(d => d.key.startsWith("D"));

  const weights = isOracle
    ? { D1: 0.35, D2: 0.25, D3: 0.15, D4: 0.10, D5: 0.08, D6: 0.07 }
    : { L1: 0.30, L2: 0.25, L3: 0.20, L4: 0.12, L5: 0.13 };

  const radarDimensions = useMemo(() =>
    result.dimensions.map(dim => {
      const meta = getDimMeta(dim.key);
      return { key: dim.key, label: meta?.label ?? dim.label, score: dim.score };
    }),
    [result.dimensions],
  );

  const dataQualityLabel = result.signalQuality.liveSignals > 12
    ? "live" as const
    : result.signalQuality.liveSignals > 5
      ? "partial" as const
      : "fallback" as const;

  return (
    <section aria-labelledby="risk-breakdown-heading" className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* ── Primary / Protective driver summary ── */}
        <ScoreSummaryBanner result={result} />

        {/* ── Dimension Score Cards ── */}
        <div className="mb-6">
          <SectionHeader
            title="Risk Dimension Breakdown"
            description={`Your risk score of ${result.total}/100 is calculated across ${result.dimensions.length} weighted dimensions. Each card shows the raw score, contribution to total, and a data-grounded narrative explaining what's driving that dimension.`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.dimensions.map(dim => (
              <LayerScoreCard key={dim.key} dim={dim} weights={weights} />
            ))}
          </div>
        </div>

        {/* ── Radar + Confidence ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col">
            <SectionHeader
              title="Dimension Radar"
              description="Each axis = one risk dimension. Larger filled area = higher overall risk. Asymmetric shapes indicate where to focus intervention."
            />
            <div className="flex-1 flex items-center justify-center p-4">
              <DimensionRadar
                dimensions={radarDimensions}
                size={isMobile ? 260 : 310}
                color="var(--cyan)"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <SectionHeader
              title="Confidence Calibration"
              description="True risk range based on data completeness and signal coherence. Narrow range = reliable score. Wide range = act with caution."
            />
            <div className="flex-1">
              <ScoreConfidenceInterval
                score={result.total}
                confidenceInterval={result.confidenceInterval}
                confidencePercent={result.confidencePercent}
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="glass-panel p-4 rounded-lg">
                  <StatCard label="Signal Freshness" value={`${result.dataFreshness.ageInDays}d avg`} icon={Clock} />
                </div>
                <div className="glass-panel p-4 rounded-lg">
                  <StatCard label="Live Signals" value={`${result.signalQuality.liveSignals} / 17`} icon={Activity} />
                </div>
              </div>

              {/* Risk trend if available */}
              <RiskTrendSection result={result} />
            </div>
          </div>
        </div>

        {/* ── Key Risk Drivers — open by default ── */}
        <div className="mb-6">
          <SectionHeader
            title="Key Risk Drivers Analysis"
            description="The top signals contributing most to your score, classified as verified Facts, analytical Inferences, or forward-looking Predictions."
          />
          <KeyRiskDriversPanel
            breakdown={result.breakdown}
            roleTitle={result.workTypeKey}
            companyName={result.companyName ?? ""}
            dataQuality={dataQualityLabel}
          />
        </div>

      </motion.div>
    </section>
  );
};

export default RiskBreakdownTab;
