// CareerTwinCard.tsx
// Shows top career twin matches from the CareerTwinNetwork after an audit.
// Displays similarity %, role transition, income change, and months to transition.

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Clock, ArrowRight, Sparkles } from "lucide-react";
import { findCareerTwins, type CareerTwinMatch } from "../services/careerTwinNetwork";

interface CareerTwinCardProps {
  userRole: string;
  userExperience: number;
  userRiskScore: number;
  userCountry?: string;
  topN?: number;
}

const IncomeChangeBadge: React.FC<{ pct: number | null }> = ({ pct }) => {
  if (pct === null) return null;
  const positive = pct >= 0;
  return (
    <span
      className={`text-[10px] font-black px-2 py-0.5 rounded ${
        positive
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
          : "bg-red-500/15 text-red-400 border border-red-500/25"
      }`}
    >
      {positive ? "+" : ""}{pct}% income
    </span>
  );
};

export const CareerTwinCard: React.FC<CareerTwinCardProps> = ({
  userRole,
  userExperience,
  userRiskScore,
  userCountry = "India",
  topN = 3,
}) => {
  const twins: CareerTwinMatch[] = useMemo(
    () => findCareerTwins(userRole, userExperience, userRiskScore, userCountry, topN),
    [userRole, userExperience, userRiskScore, userCountry, topN],
  );

  if (twins.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="font-bold text-sm tracking-tight">Career Twin Matches</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              People who started where you are — see how they transitioned
            </div>
          </div>
          <span className="ml-auto text-[10px] font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
            {twins.length} MATCHES
          </span>
        </div>
      </div>

      {/* Twin cards */}
      <div className="divide-y divide-white/5">
        {twins.map((match, i) => {
          const { twin, similarityPct, matchReasons } = match;
          return (
            <motion.div
              key={twin.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5"
            >
              {/* Role transition headline */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-semibold text-muted-foreground">{twin.fromRole}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-bold">{twin.toRole}</span>
                {twin.isVerified && (
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Metrics row */}
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="font-bold text-cyan-400">{similarityPct}%</span> match
                </div>
                <IncomeChangeBadge pct={twin.incomeChangePct} />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {twin.monthsToTransition}mo to transition
                </div>
              </div>

              {/* What worked */}
              <div className="text-xs text-muted-foreground leading-relaxed bg-white/5 rounded-lg px-3 py-2">
                <TrendingUp className="w-3 h-3 text-emerald-400 inline mr-1.5 mb-0.5" />
                {twin.whatWorked}
              </div>

              {/* Match reasons */}
              {matchReasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {matchReasons.map((r, j) => (
                    <span key={j} className="text-[9px] bg-white/5 text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-white/10 bg-white/2">
        <p className="text-[10px] text-muted-foreground text-center">
          Based on {twins[0]?.twin?.fromCountry ?? userCountry} career transitions in our network ·{" "}
          <span className="text-cyan-400 cursor-pointer hover:underline">Submit your transition</span>
        </p>
      </div>
    </div>
  );
};

export default CareerTwinCard;
