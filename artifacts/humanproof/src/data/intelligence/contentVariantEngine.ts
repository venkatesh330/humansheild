// ═══════════════════════════════════════════════════════════════════════════════
// contentVariantEngine.ts — Anti-Repetition Intelligence Layer
//
// Strategy: Deterministic variant generation using a hash seed derived from
// roleKey + countryKey + experience. Same inputs ALWAYS return the same variant
// (stable, reproducible), but different inputs return genuinely different text.
//
// No AI calls. Pure static variant library with ~3–5 variants per content slot.
// This guarantees every result feels custom and fresh without backend overhead.
// ═══════════════════════════════════════════════════════════════════════════════

import { RoadmapAction } from './types.ts';

// ── Deterministic Seed Hash ────────────────────────────────────────────────────
/**
 * Generates a stable integer seed from a string.
 * DJB2 hash — fast, stable, well-distributed.
 */
export const seedHash = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
};

/**
 * Picks one item from an array using a deterministic seed.
 * Same seed + array always returns same item.
 */
export const pickVariant = <T>(arr: T[], seed: number): T => arr[seed % arr.length];

// ── Inaction Scenario Variants ─────────────────────────────────────────────────
const INACTION_VARIANTS_HIGH: string[] = [
  'Without pivoting in the next 12 months, your role faces direct elimination as companies adopt AI-first operations. REPLACE is not a metaphor — it is an active procurement decision happening now at Fortune 500 firms.',
  'The window for proactive transition is closing. Market data shows that professionals in this function who do not develop AI-native skills by 2026 will face 40–60% salary compression, not gradual displacement.',
  'This role is in the accelerating displacement zone. AI tools with enterprise-grade accuracy for this function are already deployed at scale. Waiting for the market to "settle" is itself the highest-risk strategy.',
  'Enterprises are actively replacing this function with AI systems at a rate that is outpacing individual re-skilling. The professional who acts now has a 12–18 month advantage over peers who wait.',
  'Early-movers who pivot to AI-augmented oversight versions of this role will command significant salary premiums. Late-movers will compete against both peers AND AI systems simultaneously.',
];

const INACTION_VARIANTS_MEDIUM: string[] = [
  'Your role is in the AI augmentation zone — the tools are not replacing you yet, but they are eroding the value of your current skill stack. Professionals who do not integrate AI tools into their workflow will face salary stagnation and lose ground to AI-native peers.',
  'The smart strategy is not to fear AI but to become the person who wields it. In 3–5 years, every role in your function will require AI fluency — those who build it now get to define the new standard rather than meet it.',
  'AI is not eliminating this role immediately — it is reshaping it. The professionals who survive and thrive will be those who shift from execution to oversight, from doing to directing, from following processes to designing them.',
  'Your window to future-proof is measured in months, not years. The professionals who are already integrating AI tools into their daily workflows are building a compounding competitive advantage over you.',
  'This function is undergoing a capability shift — AI handles the predictable, humans handle the novel. Your career strategy should reflect this reality: invest heavily in the uniquely human components of your work.',
];

const INACTION_VARIANTS_LOW: string[] = [
  'Your role has strong AI resilience today, but resilience is not permanence. The professionals who maintain their edge are those who continuously reinvest in both technical AI fluency and the human capabilities AI cannot replicate.',
  'Being AI-resistant today does not guarantee that status in 5 years. The field is evolving. Staying ahead requires proactive investment in the highest-value, hardest-to-replicate aspects of your expertise.',
  'You are in a defensible position, but not an impregnable one. The risk is not that AI replaces you — it is that AI-augmented competitors outperform you. Building AI literacy now is the strategic hedge.',
  'Low displacement risk is a positioning advantage, not a reason to be complacent. Use this window to compound your competitive moat: deepen expertise, expand your network, and develop the AI governance skills that command premium.',
  'Your role\'s resilience reflects genuine human irreplaceability. The strategic play is to document and amplify these human elements — making yourself the definitive expert in the aspects of your work that AI cannot touch.',
];

// ── Skill Risk Reason Variants ─────────────────────────────────────────────────
const SKILL_REASON_VARIANTS: Record<string, string[]> = {
  // For Automatable skills
  automatable: [
    'AI systems can now perform this task with accuracy exceeding senior human performance. Enterprise deployment is underway.',
    'Large language and specialized models have achieved production-grade capability for this task. Replacement is not theoretical — it is in progress.',
    'This capability has been commoditized by AI tooling. The market no longer pays a premium for human execution of this specific task.',
    'Automation has crossed the reliability threshold required for enterprise deployment. Human execution of this task is becoming the expensive exception, not the rule.',
    'The ROI math for AI replacement of this task is compelling and widely understood. Budget directors are actively replacing human headcount with SaaS AI subscriptions.',
  ],
  // For Augmented skills
  augmented: [
    'AI handles the routine sub-tasks within this skill, but human judgment remains essential for edge cases and high-stakes decisions.',
    'The execution layer of this skill is being automated. The strategy, context, and judgment layers remain human — but require active investment to maintain.',
    'AI augments performance in this domain significantly. Professionals who leverage AI for the routine components and focus human effort on the complex components will outperform those who do neither.',
    'This skill is transforming from an execution skill to an oversight skill. The value is shifting from "doing" to "directing and validating" — which requires a different muscle.',
    'Partial automation increases throughput requirements. Professionals in this area will need to manage AI outputs rather than produce them — a fundamentally different cognitive demand.',
  ],
  // For Safe skills
  safe: [
    'This skill requires the kind of non-linear human synthesis, contextual judgment, and embodied knowledge that current AI systems fundamentally lack.',
    'AI systems can approximate this skill in isolation, but not in the context of high-stakes, multi-variable, emotionally complex real-world situations.',
    'The value of this skill is inseparable from the human trust and relationship network that backs it. AI can simulate the output but cannot replicate the credibility.',
    'This represents an irreducibly human capability — requiring judgment developed over years of varied, high-stakes experience that cannot be distilled into training data.',
    'The liability, accountability, and relationship dimensions of this skill require human presence. AI systems cannot sign off on, be held responsible for, or build trust around these outcomes.',
  ],
};

// ── Roadmap Action Variants ────────────────────────────────────────────────────
const ACTION_OPENERS: string[] = [
  'Build your AI-native foundation:',
  'Execute this strategic move:',
  'Deploy this skill investment:',
  'Accelerate your transition:',
  'Capture competitive advantage:',
];

const OUTCOME_BOOSTERS: string[] = [
  'Creates immediate differentiation from AI-vulnerable peers.',
  'Positions you as a bridge between human judgment and AI capability.',
  'Compounds into a durable career moat over 2–3 years.',
  'Signals market-readiness to forward-thinking employers.',
  'Translates directly into salary negotiation leverage.',
];

// ── Summary Variant Prefixes ─────────────────────────────────────────────────────
const SUMMARY_PREFIXES: string[] = [
  'Intelligence Assessment:',
  'Risk Profile Analysis:',
  'AI Displacement Signal:',
  'Strategic Career Intelligence:',
  'Predictive Intelligence Report:',
  'Career Risk Analysis:',
];

// ── Context Tag Sets ────────────────────────────────────────────────────────────
export const CONTEXT_TAG_PRESETS: Record<string, string[]> = {
  high_risk:    ['critical-risk', 'accelerating', 'action-required', 'entry-sensitive'],
  medium_risk:  ['moderate-risk', 'augmentation-zone', 'pivot-window', 'skill-shift'],
  low_risk:     ['ai-resilient', 'compound-moat', 'human-centric', 'leadership-premium'],
  tech:         ['tech-sector', 'ai-augmented', 'platform-dependent', 'skill-velocity-high'],
  finance:      ['finance-sector', 'regulatory-moat', 'data-intensive', 'quantitative'],
  healthcare:   ['healthcare-sector', 'protected-by-law', 'human-touch', 'trust-critical'],
  legal:        ['legal-sector', 'liability-moat', 'relationship-intensive', 'interpretation-heavy'],
  creative:     ['creative-sector', 'originality-premium', 'audience-trust', 'style-moat'],
  industrial:   ['industrial-sector', 'physical-world', 'safety-critical', 'embodied-knowledge'],
  emerging:     ['emerging-role', 'ai-native', 'frontier-skill', 'high-demand'],
  entry_sensitive: ['entry-level-risk', 'experience-gap', 'portfolio-building', 'rapid-skill-build-required'],
  senior_protected: ['senior-moat', 'network-depth', 'leadership-premium', 'domain-authority'],
};

// ── Main Exports ──────────────────────────────────────────────────────────────

/**
 * Get a variant inaction scenario based on score level + deterministic seed.
 * Returns a different variant for each unique roleKey+countryKey+experience combo.
 */
export const getVariantInactionScenario = (
  baseScenario: string | undefined,
  score: number,
  roleKey: string,
  countryKey: string = 'usa',
  experience: string = '5-10',
): string => {
  const seed = seedHash(`${roleKey}:${countryKey}:${experience}`);

  if (score >= 70) {
    const variant = pickVariant(INACTION_VARIANTS_HIGH, seed);
    return baseScenario ? `${variant}\n\n${baseScenario}` : variant;
  } else if (score >= 40) {
    const variant = pickVariant(INACTION_VARIANTS_MEDIUM, seed);
    return baseScenario ? `${variant}\n\n${baseScenario}` : variant;
  } else {
    const variant = pickVariant(INACTION_VARIANTS_LOW, seed);
    return baseScenario ? `${variant}\n\n${baseScenario}` : variant;
  }
};

/**
 * Get a variant skill reason for a given skill risk type.
 * Deterministic: same skill + role + country = same variant.
 */
export const getVariantSkillReason = (
  baseReason: string,
  riskType: 'Automatable' | 'Augmented' | 'Safe' | string,
  skillName: string,
  roleKey: string,
): string => {
  const seed = seedHash(`${skillName}:${roleKey}`);
  const type = riskType === 'Automatable' ? 'automatable' :
               riskType === 'Augmented' ? 'augmented' : 'safe';
  const variants = SKILL_REASON_VARIANTS[type];
  const variant = pickVariant(variants, seed + 1);
  // Return blend: base reason first, then variant context
  return `${baseReason} ${variant}`;
};

/**
 * Get a variant roadmap action with enhanced opener/outcome phrasing.
 */
export const getVariantRoadmapAction = (
  base: RoadmapAction,
  seed: number,
): RoadmapAction => {
  const opener = pickVariant(ACTION_OPENERS, seed);
  const booster = pickVariant(OUTCOME_BOOSTERS, seed + 3);
  return {
    ...base,
    action: `${opener} ${base.action}`,
    outcome: `${base.outcome}. ${booster}`,
  };
};

/**
 * Get a variant summary prefix for display.
 */
export const getVariantSummaryPrefix = (roleKey: string, countryKey: string): string => {
  const seed = seedHash(`${roleKey}:${countryKey}:summary`);
  return pickVariant(SUMMARY_PREFIXES, seed);
};

/**
 * Build context tags for a role given score and industry context.
 * Used by the frontend to power filter/search/badge features.
 */
export const buildContextTags = (
  score: number,
  industryKey: string,
  existingTags: string[] = [],
): string[] => {
  const tags: string[] = [...existingTags];

  // Score-based tags
  if (score >= 70) tags.push(...CONTEXT_TAG_PRESETS.high_risk);
  else if (score >= 40) tags.push(...CONTEXT_TAG_PRESETS.medium_risk);
  else tags.push(...CONTEXT_TAG_PRESETS.low_risk);

  // Industry-based tags
  if (industryKey.startsWith('it_') || industryKey === 'fintech' || industryKey === 'it_ai_ml') tags.push(...CONTEXT_TAG_PRESETS.tech);
  if (['finance', 'investment', 'insurance'].includes(industryKey)) tags.push(...CONTEXT_TAG_PRESETS.finance);
  if (['healthcare', 'mental_health', 'nursing', 'pharma'].includes(industryKey)) tags.push(...CONTEXT_TAG_PRESETS.healthcare);
  if (['legal', 'consulting'].includes(industryKey)) tags.push(...CONTEXT_TAG_PRESETS.legal);
  if (['content', 'media', 'design', 'animation', 'music'].includes(industryKey)) tags.push(...CONTEXT_TAG_PRESETS.creative);
  if (['manufacturing', 'engineering', 'construction', 'energy', 'aerospace'].includes(industryKey)) tags.push(...CONTEXT_TAG_PRESETS.industrial);

  return [...new Set(tags)]; // dedupe
};
