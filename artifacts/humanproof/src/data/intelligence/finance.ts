import { CareerIntelligence } from './types.ts';

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
  },
  fin_audit: {
    displayRole: 'Auditor',
    summary: 'High resilience in procedural judgment; extreme disruption in data verification.',
    skills: {
      obsolete: [{ skill: 'Transaction vouching', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI tests 100% of transactions vs 5% human sampling.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Professional Skepticism', whySafe: 'Challenging management requires human authority.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Auditor', riskReduction: 62, skillGap: 'CISA, bias checking', transitionDifficulty: 'Hard', industryMapping: ['Big 4'], salaryDelta: '+40-70%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 48, label: 'Now' }, { year: 2027, riskScore: 70, label: '+3yr' }],
    confidenceScore: 94,
  },
  inv_ibanking: {
    displayRole: 'Investment Banker (Associate)',
    summary: 'High resilience in deal negotiation; high disruption in pitchbook prep.',
    skills: {
      obsolete: [{ skill: 'Pitchbook generation', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-populates market maps and transaction history.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Client Relationship Management', whySafe: 'Winning the mandate requires human trust.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Private Equity Associate', riskReduction: 50, skillGap: 'Operations, Portfolio management', transitionDifficulty: 'Hard', industryMapping: ['Buy-side'], salaryDelta: '+50-150%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 30, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 95,
  },
  fin_tax: {
    displayRole: 'Tax Specialist',
    summary: 'High resilience in complex filing; disruption in standard compliance.',
    skills: {
      obsolete: [{ skill: 'Standard individual tax prep', riskScore: 96, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-files standard returns.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Controversial Tax Position Defense', whySafe: 'Defending positions before authorities requires ethical weight.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Global Tax Strategist', riskReduction: 60, skillGap: 'Cross-border reg', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 58, label: '+3yr' }],
    confidenceScore: 94,
  },
  fin_wealth: {
    displayRole: 'Wealth Manager',
    summary: 'High resilience due to trust and empathy requirements.',
    skills: {
      obsolete: [{ skill: 'Standard asset allocation', riskScore: 90, riskType: 'Automatable', horizon: '1yr', reason: 'Robo-advisors optimize standard risk profiles.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Behavioral Coaching & Empathy', whySafe: 'Navigating family inheritance dynamics and panic prevention.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Holistic Life Planner', riskReduction: 55, skillGap: 'Psychology, Estate planning', transitionDifficulty: 'Medium', industryMapping: ['Wealth'], salaryDelta: '+20-50%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 96,
  },
  fin_fp_analyst: {
    displayRole: 'FP&A Analyst',
    summary: 'Moderate resilience; resilience in strategic scenario modeling.',
    skills: {
      obsolete: [{ skill: 'Budget variance reporting', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-identifies variances.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Scenario Synthesis', whySafe: 'Interpreting non-linear business threats into financial models.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Strategic Finance Lead', riskReduction: 52, skillGap: 'Business strategy', transitionDifficulty: 'Medium', industryMapping: ['Corporate'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 94,
  },
  inv_equity_res: {
    displayRole: 'Equity Research',
    summary: 'High disruption in info-aggregation; resilience in novel insight generation.',
    skills: {
      obsolete: [{ skill: 'Earnings call summarization', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI summarizes earnings in seconds.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Variant Perception Generation', whySafe: 'Developing non-consensus views based on human intuition.', longTermValue: 98, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Portfolio Manager (Active)', riskReduction: 58, skillGap: 'Risk management', transitionDifficulty: 'Hard', industryMapping: ['Asset Management'], salaryDelta: '+50-200%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 40, label: 'Now' }, { year: 2027, riskScore: 68, label: '+3yr' }],
    confidenceScore: 96,
  },
  fin_underwriter: {
    displayRole: 'Insurance Underwriter',
    summary: 'Extreme disruption in standard risk; resilience in bespoke risks.',
    skills: {
      obsolete: [{ skill: 'Standard risk assessment', riskScore: 99, riskType: 'Automatable', horizon: '1yr', reason: 'AI models predict loss ratios 50% better for standard risk.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Bespoke Cyber/Catastrophe Risk', whySafe: 'Pricing risks where no historical data exists.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Risk Tech Architect', riskReduction: 65, skillGap: 'Data science', transitionDifficulty: 'Hard', industryMapping: ['InsurTech'], salaryDelta: '+30-70%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 55, label: 'Now' }, { year: 2027, riskScore: 88, label: '+3yr' }],
    confidenceScore: 98,
  },
  fin_credit_analyst: {
    displayRole: 'Credit Analyst',
    summary: 'High disruption in standard scoring; resilience in complex commercial credit.',
    skills: {
      obsolete: [{ skill: 'Routine retail credit scoring', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI analyzes credit files instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Commercial Credit Synthesis', whySafe: 'Assessing idiosyncratic business risk.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Senior Commercial Underwriter', riskReduction: 52, skillGap: 'Portfolio risk strategy', transitionDifficulty: 'Medium', industryMapping: ['Banking'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 62, label: '+3yr' }],
    confidenceScore: 96,
  },
  fin_banking_ops: {
    displayRole: 'Banking Operations Manager',
    summary: 'Extreme disruption in back-office processing; resilience in platform transformation.',
    skills: {
      obsolete: [{ skill: 'Transaction reconciliation', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI handles settlements and auto-reconciles breaks.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Operational Resilience & Transformation', whySafe: 'Redesigning core systems.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'FinTech Platform Director', riskReduction: 65, skillGap: 'API-led architecture', transitionDifficulty: 'Hard', industryMapping: ['FinTech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 52, label: 'Now' }, { year: 2027, riskScore: 85, label: '+3yr' }],
    confidenceScore: 98,
  },
  fin_pe: {
    displayRole: 'Private Equity Associate',
    summary: 'High resilience in complex deal negotiation.',
    skills: {
      safe: [{ skill: 'Portfolio Operational Turnaround', whySafe: 'Implementing human-centric operational changes in companies.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Principal / Deal Partner', riskReduction: 45, skillGap: 'Deal sourcing', transitionDifficulty: 'Hard', industryMapping: ['Buy-side'], salaryDelta: '+200-500%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 97,
  },
  fin_vc: {
    displayRole: 'Venture Capital Analyst',
    summary: 'Moderate resilience; extreme disruption in early-stage due diligence.',
    skills: {
      safe: [{ skill: 'Founder Character Assessment', whySafe: 'Evaluating the "grit" and pivot-potential of first-time founders.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Growth Equity Investor', riskReduction: 55, skillGap: 'Growth metrics', transitionDifficulty: 'Medium', industryMapping: ['Buy-side'], salaryDelta: '+50-150%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 50, label: '+3yr' }],
    confidenceScore: 95,
  },
  fin_quant: {
    displayRole: 'Quantitative Analyst',
    summary: 'High resilience in algorithmic innovation.',
    skills: {
      safe: [{ skill: 'Novel Systematic Strategy Design', whySafe: 'Designing zero-day trading strategies.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Director of Systematic Trading', riskReduction: 60, skillGap: 'Risk management', transitionDifficulty: 'Hard', industryMapping: ['Hedge Funds'], salaryDelta: '+100-400%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
  fin_mergers: {
    displayRole: 'M&A Advisor',
    summary: 'High resilience in deal closing.',
    skills: {
      safe: [{ skill: 'Strategic Deal Closing & Multi-Party Synergy', whySafe: 'Negotiating the human and cultural integration of two giant entities.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Strategy Officer', riskReduction: 55, skillGap: 'Operational strategy', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+100-200%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 20, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 98,
  },
  fin_crypto: {
    displayRole: 'Crypto Analyst',
    summary: 'High resilience in protocol logic.',
    skills: {
      safe: [{ skill: 'Decentralized Protocol Governance Synthesis', whySafe: 'Analyzing the complex human-incentive alignment in novel DAO structures.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'DeFi Portfolio Architect', riskReduction: 65, skillGap: 'Smart contract security', transitionDifficulty: 'Hard', industryMapping: ['Web3'], salaryDelta: '+50-200%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 97,
  },
  fin_forensic: {
    displayRole: 'Forensic Accountant / Fraud Investigator',
    summary: 'High resilience due to the adversary-based nature of fraud and the requirement for non-linear investigative intuition; disruption in routine pattern matching.',
    skills: {
      obsolete: [{ skill: 'Standard transaction anomaly matching', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI-agents identify 99% of routine anomalies in structured ledger data instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Adversarial Intuition & Fraud Reconstruction', whySafe: 'Reconstructing the "intent" behind complex, human-led multi-party evasion schemes.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Audit Executive (CAE)', riskReduction: 45, skillGap: 'Enterprise risk governance, board relations', transitionDifficulty: 'Hard', industryMapping: ['Big 4 / Gov'], salaryDelta: '+50-120%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  fin_actuary: {
    displayRole: 'Actuary / Risk Modeler',
    summary: 'High resilience in multi-decade risk synthesis; disruption in standard morbidity/mortality table calculation.',
    skills: {
      obsolete: [{ skill: 'Standard mortality/morbidity table calculation', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI models predict cohort risk 100x more accurately based on real-time wearable data.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Long-Tail Tail-Risk Synthesis', whySafe: 'Developing capital reserves for "black swan" climate or biological events without historical baselines.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Chief Risk Officer (CRO)', riskReduction: 55, skillGap: 'Strategic finance, capital markets', transitionDifficulty: 'Hard', industryMapping: ['Insurance / Banking'], salaryDelta: '+100-250%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 97,
  },
};
