// strategyArchetypes.ts
// Intelligence Upgrade 3 — v4.0
// Career capital × experience → 4 strategy archetypes.
//
// These 4 playbooks supersede the bracket-based 3-phase roadmap structure
// when triggered. They produce fundamentally different strategies, not
// content variations inside the same template.
//
// The 4 archetypes:
//   LEVERAGE   — 10+ yr exp, network capital ≥ 18/25
//   PLATFORM   — 10+ yr exp, knowledge capital ≥ 18/25, network < 12
//   AUGMENT    — 5-10 yr exp, D3 augmentation potential > 0.65
//   RESKILL    — any exp, capital total < 25 (Foundation tier)
//              OR exp > 10 yr AND capital total < 35

import type { CapitalPillars } from './capitalLeverageStrategy';

export type StrategyArchetype = 'LEVERAGE' | 'PLATFORM' | 'AUGMENT' | 'RESKILL' | null;

export interface ArchetypeResult {
  archetype: StrategyArchetype;
  headline: string;
  /** Phase 0 prerequisite — must complete before other phases */
  phase0?: {
    title: string;
    actions: string[];
    milestone: string;
    weekRange: string;
  };
  phases: {
    phase: number;
    title: string;
    weekRange: string;
    focus: string;
    actions: string[];
    milestone: string;
  }[];
  whyThisArchetype: string;
}

export function selectStrategyArchetype(
  experienceYears: number,
  capitalPillars: CapitalPillars,
  capitalTotal: number,
  /** D3 augmentation risk score 0–1 (higher = LOWER augmentation potential) */
  augmentationRiskScore?: number,
): StrategyArchetype {
  const { networkCapital, knowledgeCapital } = capitalPillars;

  // LEVERAGE: long experience + strong network = activate relationships first
  if (experienceYears >= 10 && networkCapital >= 18) return 'LEVERAGE';

  // PLATFORM: long experience + deep knowledge but weak network
  if (experienceYears >= 10 && knowledgeCapital >= 18 && networkCapital < 12) return 'PLATFORM';

  // AUGMENT: mid-career with high augmentation potential
  // augmentationRiskScore < 0.35 means augmentation is HIGH (role benefits from AI)
  const augmentationPotentialHigh = augmentationRiskScore !== undefined && augmentationRiskScore < 0.35;
  if (experienceYears >= 5 && experienceYears < 10 && augmentationPotentialHigh) return 'AUGMENT';

  // RESKILL: limited capital regardless of experience
  if (capitalTotal < 25) return 'RESKILL';
  if (experienceYears > 10 && capitalTotal < 35) return 'RESKILL';

  // No archetype triggered — use standard bracket roadmap
  return null;
}

export function buildArchetypeRoadmap(
  archetype: StrategyArchetype,
  roleDisplayName: string,
  capitalPillars: CapitalPillars,
  experienceYears: number,
): ArchetypeResult {
  switch (archetype) {
    case 'LEVERAGE':
      return {
        archetype: 'LEVERAGE',
        headline: 'Leverage your network — warm relationships close 6× faster than cold applications',
        whyThisArchetype: `With ${experienceYears}+ years of experience and strong network capital (${capitalPillars.networkCapital}/25), your primary asset is the trust accumulated through professional relationships. The most efficient path is activating this network, not building new skills from scratch.`,
        phase0: {
          title: 'Map Your Network Value',
          weekRange: 'Before Phase 1',
          actions: [
            'List your 10 highest-value professional relationships (decision-makers, clients, peers who have hired)',
            'For each: what do they value about you? What roles could they refer you for?',
            'Identify the 2–3 people most likely to accelerate your transition with one conversation',
          ],
          milestone: 'Network map complete with 10 contacts ranked by transition value',
        },
        phases: [
          {
            phase: 1,
            title: 'Activate Relationships',
            weekRange: 'Weeks 1–3',
            focus: 'Genuine reconnection — not job-asking',
            actions: [
              'Contact your top 5 network relationships with a specific, genuine ask for a 15-minute conversation',
              'Do NOT lead with "I am looking for a job" — lead with "I am thinking about X, your perspective would be valuable"',
              'One relationship conversation per day for 3 weeks — 15 conversations minimum',
            ],
            milestone: '15 warm conversations completed; 3+ referral conversations identified',
          },
          {
            phase: 2,
            title: 'Create a Shareable Proof Point',
            weekRange: 'Weeks 4–8',
            focus: 'Give your network something concrete to share about you',
            actions: [
              'Publish one visible artifact: LinkedIn article, GitHub project, or conference talk on your domain expertise',
              'Frame it as "here is what I know about [specific domain problem]" — not as a portfolio',
              'Send it personally to your top 5 network contacts with a specific note about why they would find it relevant',
            ],
            milestone: '1 published proof point with 500+ views or 10+ shares',
          },
          {
            phase: 3,
            title: 'Advisory Positioning',
            weekRange: 'Weeks 9–16',
            focus: 'Convert relationships to opportunities before looking externally',
            actions: [
              `Pitch 2–3 consulting or advisory engagements to existing clients or contacts in your target area`,
              'Even one ₹5,000 engagement validates your positioning and builds momentum',
              'If no consulting engagement materialises in 6 weeks, escalate to external job search with warm referrals as primary channel',
            ],
            milestone: '1+ consulting/advisory engagement or 3+ active job conversations via warm referrals',
          },
        ],
      };

    case 'PLATFORM':
      return {
        archetype: 'PLATFORM',
        headline: 'Convert knowledge to visibility first — cold outreach without proof converts at <2%',
        whyThisArchetype: `With ${experienceYears}+ years of experience and strong knowledge capital (${capitalPillars.knowledgeCapital}/25) but limited network capital (${capitalPillars.networkCapital}/25), your expertise needs to be made visible before networking will work. Publishing and speaking creates inbound — then you activate the resulting network.`,
        phase0: {
          title: 'Knowledge Inventory',
          weekRange: 'Before Phase 1',
          actions: [
            'List the 5 things you know about your domain that most people in your role do not',
            'Identify the format that best communicates your expertise: writing, speaking, or demos',
            'Choose one platform: LinkedIn for reach, GitHub for technical credibility, or conference talks for authority',
          ],
          milestone: 'Knowledge inventory complete with 5 publishable insights identified',
        },
        phases: [
          {
            phase: 1,
            title: 'Knowledge to Visibility',
            weekRange: 'Weeks 1–6',
            focus: 'Publish before you network — give people something to share',
            actions: [
              'Publish one piece per week for 6 weeks: LinkedIn post, article, or GitHub repository',
              'Topic: one insight from your knowledge inventory per week',
              'Respond to every comment — early engagement amplifies algorithmic reach',
            ],
            milestone: '6 published pieces; 1 with >500 views or 20+ meaningful engagements',
          },
          {
            phase: 2,
            title: 'Community Building',
            weekRange: 'Weeks 7–12',
            focus: 'Join and contribute before you ask',
            actions: [
              'Join 2 professional communities in your target domain (Slack groups, LinkedIn groups, Discord)',
              'Contribute answers and insights for 4 weeks before posting anything about your transition',
              'Identify the 10 most active members in each community — these become your new network nodes',
            ],
            milestone: 'Active contributor in 2 communities; 10+ new meaningful professional connections',
          },
          {
            phase: 3,
            title: 'Network-Led Search',
            weekRange: 'Weeks 13–20',
            focus: 'Your visibility generates inbound; supplement with targeted outreach',
            actions: [
              'Begin reaching out to the 10 community members identified in Phase 2 — you now have visible proof of expertise to reference',
              'Submit one conference talk or webinar proposal based on your Phase 1 content',
              'Begin targeted job applications — lead with your published work, not just your CV',
            ],
            milestone: '5+ warm network conversations from community; first job application sent',
          },
        ],
      };

    case 'AUGMENT':
      return {
        archetype: 'AUGMENT',
        headline: 'Become the AI-capable version of your role — the new title that didn\'t exist 2 years ago',
        whyThisArchetype: `At ${experienceYears} years of experience, you have deep enough domain knowledge to direct AI tools effectively — but not so much that your identity is locked to the old way of working. Your augmentation potential is high. The transition is not to a different role but to a fundamentally enhanced version of this one.`,
        phases: [
          {
            phase: 1,
            title: 'Master the 2–3 Transformative AI Tools for Your Function',
            weekRange: 'Weeks 1–6',
            focus: 'Don\'t change roles — change how you do this role',
            actions: [
              `Identify the 2–3 AI tools that are most transformative specifically for ${roleDisplayName} work`,
              'Spend 8–10 hours per week for 6 weeks building genuine proficiency — not surface-level familiarity',
              'Goal: you can perform your core tasks 2× faster using AI assistance than your colleagues can without it',
            ],
            milestone: 'Demonstrable 2× productivity improvement in 2+ core tasks',
          },
          {
            phase: 2,
            title: 'Demonstrate the Multiplier Internally',
            weekRange: 'Weeks 7–12',
            focus: 'Make your AI-augmented productivity visible',
            actions: [
              'Document and quantify your productivity improvement with specific numbers: "reduced X from 4 hours to 45 minutes"',
              'Present this to your team or manager as a process improvement — not a personal showcase',
              'Offer to train 2 colleagues: teaching forces you to systemise the knowledge and builds your credibility',
            ],
            milestone: 'Internal presentation delivered; 2 colleagues trained',
          },
          {
            phase: 3,
            title: 'Title and Scope Negotiation',
            weekRange: 'Weeks 13–20',
            focus: 'The person who leads AI adoption in your function deserves a new title',
            actions: [
              'Formally request a title or scope change reflecting your new function: "AI-Augmented [role]", "[role] + AI Lead", or "Senior [role]"',
              'If current employer does not recognise the expanded scope, identify the 5 employers who already have this title posted on Naukri/LinkedIn',
              'Apply with your AI productivity data as the lead credential — this is the interview differentiator',
            ],
            milestone: 'New title negotiated internally, OR 3+ interviews scheduled at target employers',
          },
        ],
      };

    case 'RESKILL':
    default:
      return {
        archetype: 'RESKILL',
        headline: 'Your years provide tenure protection (L5) — but transferable career capital requires deliberate investment',
        whyThisArchetype: `Your capital assessment shows limited transferable assets (total: ${capitalPillars.networkCapital + capitalPillars.knowledgeCapital + capitalPillars.deliveryCapital + capitalPillars.influenceCapital}/100). This is honest context: years of experience protect you from L5 displacement risk, but they do not automatically generate the network, knowledge credibility, or delivery track record that makes transitions fast. The path is through skill building.`,
        phases: [
          {
            phase: 1,
            title: 'Build One High-ROI Skill to Interview Readiness',
            weekRange: 'Weeks 1–8',
            focus: 'One skill to completion beats five skills to familiarity',
            actions: [
              'Choose the single highest-ROI skill for your target role from the action plan recommendations',
              'Block 2–3 hours daily. No exceptions for 8 weeks. Treat it as a second job.',
              'Deliverable: one published proof point demonstrating the skill (GitHub, LinkedIn, portfolio)',
            ],
            milestone: 'One skill at interview-ready proficiency with a visible proof point',
          },
          {
            phase: 2,
            title: 'Build Minimal Network While Applying',
            weekRange: 'Weeks 9–16',
            focus: 'Start job search in parallel with network building — do not wait',
            actions: [
              'Apply to 3 targeted roles per week. Cold applications convert at 2% — accept this and increase volume',
              'Contact 2 people per week in your target function: informational conversations only',
              'Join one professional community in your target domain and contribute answers for 30 min/day',
            ],
            milestone: 'First interview scheduled; 5+ informational conversations completed',
          },
          {
            phase: 3,
            title: 'Compound and Accelerate',
            weekRange: 'Weeks 17+',
            focus: 'Apply capital built in Phase 1 to accelerate the search',
            actions: [
              'Add second high-ROI skill from action plan recommendations',
              'Re-contact Phase 2 network connections — they know you now, which dramatically changes conversion',
              'Negotiate any offers — do not accept first number. Your demonstrated skills are now the leverage.',
            ],
            milestone: 'Offer in hand or 3+ active interview pipelines',
          },
        ],
      };
  }
}
