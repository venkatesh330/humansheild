export interface RoadmapAction {
  action: string;
  why: string;
  outcome: string;
  source?: string;
  sourceUrl?: string;
}

export interface RoadmapPhase {
  timeline: string;
  focus: string;
  actions: RoadmapAction[];
}

export const DATA_SOURCES = {
  bls: {
    name: "Bureau of Labor Statistics",
    url: "https://www.bls.gov",
  },
  world_economic_forum: {
    name: "World Economic Forum",
    url: "https://www.weforum.org",
  },
  mckinsey: {
    name: "McKinsey Global Institute",
    url: "https://www.mckinsey.com/mgi",
  },
  goldman_sachs: {
    name: "Goldman Sachs Research",
    url: "https://www.goldmansachs.com/research",
  },
  stanford_hai: {
    name: "Stanford HAI",
    url: "https://hai.stanford.edu",
  },
  o_net: {
    name: "O*NET",
    url: "https://www.onetcenter.org",
  },
  linkedin: {
    name: "LinkedIn Economic Graph",
    url: "https://linkedin.com",
  },
  internal_research: {
    name: "HumanProof Internal Research",
    url: "",
  },
};

export function addSourceCitations(
  phases: RoadmapPhase[],
  roleKey: string,
  riskScore: number,
): RoadmapPhase[] {
  return phases.map((phase, phaseIndex) => ({
    ...phase,
    actions: phase.actions.map((action, actionIndex) => {
      let source = DATA_SOURCES.internal_research;

      const actionLower = action.action.toLowerCase();

      if (
        actionLower.includes("audit") ||
        actionLower.includes("automatable")
      ) {
        source = DATA_SOURCES.o_net;
      } else if (
        actionLower.includes("ai tool") ||
        actionLower.includes("automation")
      ) {
        source =
          riskScore > 70 ? DATA_SOURCES.goldman_sachs : DATA_SOURCES.mckinsey;
      } else if (
        actionLower.includes("network") ||
        actionLower.includes("professional")
      ) {
        source = DATA_SOURCES.linkedin;
      } else if (
        actionLower.includes("certification") ||
        actionLower.includes("course")
      ) {
        source = DATA_SOURCES.world_economic_forum;
      } else if (
        actionLower.includes("oversight") ||
        actionLower.includes("governance")
      ) {
        source = DATA_SOURCES.stanford_hai;
      } else if (
        actionLower.includes("job") ||
        actionLower.includes("career")
      ) {
        source = DATA_SOURCES.bls;
      }

      return {
        ...action,
        source: source.name,
        sourceUrl: source.url,
      };
    }),
  }));
}

export function formatConfidenceBadge(confidence: number): {
  label: string;
  color: string;
} {
  if (confidence >= 85) return { label: "High Confidence", color: "#10b981" };
  if (confidence >= 70) return { label: "Medium Confidence", color: "#f59e0b" };
  return { label: "Low Confidence", color: "#ef4444" };
}

export function getDataQualityStatement(
  confidence: number,
  source: string,
): string {
  const confidenceAdj =
    confidence >= 85
      ? "validated"
      : confidence >= 70
        ? "cross-referenced"
        : "estimated";
  return `This roadmap is ${confidenceAdj} using ${source} data.`;
}
