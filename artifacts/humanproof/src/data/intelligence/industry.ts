import { CareerIntelligence } from './types';

export const INDUSTRY_INTELLIGENCE: Record<string, CareerIntelligence> = {
  eng_civil: {
    displayRole: 'Civil Engineer',
    summary: 'High resilience due to physical world constraints and regulatory oversight. Generative Design augments plan generation.',
    skills: {
      obsolete: [{ skill: 'Manual CAD drafting', riskScore: 82, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI-powered CAD plugins generate standard structural details.', aiReplacement: 'Full', aiTool: 'Autodesk Forma' }],
      at_risk: [{ skill: 'Standard quantity takeoff', riskScore: 78, riskType: 'Augmented', horizon: '1-3yr', reason: 'BIM-integrated AI extracts quantities from 3D models.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Regulatory Compliance & Certification', whySafe: 'PE license requirements ensure legal accountability that AI cannot assume.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Computational Design Engineer', riskReduction: 55, skillGap: 'Grasshopper/Dynamo, Python', transitionDifficulty: 'Hard', industryMapping: ['AEC Tech'], salaryDelta: '+30–50%', timeToTransition: '18 months' }],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'BIM Workflow', actions: [{ action: 'Complete Revit Professional certification', why: 'BIM is the foundation.', outcome: 'Certified' }] },
      },
    },
    inactionScenario: 'Standard designers will see fees compressed as AI does 80% of drafting. Success requires PE license and computational design mastery.',
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 92,
  },
  eng_mech: {
    displayRole: 'Mechanical Engineer',
    summary: 'Steady resilience due to hardware-software integration. AI optimizes thermal and fluid dynamics.',
    skills: {
      obsolete: [{ skill: 'Standard part drafting', riskScore: 85, riskType: 'Automatable', horizon: '1-3yr', reason: 'Generative design allows AI to generate optimal part geometry.', aiReplacement: 'Full', aiTool: 'Fusion 360' }],
      at_risk: [{ skill: 'Routine tolerance analysis', riskScore: 75, riskType: 'Augmented', horizon: '1-3yr', reason: 'Simulation tools predict failure modes.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Hardware-Software Integration (Mechatronics)', whySafe: 'Solving "last inch" problems between physical sensors and software logic.', longTermValue: 96, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Robotics System Engineer', riskReduction: 60, skillGap: 'Control systems, ROS, Python', transitionDifficulty: 'Hard', industryMapping: ['Manufacturing'], salaryDelta: '+40–70%', timeToTransition: '24 months' }],
    roadmap: {
      '2-5': {
        phase_1: { timeline: '30 days', focus: 'PLC Training', actions: [{ action: 'Complete Siemens PLC basic training', why: 'Automation is stable and high-paying.', outcome: 'PLC competency' }] },
      },
    },
    inactionScenario: 'Traditional draftsmen will be obsolete within 24 months. Success requires software-defined mechanical skills.',
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 50, label: '+3yr' }],
    confidenceScore: 90,
  },
  eng_elec: {
    displayRole: 'Electrical Engineer',
    summary: 'High resilience in power systems; AI accelerates PCB routing and load balancing.',
    skills: {
      obsolete: [{ skill: 'Manual PCB routing (basic)', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI auto-routers solve complex routing faster for standard boards.', aiReplacement: 'Full', aiTool: 'Flux.ai' }],
      at_risk: [{ skill: 'Routine PLC programming', riskScore: 65, riskType: 'Augmented', horizon: '3yr', reason: 'LLMs generate structured text from natural language.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Safety-Critical System Design', whySafe: 'Liability for systems where failure results in fire or explosion requires human seal.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Grid Modernization Engineer', riskReduction: 60, skillGap: 'Smart grid protocols, energy storage', transitionDifficulty: 'Hard', industryMapping: ['Utilities'], salaryDelta: '+30–50%', timeToTransition: '18 months' }],
    inactionScenario: 'Standard PCB designers will face displacement. Success requires moving to systems architecture and safety-critical roles.',
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 92,
    roadmap: {
      '5-10': {
        phase_1: { timeline: '30 days', focus: 'BESS Tech', actions: [{ action: 'Study Battery Energy Storage Systems', why: 'Fastest growing sector.', outcome: 'BESS specialist' }] },
      }
    }
  },
  con_arch: {
    displayRole: 'Architect',
    summary: 'Moderate resilience in aesthetics and social constraints; high disruption in technical drafting.',
    skills: {
      obsolete: [{ skill: 'Standard technical drafting', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'BIM-integrated AI auto-populates technical schedules.', aiReplacement: 'Full', aiTool: 'Hypar' }],
      at_risk: [{ skill: 'Interior layout optimization', riskScore: 65, riskType: 'Augmented', horizon: '3yr', reason: 'AI optimizes for light and flow better than manual effort.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Design Philosophy & Client Vision', whySafe: 'Interpreting abstract desires into physical manifestation requires human connection.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Computational Designer', riskReduction: 55, skillGap: 'Grasshopper, Python', transitionDifficulty: 'Hard', industryMapping: ['AEC'], salaryDelta: '+30–50%', timeToTransition: '18 months' }],
    inactionScenario: 'Architects acting as CAD drafters will be replaced. Success requires licensure and design technology leadership.',
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 48, label: '+3yr' }],
    confidenceScore: 92,
    roadmap: {
      '0-2': {
        phase_1: { timeline: '30 days', focus: 'Revit Mastery', actions: [{ action: 'Get Revit Architectural Professional certification', why: 'Essential baseline.', outcome: 'Certified Architect' }] },
      }
    }
  },
};
