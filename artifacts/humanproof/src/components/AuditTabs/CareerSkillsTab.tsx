// CareerSkillsTab.tsx
// Career trajectory and skills analysis — Answers "What should I focus on?"
// Displays: AI skill analysis, skill risk gauge, upskilling roadmap, skill simulator.

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import AIRiskSkillMatrix from "@/components/AIRiskSkillMatrix";
import StrategicRoadmap from "@/components/StrategicRoadmap";
import { SectionHeader } from "./common/SectionHeader";
import { CollapsibleSection } from "./common/CollapsibleSection";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import { getCareerIntelligence } from "@/data/intelligence";
import { getScoreColor } from "@/data/riskEngine";
import type { TabProps } from "./common/types";

// ---------------------------------------------------------------------------
// SkillRiskGauge - Circular gauge showing risk/resilience
// ---------------------------------------------------------------------------

interface SkillRiskGaugeProps {
  score: number;
  safeCriticalSkills: number;
  atRiskSkills: number;
  obsoleteSkills: number;
}

const SkillRiskGauge: React.FC<SkillRiskGaugeProps> = ({
  score,
  safeCriticalSkills,
  atRiskSkills,
  obsoleteSkills,
}) => {
  const resilience = Math.max(100 - score, 30); // Inverse of risk score, min 30%
  const scoreColor = getScoreColor(score / 100);

  return (
    <div className="skill-risk-gauge glass-panel-heavy p-[var(--space-6)] flex flex-col items-center">
      <div
        className="relative w-full aspect-square"
        style={{ maxWidth: "200px" }}
      >
        <svg viewBox="0 0 100 100" className="drop-shadow-2xl">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="276.5"
            initial={{ strokeDashoffset: 276.5 }}
            animate={{ strokeDashoffset: 276.5 * (1 - resilience / 100) }}
            transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center", filter: `drop-shadow(0 0 12px ${scoreColor}44)` }}
          />
          <circle cx="50" cy="50" r="40" fill={scoreColor} fillOpacity="0.03" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-4xl font-black tracking-tighter"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ color: scoreColor }}
          >
            {resilience.toFixed(0)}%
          </motion.span>
          <span className="label-xs text-muted-foreground opacity-50 font-black" style={{ fontSize: '8px' }}>RESILIENCE INDEX</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[var(--space-6)] w-full mt-[var(--space-8)] pt-[var(--space-6)] border-t border-white/5">
        <div className="flex flex-col items-center gap-[var(--space-1)]">
          <span className="text-xl font-black tracking-tight text-[var(--emerald)]">{safeCriticalSkills}</span>
          <span className="label-xs text-muted-foreground opacity-60">IMMUNE</span>
        </div>
        <div className="flex flex-col items-center gap-[var(--space-1)]">
          <span className="text-xl font-black tracking-tight text-[var(--amber)]">{atRiskSkills}</span>
          <span className="label-xs text-muted-foreground opacity-60">EXPOSED</span>
        </div>
        <div className="flex flex-col items-center gap-[var(--space-1)]">
          <span className="text-xl font-black tracking-tight text-[var(--red)]">{obsoleteSkills}</span>
          <span className="label-xs text-muted-foreground opacity-60">CRITICAL</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// WhatIfSkillSimulator - Skill adjustment simulator
// ---------------------------------------------------------------------------

interface SkillAdjustment {
  skill: string;
  proficiency: number; // 0-100
  impact: number; // Effect on resilience score
}

const WhatIfSkillSimulator: React.FC<{
  roleKey: string;
  baseScore: number;
  onScoreChange: (newScore: number) => void;
}> = ({ roleKey, baseScore, onScoreChange }) => {
  const intel = getCareerIntelligence(roleKey);
  const initialSkills: SkillAdjustment[] = useMemo(() => {
    const safe = intel.skills.safe.map((s) => ({
      skill: s.skill,
      proficiency: 50,
      impact: 0.5,
    }));
    const atRisk = intel.skills.at_risk?.map((s) => ({
      skill: s.skill,
      proficiency: 30,
      impact: -0.3,
    })) || [];
    return [...safe, ...atRisk].slice(0, 6);
  }, [intel]);

  const [skills, setSkills] = useState<SkillAdjustment[]>(initialSkills);

  const calculateSimulatedScore = useCallback(
    (adjustedSkills: SkillAdjustment[]) => {
      const impactSum = adjustedSkills.reduce((sum, skill) => {
        const scaledImpact = skill.impact * (skill.proficiency / 100);
        return sum + scaledImpact;
      }, 0);
      return Math.max(0, Math.min(100, baseScore + impactSum * 10));
    },
    [baseScore],
  );

  const handleSkillChange = (index: number, value: number) => {
    const newSkills = [...skills];
    newSkills[index].proficiency = value;
    setSkills(newSkills);
    onScoreChange(calculateSimulatedScore(newSkills));
  };

  return (
    <div className="what-if-simulator glass-panel p-[var(--space-6)] shadow-inner">
      <div className="space-y-[var(--space-6)]">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold uppercase tracking-tight opacity-70">{skill.skill}</span>
              <span
                className="font-mono text-[10px] font-black px-2 py-0.5 rounded"
                style={{
                  backgroundColor: skill.impact > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: skill.impact > 0 ? "var(--green)" : "var(--red)",
                }}
              >
                {skill.proficiency}% PROFICIENCY
              </span>
            </div>

            <div className="relative group p-1 bg-white/5 rounded-full">
              <input
                type="range"
                min="0"
                max="100"
                value={skill.proficiency}
                onChange={(e) => handleSkillChange(index, parseInt(e.target.value))}
                className="premium-range w-full"
                style={{
                  accentColor: skill.impact > 0 ? "var(--emerald)" : "var(--rose)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-[10px] uppercase font-mono tracking-widest text-muted-foreground text-center opacity-40">
        Live Resilience Correlation Simulator
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CareerSkillsTab main component
// ---------------------------------------------------------------------------

export const CareerSkillsTab: React.FC<TabProps> = ({
  result,
  companyData,
  onDownload,
  onRecalculate,
}) => {
  const { width } = useAdaptiveSystem();
  const isMobile = width < 768;
  const scoreColor = getScoreColor(result.total);

  // Get career intelligence data for the role
  const intel = useMemo(
    () => getCareerIntelligence(result.workTypeKey),
    [result.workTypeKey],
  );

  // Count of skills by type for the gauge
  const safeCount = intel.skills.safe?.length || 0;
  const atRiskCount = intel.skills.at_risk?.length || 0;
  const obsoleteCount = intel.skills.obsolete?.length || 0;

  // State for simulated score
  const [simulatedScore, setSimulatedScore] = useState<number>(
    result.total * 100,
  );

  return (
    <section aria-labelledby="career-skills-heading" className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <SectionHeader
            title="AI Risk to Skill Analysis"
            description="Analysis of your current skills and their vulnerability to AI automation."
          />

          <AIRiskSkillMatrix
            intel={intel}
            scoreColor={scoreColor}
            roleKey={result.workTypeKey}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <SectionHeader
              title="Skill Resilience Score"
              description="A measure of how future-proof your current skill set is against AI disruption."
            />

            <div className="bg-muted border rounded-lg p-5">
              <SkillRiskGauge
                score={result.total * 100}
                safeCriticalSkills={safeCount}
                atRiskSkills={atRiskCount}
                obsoleteSkills={obsoleteCount}
              />

              <div className="mt-4 text-center space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Current Resilience:</span>{" "}
                  <span
                    style={{
                      color: scoreColor,
                      fontWeight: "bold",
                    }}
                  >
                    {(100 - result.total * 100).toFixed(0)}%
                  </span>
                </p>

                <p className="text-xs text-muted-foreground">
                  {result.total < 0.4
                    ? "Your skill profile shows strong resilience against AI automation."
                    : result.total < 0.7
                      ? "Your skill profile has moderate vulnerability to AI disruption."
                      : "Your skill profile has significant vulnerability to AI disruption."}
                </p>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader
              title="What-If Skill Simulator"
              description="Adjust your proficiency in various skills to see how it affects your overall resilience score."
            />

            <WhatIfSkillSimulator
              roleKey={result.workTypeKey}
              baseScore={result.total * 100}
              onScoreChange={setSimulatedScore}
            />

            <div className="mt-4 rounded-lg border p-4 bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Simulated Resilience:
                </span>
                <span
                  className="text-lg font-bold"
                  style={{
                    color: getScoreColor(simulatedScore / 100),
                  }}
                >
                  {(100 - simulatedScore).toFixed(0)}%
                </span>
              </div>

              <div className="mt-2 w-full bg-muted-2 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${100 - simulatedScore}%`,
                    backgroundColor: getScoreColor(simulatedScore / 100),
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs">
                <span>High Risk</span>
                <span>Low Risk</span>
              </div>
            </div>
          </div>
        </div>

        <CollapsibleSection title="Upskilling Roadmap">
          <div className="space-y-4">
            <StrategicRoadmap
              intel={intel}
              scoreColor={scoreColor}
              score={result.total * 100}
              experience={result.experience}
            />
          </div>
        </CollapsibleSection>
      </motion.div>
    </section>
  );
};

export default CareerSkillsTab;
