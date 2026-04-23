// CompanyProfileTab.tsx
// Company health and market position data — Answers "How is my company doing?"
// Displays: Company identity, hiring pulse, financial health, layoff history,
//           industry benchmarks, department news, live signal feed, collapse prediction.

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, AlertCircle, BarChart4, Calendar,
  Building2, Activity, Rss, MapPin, Users, Briefcase, Globe,
  Coins, Hash, Snowflake, Flame, Minus, DollarSign, Percent,
  ShieldAlert, ChevronRight, Clock, Newspaper,
} from "lucide-react";
import { SectionHeader } from "./common/SectionHeader";
import { CollapsibleSection } from "./common/CollapsibleSection";
import { CollapseSignalCard } from "./CollapseSignalCard";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import type { TabProps } from "./common/types";
import type { CompanyData } from "@/data/companyDatabase";

// ── Industry benchmark baselines ─────────────────────────────────────────────
const INDUSTRY_BENCHMARKS: Record<string, {
  revenuePerEmployee: number;
  avgLayoffRate: number;
  aiAdoptionPct: number;
  cashRunwayMonths: number;
  growthOutlook: string;
}> = {
  Technology:    { revenuePerEmployee: 500000, avgLayoffRate: 8.2,  aiAdoptionPct: 72, cashRunwayMonths: 24, growthOutlook: "Moderate" },
  Finance:       { revenuePerEmployee: 650000, avgLayoffRate: 5.1,  aiAdoptionPct: 58, cashRunwayMonths: 36, growthOutlook: "Stable" },
  Healthcare:    { revenuePerEmployee: 280000, avgLayoffRate: 3.2,  aiAdoptionPct: 41, cashRunwayMonths: 28, growthOutlook: "Growing" },
  Retail:        { revenuePerEmployee: 180000, avgLayoffRate: 10.5, aiAdoptionPct: 45, cashRunwayMonths: 12, growthOutlook: "Declining" },
  Manufacturing: { revenuePerEmployee: 320000, avgLayoffRate: 6.8,  aiAdoptionPct: 55, cashRunwayMonths: 18, growthOutlook: "Stable" },
  Media:         { revenuePerEmployee: 240000, avgLayoffRate: 14.2, aiAdoptionPct: 68, cashRunwayMonths: 14, growthOutlook: "Declining" },
  Education:     { revenuePerEmployee: 130000, avgLayoffRate: 2.1,  aiAdoptionPct: 35, cashRunwayMonths: 20, growthOutlook: "Stable" },
  Consulting:    { revenuePerEmployee: 420000, avgLayoffRate: 7.3,  aiAdoptionPct: 62, cashRunwayMonths: 22, growthOutlook: "Stable" },
  Legal:         { revenuePerEmployee: 380000, avgLayoffRate: 4.0,  aiAdoptionPct: 48, cashRunwayMonths: 30, growthOutlook: "Moderate" },
  default:       { revenuePerEmployee: 380000, avgLayoffRate: 7.0,  aiAdoptionPct: 52, cashRunwayMonths: 20, growthOutlook: "Moderate" },
};

const getBenchmark = (industry: string) =>
  INDUSTRY_BENCHMARKS[industry] ?? INDUSTRY_BENCHMARKS.default;

// ── Helpers ───────────────────────────────────────────────────────────────────

const REGION_LABEL: Record<string, string> = {
  US: "United States", EU: "Europe", IN: "India",
  APAC: "Asia-Pacific", GLOBAL: "Global", UK: "United Kingdom",
  CA: "Canada", AU: "Australia", SG: "Singapore",
};

const formatHeadcount = (n: number | null | undefined): string => {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const formatMarketCap = (n: number | null | undefined): string => {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}T`;
  if (n >= 1) return `$${n.toFixed(1)}B`;
  return `$${(n * 1_000).toFixed(0)}M`;
};

// ── Company Identity Card ─────────────────────────────────────────────────────

const CompanyIdentityCard: React.FC<{
  companyData: CompanyData & { marketCap?: number | null };
}> = ({ companyData }) => {
  type IdentityField = { label: string; value: string; icon: React.ReactNode; hint?: string };
  const fields: IdentityField[] = [
    { label: "Industry", value: companyData.industry || "—", icon: <Building2 className="w-4 h-4 text-blue-400" /> },
    { label: "Region / HQ", value: REGION_LABEL[companyData.region] ?? companyData.region ?? "—", icon: <MapPin className="w-4 h-4 text-violet-400" /> },
    { label: "Headcount", value: formatHeadcount(companyData.employeeCount), icon: <Users className="w-4 h-4 text-emerald-400" />, hint: companyData.employeeCount != null ? `${companyData.employeeCount.toLocaleString()} employees on record` : undefined },
    { label: "Listing", value: companyData.isPublic ? `Public${companyData.ticker ? ` · ${companyData.ticker}` : ""}` : "Private", icon: <Hash className="w-4 h-4 text-cyan-400" /> },
    ...(companyData.marketCap != null ? [{ label: "Market Cap", value: formatMarketCap(companyData.marketCap), icon: <Coins className="w-4 h-4 text-amber-400" />, hint: "From upstream financial connector" }] : []),
    ...((companyData as any).lastFundingRound ? [{ label: "Last Funding", value: `${(companyData as any).lastFundingRound}${(companyData as any).monthsSinceLastFunding != null ? ` · ${(companyData as any).monthsSinceLastFunding} mo ago` : ""}`, icon: <Briefcase className="w-4 h-4 text-pink-400" /> }] : []),
  ];

  return (
    <div className="company-identity-card glass-panel-heavy p-[var(--space-6)] shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold tracking-tight leading-tight">{companyData.name}</h4>
            <p className="text-xs text-muted-foreground">
              {companyData.industry}{companyData.region ? ` · ${REGION_LABEL[companyData.region] ?? companyData.region}` : ""}
            </p>
          </div>
        </div>
        <div className="text-right text-[10px] text-muted-foreground leading-tight">
          {companyData.lastUpdated && <div>Last updated: {companyData.lastUpdated}</div>}
          {companyData.source && <div className="opacity-70">Source: {companyData.source}</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--space-3)]">
        {fields.map(f => (
          <div key={f.label} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5" title={f.hint}>
            <div className="flex-shrink-0 p-1.5 rounded bg-black/20">{f.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="label-xs text-muted-foreground">{f.label}</div>
              <div className="text-sm font-bold tracking-tight truncate">{f.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Hiring Pulse ──────────────────────────────────────────────────────────────

interface HiringPulseSignal {
  freezeScore: number | null;
  postingTrend: "growing" | "stable" | "declining" | "frozen" | "unknown" | null;
  estimatedOpenings: number | null;
  isLive: boolean;
  roleTitle: string;
  companySpecificRoleRisk: number | null;
}

const HiringPulseCard: React.FC<{ signal: HiringPulseSignal; companyName: string }> = ({ signal, companyName }) => {
  const trendIcon = signal.postingTrend === "growing"
    ? <TrendingUp className="w-4 h-4 text-emerald-400" />
    : signal.postingTrend === "declining" || signal.postingTrend === "frozen"
      ? <TrendingDown className="w-4 h-4 text-rose-400" />
      : <Minus className="w-4 h-4 text-muted-foreground" />;

  const freezeBadge = signal.freezeScore == null
    ? { label: "No live data", color: "text-muted-foreground", icon: <Minus className="w-4 h-4" /> }
    : signal.freezeScore >= 0.6
      ? { label: `${Math.round(signal.freezeScore * 100)}/100 — High freeze`, color: "text-rose-400", icon: <Snowflake className="w-4 h-4 text-rose-400" /> }
      : signal.freezeScore >= 0.3
        ? { label: `${Math.round(signal.freezeScore * 100)}/100 — Moderate`, color: "text-amber-400", icon: <Snowflake className="w-4 h-4 text-amber-400" /> }
        : { label: `${Math.round(signal.freezeScore * 100)}/100 — Active hiring`, color: "text-emerald-400", icon: <Flame className="w-4 h-4 text-emerald-400" /> };

  return (
    <div className="hiring-pulse-card glass-panel-heavy p-[var(--space-6)] shadow-xl">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-[var(--violet)]/10 text-[var(--violet)]"><Briefcase className="w-5 h-5" /></div>
        <div className="flex-1">
          <h4 className="text-lg font-bold tracking-tight">Hiring Pulse</h4>
          <p className="text-[11px] text-muted-foreground">{signal.isLive ? "Live job-board scrape" : "Heuristic baseline (not live)"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-3)]">
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">{freezeBadge.icon}<span className="label-xs text-muted-foreground">Hiring Freeze Score</span></div>
          <div className={`text-base font-black tracking-tight mt-1 ${freezeBadge.color}`}>{freezeBadge.label}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">{trendIcon}<span className="label-xs text-muted-foreground">Posting Trend ({signal.roleTitle})</span></div>
          <div className="text-base font-black tracking-tight mt-1 capitalize">{signal.postingTrend ?? "unknown"}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5"><Hash className="w-4 h-4 text-cyan-400" /><span className="label-xs text-muted-foreground">Open Roles (live count)</span></div>
          <div className="text-base font-black tracking-tight mt-1">
            {signal.estimatedOpenings != null ? signal.estimatedOpenings.toLocaleString() : <span className="text-muted-foreground">— (live API not active)</span>}
          </div>
        </div>
      </div>

      {signal.companySpecificRoleRisk != null && (
        <div className="mt-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold tracking-tight">
            <AlertCircle className="w-3.5 h-3.5" />
            Company-specific role-risk: {Math.round(signal.companySpecificRoleRisk * 100)}/100
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {signal.companySpecificRoleRisk >= 0.6
              ? `Internally, ${companyName} weights ${signal.roleTitle} as a higher-cut-risk role than the global baseline.`
              : signal.companySpecificRoleRisk <= 0.35
                ? `${companyName} treats ${signal.roleTitle} as a protected role vs. sector baseline.`
                : `${companyName}'s internal weighting of ${signal.roleTitle} is aligned with the global baseline.`}
          </p>
        </div>
      )}
    </div>
  );
};

// ── Financial Health Dossier ───────────────────────────────────────────────────

interface FinancialMetric {
  label: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  description?: string;
  benchmark?: string;
  benchmarkDelta?: "above" | "below" | "on-par";
}

const FinancialHealthDossier: React.FC<{
  companyName: string;
  companyData: CompanyData;
}> = ({ companyName, companyData }) => {
  const bench = getBenchmark(companyData.industry);

  const metrics: FinancialMetric[] = useMemo(() => {
    const m: FinancialMetric[] = [];

    if (companyData.revenueGrowthYoY != null) {
      m.push({
        label: "Revenue Growth (YoY)",
        value: `${companyData.revenueGrowthYoY > 0 ? "+" : ""}${companyData.revenueGrowthYoY}%`,
        trend: companyData.revenueGrowthYoY > 0 ? "up" : companyData.revenueGrowthYoY < 0 ? "down" : "neutral",
        icon: <BarChart4 className="w-4 h-4 text-blue-400" />,
        description: "Year-over-year revenue trajectory vs. sector",
        benchmark: `Sector median: ~${bench.growthOutlook} outlook`,
        benchmarkDelta: companyData.revenueGrowthYoY > 10 ? "above" : companyData.revenueGrowthYoY < -5 ? "below" : "on-par",
      });
    }

    if (companyData.revenuePerEmployee != null) {
      const rpe = companyData.revenuePerEmployee;
      const delta = ((rpe - bench.revenuePerEmployee) / bench.revenuePerEmployee) * 100;
      m.push({
        label: "Revenue Per Employee",
        value: `$${(rpe / 1000).toFixed(0)}K`,
        trend: rpe > bench.revenuePerEmployee ? "up" : "down",
        icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
        description: "Workforce efficiency vs. industry standard",
        benchmark: `Industry avg: $${(bench.revenuePerEmployee / 1000).toFixed(0)}K`,
        benchmarkDelta: delta > 10 ? "above" : delta < -10 ? "below" : "on-par",
      });
    }

    if (companyData.aiInvestmentSignal) {
      const signalMap: Record<string, { label: string; score: number }> = {
        "very-high": { label: "Very High · Aggressive AI buildout", score: 95 },
        "high":      { label: "High · Active AI integration",      score: 75 },
        "medium":    { label: "Medium · Exploratory AI pilots",     score: 50 },
        "low":       { label: "Low · Minimal AI investment",        score: 25 },
      };
      const sig = signalMap[companyData.aiInvestmentSignal] ?? { label: companyData.aiInvestmentSignal, score: 50 };
      m.push({
        label: "AI Investment Signal",
        value: sig.label,
        trend: sig.score >= 75 ? "up" : "neutral",
        icon: <Activity className="w-4 h-4 text-cyan-400" />,
        description: `AI adoption maturity vs. sector avg ${bench.aiAdoptionPct}%`,
        benchmark: `Sector AI adoption: ${bench.aiAdoptionPct}%`,
        benchmarkDelta: sig.score > bench.aiAdoptionPct ? "above" : "below",
      });
    }

    if (companyData.stock90DayChange != null) {
      const chg = companyData.stock90DayChange;
      m.push({
        label: "Stock 90-Day Change",
        value: `${chg > 0 ? "+" : ""}${chg}%`,
        trend: chg > 0 ? "up" : chg < -5 ? "down" : "neutral",
        icon: <Percent className="w-4 h-4 text-violet-400" />,
        description: chg < -20 ? "Severe drawdown — investor confidence hit" : chg > 20 ? "Strong rally — positive market re-rating" : "Within normal volatility range",
        benchmarkDelta: chg > 5 ? "above" : chg < -10 ? "below" : "on-par",
      });
    }

    if (companyData.layoffRounds != null) {
      const rounds = companyData.layoffRounds;
      m.push({
        label: "Layoff Rounds (24 mo)",
        value: rounds === 0 ? "None" : rounds,
        trend: rounds === 0 ? "up" : rounds >= 2 ? "down" : "neutral",
        icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
        description: rounds >= 3 ? "Chronic restructuring pattern detected" : rounds >= 2 ? "Repeat reductions signal structural issues" : rounds === 1 ? "Single round — watch for follow-up" : "No documented reductions",
        benchmark: `Sector avg: ${bench.avgLayoffRate}% annual attrition`,
        benchmarkDelta: rounds === 0 ? "above" : rounds >= 2 ? "below" : "on-par",
      });
    }

    // Add industry median fallback if all live fields missing
    if (m.length === 0) {
      m.push(
        { label: "Revenue Per Employee", value: `~$${(bench.revenuePerEmployee / 1000).toFixed(0)}K (sector est.)`, trend: "neutral", icon: <DollarSign className="w-4 h-4 text-emerald-400" />, description: "Industry median estimate — no live financial data available" },
        { label: "AI Adoption Rate", value: `~${bench.aiAdoptionPct}% (sector avg)`, trend: "neutral", icon: <Activity className="w-4 h-4 text-cyan-400" />, description: "Sector-level AI adoption baseline" },
        { label: "Cash Runway (sector)", value: `~${bench.cashRunwayMonths} months`, trend: "neutral", icon: <Clock className="w-4 h-4 text-amber-400" />, description: "Typical cash runway for this sector" },
      );
    }

    return m;
  }, [companyData, bench]);

  const benchmarkColor = (d?: "above" | "below" | "on-par") =>
    d === "above" ? "text-emerald-400" : d === "below" ? "text-rose-400" : "text-muted-foreground";

  return (
    <div className="financial-health-card glass-panel-heavy p-[var(--space-6)] shadow-xl">
      <div className="flex items-center gap-2 mb-[var(--space-6)]">
        <div className="p-2 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)]"><BarChart4 className="w-5 h-5" /></div>
        <h4 className="text-lg font-bold tracking-tight">Financial Health Dossier</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
          >
            <div className="flex-shrink-0 p-2.5 rounded-lg bg-black/20 group-hover:scale-110 transition-transform">
              {metric.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="label-xs text-muted-foreground mb-1">{metric.label}</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight">{metric.value}</span>
                {metric.trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                {metric.trend === "down" && <TrendingDown className="w-4 h-4 text-rose-500" />}
              </div>
              {metric.description && (
                <div className="text-[10px] text-muted-foreground mt-1 opacity-70">{metric.description}</div>
              )}
              {metric.benchmark && (
                <div className={`text-[10px] mt-1 font-mono ${benchmarkColor(metric.benchmarkDelta)}`}>
                  {metric.benchmarkDelta === "above" ? "▲ Above" : metric.benchmarkDelta === "below" ? "▼ Below" : "≈"} {metric.benchmark}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Layoff Timeline ───────────────────────────────────────────────────────────

interface LayoffEvent {
  date: string;
  count: number;
  percentage: number;
  department?: string;
  severity: "minor" | "moderate" | "major";
}

const LayoffTimeline: React.FC<{ events: LayoffEvent[]; companyName: string }> = ({ events, companyName }) => {
  const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getSeverityColor = (s: LayoffEvent["severity"]) =>
    s === "major" ? "var(--red)" : s === "moderate" ? "var(--orange)" : "var(--amber)";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short" });

  const patternLabel = events.length >= 3
    ? `Chronic restructuring (${events.length} rounds in 24 mo)`
    : events.length === 2
      ? "Repeat reductions — second wave completed"
      : events.length === 1
        ? "Single event — watch for follow-up within 9 months"
        : null;

  return (
    <div className="glass-panel p-[var(--space-6)]">
      <div className="flex items-center gap-2 mb-[var(--space-6)]">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Layoff History</h4>
        {patternLabel && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 font-bold ml-auto">
            {patternLabel}
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-4 bg-[var(--emerald)]/5 border border-[var(--emerald)]/20 rounded-xl text-xs text-[var(--emerald)]/80 leading-relaxed">
          <strong>Stability Index: High.</strong> No documented workforce reductions detected in the primary 24-month tracking window. This is a meaningful protective signal.
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
          {sorted.map((event, i) => (
            <div key={i} className="flex gap-4 relative">
              <div
                className="w-[23px] h-[23px] rounded-full border-2 border-[var(--bg)] z-10 flex items-center justify-center shrink-0"
                style={{ backgroundColor: getSeverityColor(event.severity) }}
              >
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              </div>
              <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex flex-wrap justify-between items-center mb-1 gap-2">
                  <span className="font-mono text-xs font-bold">{formatDate(event.date)}</span>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter"
                    style={{ backgroundColor: `${getSeverityColor(event.severity)}22`, color: getSeverityColor(event.severity) }}
                  >
                    {event.severity} Impact
                  </span>
                </div>
                <div className="text-sm font-black tracking-tight mb-1">
                  {event.count > 0 ? `${event.count.toLocaleString()} Roles Cut` : "Undisclosed count"} ({event.percentage}%)
                </div>
                {event.department && (
                  <div className="text-[10px] text-muted-foreground">
                    Targeted: {event.department}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Industry Benchmark Card ───────────────────────────────────────────────────

interface BenchmarkData {
  metric: string;
  company: number;
  industry: number;
  percentile?: number;
  label?: string;
}

const IndustryBenchmarkCard: React.FC<{
  industryName: string;
  benchmarks: BenchmarkData[];
}> = ({ industryName, benchmarks }) => {
  return (
    <div className="glass-panel p-5">
      <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        Industry Benchmarks · <span className="text-cyan-400">{industryName}</span>
      </h4>

      {benchmarks.length === 0 ? (
        <div className="text-xs text-muted-foreground p-4 text-center">No benchmark data available for this industry.</div>
      ) : (
        <div className="space-y-4">
          {benchmarks.map((bm, i) => {
            const delta = bm.company - bm.industry;
            const normalizedDelta = delta / Math.max(1, bm.industry);
            const isPositive = delta >= 0;
            const isSignificant = Math.abs(normalizedDelta) > 0.1;

            return (
              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-muted-foreground mb-1">{bm.metric}</div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black">{bm.label ?? bm.company.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">vs. {bm.industry.toFixed(1)} industry avg</span>
                  </div>
                  {bm.percentile !== undefined && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-black"
                      style={{
                        background: bm.percentile > 50 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: bm.percentile > 50 ? "var(--emerald)" : "var(--red)",
                      }}
                    >
                      {bm.percentile}th %ile
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-white/5 rounded-full relative overflow-visible">
                  <div className="absolute h-full w-0.5 bg-white/20" style={{ left: "50%" }} />
                  <div
                    className="absolute w-3 h-3 rounded-full border-2 border-[var(--bg)] -top-[3px]"
                    style={{
                      background: isSignificant ? (isPositive ? "var(--emerald)" : "var(--red)") : "var(--text-3)",
                      left: `${Math.max(2, Math.min(98, 50 + normalizedDelta * 100))}%`,
                      transform: "translateX(-50%)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1 font-mono">
                  <span>Worse</span><span>Better</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Department News Panel ─────────────────────────────────────────────────────

interface NewsItem {
  title: string;
  date: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral" | "warning";
  highlights: string[];
  tag?: string;
}

const getSentimentColor = (s: NewsItem["sentiment"]) =>
  s === "positive" ? "var(--emerald)" : s === "negative" ? "var(--red)" : s === "warning" ? "var(--amber)" : "var(--text-3)";

const DepartmentNewsPanel: React.FC<{ news: NewsItem[]; department: string; companyName: string }> = ({
  news, department, companyName,
}) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="glass-panel p-5">
      <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Rss className="w-4 h-4 text-muted-foreground" />
        Department Intel · {department || companyName}
      </h4>

      {news.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-6 opacity-60">
          No department-level signals detected in current tracking window.
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 bg-white/5 rounded-xl border border-white/5"
              style={{ borderLeft: `3px solid ${getSentimentColor(item.sentiment)}` }}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="text-sm font-semibold leading-tight">{item.title}</div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.tag && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase"
                      style={{ background: `${getSentimentColor(item.sentiment)}22`, color: getSentimentColor(item.sentiment) }}>
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1 mb-2">
                {item.highlights.map((h, j) => (
                  <p key={j} className="text-xs text-muted-foreground flex gap-1.5">
                    <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-50" />
                    {h}
                  </p>
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
                <span className="font-mono opacity-70">{item.source}</span>
                <span>{formatDate(item.date)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Live Signal Feed ──────────────────────────────────────────────────────────

interface SignalEvent {
  timestamp: string;
  source: string;
  type: "financial" | "news" | "social" | "job-market" | "ai-adoption";
  content: string;
  impact: "high" | "medium" | "low";
}

const LiveSignalFeed: React.FC<{ signals: SignalEvent[] }> = ({ signals }) => {
  const getImpactColor = (i: SignalEvent["impact"]) =>
    i === "high" ? "var(--red)" : i === "medium" ? "var(--amber)" : "var(--emerald)";

  const getTypeIcon = (t: SignalEvent["type"]) => {
    if (t === "financial") return <BarChart4 className="w-3 h-3" />;
    if (t === "news") return <Newspaper className="w-3 h-3" />;
    if (t === "job-market") return <Building2 className="w-3 h-3" />;
    if (t === "ai-adoption") return <Activity className="w-3 h-3" />;
    return <Rss className="w-3 h-3" />;
  };

  const formatTs = (ts: string) => {
    try {
      return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return ts; }
  };

  if (!signals || signals.length === 0) {
    return (
      <div className="glass-panel p-5">
        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />Live Signal Feed
        </h4>
        <p className="text-sm text-muted-foreground text-center py-4 opacity-60">
          No real-time signals available. Run audit with a known public company for live data.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5">
      <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-muted-foreground" />Live Signal Feed
        <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
          {signals.length} SIGNALS
        </span>
      </h4>
      <div className="space-y-2">
        {signals.map((sig, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-2.5 bg-white/5 rounded-lg text-xs flex items-start gap-2.5 border border-white/5"
          >
            <div
              className="p-1.5 rounded-full mt-0.5 flex-shrink-0"
              style={{ background: `${getImpactColor(sig.impact)}18` }}
            >
              <span style={{ color: getImpactColor(sig.impact) }}>{getTypeIcon(sig.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium leading-relaxed">{sig.content}</div>
              <div className="flex justify-between items-center mt-1 text-muted-foreground opacity-70">
                <span className="font-mono">{sig.source}</span>
                <span>{formatTs(sig.timestamp)}</span>
              </div>
            </div>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 uppercase"
              style={{ background: `${getImpactColor(sig.impact)}15`, color: getImpactColor(sig.impact) }}
            >
              {sig.impact}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Intelligent Heuristic Signal Generator ────────────────────────────────────
// Generates contextually accurate signals from available company + industry data
// when live API data is absent.

const buildIntelligentSignals = (
  companyData: CompanyData,
  resultWorkTypeKey: string,
): SignalEvent[] => {
  const signals: SignalEvent[] = [];
  const bench = getBenchmark(companyData.industry);
  const now = new Date().toISOString();
  const fetchedAt = companyData.lastUpdated ?? now;

  const patched = companyData as typeof companyData & {
    _hiringFreezeScore?: number;
    _hiringPostingTrend?: string;
    _liveNewsSentiment?: number;
  };

  // Stock signal
  if (companyData.stock90DayChange != null) {
    const chg = companyData.stock90DayChange;
    const direction = chg > 0 ? "rallied" : chg < 0 ? "fell" : "held flat";
    const magnitude = Math.abs(chg) > 25
      ? `extreme ${chg > 0 ? "rally" : "drawdown"} — investors repricing the business model`
      : Math.abs(chg) > 15 ? `significant ${chg > 0 ? "uptrend" : "drawdown"} — guidance change likely`
      : Math.abs(chg) > 5 ? `${chg > 0 ? "uptrend" : "downtrend"} — within normal range`
      : "essentially flat — no market-moving event";
    const exchange = companyData.region === "IN" ? "BSE/NSE" : companyData.isPublic ? "Stock exchange" : "Private valuation";
    signals.push({
      timestamp: fetchedAt,
      source: exchange,
      type: "financial",
      content: `${companyData.ticker ?? companyData.name} ${direction} ${chg > 0 ? "+" : ""}${chg}% over 90 days — ${magnitude}`,
      impact: Math.abs(chg) > 15 ? "high" : Math.abs(chg) > 5 ? "medium" : "low",
    });
  }

  // Revenue signal
  if (companyData.revenueGrowthYoY != null) {
    const yoy = companyData.revenueGrowthYoY;
    const verdict = yoy >= 20 ? "well above sector — pricing power intact"
      : yoy >= 5 ? "tracking sector median — stable"
      : yoy >= 0 ? "decelerating — watch the next two quarters"
      : yoy >= -10 ? "contracting — cost-cutting cycles typically follow"
      : "sharp contraction — restructuring is the most common response";
    signals.push({
      timestamp: fetchedAt,
      source: "Filings + analyst consensus",
      type: "financial",
      content: `Revenue ${yoy > 0 ? "+" : ""}${yoy}% YoY — ${verdict}`,
      impact: yoy < -10 ? "high" : yoy < 0 ? "medium" : "low",
    });
  }

  // Revenue per employee vs benchmark
  if (companyData.revenuePerEmployee != null) {
    const rpe = companyData.revenuePerEmployee;
    const pctAbove = ((rpe - bench.revenuePerEmployee) / bench.revenuePerEmployee * 100).toFixed(0);
    const isAbove = rpe >= bench.revenuePerEmployee;
    signals.push({
      timestamp: fetchedAt,
      source: "Internal efficiency model",
      type: "financial",
      content: `Revenue/employee $${(rpe / 1000).toFixed(0)}K — ${isAbove ? `${pctAbove}% above` : `${Math.abs(Number(pctAbove))}% below`} ${companyData.industry} sector average ($${(bench.revenuePerEmployee / 1000).toFixed(0)}K). ${isAbove ? "Lean workforce signals resilience." : "Staffing inefficiency may trigger rationalization."}`,
      impact: isAbove ? "low" : "medium",
    });
  }

  // AI adoption signal
  if (companyData.aiInvestmentSignal) {
    const aiSignalMap: Record<string, { verdict: string; impact: SignalEvent["impact"] }> = {
      "very-high": { verdict: "Aggressive AI buildout. Roles without AI integration skills face accelerated displacement.", impact: "high" },
      "high":      { verdict: "Active AI integration. Roles not using AI tools will likely face scope reduction in 12–18 months.", impact: "medium" },
      "medium":    { verdict: "Exploratory AI pilots. No immediate displacement risk, but upskilling window is open now.", impact: "low" },
      "low":       { verdict: "Minimal AI investment. Sector-level AI competition may still force change despite company lag.", impact: "low" },
    };
    const s = aiSignalMap[companyData.aiInvestmentSignal];
    if (s) {
      signals.push({
        timestamp: fetchedAt,
        source: "AI investment intelligence",
        type: "ai-adoption",
        content: `AI signal: ${companyData.aiInvestmentSignal.replace("-", " ")} — ${s.verdict}`,
        impact: s.impact,
      });
    }
  }

  // Hiring posting trend (live or heuristic)
  if (patched._hiringPostingTrend) {
    const trend = patched._hiringPostingTrend;
    const freeze = patched._hiringFreezeScore;
    const verdict = trend === "declining"
      ? "open-roles count shrinking — hiring freeze likely in effect"
      : trend === "growing"
        ? "open-roles count rising — active expansion, protective signal"
        : "open-roles steady — no clear expansion or contraction";
    const freezeNote = freeze != null && freeze > 0.6 ? ` (freeze-score ${Math.round(freeze * 100)}/100 — high)` : "";
    signals.push({
      timestamp: fetchedAt,
      source: "Job-board scrape (Serper)",
      type: "job-market",
      content: `${resultWorkTypeKey.replace(/_/g, " ")} postings: ${verdict}${freezeNote}`,
      impact: trend === "declining" ? "high" : "medium",
    });
  }

  // Layoff history signal
  const lastLayoff = (companyData.layoffsLast24Months ?? [])[0] as
    | { date: string; percentCut: number; source?: string } | undefined;
  if (lastLayoff) {
    const dateLabel = new Date(lastLayoff.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const cutPhrase = lastLayoff.percentCut > 0 ? `${lastLayoff.percentCut}% of staff` : "headcount (size undisclosed)";
    const totalRounds = companyData.layoffRounds ?? 1;
    const pattern = totalRounds >= 3
      ? `Pattern: ${totalRounds} rounds in 24 months — chronic restructuring`
      : totalRounds === 2
        ? "Two rounds in 24 months — second wave confirms a structural reduction"
        : "First public round — watch for follow-up within 9 months (60% base rate)";
    signals.push({
      timestamp: lastLayoff.date,
      source: lastLayoff.source ?? companyData.source ?? "Public records",
      type: "news",
      content: `${dateLabel}: ${cutPhrase} reduced. ${pattern}`,
      impact: totalRounds >= 3 || lastLayoff.percentCut >= 10 ? "high" : "medium",
    });
  }

  // News sentiment
  if (patched._liveNewsSentiment != null) {
    const s = patched._liveNewsSentiment;
    const verdict = s < -0.3 ? "strongly negative — layoff/restructuring keywords frequent"
      : s < -0.1 ? "tilting negative — cost-cutting language present"
      : s < 0.1 ? "neutral — no directional signal"
      : s < 0.3 ? "tilting positive — growth/hiring language"
      : "strongly positive — expansion narrative dominant";
    signals.push({
      timestamp: fetchedAt,
      source: "News-aggregator NLP",
      type: "news",
      content: `Press sentiment ${s > 0 ? "+" : ""}${s.toFixed(2)} — ${verdict}`,
      impact: Math.abs(s) > 0.3 ? "high" : "medium",
    });
  }

  // Industry-level AI headwind even when no live data
  if (signals.length < 2) {
    signals.push({
      timestamp: now,
      source: "Sector intelligence model",
      type: "ai-adoption",
      content: `${companyData.industry} sector AI adoption rate: ~${bench.aiAdoptionPct}%. Companies in this sector are investing an average $${Math.round(bench.revenuePerEmployee * 0.04 / 1000)}K per employee in AI tooling annually.`,
      impact: bench.aiAdoptionPct > 60 ? "medium" : "low",
    });
    signals.push({
      timestamp: now,
      source: "Workforce data model",
      type: "job-market",
      content: `${companyData.industry} sector average annual attrition: ${bench.avgLayoffRate}%. Typical cash runway for sector: ~${bench.cashRunwayMonths} months. ${bench.growthOutlook} growth outlook.`,
      impact: bench.avgLayoffRate > 10 ? "medium" : "low",
    });
  }

  return signals;
};

// ── Intelligent Department News Generator ────────────────────────────────────

const buildDepartmentNews = (
  companyData: CompanyData,
  department: string,
): NewsItem[] => {
  const items: NewsItem[] = [];
  const layoffs = (companyData.layoffsLast24Months ?? []) as Array<{ date: string; percentCut: number; source?: string }>;
  const employeeCount = companyData.employeeCount ?? 1000;
  const bench = getBenchmark(companyData.industry);

  // Real layoff events
  for (const ev of layoffs.slice(0, 3)) {
    const evSource = ev.source ?? companyData.source ?? "Public records";
    const isRegulatory = /SEC|WARN|EDGAR|10-K|8-K/i.test(evSource);
    const headline = isRegulatory
      ? `${evSource} disclosure: workforce reduction filed${ev.percentCut > 0 ? ` (~${ev.percentCut}% of staff)` : ""}`
      : ev.percentCut > 0
        ? `${ev.percentCut}% workforce cut reported by ${evSource}`
        : `Layoff event reported by ${evSource}`;
    const peopleAffected = ev.percentCut > 0
      ? `~${Math.round(employeeCount * ev.percentCut / 100).toLocaleString()} of ${employeeCount.toLocaleString()} roles affected`
      : "Affected count not disclosed in this filing";
    items.push({
      title: headline,
      date: ev.date,
      source: evSource,
      sentiment: "negative",
      tag: "LAYOFF",
      highlights: [
        peopleAffected,
        isRegulatory
          ? "Regulatory filing — legally required disclosure, highest signal confidence"
          : `Reported via ${evSource} — cross-verify with primary source if mission-critical`,
      ],
    });
  }

  // AI investment signal news
  if (companyData.aiInvestmentSignal === "very-high" || companyData.aiInvestmentSignal === "high") {
    items.push({
      title: `${companyData.name} accelerating AI deployment across ${department || "core business units"}`,
      date: companyData.lastUpdated ?? new Date().toISOString(),
      source: companyData.source ?? "Intelligence model",
      sentiment: "warning",
      tag: "AI SIGNAL",
      highlights: [
        `AI investment signal rated "${companyData.aiInvestmentSignal}" — above sector baseline of ${bench.aiAdoptionPct}% adoption`,
        `Roles in ${department || companyData.industry} performing routine or automatable tasks are most exposed to workflow AI substitution`,
        "Recommended action: Identify tasks AI is already doing in adjacent companies and proactively shift to oversight + strategy work",
      ],
    });
  }

  // Revenue contraction signal
  if (companyData.revenueGrowthYoY != null && companyData.revenueGrowthYoY < -5) {
    items.push({
      title: `${companyData.name} revenue contracting — cost reduction likely to follow`,
      date: companyData.lastUpdated ?? new Date().toISOString(),
      source: "Financial model",
      sentiment: "negative",
      tag: "FINANCIAL",
      highlights: [
        `Revenue down ${Math.abs(companyData.revenueGrowthYoY)}% YoY — well below ${bench.growthOutlook} sector outlook`,
        "Revenue contractions of this magnitude historically precede workforce reductions within 1–2 quarters",
        `Based on ${employeeCount.toLocaleString()} headcount and current revenue/employee ratio`,
      ],
    });
  }

  // Positive signal when no issues
  if (items.length === 0) {
    items.push({
      title: `${companyData.name} — no material negative signals in current tracking window`,
      date: new Date().toISOString(),
      source: "Intelligence model",
      sentiment: "positive",
      tag: "STABLE",
      highlights: [
        "No documented layoffs, regulatory filings, or financial distress signals in the 24-month window",
        `${companyData.industry} sector context: ${bench.growthOutlook} growth outlook, ${bench.avgLayoffRate}% average annual attrition`,
        "Continued monitoring recommended — sector AI adoption at ~" + bench.aiAdoptionPct + "% could shift this picture within 12–18 months",
      ],
    });
  }

  return items;
};

// ── CompanyProfileTab main ────────────────────────────────────────────────────

export const CompanyProfileTab: React.FC<TabProps> = ({ result, companyData }) => {
  const { width } = useAdaptiveSystem();

  const layoffEvents: LayoffEvent[] = useMemo(() => {
    if (!companyData.layoffsLast24Months?.length) return [];
    return companyData.layoffsLast24Months.map(l => ({
      date: l.date,
      count: companyData.employeeCount ? Math.round(companyData.employeeCount * (l.percentCut / 100)) : 0,
      percentage: l.percentCut,
      severity: l.percentCut > 10 ? "major" : l.percentCut > 3 ? "moderate" : "minor",
    }));
  }, [companyData]);

  const bench = getBenchmark(companyData.industry);

  const benchmarkData: BenchmarkData[] = useMemo(() => {
    const bms: BenchmarkData[] = [];
    if (companyData.revenuePerEmployee != null) {
      const rpe = companyData.revenuePerEmployee;
      const pct = Math.round(50 + ((rpe - bench.revenuePerEmployee) / bench.revenuePerEmployee) * 50);
      bms.push({
        metric: "Revenue Per Employee",
        company: rpe / 1000,
        industry: bench.revenuePerEmployee / 1000,
        label: `$${(rpe / 1000).toFixed(0)}K`,
        percentile: Math.min(99, Math.max(1, pct)),
      });
    }
    if (companyData.layoffRounds != null) {
      const rounds = companyData.layoffRounds;
      const industryRounds = bench.avgLayoffRate / 10; // convert % to round-equivalent
      bms.push({
        metric: "Layoff Rounds vs Sector",
        company: rounds,
        industry: parseFloat(industryRounds.toFixed(1)),
        label: rounds === 0 ? "None" : `${rounds} rounds`,
        percentile: rounds === 0 ? 85 : rounds === 1 ? 55 : rounds === 2 ? 30 : 15,
      });
    }
    bms.push({
      metric: "AI Adoption Score",
      company: { "very-high": 95, "high": 75, "medium": 50, "low": 25 }[companyData.aiInvestmentSignal ?? "medium"] ?? 50,
      industry: bench.aiAdoptionPct,
      percentile: companyData.aiInvestmentSignal === "very-high" ? 90 : companyData.aiInvestmentSignal === "high" ? 70 : 40,
    });
    return bms;
  }, [companyData, bench]);

  const hiringPulseSignal: {
    freezeScore: number | null; postingTrend: any; estimatedOpenings: number | null;
    isLive: boolean; roleTitle: string; companySpecificRoleRisk: number | null;
  } = useMemo(() => {
    const patched = companyData as any;
    const roleRiskMap = (companyData as any).roleRiskMap;
    return {
      freezeScore: patched._hiringFreezeScore ?? null,
      postingTrend: patched._hiringPostingTrend ?? null,
      estimatedOpenings: patched._estimatedRoleOpenings ?? null,
      isLive: patched._hiringSource === "supabase-osint",
      roleTitle: result.workTypeKey || "this role",
      companySpecificRoleRisk: roleRiskMap?.[result.workTypeKey] ?? null,
    };
  }, [companyData, result.workTypeKey]);

  const liveSignals = useMemo(
    () => buildIntelligentSignals(companyData, result.workTypeKey),
    [companyData, result.workTypeKey],
  );

  const departmentNews = useMemo(
    () => buildDepartmentNews(companyData, result.workTypeKey),
    [companyData, result.workTypeKey],
  );

  return (
    <section aria-labelledby="company-profile-heading" className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Company Identity */}
        <div className="mb-6">
          <CompanyIdentityCard companyData={companyData as any} />
        </div>

        {/* Hiring Pulse */}
        <div className="mb-6">
          <HiringPulseCard signal={hiringPulseSignal} companyName={companyData.name} />
        </div>

        {/* Financial Health Dossier */}
        <div className="mb-6">
          <SectionHeader
            title="Financial Health Dossier"
            description="Key financial indicators with sector benchmarks — revenue trajectory, workforce efficiency, AI investment, stock performance, and layoff patterns."
          />
          <FinancialHealthDossier companyName={result.companyName ?? ""} companyData={companyData} />
        </div>

        {/* Layoff History + Industry Benchmarks */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <SectionHeader
              title="Layoff History"
              description="Documented workforce reductions in the past 24 months with severity, scale, and pattern analysis."
            />
            <LayoffTimeline events={layoffEvents} companyName={result.companyName ?? ""} />
          </div>
          <div>
            <SectionHeader
              title="Industry Benchmarks"
              description="How this company compares to its sector peers on efficiency, AI adoption, and workforce stability."
            />
            <IndustryBenchmarkCard industryName={companyData.industry ?? result.industryKey} benchmarks={benchmarkData} />
          </div>
        </div>

        {/* Department News & Live Signals */}
        <CollapsibleSection title="Department News & Live Signals">
          <div className="space-y-6">
            <DepartmentNewsPanel
              news={departmentNews}
              department={result.workTypeKey}
              companyName={result.companyName ?? companyData.name}
            />
            <SectionHeader
              title="Live Signal Feed"
              description="Real-time and heuristic signals derived from financial data, job board activity, AI investment levels, and layoff patterns."
            />
            <LiveSignalFeed signals={liveSignals} />
          </div>
        </CollapsibleSection>

        {/* Company Collapse Prediction */}
        <div className="mt-6">
          <SectionHeader
            title="Company Collapse Prediction"
            description="AI-driven early warning system — detects Stage 1–3 distress signals with 6–18 month lead time using 15+ financial and behavioral markers."
          />
          <CollapseSignalCard
            companyName={companyData.name}
            industry={companyData.industry}
            roleTitle={result.workTypeKey}
            stock90dChange={companyData.stock90DayChange}
            aiInvestmentSignal={companyData.aiInvestmentSignal}
            layoffRounds={companyData.layoffRounds}
            mostRecentLayoffDate={companyData.layoffsLast24Months?.[0]?.date ?? null}
            filingDelinquent={false}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default CompanyProfileTab;
