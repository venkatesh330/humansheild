import { CareerIntelligence } from './types';

export const TECH_INTELLIGENCE: Record<string, CareerIntelligence> = {
  sw_backend: {
    displayRole: 'Backend Developer',
    summary: 'High resilience in architecture and integration; significant disruption in boilerplate and standard API logic.',
    skills: {
      obsolete: [{ skill: 'CRUD API boilerplate', riskScore: 92, riskType: 'Automatable', horizon: '1-2yr', reason: 'LLMs generate standard CRUD logic with high precision.', aiReplacement: 'Full', aiTool: 'Github Copilot, Cursor' }],
      at_risk: [{ skill: 'Performance optimization', riskScore: 65, riskType: 'Augmented', horizon: '3yr', reason: 'AI analyzes profiling data better than humans.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Distributed Systems Architecture', whySafe: 'Complex cross-service coordination requires high-level human synthesis.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI/LLM Systems Engineer', riskReduction: 65, skillGap: 'LangChain, Vector DBs, RAG', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+40–70%', timeToTransition: '12 months' }],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'AI-First Coding', actions: [{ action: 'Master Cursor and Copilot', why: '10x productivity baseline.', outcome: 'AI Mastery' }] },
      },
    },
    inactionScenario: 'Standard boilerplate developers will be replaced. Success requires moving toward architecture and AI integration.',
    riskTrend: [{ year: 2024, riskScore: 40, label: 'Now' }, { year: 2027, riskScore: 65, label: '+3yr' }],
    confidenceScore: 92,
  },
  sw_frontend: {
    displayRole: 'Frontend Developer',
    summary: 'Moderate resilience in UX logic; high disruption in UI component generation.',
    skills: {
      obsolete: [{ skill: 'Figma to Code conversion', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'Tools like v0.dev generate production code from mockups.', aiReplacement: 'Full', aiTool: 'v0' }],
      at_risk: [{ skill: 'State management boilerplate', riskScore: 70, riskType: 'Augmented', horizon: '2yr', reason: 'AI handles redundant state patterns.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Design System Architecture', whySafe: 'Tokenization and component reuse logic requires human foresight.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Design Systems Engineer', riskReduction: 55, skillGap: 'Token systems, Accessibility', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+30–50%', timeToTransition: '9 months' }],
    inactionScenario: 'Pure UI "painters" will be replaced. Success requires moving toward UX strategy and design systems.',
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 75, label: '+3yr' }],
    confidenceScore: 92,
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'Generative UI', actions: [{ action: 'Master v0.dev and Shadcn', why: 'Focus on assembly.', outcome: 'UI Speed' }] },
      }
    }
  },
  sw_cloud: {
    displayRole: 'Cloud Engineer',
    summary: 'High resilience in complex migrations; disruption in standard infra provisioning via IaC.',
    skills: {
      obsolete: [{ skill: 'Standard cloud provisioning', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI generates Terraform/Pulumi code from diagrams.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Standard cost monitoring', riskScore: 75, riskType: 'Augmented', horizon: '1styr', reason: 'FinOps AI automates resizing.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Multi-Cloud Governance', whySafe: 'Designing zero-trust architectures across diverse global regs requires human liability.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'FinOps Specialist', riskReduction: 55, skillGap: 'Financial literacy, Unit cost analysis', transitionDifficulty: 'Medium', industryMapping: ['Enterprise'], salaryDelta: '+30–60%', timeToTransition: '9 months' }],
    inactionScenario: 'Standard "console-clickers" will be obsolete. Success requires moving toward High-scale Architecture and FinOps.',
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 95,
    roadmap: {
      '2-5': {
        phase_1: { timeline: '30 days', focus: 'Multi-Cloud', actions: [{ action: 'AWS Certified Solutions Architect - Professional', why: 'Essential level.', outcome: 'Certified' }] },
      }
    }
  },
  it_cybersec: {
    displayRole: 'Cybersecurity Analyst',
    summary: 'High resilience due to the zero-sum game of offense/defense; AI augments threat detection.',
    skills: {
      obsolete: [{ skill: 'Standard log analysis', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI-SIEM platforms flag 99% of routine anomalies.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Phishing simulation', riskScore: 82, riskType: 'Augmented', horizon: '1yr', reason: 'AI generates more convincing social engineering.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Novel Threat Hunting', whySafe: 'Responding to zero-day attacks requires non-linear human adversarial thinking.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'DevSecOps Engineer', riskReduction: 52, skillGap: 'CI/CD security, Policy-as-code', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+40–80%', timeToTransition: '18 months' }],
    inactionScenario: 'SOC Tier 1 analysts will be obsolete. Success requires moving to incident response and offensive security.',
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 98,
    roadmap: {
      '5-10': {
        phase_1: { timeline: '30 days', focus: 'AI Security', actions: [{ action: 'Complete a course in LLM Red Teaming', why: 'The new high-value niche.', outcome: 'Red Team expert' }] },
      }
    }
  },
  it_qa: {
    displayRole: 'QA Engineer',
    summary: 'High disruption in standard test case generation and execution; resilience in strategic test planning and edge case discovery.',
    skills: {
      obsolete: [{ skill: 'Standard test case execution', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI agents (Cypress AI) execute and self-heal tests autonomously.', aiReplacement: 'Full', aiTool: 'Cypress AI' }],
      at_risk: [{ skill: 'Manual regression testing', riskScore: 92, riskType: 'Augmented', horizon: '1yr', reason: 'AI identifies visual and logical regressions instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Test Architecture', whySafe: 'Designing the "Quality Culture" and determining what AI should/should not test.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'QA Automation Lead (AI Focused)', riskReduction: 55, skillGap: 'AI self-healing scripts, visual testing tools', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+25–45%', timeToTransition: '9 months' }],
    inactionScenario: 'Manual testers will face extreme salary compression. Success requires moving to Automation Architecture and AI-driven quality strategy.',
    riskTrend: [{ year: 2024, riskScore: 55, label: 'Now' }, { year: 2027, riskScore: 85, label: '+3yr' }],
    confidenceScore: 92,
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'Automation Tools', actions: [{ action: 'Learn Playwright and Playwright AI', why: 'Modern automation baseline.', outcome: 'Automation expert' }] },
      }
    }
  },
  sw_fullstack: {
    displayRole: 'Full Stack Developer',
    summary: 'Moderate resilience due to systems-level thinking; high disruption in standard feature development.',
    skills: {
      obsolete: [{ skill: 'Form and UI boilerplate', riskScore: 94, riskType: 'Automatable', horizon: '1yr', reason: 'AI generates full-stack features (UI, API, DB) from natural language.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Standard DB schema design', riskScore: 65, riskType: 'Augmented', horizon: '2yr', reason: 'AI optimizes schemas based on query patterns.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Product Logic & Complex Integrations', whySafe: 'Synthesizing conflicting business requirements into working software.', longTermValue: 96, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Product Engineer', riskReduction: 52, skillGap: 'Product management, User research, Analytics', transitionDifficulty: 'Medium', industryMapping: ['Startups'], salaryDelta: '+20–40%', timeToTransition: '12 months' }],
    inactionScenario: 'Standard "feature-shippers" will be replaced. Success requires moving toward Product Engineering and AI systems.',
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 58, label: '+3yr' }],
    confidenceScore: 94,
    roadmap: {
      '2-5': {
        phase_1: { timeline: '30 days', focus: 'AI Integration', actions: [{ action: 'Build a RAG-based search for your application', why: 'Master the new stack.', outcome: 'RAG Feature delivered' }] },
      }
    }
  },
};
