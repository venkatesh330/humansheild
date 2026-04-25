// OverviewTab.tsx — Executive snapshot
// Answers "How risky is my situation?" in ≤3 seconds.
// Integrates: score delta attribution, salary risk model, phase-aware urgency,
//             inaction scenario, conflict disclosure, and prediction feedback.

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, Zap, Clock, ShieldCheck, Activity,
  ThumbsUp, ThumbsDown, ArrowRight, AlertCircle,
} from "lucide-react";
import { submitPredictionFeedback } from "@/services/scoreSyncService";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import { ScoreRing } from "@/components/ScoreRing";
import { DataQualityBanner } from "../../../components/DataQualityBanner";
import { ConflictDisclosurePanel } from "../../../components/ConflictDisclosurePanel";
import { ScoreDeltaExplainer } from "../../components/ScoreDeltaExplainer";
import { SalaryAtRiskPanel } from "../../components/SalaryAtRiskPanel";
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
import { getAttributedDelta } from "@/services/scoreDeltaService";
import { Stage3EmergencyProtocol } from "../../components/Stage3EmergencyProtocol";
import {
  loadFinancialContext,
  deriveFinancialProfile,
} from "@/services/financialContextService";

// ── Collapse stage-to-urgency multiplier ──────────────────────────────────────
// The score gives the role-baseline timeline. Company collapse stage compresses it.
// Stage 1 (early warning): × 0.6 — "your 18-month window is actually 10–11 months"
// Stage 2 (active signals): × 0.4 — "your 18-month window is actually 7 months"
// Stage 3 (imminent):       × 0.2 — "you have 3–4 months maximum"
type CollapseStage = 1 | 2 | 3 | null;

interface PhaseAwareUrgency {
  baseTimeline: string;
  adjustedTimeline: string | null;
  multiplier: number;
  hasAdjustment: boolean;
  adjustmentReason: string;
}

function computePhaseAwareUrgency(
  score: number,
  collapseStage: CollapseStage,
): PhaseAwareUrgency {
  const baseTimeline = getTimeline(score);
  if (!collapseStage) {
    return {
      baseTimeline,
      adjustedTimeline: null,
      multiplier: 1,
      hasAdjustment: false,
      adjustmentReason: '',
    };
  }

  // Parse base months from timeline string, e.g. "12–18 months" → 15 midpoint
  const baseMonths = score >= 80 ? 9 : score >= 60 ? 18 : score >= 40 ? 30 : 42;
  const MULTIPLIERS: Record<number, number> = { 1: 0.6, 2: 0.4, 3: 0.2 };
  const multiplier = MULTIPLIERS[collapseStage] ?? 1;
  const adjustedMonths = Math.round(baseMonths * multiplier);

  const adjustedTimeline = adjustedMonths <= 3 ? 'Under 3 months'
    : adjustedMonths <= 6 ? '3–6 months'
    : adjustedMonths <= 12 ? '6–12 months'
    : `~${adjustedMonths} months`;

  const REASONS: Record<number, string> = {
    1: 'Stage 1 collapse signals detected — early warning multiplier (0.6×) applied to base timeline',
    2: 'Stage 2 collapse signals active — displacement multiplier (0.4×) applied to base timeline',
    3: 'Stage 3 imminent risk — critical multiplier (0.2×) applied. Timeline is highly compressed.',
  };

  return {
    baseTimeline,
    adjustedTimeline,
    multiplier,
    hasAdjustment: true,
    adjustmentReason: REASONS[collapseStage],
  };
}

// ── Inaction scenario ─────────────────────────────────────────────────────────

function buildInactionScenario(result: HybridResult): string | null {
  const score = result.total;
  const roleKey = result.workTypeKey;
  const company = result.companyName ?? 'your company';
  const intel = getCareerIntelligence(roleKey);

  if (intel?.inactionScenario) return intel.inactionScenario;

  const topDim = [...(result.dimensions ?? [])].sort((a, b) => b.score - a.score)[0];
  const topDimName = topDim?.label ?? 'Role Displacement';

  // Personalization 3 (v4.0): UniquenessDepth produces categorically different inaction scenarios.
  // The three levels face structurally different displacement dynamics — generic roles face the fastest
  // displacement, functional specialists have a medium window, critical knowledge holders have the longest
  // window but face a different threat (knowledge extraction rather than immediate automation).
  const uniquenessDepth = (result as any).uniquenessDepth as string | undefined;

  if (uniquenessDepth === 'critical_knowledge') {
    return `If you do nothing, your irreplaceable institutional knowledge provides significant near-term protection — you cannot be immediately replaced because a targeted hire cannot replicate what you know. However, companies systematically extract this knowledge through documentation projects, system modernisation, and AI-assisted knowledge capture programs. Your protection window is tied to the migration timeline — typically 18–36 months for this type of knowledge. After migration completes, your protection disappears rapidly. Act now: transfer your institutional authority to a new domain while your current knowledge still has leverage value. This window will not remain open.`;
  }

  if (uniquenessDepth === 'functional_specialist') {
    return `If you do nothing, your specialised expertise provides moderate protection — you cannot be immediately replaced because targeted hiring is required. However, within 18–24 months the company can hire an AI-capable replacement who performs your function at higher productivity. Your specialist moat erodes as AI capability in your domain advances and the market for AI-augmented specialists grows. The protection window is longer than average but not permanent. Begin transitioning your specialisation to AI-adjacent work now — the augmentation window is open, and it will close.`;
  }

  // Generic role — most urgency, fastest displacement timeline
  if (score >= 75) {
    return `Without intervention, roles in this category at ${company} face a median displacement horizon of 12–18 months. AI tools have reached production deployment maturity for this function. Roles without demonstrated AI augmentation skills are cut first in each restructuring cycle — they are the easiest to justify removing because a smaller AI-capable team produces the same output. The dominant signal — ${topDimName} — is at ${topDim?.score}/100. Employees who waited for an official announcement had 4–6 fewer months to reskill than those who started proactively.`;
  }
  if (score >= 55) {
    return `At ${score}/100, you are in the augmentation window — AI is absorbing the execution layer of your role, but human oversight and judgment still drive value. This window typically lasts 18–36 months before market expectations shift. Those who upskill during this period maintain leverage. Those who wait face accelerated commoditization when the window closes.`;
  }
  if (score >= 35) {
    return `Your current score of ${score}/100 reflects moderate but manageable AI exposure. Inaction is low-risk short-term, but cumulative. The ${topDimName} dimension at ${topDim?.score}/100 could accelerate if ${company} increases AI investment or sector adoption accelerates. Annual reassessment and 2–3 hours/week of upskilling is the minimum recommended response.`;
  }
  return `At ${score}/100, your role has strong structural resilience. Inaction carries minimal near-term risk. Your primary protection is the ${topDimName} dimension. Maintain depth here and monitor sector AI adoption trends annually.`;
}

// ── Quick actions ─────────────────────────────────────────────────────────────

function buildQuickActions(result: HybridResult): Array<{ text: string; urgency: 'high' | 'medium' | 'low' }> {
  const score = result.total;
  const intel = getCareerIntelligence(result.workTypeKey);
  const actions: Array<{ text: string; urgency: 'high' | 'medium' | 'low' }> = [];

  if (score >= 70) {
    actions.push({ text: 'Update resume + LinkedIn this week — target 2 warm-contact conversations before any announcement', urgency: 'high' });
    actions.push({ text: 'Ensure 6–9 months of emergency fund is liquid — do not wait for confirmation', urgency: 'high' });
  }
  if (score >= 50) {
    actions.push({
      text: intel?.careerPaths?.[0]
        ? `Begin researching "${intel.careerPaths[0].role}" — ${intel.careerPaths[0].riskReduction}% risk reduction, ${intel.careerPaths[0].timeToTransition} transition`
        : 'Map 2 adjacent roles with lower AI exposure in your industry this week',
      urgency: score >= 70 ? 'high' : 'medium',
    });
    actions.push({ text: 'Identify 1 task AI is already doing in your role — position yourself as its supervisor, not its executor', urgency: 'medium' });
  }
  const topSafe = intel?.skills?.safe?.[0];
  if (topSafe) {
    actions.push({ text: `Deepen "${topSafe.skill}" (LTV: ${topSafe.longTermValue}/100) — compound the one skill AI cannot replicate`, urgency: 'low' });
  } else {
    actions.push({ text: 'Build visible cross-functional presence — present work to adjacent teams monthly', urgency: 'low' });
  }
  return actions.slice(0, 3);
}

// ── Sub-components ────────────────────────────────────────────────────────────

const VerdictBadge: React.FC<{ score: number }> = ({ score }) => {
  const verdict = getVerdict(score);
  const config: Record<string, { color: string; bg: string; Icon: typeof Shield }> = {
    'Critical risk': { color: 'var(--red)', bg: 'rgba(239,68,68,0.1)', Icon: Zap },
    'High risk':     { color: 'var(--red)', bg: 'rgba(239,68,68,0.1)', Icon: Zap },
    'Moderate risk': { color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)', Icon: AlertTriangle },
    'Low risk':      { color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)', Icon: Shield },
  };
  const { color, bg, Icon } = config[verdict] ?? config['Moderate risk'];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-lg)', background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 20px ${color}11`, color }} role="status">
      <Icon className="w-5 h-5 shrink-0" />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span className="label-xs font-black tracking-[0.15em]">{verdict.toUpperCase()}</span>
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-70" style={{ marginTop: '2px' }}>
          {getUrgency(score)} ACTION REQUIRED
        </span>
      </div>
    </div>
  );
};

const TimelineCard: React.FC<{ score: number; phaseUrgency: PhaseAwareUrgency }> = ({
  score,
  phaseUrgency,
}) => {
  const scoreColor = getScoreColor(score);
  return (
    <div className="glass-panel" style={{ padding: 'var(--space-5) var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-2)' }}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="label-xs text-muted-foreground mb-1">
            {phaseUrgency.hasAdjustment ? 'Adjusted Timeline' : 'Exposure Horizon'}
          </div>
          <div className="text-xl font-black tracking-tight" style={{ color: phaseUrgency.hasAdjustment ? 'var(--red)' : 'var(--text)' }}>
            {phaseUrgency.adjustedTimeline ?? phaseUrgency.baseTimeline}
          </div>
          {phaseUrgency.hasAdjustment && (
            <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
              Base: {phaseUrgency.baseTimeline}
            </div>
          )}
        </div>
        <div style={{ paddingLeft: 'var(--space-4)', borderLeft: '1px solid var(--border-2)' }}>
          <div className="label-xs text-muted-foreground mb-1">Action Urgency</div>
          <div className="text-xl font-black tracking-tight" style={{ color: scoreColor }}>
            {getUrgency(score)}
          </div>
        </div>
      </div>
      {phaseUrgency.hasAdjustment && (
        <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-amber-400 leading-relaxed">
          ⚠ {phaseUrgency.adjustmentReason}
        </div>
      )}
    </div>
  );
};

const QuickStatsRow: React.FC<{
  stats: Array<{ label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; hint?: string }>;
}> = ({ stats }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
    {stats.map((s, i) => (
      <div key={i} className="glass-panel-heavy" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-2)' }} title={s.hint}>
        <StatCard label={s.label} value={s.value} icon={s.icon} />
      </div>
    ))}
  </div>
);

const InactionPanel: React.FC<{ scenario: string; score: number }> = ({ scenario, score }) => {
  const color = score >= 70 ? 'var(--red)' : score >= 50 ? 'var(--amber)' : 'var(--cyan)';
  const title = score >= 70 ? '⚠ What Happens If You Do Nothing'
    : score >= 50 ? '⏳ The Cost of Waiting'
    : 'ℹ Monitoring Recommendation';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="rounded-xl border p-5 mt-4" style={{ background: `${color}08`, borderColor: `${color}25` }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>{title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{scenario}</p>
    </motion.div>
  );
};

const QuickActionsRow: React.FC<{
  actions: Array<{ text: string; urgency: 'high' | 'medium' | 'low' }>;
}> = ({ actions }) => {
  const uColor = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--cyan)' };
  const uLabel = { high: 'NOW', medium: '30 DAYS', low: 'ONGOING' };
  return (
    <div className="mt-6">
      <div className="label-xs text-muted-foreground uppercase tracking-widest mb-3">Top Actions Based on Your Profile</div>
      <div className="space-y-2">
        {actions.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: uColor[a.urgency] }} />
            <span className="text-xs text-muted-foreground leading-relaxed flex-1">{a.text}</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: `${uColor[a.urgency]}15`, color: uColor[a.urgency], border: `1px solid ${uColor[a.urgency]}25` }}>
              {uLabel[a.urgency]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

export interface OverviewTabProps extends TabProps {}

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

  // Phase-aware urgency: apply collapse stage multiplier to base timeline
  const collapseStage = (result.collapseStage ?? null) as CollapseStage;
  const phaseUrgency = useMemo(
    () => computePhaseAwareUrgency(result.total, collapseStage),
    [result.total, collapseStage],
  );

  // Load financial context — passed to Stage3EmergencyProtocol to adapt its content
  const financialCtxForStage3 = useMemo(() => loadFinancialContext(), []);
  const financialProfileForStage3 = useMemo(
    () => financialCtxForStage3 ? deriveFinancialProfile(financialCtxForStage3, result.total) : null,
    [financialCtxForStage3, result.total],
  );

  // Score delta attribution for returning users
  const scoreDelta = useMemo(() => {
    const bd = result.breakdown as any;
    return getAttributedDelta(
      result.workTypeKey,
      result.total,
      { L1: bd.L1, L2: bd.L2, L3: bd.L3, L4: bd.L4, L5: bd.L5, D6: bd.D6, D7: bd.D7 },
      result.experience,
      result.countryKey,
      result.companyName,
    );
  }, [result]);

  const inactionScenario = useMemo(() => buildInactionScenario(result), [result]);
  const quickActions = useMemo(() => buildQuickActions(result), [result]);

  const tierContext = useMemo(() => {
    const score = result.total;
    if (score >= 75) return 'Top 20% highest-risk profiles in our network';
    if (score >= 55) return 'Middle 40% — moderate risk cohort';
    if (score >= 35) return 'Lower 30% — below-average exposure';
    return 'Bottom 10% — strongest resilience cohort';
  }, [result.total]);

  const quickStats = useMemo(() => [
    { label: 'Confidence', value: `${result.confidencePercent}%`, icon: ShieldCheck, hint: `Score reliable within ±${Math.round((result.confidenceInterval.high - result.confidenceInterval.low) / 2)} pts` },
    { label: 'Live Signals', value: result.signalQuality.liveSignals, icon: Activity, hint: `${result.signalQuality.heuristicSignals} heuristic signals also used` },
    { label: 'Data Age', value: `${result.dataFreshness.ageInDays}d`, icon: Clock, hint: result.dataFreshness.stalenessWarning ?? 'Data freshness within acceptable range' },
    { label: 'Overrides', value: result.consensusSnapshot?.overridesApplied.length || 0, icon: AlertTriangle, hint: 'Kill-switch safety overrides applied during scoring' },
  ], [result]);

  return (
    <section aria-labelledby="overview-heading" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Unknown company warning */}
        {companyData?.source?.includes('Fallback') && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-400">Limited Company Intelligence</h4>
                <p className="text-sm opacity-80 mt-1">
                  "{result.companyName}" was not found in our database. Score reflects role and sector risk only — not employer-specific signals. Accuracy bounds are ±25–30 pts. AI narrative has been replaced with honest scope framing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality Banner */}
        {result && (
          <DataQualityBanner
            freshnessReport={{ avgSignalAge: result.dataFreshness.ageInDays, oldestSignalAge: result.dataFreshness.ageInDays, percentLive: result.signalQuality.liveSignals / 17, percentHeuristic: result.signalQuality.heuristicSignals / 17 }}
            confidencePercent={result.confidencePercent}
            confidenceInterval={{ low: result.confidenceInterval.low, high: result.confidenceInterval.high }}
            hasConflicts={result.signalQuality.hasConflicts}
            conflictCount={result.signalQuality.conflictingSignals.length}
            primarySource={(result.consensusSnapshot?.primarySource as 'live' | 'db' | 'hybrid') || 'db'}
            overridesApplied={result.consensusSnapshot?.overridesApplied || []}
          />
        )}

        {/* Score Delta Explainer — only shown for returning users */}
        {scoreDelta && Math.abs(scoreDelta.delta) >= 1 && (
          <div className="mb-6">
            <ScoreDeltaExplainer
              delta={scoreDelta}
              companyName={result.companyName}
              daysAgo={scoreDelta.daysAgo}
            />
          </div>
        )}

        {/* Score Ring + Verdict */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
          <ScoreRing score={result.total} color={scoreColor} size={isMobile ? 140 : 200} isMobile={isMobile} />
          <div style={{ textAlign: isMobile ? 'center' : 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1 }}>
            <VerdictBadge score={result.total} />
            <TimelineCard score={result.total} phaseUrgency={phaseUrgency} />
            <div className="text-xs text-muted-foreground font-mono opacity-60">{tierContext}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6"><QuickStatsRow stats={quickStats} /></div>

        {/* Inaction Scenario */}
        {inactionScenario && <InactionPanel scenario={inactionScenario} score={result.total} />}

        {/* Stage 3 Emergency Protocol — replaces generic quick actions when crisis detected */}
        {collapseStage === 3 ? (
          <div className="mt-4">
            <Stage3EmergencyProtocol
              companyName={result.companyName ?? 'your company'}
              roleKey={result.workTypeKey}
              score={result.total}
              financialProfile={financialProfileForStage3}
            />
          </div>
        ) : (
          /* Quick Actions — shown when NOT in Stage 3 */
          <QuickActionsRow actions={quickActions} />
        )}

        {/* Conflict Disclosure */}
        {result.signalQuality.hasConflicts && (
          <div className="mt-6">
            <ConflictDisclosurePanel
              conflicts={result.signalQuality.conflictingSignals}
              overrides={result.consensusSnapshot?.overridesApplied || []}
              overallImpact={result.consensusSnapshot?.overridesApplied?.length ? 'score_increased' : 'reduced_confidence'}
            />
          </div>
        )}

        {/* Salary at Risk — conversion feature */}
        <div className="mt-8">
          <SalaryAtRiskPanel
            riskScore={result.total}
            roleKey={result.workTypeKey}
            companyName={result.companyName}
            currency="INR"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 flex-wrap">
          {onDownload && (
            <button className="btn btn-primary btn-sm" style={{ minHeight: '44px' }} onClick={onDownload}>
              Download Full Dossier
            </button>
          )}
          {onRecalculate && (
            <button className="btn btn-secondary btn-sm" style={{ minHeight: '44px' }} onClick={onRecalculate}>
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
              ✓ Thanks — your feedback recalibrates future predictions for this role category.
            </p>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => handleFeedback('correct')} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors text-xs font-semibold">
                <ThumbsUp className="w-3.5 h-3.5" /> Yes, accurate
              </button>
              <button onClick={() => handleFeedback('incorrect')} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-xs font-semibold">
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
