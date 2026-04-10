import { CareerIntelligence } from './types.ts';

export const HEALTHCARE_INTELLIGENCE: Record<string, CareerIntelligence> = {
  hc_doctor: {
    displayRole: 'General Physician / Doctor',
    summary: 'High resilience due to physical examination and liability.',
    skills: {
      obsolete: [{ skill: 'Routine clinical documentation', riskScore: 94, riskType: 'Automatable', horizon: '1yr', reason: 'Ambient AI scribes record notes instantly.', aiReplacement: 'Full', aiTool: 'Nuance DAX' }],
      at_risk: [{ skill: 'Standard triage', riskScore: 55, riskType: 'Augmented', horizon: '3yr', reason: 'AI analyzes symptoms and history.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Clinical Judgment & Ethics', whySafe: 'Complex cases require human wisdom.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Clinical AI Director', riskReduction: 65, skillGap: 'Informatics, AI validation', transitionDifficulty: 'Hard', industryMapping: ['Health Systems'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  nur_rn: {
    displayRole: 'Registered Nurse',
    summary: 'Extreme resilience due to high-stakes physical intervention.',
    skills: {
      safe: [{ skill: 'Physical Care & Crisis Response', whySafe: 'Responding to codes requires human bodies.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Nurse Informatics Specialist', riskReduction: 62, skillGap: 'Data analytics', transitionDifficulty: 'Medium', industryMapping: ['Hospitals'], salaryDelta: '+20-40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  hc_pharmacy: {
    displayRole: 'Pharmacist',
    summary: 'High resilience in advisory.',
    skills: {
      safe: [{ skill: 'Clinical Medication Management', whySafe: 'Developing therapeutic plans for multi-morbidity.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Pharmacogenomics Consultant', riskReduction: 60, skillGap: 'Genetics', transitionDifficulty: 'Hard', industryMapping: ['Precision Medicine'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 94,
  },
  hc_surgeon: {
    displayRole: 'Surgeon',
    summary: 'Extremely high resilience.',
    skills: {
      safe: [{ skill: 'Intraoperative Decision Making', whySafe: 'Managing unexpected anatomical variations in real-time.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Robotic Surgery Specialist', riskReduction: 45, skillGap: 'Robotic platform certs', transitionDifficulty: 'Hard', industryMapping: ['Health Systems'], salaryDelta: '+20-50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 99,
  },
  hc_admin: {
    displayRole: 'Healthcare Administrator',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Policy Governance & Patient Ethics', whySafe: 'Navigating regulatory trade-offs.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Health Data Governance Manager', riskReduction: 55, skillGap: 'HIPAA, AI Ethics', transitionDifficulty: 'Medium', industryMapping: ['Health Systems'], salaryDelta: '+30-50%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 40, label: 'Now' }, { year: 2027, riskScore: 60, label: '+3yr' }],
    confidenceScore: 92,
  },
  hc_physio: {
    displayRole: 'Physiotherapist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Manual Therapy', whySafe: 'Physical manipulation and real-time response to tissue resistance.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Sports Performance Data Analyst', riskReduction: 52, skillGap: 'Wearable tech data', transitionDifficulty: 'Medium', industryMapping: ['Pro Sports'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 97,
  },
  hc_psych: {
    displayRole: 'Clinical Psychologist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Complex Trauma Management', whySafe: 'Navigating deeply unconscious human dynamics.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Corporate Wellness Strategist', riskReduction: 55, skillGap: 'Organizational psych', transitionDifficulty: 'Medium', industryMapping: ['Enterprise'], salaryDelta: '+30-50%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  hc_lab: {
    displayRole: 'Lab Technician',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Novel Sample Troubleshooting', whySafe: 'Investigating samples that don\'t match standard profiles.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Bio-Automation Specialist', riskReduction: 62, skillGap: 'Lab robotics', transitionDifficulty: 'Hard', industryMapping: ['Biotech'], salaryDelta: '+40-70%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 48, label: 'Now' }, { year: 2027, riskScore: 72, label: '+3yr' }],
    confidenceScore: 94,
  },
  hc_dietitian: {
    displayRole: 'Dietitian',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Clinical Medical Nutrition Therapy', whySafe: 'Managing nutrition for multi-morbidity ICU patients.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Precision Nutrition Consultant', riskReduction: 58, skillGap: 'Nutrigenomics', transitionDifficulty: 'Medium', industryMapping: ['HealthTech'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 94,
  },
  hc_dentist: {
    displayRole: 'Dentist',
    summary: 'Extreme resilience.',
    skills: {
      safe: [{ skill: 'Bespoke Oral Surgery & Patient Comfort', whySafe: 'Physical dexterity and managing patient anxiety.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Dental Technology Director', riskReduction: 52, skillGap: 'Guided surgery tech', transitionDifficulty: 'Medium', industryMapping: ['Dental Groups'], salaryDelta: '+30-50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 98,
  },
  hc_optom: {
    displayRole: 'Optometrist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Ocular Disease Management', whySafe: 'Diagnosing and managing complex pathologies like glaucoma.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Ocular Oncology Specialist', riskReduction: 45, skillGap: 'Advanced residency', transitionDifficulty: 'Hard', industryMapping: ['Health Systems'], salaryDelta: '+40-80%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 42, label: '+3yr' }],
    confidenceScore: 96,
  },
  hc_vet: {
    displayRole: 'Veterinarian',
    summary: 'Extreme resilience.',
    skills: {
      safe: [{ skill: 'Cross-Species Biological Synthesis', whySafe: 'Diagnosing patients who cannot explain symptoms.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Veterinary AI Informatics', riskReduction: 60, skillGap: 'Epidemiology', transitionDifficulty: 'Hard', industryMapping: ['Pharma'], salaryDelta: '+30-50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 99,
  },
  hc_researcher: {
    displayRole: 'Medical Researcher',
    summary: 'High resilience in hypothesis generation.',
    skills: {
      safe: [{ skill: 'Novel Hypothesis Generation', whySafe: 'Defining the research frontier based on human priorities.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'AI-Driven Pharma Strategist', riskReduction: 62, skillGap: 'Computational biology', transitionDifficulty: 'Hard', industryMapping: ['Biotech'], salaryDelta: '+50-100%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  hc_speech: {
    displayRole: 'Speech Pathologist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Nuanced Patient Tailoring', whySafe: 'Adjusting therapy in real-time based on patient frustration.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Digital Health Specialist (VUI)', riskReduction: 55, skillGap: 'AI voice design', transitionDifficulty: 'Medium', industryMapping: ['HealthTech'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 97,
  },
  hc_radio: {
    displayRole: 'Interventional Radiologist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Minimally Invasive Guided Surgery', whySafe: 'Executing complex physical procedures through imaging.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Surgical Robotics Lead', riskReduction: 45, skillGap: 'Robotic surgical systems', transitionDifficulty: 'Hard', industryMapping: ['Health Systems'], salaryDelta: '+30-50%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 98,
  },
  hc_occupational: {
    displayRole: 'Occupational Therapist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Environmental Adaptation', whySafe: 'Designing bespoke physical world interventions.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Assistive Tech Design Consultant', riskReduction: 55, skillGap: 'IoT for accessibility', transitionDifficulty: 'Medium', industryMapping: ['Hardware'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 98,
  },
  hc_genetics: {
    displayRole: 'Genetic Counselor',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Existential & Emotional Framing', whySafe: 'Guiding families through life-altering biological news.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Precision Medicine Coordinator', riskReduction: 45, skillGap: 'Clinical trial management', transitionDifficulty: 'Hard', industryMapping: ['Health Systems'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  hc_oncologist: {
    displayRole: 'Oncologist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Multi-Modal Toxicity Synthesis', whySafe: 'Balancing aggressive curative intent with palliative quality of life.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Precision Oncology Lead', riskReduction: 45, skillGap: 'NGS informatics', transitionDifficulty: 'Hard', industryMapping: ['Biotech'], salaryDelta: '+40-80%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
  hc_embryologist: {
    displayRole: 'Embryologist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Micromanipulation & Microliability', whySafe: 'The high-stakes physical act where human error has existential consequences.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Reproductive Genetics Director', riskReduction: 55, skillGap: 'PGT genomics', transitionDifficulty: 'Hard', industryMapping: ['Fertility'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  hc_neuro_physio: {
    displayRole: 'Neuro-Physiotherapist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Proprioceptive Neuro-Facilitation', whySafe: 'The manual manipulation of patient limbs to trigger neurological pathways.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Neuro-Rehab Tech Strategist', riskReduction: 55, skillGap: 'BCI for rehab', transitionDifficulty: 'Hard', industryMapping: ['MedTech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  hc_epidemiologist: {
    displayRole: 'Epidemiologist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Public Health Ethical Negotiation', whySafe: 'Negotiating the multi-stakeholder human trade-offs in pandemics.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Pandemic Preparedness Director', riskReduction: 45, skillGap: 'Global health policy', transitionDifficulty: 'Hard', industryMapping: ['NGO'], salaryDelta: '+30-60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  hc_virologist: {
    displayRole: 'Virologist (Novel Pathogen Research)',
    summary: 'High resilience due to the extreme physical risks and the requirement for primary biological discovery in the face of unknown viral behavior.',
    skills: {
      obsolete: [{ skill: 'Standard viral sequence annotation', riskScore: 92, riskType: 'Automatable', horizon: '1styr', reason: 'AI auto-annotates 99% of routine viral genomes based on known homologous structures.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Novel Pathogen Zoonotic Risk Synthesis', whySafe: 'Developing hypotheses for inter-species viral jump based on complex field-ecological data.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Biosecurity Officer', riskReduction: 45, skillGap: 'Global health reg, bio-threat intelligence', transitionDifficulty: 'Hard', industryMapping: ['Government / Pharma'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
};
