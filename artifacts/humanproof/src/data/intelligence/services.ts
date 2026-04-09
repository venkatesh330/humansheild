import { CareerIntelligence } from './types';

export const SERVICES_INTELLIGENCE: Record<string, CareerIntelligence> = {
  bpo_inbound: {
    displayRole: 'Customer Support (Inbound)',
    summary: 'High disruption in routine inquiry resolution; resilience in complex empathetic conflict resolution.',
    skills: {
      obsolete: [{ skill: 'Standard FAQ answering', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'LLMs resolve 90% of routine queries with higher CSAT than humans.', aiReplacement: 'Full', aiTool: 'Intercom Fin' }],
      at_risk: [{ skill: 'Complaint documentation', riskScore: 82, riskType: 'Augmented', horizon: '1-2yr', reason: 'AI auto-summarizes cases.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Creative Conflict Resolution', whySafe: 'Handling non-standard customer rage or complex logical errors requires human empathy and judgment.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Conversation Designer', riskReduction: 65, skillGap: 'Voiceflow, Botpress, UX writing', transitionDifficulty: 'Medium', industryMapping: ['Product Teams'], salaryDelta: '+40–80%', timeToTransition: '9 months' }],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'AI Copilot Mastery', actions: [{ action: 'Master use of Zendesk AI Copilot', why: 'Survival baseline.', outcome: 'Efficiency win' }] },
      },
    },
    inactionScenario: 'Standard script-readers will be replaced by AI within 12-18 months. Success requires moving to CX Strategy or Conversation Design.',
    riskTrend: [{ year: 2024, riskScore: 65, label: 'Now' }, { year: 2027, riskScore: 90, label: '+3yr' }],
    confidenceScore: 98,
  },
  hr_recruit: {
    displayRole: 'Recruiter',
    summary: 'Moderate resilience in candidate relationship management; extreme disruption in screening and sourcing.',
    skills: {
      obsolete: [{ skill: 'Resume/CV screening', riskScore: 96, riskType: 'Automatable', horizon: '1yr', reason: 'AI analyzes fit better than manual scanning.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Standard interview coordination', riskScore: 85, riskType: 'Augmented', horizon: '1yr', reason: 'AI scheduling bots.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Talent Intelligence', whySafe: 'Advising leaders on executive hiring and cultural fit strategy.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Talent Intelligence Specialist', riskReduction: 55, skillGap: 'Market mapping, Data analytics, LinkedIn Insights', transitionDifficulty: 'Medium', industryMapping: ['Corporate HR'], salaryDelta: '+30–60%', timeToTransition: '12 months' }],
    roadmap: {
      '2-5': {
        phase_1: { timeline: '30 days', focus: 'Market Data', actions: [{ action: 'Master LinkedIn Talent Insights', why: 'Focus on strategy over sourcing.', outcome: 'Data expert' }] },
      },
    },
    inactionScenario: 'Pure "sourcers" will be replaced. Success requires moving toward executive search or people analytics.',
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 70, label: '+3yr' }],
    confidenceScore: 94,
  },
  leg_corporate: {
    displayRole: 'Corporate Lawyer',
    summary: 'Moderate resilience in strategic deal structuring; high disruption in drafting and due diligence.',
    skills: {
      obsolete: [{ skill: 'Standard contract drafting', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'LLMs generate standard commercial agreements with 95%+ accuracy.', aiReplacement: 'Full', aiTool: 'Harvey' }],
      at_risk: [{ skill: 'Due diligence review', riskScore: 85, riskType: 'Augmented', horizon: '1-3yr', reason: 'AI analyzes thousands of docs for specific clauses in minutes.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Deal Structuring', whySafe: 'Complex multi-party transactions require high-level human synthesis.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Legal Tech Director', riskReduction: 55, skillGap: 'AI implementation, Legal Ops', transitionDifficulty: 'Medium', industryMapping: ['Law Firms'], salaryDelta: '+30–60%', timeToTransition: '12 months' }],
    roadmap: {
      '5-10': {
        phase_1: { timeline: '30 days', focus: 'AI Governance', actions: [{ action: 'Advise clients on AI risk and compliance', why: 'The new high-value legal niche.', outcome: 'AI Specialist' }] },
      },
    },
    inactionScenario: 'Standard document reviewers will be obsolete. Success requires moving to strategic deal advisory or legal tech leadership.',
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2027, riskScore: 62, label: '+3yr' }],
    confidenceScore: 95,
  },
};
