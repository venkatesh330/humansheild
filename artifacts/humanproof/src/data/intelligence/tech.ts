import { CareerIntelligence } from './types.ts';

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
  },
  it_cybersec: {
    displayRole: 'Cybersecurity Analyst',
    summary: 'High resilience due to the zero-sum game of offense/defense; AI augments threat detection.',
    skills: {
      obsolete: [{ skill: 'Standard log analysis', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI-SIEM platforms flag 99% of routine anomalies.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Novel Threat Hunting', whySafe: 'Responding to zero-day attacks requires non-linear human adversarial thinking.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'DevSecOps Engineer', riskReduction: 52, skillGap: 'CI/CD security, Policy-as-code', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+40–80%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 98,
  },
  it_qa: {
    displayRole: 'QA Engineer',
    summary: 'High disruption in standard test case generation; resilience in strategic test planning.',
    skills: {
      obsolete: [{ skill: 'Standard test case execution', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI agents execute and self-heal tests.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Test Architecture', whySafe: 'Designing the "Quality Culture" and choosing what to test.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'QA Automation Lead (AI)', riskReduction: 55, skillGap: 'Self-healing scripts', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+25–45%', timeToTransition: '9 months' }],
    riskTrend: [{ year: 2024, riskScore: 55, label: 'Now' }, { year: 2027, riskScore: 85, label: '+3yr' }],
    confidenceScore: 92,
  },
  mob_ios: {
    displayRole: 'iOS Developer',
    summary: 'Moderate resilience in hardware integration.',
    skills: {
      safe: [{ skill: 'On-device ML Integration', whySafe: 'Optimizing for local neural engines requires deep hardware intuition.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Mobile Platform Architect', riskReduction: 58, skillGap: 'CoreML', transitionDifficulty: 'Hard', industryMapping: ['Product'], salaryDelta: '+30–60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 60, label: '+3yr' }],
    confidenceScore: 94,
  },
  ds_scientist: {
    displayRole: 'Data Scientist',
    summary: 'High disruption in modeling; resilience in problem formulation.',
    skills: {
      safe: [{ skill: 'Strategic Problem Formulation', whySafe: 'Defining "what" to solve for the business.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Strategy Consultant', riskReduction: 65, skillGap: 'Business strategy', transitionDifficulty: 'Medium', industryMapping: ['Consulting'], salaryDelta: '+50–100%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 40, label: 'Now' }, { year: 2027, riskScore: 72, label: '+3yr' }],
    confidenceScore: 95,
  },
  ml_engineer: {
    displayRole: 'ML Engineer',
    summary: 'High resilience in architecture.',
    skills: {
      safe: [{ skill: 'AI System Architecture (RAG)', whySafe: 'Designing multi-component AI systems at scale.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Chief AI Architect', riskReduction: 70, skillGap: 'Platform strategy', transitionDifficulty: 'Very Hard', industryMapping: ['Tech'], salaryDelta: '+100–300%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 98,
  },
  sw_embedded: {
    displayRole: 'Embedded Developer',
    summary: 'Exremely high resilience.',
    skills: {
      safe: [{ skill: 'Safety-Critical Design', whySafe: 'Developing firmware where failure is fatal.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Robotics Software Engineer', riskReduction: 45, skillGap: 'ROS', transitionDifficulty: 'Medium', industryMapping: ['IoT'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  sw_legacy: {
    displayRole: 'Legacy Systems (COBOL)',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Legacy Knowledge Moat', whySafe: 'Understanding "why" a system was built 40 years ago.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Modernization Architect', riskReduction: 60, skillGap: 'Cloud patterns', transitionDifficulty: 'Hard', industryMapping: ['Banking'], salaryDelta: '+50-100%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 96,
  },
  it_sre: {
    displayRole: 'SRE',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Novel Failure Diagnosis', whySafe: 'Solving "black swan" events in massive systems.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Platform Engineer', riskReduction: 55, skillGap: 'Developer experience', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 20, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 98,
  },
  data_eng: {
    displayRole: 'Data Engineer',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Data Quality Governance & Ethics', whySafe: 'Ensuring biased data doesn\'t poison AI models.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Infrastructure Engineer', riskReduction: 65, skillGap: 'Vector DBs', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+40-80%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 97,
  },
  it_lead: {
    displayRole: 'Tech Lead',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'High-Stakes Mentorship', whySafe: 'Developing human talent.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'VP Engineering', riskReduction: 45, skillGap: 'Business strategy', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+50-150%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  sw_devops: {
    displayRole: 'DevOps Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Zero-Trust Architecture Design', whySafe: 'Designing security perimeters across multi-cloud.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Platform Architect', riskReduction: 55, skillGap: 'IDP design', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 98,
  },
  sw_pm: {
    displayRole: 'Product Manager',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Market Empathy & Vision Synthesis', whySafe: 'Identifying non-obvious human needs.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'CPO', riskReduction: 60, skillGap: 'Executive strategy', transitionDifficulty: 'Very Hard', industryMapping: ['Product'], salaryDelta: '+100-300%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 97,
  },
  sw_agile: {
    displayRole: 'Scrum Master',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Human-Centric Conflict Resolution', whySafe: 'Managing the emotional friction in teams.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Org Design Consultant', riskReduction: 52, skillGap: 'Systems thinking', transitionDifficulty: 'Medium', industryMapping: ['Enterprise'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2027, riskScore: 68, label: '+3yr' }],
    confidenceScore: 94,
  },
  sw_security_arch: {
    displayRole: 'Security Architect',
    summary: 'Extremely high resilience.',
    skills: {
      safe: [{ skill: 'Threat Modeling for AI Vectors', whySafe: 'Designing defenses against unprecedented AI attacks.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'CISO', riskReduction: 45, skillGap: 'Board governance', transitionDifficulty: 'Very Hard', industryMapping: ['Enterprise'], salaryDelta: '+100-250%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  sw_game_dev: {
    displayRole: 'Game Developer',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Emergent Gameplay Design', whySafe: 'Designing complex, fun interactions.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Virtual Production Lead', riskReduction: 55, skillGap: 'Unreal Engine', transitionDifficulty: 'Medium', industryMapping: ['Film'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 58, label: '+3yr' }],
    confidenceScore: 94,
  },
  sw_bioinformatics: {
    displayRole: 'Bioinformatics Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Biological Signal Synthesis', whySafe: 'Developing novel hypotheses from multi-modal omics.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Precision Medicine Architect', riskReduction: 60, skillGap: 'Clinical informatics', transitionDifficulty: 'Hard', industryMapping: ['Biotech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  sw_quantum: {
    displayRole: 'Quantum Scientist',
    summary: 'Extremely high resilience.',
    skills: {
      safe: [{ skill: 'Error Mitigation Architecture', whySafe: 'Developing the logical bridge for NISQ hardware.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'PQC Lead', riskReduction: 50, skillGap: 'Lattice-based crypto', transitionDifficulty: 'Hard', industryMapping: ['Gov'], salaryDelta: '+60-150%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  sw_blockchain_arch: {
    displayRole: 'Blockchain Architect',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Decentralized Incentive Synthesis', whySafe: 'Designing the balance of human incentives.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'DeFi Ecosystem Lead', riskReduction: 55, skillGap: 'Governance strategy', transitionDifficulty: 'Medium', industryMapping: ['Web3'], salaryDelta: '+40-100%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 97,
  },
  sw_edge_ai_iot: {
    displayRole: 'Edge AI / IoT Systems Lead',
    summary: 'High resilience due to the convergence of hardware-constrained AI, real-time physical latency requirements, and distributed system complexity.',
    skills: {
      obsolete: [{ skill: 'Routine IoT dashboard and cloud-connector boilerplate', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-generates standard MQTT-to-Cloud connectors and dashboard templates instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Distributed Edge Inference Optimization', whySafe: 'Balancing model quantization, power constraints, and real-time physical response logic.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Industrial Autonomy Architect', riskReduction: 45, skillGap: 'Robotic sensing, safety-critical edge loops', transitionDifficulty: 'Hard', industryMapping: ['Manufacturing / Automotive'], salaryDelta: '+50-120%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 99,
  },
  sw_simulation_finite: {
    displayRole: 'FEA / Computational Simulation Lead',
    summary: 'High resilience in high-stakes physical world failure prediction; disruption in routine mesh generation.',
    skills: {
      obsolete: [{ skill: 'Routine geometric mesh generation and cleanup', riskScore: 96, riskType: 'Automatable', horizon: '1styr', reason: 'AI auto-remeshes and optimizes standard geometries for simulation accuracy instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Non-Linear Failure Mode Synthesis', whySafe: 'Predicting how novel materials and geometries fail in unprecedented high-stress physical environments.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Digital Twin Architect', riskReduction: 55, skillGap: 'IoT-to-Simulation loops, real-time physics engines', transitionDifficulty: 'Hard', industryMapping: ['Heavy Industry'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
};
