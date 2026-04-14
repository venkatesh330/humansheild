// ═══════════════════════════════════════════════════════════════════════════════
// services_retail.ts — Retail, Consumer & Hospitality Intelligence Module
// 18 unique roles — zero cross-module data repetition
// ═══════════════════════════════════════════════════════════════════════════════
import { CareerIntelligence } from './types.ts';

export const SERVICES_RETAIL_INTELLIGENCE: Record<string, CareerIntelligence> = {
  ret_store_manager: {
    displayRole: 'Retail Store Manager',
    summary: 'Moderate resilience; human team leadership and in-store experiential management survive; administrative tasks do not.',
    skills: {
      obsolete: [
        { skill: 'Manual inventory counting and stock reconciliation', riskScore: 99, riskType: 'Automatable', horizon: '1yr', reason: 'Computer vision and RFID systems perform real-time inventory tracking with near-perfect accuracy.', aiReplacement: 'Full' },
        { skill: 'Standard shift scheduling based on traffic patterns', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI scheduling systems optimize shift allocation using footfall forecasts, employee preferences, and labor law.', aiReplacement: 'Full' },
      ],
      at_risk: [{ "skill": "Standard customer complaint category analysis from loyalty system feedback", "riskScore": 76, "riskType": "Augmented", "horizon": "2yr", "reason": "AI retail analytics platforms auto-theme customer complaints from loyalty and review data.", "aiReplacement": "Partial" }],
      safe: [
        { skill: 'Frontline Team Coaching & Retention', whySafe: 'Keeping a team of human retail staff motivated, growing, and choosing to stay — especially in high-turnover retail environments — requires irreducible human leadership.', longTermValue: 96, difficulty: 'High' },
        { skill: 'Complex Customer Recovery & Conflict Resolution', whySafe: 'Handling upset or unreasonable customers — especially in high-stakes situations (theft, accidents, returns disputes) — requires in-person human judgment and de-escalation skills.', longTermValue: 97, difficulty: 'Medium' },
      ],
    },
    careerPaths: [
      { role: 'District / Regional Retail Director', riskReduction: 42, skillGap: 'Multi-unit P&L management, Retail analytics platforms, Territory talent development', transitionDifficulty: 'Medium', industryMapping: ['Multi-location Retail', 'QSR Chains'], salaryDelta: '+30-80%', timeToTransition: '18 months' },
    ],
    riskTrend: [{ year: 2024, riskScore: 32, label: 'Now' }, { year: 2025, riskScore: 40, label: '+1yr' }, { year: 2026, riskScore: 48, label: '+2yr' }, { year: 2027, riskScore: 55, label: '+3yr' }, { year: 2028, riskScore: 62, label: '+4yr' }],
    confidenceScore: 94,
    contextTags: ['retail', 'moderate-risk', 'human-touch', 'frontline-leadership'],
    evolutionHorizon: '2027',
  },

  ret_ecommerce_mgr: {
    displayRole: 'E-Commerce Manager',
    summary: 'Moderate resilience; strategy and customer journey design survive; execution tasks are rapidly automated.',
    skills: {
      obsolete: [
        { skill: 'Standard product description and listing copywriting', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI generates SEO-optimized product descriptions from specifications instantly at scale.', aiReplacement: 'Full' },
        { skill: 'Routine A/B test design for standard page elements', riskScore: 85, riskType: 'Automatable', horizon: '2yr', reason: 'AI optimization platforms (Adobe Target, Optimizely AI) run and interpret A/B tests autonomously.', aiReplacement: 'Full' },
      ],
      at_risk: [{ skill: 'Standard paid search campaign management', riskScore: 88, riskType: 'Automatable', horizon: '1yr', reason: 'Google Performance Max and Meta Advantage+ handle bidding, targeting, and creative selection automatically.', aiReplacement: 'Partial' }],
      safe: [
        { skill: 'Customer Journey Strategic Architecture', whySafe: 'Designing the complete cross-channel path to purchase — identifying psychological friction points, emotional triggers, and channel sequencing — requires human consumer psychology expertise.', longTermValue: 97, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'VP of Digital Commerce', riskReduction: 42, skillGap: 'P&L ownership, Omnichannel integration strategy, Marketplace architecture', transitionDifficulty: 'Hard', industryMapping: ['DTC Brands', 'Retail Chains', 'CPG'], salaryDelta: '+40-100%', timeToTransition: '24 months' },
    ],
    riskTrend: [{ year: 2024, riskScore: 42, label: 'Now' }, { year: 2025, riskScore: 52, label: '+1yr' }, { year: 2026, riskScore: 62, label: '+2yr' }, { year: 2027, riskScore: 70, label: '+3yr' }, { year: 2028, riskScore: 76, label: '+4yr' }],
    confidenceScore: 95,
    contextTags: ['retail', 'moderate-risk', 'digital-commerce', 'automation-zone'],
    evolutionHorizon: '2026',
  },

  ret_chef_exec: {
    displayRole: 'Executive Chef / Head Chef',
    summary: 'Very high resilience; culinary creativity, kitchen leadership, and sensory mastery are physical-world human functions.',
    skills: {
      obsolete: [{ "skill": "Manual weekly ingredient ordering based on forecasted covers in spreadsheets", "riskScore": 90, "riskType": "Automatable", "horizon": "1yr", "reason": "AI restaurant management platforms auto-generate ingredient purchase orders from reservation data and recipe yield models.", "aiReplacement": "Full" }],
      at_risk: [{ skill: 'Standard recipe costing and nutritional analysis', riskScore: 82, riskType: 'Automatable', horizon: '1yr', reason: 'AI recipe management systems auto-calculate costs, nutrition, and scaling for any yield.', aiReplacement: 'Partial' }],
      safe: [
        { skill: 'Sensory Creativity & Flavor Architecture', whySafe: 'Developing novel flavor combinations that produce unexpected emotional experiences — the true creative act of haute cuisine — requires human embodied sensory experience and cultural food memory.', longTermValue: 99, difficulty: 'Very High' },
        { skill: 'Kitchen Team Leadership Under Service Pressure', whySafe: 'Orchestrating 20+ people in a 100% physical, high-speed, high-stress environment — where timing, quality, and human coordination are simultaneous — is irreducibly human.', longTermValue: 98, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Culinary Entrepreneur / Restaurant Group Founder', riskReduction: 30, skillGap: 'Restaurant finance, Concept development, Real estate selection, Hospitality brand building', transitionDifficulty: 'Hard', industryMapping: ['Hospitality', 'Food & Beverage'], salaryDelta: '+Equity upside unlimited', timeToTransition: '12 months' },
    ],
    riskTrend: [{ year: 2024, riskScore: 8, label: 'Now' }, { year: 2026, riskScore: 9, label: '+2yr' }, { year: 2027, riskScore: 10, label: '+3yr' }, { year: 2028, riskScore: 11, label: '+4yr' }, { year: 2029, riskScore: 12, label: '+5yr' }],
    confidenceScore: 99,
    contextTags: ['retail', 'hospitality', 'ai-resilient', 'physical-world', 'human-touch', 'sensory-craft'],
  },

  ret_hotel_gm: {
    displayRole: 'Hotel General Manager',
    summary: 'High resilience; multi-departmental human operations leadership with brand accountability cannot be automated.',
    skills: {
      obsolete: [{ "skill": "Manual daily revenue variance investigation from individual departmental reports", "riskScore": 90, "riskType": "Automatable", "horizon": "1yr", "reason": "AI hotel analytics platforms auto-investigate revenue variances and surface root-cause flags across all departments.", "aiReplacement": "Full" }],
      at_risk: [{ skill: 'Standard dynamic pricing and revenue management', riskScore: 92, riskType: 'Automatable', horizon: '1yr', reason: 'AI revenue management systems (IDeaS, Duetto) optimize pricing dynamically with greater accuracy than human RevManagers.', aiReplacement: 'Partial' }],
      safe: [
        { skill: 'Guest Experience Design & Recovery', whySafe: 'Designing and delivering the emotional journey of a hotel stay — and personally resolving high-stakes guest complaints — requires human hospitality instinct and presence.', longTermValue: 98, difficulty: 'High' },
        { skill: 'Cross-Department P&L Coordination', whySafe: 'Simultaneously optimizing rooms, F&B, spa, events, and labor — while managing brand standards, owner relationships, and staff morale — requires integrated human business judgment.', longTermValue: 97, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'VP of Hotel Operations / Regional Director', riskReduction: 35, skillGap: 'Multi-property oversight, Owner/investor relations, Asset management basics', transitionDifficulty: 'Hard', industryMapping: ['Hotel Groups', 'Luxury Hospitality'], salaryDelta: '+40-100%', timeToTransition: '24 months' },
    ],
    riskTrend: [{ year: 2024, riskScore: 12, label: 'Now' }, { year: 2026, riskScore: 13, label: '+2yr' }, { year: 2027, riskScore: 15, label: '+3yr' }, { year: 2028, riskScore: 17, label: '+4yr' }, { year: 2029, riskScore: 18, label: '+5yr' }],
    confidenceScore: 97,
    contextTags: ['retail', 'hospitality', 'ai-resilient', 'leadership-premium', 'human-touch'],
  },

  ret_buyer_fashion: {
    displayRole: 'Fashion/Retail Buyer',
    summary: 'Moderate disruption; trend data processing is automated, but cultural taste judgment and vendor negotiation survive.',
    skills: {
      obsolete: [{ skill: 'Standard OTB (Open-to-Buy) budget calculation', riskScore: 95, riskType: 'Automatable', horizon: '1yr', reason: 'AI demand forecasting platforms auto-generate OTB recommendations from sell-through data.', aiReplacement: 'Full' }],
      at_risk: [{ skill: 'Standard trend report synthesis', riskScore: 80, riskType: 'Augmented', horizon: '2yr', reason: 'AI trend analysis tools synthesize global runway, social media, and search data into trend forecasts.', aiReplacement: 'Partial' }],
      safe: [
        { skill: 'Cultural Micro-Trend Identification', whySafe: 'Recognizing the emerging cultural micro-trends from street style, subcultures, and global signals — before they appear in data — requires human cultural immersion and taste.', longTermValue: 97, difficulty: 'High' },
        { skill: 'Vendor Negotiation & Relationship Management', whySafe: 'Negotiating terms, exclusives, collaboration deals, and supply priorities with brand executives over long-term business relationships is irreducibly human.', longTermValue: 96, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Chief Merchandising Officer (CMO)', riskReduction: 38, skillGap: 'Full P&L responsibility, Cross-category portfolio strategy, Brand licensing', transitionDifficulty: 'Hard', industryMapping: ['Department Stores', 'DTC Fashion', 'Luxury'], salaryDelta: '+60-150%', timeToTransition: '36 months' },
    ],
    riskTrend: [{ year: 2024, riskScore: 38, label: 'Now' }, { year: 2025, riskScore: 48, label: '+1yr' }, { year: 2026, riskScore: 57, label: '+2yr' }, { year: 2027, riskScore: 64, label: '+3yr' }, { year: 2028, riskScore: 70, label: '+4yr' }],
    confidenceScore: 94,
    contextTags: ['retail', 'moderate-risk', 'fashion', 'trend-intelligence', 'pivot-window'],
    evolutionHorizon: '2027',
  },

  ret_supply_chain_dir: {
    displayRole: 'Retail Supply Chain Director',
    summary: 'Moderate resilience; routine optimization is automated, but strategic resilience and supplier relationship management survive.',
    skills: {
      obsolete: [
        { skill: 'Manual reorder point calculations and safety stock setting', riskScore: 98, riskType: 'Automatable', horizon: '1yr', reason: 'AI demand planning systems (Blue Yonder, o9) dynamically calculate reorder points in real-time from live data.', aiReplacement: 'Full' },
      ],
      at_risk: [{ skill: 'Standard carrier rate negotiation (commodity freight)', riskScore: 75, riskType: 'Augmented', horizon: '2yr', reason: 'AI freight marketplaces auto-negotiate commodity freight rates using dynamic bidding.', aiReplacement: 'Partial' }],
      safe: [
        { skill: 'Supply Chain Resilience Architecture', whySafe: 'Designing dual-source strategies, nearshoring plans, and disruption response playbooks — especially in the context of geopolitical risk — requires strategic human judgment and supplier trust relationships.', longTermValue: 99, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Chief Supply Chain Officer (CSCO)', riskReduction: 30, skillGap: 'Board-level risk communication, M&A supply chain integration, ESG supply chain strategy', transitionDifficulty: 'Hard', industryMapping: ['Retail Chains', 'CPG', 'eCommerce Platforms'], salaryDelta: '+50-120%', timeToTransition: '36 months' },
    ],
    riskTrend: [{ year: 2024, riskScore: 28, label: 'Now' }, { year: 2025, riskScore: 35, label: '+1yr' }, { year: 2026, riskScore: 42, label: '+2yr' }, { year: 2027, riskScore: 50, label: '+3yr' }, { year: 2028, riskScore: 57, label: '+4yr' }],
    confidenceScore: 95,
    contextTags: ['retail', 'moderate-risk', 'supply-chain', 'automation-zone'],
    evolutionHorizon: '2027',
  },

  ret_real_estate_agent: {
    displayRole: 'Real Estate Agent / Realtor',
    summary: 'Moderate resilience; property search is fully automated, but negotiation, trust, and human decision support are durable.',
    skills: {
      obsolete: [
        { skill: 'Standard property search and listing curation', riskScore: 99, riskType: 'Automatable', horizon: '1yr', reason: 'AI property platforms (Zillow AI, Rightmove AI) auto-match buyers with relevant listings.', aiReplacement: 'Full' },
        { skill: 'Standard comparative market analysis (CMA) report generation', riskScore: 96, riskType: 'Automatable', horizon: '1yr', reason: 'AI valuation engines generate complete CMA reports from property data instantly.', aiReplacement: 'Full' },
      ],
      at_risk: [{ "skill": "Standard mortgage affordability pre-qualification estimate for buyer clients", "riskScore": 78, "riskType": "Augmented", "horizon": "1yr", "reason": "AI mortgage tools automatically estimate borrower pre-qualification ranges from income inputs.", "aiReplacement": "Partial" }],
      safe: [
        { skill: 'High-Stakes Negotiation Psychology', whySafe: 'Negotiating a property deal at the emotional peak of both buyer and seller — reading signals, finding creative solutions, and managing the human psychology of the largest financial transaction of their lives.', longTermValue: 97, difficulty: 'High' },
        { skill: 'Neighbourhood & Life-Stage Advisory Intelligence', whySafe: 'Understanding which micro-neighbourhood fits a specific family\'s life stage, values, and long-term trajectory — the deeply personal career advisory layer — requires human empathy and local knowledge.', longTermValue: 95, difficulty: 'Medium' },
      ],
    },
    careerPaths: [
      { role: 'Luxury Property Advisor / Developer Partner', riskReduction: 48, skillGap: 'HNW client advisory, Development project sales, Asset management basics', transitionDifficulty: 'Medium', industryMapping: ['Luxury Real Estate', 'Property Development'], salaryDelta: '+100-400%', timeToTransition: '24 months' },
    ],
    inactionScenario: 'Transactional agents who compete on property search and CMA reports will be disintermediated by platforms by 2026. The survivable position is high-trust, high-complexity advisory.',
    riskTrend: [{ year: 2024, riskScore: 45, label: 'Now' }, { year: 2025, riskScore: 55, label: '+1yr' }, { year: 2026, riskScore: 64, label: '+2yr' }, { year: 2027, riskScore: 72, label: '+3yr' }, { year: 2028, riskScore: 78, label: '+4yr' }],
    confidenceScore: 95,
    contextTags: ['retail', 'real-estate', 'high-risk', 'action-required', 'pivot-window'],
    evolutionHorizon: '2026',
  },

  ret_luxury_advisor: {
    displayRole: 'Luxury Retail Client Advisor (High-End)',
    summary: 'Very high resilience; the human luxury experience is itself the product.',
    skills: {
      obsolete: [{ "skill": "Manual seasonal product knowledge briefing note preparation for client visits", "riskScore": 88, "riskType": "Automatable", "horizon": "1yr", "reason": "AI CRM tools auto-generate client-specific seasonal product briefs from purchase history and new collection data.", "aiReplacement": "Full" }],
      at_risk: [{ "skill": "Standard client birthday and anniversary gifting programme coordination", "riskScore": 72, "riskType": "Augmented", "horizon": "2yr", "reason": "AI loyalty platforms auto-trigger personalised gifting programmes from client milestone dates.", "aiReplacement": "Partial" }],
      safe: [
        { skill: 'HNW Client Relationship Architecture', whySafe: 'Building the multi-year personal trust relationships that motivate a client spending $50,000+ per transaction to call you first — requires irreducible human social intelligence.', longTermValue: 99, difficulty: 'Very High' },
        { skill: 'Luxury Taste Curation & Personal Styling', whySafe: 'Advising a client on a bespoke purchase that expresses their identity, status, and aesthetic values — a deeply personal human dialogue — cannot be replicated by AI.', longTermValue: 98, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Private Client Director (Luxury Maison)', riskReduction: 15, skillGap: 'HNW client portfolio management, Private event design, Brand ambassador depth', transitionDifficulty: 'Hard', industryMapping: ['LVMH', 'Richemont', 'Kering Groups'], salaryDelta: '+100-300%', timeToTransition: '36 months' },
    ],
    riskTrend: [{ year: 2024, riskScore: 5, label: 'Now' }, { year: 2026, riskScore: 5, label: '+2yr' }, { year: 2027, riskScore: 6, label: '+3yr' }, { year: 2028, riskScore: 7, label: '+4yr' }, { year: 2029, riskScore: 8, label: '+5yr' }],
    confidenceScore: 99,
    contextTags: ['retail', 'irreplaceable', 'luxury', 'human-touch', 'trust-critical'],
  },
};
