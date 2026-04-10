import { CareerIntelligence } from './types.ts';

export const SERVICES_INTELLIGENCE: Record<string, CareerIntelligence> = {
  bpo_inbound: {
    displayRole: 'Customer Support (Inbound)',
    summary: 'High disruption in routine inquiry resolution; resilience in complex empathetic conflict resolution.',
    skills: {
      obsolete: [{ skill: 'Standard FAQ answering', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'LLMs resolve 90% of routine queries.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Creative Conflict Resolution', whySafe: 'Handling non-standard rage or logical errors requires empathy.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Conversation Designer', riskReduction: 65, skillGap: 'Voiceflow, Botpress', transitionDifficulty: 'Medium', industryMapping: ['Product Teams'], salaryDelta: '+40-80%', timeToTransition: '9 months' }],
    riskTrend: [{ year: 2024, riskScore: 65, label: 'Now' }, { year: 2027, riskScore: 90, label: '+3yr' }],
    confidenceScore: 98,
  },
  hr_recruit: {
    displayRole: 'Recruiter',
    summary: 'Moderate resilience in candidate relationship; extreme disruption in screening and sourcing.',
    skills: {
      obsolete: [{ skill: 'Resume/CV screening', riskScore: 96, riskType: 'Automatable', horizon: '1yr', reason: 'AI analyzes fit better than manual scanning.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Talent Intelligence', whySafe: 'Advising leaders on executive hiring and cultural fit.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Talent Intelligence Specialist', riskReduction: 55, skillGap: 'Market mapping, analytics', transitionDifficulty: 'Medium', industryMapping: ['Corporate HR'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 70, label: '+3yr' }],
    confidenceScore: 94,
  },
  leg_corporate: {
    displayRole: 'Corporate Lawyer',
    summary: 'Moderate resilience in strategic deal structuring; high disruption in drafting.',
    skills: {
      obsolete: [{ skill: 'Standard contract drafting', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'LLMs generate standard agreements with 95%+ accuracy.', aiReplacement: 'Full', aiTool: 'Harvey' }],
      safe: [{ skill: 'Strategic Deal Structuring', whySafe: 'Complex multi-party transactions require human synthesis.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Legal Tech Director', riskReduction: 55, skillGap: 'AI implementation, Legal Ops', transitionDifficulty: 'Medium', industryMapping: ['Law Firms'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2027, riskScore: 62, label: '+3yr' }],
    confidenceScore: 95,
  },
  hr_hrbp: {
    displayRole: 'HR Business Partner',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Cultural Change Management', whySafe: 'Guiding organizations through complex transformations.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Chief People Officer', riskReduction: 45, skillGap: 'Business strategy', transitionDifficulty: 'Hard', industryMapping: ['Corporate'], salaryDelta: '+50-150%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 96,
  },
  leg_litigation: {
    displayRole: 'Litigation Lawyer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Trial Advocacy & Persuasion', whySafe: 'Reading a room and persuading a judge is irreducibly human.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Complex Litigation Lead', riskReduction: 40, skillGap: 'Trial experience', transitionDifficulty: 'Hard', industryMapping: ['Law Firms'], salaryDelta: '+40-100%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 20, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 98,
  },
  leg_ip: {
    displayRole: 'IP Attorney',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Strategic IP Portfolio Design', whySafe: 'Developing a competitive moat using legal-technical synthesis.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'VC IP Lead', riskReduction: 55, skillGap: 'Commercialization', transitionDifficulty: 'Hard', industryMapping: ['VC Firms'], salaryDelta: '+50-100%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 96,
  },
  hr_comp: {
    displayRole: 'Compensation Specialist',
    summary: 'High disruption.',
    skills: {
      safe: [{ skill: 'Executive Incentive Design', whySafe: 'Designing performance triggers that align with long-term culture.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Total Rewards Director', riskReduction: 58, skillGap: 'Global tax strategy', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+40-80%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 60, label: '+3yr' }],
    confidenceScore: 94,
  },
  bpo_claims: {
    displayRole: 'Claims Processor',
    summary: 'Extreme disruption.',
    skills: {
      safe: [{ skill: 'Forensic Fraud Audit', whySafe: 'Identifying non-obvious human behavior patterns.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Claims Strategy Lead', riskReduction: 65, skillGap: 'AI auditing', transitionDifficulty: 'Medium', industryMapping: ['InsurTech'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 68, label: 'Now' }, { year: 2027, riskScore: 92, label: '+3yr' }],
    confidenceScore: 98,
  },
  ser_real_estate: {
    displayRole: 'Real Estate Agent',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Closing Negotiation', whySafe: 'Managing the bridge between buyer/seller.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Luxury Client Advisor', riskReduction: 45, skillGap: 'Estate strategy', transitionDifficulty: 'Medium', industryMapping: ['Family Offices'], salaryDelta: '+50-200%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 40, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 92,
  },
  ser_chef: {
    displayRole: 'Executive Chef',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Sensory Innovation', whySafe: 'Nuanced palate development and physical team dynamics.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Culinary R&D Director', riskReduction: 60, skillGap: 'Food science', transitionDifficulty: 'Hard', industryMapping: ['Food Tech'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 97,
  },
  ser_event_planner: {
    displayRole: 'Event Planner',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'On-Site Crisis Coordination', whySafe: 'Solving physical world disasters in real-time.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Experiential Marketing Lead', riskReduction: 55, skillGap: 'Brand strategy', transitionDifficulty: 'Medium', industryMapping: ['Corporate'], salaryDelta: '+40-80%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 94,
  },
  ser_success_mgr: {
    displayRole: 'Customer Success Manager',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Strategic Partnership Strategy', whySafe: 'Aligning software value to human goals.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Enterprise Account Director', riskReduction: 50, skillGap: 'Executive presence', transitionDifficulty: 'Medium', industryMapping: ['SaaS'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 30, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 95,
  },
  ser_mgmt_cons: {
    displayRole: 'Management Consultant',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Organizational Alignment', whySafe: 'Managing the complex internal politics of corporate change.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Strategy Implementation Director', riskReduction: 55, skillGap: 'Project leadership', transitionDifficulty: 'Medium', industryMapping: ['Corporate'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 96,
  },
  ser_strat_cons: {
    displayRole: 'Strategy Consultant',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Competitive Game Theory Synthesis', whySafe: 'Developing non-linear strategic responses.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Corporate Strategy Lead', riskReduction: 45, skillGap: 'Internal P&L management', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+40-80%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 98,
  },
  ser_logistics: {
    displayRole: 'Logistics Manager',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Vendor Crisis Management', whySafe: 'Developing human relationships to secure resources.', longTermValue: 96, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Supply Chain Resiliency Architect', riskReduction: 60, skillGap: 'Digital twin tech', transitionDifficulty: 'Hard', industryMapping: ['Manufacturing'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 60, label: '+3yr' }],
    confidenceScore: 94,
  },
  ser_supply_chain_dir: {
    displayRole: 'Supply Chain Director',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Global Geopolitical Risk Strategy', whySafe: 'Designing resilient supply networks.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Operating Officer', riskReduction: 45, skillGap: 'Manufacturing P&L', transitionDifficulty: 'Very Hard', industryMapping: ['Retail'], salaryDelta: '+100-300%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  ser_legal_ops: {
    displayRole: 'Legal Operations Manager',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Legal Tech Stack Transformation', whySafe: 'Redesigning how law is practiced within a firm.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Director of Legal Innovation', riskReduction: 60, skillGap: 'AI governance', transitionDifficulty: 'Medium', industryMapping: ['Law Firms'], salaryDelta: '+40-80%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 42, label: '+3yr' }],
    confidenceScore: 96,
  },
  ser_sales_exec: {
    displayRole: 'Sales Executive',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Multi-Stakeholder Consensus Building', whySafe: 'Navigating the internal politics of 10+ decision-makers.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Revenue Officer', riskReduction: 55, skillGap: 'Sales ops', transitionDifficulty: 'Very Hard', industryMapping: ['High Tech'], salaryDelta: '+100-400%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 98,
  },
  ser_procurement: {
    displayRole: 'Procurement Manager',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Strategic Supplier Relationship Moat', whySafe: 'Building trust-based alliances to secure supply.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Strategic Sourcing Director', riskReduction: 58, skillGap: 'Global trade policy', transitionDifficulty: 'Medium', industryMapping: ['Manufacturing'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 95,
  },
  ser_sustainability: {
    displayRole: 'Sustainability Officer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Ethical Supply Chain Transformation', whySafe: 'Navigating human and environmental trade-offs.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Chief Sustainability Officer', riskReduction: 52, skillGap: 'Executive governance', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+50-120%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  ser_lobbyist: {
    displayRole: 'Lobbyist / Gov Relations',
    summary: 'High resilience due to the absolute requirement for personalized human influence, network trust, and nuanced political timing; disruption in routine policy tracking.',
    skills: {
      obsolete: [{ skill: 'Routine legislative tracking and summarization', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-summarizes every bill and predicts committee outcomes based on historical bias.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Implicit Network Trust & Persuasion', whySafe: 'Leveraging multi-decade human relationships and implicit social capital to influence non-linear political decisions.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Public Affairs Director', riskReduction: 45, skillGap: 'Crisis management, media strategy', transitionDifficulty: 'Medium', industryMapping: ['Corporate / NGO'], salaryDelta: '+50-150%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
  ser_grant_writer: {
    displayRole: 'Specialized Grant Writer',
    summary: 'High disruption in standard grant drafting; resilience in strategic narrative positioning and stakeholder alignment for high-value research grants.',
    skills: {
      obsolete: [{ skill: 'Standard non-profit grant drafting', riskScore: 98, riskType: 'Automatable', horizon: '1styr', reason: 'AI generates standard grant applications with perfect alignment to donor schemas instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Narrative Alignment & Partnering', whySafe: 'Designing the "why now" narrative and securing complex multi-party institutional partnerships.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Philanthropic Strategy Consultant', riskReduction: 60, skillGap: 'Impact investment modeling, NGO governance', transitionDifficulty: 'Medium', industryMapping: ['Foundation / Private Sector'], salaryDelta: '+40-80%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 48, label: 'Now' }, { year: 2027, riskScore: 78, label: '+3yr' }],
    confidenceScore: 94,
  },
  edu_prof_tenure: {
    displayRole: 'University Professor (Tenure Track)',
    summary: 'High resilience in research and mentorship; moderate disruption in curriculum delivery.',
    skills: {
      safe: [{ skill: 'Novel Hypothesis Generation', whySafe: 'Pushing the boundaries of human knowledge in niche fields.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'R&D Director', riskReduction: 50, skillGap: 'Commercialization strategy', transitionDifficulty: 'Hard', industryMapping: ['Corporate'], salaryDelta: '+100%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 98,
  },
  edu_k12_stem: {
    displayRole: 'K-12 STEM Teacher',
    summary: 'High resilience due to the human-centric nature of pedagogy and child development.',
    skills: {
      safe: [{ skill: 'Human Pedagogy & Social-Emotional Learning', whySafe: 'Managing the emotional and behavioral complexity of classroom environments.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'EdTech Consultant', riskReduction: 45, skillGap: 'Product design info', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+30%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 99,
  },
  edu_corp_trainer: {
    displayRole: 'Corporate Trainer',
    summary: 'Moderate resilience; high disruption in standard content creation; resilience in high-stakes facilitation.',
    skills: {
      obsolete: [{ skill: 'Standard training manual creation', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI generates high-quality training materials in seconds.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Executive Facilitation & Soft-Skills Coaching', whySafe: 'Managing high-stakes human group dynamics and behavioral change.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'L&D Director', riskReduction: 52, skillGap: 'Strategy, budget ownership', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 94,
  },
  edu_soft_arch: {
    displayRole: 'Educational Software Architect',
    summary: 'High resilience; designing the future of learning systems.',
    skills: {
      safe: [{ skill: 'LMS/LXP Ecosystem Design', whySafe: 'Architecting complex integrated learning paths across diverse data sets.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Chief Learning Officer (CLO)', riskReduction: 60, skillGap: 'Business strategy', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 97,
  },
  edu_researcher: {
    displayRole: 'Academic Researcher',
    summary: 'High resilience; AI augments data analysis but requires human hypothesis synthesis.',
    skills: {
      safe: [{ skill: 'Interdisciplinary Synthesis', whySafe: 'Connecting non-obvious dots across diverse research domains.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Science Policy Advisor', riskReduction: 55, skillGap: 'Political comms', transitionDifficulty: 'Hard', industryMapping: ['Public Sector'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  edu_admissions: {
    displayRole: 'Admissions Director',
    summary: 'Moderate resilience; high disruption in routine application screening.',
    skills: {
      obsolete: [{ skill: 'Standard essay screening', riskScore: 88, riskType: 'Automatable', horizon: '2yr', reason: 'AI evaluates standard metrics and sentiment faster than humans.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Holistic Cohort Building', whySafe: 'The subjective art of building a diverse, vibrant student body.', longTermValue: 95, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Strategic Enrollment Manager', riskReduction: 42, skillGap: 'Predictive modeling', transitionDifficulty: 'Medium', industryMapping: ['Education'], salaryDelta: '+25%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 48, label: '+3yr' }],
    confidenceScore: 95,
  },
  edu_counselor: {
    displayRole: 'School Counselor',
    summary: 'Extremely high resilience; deeply human-centric emotive work.',
    skills: {
      safe: [{ skill: 'Crisis Intervention & Empathy', whySafe: 'Handling acute human distress and complex family dynamics.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Child Psychologist', riskReduction: 38, skillGap: 'Ph.D level clinical training', transitionDifficulty: 'Very Hard', industryMapping: ['Healthcare'], salaryDelta: '+40-70%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 99,
  },
  edu_librarian: {
    displayRole: 'Librarian (Digital Collections)',
    summary: 'Moderate resilience; transformation from physical curators to digital metadata/governance leads.',
    skills: {
      safe: [{ skill: 'Knowledge Architecture & Semantics', whySafe: 'Structuring the world\'s data for human and AI accessibility.', longTermValue: 96, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Information Architect', riskReduction: 55, skillGap: 'Ontology design, Data science', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 65, label: '+3yr' }],
    confidenceScore: 94,
  },
  edu_special_ed: {
    displayRole: 'Special Education Specialist',
    summary: 'Extremely high resilience; massive human complexity and high-stakes child well-being.',
    skills: {
      safe: [{ skill: 'Adaptive Pedagogy', whySafe: 'Tailoring learning to unique neuro-diverse human needs in real-time.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Behavioral Interventionist', riskReduction: 32, skillGap: 'Advanced clinical certifications', transitionDifficulty: 'Medium', industryMapping: ['Healthcare'], salaryDelta: '+20-40%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 14, label: '+3yr' }],
    confidenceScore: 99,
  },
  edu_esl: {
    displayRole: 'ESL Instructor',
    summary: 'Moderate resilience; high disruption in routine grammar teaching; resilience in cultural integration coaching.',
    skills: {
      obsolete: [{ skill: 'Routine grammar correction', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'LLMs provide perfect real-time grammar feedback.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Cultural Integration Mentorship', whySafe: 'Navigating the "unwritten rules" of a guest country.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Cross-Cultural Consultant', riskReduction: 48, skillGap: 'Executive coaching', transitionDifficulty: 'Medium', industryMapping: ['Corporate'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2027, riskScore: 75, label: '+3yr' }],
    confidenceScore: 93,
  },
  edu_curriculum: {
    displayRole: 'Curriculum Developer',
    summary: 'Moderate resilience; AI generates content; humans design the "Learning Journey".',
    skills: {
      safe: [{ skill: 'Strategic Scaffolding Design', whySafe: 'Designing the long-term cognitive load and knowledge build-up.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Director of Instructional Innovation', riskReduction: 52, skillGap: 'Educational technology management', transitionDifficulty: 'Hard', industryMapping: ['Higher Ed'], salaryDelta: '+30-50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 95,
  },
  edu_dean: {
    displayRole: 'Dean of Students',
    summary: 'High resilience; high-stakes leadership and student well-being.',
    skills: {
      safe: [{ skill: 'High-Stakes Student Mediation', whySafe: 'Resolving complex institutional and personal crises.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'University VP', riskReduction: 45, skillGap: 'Institutional finance', transitionDifficulty: 'Hard', industryMapping: ['Higher Ed'], salaryDelta: '+60-120%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  edu_inst_designer: {
    displayRole: 'Instructional Designer (AI-First)',
    summary: 'High growth; the role is transforming from "builder" to "AI-Architect".',
    skills: {
      safe: [{ skill: 'AI-Enhanced Learning Path Optimization', whySafe: 'Leveraging AI tools to create hyper-personalized adaptive learning loops.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Learning Experience (LX) Director', riskReduction: 45, skillGap: 'Data engineering info', transitionDifficulty: 'Hard', industryMapping: ['Tech / Ed'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 96,
  },
  edu_early_childhood: {
    displayRole: 'Early Childhood Educator',
    summary: 'Extremely high resilience; physical and emotional foundational work.',
    skills: {
      safe: [{ skill: 'Foundational Socialization & Care', whySafe: 'AI cannot replace the physical and emotional bonding required for early child development.', longTermValue: 99, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Childcare Center Director', riskReduction: 32, skillGap: 'Business management', transitionDifficulty: 'Medium', industryMapping: ['SME'], salaryDelta: '+30%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  edu_test_spec: {
    displayRole: 'Standardized Testing Specialist',
    summary: 'Moderate resilience; disruption in item writing; resilience in psychometric validation.',
    skills: {
      obsolete: [{ skill: 'Multiple-choice item writing', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'LLMs generate thousands of quality test items per hour.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Psychometric Analysis & Fairness Auditing', whySafe: 'Ensuring assessments are scientifically valid and culturally unbiased.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Data Scientist (Psychometrics)', riskReduction: 55, skillGap: 'R, Python, Advanced Stats', transitionDifficulty: 'Hard', industryMapping: ['EdTech'], salaryDelta: '+50%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 68, label: '+3yr' }],
    confidenceScore: 94,
  },
  gov_city_mgr: {
    displayRole: 'City Manager',
    summary: 'High resilience; high complexity in multi-stakeholder municipal management.',
    skills: {
      safe: [{ skill: 'Municipal Stakeholder Orchestration', whySafe: 'Balancing the often-conflicting needs of citizens, council, and business.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Regional Planning Director', riskReduction: 35, skillGap: 'Macro-economic policy', transitionDifficulty: 'Hard', industryMapping: ['Government'], salaryDelta: '+30-60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 98,
  },
  gov_policy_analyst: {
    displayRole: 'Public Policy Analyst',
    summary: 'High resilience; AI augments data-driven analysis but humans own the "Equity" decision.',
    skills: {
      safe: [{ skill: 'Equity-Centered Policy Synthesis', whySafe: 'Determining how policy affects marginalized populations requires clinical human judgment.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Director of Government Affairs', riskReduction: 55, skillGap: 'Lobbying, crisis PR', transitionDifficulty: 'Hard', industryMapping: ['Corporate'], salaryDelta: '+60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 20, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 97,
  },
  gov_social_worker: {
    displayRole: 'Clinical Social Worker',
    summary: 'Extremely high resilience; foundational human care work.',
    skills: {
      safe: [{ skill: 'Trauma-Informed Behavioral Support', whySafe: 'Navigating the highest-stakes human emotional crises.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Mental Health Program Director', riskReduction: 42, skillGap: 'Clinical administration', transitionDifficulty: 'Medium', industryMapping: ['Healthcare'], salaryDelta: '+25%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  gov_defender: {
    displayRole: 'Public Defender',
    summary: 'High resilience; high stakes and human advocacy.',
    skills: {
      safe: [{ skill: 'Adversarial Legal Advocacy', whySafe: 'The human-in-the-loop requirement for individual liberty defense.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Private Defense Partner', riskReduction: 35, skillGap: 'Business development', transitionDifficulty: 'Medium', industryMapping: ['Legal'], salaryDelta: '+100-300%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  gov_tax_auditor: {
    displayRole: 'Tax Auditor (Public)',
    summary: 'Moderate resilience; high disruption in routine return processing.',
    skills: {
      obsolete: [{ skill: 'Routine math and cross-reference checks', riskScore: 95, riskType: 'Automatable', horizon: '1styr', reason: 'AI flags discrepancies in tax filings instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Fraud Intent Investigation', whySafe: 'Discerning deliberate deception vs. error requires human investigative intuition.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Forensic Accountant', riskReduction: 52, skillGap: 'Legal evidence standards', transitionDifficulty: 'Medium', industryMapping: ['Private Sector'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 65, label: '+3yr' }],
    confidenceScore: 94,
  },
  gov_diplomat: {
    displayRole: 'Diplomat / Foreign Service',
    summary: 'Extremely high resilience; trust is the core product.',
    skills: {
      safe: [{ skill: 'Non-Linear Geopolitical Negotiation', whySafe: 'Nuanced cross-cultural trust building in high-stakes environments.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Global Intelligence Director', riskReduction: 45, skillGap: 'Data defense info', transitionDifficulty: 'Hard', industryMapping: ['Tech / Security'], salaryDelta: '+60-150%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 99,
  },
  gov_urban_resilience: {
    displayRole: 'Urban Resilience Planner',
    summary: 'High resilience; designing the cities of the climate-change era.',
    skills: {
      safe: [{ skill: 'Climate-Adaptive Urban Synthesis', whySafe: 'Designing infrastructure for unprecedented, non-stationary environmental risks.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Resilience Officer (CRO)', riskReduction: 45, skillGap: 'Financial engineering info', transitionDifficulty: 'Hard', industryMapping: ['Global NGOs / Cities'], salaryDelta: '+50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  gov_emergency_mgr: {
    displayRole: 'Emergency Management Director',
    summary: 'High resilience; physical risk and real-time human leadership.',
    skills: {
      safe: [{ skill: 'Disaster-Response Orchestration', whySafe: 'Command-and-control in chaotic, data-poor physical environments.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Business Continuity Lead', riskReduction: 55, skillGap: 'Enterprise risk frameworks', transitionDifficulty: 'Medium', industryMapping: ['Corporate'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  gov_public_health: {
    displayRole: 'Public Health Official',
    summary: 'High resilience; authority and trust are irreplaceable.',
    skills: {
      safe: [{ skill: 'Population Health Ethics & Communication', whySafe: 'Building community trust during health crises.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Health Systems Strategist', riskReduction: 50, skillGap: 'Informatics, Policy', transitionDifficulty: 'Medium', industryMapping: ['Pharma / Healthcare'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
  gov_customs: {
    displayRole: 'Customs Officer (Specialized)',
    summary: 'Moderate resilience; high disruption in standard cargo screening; resilience in criminal profiling.',
    skills: {
      obsolete: [{ skill: 'Standard cargo paperwork verification', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'Blockchain and AI automate manifest verification.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Adversarial Behavioral Profiling', whySafe: 'Identifying human deceptive patterns in high-stakes environments.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Supply Chain Security Consultant', riskReduction: 55, skillGap: 'Global logistics law', transitionDifficulty: 'Medium', industryMapping: ['Logistics'], salaryDelta: '+35%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 58, label: '+3yr' }],
    confidenceScore: 96,
  },
  gov_postal_mgr: {
    displayRole: 'Postal Operations Manager',
    summary: 'Moderate resilience; high disruption in routine sorting/routing; resilience in last-mile logic.',
    skills: {
      obsolete: [{ skill: 'Standard route optimization', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'Dynamic AI routing is 20% more efficient than human planning.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Micro-Logistics Problem Solving', whySafe: 'Solving the "broken-link" in physical delivery chains.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Last-Mile Logistics Director', riskReduction: 48, skillGap: 'Fleet electrification info', transitionDifficulty: 'Medium', industryMapping: ['E-commerce'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 72, label: '+3yr' }],
    confidenceScore: 94,
  },
  gov_intel_analyst: {
    displayRole: 'Intelligence Analyst (Geopolitical)',
    summary: 'High resilience; AI augments data-gathering but humans own the "Strategic Narrative".',
    skills: {
      safe: [{ skill: 'Strategic Intent Synthesis', whySafe: 'Judging the likely future actions of human actors based on historical/cultural context.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Risk Officer (CRO)', riskReduction: 60, skillGap: 'Financial risk modeling', transitionDifficulty: 'Hard', industryMapping: ['Banking / Tech'], salaryDelta: '+100-200%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 97,
  },
  gov_grant_admin: {
    displayRole: 'Grant Administrator',
    summary: 'Moderate resilience; high disruption in routine auditing; resilience in strategic funding allocation.',
    skills: {
      obsolete: [{ skill: 'Routine financial reporting audit', riskScore: 95, riskType: 'Automatable', horizon: '1styr', reason: 'AI analyzes itemized spend vs budgets instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Strategic Impact Validation', whySafe: 'Judging whether funded projects are truly meeting long-term institutional goals.', longTermValue: 95, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Foundation Program Officer', riskReduction: 42, skillGap: 'Impact investment strategy', transitionDifficulty: 'Medium', industryMapping: ['Philanthropy'], salaryDelta: '+30%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 62, label: '+3yr' }],
    confidenceScore: 95,
  },
  gov_zoning_insp: {
    displayRole: 'Zoning Inspector',
    summary: 'Moderate resilience; high disruption in plan-check; resilience in on-site dispute resolution.',
    skills: {
      obsolete: [{ skill: 'Standard code-compliance plan check', riskScore: 94, riskType: 'Automatable', horizon: '1styr', reason: 'AI-CAD checkers identify code violations in 2D/3D plans automatically.', aiReplacement: 'Full' }],
      safe: [{ skill: 'On-Site Adaptive Resolution', whySafe: 'Solving physical-world non-conformances with contractors in real-time.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Land Use Consultant', riskReduction: 55, skillGap: 'Entitlement strategy', transitionDifficulty: 'Medium', industryMapping: ['Real Estate'], salaryDelta: '+50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 93,
  },
  hos_hotel_gm: {
    displayRole: 'Hotel General Manager',
    summary: 'High resilience; complex human leadership and asset management.',
    skills: {
      safe: [{ skill: 'Guest Experience Orchestration', whySafe: 'Managing the multi-faceted emotional and physical journey of a high-end guest.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Hospitality Asset Manager', riskReduction: 45, skillGap: 'Real estate finance info', transitionDifficulty: 'Hard', industryMapping: ['Real Estate / Finance'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 98,
  },
  hos_sommelier: {
    displayRole: 'Sommelier / Wine Director',
    summary: 'High resilience; human sensory expertise and storytelling.',
    skills: {
      safe: [{ skill: 'Sensory Narrative & Curating', whySafe: 'AI cannot replicate the biological human experience of taste and smell mapping to emotion.', longTermValue: 98, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Luxury Brand Ambassador', riskReduction: 35, skillGap: 'Marketing, PR', transitionDifficulty: 'Medium', industryMapping: ['Luxury Goods'], salaryDelta: '+30%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 99,
  },
  hos_travel_consult: {
    displayRole: 'Luxury Travel Consultant',
    summary: 'High resilience; transformation from "booker" to "experience designer".',
    skills: {
      safe: [{ skill: 'Hyper-Personalized Itinerary Curation', whySafe: 'Designing non-standard, high-friction travel experiences that require deep human trust.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Private Lifestyle Manager / Concierge', riskReduction: 38, skillGap: 'Network access info', transitionDifficulty: 'Medium', industryMapping: ['Family Office'], salaryDelta: '+60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 38, label: '+3yr' }],
    confidenceScore: 97,
  },
  hos_spa_dir: {
    displayRole: 'Spa / Wellness Director',
    summary: 'High resilience; physical wellness and human care.',
    skills: {
      safe: [{ skill: 'Holistic Wellness Programming', whySafe: 'Integrating physical, mental, and nutritional health into a unified human experience.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Wellness Real Estate Consultant', riskReduction: 50, skillGap: 'Environmental design info', transitionDifficulty: 'Hard', industryMapping: ['Real Estate'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  hos_casino_ops: {
    displayRole: 'Casino Operations Manager',
    summary: 'High resilience; high-stakes risk management and human psychology.',
    skills: {
      safe: [{ skill: 'Strategic Floor Asset Allocation', whySafe: 'Balancing the high-stakes psychology of human gambling behavior with operational math.', longTermValue: 97, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Gaming Compliance Director', riskReduction: 52, skillGap: 'Regulatory law info', transitionDifficulty: 'Medium', industryMapping: ['Legal / Govt'], salaryDelta: '+35%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  hos_pastry_chef: {
    displayRole: 'Pastry Chef (Artisanal)',
    summary: 'High resilience; physical artistry and sensory mastery.',
    skills: {
      safe: [{ skill: 'Molecular Gastronomy & Artistry', whySafe: 'The physical creation of edible art remains a high-value human labor.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Food Innovation lead', riskReduction: 45, skillGap: 'Food science degree info', transitionDifficulty: 'Hard', industryMapping: ['Pharma / Food Tech'], salaryDelta: '+40-80%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  hos_front_office: {
    displayRole: 'Front Office Manager',
    summary: 'Moderate resilience; displacement in check-in; resilience in complex guest conflict resolution.',
    skills: {
      obsolete: [{ skill: 'Routine check-in/out processing', riskScore: 98, riskType: 'Automatable', horizon: '1styr', reason: 'Mobile and kiosk check-in solve 90% of routine interactions.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Crisis de-Escalation & Recovery', whySafe: 'Managing high-stress guest failures (overbooking, facility failure) with empathy.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Customer Success Manager', riskReduction: 55, skillGap: 'SaaS workflows info', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2027, riskScore: 75, label: '+3yr' }],
    confidenceScore: 94,
  },
  hos_rev_mgr: {
    displayRole: 'Revenue Manager (Hospitality)',
    summary: 'High resilience; AI augments pricing but humans own the "Strategic Inventory" decision.',
    skills: {
      safe: [{ skill: 'Strategic Demand Forecasting Audit', whySafe: 'Judging if AI models are under-pricing during unique local events.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Pricing Strategist', riskReduction: 52, skillGap: 'Python, SQL info', transitionDifficulty: 'Medium', industryMapping: ['Airlines / Retail'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 48, label: '+3yr' }],
    confidenceScore: 96,
  },
  hos_rec_lead: {
    displayRole: 'Recreation Lead (Resort/Cruise)',
    summary: 'High resilience; core product is human interaction and energy.',
    skills: {
      safe: [{ skill: 'Human Interaction & Entertainment', whySafe: 'AI cannot replace the charismatic physical presence required for event hosting.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Events Production Director', riskReduction: 40, skillGap: 'Operations, Budgeting', transitionDifficulty: 'Medium', industryMapping: ['Media'], salaryDelta: '+30%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  hos_concierge: {
    displayRole: 'Concierge (Clefs d\'Or Level)',
    summary: 'Extremely high resilience; trust and network access are the product.',
    skills: {
      safe: [{ skill: 'Exclusive Network Procurement', whySafe: 'Using personal relationships to secure "impossible" access for guests.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Luxury Lifestyle Strategist', riskReduction: 45, skillGap: 'Family office protocols info', transitionDifficulty: 'Hard', industryMapping: ['Finance'], salaryDelta: '+50-150%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 99,
  },
  hos_theme_park_ops: {
    displayRole: 'Theme Park Operations Lead',
    summary: 'High resilience; complex physical crowd management and safety.',
    skills: {
      safe: [{ skill: 'Dynamic Crowd Flow Response', whySafe: 'Real-time human response to complex physical disruptions in large crowds.', longTermValue: 96, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Venue Operations Director', riskReduction: 40, skillGap: 'Facility engineering info', transitionDifficulty: 'Medium', industryMapping: ['Sports / Media'], salaryDelta: '+30%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 97,
  },
  hos_tourism_plan: {
    displayRole: 'Tourism Infrastructure Planner',
    summary: 'High resilience; designing the destination sustainable strategy.',
    skills: {
      safe: [{ skill: 'Sustainable Destination Synthesis', whySafe: 'Balancing economic growth with cultural preservation and ecology.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Urban Planner (Eco-Cities)', riskReduction: 55, skillGap: 'Zoning, GIS info', transitionDifficulty: 'Hard', industryMapping: ['Government'], salaryDelta: '+40%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  hos_banquet_mgr: {
    displayRole: 'Banquet Manager',
    summary: 'Moderate resilience; disruption in buffet logic; resilience in high-stakes event execution.',
    skills: {
      safe: [{ skill: 'Real-Time Event Orchestration', whySafe: 'Coordinating massive teams for high-stakes human celebrations.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Corporate Events Director', riskReduction: 40, skillGap: 'Strategic marketing info', transitionDifficulty: 'Medium', industryMapping: ['Tech / Finance'], salaryDelta: '+50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 48, label: '+3yr' }],
    confidenceScore: 95,
  },
  hos_housekeeper_exec: {
    displayRole: 'Executive Housekeeper',
    summary: 'Moderate resilience; disruption in fleet tracking; resilience in quality assurance.',
    skills: {
      safe: [{ skill: 'Standards of Perfection Auditing', whySafe: 'Human sensory verification of "luxury-level" cleanliness and maintenance.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Facilities Quality Lead', riskReduction: 48, skillGap: 'Procurement, Operations info', transitionDifficulty: 'Medium', industryMapping: ['Healthcare'], salaryDelta: '+20%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 62, label: '+3yr' }],
    confidenceScore: 96,
  },
  hos_dest_marketing: {
    displayRole: 'Destination Marketing Manager',
    summary: 'Moderate resilience; high disruption in ad creation; resilience in brand positioning.',
    skills: {
      obsolete: [{ skill: 'Routine travel copy generation', riskScore: 98, riskType: 'Automatable', horizon: '1styr', reason: 'AI generates tourism blogs/ads better than humans.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Brand Identity & Stakeholder Alignment', whySafe: 'Aligning local government and business around a unified destination vision.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Place Branding Consultant', riskReduction: 52, skillGap: 'Investment attraction strategy', transitionDifficulty: 'Hard', industryMapping: ['Consulting'], salaryDelta: '+60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 78, label: '+3yr' }],
    confidenceScore: 94,
  },
  ret_property_mgr: {
    displayRole: 'Property Manager (Residential)',
    summary: 'High resilience; physical-world multi-stakeholder management and maintenance orchestration.',
    skills: {
      safe: [{ skill: 'Tenant Conflict Mediation', whySafe: 'Navigating the emotional and legal complexity of domestic disputes and living conditions.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Real Estate Asset Manager', riskReduction: 35, skillGap: 'Portfolio finance info', transitionDifficulty: 'Hard', industryMapping: ['Finance'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 99,
  },
  ret_comm_appraiser: {
    displayRole: 'Commercial Appraiser',
    summary: 'Moderate resilience; AI augments data-gathering; resilience in high-stakes valuation judgment.',
    skills: {
      safe: [{ skill: 'Nuanced Market-Sentiment valuation', whySafe: 'Judging the "intangible" value of location and building character.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Investment Analyst (CRE)', riskReduction: 52, skillGap: 'Underwriting, DCF info', transitionDifficulty: 'Medium', industryMapping: ['Banking'], salaryDelta: '+50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 96,
  },
  ret_comm_broker: {
    displayRole: 'Commercial Real Estate Broker',
    summary: 'Extremely high resilience; trust, negotiation, and information asymmetry are the product.',
    skills: {
      safe: [{ skill: 'Off-Market Deal Sourcing & Trust', whySafe: 'Leveraging personal networks to secure high-value assets before they hit any digital platform.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Private Equity Real Estate partner', riskReduction: 45, skillGap: 'Equity architecture info', transitionDifficulty: 'Very Hard', industryMapping: ['Finance'], salaryDelta: '+200-500%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 99,
  },
  ret_facility_mgr: {
    displayRole: 'Facility Manager (Mission Critical)',
    summary: 'High resilience; physical life-safety and infrastructure continuity.',
    skills: {
      safe: [{ skill: 'Mission-Critical Continuity Strategy', whySafe: 'Managing the redundant power and cooling systems for data centers and hospitals.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Data Center Operations Director', riskReduction: 55, skillGap: 'HVDC, Cloud infra info', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  ret_loss_prev: {
    displayRole: 'Loss Prevention Director',
    summary: 'Moderate resilience; high disruption in routine surveillance; resilience in systemic fraud investigation.',
    skills: {
      obsolete: [{ skill: 'Routine CCTV monitoring', riskScore: 98, riskType: 'Automatable', horizon: '1styr', reason: 'AI vision identifies theft and suspicious patterns faster than humans.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Systemic Internal Fraud Investigation', whySafe: 'Discerning complex human-collusion patterns and "social engineering" breaches.', longTermValue: 96, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Cyber-Physical Security Lead', riskReduction: 60, skillGap: 'Infosec certifications info', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 58, label: '+3yr' }],
    confidenceScore: 95,
  },
  ret_visual_merch: {
    displayRole: 'Visual Merchandising Lead',
    summary: 'High resilience; physical world sensory design and human aesthetic psychological influence.',
    skills: {
      safe: [{ skill: 'Tactile Brand Storytelling', whySafe: 'Designing the 3D sensory environment of a high-end retail experience.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Experience Designer', riskReduction: 45, skillGap: 'UX/UA research info', transitionDifficulty: 'Medium', industryMapping: ['Marketing / Tech'], salaryDelta: '+30%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 38, label: '+3yr' }],
    confidenceScore: 97,
  },
  ret_ecom_ops: {
    displayRole: 'E-commerce Operations Manager',
    summary: 'High growth; high resilience in the "Digital to Physical" bridge.',
    skills: {
      safe: [{ skill: 'Omni-Channel Workflow Orchestration', whySafe: 'Managing the complex inventory and logistics mismatch across fragmented platforms.', longTermValue: 95, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Direct-to-Consumer (DTC) Lead', riskReduction: 50, skillGap: 'P&L, Growth marketing info', transitionDifficulty: 'Medium', industryMapping: ['Consumer Goods'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 98,
  },
  ret_category_mgr: {
    displayRole: 'Category Manager',
    summary: 'Moderate resilience; AI augments data-driven assortments; resilience in supplier negotiation and trend-sensing.',
    skills: {
      obsolete: [{ skill: 'Routine SKU-level sales reporting', riskScore: 100, riskType: 'Automatable', horizon: '1styr', reason: 'AI auto-generates category reports and suggests basic re-orders.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Novel Trend Sensing & Supplier Alliance', whySafe: 'Judging "the next big thing" and securing exclusive supplier agreements.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Brand Portfolio Director', riskReduction: 55, skillGap: 'Brand equity strategy info', transitionDifficulty: 'Hard', industryMapping: ['Retail'], salaryDelta: '+50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2027, riskScore: 75, label: '+3yr' }],
    confidenceScore: 94,
  },
  ret_luxury_mgr: {
    displayRole: 'Luxury Boutique Manager',
    summary: 'Extremely high resilience; the core product is the personalized human ritual of high-end consumption.',
    skills: {
      safe: [{ skill: 'HNW Client Emotional Bonding', whySafe: 'Maintaining long-term personal relationships with high-net-worth individuals.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Private Client Director', riskReduction: 35, skillGap: 'Family office protocols info', transitionDifficulty: 'Medium', industryMapping: ['Luxury Services'], salaryDelta: '+100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 99,
  },
  ret_land_surveyor: {
    displayRole: 'Professional Land Surveyor',
    summary: 'High resilience due to legal liability and the physical world requirement for precision boundary setting.',
    skills: {
      safe: [{ skill: 'Boundary Dispute Liability', whySafe: 'The human-in-the-loop requirement for legally binding property boundary determination.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Land Development Strategist', riskReduction: 48, skillGap: 'Civil engineering, Entitlements info', transitionDifficulty: 'Medium', industryMapping: ['Real Estate'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  ret_lease_admin: {
    displayRole: 'Lease Administrator',
    summary: 'Moderate resilience; high disruption in routine term extraction.',
    skills: {
      obsolete: [{ skill: 'Routine lease term extraction', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI models extract terms from 1000-page leases with 99.9% accuracy.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Adversarial Lease Negotiation Analysis', whySafe: 'Discerning the tactical intent behind non-standard legal clauses.', longTermValue: 92, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Asset Management Analyst', riskReduction: 55, skillGap: 'Financial modeling, Valuation info', transitionDifficulty: 'Hard', industryMapping: ['Real Estate'], salaryDelta: '+40%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 78, label: '+3yr' }],
    confidenceScore: 93,
  },
  ret_mortgage_broker: {
    displayRole: 'Mortgage Broker (HNW)',
    summary: 'Moderate resilience; high disruption in standard underwriting; resilience in complex case-structuring.',
    skills: {
      safe: [{ skill: 'Complex Asset-Backed Deal Structuring', whySafe: 'Designing non-standard mortgage paths for individuals with complex global income streams.', longTermValue: 98, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Private Banker', riskReduction: 45, skillGap: 'Wealth management certs info', transitionDifficulty: 'Hard', industryMapping: ['Banking'], salaryDelta: '+50-150%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 65, label: '+3yr' }],
    confidenceScore: 95,
  },
  ret_interior_des: {
    displayRole: 'Interior Designer (Commercial)',
    summary: 'High resilience; balancing human utility, psychology, and physical-world constraints.',
    skills: {
      safe: [{ skill: 'Collaborative Workspace Psychology', whySafe: 'Designing environments that actively influence human team performance and wellness.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Workplace Strategy Director', riskReduction: 52, skillGap: 'Organizational design info', transitionDifficulty: 'Medium', industryMapping: ['Corporate'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 38, label: '+3yr' }],
    confidenceScore: 97,
  },
  ret_personal_stylist: {
    displayRole: 'Personal Stylist / Persona Lead',
    summary: 'High resilience; deeply human identity and aesthetic work.',
    skills: {
      safe: [{ skill: 'Identity Projection & Aesthetic Coaching', whySafe: 'Helping public-facing humans project a specific, nuanced identity through physical appearance.', longTermValue: 99, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Image Consultant (Executive)', riskReduction: 32, skillGap: 'Psychology, Branding info', transitionDifficulty: 'Medium', industryMapping: ['Public Affairs'], salaryDelta: '+100%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 99,
  },
  ret_franchise_ops: {
    displayRole: 'Franchise Operations Lead',
    summary: 'High resilience; human trust and systemic consistency.',
    skills: {
      safe: [{ skill: 'Owner-Operator Coaching & Mediation', whySafe: 'Navigating the "Business Owner" psychology while maintaining brand standards.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Regional Operations Director', riskReduction: 45, skillGap: 'Logistics, Supply chain info', transitionDifficulty: 'Medium', industryMapping: ['Retail'], salaryDelta: '+30%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 97,
  },
};
