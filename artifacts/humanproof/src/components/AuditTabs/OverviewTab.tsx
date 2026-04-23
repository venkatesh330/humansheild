// OverviewTab.tsx
// Executive snapshot — answers "How risky is my situation?" in ≤3 seconds.
// Displays: verdict badge, score ring, timeline/urgency, quick stats,
//           inaction scenario, conflicts, and feedback loop.

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, Zap, Clock, ShieldCheck, Activity,
  ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Info,
  AlertCircle, ArrowRight,
} from "lucide-react";
import { submitPredictionFeedback } from "@/services/scoreSyncService";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import { ScoreRing } from "@/components/ScoreRing";
import { DataQualityBanner } from "../../../components/DataQualityBanner";
import { ConflictDisclosurePanel } from "../../../components/ConflictDisclosurePanel";
import { StatCard } from "./common/StatCard";
import type { HybridResult } from "@/types/hybridResult";
import type { CompanyData } from "@/data/companyDatabase";
import {
  getScoreColor,
  getVerdict,
  getTimeline,
  getUrgency,
} from "@/data/riskEngine";
import type { TabProps } from "./common/types";
import { getCareerIntelligence } from "@/data/intelligence";

// ---------------------------------------------------------------------------
// Score-driven inaction scenario generator
// ---------------------------------------------------------------------------

function buildInactionScenario(result: HybridResult): string | null {
  const score = result.total;
  const roleKey = result.workTypeKey;
  const company = result.companyName ?? "your company";
  const intel = getCareerIntelligence(roleKey);

  // Use seeded inaction scenario if available
  if (intel?.inactionScenario) return intel.inactionScenario;

  // Generate from score + dimensions
  const topDim = [...(result.dimensions ?? [])].sort((a, b) => b.score - a.score)[0];
  const topDimName = topDim?.label ?? "Role Displacement";

  if (score >= 75) {
    return `Without intervention, roles with a ${score}/100 displacement index have a median restructuring horizon of 12–18 months. The dominant signal — ${topDimName} — is already at ${topDim?.score}/100. In similar role + company profiles, employees who waited for an official announcement had 4–6 fewer months to reskill or network than those who started proactively. The cost of acting now is low; the cost of waiting is compounding.`;
  }
  if (score >= 55) {
    return `At ${score}/100, you are in the "augmentation window" — AI is absorbing the execution layer of your role but human oversight, judgment, and stakeholder relationships still drive value. This window typically lasts 18–36 months before market expectations shift. Individuals who upskill during this period hold their leverage; those who wait face accelerated commoditization.`;
  }
  if (score >= 35) {
    return `Your current score of ${score}/100 reflects moderate but manageable AI exposure. Inaction is low-risk in the short term, but cumulative. The ${topDimName} dimension at ${topDim?.score}/100 could accelerate if ${company} increases AI investment or if sector adoption accelerates. Annual reassessment and light upskilling are the minimum recommended response.`;
  }
  return `At ${score}/100, your role has strong structural resilience. Inaction carries minimal near-term risk. Your primary protection is the ${topDimName} dimension — maintain depth here and monitor sector AI adoption trends annually.`;
}

// ---------------------------------------------------------------------------
// Score-driven quick actions — specific and role-aware
// ---------------------------------------------------------------------------

function buildQuickActions(result: HybridResult): Array<{ text: string; urgency: "high" | "medium" | "low" }> {
  const score = result.total;
  const intel = getCareerIntelligence(result.workTypeKey);
  const actions: Array<{ text: string; urgency: "high" | "medium" | "low" }> = [];

  if (score >= 70) {
    actions.push({ text: "Update resume and LinkedIn — target 2 role pivot conversations this week", urgency: "high" });
    actions.push({ text: "Build 6–9 month emergency fund — restructuring risk is elevated", urgency: "high" });
  }
  if (score >= 50) {
    actions.push({
      text: intel?.careerPaths?.[0]
        ? `Explore adjacent role: "${intel.careerPaths[0].role}" — ${intel.careerPaths[0].riskReduction}% risk reduction`
        : "Map 2 adjacent roles with lower AI exposure in your industry",
      urgency: score >= 70 ? "high" : "medium",
    });
    actions.push({ text: "Identify 1 task AI is already doing in your role and reposition yourself as its supervisor", urgency: "medium" });
  }
  const topSafe = intel?.skills?.safe?.[0];
  if (topSafe) {
    actions.push({ text: `Deepen "${topSafe.skill}" — long-term value ${topSafe.longTermValue}/100, AI cannot replicate`, urgency: "low" });
  } else {
    actions.push({ text: "Develop cross-functional visibility — present work to adjacent teams monthly", urgency: "low" });
  }
  return actions.slice(0, 3);
}

// ---------------------------------------------------------------------------
// VerdictBadge
// ---------------------------------------------------------------------------

const VerdictBadge: React.FC<{ score: number }> = ({ score }) => {
  const verdict = getVerdict(score);
  const config: Record<string, { color: string; bg: string; Icon: typeof Shield }> = {
    "Very low risk":  { color: "var(--emerald)", bg: "rgba(16,185,129,0.1)",  Icon: Shield },
    "Low risk":       { color: "var(--green)",   bg: "rgba(34,197,94,0.1)",   Icon: Shield },
    "Moderate risk":  { color: "var(--amber)",   bg: "rgba(245,158,11,0.1)",  Icon: AlertTriangle },
    "Elevated risk":  { color: "var(--orange)",  bg: "rgba(249,115,22,0.1)",  Icon: AlertTriangle },
    "High risk":      { color: "var(--red)",     bg: "rgba(239,68,68,0.1)",   Icon: Zap },
  };
  const { color, bg, Icon } = config[verdict] ?? config["Moderate risk"];

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-lg)", background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 20px ${color}11`, color }}
      role="status"
    >
      <Icon className="w-5 h-5 shrink-0" />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span className="label-xs font-black tracking-[0.15em]">{verdict.toUpperCase()}</span>
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-70" style={{ marginTop: "2px" }}>
          {getUrgency(score)} ACTION REQUIRED
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TimelineUrgencyCard
// ---------------------------------------------------------------------------

const TimelineUrgencyCard: React.FC<{ score: number }> = ({ score }) => (
  <div
    className="glass-panel"
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", padding: "var(--space-5) var(--space-6)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-2)" }}
  >
    <div>
      <div className="label-xs text-muted-foreground mb-[var(--space-2)]">Exposure Horizon</div>
      <div className="text-xl font-black tracking-tight" style={{ color: "var(--text)" }}>{getTimeline(score)}</div>
    </div>
    <div style={{ paddingLeft: "var(--space-6)", borderLeft: "1px solid var(--border-2)" }}>
      <div className="label-xs text-muted-foreground mb-[var(--space-2)]">Action Urgency</div>
      <div className="text-xl font-black tracking-tight" style={{ color: getScoreColor(score) }}>{getUrgency(score)}</div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Inaction Scenario Panel
// ---------------------------------------------------------------------------

const InactionPanel: React.FC<{ scenario: string; score: number }> = ({ scenario, score }) => {
  const color = score >= 70 ? "var(--red)" : score >= 50 ? "var(--amber)" : "var(--cyan)";
  const title = score >= 70 ? "⚠ What Happens If You Do Nothing" : score >= 50 ? "⏳ The Cost of Waiting" : "ℹ Monitoring Recommendation";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="rounded-xl border p-5 mt-4"
      style={{ background: `${color}08`, borderColor: `${color}25` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{scenario}</p>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Quick Actions Row
// ---------------------------------------------------------------------------

const QuickActionsRow: React.FC<{ actions: Array<{ text: string; urgency: "high" | "medium" | "low" }> }> = ({ actions }) => {
  const urgencyColor = { high: "var(--red)", medium: "var(--amber)", low: "var(--cyan)" };
  const urgencyLabel = { high: "NOW", medium: "30 DAYS", low: "ONGOING" };

  return (
    <div className="mt-6">
      <div className="label-xs text-muted-foreground uppercase tracking-widest mb-3">Top 3 Actions Based on Your Profile</div>
      <div className="space-y-2">
        {actions.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: urgencyColor[a.urgency] }} />
            <span className="text-xs text-muted-foreground leading-relaxed flex-1">{a.text}</span>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: `${urgencyColor[a.urgency]}15`, color: urgencyColor[a.urgency], border: `1px solid ${urgencyColor[a.urgency]}25` }}
            >
              {urgencyLabel[a.urgency]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// QuickStatsRow
// ---------------------------------------------------------------------------

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}

const QuickStatsRow: React.FC<{ stats: QuickStat[] }> = ({ stats }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
    {stats.map((stat, i) => (
      <div
        key={i}
        className="glass-panel-heavy"
        style={{ padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-2)" }}
        title={stat.hint}
      >
        <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// OverviewTab main
// ---------------------------------------------------------------------------

export interface OverviewTabProps extends TabProps {}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  result,
  companyData,
  onDownload,
  onRecalculate,
}) => {
  const isMobile = useAdaptiveSystem().width < 768;
  const scoreColor = getScoreColor(result.total);
  const [feedbackSent, setFeedbackSent] = useState<"correct" | "incorrect" | null>(null);

  const handleFeedback = (outcome: "correct" | "incorrect") => {
    if (feedbackSent) return;
    setFeedbackSent(outcome);
    submitPredictionFeedback({
      companyName: result.companyName,
      roleKey: result.workTypeKey,
      engineScore: result.total,
      swarmScore: result.total,
      outcome,
    });
  };

  const inactionScenario = useMemo(() => buildInactionScenario(result), [result]);
  const quickActions = useMemo(() => buildQuickActions(result), [result]);

  const quickStats = useMemo<QuickStat[]>(() => [
    { label: "Confidence", value: `${result.confidencePercent}%`, icon: ShieldCheck, hint: `Score reliable within ±${Math.round((result.confidenceInterval.high - result.confidenceInterval.low) / 2)} pts` },
    { label: "Live Signals", value: result.signalQuality.liveSignals, icon: Activity, hint: `${result.signalQuality.heuristicSignals} heuristic signals also used` },
    { label: "Data Age", value: `${result.dataFreshness.ageInDays}d`, icon: Clock, hint: result.dataFreshness.stalenessWarning ?? "Data freshness within acceptable range" },
    { label: "Overrides", value: result.consensusSnapshot?.overridesApplied.length || 0, icon: AlertTriangle, hint: "Kill-switch safety overrides applied during scoring" },
  ], [result]);

  // Derive comparison context for tier label
  const tierContext = useMemo(() => {
    const score = result.total;
    if (score >= 75) return "Top 20% highest-risk profiles in our network";
    if (score >= 55) return "Middle 40% — moderate risk cohort";
    if (score >= 35) return "Lower 30% — below-average exposure";
    return "Bottom 10% — strongest resilience cohort";
  }, [result.total]);

  return (
    <section aria-labelledby="overview-heading" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Unknown company warning */}
        {companyData?.source?.includes("Fallback") && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-400">Limited Company Intelligence</h4>
                <p className="text-sm opacity-80 mt-1">
                  "{result.companyName}" was not found in our 2000+ company database and live OSINT data was unavailable.
                  The engine is using heuristic industry baselines. Score accuracy bounds are ±30pts.
                  Re-run with a known public company for full precision.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality Banner */}
        {result && (
          <DataQualityBanner
            freshnessReport={{
              avgSignalAge: result.dataFreshness.ageInDays,
              oldestSignalAge: result.dataFreshness.ageInDays,
              percentLive: result.signalQuality.liveSignals / 17,
              percentHeuristic: result.signalQuality.heuristicSignals / 17,
            }}
            confidencePercent={result.confidencePercent}
            confidenceInterval={{ low: result.confidenceInterval.low, high: result.confidenceInterval.high }}
            hasConflicts={result.signalQuality.hasConflicts}
            conflictCount={result.signalQuality.conflictingSignals.length}
            primarySource={(result.consensusSnapshot?.primarySource as "live" | "db" | "hybrid") || "db"}
            overridesApplied={result.consensusSnapshot?.overridesApplied || []}
          />
        )}

        {/* Score Ring + Verdict */}
        <div
          style={{
            display: "flex", flexDirection: isMobile ? "column" : "row",
            alignItems: "center", gap: "var(--space-8)", marginTop: "var(--space-6)",
          }}
        >
          <ScoreRing score={result.total} color={scoreColor} size={isMobile ? 140 : 200} isMobile={isMobile} />

          <div style={{ textAlign: isMobile ? "center" : "left", display: "flex", flexDirection: "column", gap: "var(--space-4)", flex: 1 }}>
            <VerdictBadge score={result.total} />
            <TimelineUrgencyCard score={result.total} />
            <div className="text-xs text-muted-foreground font-mono opacity-60">{tierContext}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6">
          <QuickStatsRow stats={quickStats} />
        </div>

        {/* Inaction Scenario */}
        {inactionScenario && <InactionPanel scenario={inactionScenario} score={result.total} />}

        {/* Quick Actions */}
        <QuickActionsRow actions={quickActions} />

        {/* Conflict Disclosure */}
        {result.signalQuality.hasConflicts && (
          <div className="mt-6">
            <ConflictDisclosurePanel
              conflicts={result.signalQuality.conflictingSignals}
              overrides={result.consensusSnapshot?.overridesApplied || []}
              overallImpact={
                result.signalQuality.hasConflicts
                  ? result.consensusSnapshot?.overridesApplied?.length
                    ? "score_increased"
                    : "reduced_confidence"
                  : "none"
              }
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 flex-wrap">
          {onDownload && (
            <button className="btn btn-primary btn-sm" style={{ minHeight: "44px" }} onClick={onDownload}>
              Download Full Dossier
            </button>
          )}
          {onRecalculate && (
            <button className="btn btn-secondary btn-sm" style={{ minHeight: "44px" }} onClick={onRecalculate}>
              Pulse New Audit
            </button>
          )}
        </div>

        {/* Prediction Feedback */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-muted-foreground mb-3 opacity-60 uppercase tracking-widest font-mono">
            Was this prediction accurate for your situation?
          </p>
          {feedbackSent ? (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ Thanks — your feedback improves future accuracy for everyone in this role category.
            </p>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback("correct")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors text-xs font-semibold"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Yes, accurate
              </button>
              <button
                onClick={() => handleFeedback("incorrect")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-xs font-semibold"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Off the mark
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default OverviewTab;
