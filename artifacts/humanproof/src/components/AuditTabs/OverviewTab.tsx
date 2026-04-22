// OverviewTab.tsx
// Executive snapshot — answers "How risky is my situation?" in ≤3 seconds.
// Displays: verdict badge, score ring, timeline/urgency card, quick stats, conflicts.

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck,
  Activity,
  ThumbsUp,
  ThumbsDown,
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

// ---------------------------------------------------------------------------
// VerdictBadge — colored badge with icon and one-line advice
// ---------------------------------------------------------------------------

interface VerdictBadgeProps {
  score: number;
}

const VerdictBadge: React.FC<VerdictBadgeProps> = ({ score }) => {
  const verdict = getVerdict(score);

  const config: Record<
    string,
    { color: string; bg: string; Icon: typeof Shield }
  > = {
    "Very low risk": {
      color: "var(--emerald)",
      bg: "rgba(16,185,129,0.1)",
      Icon: Shield,
    },
    "Low risk": {
      color: "var(--green)",
      bg: "rgba(34,197,94,0.1)",
      Icon: Shield,
    },
    "Moderate risk": {
      color: "var(--amber)",
      bg: "rgba(245,158,11,0.1)",
      Icon: AlertTriangle,
    },
    "Elevated risk": {
      color: "var(--orange)",
      bg: "rgba(249,115,22,0.1)",
      Icon: AlertTriangle,
    },
    "High risk": {
      color: "var(--red)",
      bg: "rgba(239,68,68,0.1)",
      Icon: Zap,
    },
  };

  const { color, bg, Icon } = config[verdict] || config["Moderate risk"];

  return (
    <div
      className="verdict-badge animate-in fade-in slide-in-from-top-4 duration-700"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-5)",
        borderRadius: "var(--radius-lg)",
        background: bg,
        border: `1px solid ${color}33`,
        boxShadow: `0 0 20px ${color}11`,
        color,
      }}
      role="status"
    >
      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span className="label-xs font-black tracking-[0.15em]">
          {verdict.toUpperCase()}
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-70" style={{ marginTop: '2px' }}>
          {getUrgency(score)} ACTION REQUIRED
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TimelineUrgencyCard — two-stat horizontal card
// ---------------------------------------------------------------------------

const TimelineUrgencyCard: React.FC<{ score: number }> = ({ score }) => {
  return (
    <div
      className="timeline-urgency-card glass-panel"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-6)",
        padding: "var(--space-5) var(--space-6)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-2)",
      }}
    >
      <div>
        <div className="label-xs text-muted-foreground mb-[var(--space-2)]">
          Exposure Horizon
        </div>
        <div className="text-xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          {getTimeline(score)}
        </div>
      </div>
      <div style={{ paddingLeft: 'var(--space-6)', borderLeft: '1px solid var(--border-2)' }}>
        <div className="label-xs text-muted-foreground mb-[var(--space-2)]">
          Action Urgency
        </div>
        <div
          className="text-xl font-black tracking-tight"
          style={{ color: getScoreColor(score) }}
        >
          {getUrgency(score)}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// QuickStatsRow — four-column metric row
// ---------------------------------------------------------------------------

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

const QuickStatsRow: React.FC<{ stats: QuickStat[] }> = ({ stats }) => {
  return (
    <div
      className="quick-stats-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "var(--space-4)",
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="stat-box glass-panel-heavy"
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-2)",
          }}
        >
          <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// OverviewTab main component
// ---------------------------------------------------------------------------

export interface OverviewTabProps extends TabProps {
  // Extends base tab props; no extra fields
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  result,
  companyData,
  onDownload,
  onRecalculate,
}) => {
  const isMobile = useAdaptiveSystem().width < 768;
  const scoreColor = getScoreColor(result.total);
  const [feedbackSent, setFeedbackSent] = useState<'correct' | 'incorrect' | null>(null);

  const handleFeedback = (outcome: 'correct' | 'incorrect') => {
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

  // Prepare quick stats
  const quickStats = useMemo<QuickStat[]>(
    () => [
      {
        label: "Confidence",
        value: `${result.confidencePercent}%`,
        icon: ShieldCheck,
      },
      {
        label: "Live Signals",
        value: result.signalQuality.liveSignals,
        icon: Activity,
      },
      {
        label: "Data Age",
        value: `${result.dataFreshness.ageInDays}d`,
        icon: Clock,
      },
      {
        label: "Overrides",
        value: result.consensusSnapshot?.overridesApplied.length || 0,
        icon: AlertTriangle,
      },
    ],
    [result],
  );

  // Compute signal/override display counts

  return (
    <section aria-labelledby="overview-heading" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Phase 5 Fix: Unknown Company Warning */}
        {companyData?.source?.includes('Fallback') && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-400">Unknown Company Context</h4>
                <p className="text-sm opacity-80 mt-1">
                  "{result.companyName}" is not in our 2000+ company database and we could not resolve live market signals. 
                  The scoring engine is relying on heuristic industry baselines and broad sector averages. 
                  <strong> Score accuracy bounds are ±30pts.</strong>
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
            confidenceInterval={{
              low: result.confidenceInterval.low,
              high: result.confidenceInterval.high,
            }}
            hasConflicts={result.signalQuality.hasConflicts}
            conflictCount={result.signalQuality.conflictingSignals.length}
            primarySource={
              (result.consensusSnapshot?.primarySource as
                | "live"
                | "db"
                | "hybrid") || "db"
            }
            overridesApplied={result.consensusSnapshot?.overridesApplied || []}
          />
        )}

        {/* Main Score + Verdict */}
        <div
          className="flex flex-col md:flex-row items-center gap-6 my-6"
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: "var(--space-8)",
          }}
        >
          <ScoreRing
            score={result.total}
            color={scoreColor}
            size={isMobile ? 140 : 200 * (isMobile ? 1 : 1)}
            isMobile={isMobile}
          />

          <div
            style={{
              textAlign: isMobile ? "center" : "left",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <VerdictBadge score={result.total} />
            <TimelineUrgencyCard score={result.total} />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-6">
          <QuickStatsRow stats={quickStats} />
        </div>

        {/* Conflict Disclosure (if present) */}
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
        <div
          className="flex gap-4 mt-8"
          style={{
            display: "flex",
            gap: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          {onDownload && (
            <button
              className="btn btn-primary btn-sm"
              style={{ minHeight: "44px" }}
              onClick={onDownload}
            >
              Download Full Dossier
            </button>
          )}
          {onRecalculate && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ minHeight: "44px" }}
              onClick={onRecalculate}
            >
              Pulse New Audit
            </button>
          )}
        </div>

        {/* Prediction Feedback — self-improving loop */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-muted-foreground mb-3 opacity-60 uppercase tracking-widest font-mono">
            Was this prediction accurate?
          </p>
          {feedbackSent ? (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ Thanks — your feedback improves future accuracy.
            </p>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback('correct')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors text-xs font-semibold"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Yes, accurate
              </button>
              <button
                onClick={() => handleFeedback('incorrect')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-xs font-semibold"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> No, off the mark
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default OverviewTab;
