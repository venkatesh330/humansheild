// Map job/skill combinations to recommended course categories
export const JOB_TO_COURSE_MAPPING: Record<string, string> = {
  // Finance/Accounting
  'fin_account': 'Bookkeeping',
  'fin_payroll': 'Bookkeeping',
  'fin_tax': 'Tax preparation',
  'fin_fp': 'Financial modelling',
  'fin_audit': 'Financial modelling',
  'fin_credit': 'Financial modelling',
  
  // Legal
  'leg_paralegal': 'Legal research',
  'leg_corporate': 'Legal research',
  'leg_compliance': 'Legal research',
  
  // Admin/Data
  'adm_data_entry': 'Data entry',
  'bpo_data_entry': 'Data entry',
  'adm_reception': 'Data entry',
  
  // Default
  'default': 'Financial modelling',
};

// Industry-to-skill course mapping
export const INDUSTRY_COURSE_MAPPING: Record<string, string[]> = {
  'finance': ['Financial modelling', 'Tax preparation', 'Data entry'],
  'accounting': ['Bookkeeping', 'Financial modelling'],
  'legal': ['Legal research'],
  'admin': ['Data entry', 'Financial modelling'],
  'bpo': ['Data entry'],
  'content': ['Data entry', 'Financial modelling'],
  'it_software': ['Financial modelling'],
  'default': ['Financial modelling', 'Data entry'],
};

export function getRecommendedCourses(jobId: string, industryKey: string): string[] {
  const directMap = JOB_TO_COURSE_MAPPING[jobId];
  if (directMap) return [directMap];
  
  const industryMap = INDUSTRY_COURSE_MAPPING[industryKey] || INDUSTRY_COURSE_MAPPING['default'];
  return industryMap;
}
