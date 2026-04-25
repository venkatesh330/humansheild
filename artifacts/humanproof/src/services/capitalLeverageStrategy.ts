// capitalLeverageStrategy.ts
// Per-pillar capital leverage strategy — answers "what specifically should I do
// with my dominant capital type?" rather than a generic "leverage your strengths."
// Enhancement 8: strategy differentiates by which pillar is strongest AND weakest.

export interface CapitalPillars {
  networkCapital:    number; // 0–25
  knowledgeCapital:  number; // 0–25
  deliveryCapital:   number; // 0–25
  influenceCapital:  number; // 0–25
}

export interface LeverageStrategy {
  dominantPillar: 'network' | 'knowledge' | 'delivery' | 'influence' | 'balanced';
  gapPillar:      'network' | 'knowledge' | 'delivery' | 'influence' | 'balanced';
  headline:       string;
  specificAction: string;
  timeframe:      string; // "This week" | "7 days" | "30 days"
  proofPoint:     string; // measurable outcome
  gapWarning:     string; // what the weakest pillar costs you
}

// ── Strategy templates per dominant pillar ────────────────────────────────────

const NETWORK_STRATEGIES = {
  low:  {
    headline: "Your network capital is your foundation — activate it immediately",
    specificAction: "List your 10 most valuable professional contacts. Send one genuine reconnection message per day for the next 10 days. Not 'I'm looking for a job' — 'I'm thinking about X, would love your perspective.'",
    timeframe: "This week",
    proofPoint: "10 warm relationships reactivated within 2 weeks",
  },
  mid: {
    headline: "Your client and peer relationships are a competitive moat",
    specificAction: "Map your 5 strongest client relationships. Schedule one informal conversation with each in the next 30 days. Warm referrals close 6× faster than cold applications — activate this asset before any job search.",
    timeframe: "30 days",
    proofPoint: "5 relationship conversations + 2 referral conversations",
  },
  high: {
    headline: "Your network is exceptional — convert it to transition velocity",
    specificAction: "Identify the 2 people at your target company who made recent hiring decisions. Request 15-minute introductions via mutual connections. Your network is your bypass to the hiring queue.",
    timeframe: "7 days",
    proofPoint: "2 target company introductions secured",
  },
};

const KNOWLEDGE_STRATEGIES = {
  low: {
    headline: "Your domain expertise is your hidden asset — make it visible",
    specificAction: "Write one LinkedIn post this week documenting something you know that most people in your role don't. Doesn't need to be polished — specific and useful beats generic and perfect.",
    timeframe: "This week",
    proofPoint: "1 published proof of expertise (LinkedIn / article / GitHub)",
  },
  mid: {
    headline: "Knowledge hoarded privately is worth zero — publish it",
    specificAction: "Create one public artifact this month: an Architecture Decision Record, a 'lessons learned' post, or a short framework document from your domain experience. Published knowledge is a searchable asset that finds opportunities for you.",
    timeframe: "30 days",
    proofPoint: "1 public domain knowledge artifact produced",
  },
  high: {
    headline: "You have rare expertise — position yourself as the authority before AI commoditises the baseline",
    specificAction: "Submit one conference talk proposal or publish a detailed case study from your domain this month. Thought leaders get approached; they don't apply. Your deep knowledge is most valuable now while it's still differentiated.",
    timeframe: "30 days",
    proofPoint: "1 conference submission OR 1 detailed published case study",
  },
};

const DELIVERY_STRATEGIES = {
  low: {
    headline: "Your delivery track record is invisible — quantify it today",
    specificAction: "Write 3 impact bullets right now: 'I built/shipped/led X, which drove Y.' If you don't have Y (a measurable outcome), estimate conservatively. Unmeasured delivery is invisible to hiring managers.",
    timeframe: "Today",
    proofPoint: "3 quantified impact bullets written and added to CV",
  },
  mid: {
    headline: "Product delivery at scale is the rarest commodity in AI-era hiring",
    specificAction: "Update your CV and LinkedIn to lead with delivery metrics: revenue impacted, users served, team size led, timeline compressed. Hiring managers compare candidates by impact, not years. Your delivery record is your competitive moat.",
    timeframe: "This week",
    proofPoint: "CV updated with measurable outcomes on every role",
  },
  high: {
    headline: "You have shipped at scale — target roles where execution credibility is the barrier to entry",
    specificAction: "You qualify for senior IC, tech lead, or product roles where the hiring bar is 'can you actually ship?' Apply to roles one level above where you'd normally look. Your track record answers the hardest interview question before it's asked.",
    timeframe: "30 days",
    proofPoint: "3 applications to roles one level above previous target",
  },
};

const INFLUENCE_STRATEGIES = {
  low: {
    headline: "Publish consistently — influence compounds with time",
    specificAction: "Commit to one LinkedIn post per week for the next 4 weeks. Topic: something you learned this week in your domain. Consistency beats perfection. The first 4 posts build the habit; posts 20–40 build the reputation.",
    timeframe: "This week (start)",
    proofPoint: "4-week publishing streak established",
  },
  mid: {
    headline: "Your field credibility is real — amplify it before the transition",
    specificAction: "Submit one conference talk proposal this month. If conferences feel large, start with a company all-hands presentation or a webinar in your professional community. Visible expertise shortens job searches by 40%.",
    timeframe: "30 days",
    proofPoint: "1 conference or speaking submission made",
  },
  high: {
    headline: "Thought leaders get approached — activate your platform before you need it",
    specificAction: "Reach out to 3 people in adjacent roles who follow your work and ask: 'Who else should I be talking to?' Your influence network has a warm extension effect. The best roles are often filled before they're posted.",
    timeframe: "7 days",
    proofPoint: "3 warm introductions from your influence network",
  },
};

// ── Gap warnings per pillar ───────────────────────────────────────────────────

const GAP_WARNINGS: Record<string, string> = {
  network:   "Low network capital means cold applications are your primary channel — these close at 2% vs 67% for referrals. Building network takes time; start now.",
  knowledge: "Low knowledge capital means competitors with published expertise beat you on credibility even with equivalent skills. Fix this before the next transition.",
  delivery:  "Low delivery capital means hiring managers cannot verify your impact claims. Without measurable outcomes on your CV, you are competing on hope.",
  influence: "Low influence capital means you are invisible outside your current company. When you need to move, you will start from zero. Build a small audience now.",
  balanced:  "Your capital is evenly distributed. Strengthen all pillars together — small consistent improvements in each compound faster than big efforts in one.",
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Personalization 2 (v4.0): Detect when a dominant pillar can't be activated
 * because a critical supporting pillar is too weak.
 *
 * Returns a Phase 0 prerequisite when the gap between dominant and weakest
 * pillar exceeds 15 points. This prerequisite must complete before Phase 1.
 *
 * Example: Network Capital 24/25, Knowledge Capital 3/25 →
 *   "Build one public proof point before activating your network —
 *    your contacts can't refer you without something concrete to share."
 */
export interface PillarPrerequisite {
  isRequired: boolean;
  dominantPillar: string;
  weakPillar: string;
  title: string;
  reason: string;
  action: string;
  weekRange: string;
}

export function getPillarPrerequisite(pillars: CapitalPillars): PillarPrerequisite {
  const pillarValues = [
    { name: 'network', label: 'Network Capital', value: pillars.networkCapital },
    { name: 'knowledge', label: 'Knowledge Capital', value: pillars.knowledgeCapital },
    { name: 'delivery', label: 'Delivery Capital', value: pillars.deliveryCapital },
    { name: 'influence', label: 'Influence Capital', value: pillars.influenceCapital },
  ];

  const maxVal = Math.max(...pillarValues.map(p => p.value));
  const minVal = Math.min(...pillarValues.map(p => p.value));
  const dominant = pillarValues.find(p => p.value === maxVal)!;
  const weak = pillarValues.find(p => p.value === minVal)!;

  const gap = maxVal - minVal;
  if (gap <= 15) {
    return { isRequired: false, dominantPillar: dominant.name, weakPillar: weak.name, title: '', reason: '', action: '', weekRange: '' };
  }

  // Specific blocking combinations
  if (dominant.name === 'network' && weak.name === 'knowledge') {
    return {
      isRequired: true,
      dominantPillar: 'network',
      weakPillar: 'knowledge',
      title: 'Build One Public Proof Point Before Activating Your Network',
      reason: `Your Network Capital (${dominant.value}/25) is strong, but your Knowledge Capital (${weak.value}/25) creates a critical gap. Your contacts can't refer you without something concrete to share — and cold referrals from strong networks convert at less than 10% without visible proof of expertise.`,
      action: 'This week: publish one LinkedIn article, push one GitHub project, or write one internal case study on a real problem you solved. Give your network something concrete to share.',
      weekRange: 'Phase 0 — Before Week 1',
    };
  }

  if (dominant.name === 'delivery' && weak.name === 'network') {
    return {
      isRequired: true,
      dominantPillar: 'delivery',
      weakPillar: 'network',
      title: 'Quantify Your Delivery Record Before Outreach',
      reason: `Your Delivery Capital (${dominant.value}/25) is strong, but your Network Capital (${weak.value}/25) means you'll need to rely on cold applications. Cold applications convert at 2% — quantified delivery credentials are your primary lever. Without measurable outcomes on your CV, even excellent delivery history is invisible.`,
      action: 'Before any outreach: write 3 impact bullets for each of your last 2 roles: "I shipped X, which drove Y (measured)." This transforms every application from credential-matching to impact demonstration.',
      weekRange: 'Phase 0 — Before Week 1',
    };
  }

  if (dominant.name === 'knowledge' && weak.name === 'network') {
    return {
      isRequired: true,
      dominantPillar: 'knowledge',
      weakPillar: 'network',
      title: 'Publish Before You Network — Cold Outreach Without Visible Expertise Converts at <2%',
      reason: `Your Knowledge Capital (${dominant.value}/25) is strong, but your Network Capital (${weak.value}/25) means cold outreach is your only channel. Publishing your expertise first creates something to reference in outreach — converting a cold message into "I thought of you when I wrote this" drastically improves response rates.`,
      action: 'Publish 2–3 pieces on your domain expertise this week before contacting anyone. Then send each piece personally to the 3 most relevant contacts in your network.',
      weekRange: 'Phase 0 — Before Week 1',
    };
  }

  // Generic imbalance
  return {
    isRequired: true,
    dominantPillar: dominant.name,
    weakPillar: weak.name,
    title: `Address ${weak.label} Gap Before Leveraging ${dominant.label}`,
    reason: `Your ${dominant.label} (${dominant.value}/25) is your primary asset, but the gap to ${weak.label} (${weak.value}/25) of ${gap} points creates a vulnerability. This imbalance means your primary asset cannot be fully activated without addressing the weakest pillar first.`,
    action: `Spend 3 days this week identifying the 2 highest-ROI actions to improve ${weak.label}. Complete at least one before proceeding to Phase 1.`,
    weekRange: 'Phase 0 — Before Week 1',
  };
}

export function getCapitalStrategy(pillars: CapitalPillars): LeverageStrategy {
  const { networkCapital, knowledgeCapital, deliveryCapital, influenceCapital } = pillars;
  const total = networkCapital + knowledgeCapital + deliveryCapital + influenceCapital;

  // Identify dominant and gap pillars
  const pillarValues = [
    { name: 'network'   as const, value: networkCapital },
    { name: 'knowledge' as const, value: knowledgeCapital },
    { name: 'delivery'  as const, value: deliveryCapital },
    { name: 'influence' as const, value: influenceCapital },
  ];

  const maxVal = Math.max(...pillarValues.map(p => p.value));
  const minVal = Math.min(...pillarValues.map(p => p.value));
  const dominant = pillarValues.find(p => p.value === maxVal);
  const gap      = pillarValues.find(p => p.value === minVal);

  // Balanced check: all pillars within 5 points of each other
  const isBalanced = maxVal - minVal <= 5;
  const dominantPillar = isBalanced ? 'balanced' : (dominant?.name ?? 'balanced');
  const gapPillar      = gap?.name ?? 'balanced';

  // Determine score bracket for template selection
  const bracket: 'low' | 'mid' | 'high' = maxVal <= 8 ? 'low' : maxVal <= 18 ? 'mid' : 'high';

  let template: { headline: string; specificAction: string; timeframe: string; proofPoint: string };

  if (isBalanced || dominantPillar === 'balanced') {
    template = {
      headline:       "Your capital is evenly distributed — strengthen all pillars with small consistent investments",
      specificAction: "Each week: publish one piece of knowledge (LinkedIn), reach out to one warm contact, and add one measurable metric to your CV. Small weekly habits in all four pillars compound into significant differentiation within 90 days.",
      timeframe:      "This week (ongoing)",
      proofPoint:     "4-week habit established: 1 publish + 1 contact + 1 CV update per week",
    };
  } else {
    const templates = {
      network:   NETWORK_STRATEGIES,
      knowledge: KNOWLEDGE_STRATEGIES,
      delivery:  DELIVERY_STRATEGIES,
      influence: INFLUENCE_STRATEGIES,
    };
    template = (templates[dominantPillar] as any)?.[bracket] ?? NETWORK_STRATEGIES.mid;
  }

  return {
    dominantPillar,
    gapPillar,
    headline:       template.headline,
    specificAction: template.specificAction,
    timeframe:      template.timeframe,
    proofPoint:     template.proofPoint,
    gapWarning:     GAP_WARNINGS[gapPillar] ?? GAP_WARNINGS.balanced,
  };
}
