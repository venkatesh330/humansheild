import { CareerIntelligence } from './types';

export const HEALTHCARE_INTELLIGENCE: Record<string, CareerIntelligence> = {
  hc_doctor: {
    displayRole: 'General Physician / Doctor',
    summary: 'High resilience due to physical examination and liability; AI augments diagnosis and documentation.',
    skills: {
      obsolete: [{ skill: 'Routine clinical documentation', riskScore: 94, riskType: 'Automatable', horizon: '1yr', reason: 'Ambient AI scribes record and draft notes instantly.', aiReplacement: 'Full', aiTool: 'Nuance DAX' }],
      at_risk: [{ skill: 'Standard triage', riskScore: 55, riskType: 'Augmented', horizon: '3yr', reason: 'AI analyzes symptoms and history to suggest triage levels.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Clinical Judgment & Ethics', whySafe: 'Complex cases with comorbidities and ethical trade-offs require human wisdom.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Clinical AI Director', riskReduction: 65, skillGap: 'Informatics, AI validation', transitionDifficulty: 'Hard', industryMapping: ['Health Systems'], salaryDelta: '+30–60%', timeToTransition: '18 months' }],
    roadmap: {
      '5-10': {
        phase_1: { timeline: '30 days', focus: 'Ambient AI', actions: [{ action: 'Deploy an AI scribe in your practice', why: '30% time saving.', outcome: 'Time recovered' }] },
      },
    },
    inactionScenario: 'Standard "note-takers" will be replaced. Success requires moving to clinical AI leadership or complex specialty care.',
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  nur_rn: {
    displayRole: 'Registered Nurse',
    summary: 'Extreme resilience due to high-stakes physical intervention and patient advocacy.',
    skills: {
      obsolete: [{ skill: 'Manual vitals transcription', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'Smart monitors push vitals directly to EHR.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Standard medication verification', riskScore: 45, riskType: 'Augmented', horizon: '3yr', reason: 'Smart pumps automate safety checks.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Physical Care & Crisis Response', whySafe: 'Responding to a code blue requires human bodies and real-time judgment.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Nurse Informatics Specialist', riskReduction: 62, skillGap: 'Data analytics, tech implementation', transitionDifficulty: 'Medium', industryMapping: ['Hospitals'], salaryDelta: '+20–40%', timeToTransition: '12 months' }],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'Digital Charting', actions: [{ action: 'Master advanced Epic/Cerner documentation', why: 'Efficiency tool.', outcome: 'Charting mastery' }] },
      },
    },
    inactionScenario: 'Nurses who do not lead the digital transition will be stuck in high-burnout execution roles.',
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  hc_pharmacy: {
    displayRole: 'Pharmacist',
    summary: 'High resilience in clinical advisory; moderate disruption in retail dispensing.',
    skills: {
      obsolete: [{ skill: 'Manual pill counting', riskScore: 96, riskType: 'Automatable', horizon: '1yr', reason: 'Robotic systems handle 99% of counting.', aiReplacement: 'Full', aiTool: 'ScriptPro' }],
      at_risk: [{ skill: 'Standard drug-interaction checking', riskScore: 92, riskType: 'Augmented', horizon: '1yr', reason: 'AI flags interactions instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Clinical Medication Management', whySafe: 'Developing custom therapeutic plans for complex multi-morbidity cases.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Pharmacogenomics Consultant', riskReduction: 60, skillGap: 'Genetics, data analytics', transitionDifficulty: 'Hard', industryMapping: ['Precision Medicine'], salaryDelta: '+30–60%', timeToTransition: '24 months' }],
    roadmap: {
      '2-5': {
        phase_1: { timeline: '30 days', focus: 'MTM Certification', actions: [{ action: 'Complete MTM certification', why: 'Focus on advisory.', outcome: 'Certified Consultant' }] },
      },
    },
    inactionScenario: 'Retail "dispensers" will be replaced by mail-order and kiosks. Success requires moving to clinical advisory.',
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 94,
  },
};
