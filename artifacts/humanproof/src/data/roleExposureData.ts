// roleExposureData.ts
// Pre-seeded risk scores per role category — expanded to 50+ roles

export interface RoleExposure {
  aiRisk: number;
  layoffRisk: number;
  demandTrend: 'rising' | 'stable' | 'falling';
}

export const roleExposureData: Record<string, RoleExposure> = {
  // ── HIGH RISK ROLES (layoffRisk 0.65–0.95) ──
  'Data Entry Specialist':           { aiRisk: 0.97, layoffRisk: 0.88, demandTrend: 'falling' },
  'Telemarketer':                    { aiRisk: 0.95, layoffRisk: 0.90, demandTrend: 'falling' },
  'Customer Service Representative': { aiRisk: 0.85, layoffRisk: 0.82, demandTrend: 'falling' },
  'Bookkeeper':                      { aiRisk: 0.90, layoffRisk: 0.80, demandTrend: 'falling' },
  'Legal Researcher':                { aiRisk: 0.88, layoffRisk: 0.78, demandTrend: 'falling' },
  'Content Writer':                  { aiRisk: 0.79, layoffRisk: 0.75, demandTrend: 'falling' },
  'Translator':                      { aiRisk: 0.92, layoffRisk: 0.77, demandTrend: 'falling' },
  'Recruiter':                       { aiRisk: 0.68, layoffRisk: 0.72, demandTrend: 'falling' },
  'QA Engineer':                     { aiRisk: 0.74, layoffRisk: 0.68, demandTrend: 'falling' },
  'Financial Analyst (junior)':      { aiRisk: 0.72, layoffRisk: 0.70, demandTrend: 'falling' },
  'Technical Writer':                { aiRisk: 0.76, layoffRisk: 0.65, demandTrend: 'falling' },
  'Marketing Coordinator':           { aiRisk: 0.71, layoffRisk: 0.67, demandTrend: 'falling' },
  'Administrative Assistant':        { aiRisk: 0.82, layoffRisk: 0.75, demandTrend: 'falling' },

  // ── MODERATE RISK ROLES (layoffRisk 0.35–0.64) ──
  'Business Analyst':                { aiRisk: 0.65, layoffRisk: 0.62, demandTrend: 'stable' },
  'Software Engineer':               { aiRisk: 0.45, layoffRisk: 0.45, demandTrend: 'stable' },
  'Frontend Developer':              { aiRisk: 0.50, layoffRisk: 0.48, demandTrend: 'stable' },
  'Backend Developer':               { aiRisk: 0.42, layoffRisk: 0.42, demandTrend: 'stable' },
  'Full Stack Developer':            { aiRisk: 0.44, layoffRisk: 0.44, demandTrend: 'stable' },
  'Product Manager':                 { aiRisk: 0.38, layoffRisk: 0.48, demandTrend: 'stable' },
  'Project Manager':                 { aiRisk: 0.40, layoffRisk: 0.50, demandTrend: 'stable' },
  'Data Scientist':                  { aiRisk: 0.42, layoffRisk: 0.40, demandTrend: 'stable' },
  'Data Analyst':                    { aiRisk: 0.58, layoffRisk: 0.55, demandTrend: 'stable' },
  'UX Designer':                     { aiRisk: 0.51, layoffRisk: 0.50, demandTrend: 'stable' },
  'Graphic Designer':                { aiRisk: 0.65, layoffRisk: 0.58, demandTrend: 'falling' },
  'Marketing Manager':               { aiRisk: 0.46, layoffRisk: 0.45, demandTrend: 'stable' },
  'Finance Manager':                 { aiRisk: 0.44, layoffRisk: 0.42, demandTrend: 'stable' },
  'HR Business Partner':             { aiRisk: 0.47, layoffRisk: 0.44, demandTrend: 'stable' },
  'Account Manager':                 { aiRisk: 0.42, layoffRisk: 0.42, demandTrend: 'stable' },
  'Sales Representative':            { aiRisk: 0.40, layoffRisk: 0.48, demandTrend: 'stable' },
  'Accountant':                      { aiRisk: 0.68, layoffRisk: 0.55, demandTrend: 'falling' },
  'Teacher':                         { aiRisk: 0.30, layoffRisk: 0.35, demandTrend: 'stable' },
  'Supply Chain Manager':            { aiRisk: 0.38, layoffRisk: 0.40, demandTrend: 'stable' },
  'Operations Manager':              { aiRisk: 0.35, layoffRisk: 0.42, demandTrend: 'stable' },

  // ── LOW RISK ROLES (layoffRisk 0.05–0.34) ──
  'ML Engineer':                     { aiRisk: 0.15, layoffRisk: 0.15, demandTrend: 'rising' },
  'AI/ML Researcher':                { aiRisk: 0.10, layoffRisk: 0.12, demandTrend: 'rising' },
  'AI Engineer':                     { aiRisk: 0.12, layoffRisk: 0.13, demandTrend: 'rising' },
  'Prompt Engineer':                 { aiRisk: 0.20, layoffRisk: 0.30, demandTrend: 'rising' },
  'Cybersecurity Engineer':          { aiRisk: 0.25, layoffRisk: 0.20, demandTrend: 'rising' },
  'Cloud Engineer':                  { aiRisk: 0.28, layoffRisk: 0.22, demandTrend: 'rising' },
  'DevOps / SRE':                    { aiRisk: 0.30, layoffRisk: 0.25, demandTrend: 'rising' },
  'Clinical Nurse':                  { aiRisk: 0.08, layoffRisk: 0.10, demandTrend: 'rising' },
  'Physician':                       { aiRisk: 0.06, layoffRisk: 0.06, demandTrend: 'rising' },
  'Surgeon':                         { aiRisk: 0.05, layoffRisk: 0.05, demandTrend: 'rising' },
  'Pharmacist':                      { aiRisk: 0.22, layoffRisk: 0.18, demandTrend: 'stable' },
  'Electrician':                     { aiRisk: 0.07, layoffRisk: 0.08, demandTrend: 'stable' },
  'Plumber':                         { aiRisk: 0.06, layoffRisk: 0.07, demandTrend: 'stable' },
  'Welder':                          { aiRisk: 0.15, layoffRisk: 0.12, demandTrend: 'stable' },
  'Executive / C-Suite':             { aiRisk: 0.12, layoffRisk: 0.20, demandTrend: 'stable' },
  'Head of Engineering':             { aiRisk: 0.16, layoffRisk: 0.22, demandTrend: 'stable' },
  'VP of Product':                   { aiRisk: 0.18, layoffRisk: 0.24, demandTrend: 'stable' },
  'Attorney / Lawyer':               { aiRisk: 0.35, layoffRisk: 0.30, demandTrend: 'stable' },
};

// ── Fuzzy role inference ──

// Common keywords and their risk profiles
const ROLE_KEYWORD_MAP: { pattern: RegExp; exposure: RoleExposure }[] = [
  { pattern: /\b(ai|ml|machine learning|deep learning)\b/i,        exposure: { aiRisk: 0.15, layoffRisk: 0.15, demandTrend: 'rising' } },
  { pattern: /\b(cyber|security|infosec)\b/i,                      exposure: { aiRisk: 0.25, layoffRisk: 0.20, demandTrend: 'rising' } },
  { pattern: /\b(devops|sre|platform|infrastructure)\b/i,          exposure: { aiRisk: 0.30, layoffRisk: 0.25, demandTrend: 'rising' } },
  { pattern: /\b(cloud|aws|azure|gcp)\b/i,                         exposure: { aiRisk: 0.28, layoffRisk: 0.22, demandTrend: 'rising' } },
  { pattern: /\b(nurse|doctor|physician|surgeon|clinical)\b/i,     exposure: { aiRisk: 0.08, layoffRisk: 0.10, demandTrend: 'rising' } },
  { pattern: /\b(chief|cto|ceo|cfo|coo|vp|vice president)\b/i,    exposure: { aiRisk: 0.15, layoffRisk: 0.22, demandTrend: 'stable' } },
  { pattern: /\b(director|head of)\b/i,                            exposure: { aiRisk: 0.20, layoffRisk: 0.28, demandTrend: 'stable' } },
  { pattern: /\b(senior|staff|principal|lead)\b/i,                 exposure: { aiRisk: 0.30, layoffRisk: 0.32, demandTrend: 'stable' } },
  { pattern: /\b(manager|mgr)\b/i,                                 exposure: { aiRisk: 0.35, layoffRisk: 0.38, demandTrend: 'stable' } },
  { pattern: /\b(engineer|developer|dev)\b/i,                      exposure: { aiRisk: 0.42, layoffRisk: 0.42, demandTrend: 'stable' } },
  { pattern: /\b(designer|ux|ui)\b/i,                              exposure: { aiRisk: 0.50, layoffRisk: 0.48, demandTrend: 'stable' } },
  { pattern: /\b(analyst|associate)\b/i,                           exposure: { aiRisk: 0.55, layoffRisk: 0.52, demandTrend: 'stable' } },
  { pattern: /\b(intern|trainee|entry.level|junior)\b/i,           exposure: { aiRisk: 0.60, layoffRisk: 0.60, demandTrend: 'falling' } },
  { pattern: /\b(coordinator|specialist)\b/i,                      exposure: { aiRisk: 0.55, layoffRisk: 0.55, demandTrend: 'stable' } },
  { pattern: /\b(data entry|admin|clerk|receptionist)\b/i,         exposure: { aiRisk: 0.85, layoffRisk: 0.80, demandTrend: 'falling' } },
  { pattern: /\b(customer service|support|helpdesk)\b/i,           exposure: { aiRisk: 0.80, layoffRisk: 0.75, demandTrend: 'falling' } },
  { pattern: /\b(content|writer|copywriter|editor)\b/i,            exposure: { aiRisk: 0.78, layoffRisk: 0.72, demandTrend: 'falling' } },
  { pattern: /\b(plumb|electri|weld|mechanic|carpenter)\b/i,       exposure: { aiRisk: 0.08, layoffRisk: 0.09, demandTrend: 'stable' } },
  { pattern: /\b(teach|professor|instructor|lecturer)\b/i,         exposure: { aiRisk: 0.28, layoffRisk: 0.30, demandTrend: 'stable' } },
  { pattern: /\b(sales|account executive|bdr|sdr)\b/i,             exposure: { aiRisk: 0.40, layoffRisk: 0.48, demandTrend: 'stable' } },
];

export const inferRoleRisk = (roleTitle: string): RoleExposure => {
  const title = roleTitle.toLowerCase().trim();

  // Try exact match first
  for (const [key, val] of Object.entries(roleExposureData)) {
    if (key.toLowerCase() === title) return val;
  }

  // Try fuzzy keyword matching (first match wins, ordered by specificity)
  for (const entry of ROLE_KEYWORD_MAP) {
    if (entry.pattern.test(title)) return entry.exposure;
  }

  // True unknown — return moderate-low with clear signal that confidence is low
  return { aiRisk: 0.40, layoffRisk: 0.40, demandTrend: 'stable' };
};

// Get all role names for autocomplete
export const getAllRoleTitles = (): string[] => Object.keys(roleExposureData);

export const calculateRoleExposureScore = (roleTitle: string, department: string): number => {
  const roleData = roleExposureData[roleTitle] || inferRoleRisk(roleTitle);
  const deptMultiplier = getDepartmentMultiplier(department);

  // Blend aiRisk into the score (20% weight) — now uses the previously dead data
  const blendedRisk = (roleData.layoffRisk * 0.75) + (roleData.aiRisk * 0.25);

  return Math.min(1.0, blendedRisk * deptMultiplier);
};

const getDepartmentMultiplier = (department: string): number => {
  const multipliers: Record<string, number> = {
    'Engineering':       0.90,
    'Sales':             0.85,
    'Product':           1.00,
    'Marketing':         1.10,
    'HR':                1.20,
    'Legal':             1.00,
    'Finance':           0.95,
    'Operations':        1.05,
    'Customer Support':  1.15,
    'Research':          0.85,
    'Design':            1.00,
    'Data':              0.90,
    'IT':                1.00,
    'Supply Chain':      1.05,
    'Administration':    1.15,
  };
  return multipliers[department] || 1.0;
};
