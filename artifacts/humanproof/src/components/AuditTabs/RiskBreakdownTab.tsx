// RiskBreakdownTab.tsx
// Detailed breakdown of risk dimensions — Answers "What dimensions are driving my risk?"
// Displays: 5 dimension scores, confidence interval, key risk drivers panel.

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  AlertTriangle,
  BarChart,
  Clock,
  Activity,
  CheckSquare,
} from "lucide-react";
import { DimensionRadar } from "@/components/DimensionRadar";
import { KeyRiskDriversPanel } from "@/components/LayoffCalculator/KeyRiskDriversPanel";
import { StatCard } from "./common/StatCard";
import { SectionHeader } from "./common/SectionHeader";
import { CollapsibleSection } from "./common/CollapsibleSection";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import type { TabProps } from "./common/types";

// ---------------------------------------------------------------------------
// Layer score cards display
// ---------------------------------------------------------------------------

interface LayerScoreCardProps {
  layer: string;
  label: string;
  score: number;
  weight: number;
  contribution: number;
  icon?: React.ComponentType<{ className?: string }>;
}

const getScoreColor = (score: number): string => {
  if (score < 0.3) return "var(--emerald)";
  if (score < 0.45) return "var(--green)";
  if (score < 0.6) return "var(--amber)";
  if (score < 0.75) return "var(--orange)";
  return "var(--red)";
};

const LayerScoreCard: React.FC<LayerScoreCardProps> = ({
  layer,
  label,
  score,
  weight,
  contribution,
  icon: Icon,
}) => {
  const scoreColor = getScoreColor(score);
  const scorePercent = Math.round(score * 100);
  const weightPercent = Math.round(weight * 100);
  const contributingPoints = Math.round(contribution);

  return (
    <div
      className="layer-score-card glass-panel group transition-all duration-300 hover:border-[var(--border-cyan)]"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "var(--space-5)",
        borderRadius: "var(--radius-lg)",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <div
            className="label-xs text-muted-foreground flex items-center gap-[var(--space-2)]"
          >
            <span
              style={{
                backgroundColor: `${scoreColor}22`,
                color: scoreColor,
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 800,
                fontSize: '9px',
              }}
            >
              {layer}
            </span>
            {label}
          </div>
          <div
            className="text-2xl font-black tracking-tighter"
            style={{ color: scoreColor }}
          >
            {scorePercent}%
          </div>
        </div>
        <div className="p-[var(--space-2)] rounded-full bg-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
          {Icon ? <Icon className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
        </div>
      </div>

      <div className="space-y-[var(--space-3)]">
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${scorePercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              backgroundColor: scoreColor,
              boxShadow: `0 0 10px ${scoreColor}44`,
            }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider">
          <span className="text-muted-foreground">Weight <span className="text-[var(--text)] ml-1">{weightPercent}%</span></span>
          <span className="text-muted-foreground">Impact <span className="ml-1 font-bold" style={{ color: scoreColor }}>+{contributingPoints} PTS</span></span>
        </div>
      </div>
    </div>
  );
};

const LayerScoreCards: React.FC<{
  result: TabProps["result"];
}> = ({ result }) => {
  // Determine if we are in Oracle mode (D-dimensions) or Audit mode (L-dimensions)
  const isOracle = result.dimensions.some((d) => d.key.startsWith("D"));

  // Define weights for each dimension model
  const weights = isOracle
    ? {
        D1: 0.35, // Task Automatability
        D2: 0.25, // AI Tool Maturity
        D3: 0.15, // Human Amplification
        D4: 0.1, // Experience Shield
        D5: 0.08, // Country Exposure
        D6: 0.07, // Social Capital Moat
      }
    : {
        L1: 0.3, // Financial & Company Health
        L2: 0.25, // Layoff History
        L3: 0.2, // Role Displacement Risk
        L4: 0.12, // Industry Baseline
        L5: 0.13, // Regional Headwinds
      };

  const calculateContribution = (layer: string, score: number) => {
    const weight = weights[layer as keyof typeof weights];
    return score * weight * 100; // Points contribution to final score (score is 0-1)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {result.dimensions.map((dim) => (
        <LayerScoreCard
          key={dim.key}
          layer={dim.key}
          label={dim.label}
          score={dim.score / 100}
          weight={weights[dim.key as keyof typeof weights] || 0}
          contribution={calculateContribution(dim.key, dim.score / 100)}
          icon={dim.key === "L1" ? BarChart : undefined}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Score Confidence Interval display
// ---------------------------------------------------------------------------

interface ScoreConfidenceIntervalProps {
  score: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
  confidencePercent: number;
}

const ScoreConfidenceInterval: React.FC<ScoreConfidenceIntervalProps> = ({
  score,
  confidenceInterval,
  confidencePercent,
}) => {
  const { low, high } = confidenceInterval;
  const scorePercent = Math.round(score * 100);
  const lowPercent = Math.round(low * 100);
  const highPercent = Math.round(high * 100);
  const range = highPercent - lowPercent;

  const scoreColor = getScoreColor(score);

  return (
    <div
      className="confidence-interval glass-panel-heavy"
      style={{
        padding: "var(--space-6)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-2)",
      }}
    >
      <div className="flex justify-between items-center mb-[var(--space-6)]">
        <div className="label-sm text-[var(--cyan)] tracking-[0.2em] font-black uppercase">Certainty Calibration</div>
        <div className="px-[var(--space-2)] py-1 bg-white/5 rounded text-[10px] font-mono text-muted-foreground">
          {confidencePercent}% CONFIDENCE
        </div>
      </div>

      <div className="h-12 relative flex items-center mb-6 px-1">
        {/* Base Track */}
        <div className="w-full bg-white/5 h-1.5 rounded-full relative">
          {/* Interval Range */}
          <motion.div
            className="absolute h-full rounded-full"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              left: `${lowPercent}%`,
              width: `${range}%`,
              backgroundColor: `${scoreColor}33`,
              originX: 0,
            }}
          />

          {/* Low Marker */}
          <div
            className="absolute h-6 w-[1px]"
            style={{
              left: `${lowPercent}%`,
              top: '-10px',
              backgroundColor: 'var(--border-2)',
            }}
          >
             <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-muted-foreground">{lowPercent}%</div>
          </div>

          {/* High Marker */}
          <div
            className="absolute h-6 w-[1px]"
            style={{
              left: `${highPercent}%`,
              top: '-10px',
              backgroundColor: 'var(--border-2)',
            }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-muted-foreground">{highPercent}%</div>
          </div>

          {/* Current Score Pin */}
          <motion.div
            className="absolute h-8 w-1 flex flex-col items-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: "spring" }}
            style={{
              left: `${scorePercent}%`,
              top: '-12px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff] mb-1" />
            <div className="w-[2px] h-full bg-white/80" />
            <div className="mt-2 font-black text-xs" style={{ color: scoreColor }}>{scorePercent}%</div>
          </motion.div>
        </div>
      </div>

      {range > 30 ? (
        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-3 mt-4">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-amber-200/70">
            <strong>Ambiguity Warning:</strong> Dimensional signal variance exceeds 30%. Human-in-the-loop validation of "Financial Health" markers is recommended.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-start gap-3 mt-4">
          <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-emerald-200/70">
            <strong>Signal Convergence:</strong> High internal consistency across all 5 risk vectors. Predictive resolution is stable.
          </p>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// RiskBreakdownTab main component
// ---------------------------------------------------------------------------

export const RiskBreakdownTab: React.FC<TabProps> = ({
  result,
  companyData,
  onDownload,
  onRecalculate,
}) => {
  const { width } = useAdaptiveSystem();
  const isMobile = width < 768;

  const radarDimensions = useMemo(() => {
    return result.dimensions.map((dim) => {
      const dimInfo: Record<string, string> = {
        L1: "Financial",
        L2: "Layoffs",
        L3: "Industry",
        L4: "Role",
        L5: "Regional",
        D1: "Automatability",
        D2: "AI Maturity",
        D3: "Human Moat",
        D4: "Experience",
        D5: "Country",
        D6: "Social",
      };

      return {
        key: dim.key,
        label: dimInfo[dim.key] || dim.key,
        score: dim.score, // already 0-100
      };
    });
  }, [result.dimensions]);

  return (
    <section aria-labelledby="risk-breakdown-heading" className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <SectionHeader
            title="Risk Dimension Breakdown"
            description={`Your risk score is calculated from ${result.dimensions.length} key dimensions, each weighted by its impact on future career stability.`}
          />

          <LayerScoreCards result={result} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col">
            <SectionHeader
              title="Dimension Radar"
              description="Visual representation of your risk across the 5 dimensions. Each axis represents one risk dimension, with higher values indicating higher risk."
            />
            <div className="flex-1 flex items-center justify-center p-4">
              <DimensionRadar
                dimensions={radarDimensions}
                size={isMobile ? 280 : 320}
                color="var(--cyan)"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <SectionHeader
              title="Score Confidence"
              description="The range within which your true risk score likely falls, based on data quality and signal coherence."
            />
            <div className="flex-1">
              <ScoreConfidenceInterval
                score={result.total}
                confidenceInterval={result.confidenceInterval}
                confidencePercent={result.confidencePercent}
              />

              <div className="mt-6">
                <SectionHeader
                  title="Data Quality Metrics"
                  description="Metrics that indicate the quality and freshness of the data used to calculate your risk score."
                />

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="p-4 bg-muted rounded-lg border">
                    <StatCard
                      label="Signal Freshness"
                      value={`${result.dataFreshness.ageInDays}d avg`}
                      icon={Clock}
                    />
                  </div>
                  <div className="p-4 bg-muted rounded-lg border">
                    <StatCard
                      label="Live Signals"
                      value={`${result.signalQuality.liveSignals} / 17`}
                      icon={Activity}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CollapsibleSection title="Key Risk Drivers Analysis">
          <KeyRiskDriversPanel
            breakdown={result.breakdown as any}
            roleTitle={result.workTypeKey}
            companyName={result.companyName}
            dataQuality={
              result.signalQuality.liveSignals > 12
                ? "live"
                : result.signalQuality.liveSignals > 5
                  ? "partial"
                  : "fallback"
            }
          />
        </CollapsibleSection>
      </motion.div>
    </section>
  );
};

export default RiskBreakdownTab;
