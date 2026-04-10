import { CareerIntelligence } from './intelligence/types';

export const INDUSTRY_INTELLIGENCE: Record<string, CareerIntelligence> = {
  eng_civil: {
    displayRole: 'Civil Engineer',
    summary: 'High resilience in physical world constraints; AI augments drafting and quantity takeoff.',
    skills: {
      obsolete: [{ skill: 'Manual CAD drafting', riskScore: 82, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI-powered CAD plugins generate standard details.', aiReplacement: 'Full', aiTool: 'Autodesk Forma' }],
      safe: [{ skill: 'Regulatory Compliance & PE Certification', whySafe: 'Professional engineer license requirements ensure human accountability.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Computational Design Engineer', riskReduction: 55, skillGap: 'Grasshopper, Python', transitionDifficulty: 'Hard', industryMapping: ['AEC Tech'], salaryDelta: '+30-50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 92,
  },
  eng_mech: {
    displayRole: 'Mechanical Engineer',
    summary: 'Steady resilience due to hardware-software integration; AI optimizes dynamics.',
    skills: {
      obsolete: [{ skill: 'Standard part drafting', riskScore: 85, riskType: 'Automatable', horizon: '1-3yr', reason: 'Generative design optimizes geometry automatically.', aiReplacement: 'Full', aiTool: 'Fusion 360' }],
      safe: [{ skill: 'Mechatronics Integration', whySafe: 'Solving "last inch" problems between sensors and physical logic.', longTermValue: 96, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Robotics System Engineer', riskReduction: 60, skillGap: 'ROS, Python, Control systems', transitionDifficulty: 'Hard', industryMapping: ['Manufacturing'], salaryDelta: '+40-70%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 50, label: '+3yr' }],
    confidenceScore: 90,
  },
  eng_elec: {
    displayRole: 'Electrical Engineer',
    summary: 'High resilience in power systems; AI accelerates PCB routing.',
    skills: {
      obsolete: [{ skill: 'Manual PCB routing (basic)', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI auto-routers solve complex standard paths.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Safety-Critical Grid Design', whySafe: 'Liability for electrical systems requires human certification.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Smart Grid Architect', riskReduction: 60, skillGap: 'Energy storage, smart protocols', transitionDifficulty: 'Hard', industryMapping: ['Utilities'], salaryDelta: '+30-50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 92,
  },
  con_arch: {
    displayRole: 'Architect',
    summary: 'Moderate resilience in aesthetics; high disruption in technical drafting.',
    skills: {
      obsolete: [{ skill: 'Technical documentation (BIM)', riskScore: 92, riskType: 'Automatable', horizon: '1styr', reason: 'AI auto-populates technical schedules and sheets.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Design Philosophy & Client Vision', whySafe: 'Interpreting abstract human desires into manifestation.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Design Technology Lead', riskReduction: 55, skillGap: 'Grasshopper, BIM automation', transitionDifficulty: 'Hard', industryMapping: ['AEC'], salaryDelta: '+30-50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 48, label: '+3yr' }],
    confidenceScore: 92,
  },
  eng_enviro: {
    displayRole: 'Environmental Engineer',
    summary: 'High resilience due to regulatory landscape.',
    skills: {
      safe: [{ skill: 'Sustainability Policy Design', whySafe: 'Navigating conflicting public/private interests.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'ESG Strategy Consultant', riskReduction: 52, skillGap: 'ESG reporting', transitionDifficulty: 'Medium', industryMapping: ['Consulting'], salaryDelta: '+40-80%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 96,
  },
  con_site: {
    displayRole: 'Construction Site Manager',
    summary: 'High resilience due to physical world chaos management.',
    skills: {
      safe: [{ skill: 'Subcontractor Human Relations', whySafe: 'Managing diverse, conflicting trade personalities.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'VDC Manager', riskReduction: 60, skillGap: '4D/5D scheduling', transitionDifficulty: 'Medium', industryMapping: ['Construction Tech'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 95,
  },
  con_estimation: {
    displayRole: 'Quantity Surveyor / Estimator',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Strategic Contract Negotiation', whySafe: 'Assessing risk of site-specific unknowns.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Cost Manager', riskReduction: 55, skillGap: 'Financial risk management', transitionDifficulty: 'Hard', industryMapping: ['Developer'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 70, label: '+3yr' }],
    confidenceScore: 94,
  },
  eng_chemical: {
    displayRole: 'Chemical Engineer',
    summary: 'High resilience in physical complexity.',
    skills: {
      safe: [{ skill: 'Safety-Critical Catalyst Strategy', whySafe: 'Managing novel chemical interaction risks.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Sustainability Process Architect', riskReduction: 55, skillGap: 'Green chemistry', transitionDifficulty: 'Hard', industryMapping: ['Renewables'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 96,
  },
  eng_struct: {
    displayRole: 'Structural Engineer',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Non-Standard Seismic Strategy', whySafe: 'Designing for extreme failure modes in novel forms.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Computational Structural Specialist', riskReduction: 62, skillGap: 'Parametric modeling', transitionDifficulty: 'Hard', industryMapping: ['AEC Tech'], salaryDelta: '+40-80%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 94,
  },
  mfg_automation: {
    displayRole: 'Automation Engineer',
    summary: 'High resilience in hardware integration.',
    skills: {
      safe: [{ skill: 'Cross-Domain Robotic Integration', whySafe: 'Syncing physical hardware and safety logic.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Industrial AI Architect', riskReduction: 58, skillGap: 'Edge AI', transitionDifficulty: 'Medium', industryMapping: ['Manufacturing'], salaryDelta: '+50-100%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_mining: {
    displayRole: 'Mining Engineer',
    summary: 'High resilience in extreme physical environments.',
    skills: {
      safe: [{ skill: 'Subsurface Safety', whySafe: 'Navigating life-or-death physical world uncertainty.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Autonomous Mining Ops Lead', riskReduction: 60, skillGap: 'Robotic fleet management', transitionDifficulty: 'Hard', industryMapping: ['Mining'], salaryDelta: '+40-70%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 97,
  },
  con_hse: {
    displayRole: 'HSE Manager',
    summary: 'High resilience in safety leadership.',
    skills: {
      safe: [{ skill: 'Safety Culture & Behavioral Psychology', whySafe: 'Influencing human behavior on high-stakes sites.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Environment & ESG Audit Lead', riskReduction: 55, skillGap: 'ESG reporting', transitionDifficulty: 'Medium', industryMapping: ['Enterprise'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_aero: {
    displayRole: 'Aerospace Engineer',
    summary: 'High resilience in safety-critical systems.',
    skills: {
      safe: [{ skill: 'Safety-Critical Systems Integration', whySafe: 'Human accountability for flight-safety.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Unmanned Systems Architect', riskReduction: 55, skillGap: 'Autonomous flight logic', transitionDifficulty: 'Hard', industryMapping: ['Defense'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_marine: {
    displayRole: 'Marine Engineer',
    summary: 'High resilience in ocean environments.',
    skills: {
      safe: [{ skill: 'Offshore Structural Integrity', whySafe: 'Solving physical failure in undersea environments.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Sustainable Propulsion Engineer', riskReduction: 60, skillGap: 'Hydrogen fuel cells', transitionDifficulty: 'Hard', industryMapping: ['Shipping'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 97,
  },
  urb_planner: {
    displayRole: 'Urban Planner',
    summary: 'High resilience in policy and stakeholder management.',
    skills: {
      safe: [{ skill: 'Stakeholder Mediation', whySafe: 'Navigating the emotional trade-offs of community development.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Smart City Infrastructure Lead', riskReduction: 55, skillGap: 'IoT platform strategy', transitionDifficulty: 'Medium', industryMapping: ['Government'], salaryDelta: '+30-50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 96,
  },
  eng_robotics: {
    displayRole: 'Robotics Engineer',
    summary: 'Extremely high resilience.',
    skills: {
      safe: [{ skill: 'End-to-End Robotic System Synthesis', whySafe: 'Integrating sensors and code into a physical machine.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Human-Robot Interaction Designer', riskReduction: 45, skillGap: 'Anthropometrics', transitionDifficulty: 'Medium', industryMapping: ['Manufacturing'], salaryDelta: '+40-80%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  eng_nuclear: {
    displayRole: 'Nuclear Engineer',
    summary: 'High resilience in safety-critical systems.',
    skills: {
      safe: [{ skill: 'Critical Safety Shutdown Ethics', whySafe: 'Human-in-the-loop requirement for catastrophic risk management.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Fusion Energy Systems Lead', riskReduction: 65, skillGap: 'Plasma physics', transitionDifficulty: 'Very Hard', industryMapping: ['Renewables'], salaryDelta: '+50-150%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
  eng_petroleum: {
    displayRole: 'Petroleum Engineer',
    summary: 'High resilience in complex subsurface dynamics.',
    skills: {
      safe: [{ skill: 'Enhanced Oil Recovery Creativity', whySafe: 'Developing novel physical/chemical interventions for unconventional reservoirs.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Geothermal Reservoir Lead', riskReduction: 60, skillGap: 'Geothermal heat exchange', transitionDifficulty: 'Medium', industryMapping: ['Renewables'], salaryDelta: '+20-50%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 96,
  },
  eng_biomed: {
    displayRole: 'Biomedical Engineer',
    summary: 'High resilience in bio-synthetic hardware.',
    skills: {
      safe: [{ skill: 'Neural Interface Synthesis', whySafe: 'Designing the complex biological-to-digital signal bridge.', longTermValue: 98, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Neurotech Systems Architect', riskReduction: 55, skillGap: 'Signal processing', transitionDifficulty: 'Hard', industryMapping: ['Biotech'], salaryDelta: '+50-120%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_materials: {
    displayRole: 'Materials Scientist',
    summary: 'High resilience in novel synthesis.',
    skills: {
      safe: [{ skill: 'First-Principles Material Synthesis', whySafe: 'Designing novel molecular structures for specific physical targets.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Sustainability Material Architect', riskReduction: 58, skillGap: 'Circular economy design', transitionDifficulty: 'Hard', industryMapping: ['Consumer Goods'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_optics: {
    displayRole: 'Optical Engineer',
    summary: 'High resilience in photonics systems.',
    skills: {
      safe: [{ skill: 'Photonics System Integration', whySafe: 'Solving physical alignment and thermal challenges in optical hardware.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'AR/VR Optomechanical Lead', riskReduction: 45, skillGap: 'Wave-guide design', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  mfg_plant_mgr: {
    displayRole: 'Plant Manager',
    summary: 'High resilience in workforce leadership.',
    skills: {
      safe: [{ skill: 'Strategic Workforce Transformation', whySafe: 'Guiding a physical labor force through the shift to high-tech automation.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Smart Factory Transformation Lead', riskReduction: 60, skillGap: 'IoT platform deployment', transitionDifficulty: 'Medium', industryMapping: ['Industrial Tech'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 97,
  },
  eng_fire_protection: {
    displayRole: 'Fire Protection Engineer',
    summary: 'High resilience due to the life-critical safety regulations and the physical world complexity of fluid dynamics and combustion; AI augments plume modeling.',
    skills: {
      obsolete: [{ skill: 'Routine hydraulic calculation and pipe-routing', riskScore: 94, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-optimizes pipe diameters and routing for code-compliant pressure caps instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Safety-Critical System Liability & Ethics', whySafe: 'The professional standard of care for fire-suppression systems where failure is catastrophic.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Industrial Risk Consultant', riskReduction: 52, skillGap: 'Hazardous material protocols, NFPA standards', transitionDifficulty: 'Medium', industryMapping: ['General Insurance'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_traffic: {
    displayRole: 'Traffic / Transportation Engineer',
    summary: 'High resilience in multi-stakeholder modal planning; disruption in routine signal timing and pavement marking design.',
    skills: {
      obsolete: [{ skill: 'Standard signal timing optimization', riskScore: 98, riskType: 'Automatable', horizon: '1styr', reason: 'AI-driven traffic management systems (dynamic grid) outperform human signal plans by 40%.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Multi-Modal Stakeholder Mediation', whySafe: 'Negotiating the competing interests of pedestrians, vehicles, and micro-mobility in community design.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'ITS Platform Architect (Intelligent Transport)', riskReduction: 55, skillGap: 'Edge AI for traffic, CV-to-Infrastructure protocols', transitionDifficulty: 'Hard', industryMapping: ['Smart City Tech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 42, label: '+3yr' }],
    confidenceScore: 96,
  },
  eng_hydrology: {
    displayRole: 'Hydrology / Water Resources Engineer',
    summary: 'High resilience due to the non-linear complexity of climate-driven water cycles and safety-critical infrastructure; disruption in routine flow modeling.',
    skills: {
      obsolete: [{ skill: 'Standard flow and basin modeling (routine)', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI predicts basin runoff based on satellite data 10x faster than traditional HEC-RAS manual modeling.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Watershed Resilience Strategy', whySafe: 'Developing long-term infrastructure responses to statistically unprecedented flood/drought cycles.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Climate Adaptation Lead', riskReduction: 45, skillGap: 'Climate risk financial modeling, infrastructure policy', transitionDifficulty: 'Hard', industryMapping: ['Government / NGO'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 97,
  },
};
