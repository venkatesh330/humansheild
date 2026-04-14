import {
  CareerIntelligence,
  ExperienceRoadmap,
  RoadmapPhase,
} from "./intelligence/types";
import { getCareerIntelligence, hasSeededData } from "./intelligence";
import {
  getJobRoleRoadmap as getCourseDbRoadmap,
  RoadmapPhase as CourseDbPhase,
} from "./courseDatabase";

export interface UnifiedRoadmap {
  source: "database" | "intelligence" | "fallback";
  phases: RoadmapPhase[];
  confidence: number;
  lastUpdated?: string;
}

const EXPIRY_DAYS = 90;

function getIntelligenceRoadmap(
  roleKey: string,
  experience: string,
): RoadmapPhase[] | null {
  const intel = getCareerIntelligence(roleKey);
  if (!intel?.roadmap) return null;

  const expMap: Record<string, keyof typeof intel.roadmap> = {
    "0-2": "0-2",
    "2-5": "2-5",
    "5-10": "5-10",
    "10-20": "10-20",
    "20+": "20+",
  };

  const expKey = expMap[experience] || "5-10";
  const roadmaps = intel.roadmap[expKey] || intel.roadmap["5-10"];

  if (!roadmaps) return null;

  return [
    {
      timeline: roadmaps.phase_1?.timeline || "0-30 days",
      focus: roadmaps.phase_1?.focus || "Foundation",
      actions: roadmaps.phase_1?.actions || [],
    },
    ...(roadmaps.phase_2
      ? [
          {
            timeline: roadmaps.phase_2.timeline || "1-3 months",
            focus: roadmaps.phase_2.focus || "Development",
            actions: roadmaps.phase_2.actions || [],
          },
        ]
      : []),
    ...(roadmaps.phase_3
      ? [
          {
            timeline: roadmaps.phase_3.timeline || "3-12 months",
            focus: roadmaps.phase_3.focus || "Mastery",
            actions: roadmaps.phase_3.actions || [],
          },
        ]
      : []),
  ];
}

function getCourseDbRoadmapAsPhases(jobId: string): RoadmapPhase[] | null {
  const roadmap = getCourseDbRoadmap(jobId);
  if (!roadmap) return null;

  return roadmap.map((phase) => ({
    timeline: phase.weeks,
    focus: phase.focus,
    actions: phase.milestones.map((milestone) => ({
      action: milestone,
      why: "",
      outcome: "",
    })),
  }));
}

export function getUnifiedRoadmap(
  roleKey: string,
  experience: string = "5-10",
): UnifiedRoadmap {
  if (hasSeededData(roleKey)) {
    const phases = getIntelligenceRoadmap(roleKey, experience);
    if (phases) {
      const intel = getCareerIntelligence(roleKey);
      return {
        source: "database",
        phases,
        confidence: intel?.confidenceScore || 85,
        lastUpdated: undefined,
      };
    }
  }

  const courseDbPhases = getCourseDbRoadmapAsPhases(roleKey);
  if (courseDbPhases) {
    return {
      source: "intelligence",
      phases: courseDbPhases,
      confidence: 70,
      lastUpdated: undefined,
    };
  }

  return {
    source: "fallback",
    phases: [
      {
        timeline: "0-30 days",
        focus: "Assessment & Planning",
        actions: [
          {
            action:
              "Audit your current skills and identify AI-vulnerable tasks",
            why: "Understand your risk surface",
            outcome: "Personal risk assessment document",
          },
          {
            action: "Research AI tools relevant to your role",
            why: "Stay ahead of automation",
            outcome: "Tool proficiency plan",
          },
        ],
      },
      {
        timeline: "1-3 months",
        focus: "Skill Development",
        actions: [
          {
            action: "Complete foundational AI literacy course",
            why: "Build AI-native capabilities",
            outcome: "AI certification",
          },
          {
            action: "Apply new skills to current role",
            why: "Demonstrate AI-augmented productivity",
            outcome: "Work samples showcasing AI use",
          },
        ],
      },
      {
        timeline: "3-12 months",
        focus: "Positioning & Advancement",
        actions: [
          {
            action: "Transition to AI-oversight or strategy role",
            why: "Move from execution to governance",
            outcome: "New role with higher AI resilience",
          },
          {
            action: "Build professional network in AI-adjacent spaces",
            why: "Relationships cannot be automated",
            outcome: "Active professional network",
          },
        ],
      },
    ],
    confidence: 55,
    lastUpdated: undefined,
  };
}

export function getRoadmapSourceLabel(
  source: UnifiedRoadmap["source"],
): string {
  switch (source) {
    case "database":
      return "Validated Career Intelligence";
    case "intelligence":
      return "Role-Specific Roadmap";
    case "fallback":
      return "Adaptive Framework";
  }
}
