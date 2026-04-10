import { CareerIntelligence } from './types.ts';

export const CREATIVE_INTELLIGENCE: Record<string, CareerIntelligence> = {
  cnt_blog: {
    displayRole: 'Blogger / Content Writer',
    summary: 'High disruption in standard info-content; resilience in primary research and thought leadership.',
    skills: {
      obsolete: [{ skill: 'Standard info-content drafting', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'LLMs generate SEO articles with high accuracy.', aiReplacement: 'Full', aiTool: 'Jasper, Copy.ai' }],
      safe: [{ skill: 'Primary Research & Interviews', whySafe: 'AI cannot perform original investigative reporting.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Content Operations Manager', riskReduction: 60, skillGap: 'Prompt engineering, Editorial QA', transitionDifficulty: 'Medium', industryMapping: ['Marketing Agencies'], salaryDelta: '+30–50%', timeToTransition: '6 months' }],
    riskTrend: [{ year: 2024, riskScore: 70, label: 'Now' }, { year: 2027, riskScore: 95, label: '+3yr' }],
    confidenceScore: 95,
  },
  des_graphic: {
    displayRole: 'Graphic Designer',
    summary: 'High disruption in execution; resilience in art direction.',
    skills: {
      obsolete: [{ skill: 'Logo variations production', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI generates variations in seconds.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Creative Direction & Brand Identity', whySafe: 'Developing a unique visual language requires human cultural intuition.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Art Director', riskReduction: 55, skillGap: 'Prompting', transitionDifficulty: 'Medium', industryMapping: ['Ad Agencies'], salaryDelta: '+25–45%', timeToTransition: '9 months' }],
    riskTrend: [{ year: 2024, riskScore: 50, label: 'Now' }, { year: 2027, riskScore: 82, label: '+3yr' }],
    confidenceScore: 92,
  },
  des_ux: {
    displayRole: 'UX/UI Designer',
    summary: 'Moderate resilience in research; high disruption in standard layout.',
    skills: {
      obsolete: [{ skill: 'Standard wireframe generation', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI generates wireframes from text.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Deep User Research & Empathy', whySafe: 'AI cannot replicate physiological nuances of user testing.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI UX Specialist', riskReduction: 58, skillGap: 'AI agent UX paradigms', transitionDifficulty: 'Medium', industryMapping: ['Product Development'], salaryDelta: '+30–60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 95,
  },
  cnt_video: {
    displayRole: 'Video Editor',
    summary: 'Moderate resilience in creative storytelling.',
    skills: {
      obsolete: [{ skill: 'Rough cut assembly', riskScore: 92, riskType: 'Automatable', horizon: '1-2yr', reason: 'AI auto-selects best takes.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Emotional Storytelling', whySafe: 'Determining the "soul" of a cut to elicit specific emotion.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Workflow Post-Producer', riskReduction: 60, skillGap: 'Generative video tools', transitionDifficulty: 'Medium', industryMapping: ['Production Houses'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2027, riskScore: 68, label: '+3yr' }],
    confidenceScore: 94,
  },
  des_interior: {
    displayRole: 'Interior Designer',
    summary: 'Moderate resilience; high disruption in visualization.',
    skills: {
      safe: [{ skill: 'Spatial Psychology', whySafe: 'Designing for environments for emotional well-being.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Immersive Experience Designer', riskReduction: 52, skillGap: 'IoT integration', transitionDifficulty: 'Medium', industryMapping: ['Residential'], salaryDelta: '+20-40%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 92,
  },
  med_pr: {
    displayRole: 'PR Specialist',
    summary: 'High resilience in relationship management.',
    skills: {
      safe: [{ skill: 'Strategic Relationship Moat', whySafe: 'Personal trust with journalists.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Crisis Strategy Lead', riskReduction: 45, skillGap: 'Crisis communication', transitionDifficulty: 'Hard', industryMapping: ['Corporate'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 96,
  },
  cnt_social: {
    displayRole: 'Social Media Manager',
    summary: 'High disruption in production.',
    skills: {
      safe: [{ skill: 'Cultural Synthesis', whySafe: 'Identifying niche cultural moments.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Viral Strategy Director', riskReduction: 55, skillGap: 'Psychology', transitionDifficulty: 'Medium', industryMapping: ['Agencies'], salaryDelta: '+40-80%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 55, label: 'Now' }, { year: 2027, riskScore: 80, label: '+3yr' }],
    confidenceScore: 94,
  },
  med_buyer: {
    displayRole: 'Media Buyer',
    summary: 'Extreme disruption in bidding.',
    skills: {
      safe: [{ skill: 'Cross-Channel Strategic Allocation', whySafe: 'Deciding capital allocation based on macro-trends.', longTermValue: 92, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'MarTech Lead', riskReduction: 62, skillGap: 'Privacy tech', transitionDifficulty: 'Medium', industryMapping: ['Enterprise'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 65, label: 'Now' }, { year: 2027, riskScore: 92, label: '+3yr' }],
    confidenceScore: 98,
  },
  cnt_journalist: {
    displayRole: 'Journalist',
    summary: 'High resilience in field-work.',
    skills: {
      safe: [{ skill: 'Investigative Source Cultivation', whySafe: 'Building trust with whistleblowers.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Strategic Intelligence Lead', riskReduction: 52, skillGap: 'OSINT', transitionDifficulty: 'Medium', industryMapping: ['Private Sector'], salaryDelta: '+40-100%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 60, label: '+3yr' }],
    confidenceScore: 98,
  },
  art_director: {
    displayRole: 'Art Director',
    summary: 'High resilience in creative vision.',
    skills: {
      safe: [{ skill: 'Aesthetic Moat & Vision', whySafe: 'Defining a unique visual language.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Chief Creative Officer (CCO)', riskReduction: 45, skillGap: 'Business strategy', transitionDifficulty: 'Very Hard', industryMapping: ['Agencies'], salaryDelta: '+100-300%', timeToTransition: '60 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  des_fashion: {
    displayRole: 'Fashion Designer',
    summary: 'High resilience in physical construction.',
    skills: {
      safe: [{ skill: 'Material Tactility', whySafe: 'Exploring novel physical fabric behaviors.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: '3D Fashion Technologist', riskReduction: 55, skillGap: 'CLO 3D', transitionDifficulty: 'Medium', industryMapping: ['Digital Fashion'], salaryDelta: '+30-70%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 50, label: '+3yr' }],
    confidenceScore: 95,
  },
  des_3d: {
    displayRole: '3D Artist',
    summary: 'High resilience in complex asset creation.',
    skills: {
      safe: [{ skill: 'Hero Asset Organic Sculpting', whySafe: 'Developing highly unique, anatomically complex characters.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Technical Artist (AI)', riskReduction: 62, skillGap: 'Procedural generation', transitionDifficulty: 'Hard', industryMapping: ['Gaming'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 62, label: '+3yr' }],
    confidenceScore: 96,
  },
  des_vfx: {
    displayRole: 'VFX Artist',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Strategic Lighting Synthesis', whySafe: 'Ensuring seamless integration of physical and digital elements.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Virtual Production Supervisor', riskReduction: 58, skillGap: 'Unreal Engine', transitionDifficulty: 'Hard', industryMapping: ['Film'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 75, label: '+3yr' }],
    confidenceScore: 94,
  },
  cnt_ux_writer: {
    displayRole: 'UX Writer',
    summary: 'Moderate resilience.',
    skills: {
      safe: [{ skill: 'Product Voice Strategy', whySafe: 'Designing the "personality" of a product.', longTermValue: 92, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Conversation Designer', riskReduction: 65, skillGap: 'VUI design', transitionDifficulty: 'Medium', industryMapping: ['Product'], salaryDelta: '+30-60%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 48, label: 'Now' }, { year: 2027, riskScore: 78, label: '+3yr' }],
    confidenceScore: 92,
  },
  des_industrial: {
    displayRole: 'Industrial Designer',
    summary: 'High resilience in ergonomics.',
    skills: {
      safe: [{ skill: 'Ergonomic Human-Centric Innovation', whySafe: 'Designing physical interfaces that match the complex physiological reality.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Hardware Product Strategist', riskReduction: 60, skillGap: 'Market synthesis', transitionDifficulty: 'Hard', industryMapping: ['Consumer Tech'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 45, label: '+3yr' }],
    confidenceScore: 96,
  },
  cnt_technical_writer: {
    displayRole: 'Technical Writer',
    summary: 'High disruption in API documentation.',
    skills: {
      safe: [{ skill: 'Strategic Knowledge Architecture', whySafe: 'Designing how complex technical knowledge is structured.', longTermValue: 95, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'AI Knowledge Graph Specialist', riskReduction: 65, skillGap: 'Semantic web', transitionDifficulty: 'Hard', industryMapping: ['Enterprise'], salaryDelta: '+40-100%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2027, riskScore: 75, label: '+3yr' }],
    confidenceScore: 94,
  },
  med_film_director: {
    displayRole: 'Film / Creative Director',
    summary: 'High resilience due to the irreducibly human requirement for singular vision, emotional resonance, and high-stakes physical set leadership.',
    skills: {
      obsolete: [{ skill: 'Standard storyboard and camera-angle drafting', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI-driven previs tools generate cinematic storyboards from script notes instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Unified Emotional Vision & Set Leadership', whySafe: 'Synthesizing 100s of human talents and technical constraints into a singular emotional journey.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Virtual Production Supervisor', riskReduction: 45, skillGap: 'Real-time rendering, LED volume lighting', transitionDifficulty: 'Medium', industryMapping: ['Film / Tech'], salaryDelta: '+50-150%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 22, label: '+3yr' }],
    confidenceScore: 99,
  },
  med_music_composer: {
    displayRole: 'Music Composer / Sound Designer',
    summary: 'High resilience in complex scoring and novel sonic design; extreme disruption in routine stock/background music production.',
    skills: {
      obsolete: [{ skill: 'Standard background and library music production', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'Generative AI produces high-quality background tracks for any mood/bpm instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Emotional Narrative Scoring & Novel Synthesis', whySafe: 'Designing unique sonic identities that respond to the non-linear emotional arc of a story.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Immersive Audio Architect', riskReduction: 60, skillGap: 'Spatial audio, object-based mixing', transitionDifficulty: 'Medium', industryMapping: ['Gaming / XR'], salaryDelta: '+30-70%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2027, riskScore: 65, label: '+3yr' }],
    confidenceScore: 96,
  },
  des_jewelry: {
    displayRole: 'Jewelry Designer / Goldsmith',
    summary: 'High resilience due to the extreme physical precision and material tactility of high-value gems and metals; disruption in standard 3D CAD modeling.',
    skills: {
      obsolete: [{ skill: 'Standard 3D ring/setting modeling', riskScore: 94, riskType: 'Automatable', horizon: '1styr', reason: 'AI-CAD auto-generates 100s of settings based on stone dimensions instantly.', aiReplacement: 'Full' }],
      safe: [{ skill: 'High-Value Material Tactility & Hand-Setting', whySafe: 'The physical world "feel" and setting of precious stones in precious metals.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Luxury Bespoke Consultant', riskReduction: 52, skillGap: 'Gemstone sourcing, high-net-worth sales', transitionDifficulty: 'Medium', industryMapping: ['Luxury Goods'], salaryDelta: '+100-300%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 32, label: '+3yr' }],
    confidenceScore: 98,
  },
  ent_scriptwriter: {
    displayRole: 'Scriptwriter / Screenwriter',
    summary: 'High disruption in routine dialogue; extreme resilience in complex structural narrative and human subtext.',
    skills: {
      obsolete: [{ skill: 'Routine soap/procedural dialogue', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'LLMs generate standard dialogue and scene structures with high fluency.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Subtextual Narrative Architecture', whySafe: 'Designing the "unspoken" emotional and thematic layers of a story.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Showrunner / Creative Producer', riskReduction: 55, skillGap: 'Executive mgmt, Budgeting', transitionDifficulty: 'Hard', industryMapping: ['Film'], salaryDelta: '+100-500%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 35, label: 'Now' }, { year: 2027, riskScore: 68, label: '+3yr' }],
    confidenceScore: 96,
  },
  ent_lighting_des: {
    displayRole: 'Lighting Designer',
    summary: 'High resilience in physical world deployment and emotional atmosphere creation.',
    skills: {
      safe: [{ skill: 'Atmospheric Emotional Palette Design', whySafe: 'Using light and shadow to manipulate human emotional response in physical spaces.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Virtual Production Lighting lead', riskReduction: 50, skillGap: 'Unreal Engine, Ray-tracing', transitionDifficulty: 'Hard', industryMapping: ['Tech / Media'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
  ent_stage_mgr: {
    displayRole: 'Stage Manager',
    summary: 'High resilience; the "Command and Control" center of live performance.',
    skills: {
      safe: [{ skill: 'Live Crisis Orchestration', whySafe: 'Managing thousands of physical cues and human safety during a live performance.', longTermValue: 99, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Technical Director (Live Events)', riskReduction: 35, skillGap: 'Engineering, Systems info', transitionDifficulty: 'Medium', industryMapping: ['Entertainment'], salaryDelta: '+30%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 10, label: 'Now' }, { year: 2027, riskScore: 18, label: '+3yr' }],
    confidenceScore: 99,
  },
  ent_talent_agent: {
    displayRole: 'Talent Agent',
    summary: 'Extremely high resilience; trust and network capital are the product.',
    skills: {
      safe: [{ skill: 'Human Capital Valuation & Leverage', whySafe: 'Judging a human\'s "Star Power" and negotiating multi-million dollar contracts.', longTermValue: 99, difficulty: 'Extremely High' }],
    },
    careerPaths: [{ role: 'Personal Talent Manager / Partner', riskReduction: 45, skillGap: 'Venture architecture info', transitionDifficulty: 'Medium', industryMapping: ['Business'], salaryDelta: '+100-300%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 98,
  },
  ent_casting_dir: {
    displayRole: 'Casting Director',
    summary: 'High resilience; the art of "Finding the Soul" of a role.',
    skills: {
      safe: [{ skill: 'Human Chemistry Synthesis', whySafe: 'Judging how two or more actors will physically and emotionally interact on screen.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Creative Executive', riskReduction: 50, skillGap: 'Business of film info', transitionDifficulty: 'Hard', industryMapping: ['Studios'], salaryDelta: '+40-80%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 18, label: 'Now' }, { year: 2027, riskScore: 30, label: '+3yr' }],
    confidenceScore: 97,
  },
  ent_audio_eng_live: {
    displayRole: 'Audio Engineer (Live)',
    summary: 'High resilience in physical world psychoacoustics.',
    skills: {
      safe: [{ skill: 'Real-Time Psychoacoustic Tuning', whySafe: 'Mixing live sound for massive human crowds in acoustically complex physical spaces.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Acoustical Consultant', riskReduction: 45, skillGap: 'Physics degree info', transitionDifficulty: 'Very Hard', industryMapping: ['Architecture'], salaryDelta: '+50-100%', timeToTransition: '48 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  ent_vo_artist: {
    displayRole: 'Voiceover Artist',
    summary: 'Moderate resilience; extreme disruption in routine commercial VO; resilience in high-stakes narration.',
    skills: {
      obsolete: [{ skill: 'Standard commercial taglines', riskScore: 99, riskType: 'Automatable', horizon: '1styr', reason: 'Synthetic voice clones are indistinguishable for short-form marketing.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Sustained Narrative Performance', whySafe: 'The ability to carry a 20-hour audiobook or complex character with emotional consistency.', longTermValue: 92, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Performance Capture Actor', riskReduction: 55, skillGap: 'Motion capture tech info', transitionDifficulty: 'Medium', industryMapping: ['Gaming / Film'], salaryDelta: '+30%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 55, label: 'Now' }, { year: 2027, riskScore: 88, label: '+3yr' }],
    confidenceScore: 92,
  },
  ent_scenic_artist: {
    displayRole: 'Scenic Artist',
    summary: 'High resilience; physical artistry in the built environment.',
    skills: {
      safe: [{ skill: 'Large-Scale Physical Finishes', whySafe: 'Applying artisanal physical world finishes to massive 3D sets.', longTermValue: 97, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Physical Production Designer', riskReduction: 40, skillGap: 'Budget management info', transitionDifficulty: 'Medium', industryMapping: ['Entertainment'], salaryDelta: '+40%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  ent_location_mgr: {
    displayRole: 'Location Manager',
    summary: 'High resilience; trust, permits, and physical world logistics.',
    skills: {
      safe: [{ skill: 'Institutional Permit Negotiation', whySafe: 'Securing legal and social trust with local communities and governments.', longTermValue: 98, difficulty: 'Medium' }],
    },
    careerPaths: [{ role: 'Unit Production Manager (UPM)', riskReduction: 42, skillGap: 'Union guild rules info', transitionDifficulty: 'Hard', industryMapping: ['Film'], salaryDelta: '+50%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2027, riskScore: 20, label: '+3yr' }],
    confidenceScore: 99,
  },
  ent_film_editor: {
    displayRole: 'Film Editor (Strategic)',
    summary: 'Moderate resilience; high disruption in routine assembly; resilience in pacing and subtext.',
    skills: {
      obsolete: [{ skill: 'Standard multi-cam assembly', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI auto-switches multi-cam shots based on sound peaks and facial focus.', aiReplacement: 'Full' }],
      safe: [{ skill: 'Emotional Pacing & Rhythmic Subtext', whySafe: 'Using the "frame" to manipulate human heartbeat and emotional response.', longTermValue: 95, difficulty: 'Very High' }],
    },
    careerPaths: [{ role: 'Creative Director (Post)', riskReduction: 55, skillGap: 'VFX supervision info', transitionDifficulty: 'Hard', industryMapping: ['Advertising'], salaryDelta: '+40-80%', timeToTransition: '24 months' }],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2027, riskScore: 52, label: '+3yr' }],
    confidenceScore: 96,
  },
  ent_broadcast_eng: {
    displayRole: 'Broadcast Engineer',
    summary: 'High resilience; mission-critical infrastructure for live television.',
    skills: {
      safe: [{ skill: 'RF & IP Distribution Continuity', whySafe: 'Managing high-stakes physical and cloud broadcast chains.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Streaming Platform Architect', riskReduction: 52, skillGap: 'Cloud CDN, Low-latency video', transitionDifficulty: 'Hard', industryMapping: ['Tech'], salaryDelta: '+50-100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 28, label: '+3yr' }],
    confidenceScore: 98,
  },
  ent_choreographer: {
    displayRole: 'Choreographer',
    summary: 'Extremely high resilience; physical world human motion design.',
    skills: {
      safe: [{ skill: 'Kinetic Human Storytelling', whySafe: 'Designing the physical world motion and interaction of multiple human bodies.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Movement Director (Mo-Cap)', riskReduction: 40, skillGap: 'Bio-mechanics info', transitionDifficulty: 'Medium', industryMapping: ['Gaming / VFX'], salaryDelta: '+40%', timeToTransition: '18 months' }],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2027, riskScore: 15, label: '+3yr' }],
    confidenceScore: 99,
  },
  ent_media_rights: {
    displayRole: 'Media Rights Manager',
    summary: 'Moderate resilience; high disruption in standard contract tracking.',
    skills: {
      obsolete: [{ skill: 'Standard usage-fee reconciliation', riskScore: 95, riskType: 'Automatable', horizon: '1styr', reason: 'Blockchain and AI automate rights tracking and micro-payments.', aiReplacement: 'Full' }],
      safe: [{ skill: 'IP Strategy & Franchise Negotiation', whySafe: 'Navigating the complex multi-party institutional interests of high-value IP.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Franchise Business Lead', riskReduction: 55, skillGap: 'Global finance info', transitionDifficulty: 'Hard', industryMapping: ['Studios'], salaryDelta: '+100%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2027, riskScore: 58, label: '+3yr' }],
    confidenceScore: 96,
  },
  ent_publicist: {
    displayRole: 'Publicist (Crisis/Celebrity)',
    summary: 'High resilience; trust, timing, and human influence.',
    skills: {
      safe: [{ skill: 'Crisis Media Mitigation', whySafe: 'Navigating high-stakes human scandals with human-to-human relationships.', longTermValue: 99, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Reputation Strategist', riskReduction: 45, skillGap: 'Social sentiment data info', transitionDifficulty: 'Medium', industryMapping: ['Corporate'], salaryDelta: '+50%', timeToTransition: '12 months' }],
    riskTrend: [{ year: 2024, riskScore: 15, label: 'Now' }, { year: 2027, riskScore: 25, label: '+3yr' }],
    confidenceScore: 98,
  },
  ent_game_narrative: {
    displayRole: 'Game Narrative Designer',
    summary: 'High resilience; designing the complex "Choice-based" narrative architecture.',
    skills: {
      safe: [{ skill: 'Player Agency Logic Synthesis', whySafe: 'Designing complex branching narratives that maintain thematic consistency.', longTermValue: 98, difficulty: 'High' }],
    },
    careerPaths: [{ role: 'Creative Director (Interactive)', riskReduction: 45, skillGap: 'Experience design info', transitionDifficulty: 'Hard', industryMapping: ['Metaverse / Tech'], salaryDelta: '+60%', timeToTransition: '36 months' }],
    riskTrend: [{ year: 2024, riskScore: 22, label: 'Now' }, { year: 2027, riskScore: 38, label: '+3yr' }],
    confidenceScore: 97,
  },
};
