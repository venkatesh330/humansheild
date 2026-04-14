// ═══════════════════════════════════════════════════════════════════════════════
// countryIntelligenceModifier.ts — Country-Aware Career Intelligence Layer
//
// Strategy: Sparse override pattern. We don't duplicate 500 role records per
// country. Instead, a lightweight function takes any base CareerIntelligence
// and applies a country-cluster-specific overlay — adding localized salary
// context, platform recommendations, risk modifiers, and market-specific advice.
//
// 6 Country Clusters:
//   south_asia   → India, Pakistan, Bangladesh, Sri Lanka, Nepal
//   north_america → USA, Canada
//   europe       → UK, Germany, France, Nordics, Central/Eastern Europe
//   gcc          → UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman
//   sea          → Singapore, Malaysia, Indonesia, Philippines, Vietnam, Thailand
//   east_asia    → China, Japan, South Korea, Taiwan, Hong Kong
//   latam        → Brazil, Mexico, Colombia, Argentina, Chile
//   africa       → South Africa, Nigeria, Kenya, Ghana, Egypt
//   oceania      → Australia, New Zealand
// ═══════════════════════════════════════════════════════════════════════════════

import { CareerIntelligence, CountryCluster, SafeSkill, CareerPath } from './types.ts';

// ── Country Key → Cluster Mapping ────────────────────────────────────────────
const COUNTRY_TO_CLUSTER: Record<string, CountryCluster> = {
  // South Asia
  india: 'south_asia', pakistan: 'south_asia', bangladesh: 'south_asia',
  srilanka: 'south_asia', nepal: 'south_asia',
  // North America
  usa: 'north_america', canada: 'north_america',
  // Europe
  uk: 'europe', germany: 'europe', france: 'europe', sweden: 'europe',
  norway: 'europe', denmark: 'europe', finland: 'europe', netherlands: 'europe',
  switzerland: 'europe', austria: 'europe', belgium: 'europe', ireland: 'europe',
  spain: 'europe', italy: 'europe', portugal: 'europe', poland: 'europe',
  czechia: 'europe', romania: 'europe', ukraine: 'europe', hungary: 'europe',
  estonia: 'europe', latvia: 'europe',
  // GCC
  uae: 'gcc', saudi: 'gcc', qatar: 'gcc', kuwait: 'gcc', bahrain: 'gcc', oman: 'gcc',
  // SEA
  singapore: 'sea', malaysia: 'sea', indonesia: 'sea', philippines: 'sea',
  vietnam: 'sea', thailand: 'sea', myanmar: 'sea', cambodia: 'sea',
  // East Asia
  china: 'east_asia', japan: 'east_asia', south_korea: 'east_asia',
  taiwan: 'east_asia', hong_kong: 'east_asia',
  // LATAM
  brazil: 'latam', mexico: 'latam', colombia: 'latam', argentina: 'latam',
  chile: 'latam', peru: 'latam',
  // Africa
  south_africa: 'africa', nigeria: 'africa', kenya: 'africa', ghana: 'africa',
  ethiopia: 'africa', morocco: 'africa', egypt: 'africa', jordan: 'africa',
  // Oceania
  australia: 'oceania', nz: 'oceania',
  // Turkey / Israel — defaulting to europe-adjacent
  turkey: 'europe', israel: 'europe',
  other: 'south_asia', // safe fallback
};

// ── Country-Specific Salary Bands ─────────────────────────────────────────────
const SALARY_CONTEXT: Record<CountryCluster, Record<string, string>> = {
  south_asia: {
    default: 'Salary range in India typically ₹3L–₹25L/yr for mid-level; senior roles at major MNCs reach ₹40–₹80L+.',
    tech: 'Tech salaries in India (Bangalore/Hyderabad/Pune): ₹8L–₹40L mid-level; FAANG-equivalent pay is ₹40L–₹1.5Cr+.',
    finance: 'Finance roles in India: ₹6L–₹30L mid-level; IB roles at top firms reach ₹25L–₹80L+.',
    healthcare: 'Indian healthcare: government doctors earn ₹80k–₹1.5L/month; private specialists 3–10× more.',
    legal: 'Lawyer salaries in India range ₹4L–₹20L in mid-tier firms; Magic Circle equivalents pay ₹30L–₹1Cr+.',
  },
  north_america: {
    default: 'Salary range in the US: $60k–$150k mid-level; senior/principal roles hit $150k–$400k+ in HCOL cities.',
    tech: 'US tech salaries: $120k–$250k mid-level IC; Staff/Principal at FAANG: $300k–$700k+ total comp.',
    finance: 'US finance: $80k–$150k associate level; VP/Director at BB banks: $200k–$500k+ all-in.',
    healthcare: 'US physicians earn $200k–$400k/yr; specialist surgeons commonly exceed $500k.',
    legal: 'BigLaw associates in NYC/SF earn $225k–$415k. In-house counsel: $150k–$350k.',
  },
  europe: {
    default: 'Salary range varies by country: UK £45k–£120k mid-level; Germany €55k–€130k; Nordics SEK500k–SEK900k.',
    tech: 'European tech: UK £80k–£180k senior; Germany €70k–€140k; Dutch Big Tech roles: €90k–€200k.',
    finance: 'European banking: UK £60k–£150k VP-level; Frankfurt roles: €70k–€140k.',
    healthcare: 'NHS consultants earn £88k–£120k; German specialists €80k–€150k; private sector adds 50%+.',
    legal: 'Magic Circle London: £100k–£160k associate; EU BigLaw: €90k–€140k.',
  },
  gcc: {
    default: 'GCC salaries are tax-free. Mid-level roles: AED 15k–40k/mo (UAE); SR 12k–35k/mo (KSA).',
    tech: 'UAE tech: AED 20k–60k/mo. Saudi Vision 2030 roles: SR 20k–50k/mo for senior tech.',
    finance: 'Dubai DIFC finance: AED 30k–80k/mo senior level. Saudi banking: SR 25k–60k/mo.',
    healthcare: 'GCC physician roles: AED 25k–60k/mo tax-free. High demand for specialists.',
    legal: 'DIFC legal roles: AED 30k–80k/mo. Saudi NEOM-adjacent roles: very high demand, premium pay.',
  },
  sea: {
    default: 'SEA salaries vary widely: Singapore SGD 5k–15k/mo; Philippines PHP 40k–120k/mo; Vietnam VND 20–80M/mo.',
    tech: 'Singapore tech hub: SGD 7k–20k/mo for senior engineers. SE tech (KL, Jakarta): $30k–$80k/yr USD equiv.',
    finance: 'Singapore finance: SGD 8k–25k/mo. Regional hubs command premium over local market.',
    healthcare: 'Singapore healthcare: SGD 8k–20k/mo for specialists. Private clinics pay premium.',
    legal: 'Singapore law: SGD 8k–20k/mo Senior Associate. Philippines law: PHP 60k–150k/mo.',
  },
  east_asia: {
    default: 'Japan: ¥5M–¥10M/yr mid-level; senior global roles ¥12M–¥25M. Korea: ₩60M–₩120M/yr mid; chaebol senior: ₩150M+.',
    tech: 'Japan tech: ¥5M–¥15M/yr; foreign firms in Tokyo pay 30–50% premium. Korea IT: ₩60M–₩150M/yr.',
    finance: 'Tokyo finance: ¥8M–¥20M/yr at Japanese banks; foreign banks 2–3×. Korea investment: ₩70M–₩200M/yr.',
    healthcare: 'Japan physician: ¥8M–¥15M/yr; specialists higher in private clinics.',
    legal: 'Japan lawyer: ¥8M–¥20M/yr at foreign firms. Korea: ₩80M–₩200M/yr.',
  },
  latam: {
    default: 'LATAM salaries: Brazil BRL 80k–200k/yr mid; Mexico MXN 200k–700k/yr; Colombia COP 80M–200M/yr.',
    tech: 'Brazilian tech in São Paulo: BRL 100k–300k/yr. Mexico City tech: MXN 300k–900k/yr. Remote USD-earning roles 3–5× local baseline.',
    finance: 'Brazil finance: BRL 100k–250k/yr for mid-senior. Investment banking in SP: BRL 200k–600k/yr.',
    healthcare: 'Brazil physicians: BRL 120k–350k/yr. Mexico: MXN 350k–800k/yr for specialists.',
    legal: 'Brazil BigLaw: BRL 150k–400k/yr. Mexico law: MXN 400k–1.2M/yr at top firms.',
  },
  africa: {
    default: 'African salaries: South Africa ZAR 400k–900k/yr mid; Nigeria NGN 5M–20M/yr; Kenya KES 1.5M–5M/yr.',
    tech: 'South Africa tech: ZAR 500k–1.2M/yr senior. Nigeria tech fintech: NGN 8M–30M/yr. Remote USD roles = 5–10× local.',
    finance: 'South Africa finance: ZAR 600k–1.5M/yr senior. Fintech Nigeria: NGN 10M–40M/yr.',
    healthcare: 'South Africa medical specialists: ZAR 1.5M–4M/yr private. Nigeria: varies widely by location.',
    legal: 'South Africa BigLaw: ZAR 500k–1.2M/yr. Nigeria law at multinational firms: NGN 10M–30M/yr.',
  },
  oceania: {
    default: 'Australia: AUD $80k–$160k mid-level; senior roles $150k–$280k. NZ: NZD $70k–$130k mid.',
    tech: 'Australian tech: AUD $100k–$200k+ senior. Sydney/Melbourne FAANG: AUD $200k–$400k total comp.',
    finance: 'Australia finance: AUD $100k–$200k+ VP level. Superannuation sector pays premium.',
    healthcare: 'Australian doctors: AUD $150k–$400k/yr. Specialists significantly higher.',
    legal: 'Australian BigLaw: AUD $100k–$220k senior associate level.',
  },
};

// ── Country-Specific Platform Recommendations ─────────────────────────────────
const PLATFORM_RECS: Record<CountryCluster, string[]> = {
  south_asia:   ['NPTEL (free certs)', 'Coursera India pricing', 'LinkedIn Learning', 'Naukri.com jobs', 'IIM-led executive programs', 'Apna.co', 'Internshala'],
  north_america: ['LinkedIn Premium', 'O*NET Career Explorer', 'Coursera', 'Udacity Nanodegrees', 'Indeed salary tracker', 'Glassdoor comp benchmarks', 'AngelList for startups'],
  europe:       ['Xing (DACH region)', 'TotaljobsUK', 'EURES job portal', 'Coursera EU pricing', 'Udemy Business', 'JobTeaser', 'Stepstone (Germany)'],
  gcc:          ['Bayt.com', 'GulfTalent', 'LinkedIn (MENA)', 'Coursera + Saudi Vision 2030 subsidies', 'KHDA approved certifications (UAE)', 'Tamheer program (KSA)'],
  sea:          ['JobStreet (SEA)', 'LinkedIn', 'Tech in Asia Jobs', 'Coursera ASEAN pricing', 'Glints (SEA)', 'Kalibrr (Philippines/Indonesia)', 'Internsg (Singapore)'],
  east_asia:    ['Rikunabi (Japan)', 'Wanted (Korea)', 'Boss直聘 (China)', '104 人力銀行 (Taiwan)', 'LinkedIn APAC', 'Coursera Japan/Korea', 'Hello Work (Japan govt)'],
  latam:        ['Bumeran', 'OCC Mundial (Mexico)', 'LinkedIn LATAM', 'Workana (freelance)', 'Geek Hunter (Brazil tech)', 'Coursera LATAM pricing'],
  africa:       ['LinkedIn Africa', 'Fuzu', 'Jobberman (Nigeria)', 'Careers24 (SA)', 'Brighter Monday (Kenya)', 'Coursera Africa pricing', 'ALX Africa programs'],
  oceania:      ['Seek.com.au', 'Trade Me Jobs (NZ)', 'LinkedIn Australia', 'SEEK Learning', 'ACS Career Hub', 'Graduate Careers Australia'],
};

// ── Country Risk Aggravators per Cluster ─────────────────────────────────────
const CLUSTER_RISK_CONTEXT: Record<CountryCluster, string> = {
  south_asia:   'India\'s BPO-heavy economy and large outsourcing sector creates compound displacement risk: AI first displaces offshore tasks, then compresses the talent pool. Upskilling velocity in India is among the world\'s fastest — those who adapt early gain significant competitive advantage over the large talent pool.',
  north_america: 'The US is the global AI adoption leader — enterprise AI deployment is fastest here. However, the strong tech hub ecosystem creates adjacent demand for AI-native roles, partially offsetting traditional displacement. Labor market flexibility means both rapid displacement and rapid pivot opportunity.',
  europe:       'Strong EU labor protection laws (Works Councils, notice periods) slow acute displacement but don\'t prevent gradual role erosion. The EU AI Act creates new compliance roles while regulating high-risk AI — net impact is moderate displacement in routine work, new demand in AI governance.',
  gcc:          'GCC countries are in an active AI investment phase — Vision 2030 (Saudi), UAE National AI Strategy, and Qatar\'s National Vision directly fund AI transformation. Expatriate roles face higher displacement risk than local Emiratization/Saudization-protected positions.',
  sea:          'Southeast Asia\'s high internet penetration and large young population creates both disruption and opportunity. Singapore is the AI hub, creating regional spillover demand. Philippines faces extreme BPO risk as conversational AI matures. Malaysia and Vietnam growing as tech alternatives.',
  east_asia:    'Japan faces unique dynamics: AI adoption is accelerating but lifetime employment culture slows visible displacement. Korea\'s chaebol-driven economy rapidly deploys AI in manufacturing and finance. China\'s domestic AI ecosystem (Baidu, Alibaba, ByteDance) creates both displacement and domestic AI opportunity.',
  latam:        'Brazil and Mexico are the primary LATAM AI adoption markets. Strong informality in labor markets means AI displacement may manifest as wage compression rather than outright job loss. Remote work revolution has opened USD-earning opportunities — hybrid earning strategies are highly effective.',
  africa:       'Africa\'s leapfrog technology pattern (mobile-first) positions it differently: AI adoption will likely bypass traditional digitization stages. South Africa has the most mature AI adoption; Nigeria and Kenya are fastest-growing. Remote work for international clients is a high-leverage pivot for skilled professionals.',
  oceania:      'Australia and NZ have high costs of living that make automation economically attractive to employers, accelerating local AI adoption. Strong immigration programs attract global AI talent, increasing competition. Mining, healthcare, and infrastructure are relatively protected sectors.',
};

// ── Localization Safe Skills (cluster-specific safe skills that any role benefits from) ──
const CLUSTER_UNIVERSAL_SAFE_SKILLS: Record<CountryCluster, SafeSkill> = {
  south_asia:   { skill: 'Cross-Cultural Remote Collaboration', whySafe: 'Managing distributed global teams across time zones is a uniquely Indian professional strength — AI cannot replicate this human bridge function.', longTermValue: 95, difficulty: 'Medium' },
  north_america: { skill: 'AI Product Strategy', whySafe: 'US market leadership in AI adoption creates strong demand for professionals who can translate AI capabilities into business strategy — a quintessentially human synthesis function.', longTermValue: 99, difficulty: 'High' },
  europe:       { skill: 'EU AI Act Compliance Navigation', whySafe: 'Designing AI governance frameworks under the EU Artificial Intelligence Act — a human interpretive and legal expertise role that will grow significantly through 2026-2028.', longTermValue: 98, difficulty: 'High' },
  gcc:          { skill: 'Vision 2030/AI Strategy Alignment', whySafe: 'Aligning organizational AI adoption with national AI strategies (Saudi / UAE) requires deep government–corporate relations expertise that is inherently human.', longTermValue: 97, difficulty: 'High' },
  sea:          { skill: 'ASEAN Digital Economy Navigation', whySafe: 'Leveraging the ASEAN tech ecosystem (Singapore as hub) for regional go-to-market and regulatory strategy requires local human knowledge networks.', longTermValue: 95, difficulty: 'Medium' },
  east_asia:    { skill: 'AI Localization & Cultural Adaptation', whySafe: 'Adapting AI products for East Asian markets (cultural nuance, regulatory, language) requires deep human cultural-technical synthesis that AI systems themselves cannot perform.', longTermValue: 97, difficulty: 'High' },
  latam:        { skill: 'Nearshore Tech Leadership', whySafe: 'Managing technical teams that serve US/EU clients from LATAM requires the trust, communication, and relationship skills that AI cannot replace.', longTermValue: 94, difficulty: 'Medium' },
  africa:       { skill: 'African Market Leapfrog Strategy', whySafe: 'Designing tech solutions that skip traditional infrastructure stages for Africa\'s mobile-native population requires deep local market knowledge AI systems lack.', longTermValue: 95, difficulty: 'Medium' },
  oceania:      { skill: 'APAC Regional Stakeholder Management', whySafe: 'Bridging the US/EU product ecosystem with APAC market requirements across diverse regulatory environments.', longTermValue: 94, difficulty: 'High' },
};

// ── Main Adapter Function ─────────────────────────────────────────────────────

export interface AdaptedCareerIntelligence extends CareerIntelligence {
  countryContext: {
    cluster: CountryCluster;
    countryKey: string;
    salaryContext: string;
    platformRecs: string[];
    riskContext: string;
    universalSafeSkill: SafeSkill;
  };
}

/**
 * Get the country cluster for a given country key.
 * Defaults to 'south_asia' for unknown keys (safe conservative fallback).
 */
export const getCountryCluster = (countryKey: string): CountryCluster => {
  return COUNTRY_TO_CLUSTER[countryKey] ?? 'south_asia';
};

/**
 * getCountryAdaptedIntelligence
 * Takes any base CareerIntelligence + a country key, and returns an
 * AdaptedCareerIntelligence with localized salary, platform, and risk overlays.
 *
 * This is the PRIMARY API for the country-aware intelligence system.
 * Use this instead of getCareerIntelligence() when country context is available.
 */
export const getCountryAdaptedIntelligence = (
  base: CareerIntelligence,
  countryKey: string,
  industry?: string,
): AdaptedCareerIntelligence => {
  const cluster = getCountryCluster(countryKey);

  // Determine industry category for salary context
  const indCategory = detectIndustryCategory(industry ?? '');
  const salaryContext = SALARY_CONTEXT[cluster][indCategory] ?? SALARY_CONTEXT[cluster]['default'];

  // Pull any sparse overrides from the base record's countryModifiers
  const override = base.countryModifiers?.[cluster];

  // Merge safe skills: base + cluster universal + optional override append
  const universalSafeSkill = CLUSTER_UNIVERSAL_SAFE_SKILLS[cluster];
  const mergedSafeSkills = [
    ...base.skills.safe,
    universalSafeSkill,
    ...(override?.safeSkillAppend ?? []),
  ];

  // Build merged summary
  const mergedSummary = override?.summaryAppend
    ? `${base.summary} ${override.summaryAppend}`
    : base.summary;

  // Build merged inaction scenario
  const mergedInaction = override?.inactionAppend && base.inactionScenario
    ? `${base.inactionScenario} ${override.inactionAppend}`
    : base.inactionScenario;

  return {
    ...base,
    summary: mergedSummary,
    inactionScenario: mergedInaction,
    skills: {
      ...base.skills,
      safe: mergedSafeSkills,
    },
    careerPaths: override?.careerPathOverride ?? base.careerPaths,
    countryContext: {
      cluster,
      countryKey,
      salaryContext,
      platformRecs: PLATFORM_RECS[cluster],
      riskContext: CLUSTER_RISK_CONTEXT[cluster],
      universalSafeSkill,
    },
  };
};

// ── Industry Category Detector ────────────────────────────────────────────────
function detectIndustryCategory(industry: string): string {
  const i = industry.toLowerCase();
  if (i.includes('tech') || i.includes('software') || i.includes('it_') || i.includes('ml') || i.includes('ai')) return 'tech';
  if (i.includes('finance') || i.includes('bank') || i.includes('invest') || i.includes('fin')) return 'finance';
  if (i.includes('health') || i.includes('medical') || i.includes('pharma') || i.includes('nurs')) return 'healthcare';
  if (i.includes('legal') || i.includes('law') || i.includes('leg_')) return 'legal';
  return 'default';
}
