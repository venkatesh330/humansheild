import { parseDurationToHours } from "./riskCalculations";

export interface LearningPath {
  id: string;
  title: string;
  courses: ScoredCourse[];
  totalHours: number;
  totalCost: number;
  score: number;
}

export interface ScoredCourse {
  title: string;
  provider: string;
  duration: string;
  price: string;
  skillImpact: string;
  difficulty: string;
  score: number;
  reasons: string[];
}

interface UserPreferences {
  preferredHoursPerWeek: number;
  budgetRange: "free" | "low" | "medium" | "high";
  learningStyle: "video" | "reading" | "hands-on" | "mixed";
  timeToGoal: "urgent" | "normal" | "flexible";
}

interface SkillGap {
  skill: string;
  importance: number;
  currentLevel: number;
  targetLevel: number;
}

export function rankLearningPaths(
  paths: LearningPath[],
  preferences: UserPreferences,
  skillGaps: SkillGap[],
): LearningPath[] {
  return paths
    .map((path) => {
      let score = 0;

      const timeFit = calculateTimeFit(
        path.totalHours,
        preferences.preferredHoursPerWeek,
        preferences.timeToGoal,
      );
      score += timeFit * 30;

      const budgetFit = calculateBudgetFit(
        path.totalCost,
        preferences.budgetRange,
      );
      score += budgetFit * 25;

      const skillGapFit = calculateSkillGapFit(path.courses, skillGaps);
      score += skillGapFit * 30;

      const difficultyFit = calculateDifficultyFit(
        path.courses,
        preferences.learningStyle,
      );
      score += difficultyFit * 15;

      return { ...path, score: Math.round(score) };
    })
    .sort((a, b) => b.score - a.score);
}

function calculateTimeFit(
  totalHours: number,
  hoursPerWeek: number,
  urgency: UserPreferences["timeToGoal"],
): number {
  const weeksNeeded = totalHours / hoursPerWeek;

  const maxWeeks = {
    urgent: 8,
    normal: 16,
    flexible: 32,
  }[urgency];

  if (weeksNeeded <= maxWeeks) return 1;
  return Math.max(0, 1 - (weeksNeeded - maxWeeks) / maxWeeks);
}

function calculateBudgetFit(
  totalCost: number,
  budget: UserPreferences["budgetRange"],
): number {
  const maxCost = {
    free: 0,
    low: 100,
    medium: 500,
    high: 99999,
  }[budget];

  if (totalCost <= maxCost) return 1;
  return Math.max(0, 1 - (totalCost - maxCost) / totalCost);
}

function calculateSkillGapFit(
  courses: ScoredCourse[],
  skillGaps: SkillGap[],
): number {
  if (skillGaps.length === 0) return 0.7;

  let totalFit = 0;

  for (const gap of skillGaps) {
    const matchedCourses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(gap.skill.toLowerCase()) ||
        c.skillImpact.toLowerCase().includes(gap.skill.toLowerCase()),
    );

    if (matchedCourses.length > 0) {
      const courseScore =
        matchedCourses.reduce((sum, c) => sum + c.score, 0) /
        matchedCourses.length;
      totalFit += (courseScore / 100) * gap.importance;
    }
  }

  return Math.min(1, totalFit);
}

function calculateDifficultyFit(
  courses: ScoredCourse[],
  style: UserPreferences["learningStyle"],
): number {
  if (courses.length === 0) return 0.5;

  const difficultyMap = {
    beginner: 0.3,
    intermediate: 0.6,
    advanced: 0.9,
    expert: 1.0,
  };

  const styleWeights = {
    video: { beginner: 1.0, intermediate: 0.8, advanced: 0.4, expert: 0.2 },
    reading: { beginner: 0.6, intermediate: 0.8, advanced: 1.0, expert: 0.8 },
    "hands-on": {
      beginner: 0.4,
      intermediate: 0.8,
      advanced: 1.0,
      expert: 0.9,
    },
    mixed: { beginner: 0.8, intermediate: 0.9, advanced: 0.8, expert: 0.7 },
  };

  const weights = styleWeights[style];

  const totalFit = courses.reduce((sum, c) => {
    const diffScore =
      difficultyMap[c.difficulty as keyof typeof difficultyMap] || 0.5;
    const weight = weights[c.difficulty as keyof typeof weights] || 0.5;
    return sum + diffScore * weight;
  }, 0);

  return totalFit / courses.length;
}

export function getRecommendedPath(
  allPaths: LearningPath[],
  currentRiskScore: number,
  experience: string,
): LearningPath | null {
  const expWeights = {
    "0-2": { speed: 1.5, depth: 0.5 },
    "2-5": { speed: 1.2, depth: 0.7 },
    "5-10": { speed: 1.0, depth: 1.0 },
    "10-20": { speed: 0.8, depth: 1.3 },
    "20+": { speed: 0.6, depth: 1.5 },
  };

  const weights =
    expWeights[experience as keyof typeof expWeights] || expWeights["5-10"];

  const scored = allPaths.map((path) => {
    let score = path.score;

    if (currentRiskScore > 70 && path.totalHours < 50) {
      score *= 1.2;
    }

    if (path.totalHours > 100 && weights.speed > 1.0) {
      score *= 0.8;
    }

    return { ...path, score };
  });

  return scored.sort((a, b) => b.score - a.score)[0] || null;
}
