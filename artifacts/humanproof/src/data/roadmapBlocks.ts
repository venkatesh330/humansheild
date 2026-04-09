// ═══════════════════════════════════════════════════════════════════════════
// roadmapBlocks.ts — Modular Reusable Roadmap Building Blocks
// Used by the smart fallback engine when a role doesn't have pre-seeded data
// Blocks are selected based on the user's D1/D2/D6 dimension scores + risk level
// ═══════════════════════════════════════════════════════════════════════════

export type BlockType =
  | 'automation_risk_fix'
  | 'ai_skill_upgrade'
  | 'career_transition'
  | 'network_building'
  | 'leadership_pivot'
  | 'technical_depth'
  | 'strategic_pivot';

export interface RoadmapBlock {
  type: BlockType;
  triggerCondition: string;
  phase_1: {
    focus: string;
    actions: { action: string; why: string; outcome: string }[];
  };
  phase_2: {
    focus: string;
    actions: { action: string; why: string; outcome: string }[];
  };
  phase_3: {
    focus: string;
    actions: { action: string; why: string; outcome: string }[];
  };
}

// ─── BLOCK: Automation Risk Fix ──────────────────────────────────────────
// Triggered when: D1 (task automatability) > 70
export const AUTOMATION_RISK_FIX_BLOCK: RoadmapBlock = {
  type: 'automation_risk_fix',
  triggerCondition: 'D1 > 70 (high task automatability)',
  phase_1: {
    focus: 'Audit and Document Your Automatable Tasks',
    actions: [
      {
        action: 'List every repetitive task you do daily that follows a clear pattern',
        why: 'Identifying what AI will replace first gives you a clear transition roadmap.',
        outcome: 'Automation vulnerability log — the first step to any effective transition',
      },
      {
        action: 'Identify one AI tool that can handle your most automated task and learn to use it',
        why: 'Becoming the operator of the tools replacing your tasks shifts your value from executor to orchestrator.',
        outcome: 'AI tool proficiency for your highest-risk task',
      },
    ],
  },
  phase_2: {
    focus: 'Transition from Executor to Orchestrator',
    actions: [
      {
        action: 'Design a workflow where AI handles routine tasks and you focus on exceptions and strategy',
        why: 'The human-AI orchestration model is the bridge role between current and future states.',
        outcome: 'Documented AI+human workflow — your transition business case',
      },
      {
        action: 'Get certified in the AI platform most relevant to your field',
        why: 'Platform certification signals the shift from replaced-by-AI to partnered-with-AI.',
        outcome: 'AI platform certification in your discipline',
      },
    ],
  },
  phase_3: {
    focus: 'Land a Role With Oversight Scope',
    actions: [
      {
        action: 'Apply for roles that involve AI oversight, quality assurance, or process design — not just execution',
        why: 'Oversight roles are emerging across every AI-disrupted industry and pay significantly more.',
        outcome: 'New role with AI-augmented scope rather than AI-threatened scope',
      },
    ],
  },
};

// ─── BLOCK: AI Skill Upgrade ─────────────────────────────────────────────
// Triggered when: D2 (AI tool maturity) > 75
export const AI_SKILL_UPGRADE_BLOCK: RoadmapBlock = {
  type: 'ai_skill_upgrade',
  triggerCondition: 'D2 > 75 (mature AI tools exist for this role)',
  phase_1: {
    focus: 'Become an AI Tool Power User in Your Field',
    actions: [
      {
        action: 'Identify the top 3 AI tools transforming your field and spend 2 hours/day for 2 weeks mastering each',
        why: 'Deep proficiency in the tools disrupting your field makes you the person who manages those tools rather than the one replaced by them.',
        outcome: 'Expert-level proficiency in 3 field-specific AI tools',
      },
      {
        action: 'Build one workflow combining multiple AI tools to solve a real problem from your current role',
        why: 'Multi-tool orchestration is a rare and valuable skill that demonstrates AI-native competence.',
        outcome: 'Working AI workflow demo that shows multi-tool orchestration',
      },
    ],
  },
  phase_2: {
    focus: 'Build AI Augmentation Expertise',
    actions: [
      {
        action: 'Complete a prompt engineering or AI application course (Deeplearning.ai, Coursera) in your domain',
        why: 'Structured AI expertise builds the theoretical foundation for tool mastery.',
        outcome: 'AI application credential in your domain',
      },
      {
        action: 'Write a case study on how you used AI to achieve 10x output on a real task',
        why: 'Documented AI productivity gains are the portfolio item that employer s seek for AI-native roles.',
        outcome: 'AI productivity case study for portfolio',
      },
    ],
  },
  phase_3: {
    focus: 'Position as AI Practitioner, Not AI User',
    actions: [
      {
        action: 'Apply for roles with "AI" or "Intelligence" in the title within your field',
        why: 'AI-native role titles command 30-50% more than their non-AI equivalents and are growing rapidly.',
        outcome: 'New role positioned explicitly as AI-native within your field',
      },
    ],
  },
};

// ─── BLOCK: Career Transition ────────────────────────────────────────────
// Triggered when: Total risk score > 65
export const CAREER_TRANSITION_BLOCK: RoadmapBlock = {
  type: 'career_transition',
  triggerCondition: 'Total risk > 65 (high overall displacement risk)',
  phase_1: {
    focus: 'Map Your Adjacent Career Paths Now',
    actions: [
      {
        action: 'Identify 3 roles adjacent to yours with risk scores below 40% (use HumanProof Safe Careers page)',
        why: 'At your risk level, the pivot window is open — waiting closes it.',
        outcome: 'Shortlist of 3 viable lower-risk career pivots with your existing skills',
      },
      {
        action: 'Interview 2 people in those lower-risk roles to understand skill gaps',
        why: 'Real-world skill gap data from practitioners is more accurate than job descriptions.',
        outcome: 'Skill gap analysis from primary sources',
      },
    ],
  },
  phase_2: {
    focus: 'Build the Bridging Skills',
    actions: [
      {
        action: 'Identify the one highest-leverage skill needed for your target role and enroll in the best available course',
        why: 'Focused skill acquisition beats broad upskilling for career pivots — depth beats breadth.',
        outcome: 'Key bridging skill credential or project',
      },
      {
        action: 'Volunteer for internal projects that use skills from your target field',
        why: 'Internal cross-functional projects are the most underused source of career pivot evidence.',
        outcome: 'Internal project credit that bridges to new career path',
      },
    ],
  },
  phase_3: {
    focus: 'Execute the Transition',
    actions: [
      {
        action: 'Apply for hybrid/bridge roles that combine your current expertise with your target field',
        why: 'Hybrid roles at the intersection of your experience + target field have the least competition and highest hiring success rate.',
        outcome: 'New role in a lower-risk career path with meaningful salary progression',
      },
    ],
  },
};

// ─── BLOCK: Network Building ─────────────────────────────────────────────
// Triggered when: D6 (social capital moat) > 70
export const NETWORK_BUILDING_BLOCK: RoadmapBlock = {
  type: 'network_building',
  triggerCondition: 'D6 > 70 (weak professional network for role)',
  phase_1: {
    focus: 'Build Your Professional Moat',
    actions: [
      {
        action: 'Connect with 50 people in your target industry on LinkedIn with personalized notes this month',
        why: 'Professional network is a direct buffer against automation — relationships cannot be automated.',
        outcome: '50 new meaningful professional connections',
      },
      {
        action: 'Join one active professional community or Slack group in your field and participate weekly',
        why: 'Community-based relationships compound over time into referrals, partnerships, and job opportunities.',
        outcome: 'Active professional community membership with regular engagement',
      },
    ],
  },
  phase_2: {
    focus: 'Become Known in Your Network',
    actions: [
      {
        action: 'Publish one LinkedIn post per week about insights from your work or industry',
        why: 'Public knowledge sharing is the fastest way to build professional recognition at scale.',
        outcome: 'Growing LinkedIn presence with consistent voice',
      },
      {
        action: 'Speak at or volunteer to help organize one industry event (meetup, webinar, conference)',
        why: 'In-person professional recognition builds the social capital that AI cannot replicate.',
        outcome: 'Industry event participation for professional visibility',
      },
    ],
  },
  phase_3: {
    focus: 'Convert Network Into Career and Business Value',
    actions: [
      {
        action: 'Activate your network for referrals: reach out to 10 contacts specifically about career opportunities',
        why: 'Referral hires are 5-10x faster and higher-success-rate than cold applications.',
        outcome: 'Active referral pipeline from professional network',
      },
    ],
  },
};

// ─── BLOCK: Leadership Pivot ─────────────────────────────────────────────
// Triggered when: Experience > 5 years + risk > 50
export const LEADERSHIP_PIVOT_BLOCK: RoadmapBlock = {
  type: 'leadership_pivot',
  triggerCondition: 'Experience 5+ years + total risk > 50',
  phase_1: {
    focus: 'Package Your Strategic Experience',
    actions: [
      {
        action: 'Document your 5 biggest career wins with measurable business outcomes',
        why: 'Evidence of impact is the primary hiring signal for leadership roles.',
        outcome: 'Impact portfolio document for leadership positioning',
      },
      {
        action: 'Get a leadership or management certification (Dale Carnegie, SHRM, PMP depending on field)',
        why: 'Formal leadership credentials bridge the gap from individual contributor to leadership track.',
        outcome: 'Leadership certification credential',
      },
    ],
  },
  phase_2: {
    focus: 'Actively Lead',
    actions: [
      {
        action: 'Volunteer to manage a team, project, or initiative — accept stretch assignments',
        why: 'Leadership roles require demonstrated leadership experience, not just the desire for it.',
        outcome: 'Documented leadership experience with team/project outcome',
      },
      {
        action: 'Mentor 2 junior colleagues formally and document the relationship',
        why: 'Mentorship demonstrates leadership capability and builds your network simultaneously.',
        outcome: 'Mentorship relationships as portfolio evidence',
      },
    ],
  },
  phase_3: {
    focus: 'Apply for Management Track',
    actions: [
      {
        action: 'Apply for Team Lead, Manager, or Director-level roles in your field',
        why: 'Management and leadership roles are consistently more AI-resistant than individual contributor roles at equivalent experience levels.',
        outcome: 'Leadership-level role at 20-50% salary premium with significantly higher AI resilience',
      },
    ],
  },
};

// ─── BLOCK: Technical Depth ──────────────────────────────────────────────
// Triggered when: role is technical + risk 40-65
export const TECHNICAL_DEPTH_BLOCK: RoadmapBlock = {
  type: 'technical_depth',
  triggerCondition: 'Technical role + risk 40-65 (augmentation zone)',
  phase_1: {
    focus: 'Identify and Pursue the Rare Technical Skill',
    actions: [
      {
        action: 'Research which technical specialization in your field has the fewest practitioners and highest demand',
        why: 'Rare technical expertise is the most durable career investment — supply scarcity plus growing demand.',
        outcome: 'Target specialization identified with market demand evidence',
      },
      {
        action: 'Enroll in the most rigorous certification or training program for that specialization',
        why: 'Rigorous credentials filter out casual learners and signal genuine expertise.',
        outcome: 'Enrolled in specialist certification or advanced training',
      },
    ],
  },
  phase_2: {
    focus: 'Build Specialist Portfolio Projects',
    actions: [
      {
        action: 'Build 3 portfolio projects that specifically showcase your target specialty',
        why: 'Technical portfolio depth is the primary signal for specialist consulting and senior roles.',
        outcome: '3 specialist portfolio projects demonstrating rare technical skill',
      },
      {
        action: 'Contribute to open source or write technical content in your specialization',
        why: 'Public technical contribution builds reputation in technical communities faster than any other signal.',
        outcome: 'Public technical contributions visible to hiring managers',
      },
    ],
  },
  phase_3: {
    focus: 'Position as Technical Specialist',
    actions: [
      {
        action: 'Target specialist, principal, or staff-level roles that require your rare technical skill',
        why: 'Technical specialists consistently command 30-80% salary premium over generalists in the same field.',
        outcome: 'Specialist role at premium salary with strong AI resilience due to expertise scarcity',
      },
    ],
  },
};

// ─── BLOCK: Strategic Pivot ──────────────────────────────────────────────
// Triggered when: General role + risk > 60
export const STRATEGIC_PIVOT_BLOCK: RoadmapBlock = {
  type: 'strategic_pivot',
  triggerCondition: 'Any role + risk > 60 (needs strategic reorientation)',
  phase_1: {
    focus: 'Define Your Strategic North Star',
    actions: [
      {
        action: 'Map your transferable skills against roles with < 40% AI risk using the HumanProof Safe Careers tool',
        why: 'Strategic clarity about destination makes every subsequent action more efficient.',
        outcome: 'Clear career destination with transferable skills identified',
      },
      {
        action: 'Set a 12-month career pivot goal with 3 milestone checkpoints',
        why: 'Time-bounded goals with checkpoints are proven to dramatically increase transition success rates.',
        outcome: '12-month pivot plan with milestones',
      },
    ],
  },
  phase_2: {
    focus: 'Build the Credibility Bridge',
    actions: [
      {
        action: 'Start the most impactful certification or course for your target role this week',
        why: 'Credentials close the trust gap with hiring managers considering career changers.',
        outcome: 'Certification progress visible on resume',
      },
      {
        action: 'Find a project — freelance, internal, or pro-bono — where you can apply your target skill set',
        why: 'Live projects prove capability faster than courses alone. Projects convert to portfolio pieces.',
        outcome: 'Real project experience in target field on your portfolio',
      },
    ],
  },
  phase_3: {
    focus: 'Make the Leap',
    actions: [
      {
        action: 'Apply aggressively to roles in your target field — aim for 3 applications per week',
        why: 'Career pivots require persistent job searching — expect 20-40% longer to land vs. staying in current field.',
        outcome: 'New role in target field within 6-12 months',
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BLOCK SELECTION ENGINE
// Returns an ordered array of blocks based on dimension scores and risk level
// ═══════════════════════════════════════════════════════════════════════════

export interface BlockSelectionInput {
  d1: number;     // Task automatability
  d2: number;     // AI tool maturity
  d6: number;     // Social capital moat
  total: number;  // Overall risk score
  experience: string;
}

export const selectRoadmapBlocks = (input: BlockSelectionInput): RoadmapBlock[] => {
  const blocks: RoadmapBlock[] = [];

  // Primary block: what's most urgently needed
  if (input.total > 65) {
    blocks.push(CAREER_TRANSITION_BLOCK);
  } else if (input.d1 > 70) {
    blocks.push(AUTOMATION_RISK_FIX_BLOCK);
  } else if (input.d2 > 75) {
    blocks.push(AI_SKILL_UPGRADE_BLOCK);
  } else {
    blocks.push(TECHNICAL_DEPTH_BLOCK);
  }

  // Secondary block based on network strength
  if (input.d6 > 70) {
    blocks.push(NETWORK_BUILDING_BLOCK);
  }

  // Experience-based leadership block
  const expIndex = { '0-2': 0, '2-5': 1, '5-10': 2, '10-20': 3, '20+': 4 };
  const expLevel = expIndex[input.experience as keyof typeof expIndex] ?? 2;
  if (expLevel >= 2 && input.total >= 40) {
    blocks.push(LEADERSHIP_PIVOT_BLOCK);
  }

  // AI upgrade block if D2 is high and not already included as primary
  if (input.d2 > 75 && blocks[0]?.type !== 'ai_skill_upgrade') {
    blocks.push(AI_SKILL_UPGRADE_BLOCK);
  }

  // Strategic pivot for high-risk roles
  if (input.total > 60 && blocks[0]?.type !== 'career_transition') {
    blocks.push(STRATEGIC_PIVOT_BLOCK);
  }

  return blocks.slice(0, 3); // Return max 3 blocks
};

/**
 * Merge multiple blocks into a single 3-phase roadmap
 * The primary block's phases form the base; secondary blocks inject into the actions
 */
export const mergeBlocksIntoRoadmap = (blocks: RoadmapBlock[]) => {
  if (blocks.length === 0) return null;

  const primary = blocks[0];
  const secondary = blocks.slice(1);

  const phase1Actions = [
    ...primary.phase_1.actions,
    ...secondary.flatMap(b => b.phase_1.actions.slice(0, 1)),
  ];

  const phase2Actions = [
    ...primary.phase_2.actions,
    ...secondary.flatMap(b => b.phase_2.actions.slice(0, 1)),
  ];

  const phase3Actions = [
    ...primary.phase_3.actions,
    ...secondary.flatMap(b => b.phase_3.actions.slice(0, 1)),
  ];

  return {
    phase_1: {
      timeline: '0–30 days',
      focus: primary.phase_1.focus,
      actions: phase1Actions.slice(0, 4),
    },
    phase_2: {
      timeline: '1–3 months',
      focus: primary.phase_2.focus,
      actions: phase2Actions.slice(0, 4),
    },
    phase_3: {
      timeline: '3–12 months',
      focus: primary.phase_3.focus,
      actions: phase3Actions.slice(0, 3),
    },
  };
};
