import { CareerIntelligence } from './types';

export const FINANCE_INTELLIGENCE: Record<string, CareerIntelligence> = {
  fin_account: {
    displayRole: 'Accountant',
    summary: 'High resilience in advisory and tax strategy; high disruption in routine bookkeeping.',
    skills: {
      obsolete: [{ skill: 'Routine bookkeeping', riskScore: 94, riskType: 'Automatable', horizon: '1-2yr', reason: 'ERP systems with AI auto-categorize 99% of transactions.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Standard financial statements', riskScore: 78, riskType: 'Augmented', horizon: '1-3yr', reason: 'AI generates statements; humans verify compliance.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Strategic Tax Advisory', whySafe: 'Navigating global tax intent requires human wisdom.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'CFO Advisor', riskReduction: 58, skillGap: 'Business strategy, Capital planning', transitionDifficulty: 'Hard', industryMapping: ['SME'], salaryDelta: '+50-100%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 60, label: '+3yr' }],
    confidenceScore: 94,
    roadmap: { '5-10': { phase_1: { timeline: '30 days', focus: 'AI Mastery', actions: [{ action: 'Master AI auditing tools', why: 'Efficiency.', outcome: 'Certified' }] } } }
  },
  fin_audit: {
    displayRole: 'Auditor',
    summary: 'High resilience in procedural judgment; extreme disruption in data verification.',
    skills: {
      obsolete: [{ skill: 'Transaction vouching', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI tests 100% of transactions vs 5% human sampling.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Internal control testing', riskScore: 65, riskType: 'Augmented', horizon: '3yr', reason: 'Continuous AI monitoring.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Professional Skepticism', whySafe: 'Challenging management requires human authority.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Auditor', riskReduction: 62, skillGap: 'CISA, bias checking', transitionDifficulty: 'Hard', industryMapping: ['Big 4'], salaryDelta: '+40-70%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 48, label: 'Now' }, { year: 2027, riskScore: 70, label: '+3yr' }],
    confidenceScore: 94,
    roadmap: { '0-2': { phase_1: { timeline: '30 days', focus: 'CISA Track', actions: [{ action: 'Start CISA prep', why: 'Systems auditing is the future.', outcome: 'CISA Candidate' }] } } }
  },
  inv_ibanking: {
    displayRole: 'Investment Banker (Associate)',
    summary: 'High resilience in deal negotiation; high disruption in pitchbook prep and valuation modeling.',
    skills: {
      obsolete: [{ skill: 'Pitchbook generation', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-populates market maps and transaction history.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Standard valuation modeling', riskScore: 75, riskType: 'Augmented', horizon: '2yr', reason: 'AI generates LBO/DCF base models.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Client Relationship Management', whySafe: 'Winning the mandate requires human trust and persuasion.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Private Equity Associate', riskReduction: 50, skillGap: 'Operations, Portfolio management', transitionDifficulty: 'Hard', industryMapping: ['Buy-side'], salaryDelta: '+50-150%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 30, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 95,
    roadmap: { '2-5': { phase_1: { timeline: '30 days', focus: 'AI for IB', actions: [{ action: 'Master AI-driven market intelligence tools', why: '10x productivity.', outcome: 'Deal speed' }] } } }
  },
  fin_tax: {
    displayRole: 'Tax Specialist',
    summary: 'High resilience in complex filing; disruption in standard individuals/SME compliance.',
    skills: {
      obsolete: [{ skill: 'Standard individual tax prep', riskScore: 96, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-calculates and files standard returns.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Controversial Tax Position Defense', whySafe: 'Defending positions before authorities requires human ethical weight.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Global Tax Strategist', riskReduction: 60, skillGap: 'Cross-border reg, Pillar Two', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 58, label: '+3yr' }],
    confidenceScore: 94,
    roadmap: { '5-10': { phase_1: { timeline: '30 days', focus: 'Global Compliance', actions: [{ action: 'Study Pillar Two global tax standards', why: 'The new high-value complexity.', outcome: 'Global Expert' }] } } }
  },
};
