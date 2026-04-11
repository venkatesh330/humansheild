// departmentRiskAgent.ts
// Company Signal — Department-specific elimination pattern lookup.
// HEURISTIC — combines department vulnerability data with industry context.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Department-level elimination probability (industry-agnostic baseline)
const DEPT_RISK: Record<string, number> = {
  'Recruiting':          0.88,
  'HR':                  0.75,
  'Marketing':           0.70,
  'Sales':               0.45,
  'Customer Support':    0.62,
  'Operations':          0.50,
  'Finance':             0.35,
  'Legal':               0.30,
  'Product':             0.35,
  'Engineering':         0.30,
  'Research':            0.38,
  'Design':              0.55,
  'Data Science':        0.28,
  'Security':            0.22,
  'DevOps':              0.25,
  'IT':                  0.40,
  'Strategy':            0.60,
  'Business Development': 0.52,
  'Communications':      0.65,
  'Administrative':      0.70,
  'default':             0.50,
};

// Industry modifiers — some depts are protected in specific industries
const INDUSTRY_DEPT_MODIFIER: Record<string, Record<string, number>> = {
  'Technology':    { 'Engineering': 0.80, 'Data Science': 0.78, 'Recruiting': 1.20 },
  'Finance':       { 'Finance': 0.75, 'Risk': 0.70, 'Marketing': 1.10 },
  'Healthcare':    { 'Research': 0.78, 'Engineering': 0.85 },
  'Retail':        { 'Recruiting': 1.15, 'Operations': 1.10 },
  'Manufacturing': { 'Operations': 0.80, 'Engineering': 0.82 },
};

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const deptKey = Object.keys(DEPT_RISK).find(
    k => input.department.toLowerCase().includes(k.toLowerCase())
  ) ?? 'default';

  let signal = DEPT_RISK[deptKey];

  // Apply industry modifier if available
  const iMod = INDUSTRY_DEPT_MODIFIER[input.industry]?.[deptKey];
  if (iMod !== undefined) signal = Math.min(0.95, signal * iMod);

  return {
    agentId:    'departmentRiskAgent',
    category:   'company',
    signal,
    confidence: 0.72,
    sourceType: 'heuristic',
    ageInDays:  1,
    metadata:   { department: input.department, matchedKey: deptKey, industryMod: iMod ?? 1.0 },
  };
};

export const departmentRiskAgent: AgentFn = { id: 'departmentRiskAgent', run };
