// industryRiskData.ts
// Industry-level baseline risk scores — expanded to 27 sectors.

export interface IndustryRisk {
  baselineRisk: number;
  aiAdoptionRate: number;       // 0–1 scale (was string, now numeric for formula usage)
  growthOutlook: 'growing' | 'stable' | 'volatile' | 'declining';
  avgLayoffRate2025: number;    // observed % of industry that laid off in 2025
}

export const industryRiskData: Record<string, IndustryRisk> = {
  // Tech & Digital
  'Technology':            { baselineRisk: 0.58, aiAdoptionRate: 0.80, growthOutlook: 'volatile',  avgLayoffRate2025: 0.07 },
  'E-commerce':            { baselineRisk: 0.55, aiAdoptionRate: 0.75, growthOutlook: 'stable',    avgLayoffRate2025: 0.05 },
  'Gaming':                { baselineRisk: 0.65, aiAdoptionRate: 0.70, growthOutlook: 'declining', avgLayoffRate2025: 0.09 },
  'Cybersecurity':         { baselineRisk: 0.19, aiAdoptionRate: 0.65, growthOutlook: 'growing',   avgLayoffRate2025: 0.02 },

  // Finance & Services
  'Financial Services':    { baselineRisk: 0.52, aiAdoptionRate: 0.72, growthOutlook: 'stable',    avgLayoffRate2025: 0.04 },
  'Insurance':             { baselineRisk: 0.48, aiAdoptionRate: 0.55, growthOutlook: 'stable',    avgLayoffRate2025: 0.03 },
  'Consulting':            { baselineRisk: 0.48, aiAdoptionRate: 0.68, growthOutlook: 'stable',    avgLayoffRate2025: 0.04 },
  'Real Estate':           { baselineRisk: 0.42, aiAdoptionRate: 0.35, growthOutlook: 'volatile',  avgLayoffRate2025: 0.05 },

  // Traditional Industries
  'Healthcare':            { baselineRisk: 0.28, aiAdoptionRate: 0.40, growthOutlook: 'growing',   avgLayoffRate2025: 0.015 },
  'Biotech/Pharma':        { baselineRisk: 0.33, aiAdoptionRate: 0.45, growthOutlook: 'growing',   avgLayoffRate2025: 0.03 },
  'Manufacturing':         { baselineRisk: 0.44, aiAdoptionRate: 0.50, growthOutlook: 'stable',    avgLayoffRate2025: 0.04 },
  'Energy':                { baselineRisk: 0.38, aiAdoptionRate: 0.30, growthOutlook: 'stable',    avgLayoffRate2025: 0.03 },
  'Construction':          { baselineRisk: 0.35, aiAdoptionRate: 0.15, growthOutlook: 'stable',    avgLayoffRate2025: 0.02 },
  'Agriculture':           { baselineRisk: 0.25, aiAdoptionRate: 0.20, growthOutlook: 'stable',    avgLayoffRate2025: 0.01 },

  // Communication & Media
  'Media & Publishing':    { baselineRisk: 0.71, aiAdoptionRate: 0.85, growthOutlook: 'declining', avgLayoffRate2025: 0.12 },
  'Telecom':               { baselineRisk: 0.50, aiAdoptionRate: 0.55, growthOutlook: 'stable',    avgLayoffRate2025: 0.04 },

  // Services & People
  'Education':             { baselineRisk: 0.35, aiAdoptionRate: 0.30, growthOutlook: 'stable',    avgLayoffRate2025: 0.02 },
  'Government':            { baselineRisk: 0.31, aiAdoptionRate: 0.20, growthOutlook: 'stable',    avgLayoffRate2025: 0.01 },
  'Hospitality':           { baselineRisk: 0.40, aiAdoptionRate: 0.25, growthOutlook: 'volatile',  avgLayoffRate2025: 0.05 },
  'Retail':                { baselineRisk: 0.62, aiAdoptionRate: 0.60, growthOutlook: 'volatile',  avgLayoffRate2025: 0.06 },
  'Legal':                 { baselineRisk: 0.55, aiAdoptionRate: 0.70, growthOutlook: 'declining', avgLayoffRate2025: 0.05 },
  'Transportation':        { baselineRisk: 0.47, aiAdoptionRate: 0.45, growthOutlook: 'stable',    avgLayoffRate2025: 0.03 },

  // Startups (by stage)
  'Startups (pre-seed)':   { baselineRisk: 0.72, aiAdoptionRate: 0.50, growthOutlook: 'volatile',  avgLayoffRate2025: 0.15 },
  'Startups (seed)':       { baselineRisk: 0.65, aiAdoptionRate: 0.50, growthOutlook: 'volatile',  avgLayoffRate2025: 0.12 },
  'Startups (Series A)':   { baselineRisk: 0.52, aiAdoptionRate: 0.50, growthOutlook: 'volatile',  avgLayoffRate2025: 0.08 },
  'Startups (Series B+)':  { baselineRisk: 0.44, aiAdoptionRate: 0.50, growthOutlook: 'stable',    avgLayoffRate2025: 0.05 },

  // Nonprofit & Other
  'Nonprofit':             { baselineRisk: 0.30, aiAdoptionRate: 0.15, growthOutlook: 'stable',    avgLayoffRate2025: 0.02 },
};
