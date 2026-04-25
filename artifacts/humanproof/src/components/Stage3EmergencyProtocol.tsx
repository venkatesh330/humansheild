// Stage3EmergencyProtocol.tsx
// The 6-week crisis protocol for Stage 3 collapse conditions.
// "Treat as active emergency" is correct but useless without a specific plan.
// This component gives the user exactly what to do, week by week.
// Renders in OverviewTab when collapseStage === 3.

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle, Circle, ChevronDown, ChevronUp,
  DollarSign, UserCheck, Send, TrendingUp,
} from "lucide-react";
import type { FinancialProfile } from "../services/financialContextService";

interface WeekAction {
  id: string;
  text: string;
  critical: boolean; // must-do vs nice-to-have
}

interface WeekPlan {
  week: string;
  title: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  actions: WeekAction[];
  milestone: string;
}

interface Props {
  companyName: string;
  roleKey: string;
  score: number;
  financialProfile?: FinancialProfile | null;
}

const STORAGE_KEY_PREFIX = "hp_stage3_checklist_";

function buildWeekPlan(companyName: string, _roleKey: string, score: number, fp: FinancialProfile | null): WeekPlan[] {
  const hasRunway = fp?.emergencyRunway && fp.emergencyRunway !== "Unknown";
  const isConservative = fp?.riskAppetite === "conservative";

  return [
    {
      week: "Week 1",
      title: "Financial Preparation",
      Icon: DollarSign,
      color: "#ef4444",
      milestone: "Emergency fund documented. Budget reviewed.",
      actions: [
        { id: "w1-1", text: `Calculate your exact monthly burn rate — rent, food, EMIs, subscriptions. Write it down.`, critical: true },
        {
          id: "w1-2",
          text: hasRunway
            ? `Your current runway: ${fp!.emergencyRunway}. Extend to at least 3 months if possible — cancel non-essential subscriptions today.`
            : "Audit your savings: how many months of expenses can you cover? Target minimum 3 months.",
          critical: true,
        },
        { id: "w1-3", text: "Do NOT resign yet. Do NOT tell colleagues. Do NOT make large purchases.", critical: true },
        {
          id: "w1-4",
          text: isConservative
            ? "Notify your partner or one trusted family member — they need to know the situation for financial planning."
            : "Notify one trusted person (partner/family) about the situation.",
          critical: false,
        },
      ],
    },
    {
      week: "Week 2",
      title: "Profile Activation",
      Icon: UserCheck,
      color: "#f97316",
      milestone: "CV sent to 2 reviewers. 5 outreach emails sent.",
      actions: [
        { id: "w2-1", text: 'Update your CV: every role needs 2–3 impact bullets in this format: "I did X, which drove Y (measured outcome)." No metrics = invisible.', critical: true },
        { id: "w2-2", text: 'LinkedIn: update headline and summary. Enable "Open to Work" in career interests — set to Hidden from current employer.', critical: true },
        { id: "w2-3", text: `Email 5 warm professional contacts — NOT asking for jobs yet. Message: "Reconnecting — I'm exploring options in [area]. Would love to catch up."`, critical: true },
        { id: "w2-4", text: `Identify 3 target companies and 1 specific role type. These guide your network conversations in weeks 3–4.`, critical: false },
      ],
    },
    {
      week: "Weeks 3–4",
      title: "Parallel Pursuit",
      Icon: Send,
      color: "#f59e0b",
      milestone: "First interview scheduled. 6+ applications submitted.",
      actions: [
        { id: "w3-1", text: "Apply to minimum 3 roles per week — not maximum. Targeted applications only. 3 quality applications > 30 spray-and-pray.", critical: true },
        { id: "w3-2", text: "One informational conversation per week with someone at a target company. NOT a job interview — ask about the work.", critical: true },
        { id: "w3-3", text: "Prepare 3 STAR-format stories (Situation, Task, Action, Result). Behavioral interviews at 90% of companies will use these.", critical: true },
        {
          id: "w3-4",
          text: isConservative
            ? "If possible, complete one free micro-certification directly relevant to your target role (DeepLearning.AI, Google, HubSpot — all free)."
            : "Complete one micro-certification relevant to your target role (max 2 weeks, max ₹3,000 investment).",
          critical: false,
        },
      ],
    },
    {
      week: "Weeks 5–6",
      title: "Consolidation & Decision",
      Icon: TrendingUp,
      color: "#10b981",
      milestone: "Offer in hand OR 3+ active conversations in pipeline.",
      actions: [
        { id: "w5-1", text: "Follow up on all applications: a single-sentence LinkedIn or email check-in. Most rejections are silent — following up surfaces hidden opportunities.", critical: true },
        { id: "w5-2", text: "If you have an offer: DO NOT accept the first number. Counter with your target + 10–15%. The worst they say is no.", critical: true },
        { id: "w5-3", text: `If no offer yet: expand target list by 2 additional companies. Lower your role-level threshold by one step (senior → mid-senior is fine temporarily).`, critical: true },
        { id: "w5-4", text: `Review notice period obligations at ${companyName}. Understanding your exit timeline is a negotiating asset, not a liability.`, critical: false },
        { id: "w5-5", text: "If score is still above 80 after 6 weeks of this protocol and no offer exists: contact a career coach with outplacement experience. This is a resource investment, not a defeat.", critical: false },
      ],
    },
  ];
}

export const Stage3EmergencyProtocol: React.FC<Props> = ({
  companyName,
  roleKey,
  score,
  financialProfile,
}) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${companyName.toLowerCase().replace(/\s+/g, "_")}`;
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [expandedWeek, setExpandedWeek] = useState<string | null>("Week 1");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCompleted(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [storageKey]);

  const toggleAction = (id: string) => {
    setCompleted(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
  };

  const weeks = useMemo(
    () => buildWeekPlan(companyName, roleKey, score, financialProfile ?? null),
    [companyName, roleKey, score, financialProfile],
  );

  const totalActions = weeks.reduce((s, w) => s + w.actions.length, 0);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((completedCount / totalActions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-red-500/40"
      style={{ background: "rgba(239,68,68,0.06)" }}
    >
      {/* Header */}
      <div className="p-5 border-b border-red-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/15 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-red-400 uppercase tracking-widest mb-1">
              Stage 3 — 6-Week Emergency Protocol
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {companyName} shows imminent collapse signals. Generic advice fails at Stage 3.
              This protocol tells you exactly what to do, week by week.
              Complete in order — sequence matters.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 8px rgba(52,211,153,0.5)" }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
            {completedCount}/{totalActions} actions · {pct}%
          </span>
        </div>
      </div>

      {/* Week cards */}
      <div className="divide-y divide-white/5">
        {weeks.map((week) => {
          const isExpanded = expandedWeek === week.week;
          const weekCompleted = week.actions.filter(a => completed[a.id]).length;
          const weekTotal = week.actions.length;
          const weekDone = weekCompleted === weekTotal;
          const Icon = week.Icon;

          return (
            <div key={week.week}>
              <button
                onClick={() => setExpandedWeek(isExpanded ? null : week.week)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: `${week.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: week.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: week.color }}>
                      {week.week}
                    </span>
                    <span className="text-sm font-bold">{week.title}</span>
                    {weekDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{week.milestone}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground">{weekCompleted}/{weekTotal}</span>
                  {isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                    : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {week.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => toggleAction(action.id)}
                        className="w-full flex items-start gap-3 p-3 rounded-xl text-left hover:bg-white/5 transition-colors"
                        style={{ borderLeft: action.critical ? `3px solid ${week.color}` : "3px solid transparent" }}
                      >
                        {completed[action.id]
                          ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          : <Circle className="w-4 h-4 text-muted-foreground opacity-40 flex-shrink-0 mt-0.5" />}
                        <span className={`text-xs leading-relaxed ${completed[action.id] ? "line-through opacity-60 text-muted-foreground" : "text-[var(--text-2)]"}`}>
                          {action.text}
                          {action.critical && (
                            <span className="ml-1.5 text-[9px] font-black uppercase tracking-wider"
                              style={{ color: week.color }}>
                              CRITICAL
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-red-500/20">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed opacity-70">
          This protocol is based on observed transition timelines. The 6-week window is an estimate — some transitions take 4 weeks, others 12. The protocol creates the best conditions for the fastest possible outcome.
        </p>
      </div>
    </motion.div>
  );
};

export default Stage3EmergencyProtocol;
