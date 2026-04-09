import { CareerIntelligence } from './types';

export const CREATIVE_INTELLIGENCE: Record<string, CareerIntelligence> = {
  cnt_blog: {
    displayRole: 'Blogger / Content Writer',
    summary: 'High disruption in standard info-content; resilience in primary research and thought leadership.',
    skills: {
      obsolete: [{ skill: 'Standard info-content drafting', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'LLMs generate SEO articles with high accuracy.', aiReplacement: 'Full', aiTool: 'Jasper, Copy.ai' }],
      at_risk: [{ skill: 'SEO keyword clustering', riskScore: 85, riskType: 'Augmented', horizon: '1-2yr', reason: 'AI analyzes search intent better than manual grouping.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Primary Research & Interviews', whySafe: 'AI cannot perform original investigative reporting or interview humans.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Content Operations Manager', riskReduction: 60, skillGap: 'Prompt engineering, Editorial QA, AI workflow design', transitionDifficulty: 'Medium', industryMapping: ['Marketing Agencies'], salaryDelta: '+30–50%', timeToTransition: '6 months' }],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'AI Workflow', actions: [{ action: 'Master Claude and GPT-4 for drafting', why: 'Efficiency baseline.', outcome: '10x volume' }] },
      },
    },
    inactionScenario: 'Standard "info" writers will be replaced by AI. Success requires moving to thought leadership or AI operations.',
    riskTrend: [{ year: 2024, riskScore: 70, label: 'Now' }, { year: 2027, riskScore: 95, label: '+3yr' }],
    confidenceScore: 95,
  },
  des_graphic: {
    displayRole: 'Graphic Designer',
    summary: 'High disruption in execution; resilience in art direction and brand strategy.',
    skills: {
      obsolete: [{ skill: 'Logo variations / Social media production', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'Midjourney/Canva AI generate endless variations in seconds.', aiReplacement: 'Full', aiTool: 'Midjourney, DALL-E 3' }],
      at_risk: [{ skill: 'Standard layout production', riskScore: 75, riskType: 'Augmented', horizon: '1-2yr', reason: 'AI auto-populates layouts based on brand rules.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Creative Direction & Brand Identity Architecture', whySafe: 'Developing a unique visual language for a brand requires human cultural intuition.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Art Director', riskReduction: 55, skillGap: 'Prompting for image gen, AI composite workflows, Creative strategy', transitionDifficulty: 'Medium', industryMapping: ['Ad Agencies'], salaryDelta: '+25–45%', timeToTransition: '9 months' }],
    roadmap: {
      '2-5': {
        phase_1: { timeline: '30 days', focus: 'AI Tooling', actions: [{ action: 'Master Adobe Firefly and Midjourney v6', why: 'Industrial-grade image synthesis.', outcome: 'New service line' }] },
      },
    },
    inactionScenario: 'Production-only designers will face extreme wage stagnation. Success requires moving to Art Direction and human-centric brand strategy.',
    riskTrend: [{ year: 2024, riskScore: 50, label: 'Now' }, { year: 2027, riskScore: 82, label: '+3yr' }],
    confidenceScore: 92,
  },
  des_ux: {
    displayRole: 'UX/UI Designer',
    summary: 'Moderate resilience in research and logic; high disruption in standard component layout.',
    skills: {
      obsolete: [{ skill: 'Standard wireframe generation', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI tools generate usable wireframes from natural language.', aiReplacement: 'Full', aiTool: 'Uizard' }],
      at_risk: [{ skill: 'User flow documentation', riskScore: 70, riskType: 'Augmented', horizon: '2yr', reason: 'AI mapping tools.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Deep User Research & Empathy', whySafe: 'AI cannot replicate the physiological and psychological nuances of real user testing.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI UX Specialist', riskReduction: 58, skillGap: 'LLM interface patterns, AI agents UX', transitionDifficulty: 'Medium', industryMapping: ['Product Development'], salaryDelta: '+30–60%', timeToTransition: '12 months' }],
    roadmap: {
      '5-10': {
        phase_1: { timeline: '30 days', focus: 'AI Patterns', actions: [{ action: 'Study AI-agent interface paradigms', why: 'The next era of UX.', outcome: 'Expert status' }] },
      },
    },
    inactionScenario: 'Component "movers" will be replaced. Success requires moving toward UX strategy and complex AI-system design.',
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 95,
  },
};
