import { saveScore, getScoreHistory } from './scoreStorage';

export interface AssessmentSnapshot {
  id: string;
  date: string;
  jobRiskScore: number | null;
  jobTitle: string | null;
  skillRiskScore: number | null;
  humanScore: number | null;
  recommendedActions: string[];
  timeline: string;
  expiresIn: string;
}

export const generateAssessmentSnapshot = (
  jobRiskScore: number | null,
  jobTitle: string | null,
  skillRiskScore: number | null,
  humanScore: number | null,
): AssessmentSnapshot => {
  const recommendations: string[] = [];
  const maxRisk = Math.max(jobRiskScore ?? 0, skillRiskScore ?? 0, humanScore ?? 0);
  
  if (maxRisk >= 85) recommendations.push('Start upskilling immediately (2-4 weeks)');
  if (maxRisk >= 70) recommendations.push('Plan career transition (1-3 months)');
  if (maxRisk >= 55) recommendations.push('Begin targeted skill development');
  
  if (skillRiskScore !== null && skillRiskScore > (jobRiskScore ?? 0)) {
    recommendations.push('Focus on high-risk skills identified');
  }
  
  const timeline = 
    maxRisk >= 85 ? '6-18 months' :
    maxRisk >= 70 ? '18-30 months' :
    maxRisk >= 55 ? '2-4 years' :
    maxRisk >= 40 ? '4-6 years' : '6+ years';

  return {
    id: `snapshot-${Date.now()}`,
    date: new Date().toISOString(),
    jobRiskScore,
    jobTitle,
    skillRiskScore,
    humanScore,
    recommendedActions: recommendations,
    timeline,
    expiresIn: '7 days',
  };
};

export const exportAsJSON = (snapshot: AssessmentSnapshot): string => {
  return JSON.stringify(snapshot, null, 2);
};

export const generatePDFData = (snapshot: AssessmentSnapshot): string => {
  const lines = [
    '═══════════════════════════════════',
    '   HumanProof Assessment Report',
    '═══════════════════════════════════',
    `Date: ${new Date(snapshot.date).toLocaleDateString()}`,
    '',
    'SCORES:',
    snapshot.jobRiskScore ? `  Job Risk:           ${snapshot.jobRiskScore}%` : '',
    snapshot.jobTitle ? `  Position:           ${snapshot.jobTitle}` : '',
    snapshot.skillRiskScore ? `  Skill Risk:         ${snapshot.skillRiskScore}%` : '',
    snapshot.humanScore ? `  Human Irreplaceability: ${snapshot.humanScore}%` : '',
    '',
    'TIMELINE TO ACTION:',
    `  ${snapshot.timeline}`,
    '',
    'RECOMMENDED ACTIONS:',
    ...snapshot.recommendedActions.map(r => `  • ${r}`),
    '',
    '═══════════════════════════════════',
    `Report expires in ${snapshot.expiresIn}`,
  ];
  return lines.filter(l => l !== '').join('\n');
};

export const generateShareableLink = (): string => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `/share/${code}`;
};

export const generateHistoryComparison = (): { current: number | null; previous: number | null; delta: number | null; trend: string } => {
  const history = getScoreHistory();
  if (history.length < 2) return { current: null, previous: null, delta: null, trend: 'insufficient_data' };
  
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  
  const delta = current.score - previous.score;
  const trend = delta > 2 ? 'deteriorating' : delta < -2 ? 'improving' : 'stable';
  
  return {
    current: current.score,
    previous: previous.score,
    delta,
    trend,
  };
};
