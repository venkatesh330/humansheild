// Future year risk projection for skills based on 2026 baseline
export interface RiskProjection {
  year: number;
  projectedRisk: number;
  label: string;
}

/**
 * Projects skill risk scores 1, 3, and 5 years forward based on:
 * - Current baseline risk score
 * - Trend direction (rising/stable/declining)
 * - Industry acceleration factors
 * 
 * Sources: McKinsey 2025, Anthropic AI Index, WEF Future of Jobs 2025
 */
export function projectSkillRisk(
  baselineScore: number,
  trend: 'rising' | 'stable' | 'declining',
  industry?: string | null
): RiskProjection[] {
  // Industry acceleration multipliers (how fast AI risk increases in that sector)
  const industryAccelerators: Record<string, number> = {
    'Finance': 1.35,
    'Technology': 1.25,
    'Accounting': 1.40,
    'Legal': 1.15,
    'Marketing': 1.30,
    'Creative': 1.20,
    'Healthcare': 0.65,
    'Education': 0.70,
    'default': 1.0,
  };

  const accelerator = industry ? (industryAccelerators[industry] || industryAccelerators['default']) : 1.0;

  // Annual increase rates by trend (in percentage points)
  const trendGrowth: Record<string, number> = {
    'rising': 8,    // 8 points/year for rising skills
    'stable': 2,    // 2 points/year for stable
    'declining': -2, // -2 points/year for declining
  };

  const baseGrowth = trendGrowth[trend];
  const adjustedGrowth = baseGrowth * accelerator;

  const projections: RiskProjection[] = [];

  // 1-year projection
  projections.push({
    year: 1,
    projectedRisk: Math.min(99, Math.max(3, Math.round(baselineScore + adjustedGrowth))),
    label: 'In 1 year',
  });

  // 3-year projection (compounding)
  const year3Risk = baselineScore + (adjustedGrowth * 3) + (adjustedGrowth * 3 * 0.1); // Slight acceleration
  projections.push({
    year: 3,
    projectedRisk: Math.min(99, Math.max(3, Math.round(year3Risk))),
    label: 'In 3 years',
  });

  // 5-year projection (with compounding and saturation)
  let year5Risk = baselineScore + (adjustedGrowth * 5) + (adjustedGrowth * 5 * 0.15);
  // Skills approaching 99% rarely go higher (saturation floor)
  if (year5Risk > 90) {
    year5Risk = 90 + ((year5Risk - 90) * 0.4);
  }
  projections.push({
    year: 5,
    projectedRisk: Math.min(99, Math.max(3, Math.round(year5Risk))),
    label: 'In 5 years',
  });

  return projections;
}

/**
 * Get actionable guidance based on projected trajectory
 */
export function getProjectionGuidance(
  baselineScore: number,
  year5Projection: number,
  trend: 'rising' | 'stable' | 'declining'
): string {
  const delta = year5Projection - baselineScore;

  if (trend === 'declining') {
    return `✅ This skill is becoming SAFER over time (↓ ${Math.abs(Math.round(delta))} points by 2031)`;
  }

  if (delta > 20) {
    return `⚠️ RAPID RISK INCREASE: Score could rise to ${year5Projection} (↑ ${delta} points). Urgent upskilling needed.`;
  }

  if (delta > 10) {
    return `📈 MODERATE INCREASE: Expect gradual displacement (↑ ${delta} points). Plan skill diversification.`;
  }

  if (delta > 0) {
    return `→ STABLE WITH SLIGHT PRESSURE: Risk grows slowly (↑ ${delta} points). Monitor developments.`;
  }

  return `✅ STABLE: This skill should remain relevant through 2031.`;
}

/**
 * Aggregate projections for skill portfolio
 */
export function aggregatePortfolioRisk(
  skills: Array<{ riskScore: number; trend: 'rising' | 'stable' | 'declining'; weight: number }>,
  timeframe: 1 | 3 | 5
): number {
  if (skills.length === 0) return 50;

  const projections = skills.map(skill => {
    const proj = projectSkillRisk(skill.riskScore, skill.trend);
    const timeframeData = proj.find(p => p.year === timeframe);
    return timeframeData?.projectedRisk || skill.riskScore;
  });

  const weights = skills.map(s => s.weight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted = projections.reduce((sum, risk, i) => sum + (risk * weights[i]), 0) / totalWeight;

  return Math.round(weighted);
}
