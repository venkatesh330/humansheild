import { CareerIntelligence } from './types.ts';

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
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Sustainability Policy Design', whySafe: 'Navigating conflicting public/private interests.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'ESG Strategy Consultant', riskReduction: 52, skillGap: 'ESG reporting', transitionDifficulty: 'Medium', industryMapping: ['Consulting'], salaryDelta: '+40-80%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 96,
  },
  con_site: {
    displayRole: 'Construction Site Manager',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Subcontractor Human Relations', whySafe: 'Managing diverse trade personalities.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'VDC Manager', riskReduction: 60, skillGap: '4D/5D scheduling', transitionDifficulty: 'Medium', industryMapping: ['Construction Tech'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 95,
  },
  con_estimation: {
    displayRole: 'Quantity Surveyor',
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
    summary: 'High resilience.',
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
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Cross-Domain Robotic Integration', whySafe: 'Syncing physical hardware and safety logic.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Industrial AI Architect', riskReduction: 58, skillGap: 'Edge AI', transitionDifficulty: 'Medium', industryMapping: ['Manufacturing'], salaryDelta: '+50-100%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_mining: {
    displayRole: 'Mining Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Subsurface Safety', whySafe: 'Navigating physical world uncertainty.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Autonomous Mining Ops Lead', riskReduction: 60, skillGap: 'Robotic fleet management', transitionDifficulty: 'Hard', industryMapping: ['Mining'], salaryDelta: '+40-70%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 97,
  },
  con_hse: {
    displayRole: 'HSE Manager',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Safety Culture & Behavioral Psychology', whySafe: 'Influencing human behavior on high-stakes sites.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Environment & ESG Audit Lead', riskReduction: 55, skillGap: 'ESG reporting', transitionDifficulty: 'Medium', industryMapping: ['Enterprise'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_aero: {
    displayRole: 'Aerospace Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Safety-Critical Systems Integration', whySafe: 'Human accountability for flight-safety.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Unmanned Systems Architect', riskReduction: 55, skillGap: 'Autonomous flight logic', transitionDifficulty: 'Hard', industryMapping: ['Defense'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_marine: {
    displayRole: 'Marine Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Offshore Structural Integrity', whySafe: 'Solving physical failure in undersea environments.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Sustainable Propulsion Engineer', riskReduction: 60, skillGap: 'Hydrogen fuel cells', transitionDifficulty: 'Hard', industryMapping: ['Shipping'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 97,
  },
  urb_planner: {
    displayRole: 'Urban Planner',
    summary: 'High resilience.',
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
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Critical Safety Shutdown Ethics', whySafe: 'Human-in-the-loop requirement.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Fusion Energy Systems Lead', riskReduction: 65, skillGap: 'Plasma physics', transitionDifficulty: 'Very Hard', industryMapping: ['Renewables'], salaryDelta: '+50-150%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
  eng_petroleum: {
    displayRole: 'Petroleum Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Enhanced Oil Recovery Creativity', whySafe: 'Developing novel physical/chemical interventions.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Geothermal Reservoir Lead', riskReduction: 60, skillGap: 'Geothermal heat exchange', transitionDifficulty: 'Medium', industryMapping: ['Renewables'], salaryDelta: '+20-50%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 96,
  },
  eng_biomed: {
    displayRole: 'Biomedical Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Neural Interface Synthesis', whySafe: 'Designing the complex biological-to-digital signal bridge.', longTermValue: 98, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Neurotech Systems Architect', riskReduction: 55, skillGap: 'Signal processing', transitionDifficulty: 'Hard', industryMapping: ['Biotech'], salaryDelta: '+50-120%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_materials: {
    displayRole: 'Materials Scientist',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'First-Principles Material Synthesis', whySafe: 'Designing novel molecular structures.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Sustainability Material Architect', riskReduction: 58, skillGap: 'Circular economy design', transitionDifficulty: 'Hard', industryMapping: ['Consumer Goods'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_optics: {
    displayRole: 'Optical Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Photonics System Integration', whySafe: 'Solving physical alignment and thermal challenges.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'AR/VR Optomechanical Lead', riskReduction: 45, skillGap: 'Wave-guide design', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  mfg_plant_mgr: {
    displayRole: 'Plant Manager',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Strategic Workforce Transformation', whySafe: 'Guiding a labor force through high-tech automation.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Smart Factory Transformation Lead', riskReduction: 60, skillGap: 'IoT platform deployment', transitionDifficulty: 'Medium', industryMapping: ['Industrial Tech'], salaryDelta: '+30-60%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 97,
  },
  eng_fire_protection: {
    displayRole: 'Fire Protection Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Safety-Critical System Liability', whySafe: 'The professional standard of care for fire-suppression.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Industrial Risk Consultant', riskReduction: 52, skillGap: 'Hazardous material protocols', transitionDifficulty: 'Medium', industryMapping: ['Insurance'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_traffic: {
    displayRole: 'Traffic Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Multi-Modal Stakeholder Mediation', whySafe: 'Negotiating the competing interests of pedestrians.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'ITS Platform Architect', riskReduction: 55, skillGap: 'Edge AI for traffic', transitionDifficulty: 'Hard', industryMapping: ['Smart City Tech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 42, label: '+3yr' }],
    confidenceScore: 96,
  },
  eng_hydrology: {
    displayRole: 'Hydrology Engineer',
    summary: 'High resilience.',
    skills: {
      safe: [{ skill: 'Watershed Resilience Strategy', whySafe: 'Developing long-term infrastructure responses.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Climate Adaptation Lead', riskReduction: 45, skillGap: 'Climate risk policy', transitionDifficulty: 'Hard', industryMapping: ['Government'], salaryDelta: '+30-60%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 97,
  },
  eng_geotechnical: {
    displayRole: 'Geotechnical Engineer',
    summary: 'High resilience due to the absolute physical world uncertainty of soil/rock behavior and safe load-bearing liability; AI augments boring log interpretation.',
    skills: {
      obsolete: [{ skill: 'Routine boring log data entry and soil classification', riskScore: 88, riskType: 'Augmented', horizon: '1-3yr', reason: 'AI analyzes sensor data to predict soil strata 10x more consistently than manual testing.', aiReplacement: 'Partial' }],
      safe: [{ skill: 'Subsurface Failure Mode Synthesis', whySafe: 'Navigating the life-critical risks of slope stability and deep foundation failure in novel geological settings.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Seismic Risk Architect', riskReduction: 55, skillGap: 'Advanced structural-soil dynamics, computational geotech', transitionDifficulty: 'Hard', industryMapping: ['AEC / Gov'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  eng_renewable_solar: {
    displayRole: 'Solar Energy Grid Engineer',
    summary: 'High resilience in the intersection of transient power supply and high-stakes grid stability; AI optimizes farm layout and predictive output.',
    skills: {
      obsolete: [{ skill: 'Standard solar farm PV layout optimization', riskScore: 94, riskType: 'Automatable', horizon: '1yr', reason: 'Generative AI optimizes panel placement for terrain shadows and bifacial gain instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Smart-Grid Stability Strategy', whySafe: 'Managing the complex frequency and inertia trade-offs of 100% renewable grids.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'VPP (Virtual Power Plant) Architect', riskReduction: 60, skillGap: 'Edge AI for energy, DERMS protocols', transitionDifficulty: 'Hard', industryMapping: ['Utilities / Tech'], salaryDelta: '+30-70%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 97,
  },
  ag_irrigation: {
    displayRole: 'Irrigation Specialist',
    summary: 'Resilient in physical deployment; high disruption in water-flow modeling and scheduling.',
    skills: {
      obsolete: [{ skill: 'Manual water scheduling', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI sensors optimize water delivery based on real-time ET rates.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Large-Scale Aquifer Management', whySafe: 'Navigating regional water rights and long-term climate-based water strategy.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Water Resource Strategist', riskReduction: 55, skillGap: 'GIS, Policy literacy', transitionDifficulty: 'Medium', industryMapping: ['Utility'], salaryDelta: '+30%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 50, label: '+3yr' }],
    confidenceScore: 94,
  },
  ag_soil_scientist: {
    displayRole: 'Soil Scientist',
    summary: 'High resilience in field analysis; disruption in laboratory data processing.',
    skills: {
      safe: [{ skill: 'Carbon Sequestration Strategy', whySafe: 'Developing novel biological methods to store carbon in diverse soil types.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Regenerative Ag Consultant', riskReduction: 48, skillGap: 'Ecosystem services', transitionDifficulty: 'Medium', industryMapping: ['Agriculture'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 96,
  },
  ag_food_safety: {
    displayRole: 'Food Safety Auditor',
    summary: 'High resilience due to regulatory liability; AI augments non-conformance detection.',
    skills: {
      obsolete: [{ skill: 'Routine document verification', riskScore: 85, riskType: 'Automatable', horizon: '2yr', reason: 'OCR/AI validates standard certs automatically.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Cross-Contamination Root Cause Analysis', whySafe: 'Investigating complex human/machine failures in food supply chains.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Supply Chain Integrity Lead', riskReduction: 42, skillGap: 'Blockchain, IoT', transitionDifficulty: 'Medium', industryMapping: ['Logistics'], salaryDelta: '+35%', timeToTransition: '15 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 95,
  },
  ag_forestry_mgr: {
    displayRole: 'Forestry Manager',
    summary: 'Extremely high resilience in physical asset management; disruption in inventory counting.',
    skills: {
      obsolete: [{ skill: 'Tree counting via drone data', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI CV models inventory entire forests in minutes.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Post-Fire Reforestation Strategy', whySafe: 'Planning ecological succession in a changing climate.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Carbon Offset Project Director', riskReduction: 50, skillGap: 'Verification protocols', transitionDifficulty: 'Hard', industryMapping: ['Environment'], salaryDelta: '+50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 98,
  },
  ag_carbon_analyst: {
    displayRole: 'Carbon Credit Analyst',
    summary: 'High growth; high resilience in verification rigor.',
    skills: {
      safe: [{ skill: 'Additionality Verification', whySafe: 'Judging whether a project truly reduces carbon beyond baseline.', longTermValue: 98, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Director of ESG Strategy', riskReduction: 55, skillGap: 'Board-level reporting', transitionDifficulty: 'Hard', industryMapping: ['Corporate'], salaryDelta: '+100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 97,
  },
  ag_precision_lead: {
    displayRole: 'Precision Agriculture Lead',
    summary: 'High resilience; this role is the bridge between AI/Robotics and physical farming.',
    skills: {
      safe: [{ skill: 'Robotic Fleet Orchestration', whySafe: 'Coordinating autonomous vehicles across irregular terrains.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Ag-Tech CTO', riskReduction: 60, skillGap: 'Product management', transitionDifficulty: 'Very Hard', industryMapping: ['Ventures'], salaryDelta: '+150%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 99,
  },
  ag_hydrologist: {
    displayRole: 'Hydrologist',
    summary: 'High resilience in physical water modeling.',
    skills: {
      safe: [{ skill: 'Non-Stationary Flood Prediction', whySafe: 'Modeling water behavior in an era where past data no longer predicts the future.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Flood Resilience Consultant', riskReduction: 45, skillGap: 'Urban planning info', transitionDifficulty: 'Medium', industryMapping: ['Public Sector'], salaryDelta: '+30-50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  ag_agronomist: {
    displayRole: 'Agronomist',
    summary: 'High resilience; AI augments crop prescriptions but requires human validation.',
    skills: {
      safe: [{ skill: 'Genotype x Environment Interaction Analysis', whySafe: 'Choosing seeds for highly localized soil micro-climates.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Crop Genetics Lead', riskReduction: 50, skillGap: 'CRISPR/Genomics', transitionDifficulty: 'Hard', industryMapping: ['Biotech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 20, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 97,
  },
  ag_livestock_gen: {
    displayRole: 'Livestock Geneticist',
    summary: 'High resilience; disruption in routine selection markers.',
    skills: {
      safe: [{ skill: 'Disease Resilience Breeding Strategy', whySafe: 'Synthesizing animal health data with long-term breeding goals.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Animal Health Researcher', riskReduction: 48, skillGap: 'Microbiome analysis', transitionDifficulty: 'Medium', industryMapping: ['Pharma'], salaryDelta: '+30%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
  ag_vertical_lead: {
    displayRole: 'Vertical Farm Systems Lead',
    summary: 'High resilience; managing the "Indoor Ecosystem".',
    skills: {
      safe: [{ skill: 'Closed-Loop Nutrient Management', whySafe: 'Synthesizing hydro/aero data with physical crop health.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'CEA Operations Director', riskReduction: 55, skillGap: 'Energy trading info', transitionDifficulty: 'Hard', industryMapping: ['AgTech'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 40, label: '+3yr' }],
    confidenceScore: 95,
  },
  env_compliance: {
    displayRole: 'Environmental Compliance Officer',
    summary: 'High resilience; high liability.',
    skills: {
      safe: [{ skill: 'EPA/EU Regulatory Negotiation', whySafe: 'Humans must own the legal relationship with regulators.', longTermValue: 97, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Lobbyist (Env)', riskReduction: 45, skillGap: 'Political comms', transitionDifficulty: 'Hard', industryMapping: ['Gov Affairs'], salaryDelta: '+60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  env_ranger: {
    displayRole: 'Park Ranger / Conservationist',
    summary: 'Extremely high resilience; physical presence is the core product.',
    skills: {
      safe: [{ skill: 'In-Situ Invasives Management', whySafe: 'Physical identification and removal of invasive species in wild terrain.', longTermValue: 99, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Eco-Tourism Director', riskReduction: 35, skillGap: 'Business ops', transitionDifficulty: 'Medium', industryMapping: ['Tourism'], salaryDelta: '+20%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  env_fisheries: {
    displayRole: 'Fisheries Manager',
    summary: 'High resilience; managing the "Blue Economy".',
    skills: {
      safe: [{ skill: 'Quota Negotiation & Ethics', whySafe: 'Balancing biodiversity with economic survival of communities.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Ocean Sustainability Lead', riskReduction: 52, skillGap: 'Blue carbon markets', transitionDifficulty: 'Hard', industryMapping: ['NGO'], salaryDelta: '+30%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  ag_consultant: {
    displayRole: 'Agribusiness Consultant',
    summary: 'High resilience; human trust is the moat.',
    skills: {
      safe: [{ skill: 'Family Succession Planning', whySafe: 'Navigating the emotional and legal complexity of farm transfers.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Senior Partner (Boutique Ag)', riskReduction: 40, skillGap: 'Equity architecture', transitionDifficulty: 'Very Hard', industryMapping: ['Consulting'], salaryDelta: '+100%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 20, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 97,
  },
  ag_seed_scientist: {
    displayRole: 'Seed Scientist',
    summary: 'High resilience in physical preservation.',
    skills: {
      safe: [{ skill: 'Cryogenic Preservation Strategy', whySafe: 'Managing global seed banks and maintaining genetic viability.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Plant IP Strategist', riskReduction: 45, skillGap: 'Patent law', transitionDifficulty: 'Hard', industryMapping: ['Legal/Biotech'], salaryDelta: '+60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  log_customs_broker: {
    displayRole: 'Customs Broker',
    summary: 'Moderate resilience; high disruption in routine filing; resilience in complex tariff classification.',
    skills: {
      obsolete: [{ skill: 'Routine commercial invoice entry', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'OCR and AI automate standard customs entries.', aiReplacement: 'Full' }],
      safe: [{ skill: 'HTS Classification Strategy', whySafe: 'Navigating ambiguous legal definitions for complex multi-part hardware.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Global Trade Compliance Manager', riskReduction: 55, skillGap: 'Export controls, EAR/ITAR', transitionDifficulty: 'Hard', industryMapping: ['Legal / Tech'], salaryDelta: '+40-70%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 68, label: '+3yr' }],
    confidenceScore: 94,
  },
  log_freight_forwarder: {
    displayRole: 'Freight Forwarder',
    summary: 'Moderate resilience; disruption in standard booking; resilience in crisis logistics.',
    skills: {
      safe: [{ skill: 'Crisis Routing & Contingency', whySafe: 'Solving real-time physical world disruptions (strikes, weather, canal blocks).', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Control Tower Director', riskReduction: 48, skillGap: 'Supply chain visibility software', transitionDifficulty: 'Medium', industryMapping: ['Logistics'], salaryDelta: '+30%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 95,
  },
  log_fleet_safety: {
    displayRole: 'Fleet Safety Manager',
    summary: 'High resilience; human accountability in high-liability transport.',
    skills: {
      safe: [{ skill: 'ADAS / Autonomous Fleet Safety Policy', whySafe: 'Establishing the safety protocols for the transition to semi-autonomous fleets.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Risk & Insurance Lead', riskReduction: 42, skillGap: 'Actuarial info', transitionDifficulty: 'Hard', industryMapping: ['Insurance'], salaryDelta: '+35%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 98,
  },
  log_sc_data_analyst: {
    displayRole: 'Supply Chain Data Analyst',
    summary: 'High growth; transforming from "reporter" to "AI-Model Manager".',
    skills: {
      safe: [{ skill: 'Predictive Inventory Logic Audit', whySafe: 'Auditing whether AI-driven inventory models are behaving rationally during black-swan events.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'SC Systems Architect', riskReduction: 52, skillGap: 'Graph DBs, Cloud infra', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 38, label: '+3yr' }],
    confidenceScore: 97,
  },
  log_port_mgr: {
    displayRole: 'Port Terminal Manager',
    summary: 'High resilience; high-stakes physical asset and labor orchestration.',
    skills: {
      safe: [{ skill: 'Inter-Modal Congestion Solving', whySafe: 'Coordinating physical machinery and human labor in chaotic environments.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Maritime Operations Director', riskReduction: 40, skillGap: 'Global shipping strategy', transitionDifficulty: 'Hard', industryMapping: ['Logistics'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
  log_atc: {
    displayRole: 'Air Traffic Controller',
    summary: 'High resilience due to physical safety-criticality; disruption in routine vectoring.',
    skills: {
      safe: [{ skill: 'Emergency Sequence Orchestration', whySafe: 'Personal human liability for life-and-death decisions during equipment failure.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Aviation Safety Consultant', riskReduction: 38, skillGap: 'Industry regulations', transitionDifficulty: 'Medium', industryMapping: ['Government'], salaryDelta: '+25%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 25, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 98,
  },
  log_wh_auto_lead: {
    displayRole: 'Warehouse Automation Lead',
    summary: 'High resilience; physical-world bridge for robotics deployment.',
    skills: {
      safe: [{ skill: 'Robotic Sortation System Tuning', whySafe: 'Fine-tuning AMRs/AGVs for non-standard physical item shapes.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Director of Robotic Operations', riskReduction: 50, skillGap: 'PLC programming, controls', transitionDifficulty: 'Hard', industryMapping: ['Manufacturing'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 99,
  },
  log_cold_chain: {
    displayRole: 'Cold Chain Specialist',
    summary: 'High resilience; specialized pharma/food compliance.',
    skills: {
      safe: [{ skill: 'GDP Compliance & Risk Audit', whySafe: 'Ensuring absolute integrity for temperature-sensitive biologics.', longTermValue: 97, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Biopharma Logistics Director', riskReduction: 45, skillGap: 'GXP standards', transitionDifficulty: 'Medium', industryMapping: ['Pharma'], salaryDelta: '+50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 98,
  },
  log_procurement_global: {
    displayRole: 'Global Procurement Specialist',
    summary: 'High resilience; human negotiation and supplier trust.',
    skills: {
      safe: [{ skill: 'Strategic Supplier Resilience Auditing', whySafe: 'Judging a supplier\'s long-term viability beyond their balance sheet.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Head of Strategic Sourcing', riskReduction: 45, skillGap: 'Financial engineering', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  log_last_mile: {
    displayRole: 'Last Mile Logistics Manager',
    summary: 'High resilience; solving the physical-world "final link" complexity.',
    skills: {
      safe: [{ skill: 'Micro-Hub Networking', whySafe: 'Designing decentralized delivery points in dense urban centers.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Urban Logistics Strategist', riskReduction: 42, skillGap: 'Smart city policy', transitionDifficulty: 'Medium', industryMapping: ['Public Sector'], salaryDelta: '+30%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 55, label: '+3yr' }],
    confidenceScore: 94,
  },
  log_rail_sys_eng: {
    displayRole: 'Railway Systems Engineer',
    summary: 'High resilience; physical infrastructure and functional safety.',
    skills: {
      safe: [{ skill: 'Signaling & Interlocking Safety Logic', whySafe: 'Human-in-the-loop safety-critical logic for mass transit.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Head of Rail Modernization', riskReduction: 38, skillGap: 'Digital twin implementation', transitionDifficulty: 'Hard', industryMapping: ['Public Sector'], salaryDelta: '+30-50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
  log_cargo_surveyor: {
    displayRole: 'Cargo Surveyor',
    summary: 'High resilience; physical world presence and high-stakes liability.',
    skills: {
      safe: [{ skill: 'Damage Root-Cause Attribution', whySafe: 'Discerning if damage occurred due to stowage, sea-state, or manufacturing.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Marine Insurance Adjuster', riskReduction: 40, skillGap: 'Insurance law', transitionDifficulty: 'Medium', industryMapping: ['Insurance'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  log_soft_impl_lead: {
    displayRole: 'Logistics Software Implementation Lead',
    summary: 'High resilience; solving the "Real World vs. Code" mismatch.',
    skills: {
      safe: [{ skill: 'WMS/TMS Workflow Customization', whySafe: 'Adapting standardized software for non-standard physical facility layouts.', longTermValue: 95, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Logistics solutions Architect', riskReduction: 55, skillGap: 'Sales engineering info', transitionDifficulty: 'Medium', industryMapping: ['Tech'], salaryDelta: '+40%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 38, label: '+3yr' }],
    confidenceScore: 97,
  },
  log_dist_center_dir: {
    displayRole: 'Distribution Center Director',
    summary: 'High resilience; high stake leadership.',
    skills: {
      safe: [{ skill: 'Labor-Automation Synergy strategy', whySafe: 'Balancing robotic and human workforce for peak peak performance.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'VP of Global Operations', riskReduction: 52, skillGap: 'P&L management, Strategy', transitionDifficulty: 'Very Hard', industryMapping: ['Enterprise'], salaryDelta: '+80-150%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 99,
  },
  log_inventory_control: {
    displayRole: 'Inventory Control Manager',
    summary: 'Moderate resilience; displacement in counting; resilience in strategic cycle-count logic.',
    skills: {
      obsolete: [{ skill: 'Manual SKU counting', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'RFID and AI vision automate physical counting near-perfectly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Discrepancy Investigation & Integrity', whySafe: 'Investigating systemic theft or data-entry failures.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Demand Planning Analyst', riskReduction: 45, skillGap: 'Statistical modeling', transitionDifficulty: 'Medium', industryMapping: ['Retail / Tech'], salaryDelta: '+30%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 65, label: '+3yr' }],
    confidenceScore: 94,
  },
  trd_hvac: {
    displayRole: 'HVAC Technician (Specialized)',
    summary: 'Extremely high resilience; physical-world complexity and environmental regulation compliance.',
    skills: {
      safe: [{ skill: 'Thermodynamic System Troubleshooting', whySafe: 'Physical world diagnostics in irregular building environments.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Smart Building Systems Integrator', riskReduction: 45, skillGap: 'IoT, BMS protocols', transitionDifficulty: 'Medium', industryMapping: ['Tech / Construction'], salaryDelta: '+30-50%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_plumber_ind: {
    displayRole: 'Industrial Plumber / Pipefitter',
    summary: 'Extremely high resilience; physical complexity and high-stakes liability.',
    skills: {
      safe: [{ skill: 'High-Pressure System Integrity', whySafe: 'The physical expertise required for safety-critical industrial piping.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Industrial Facilities Manager', riskReduction: 40, skillGap: 'Budget mgmt, Team leadership', transitionDifficulty: 'Medium', industryMapping: ['Manufacturing'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 10, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_electrician_master: {
    displayRole: 'Master Electrician',
    summary: 'Extremely high resilience; regulatory requirement and physical complexity.',
    skills: {
      safe: [{ skill: 'Microgrid & EV Infrastructure Design', whySafe: 'Humans must own the code-compliance and safety of high-voltage installations.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Renewable Energy Project lead', riskReduction: 35, skillGap: 'Grid-tie protocols', transitionDifficulty: 'Medium', industryMapping: ['Utilities'], salaryDelta: '+50%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 8, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_cnc_machinist: {
    displayRole: 'CNC Programmer / Machinist',
    summary: 'Moderate resilience; high disruption in standard G-code generation; resilience in precision setup.',
    skills: {
      obsolete: [{ skill: 'Manual G-code writing for simple parts', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI-CAM generates optimal toolpaths for 3-axis parts instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Subtractive Manufacturing Logic', whySafe: 'Designing work-holding and sequence for complex 5-axis aerospace parts.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Additive Manufacturing Engineer', riskReduction: 55, skillGap: '3D printing/DMLS logic', transitionDifficulty: 'Medium', industryMapping: ['Aerospace'], salaryDelta: '+40%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 96,
  },
  trd_underwater_welder: {
    displayRole: 'Underwater Welder',
    summary: 'Extremely high resilience; extreme physical environment and high stakes.',
    skills: {
      safe: [{ skill: 'Saturation Diving Operations', whySafe: 'Operating in hyperbaric environments where robotics is still limited by dexterity.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Offshore Infrastructure Inspector', riskReduction: 30, skillGap: 'ROV piloting info', transitionDifficulty: 'Medium', industryMapping: ['Energy'], salaryDelta: '+20%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 10, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_elevator_mech: {
    displayRole: 'Elevator Mechanic',
    summary: 'Extremely high resilience; safety-critical human-in-the-loop requirement.',
    skills: {
      safe: [{ skill: 'Functional Safety Logic Troubleshooting', whySafe: 'Human liability for life-critical transportation systems in buildings.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Vertical Transportation Consultant', riskReduction: 45, skillGap: 'Building code expertise', transitionDifficulty: 'Medium', industryMapping: ['Real Estate'], salaryDelta: '+30%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_tool_die: {
    displayRole: 'Tool and Die Maker',
    summary: 'High resilience; the "precision foundation" of all manufacturing.',
    skills: {
      safe: [{ skill: 'Precision Tolerance Synthesis', whySafe: 'Achieving micron-level accuracy in hardened physical materials.', longTermValue: 98, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Precision Manufacturing Engineer', riskReduction: 48, skillGap: 'CMM, Metrology', transitionDifficulty: 'Medium', industryMapping: ['Aerospace'], salaryDelta: '+40%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  trd_pipefitter: {
    displayRole: 'Industrial Pipefitter',
    summary: 'Extremely high resilience; physical world complexity.',
    skills: {
      safe: [{ skill: 'Iso-Metric Interpretation & Field Fit', whySafe: 'Adapting blueprints to physical world obstructions in real-time.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Piping Designer (BIM)', riskReduction: 52, skillGap: 'Revit / Navisworks', transitionDifficulty: 'Hard', industryMapping: ['Engineering'], salaryDelta: '+30-50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_wind_tech: {
    displayRole: 'Wind Turbine Technician',
    summary: 'High resilience; core growth role in the energy transition.',
    skills: {
      safe: [{ skill: 'At-Height Mechanical Diagnosis', whySafe: 'Solving physical turbine failures in extreme conditions.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Renewable Site Manager', riskReduction: 45, skillGap: 'Ops mgmt, Budgeting', transitionDifficulty: 'Medium', industryMapping: ['Energy'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_auto_diag: {
    displayRole: 'Automotive Diagnostic Specialist',
    summary: 'High resilience; focus shifting from mechanical to "System Architect" for EVs.',
    skills: {
      safe: [{ skill: 'EV Thermal & High-Voltage Diagnosis', whySafe: 'Managing the complex thermal and electrical safety of battery systems.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'EV Systems Engineer', riskReduction: 55, skillGap: 'Embedded systems, CAN-bus', transitionDifficulty: 'Hard', industryMapping: ['Automotive'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 20, label: 'Now' }, { year: 2027, riskScore: 35, label: '+3yr' }],
    confidenceScore: 97,
  },
  trd_aircraft_mech: {
    displayRole: 'Aircraft Mechanic (A&P)',
    summary: 'Extremely high resilience; huge safety-critical human-in-the-loop requirement.',
    skills: {
      safe: [{ skill: 'FAA-Certified Functional Safety Verification', whySafe: 'Human liability for aircraft airworthiness.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Aviation Quality Director', riskReduction: 42, skillGap: 'Regulatory audits', transitionDifficulty: 'Hard', industryMapping: ['Aerospace'], salaryDelta: '+40-80%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2027, riskScore: 12, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_millwright: {
    displayRole: 'Industrial Millwright',
    summary: 'Extremely high resilience; physical mastery of industrial machinery.',
    skills: {
      safe: [{ skill: 'Precision Rotating Equipment Alignment', whySafe: 'Achieving sub-thousandth alignment on massive industrial shafts.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Industrial Reliability Lead', riskReduction: 45, skillGap: 'Predictive maintenance info', transitionDifficulty: 'Medium', industryMapping: ['Industrial'], salaryDelta: '+30%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 99,
  },
  trd_precision_grinder: {
    displayRole: 'Precision Grinder',
    summary: 'High resilience; the extreme end of subtractive machining accuracy.',
    skills: {
      safe: [{ skill: 'Surface Integrity Optimization', whySafe: 'Managing heat-stresses and finish in safety-critical parts.', longTermValue: 97, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Metrology Specialist', riskReduction: 48, skillGap: 'Optics, Lasers', transitionDifficulty: 'Hard', industryMapping: ['Aerospace'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 38, label: '+3yr' }],
    confidenceScore: 96,
  },
  trd_ndt_spec: {
    displayRole: 'NDT Specialist (Level III)',
    summary: 'High resilience; human liability in safety-critical inspection.',
    skills: {
      safe: [{ skill: 'Non-Standard Indication Interpretation', whySafe: 'Judging whether a signal in X-ray/UT is a structural flaw or noise.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Structural Integrity Lead', riskReduction: 50, skillGap: 'Materials science degree', transitionDifficulty: 'Very Hard', industryMapping: ['Aerospace / Energy'], salaryDelta: '+60%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 98,
  },
  trd_heavy_equip_op: {
    displayRole: 'Heavy Equipment Operator (Precision)',
    summary: 'High resilience in complex terrain; disruption in earthmoving automation.',
    skills: {
      obsolete: [{ skill: 'Standard bulk earthmoving (open pit)', riskScore: 92, riskType: 'Automatable', horizon: '1styr', reason: 'Autonomous haulers and excavators are already in production.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Urban Precision Excavation', whySafe: 'Operating around complex live utilities in dense urban centers.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Site Foreman', riskReduction: 38, skillGap: 'Project mgmt', transitionDifficulty: 'Medium', industryMapping: ['Construction'], salaryDelta: '+30%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 97,
  },
};
