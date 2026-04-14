// PHASE-3: AI-Powered Pattern Insights
// File: artifacts/humanproof/src/services/insightGenerator.ts
// Human Edge Journal - Rule-based insights (AI can be added later)

import type { JournalEntry } from "../components/HumanEdgeJournal";

export interface Insight {
  id: string;
  type: "pattern" | "recommendation" | "correlation" | "prediction";
  dimension?: string;
  title: string;
  message: string;
  confidence: number;
  evidence: string[];
  actionable: boolean;
  action?: string;
}

interface InsightContext {
  entries: JournalEntry[];
  dimensions: Record<string, number>;
  jobRiskScore?: number;
  skillRiskScore?: number;
  totalEntries: number;
}

export const generateInsights = async (
  ctx: InsightContext,
): Promise<Insight[]> => {
  return generateRuleBasedInsights(ctx);
};

export const generateRuleBasedInsights = (ctx: InsightContext): Insight[] => {
  const insights: Insight[] = [];

  if (ctx.totalEntries < 3) {
    return [
      {
        id: "insight-need-more",
        type: "recommendation",
        title: "Build your journal",
        message:
          "Add more entries to unlock personalized insights about your human edge.",
        confidence: 0.9,
        evidence: [],
        actionable: true,
        action: "Log at least 3 more entries",
      },
    ];
  }

  const dimensionCounts: Record<string, number> = {};
  ctx.entries.forEach((e) => {
    dimensionCounts[e.dimension] = (dimensionCounts[e.dimension] || 0) + 1;
  });
  const dominantDim = Object.entries(dimensionCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  if (dominantDim) {
    insights.push({
      id: "insight-dominant",
      type: "pattern",
      dimension: dominantDim[0] as any,
      title: `Your ${dominantDim[0]} edge`,
      message: `${dominantDim[1]} of ${ctx.totalEntries} entries focus on ${dominantDim[0]}. This suggests it's your most practiced human skill.`,
      confidence: 0.7,
      evidence: [`${dominantDim[1]} entries in ${dominantDim[0]}`],
      actionable: true,
      action: "Build on this strength",
    });
  }

  const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentEntries = ctx.entries.filter(
    (e) => new Date(e.createdAt || e.date).getTime() > lastWeek,
  );

  if (recentEntries.length > 0) {
    insights.push({
      id: "insight-consistency",
      type: "pattern",
      title: "Consistent journaling",
      message: `You've logged ${recentEntries.length} entries this week. Regular reflection accelerates self-awareness.`,
      confidence: 0.8,
      evidence: [`${recentEntries.length} entries in last 7 days`],
      actionable: false,
    });
  }

  if (ctx.jobRiskScore !== undefined && ctx.jobRiskScore > 60) {
    insights.push({
      id: "insight-risk",
      type: "recommendation",
      title: "Address job vulnerability",
      message:
        "Your job risk score is elevated. Document more human-edge moments that demonstrate irreplaceable value.",
      confidence: 0.6,
      evidence: [`Job risk: ${ctx.jobRiskScore}`],
      actionable: true,
      action: "Focus on contextual & social dimensions",
    });
  }

  return insights;
};
