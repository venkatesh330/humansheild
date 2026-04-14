export const getRiskLabel = (
  score: number,
): { label: string; color: string; cssVar: string } => {
  if (score >= 85)
    return { label: "Critical", color: "red", cssVar: "var(--red)" };
  if (score >= 65)
    return { label: "At Risk", color: "orange", cssVar: "var(--orange)" };
  if (score >= 40)
    return { label: "Moderate", color: "yellow", cssVar: "var(--yellow)" };
  return { label: "Safe", color: "green", cssVar: "var(--emerald)" };
};

export const parseDurationToHours = (duration: string): number => {
  if (!duration || typeof duration !== "string") return 0;

  const cleaned = duration.toLowerCase().trim();

  const hourMatch = cleaned.match(/(\d+)\s*hours?/);
  if (hourMatch) return parseInt(hourMatch[1], 10);

  const minuteMatch = cleaned.match(/(\d+)\s*minutes?/);
  if (minuteMatch) return Math.ceil(parseInt(minuteMatch[1], 10) / 60);

  const dayMatch = cleaned.match(/(\d+)\s*days?/);
  if (dayMatch) return parseInt(dayMatch[1], 10) * 8;

  const weekMatch = cleaned.match(/(\d+)\s*weeks?/);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 40;

  const hourNum = parseInt(cleaned, 10);
  if (!isNaN(hourNum) && hourNum > 0 && hourNum < 1000) return hourNum;

  return 0;
};

export const projectRisk = (
  currentScore: number,
  years: number,
  scenarioFactor = 1.0,
): number => {
  const accelerationFactor =
    currentScore > 70 ? 1.4 : currentScore > 40 ? 1.15 : 1.04;
  return Math.min(
    99,
    Math.round(
      currentScore * Math.pow(accelerationFactor * scenarioFactor, years / 3),
    ),
  );
};

export const scenarios = {
  optimistic: {
    factor: 0.85,
    label: "If you upskill actively",
    color: "var(--emerald)",
  },
  base: { factor: 1.0, label: "Current trajectory", color: "var(--text2)" },
  pessimistic: {
    factor: 1.2,
    label: "If AI adoption accelerates",
    color: "var(--red)",
  },
};

// Fixed: Clamp percentile to max 99%, no overflow
export const getPercentileStatement = (score: number): string => {
  if (score >= 85) return "More exposed than 90% of workers globally";
  if (score >= 65) {
    const pct = Math.min(99, Math.round(55 + (score - 65) * 1.4));
    return `More exposed than ${pct}% of workers globally`;
  }
  if (score >= 40) {
    const pct = Math.min(99, Math.round(40 + (65 - score) * 1.3));
    return `More human-proof than ${pct}% of workers globally`;
  }
  return `More human-proof than ${Math.min(99, Math.round(75 + (40 - score) * 0.8))}% of workers globally`;
};

// New: HII dimension weighting (6 dimensions across 30 questions, equal weight)
export const aggregateHIIDimensions = (
  dimensions: Record<string, number>,
): number => {
  const values = Object.values(dimensions);
  if (values.length === 0) return 50;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(Math.min(99, Math.max(3, avg)));
};

// New: Validate job-skill industry match
export const validateJobSkillMatch = (
  jobIndustry: string,
  skillIndustry: string | null,
): boolean => {
  if (!skillIndustry) return true;
  const similar = (a: string, b: string) => {
    const aLower = a.toLowerCase().split("_")[0];
    const bLower = b.toLowerCase().split("_")[0];
    return aLower === bLower;
  };
  return similar(jobIndustry, skillIndustry);
};

// New: Get recommended course category from job/skill
export const getRecommendedCourseCategory = (
  jobTitle: string | null,
  industryKey: string,
): string => {
  const lower = (jobTitle || "").toLowerCase();
  const courseMap: Record<string, string> = {
    "data entry": "Data entry",
    bookkeeping: "Bookkeeping",
    accounting: "Bookkeeping",
    tax: "Tax preparation",
    "legal research": "Legal research",
    paralegal: "Legal research",
    junior: "Financial modelling",
    analyst: "Financial modelling",
  };
  for (const [key, cat] of Object.entries(courseMap)) {
    if (lower.includes(key)) return cat;
  }
  return "Financial modelling";
};

// New: Timeline to action based on risk score
export const getActionTimeline = (
  jobRisk: number | null,
  skillRisk: number | null,
): { weeks: number; label: string } => {
  const maxRisk = Math.max(jobRisk ?? 0, skillRisk ?? 0);
  if (maxRisk >= 85) return { weeks: 2, label: "Act this week" };
  if (maxRisk >= 70) return { weeks: 4, label: "Plan this month" };
  if (maxRisk >= 55) return { weeks: 12, label: "Start within 3 months" };
  if (maxRisk >= 40)
    return { weeks: 26, label: "Begin planning within 6 months" };
  return { weeks: 52, label: "Monitor and evolve continuously" };
};
