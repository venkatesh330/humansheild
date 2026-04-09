// ═══════════════════════════════════════════════════════════════════════════
// careerIntelligenceDB.ts — Skill Oracle Career Transformation Engine
// Data-First Intelligence Layer v1.0 | 2026-Q1
// Covers 60+ highest-traffic roles with:
//  - Role-specific skill risk matrices (obsolete / at_risk / safe)
//  - Career transformation paths with risk reduction %
//  - 5-tier experience-keyed roadmaps (0-2 / 2-5 / 5-10 / 10-20 / 20+)
//  - Inaction scenarios per role
//  - Risk trend projections
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillRisk {
  skill: string;
  riskScore: number;        // 0–100
  riskType: 'Automatable' | 'Augmented' | 'Safe';
  horizon: '1-3yr' | '3-5yr' | '5yr+';
  reason: string;
  aiReplacement: 'Full' | 'Partial' | 'None';
  aiTool?: string;
}

export interface SafeSkill {
  skill: string;
  whySafe: string;
  longTermValue: number;    // 0–100
  difficulty: 'Low' | 'Medium' | 'High';
  resource?: string;
}

export interface CareerPath {
  role: string;
  riskReduction: number;    // percentage points
  skillGap: string;
  transitionDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  industryMapping: string[];
  salaryDelta: string;
  timeToTransition: string;
}

export interface RoadmapAction {
  action: string;
  why: string;
  outcome: string;
  tool?: string;
}

export interface RoadmapPhase {
  timeline: string;
  focus: string;
  actions: RoadmapAction[];
}

export interface ExperienceRoadmap {
  phase_1: RoadmapPhase;
  phase_2: RoadmapPhase;
  phase_3: RoadmapPhase;
}

export interface TrendPoint {
  year: number;
  riskScore: number;
  label: string;
}

export interface CareerIntelligence {
  displayRole: string;
  summary: string;
  skills: {
    obsolete: SkillRisk[];
    at_risk: SkillRisk[];
    safe: SafeSkill[];
  };
  careerPaths: CareerPath[];
  roadmap: {
    '0-2': ExperienceRoadmap;
    '2-5': ExperienceRoadmap;
    '5-10': ExperienceRoadmap;
    '10-20': ExperienceRoadmap;
    '20+': ExperienceRoadmap;
  };
  inactionScenario: string;
  riskTrend: TrendPoint[];
  confidenceScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MASTER CAREER INTELLIGENCE DATABASE
// ═══════════════════════════════════════════════════════════════════════════

export const CAREER_INTELLIGENCE_DB: Record<string, CareerIntelligence> = {

  // ─────────────────────────────────────────────────────────────────────────
  // BPO / CUSTOMER SUPPORT ROLES
  // ─────────────────────────────────────────────────────────────────────────

  bpo_inbound: {
    displayRole: 'Inbound Customer Support Agent',
    summary: 'Conversational AI handles 85%+ of inbound support queries end-to-end. The role as practiced by 2024 is largely absorbed by LLM-powered copilots.',
    skills: {
      obsolete: [
        { skill: 'FAQ answering', riskScore: 96, riskType: 'Automatable', horizon: '1-3yr', reason: 'GPT-4o and Intercom Fin resolve 96% of standard FAQ queries with zero human escalation.', aiReplacement: 'Full', aiTool: 'Intercom Fin, Zendesk AI' },
        { skill: 'Standard account updates', riskScore: 93, riskType: 'Automatable', horizon: '1-3yr', reason: 'RPA + LLM combinations handle policy lookups, account changes, and data updates autonomously.', aiReplacement: 'Full', aiTool: 'UiPath, Salesforce Einstein' },
        { skill: 'Scripted troubleshooting', riskScore: 91, riskType: 'Automatable', horizon: '1-3yr', reason: 'Decision-tree troubleshooting is AI-optimal. Conversational agents follow branching logic faster and never fatigue.', aiReplacement: 'Full', aiTool: 'Voiceflow, Botpress' },
      ],
      at_risk: [
        { skill: 'Cross-sell / upsell scripting', riskScore: 72, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI can recommend offers, but human rapport still converts better in complex or high-AOV scenarios.', aiReplacement: 'Partial', aiTool: 'Salesforce Revenue Intelligence' },
        { skill: 'Complaint documentation', riskScore: 68, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI can draft; human must make the final judgment call on escalation and tone.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Customer Experience Design', whySafe: 'Designing the AI-human handoff, journey maps, and escalation playbooks requires strategic human judgment.', longTermValue: 90, difficulty: 'High', resource: 'CX Strategy Certification – Medallia' },
        { skill: 'AI Copilot QA & Auditing', whySafe: 'Someone must audit AI chat transcripts for bias, error, and brand compliance — this is a growing new role.', longTermValue: 85, difficulty: 'Medium', resource: 'Conversational AI Auditor – DIY framework' },
        { skill: 'High-stakes empathetic resolution', whySafe: 'Bereaved, severely frustrated, or vulnerable customers legally and ethically require human agents.', longTermValue: 82, difficulty: 'Medium' },
      ],
    },
    careerPaths: [
      { role: 'CX Technology Specialist', riskReduction: 55, skillGap: 'Learn Zendesk admin, Intercom flows, AI integration basics', transitionDifficulty: 'Medium', industryMapping: ['SaaS', 'E-commerce', 'Fintech'], salaryDelta: '+25–40%', timeToTransition: '6–9 months' },
      { role: 'Customer Experience Designer', riskReduction: 62, skillGap: 'Journey mapping, UX fundamentals, service blueprint design', transitionDifficulty: 'Medium', industryMapping: ['Retail', 'Banking', 'Telecom'], salaryDelta: '+30–50%', timeToTransition: '9–12 months' },
      { role: 'Voice of Customer Analyst', riskReduction: 50, skillGap: 'Qualtrics or Medallia NPS tooling, basic data analysis', transitionDifficulty: 'Medium', industryMapping: ['Any'], salaryDelta: '+20–35%', timeToTransition: '6–9 months' },
      { role: 'AI Trainer / RLHF Specialist', riskReduction: 70, skillGap: 'Annotation workflow familiarity, sentiment classification', transitionDifficulty: 'Easy', industryMapping: ['Tech', 'AI companies'], salaryDelta: '+15–25%', timeToTransition: '3–6 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Escape the Queue', actions: [
          { action: 'Complete Zendesk or Intercom admin certification (free)', why: 'Platform skills shift you from agent to operator — a completely different market.', outcome: 'Certified in the tooling companies are buying' },
          { action: 'Study 10 AI-resolved chat transcripts from your own team', why: 'Identifying where AI failed generates your first insight data for a CX Analyst role.', outcome: 'Personal log of AI failure patterns — your first portfolio piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build the Bridge Skill', actions: [
          { action: 'Learn basic journey mapping (FigJam, Miro templates)', why: 'CX designers get paid 30-50% more and AI cannot do this role.', outcome: 'One end-to-end journey map in your portfolio' },
          { action: 'Apply for internal CX Ops or QA roles at your company', why: 'Internal transfers are 3x easier than external moves and give you title change.', outcome: 'New title, new resume, new trajectory' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Land the Pivot', actions: [
          { action: 'Apply to CX Technology Specialist or CX Analyst roles on LinkedIn', why: 'These roles are exploding as companies need humans to oversee AI agents.', outcome: 'New role with +25% salary and AI-resistant scope' },
          { action: 'Get Medallia or Qualtrics certified', why: 'VoC tools are the primary analytics platform in CX — credentials open doors fast.', outcome: 'Qualified for senior CX analysis roles' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Leverage Your Experience', actions: [
          { action: 'Audit and document 5 broken customer journeys in your current org', why: 'Your frontline insight is gold for CX Design roles — capture it systematically.', outcome: 'CX audit document — instant portfolio piece' },
          { action: 'Get Zendesk Administrator certification', why: '₹45k–₹80k salary difference between agent and admin roles in the same company.', outcome: 'Admin-level credentials' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build the Operator Skillset', actions: [
          { action: 'Build a chatbot flow in Voiceflow or Botpress (free tiers)', why: 'You become someone who builds AI agents, not someone replaced by them.', outcome: 'Working demo bot for your portfolio' },
          { action: 'Study NPS and CSAT analysis — Google Data Studio (free)', why: 'VoC analytics commands +30% premium over support roles.', outcome: 'First reporting dashboard in your portfolio' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Transition Out', actions: [
          { action: 'Apply for CX Operations Manager or CX Technology Specialist', why: 'Your agent experience + new technical skills create a unique profile.', outcome: 'Role change with 30–40% salary uplift' },
          { action: 'Document AI audit findings and pitch internally as QA initiative', why: 'Turning your observation into a project gets you recognized and promoted.', outcome: 'Internal promotion or strong external reference' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Become the AI Overseer', actions: [
          { action: 'Propose an AI copilot implementation project to management', why: 'You know the support landscape — use that to become the implementation lead.', outcome: 'Internal project leadership, new title potential' },
          { action: 'Get COPC CX Operations certification', why: 'Industry-recognized credential that opens VP-level CX operations roles.', outcome: 'Senior credential in your field' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Position as CX Strategy', actions: [
          { action: 'Build a CX metrics framework for your team using Looker or Tableau Public', why: 'Analytics leadership is 60% harder to automate than execution.', outcome: 'Demonstrated analytical leadership' },
          { action: 'Complete a customer journey mapping certification (Nielsen Norman Group)', why: 'NNG is the gold standard — credentials open Senior CX roles immediately.', outcome: 'Senior-level CX certification' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Lead or Consult', actions: [
          { action: 'Target Head of Customer Experience or CX Director roles', why: 'With 5–10 years + tech skills + certification, you are senior CX material.', outcome: 'Director-level role, +50–80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Monetize Your Institutional Knowledge', actions: [
          { action: 'Write a CX AI implementation playbook from your 10+ years of patterns', why: 'Nobody has your depth of customer behavior data. Package it.', outcome: 'IP asset, consulting positioning tool' },
          { action: 'Connect with AI vendors (Intercom, Salesforce) as implementation partner', why: 'Vendors actively seek experienced CX practitioners for channel partnerships.', outcome: 'Partner agreement opportunity' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build Advisory Profile', actions: [
          { action: 'Launch a LinkedIn presence as CX AI Transformation advisor', why: 'Your experience + era makes you uniquely positioned as AI-transition expert.', outcome: 'Inbound consulting inquiries' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Consulting or Senior Leadership', actions: [
          { action: 'Target VP Customer Experience or CX Consulting principal roles', why: 'Strategic CX leadership remains human-intensive at the senior level.', outcome: 'VP or consulting role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Pivot to Advisory', actions: [
          { action: 'Map your career into a 10-year case study document', why: 'You have navigated multiple technology cycles — this expertise is advisory gold.', outcome: 'Professional narrative for board or consulting positioning' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory Network', actions: [
          { action: 'Join CX leadership communities (CXPA, HDI) at senior/board level', why: 'Peer network at this level generates board advisory opportunities.', outcome: 'Advisory board pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board or Consulting', actions: [
          { action: 'Target CX advisory board roles at scale-up companies', why: 'Your domain authority + AI-era experience is exactly what boards need.', outcome: 'Board seat or high-fee consulting retainer' },
        ]},
      },
    },
    inactionScenario: 'Conversational AI will fully absorb inbound support queues within 18–24 months in most industries. Companies like Klarna already cut support headcount 65% post-AI deployment. If you remain in an inbound agent role without pivoting, your position will be eliminated or consolidated — not by choice, but by budget pressure from AI cost savings.',
    riskTrend: [
      { year: 2024, riskScore: 85, label: 'Now' },
      { year: 2025, riskScore: 91, label: '+1yr' },
      { year: 2026, riskScore: 95, label: '+2yr' },
      { year: 2027, riskScore: 97, label: '+3yr' },
    ],
    confidenceScore: 94,
  },

  bpo_chat: {
    displayRole: 'Live Chat Support Agent',
    summary: 'Chat support is the most automated support function — AI handles 97% of chat queries at scale with better response times.',
    skills: {
      obsolete: [
        { skill: 'First-line chat resolution', riskScore: 97, riskType: 'Automatable', horizon: '1-3yr', reason: 'Intercom Fin, Zendesk AI resolve first-line chat queries with 97% autonomous resolution rates in production.', aiReplacement: 'Full', aiTool: 'Intercom Fin, Zendesk AI' },
        { skill: 'Knowledge base article retrieval', riskScore: 95, riskType: 'Automatable', horizon: '1-3yr', reason: 'Semantic search + LLMs surface and explain KB content faster than humans.', aiReplacement: 'Full' },
        { skill: 'Standard query categorisation', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'NLP classifiers tag and route queries with higher accuracy than human triage.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Complex account escalation judgment', riskScore: 65, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI handles the triage but humans still make the final call on sensitive or legal escalations.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'AI Conversation Quality Auditing', whySafe: 'Reviewing AI chat transcripts for tone, accuracy, and brand risk requires human judgment.', longTermValue: 88, difficulty: 'Medium', resource: 'AI Evaluation frameworks — Scale AI training' },
        { skill: 'Escalation Protocol Design', whySafe: 'Designing when AI hands off to humans — and how — is a strategic human function growing in demand.', longTermValue: 85, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Conversation Design Specialist', riskReduction: 65, skillGap: 'Voiceflow / Botpress, conversation flow logic, UX writing', transitionDifficulty: 'Medium', industryMapping: ['SaaS', 'Fintech', 'E-commerce'], salaryDelta: '+40–60%', timeToTransition: '6–9 months' },
      { role: 'AI Trainer / Data Annotator (Senior)', riskReduction: 55, skillGap: 'Annotation platforms, quality rubric design', transitionDifficulty: 'Easy', industryMapping: ['AI companies', 'Tech'], salaryDelta: '+15–30%', timeToTransition: '3–6 months' },
      { role: 'CX Technology Specialist', riskReduction: 60, skillGap: 'Zendesk admin, API basics, analytics', transitionDifficulty: 'Medium', industryMapping: ['Any'], salaryDelta: '+30–45%', timeToTransition: '6–12 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Stop Being a Chat Agent', actions: [
          { action: 'Complete Botpress or Voiceflow free certification', why: 'Conversation builders are in demand — this skill takes you from agent to builder.', outcome: 'First certified conversation design credential' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build Your First Bot', actions: [
          { action: 'Clone your top 10 FAQ answers into a Voiceflow bot demo', why: 'You already know the questions — building the bot proves you can replace yourself strategically.', outcome: 'Working portfolio demo' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Apply as Conversation Designer', actions: [
          { action: 'Apply for Conversation Design or Chatbot Developer roles', why: 'Demand is exploding as every company needs AI bot builders.', outcome: 'New role, +40% salary' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Become the Bot Expert', actions: [
          { action: 'Build a full customer support bot in Voiceflow using your team\'s top 20 scenarios', why: 'Demonstrates you can architect the system that replaces your current role — huge competitive differentiator.', outcome: 'Full demo bot for portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Add Analytics Layer', actions: [
          { action: 'Learn Mixpanel or Heap for conversation analytics', why: 'Analytics + conversation design = senior conversation strategist profile.', outcome: 'Analytics dashboard on your demo bot' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior Conversation Role', actions: [
          { action: 'Target Senior Conversation Designer or CX AI Specialist', why: 'With 2+ years agent experience + design + analytics = rare profile.', outcome: '+50–60% salary in a growing field' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Lead the AI Transition', actions: [
          { action: 'Volunteer to lead your company\'s chatbot deployment project', why: 'Project lead on AI implementation transitions you from agent to strategist overnight.', outcome: 'Internal project lead title' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Product Manage the Bot', actions: [
          { action: 'Get a PM certification (Google Project Management Certificate)', why: 'Bot product management is a gap — your domain knowledge + PM skills = rare combo.', outcome: 'PM credential + bot project = senior roles' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Product or Operations Lead', actions: [
          { action: 'Target CX Product Manager or Chatbot Program Manager roles', why: 'Senior operations in AI-augmented CX is a growing category at $80-120k.', outcome: 'Senior role + 60-80% salary increase' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Strategic Consulting Position', actions: [
          { action: 'Document your 10 most complex customer escalation cases as case studies', why: 'Shows depth of judgment that AI systems still fail to replicate — advisory positioning.', outcome: 'Case study portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build Consulting Presence', actions: [
          { action: 'Publish 5 LinkedIn articles on AI in customer support from frontline perspective', why: 'Frontline experts are rare — your content attracts consulting inbound.', outcome: 'Consulting pipeline through content' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CX Consulting', actions: [
          { action: 'Target CX AI implementation consulting roles or independent consulting', why: 'Clients need practitioners who understand the real pain, not just the theory.', outcome: 'Consulting income at senior rates' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Leverage Institutional Authority', actions: [
          { action: 'Map your top 5 transformational CX projects and their business impact', why: 'Evidence of outcome-delivery positions you for board advisory.', outcome: 'Advisory narrative document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Board Advisory', actions: [
          { action: 'Apply to CX advisory roles at PE-backed companies', why: 'Growth companies need CX expertise at board level — your experience is rare.', outcome: 'Advisory board pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board or Fractional CXO', actions: [
          { action: 'Target fractional Chief Customer Officer or CX advisory board seats', why: 'Fractional CXO market is growing — $150-350/hr consulting rates for this experience.', outcome: 'Board seat or fractional CXO role' },
        ]},
      },
    },
    inactionScenario: 'Live chat as a human function is the fastest-disappearing job in the support sector. Intercom reports 65% ticket deflection with AI. By 2026, most SaaS and e-commerce companies will have near-zero human live chat agents for Tier 1. Staying in this role means competing for a shrinking pool of Tier 2/3 escalation seats.',
    riskTrend: [
      { year: 2024, riskScore: 91, label: 'Now' },
      { year: 2025, riskScore: 95, label: '+1yr' },
      { year: 2026, riskScore: 97, label: '+2yr' },
      { year: 2027, riskScore: 98, label: '+3yr' },
    ],
    confidenceScore: 96,
  },

  bpo_data_entry: {
    displayRole: 'Data Entry Specialist',
    summary: 'Data entry is the most automatable role in BPO. IDP (Intelligent Document Processing) tools handle 97%+ of structured data entry workflows.',
    skills: {
      obsolete: [
        { skill: 'Manual document digitisation', riskScore: 97, riskType: 'Automatable', horizon: '1-3yr', reason: 'IDP tools like ABBYY FlexiCapture and AWS Textract extract and structure data from any document format.', aiReplacement: 'Full', aiTool: 'ABBYY FlexiCapture, AWS Textract' },
        { skill: 'Form data processing', riskScore: 96, riskType: 'Automatable', horizon: '1-3yr', reason: 'Form parsers combined with LLMs achieve 99%+ accuracy on standard structured forms.', aiReplacement: 'Full', aiTool: 'UiPath, Power Automate' },
        { skill: 'Spreadsheet population from PDFs', riskScore: 95, riskType: 'Automatable', horizon: '1-3yr', reason: 'LLMs + OCR can extract, clean, and populate Excel/Sheets from PDFs reliably at scale.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Data validation and exception handling', riskScore: 60, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI catches most errors but ambiguous exceptions still require human judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'AI IDP System Administration', whySafe: 'Configuring, training, and maintaining IDP tools requires specialist knowledge that pays 2-3x data entry wages.', longTermValue: 88, difficulty: 'Medium', resource: 'ABBYY Vantage certification (free)' },
        { skill: 'Data Quality Governance', whySafe: 'As AI processes more data, humans are needed to design quality frameworks and audit for errors at scale.', longTermValue: 85, difficulty: 'Medium' },
        { skill: 'Process Automation Design', whySafe: 'Designing which processes to automate, in what order, and how — this is a high-paying strategic function.', longTermValue: 90, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'AI Operations Specialist', riskReduction: 70, skillGap: 'IDP tools, basic Python or Power Automate, process documentation', transitionDifficulty: 'Medium', industryMapping: ['BPO', 'Finance', 'Healthcare'], salaryDelta: '+50–80%', timeToTransition: '6–9 months' },
      { role: 'Data Quality Analyst', riskReduction: 55, skillGap: 'SQL basics, data profiling tools, Excel advanced', transitionDifficulty: 'Easy', industryMapping: ['Any'], salaryDelta: '+30–50%', timeToTransition: '4–6 months' },
      { role: 'RPA Developer (UiPath/Power Automate)', riskReduction: 72, skillGap: 'UiPath or Power Automate training (3-4 months)', transitionDifficulty: 'Medium', industryMapping: ['Banking', 'Insurance', 'BPO'], salaryDelta: '+80–120%', timeToTransition: '6–12 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Get the Automation Credential', actions: [
          { action: 'Complete UiPath RPA Developer Foundation (free, 60 hours)', why: 'This single certification triples your earning potential and shifts you from replaced to replacer.', outcome: 'Industry-recognized RPA credential', tool: 'UiPath Academy (free)' },
          { action: 'Document the 10 most repetitive data tasks you do daily', why: 'This becomes your automation use-case portfolio — exactly what RPA employers want.', outcome: 'Automation opportunity log' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build the First Bot', actions: [
          { action: 'Build one working UiPath automation for a real data entry task', why: 'A live demo beats any resume claim — this is your portfolio.', outcome: 'Working automation demo on GitHub/portfolio' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'RPA Developer Role', actions: [
          { action: 'Apply for Junior RPA Developer or Process Automation roles', why: 'UiPath-certified dev roles pay ₹6–12L in India, $55–75k in the US — 2-3x data entry rates.', outcome: 'New role, 80-120% salary increase' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Certify and Document', actions: [
          { action: 'Complete both UiPath RPA Developer AND Microsoft Power Automate certification', why: 'Dual certification opens both enterprise and SME markets.', outcome: 'Multi-platform automation credentials' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build 3 Portfolio Automations', actions: [
          { action: 'Automate three different real use cases: invoice processing, form extraction, report generation', why: 'Breadth of portfolio proves versatility required for mid-level roles.', outcome: 'Three-piece automation portfolio' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Data Ops or RPA Analyst', actions: [
          { action: 'Target Data Operations Analyst or RPA Analyst (Mid) roles', why: 'With experience + two certifications + portfolio, you are mid-level material.', outcome: '+80-100% salary uplift' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Process Mining + RPA', actions: [
          { action: 'Learn Celonis or UiPath Process Mining (both offer free tiers)', why: 'Process mining + RPA is senior consultant territory — completely different pay grade.', outcome: 'Process mining credential added to RPA stack' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Design Automation Frameworks', actions: [
          { action: 'Build an automation opportunity assessment framework from your work experience', why: 'This consulting deliverable is what Big 4 and BPO firms pay senior rates for.', outcome: 'Consulting-ready methodology document' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Automation Consultant', actions: [
          { action: 'Target Intelligent Automation Consultant or RPA Architect roles', why: '5–10 years operations + automation tools = rare senior profile at $80-120k.', outcome: 'Senior role + 100-150% salary uplift from data entry' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Become Process Excellence Authority', actions: [
          { action: 'Get Lean Six Sigma Green Belt certification if not already held', why: 'Combines your operational depth with a recognized process excellence credential.', outcome: 'Senior process consulting qualification' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Operations Transformation Consulting', actions: [
          { action: 'Apply for Operations Transformation Manager at large BPOs or Big 4', why: 'Your operational depth + Lean + automation = transformation lead material.', outcome: 'Senior management role' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Director-Level Operations', actions: [
          { action: 'Target Director of Intelligent Operations or VP Operations roles', why: 'Operational leaders who understand automation are rare and well-compensated.', outcome: 'Director or VP role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Fractional COO Positioning', actions: [
          { action: 'Write a "State of Operations Automation" white paper from your 20 years of process observation', why: 'Authoritative content positions you as the industry voice boards want to hire.', outcome: 'Thought leadership document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory Network', actions: [
          { action: 'Target fractional COO/Operations Advisory roles at $150-400/hr', why: 'Organizations undergoing digital transformation desperately need experienced operators who also understand AI.', outcome: 'Consulting pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Advisory or Board', actions: [
          { action: 'Join operations advisory boards at PE-backed BPO or automation companies', why: 'Your institutional knowledge of operations + automation = unique board-level value.', outcome: 'Board seat or advisory role' },
        ]},
      },
    },
    inactionScenario: 'Data entry is essentially fully automated. McKinsey estimates 97% of standard data entry tasks are within current AI capability. Companies that have deployed IDP tools report 85-95% reduction in data entry headcount. This is not a future risk — it is actively happening. Staying in this role without pivoting to automation design or data quality roles means displacement within 12-18 months.',
    riskTrend: [
      { year: 2024, riskScore: 94, label: 'Now' },
      { year: 2025, riskScore: 97, label: '+1yr' },
      { year: 2026, riskScore: 98, label: '+2yr' },
      { year: 2027, riskScore: 99, label: '+3yr' },
    ],
    confidenceScore: 97,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT ROLES
  // ─────────────────────────────────────────────────────────────────────────

  cnt_blog: {
    displayRole: 'Blog / Article Writer',
    summary: 'Generative AI produces SEO-optimised articles at industrial scale. 92% task automatability for standard blog content.',
    skills: {
      obsolete: [
        { skill: 'SEO article drafting', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'Jasper, Writer, ChatGPT, and Gemini draft full articles from keyword briefs in minutes.', aiReplacement: 'Full', aiTool: 'Jasper, ChatGPT, Writer' },
        { skill: 'FAQ and how-to content', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'Structured Q&A content is an AI-optimal format — search engines already surface AI-generated answers.', aiReplacement: 'Full' },
        { skill: 'Product description writing', riskScore: 94, riskType: 'Automatable', horizon: '1-3yr', reason: 'Amazon, Shopify, and direct-to-consumer brands have largely automated product descriptions.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Long-form editorial content', riskScore: 65, riskType: 'Augmented', horizon: '3-5yr', reason: 'Deep investigation, original primary research, and editorial voice still differentiate human writers.', aiReplacement: 'Partial' },
        { skill: 'Interview-based content', riskScore: 55, riskType: 'Augmented', horizon: '3-5yr', reason: 'Sourcing and conducting interviews requires human relationship skills AI cannot replicate.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Content Strategy & Architecture', whySafe: 'Designing a content ecosystem — topics, audience, funnel mapping — requires strategic human judgment about business needs.', longTermValue: 92, difficulty: 'High', resource: 'HubSpot Content Strategy Certification (free)' },
        { skill: 'AI Content Quality Curation', whySafe: 'Brands need humans to select, refine, and maintain quality standards for AI-generated content.', longTermValue: 85, difficulty: 'Medium' },
        { skill: 'Primary Research & Investigative Journalism', whySafe: 'Original data, field interviews, and investigative depth cannot be AI-generated: it requires access, relationships, and judgment.', longTermValue: 90, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Content Strategist', riskReduction: 60, skillGap: 'Content audit frameworks, audience research, analytics (GA4)', transitionDifficulty: 'Medium', industryMapping: ['SaaS', 'E-commerce', 'Media'], salaryDelta: '+30–50%', timeToTransition: '6–9 months' },
      { role: 'AI Content Operations Manager', riskReduction: 65, skillGap: 'Prompt engineering, content workflow tools (Jasper, Writer), editorial QA', transitionDifficulty: 'Easy', industryMapping: ['Any'], salaryDelta: '+25–45%', timeToTransition: '3–6 months' },
      { role: 'Brand Narrative Lead', riskReduction: 55, skillGap: 'Brand positioning, messaging hierarchy, stakeholder communication', transitionDifficulty: 'Hard', industryMapping: ['Brand agencies', 'In-house brand teams'], salaryDelta: '+40–70%', timeToTransition: '9–18 months' },
      { role: 'UX Writer', riskReduction: 50, skillGap: 'Product design basics, Figma, user research literacy', transitionDifficulty: 'Medium', industryMapping: ['Tech', 'SaaS', 'Product companies'], salaryDelta: '+30–50%', timeToTransition: '6–12 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Differentiate from AI Output', actions: [
          { action: 'Write 5 content pieces that AI definitively cannot: original interviews, primary data analysis, firsthand reporting', why: 'Your portfolio must prove you add something AI cannot generate.', outcome: 'AI-proof portfolio pieces' },
          { action: 'Get HubSpot Content Strategy certification (free, 5 hours)', why: 'Signals intent to shift from execution to strategy.', outcome: 'Certification credential' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Master AI Content Ops', actions: [
          { action: 'Build a content workflow: AI draft → human edit → brand review → publish', why: 'Become the orchestrator, not the executor. Document this as a process.', outcome: 'Workflow process document + portfolio' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Apply for Strategy Roles', actions: [
          { action: 'Apply for Content Strategist or AI Content Manager roles', why: 'These roles pay 30-50% more and are growing as AI content volumes explode.', outcome: 'New role with strategy title' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Build a Content Audit Asset', actions: [
          { action: 'Conduct a full content audit of a public brand (using free tools like Screaming Frog, Ahrefs free tier)', why: 'Content audits are a core strategist skill — this becomes your portfolio deliverable.', outcome: 'Full content audit case study' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Analytics Competence', actions: [
          { action: 'Complete Google Analytics 4 certification and build a content performance dashboard', why: 'Analytics transforms you from a writer to a content performance manager — different salary band.', outcome: 'Analytics certification + live dashboard' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Content Strategy Lead', actions: [
          { action: 'Target Content Strategy Lead or Head of Content roles', why: 'With 2-5 years + audit + analytics = rare profile for content strategy leads.', outcome: 'Head of Content role, +50-60% salary uplift' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Position as Content Intelligence', actions: [
          { action: 'Build a brand content map with competitive analysis for 3 companies in your niche', why: 'Demonstrating competitive content intelligence is a senior content strategist skill.', outcome: 'Consulting-quality content analysis' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Editorial Leadership', actions: [
          { action: 'Pitch and run an original research study or survey in your industry', why: 'Original data is the most defensible content type — it generates backlinks, citations, and industry authority.', outcome: 'Proprietary research asset + media coverage' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Director or VP Content', actions: [
          { action: 'Target Director of Content or VP of Content Marketing', why: 'Editorial leadership of AI content pipelines: a growing, well-compensated strategic function.', outcome: 'Director level, +60-80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Write Your Own Book or Report', actions: [
          { action: 'Publish your first major thought leadership piece — a book chapter, industry report, or manifesto', why: '10+ years of domain knowledge + AI writing tools = a publishable piece in 30 days.', outcome: 'Authored thought leadership asset' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Content Advisory', actions: [
          { action: 'Pitch advisory retainers to 3 brands in your niche (3-5 hours/month at $500-1500/month)', why: 'Your content depth + editorial judgment = advisory value brands will pay for.', outcome: 'Consulting retainer income' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Chief Content Officer or Agency', actions: [
          { action: 'Target Chief Content Officer roles or start a content strategy boutique', why: 'CCO role is one of the last senior content roles AI cannot replace — it requires organizational authority.', outcome: 'CCO or agency founder role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Codify Decades of Brand Knowledge', actions: [
          { action: 'Write a 10,000-word manifesto on how brands build trust in the AI content era', why: 'Your 20 years covers the full arc from SEO to AI flooding — this perspective is uniquely valuable.', outcome: 'Viral thought leadership piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Publishing or Advisory', actions: [
          { action: 'Pitch a book proposal or join a media company as editorial board member', why: 'Your editorial authority and domain depth is what editors and boards seek.', outcome: 'Book deal or board role' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Media Brand or Consulting', actions: [
          { action: 'Build your own content brand or join an established media company as Editor-in-Chief', why: 'Editorial judgment cannot be automated — it requires decades of taste, trust, and authority.', outcome: 'Media leadership or personal brand income' },
        ]},
      },
    },
    inactionScenario: 'Blog and article writing as a standalone skill is being absorbed at scale. Major publishing platforms are replacing junior writer roles with AI-human editorial hybrid models. AgencyBB, Dotdash Meredith, and large content agencies have cut entry-level writing headcount 40-60% since 2023. If you continue producing standard content without evolving to strategy or original research, your market rate will drop to near-zero for commodity content.',
    riskTrend: [
      { year: 2024, riskScore: 85, label: 'Now' },
      { year: 2025, riskScore: 90, label: '+1yr' },
      { year: 2026, riskScore: 93, label: '+2yr' },
      { year: 2027, riskScore: 95, label: '+3yr' },
    ],
    confidenceScore: 91,
  },

  cnt_seo_content: {
    displayRole: 'SEO Content Writer',
    summary: 'SEO content writing is the single highest-risk content role. 97% task automatability — AI tools write keyword-targeted articles faster and cheaper.',
    skills: {
      obsolete: [
        { skill: 'Keyword-based article writing', riskScore: 97, riskType: 'Automatable', horizon: '1-3yr', reason: 'Every major SEO tool now has AI that writes keyword-targeted content on demand.', aiReplacement: 'Full', aiTool: 'Surfer SEO AI, Jasper, Frase.io' },
        { skill: 'Meta descriptions and title tags', riskScore: 95, riskType: 'Automatable', horizon: '1-3yr', reason: 'Automated at scale by every major content tool.', aiReplacement: 'Full' },
        { skill: 'Content cluster population', riskScore: 93, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI can plan and execute full content clusters from a single topic brief.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Technical SEO content', riskScore: 65, riskType: 'Augmented', horizon: '3-5yr', reason: 'Complex technical documentation with original expertise still differentiates from AI.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Technical SEO Strategy', whySafe: 'Site architecture, crawl optimization, Core Web Vitals, schema — this requires technical depth AI content cannot provide.', longTermValue: 90, difficulty: 'High', resource: 'Moz SEO Certification, Ahrefs Academy (free)' },
        { skill: 'EEAT Content Architecture', whySafe: 'Google\'s Expertise-Experience-Authority-Trustworthiness framework requires long-form expertise signals that must be built by real humans.', longTermValue: 88, difficulty: 'High' },
        { skill: 'Content Performance Analysis', whySafe: 'Diagnosing why content ranks or drops, and prescribing strategy — requires analytical + strategic judgment.', longTermValue: 85, difficulty: 'Medium' },
      ],
    },
    careerPaths: [
      { role: 'Technical SEO Specialist', riskReduction: 60, skillGap: 'Python basics, Screaming Frog, log file analysis, schema markup', transitionDifficulty: 'Hard', industryMapping: ['E-commerce', 'SaaS', 'Publisher'], salaryDelta: '+50–80%', timeToTransition: '9–15 months' },
      { role: 'SEO Strategy Lead', riskReduction: 55, skillGap: 'Analytics deep dive, competitive strategy, search algorithm understanding', transitionDifficulty: 'Medium', industryMapping: ['Any'], salaryDelta: '+40–60%', timeToTransition: '6–12 months' },
      { role: 'Content Intelligence Manager', riskReduction: 65, skillGap: 'Data analysis, AI content tools mastery, editorial process design', transitionDifficulty: 'Medium', industryMapping: ['Media', 'SaaS', 'E-com'], salaryDelta: '+35–55%', timeToTransition: '6–9 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Exit Commodity Writing', actions: [
          { action: 'Complete Ahrefs Academy SEO Course (free, 14 hours)', why: 'SEO strategy knowledge is the first step out of commodity content.', outcome: 'Free SEO certification' },
          { action: 'Learn to use Screaming Frog (free up to 500 URLs)', why: 'Technical SEO tool skills shift you to a completely different job market.', outcome: 'Technical SEO tool competency' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build Technical SEO Skills', actions: [
          { action: 'Conduct a full technical SEO audit of one website and document findings', why: 'Technical auditing is a core deliverable that AI cannot do end-to-end.', outcome: 'Technical audit portfolio piece' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'SEO Analyst Role', actions: [
          { action: 'Apply for SEO Analyst or Junior Technical SEO Specialist roles', why: 'Entry-level technical SEO pays 30-50% more than content writing.', outcome: 'New role with technical SEO focus' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Go Technical or Go Home', actions: [
          { action: 'Learn Python basics for SEO (free: Automate the Boring Stuff + SEO-specific tutorials)', why: 'Python + SEO = rare combination that commands $75-95k salaries.', outcome: 'SEO Python scripts in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Analytics Mastery', actions: [
          { action: 'Get Google Analytics 4 and Google Search Console certified, then build a traffic analysis report', why: 'Data fluency is the line between content executor and content strategist.', outcome: 'Analytics certifications + live reports' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'SEO Strategy Role', actions: [
          { action: 'Target SEO Strategy Manager or Technical SEO Lead roles', why: 'With 2-5 years writing + technical + analytics = strong SEO strategy profile.', outcome: '+50-60% salary, AI-resilient title' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Own SEO Intelligence', actions: [
          { action: 'Build a proprietary SEO keyword research framework using Python + Ahrefs API', why: 'Custom tooling + strategic frameworks = consulting-grade deliverables.', outcome: 'SEO intelligence tool for portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Search Strategy Consulting', actions: [
          { action: 'Take on 2 SEO consulting projects (freelance or pro-bono)', why: 'Consulting experience transforms your profile from in-house writer to external expert.', outcome: 'Consulting portfolio + testimonials' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Head of SEO or Consulting', actions: [
          { action: 'Target Head of SEO or Director of Search at a high-growth company', why: '5+ years + technical + strategy = senior search leadership.', outcome: 'Director-level, +70-90% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'SEO Authority Building', actions: [
          { action: 'Publish an original search industry analysis (e.g., a study of AI\'s impact on search rankings)', why: 'Original research from an experienced SEO practitioner is industry gold.', outcome: 'Industry authority piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Agency or Consulting', actions: [
          { action: 'Launch or join an SEO consultancy or start advising 3 brands', why: '10 years of SEO is worth $200-400/hr as a consultant.', outcome: 'Consulting income pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Agency Build or VP Search', actions: [
          { action: 'Target VP of Search or found your own SEO agency', why: 'Senior search strategy is a durable function — AI cannot replace the judgment.', outcome: 'Agency or VP role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Historical Expert Positioning', actions: [
          { action: 'Document how search has changed across your 20-year career and publish as a comprehensive guide', why: 'No AI can access this institutional memory — it is uniquely valuable.', outcome: 'Thought leadership document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory and Speaking', actions: [
          { action: 'Pitch to SEO conference circuits (SMX, BrightonSEO) as expert speaker', why: 'Speaking generates consulting, board, and advisory deals passively.', outcome: 'Speaking pipeline + inbound deals' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board or Fractional CMO', actions: [
          { action: 'Target Fractional CMO focused on search or SEO advisory board seats', why: 'Fractional CMO (search focus) rates run $5-15k/month — 20 years earns the premium.', outcome: 'Fractional CMO engagement' },
        ]},
      },
    },
    inactionScenario: 'SEO content writing is already being automated at industrial scale. Agencies have cut junior content writer headcount 50-70% since ChatGPT launched. Google\'s AI Overviews now answer queries before users click. The market for standard keyword articles is commoditizing to near-zero rates. Without pivoting to technical SEO, search strategy, or content leadership, your earning potential will collapse within 12-24 months.',
    riskTrend: [
      { year: 2024, riskScore: 92, label: 'Now' },
      { year: 2025, riskScore: 95, label: '+1yr' },
      { year: 2026, riskScore: 97, label: '+2yr' },
      { year: 2027, riskScore: 98, label: '+3yr' },
    ],
    confidenceScore: 97,
  },

  cnt_copy: {
    displayRole: 'Copywriter / Ad Copywriter',
    summary: 'Ad copy generation is 88% automatable. GPT-4o, Claude, and Jasper produce brand-compliant copy variations at machine speed.',
    skills: {
      obsolete: [
        { skill: 'Ad copy A/B variants at scale', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'Platforms like AdCreative.ai generate hundreds of variants from a single brief.', aiReplacement: 'Full', aiTool: 'AdCreative.ai, Jasper, Claude' },
        { skill: 'Email subject line writing', riskScore: 88, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI tools outperform human writers on A/B email subject line tests in studies.', aiReplacement: 'Full' },
        { skill: 'Standard promotional copy', riskScore: 85, riskType: 'Automatable', horizon: '1-3yr', reason: 'Promotional copy follows predictable frameworks that AI executes flawlessly.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Brand voice development', riskScore: 58, riskType: 'Augmented', horizon: '3-5yr', reason: 'Defining brand voice still requires human cultural insight — AI can replicate a voice once defined.', aiReplacement: 'Partial' },
        { skill: 'Cultural moment advertising', riskScore: 55, riskType: 'Augmented', horizon: '3-5yr', reason: 'Real-time cultural fluency and intuition is still a meaningful human advantage.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Creative Direction', whySafe: 'Overseeing creative strategy, campaign concept, and brand vision requires cultural judgment AI cannot replicate.', longTermValue: 92, difficulty: 'High', resource: 'Miami Ad School online programs' },
        { skill: 'Brand Strategy & Positioning', whySafe: 'Defining positioning, messaging hierarchy, and brand architecture requires strategic business thinking beyond copy execution.', longTermValue: 90, difficulty: 'High' },
        { skill: 'Conversion Rate Optimization Strategy', whySafe: 'Diagnosing why copy converts or not — and prescribing structural fixes — requires analytical + creative synthesis.', longTermValue: 88, difficulty: 'Medium' },
      ],
    },
    careerPaths: [
      { role: 'Creative Director', riskReduction: 55, skillGap: 'Campaign concept leadership, art direction basics, brand strategy', transitionDifficulty: 'Very Hard', industryMapping: ['Advertising', 'Brand agencies'], salaryDelta: '+60–100%', timeToTransition: '18–36 months' },
      { role: 'Brand Strategist', riskReduction: 58, skillGap: 'Brand positioning frameworks, competitive analysis, consumer insight', transitionDifficulty: 'Hard', industryMapping: ['Brand consultancies', 'In-house brand teams'], salaryDelta: '+40–70%', timeToTransition: '12–18 months' },
      { role: 'CRO Specialist', riskReduction: 52, skillGap: 'A/B testing tools, analytics, landing page strategy', transitionDifficulty: 'Medium', industryMapping: ['E-commerce', 'SaaS', 'D2C'], salaryDelta: '+30–50%', timeToTransition: '6–9 months' },
      { role: 'AI Content Operations Lead', riskReduction: 50, skillGap: 'Prompt engineering, content workflow design, editorial QA', transitionDifficulty: 'Easy', industryMapping: ['Any'], salaryDelta: '+25–40%', timeToTransition: '3–6 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Build Strategic Positioning', actions: [
          { action: 'Complete the "Brand Strategy is Not Rocket Science" crash course (YouTube + LinkedIn Learning)', why: 'Brand strategy knowledge moves you above pure copy execution.', outcome: 'Strategic framework vocabulary and skills' },
          { action: 'Develop a CRO case study: pick a live landing page, analyze it, propose 5 copy improvements with rationale', why: 'CRO thinking is the bridge between copywriter and strategist — make this transition visible.', outcome: 'CRO case study portfolio piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Become a Copy Strategist', actions: [
          { action: 'Learn and document brand voice for 3 different brands (contrast: premium vs. playful vs. technical)', why: 'Brand voice expertise is a foundation skill for Creative Director path.', outcome: 'Brand voice analysis portfolio' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Apply for Strategy-Adjacent Roles', actions: [
          { action: 'Target Brand Strategist Jr, CRO Specialist, or Content Strategist roles', why: 'These roles command 30-50% more than pure copywriting and are harder to automate.', outcome: 'New strategy-level role' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Build Campaign Concept Portfolio', actions: [
          { action: 'Design 3 full campaign concepts with creative brief, copy, and rationale — not just copy deliverables', why: 'Campaign thinking is what separates copywriters from creative directors.', outcome: 'Campaign concept portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Add Analytics + CRO', actions: [
          { action: 'Complete Google Analytics 4 and run a real A/B copy test on a website you have access to', why: 'Copy + data = persuasion strategist, not just writer.', outcome: 'Documented A/B test results' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Creative or Strategy Role', actions: [
          { action: 'Target Associate Creative Director, Brand Strategist, or CRO Lead', why: '2-5 years copy + campaign concepts + analytics = creative leadership material.', outcome: '+50-70% salary in AI-resilient role' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Creative Leadership', actions: [
          { action: 'Develop a full brand manifesto and positioning document for a real or hypothetical brand', why: 'This deliverable is what agencies and brands pay $150-400/day for.', outcome: 'Senior creative positioning piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Creative Direction Transition', actions: [
          { action: 'Mentor 2 junior copywriters and document your creative direction approach', why: 'Leadership experience is required for Creative Director roles.', outcome: 'Demonstrable creative leadership' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Creative Director or CSO', actions: [
          { action: 'Target Creative Director or Chief Creative Officer at agency or brand', why: 'Creative direction is one of the most AI-resistant senior roles in communications.', outcome: 'Creative leadership role at senior rates' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Creative Consulting', actions: [
          { action: 'Pitch a creative consulting retainer to 3 brands (5-10 hrs/month at $500-2000/month)', why: 'Senior creative judgment is one of the clearest advisory monetization paths.', outcome: 'Consulting retainer income' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build Creative Authority', actions: [
          { action: 'Publish a definitive guide on brand voice or campaign strategy in the AI era', why: 'Thought leadership attracts inbound consulting and speaking opportunities.', outcome: 'Industry expert positioning' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CCO or Agency Principal', actions: [
          { action: 'Target Chief Creative Officer or found a creative strategy boutique', why: 'The CCO and creative principal roles are human-essential at the organizational level.', outcome: 'Executive or agency leadership role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Legacy Creative Authority', actions: [
          { action: 'Document your 20 years of advertising insights in a book or masterclass', why: 'Your campaign archive spans the AI era, the social era, and the print era — invaluable perspective.', outcome: 'Book proposal or masterclass curriculum' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory or Speaking', actions: [
          { action: 'Join Advertising industry associations (4A\'s, IPA) at advisory level', why: 'Creative leadership at industry level is where 20-year veterans belong.', outcome: 'Industry board or advisory seat' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board or Agency Founder', actions: [
          { action: 'Launch a boutique creative agency or join an existing agency as Executive Creative Director', why: 'Creative judgment at the ECD level is immune to AI — it requires taste, authority and client trust.', outcome: 'Agency leadership or board seat' },
        ]},
      },
    },
    inactionScenario: 'Advertising copy generation is AI\'s strongest use case in marketing. Clients are producing 10x more copy variants with AI than with human teams. Agency retainer fees for pure execution copy are collapsing. If you remain a copy executor without pivoting to creative direction, strategy, or analytics, your project rates will drop 40-70% as AI lowers the floor on what clients expect to pay.',
    riskTrend: [
      { year: 2024, riskScore: 82, label: 'Now' },
      { year: 2025, riskScore: 87, label: '+1yr' },
      { year: 2026, riskScore: 90, label: '+2yr' },
      { year: 2027, riskScore: 93, label: '+3yr' },
    ],
    confidenceScore: 90,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FINANCE ROLES
  // ─────────────────────────────────────────────────────────────────────────

  fin_account: {
    displayRole: 'Accountant / Bookkeeper',
    summary: '88% task automatability. AI automates journal entries, reconciliation, and standard reporting. The standalone bookkeeping role is largely absorbed.',
    skills: {
      obsolete: [
        { skill: 'Routine bookkeeping and journal entries', riskScore: 95, riskType: 'Automatable', horizon: '1-3yr', reason: 'QuickBooks AI, Xero, and FreshBooks handle 95%+ of standard bookkeeping entries with zero human input.', aiReplacement: 'Full', aiTool: 'QuickBooks AI, Xero, FreshBooks' },
        { skill: 'Bank reconciliation', riskScore: 93, riskType: 'Automatable', horizon: '1-3yr', reason: 'Automated reconciliation tools match 99%+ of transactions without human review.', aiReplacement: 'Full' },
        { skill: 'Standard financial statement preparation', riskScore: 88, riskType: 'Automatable', horizon: '1-3yr', reason: 'ERP systems generate balance sheets, P&L and cash flow statements on demand from ledger data.', aiReplacement: 'Full' },
        { skill: 'Invoice processing and matching', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'Vic.ai and similar tools automate invoice coding, matching, and approval routing.', aiReplacement: 'Full', aiTool: 'Vic.ai, AvidXchange' },
      ],
      at_risk: [
        { skill: 'Management accounts commentary', riskScore: 68, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI generates drafts but business context for meaningful variance analysis still requires human judgment.', aiReplacement: 'Partial' },
        { skill: 'Client relationship management (SME)', riskScore: 52, riskType: 'Augmented', horizon: '3-5yr', reason: 'Small business owners still prefer a trusted human advisor for financial decisions.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'CFO Advisory / Financial Storytelling', whySafe: 'Translating numbers into business decisions and communicating to boards requires strategic and interpersonal judgment.', longTermValue: 92, difficulty: 'High', resource: 'CIMA CGMA certification' },
        { skill: 'Tax Strategy (Complex)', whySafe: 'Cross-border, M&A, estate, and multi-entity tax structures require licensed professional judgment and accountability.', longTermValue: 90, difficulty: 'High', resource: 'AICPA Tax certificates' },
        { skill: 'Financial Systems Implementation', whySafe: 'Installing, configuring and training organizations on ERP/accounting systems is growing demand.', longTermValue: 88, difficulty: 'Medium', resource: 'NetSuite, Xero certification' },
      ],
    },
    careerPaths: [
      { role: 'FP&A Analyst', riskReduction: 45, skillGap: 'Financial modelling (3-statement), scenario analysis, business partnering', transitionDifficulty: 'Medium', industryMapping: ['Corporate', 'VC-backed companies'], salaryDelta: '+20–40%', timeToTransition: '6–12 months' },
      { role: 'CFO Advisory (SME)', riskReduction: 58, skillGap: 'Business strategy basics, stakeholder communication, advisory frameworks', transitionDifficulty: 'Hard', industryMapping: ['SME sector'], salaryDelta: '+50–80%', timeToTransition: '12–24 months' },
      { role: 'Financial Controller', riskReduction: 38, skillGap: 'Management accounts, ERP mastery, team leadership', transitionDifficulty: 'Medium', industryMapping: ['Any corporate'], salaryDelta: '+30–50%', timeToTransition: '6–12 months' },
      { role: 'Accounting Technology Consultant', riskReduction: 62, skillGap: 'ERP implementation, change management, project management', transitionDifficulty: 'Medium', industryMapping: ['Accountancy firms', 'Fintech'], salaryDelta: '+40–65%', timeToTransition: '9–15 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Get the Advisory Qualification', actions: [
          { action: 'Start CIMA or ACCA qualification if not already in progress', why: 'The ACA/ACCA/CIMA route opens the advisory, controller, and FP&A career bands.', outcome: 'Enrolled in professional qualification' },
          { action: 'Learn QuickBooks or Xero at admin level (both have free certifications)', why: 'Accounting tech fluency is now a floor skill — not a differentiator.', outcome: 'Cloud accounting platform certification' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build Financial Modelling Skills', actions: [
          { action: 'Complete Financial Edge (or CFI) Financial Modelling Fundamentals course', why: 'Modelling is the core skill separating bookkeepers from FP&A analysts at 2x the salary.', outcome: '3-statement model in portfolio' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Transition to FP&A or Controller', actions: [
          { action: 'Apply for FP&A Analyst or Assistant Controller roles', why: 'With professional qualification progress + modelling skills, you qualify for the mid-level finance band.', outcome: '+30-40% salary, AI-resilient role' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Financial Storytelling', actions: [
          { action: 'Take a business partnering course (CIMA CGMA resources)', why: 'Business partnering transforms you from number-producer to strategic advisor — completely different salary band.', outcome: 'Business partnering skills framework' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advanced Modelling + Analytics', actions: [
          { action: 'Build a 3-statement integrated financial model for a public company using their annual report', why: 'Advanced modelling is the core FP&A skill that AI complements but cannot fully replace at senior levels.', outcome: 'Advanced model portfolio piece' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'FP&A or Financial Controller', actions: [
          { action: 'Target FP&A Analyst (Senior) or Financial Controller roles', why: '2-5 years accounting + modelling + business partnering = strong mid-finance profile.', outcome: 'Controller or FP&A Senior role, +40-50% salary' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Position as Finance Business Partner', actions: [
          { action: 'Volunteer to present the management accounts narrative at next board/exec meeting', why: 'Presenting financial insights to non-financial leaders is the Finance Business Partner core skill.', outcome: 'Demonstrated advisory presentation skill' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'CFO Skills Build', actions: [
          { action: 'Complete the ICAEW Corporate Finance qualification or a Mergers & Acquisitions course', why: 'Transaction capability expands your profile from comptroller to deal-advisor.', outcome: 'Corporate finance credential' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Finance Director or Fractional CFO', actions: [
          { action: 'Target Finance Director or Fractional CFO roles for SMEs', why: '5-10 years accounting + modelling + advisory = Director-level finance profile.', outcome: 'Director-level role or Fractional CFO income' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'CFO Operating Model Design', actions: [
          { action: 'Build your personal CFO operating model — how a modern finance function should be designed', why: 'Your decade of operational experience is the foundation for strategic finance advisory.', outcome: 'Finance transformation framework' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Fractional CFO or Finance Advisory', actions: [
          { action: 'Target 2 fractional CFO engagements (10-15 hrs/month at $200-400/hr)', why: 'Fractional CFO market is growing fast — senior finance knowledge commands premium advisory rates.', outcome: 'Consulting income stream' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CFO or Advisory Board', actions: [
          { action: 'Target Group CFO or Finance Advisory Board roles', why: '10-20 years finance depth is CFO territory — AI handles the execution but CFOs drive strategy.', outcome: 'CFO or advisory board role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Finance Leadership Authority', actions: [
          { action: 'Publish a definitive guide to finance transformation in the AI era', why: 'Your 20 years spans pre-ERP to AI — this institutional knowledge is uniquely valuable.', outcome: 'Thought leadership piece + speaking opportunities' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Board and Advisory Network', actions: [
          { action: 'Join ICAEW or CIMA board-level networks and position for audit committee or finance committee roles', why: 'Board finance roles are institutionally required to be human — AI cannot be on a board.', outcome: 'Board finance committee opportunity' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board or Group CFO', actions: [
          { action: 'Target Group CFO, Finance Director, or NED/Audit Committee roles on listed or PE-backed boards', why: '20 years finance depth + advisory track = board finance authority.', outcome: 'Board-level role' },
        ]},
      },
    },
    inactionScenario: 'Bookkeeping and routine accounting are being automated at the function level, not just the task level. AICPA reports 40% of accounting firms plan to eliminate as many as 50% of repetitive processing roles by 2026. If you continue in pure transactional accounting without moving to advisory, FP&A, or controllership, your role will be consolidated into an AI system within 2-3 years.',
    riskTrend: [
      { year: 2024, riskScore: 82, label: 'Now' },
      { year: 2025, riskScore: 88, label: '+1yr' },
      { year: 2026, riskScore: 91, label: '+2yr' },
      { year: 2027, riskScore: 94, label: '+3yr' },
    ],
    confidenceScore: 92,
  },

  fin_payroll: {
    displayRole: 'Payroll Specialist / Administrator',
    summary: '90% task automatability. End-to-end payroll processing is almost fully automated — AI-powered HCM platforms handle calculation, compliance, and payments.',
    skills: {
      obsolete: [
        { skill: 'Salary calculation and payslip generation', riskScore: 94, riskType: 'Automatable', horizon: '1-3yr', reason: 'ADP, Sage People, and Workday automate the entire payroll calculation and payslip generation cycle.', aiReplacement: 'Full', aiTool: 'ADP, Workday, Sage People' },
        { skill: 'Statutory compliance filing (PF, ESI, TDS)', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'Compliance automation tools handle regulatory filings with up-to-date statutory rules.', aiReplacement: 'Full' },
        { skill: 'Standard payroll reports', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'HCM platforms generate all standard payroll reports on schedule.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Complex payroll exception handling', riskScore: 62, riskType: 'Augmented', horizon: '3-5yr', reason: 'Novel edge cases and employee disputes still require human judgment.', aiReplacement: 'Partial' },
        { skill: 'Multi-country payroll coordination', riskScore: 58, riskType: 'Augmented', horizon: '3-5yr', reason: 'Cross-jurisdiction complexity still creates edge cases requiring specialist knowledge.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'People Analytics', whySafe: 'Workforce planning, compensation benchmarking, and organizational design require strategic thinking beyond payroll processing.', longTermValue: 92, difficulty: 'High', resource: 'SHRM People Analytics Cert' },
        { skill: 'HCM Platform Implementation', whySafe: 'Implementing, configuring, and training organizations on Workday/ADP is a specialist growing market.', longTermValue: 88, difficulty: 'Medium', resource: 'Workday certification programs' },
        { skill: 'Compensation Strategy', whySafe: 'Designing pay bands, equity plans, and total rewards strategies requires knowledge of business objectives and market dynamics.', longTermValue: 90, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'People Analytics Manager', riskReduction: 55, skillGap: 'People data analysis, Tableau or Power BI, workforce planning', transitionDifficulty: 'Hard', industryMapping: ['Large corporations', 'Tech companies'], salaryDelta: '+40–60%', timeToTransition: '9–15 months' },
      { role: 'Compensation & Benefits Specialist', riskReduction: 48, skillGap: 'Compensation philosophy, benchmarking methodology, equity plans', transitionDifficulty: 'Medium', industryMapping: ['Any corporate'], salaryDelta: '+25–45%', timeToTransition: '6–12 months' },
      { role: 'HCM Technology Consultant', riskReduction: 65, skillGap: 'Workday/ADP admin, implementation project management, change management', transitionDifficulty: 'Medium', industryMapping: ['HR Tech', 'Consulting', 'Any'], salaryDelta: '+50–80%', timeToTransition: '9–15 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Get HCM Platform Certified', actions: [
          { action: 'Get Workday HCM or ADP certified (both offer free training programs)', why: 'Platform expertise separates you from the role being automated — you become the admin of the automation.', outcome: 'HCM platform certification' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'People Analytics Foundation', actions: [
          { action: 'Complete Google Data Analytics certificate (Coursera, ~6 months, flexible pace)', why: 'Data analysis skills open the People Analytics career path.', outcome: 'Data analytics credential' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'HR Analyst or HCM Admin Role', actions: [
          { action: 'Apply for HR Data Analyst or HCM System Administrator roles', why: 'These roles command 40-60% more than payroll admin and are AI-augmented, not AI-replaced.', outcome: 'New role with analytics or admin focus' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Build Comp & Benefits Knowledge', actions: [
          { action: 'Study World at Work Total Rewards certification (or free CompTIA HR equivalents)', why: 'Compensation strategy is the strategic layer above payroll processing.', outcome: 'Total Rewards certification pathway' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Analytics + Comp Analysis', actions: [
          { action: 'Build a salary benchmarking report for your current organization using market data', why: 'This deliverable is what Compensation Analysts do daily — demonstrates strategic comp skill.', outcome: 'Salary benchmarking portfolio piece' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Compensation or HCM Specialist', actions: [
          { action: 'Target Compensation Analyst or HCM Specialist roles', why: '2-5 years payroll + comp analysis + platform skills = strategic HR profile.', outcome: '+40-55% salary in resilient role' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Strategic Comp Leadership', actions: [
          { action: 'Lead your next salary review cycle and design the framework, not just execute it', why: 'Strategic ownership of comp design is the dividing line between analyst and manager.', outcome: 'Demonstrated strategic comp leadership' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Workforce Planning', actions: [
          { action: 'Build a workforce planning model linking headcount to business plan assumptions', why: 'Workforce planning is the most strategic adjacent analytical skill you can add.', outcome: 'Workforce planning model portfolio piece' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Head of Comp & Benefits or HCM Lead', actions: [
          { action: 'Target Head of Compensation & Benefits or HCM Program Lead roles', why: '5-10 years payroll + strategic comp + workforce planning = senior HRIS/comp profile.', outcome: 'Senior HR leadership role, +60-80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Total Rewards Architecture', actions: [
          { action: 'Design a total rewards strategy framework for your current organization', why: 'Total rewards architecture is a CHRO-adjacent skill that commands high advisory rates.', outcome: 'Strategic total rewards framework' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'HR Technology Advisory', actions: [
          { action: 'Pitch 2 HCM implementation advisory projects to your network or external contacts', why: 'HCM implementation expertise at senior level = $200-350/hr consulting.', outcome: 'Consulting pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'VP HR or CHRO Track', actions: [
          { action: 'Target VP of HR Operations or Executive Director of Total Rewards', why: '10-20 years HR Operations + strategic comp + tech = VP HR executive profile.', outcome: 'VP-level HR leadership' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'HR Philosophy Thought Leadership', actions: [
          { action: 'Write a definitive piece on the future of compensation design in the AI era', why: '20 years of TR experience across economic cycles = uniquely authoritative perspective.', outcome: 'HR thought leadership publication' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'CHRO or Advisory Board', actions: [
          { action: 'Target CHRO roles or HR advisory board seats at scale-up companies', why: 'People strategy at the executive level is irreducibly human — technology enables but cannot replace the CHRO.', outcome: 'CHRO role or advisory board seat' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board Level HR', actions: [
          { action: 'Join nomination/remuneration committee as Non-Executive Director', why: 'NED on remuneration committees requires exactly your depth of compensation and HR knowledge.', outcome: 'NED board seat' },
        ]},
      },
    },
    inactionScenario: 'Payroll processing is one of the fastest roles to reach near-complete automation. Cloud HCM platforms have reduced payroll headcount 60-80% in organizations that have migrated. The payroll specialist role as a standalone function is becoming extinct — consolidated into AI-run systems with minimal human oversight. Without pivoting to strategy, analytics, or technology, this role faces elimination within 18-36 months.',
    riskTrend: [
      { year: 2024, riskScore: 86, label: 'Now' },
      { year: 2025, riskScore: 91, label: '+1yr' },
      { year: 2026, riskScore: 94, label: '+2yr' },
      { year: 2027, riskScore: 97, label: '+3yr' },
    ],
    confidenceScore: 93,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOFTWARE ENGINEERING ROLES
  // ─────────────────────────────────────────────────────────────────────────

  sw_backend: {
    displayRole: 'Backend Software Engineer',
    summary: '64% task automatability for routine backend work. AI tools like GitHub Copilot and Cursor automate boilerplate and CRUD logic, but complex systems still need human engineers.',
    skills: {
      obsolete: [
        { skill: 'CRUD API boilerplate generation', riskScore: 88, riskType: 'Automatable', horizon: '1-3yr', reason: 'Copilot, Cursor, and Devin generate complete CRUD APIs from specifications with minimal human input.', aiReplacement: 'Full', aiTool: 'GitHub Copilot, Cursor, Devin' },
        { skill: 'Standard unit test writing from spec', riskScore: 85, riskType: 'Automatable', horizon: '1-3yr', reason: 'Test generation tools auto-produce full test suites from existing code and function signatures.', aiReplacement: 'Full', aiTool: 'Copilot, TestPilot' },
        { skill: 'Database schema and migration script generation', riskScore: 80, riskType: 'Automatable', horizon: '1-3yr', reason: 'LLMs generate schema migrations from requirements documents with high accuracy.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Performance optimisation (standard patterns)', riskScore: 65, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI can suggest common optimizations but diagnosing complex distributed system bottlenecks still requires human depth.', aiReplacement: 'Partial' },
        { skill: 'API design (standard REST)', riskScore: 62, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI generates API designs but architectural decisions around consistency, evolution, and contracts need human judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Distributed Systems Architecture', whySafe: 'Designing CAP theorem tradeoffs, consensus protocols, and failure domain analysis under real constraints requires engineering judgment that AI only approximates.', longTermValue: 95, difficulty: 'High' },
        { skill: 'AI Systems Engineering (LLMOps)', whySafe: 'Building, deploying, and operating LLM-powered systems is an emerging specialty with extreme demand and no AI replacement.', longTermValue: 97, difficulty: 'High', resource: 'LangChain, LlamaIndex, Weights & Biases' },
        { skill: 'Legacy System Integration', whySafe: 'Institutional knowledge of legacy codebases, undocumented behaviors, and organizational context cannot be AI-generated.', longTermValue: 85, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'AI/LLM Systems Engineer', riskReduction: 65, skillGap: 'LangChain, vector databases, RAG architectures, LLM API integration', transitionDifficulty: 'Medium', industryMapping: ['Tech', 'SaaS', 'AI companies'], salaryDelta: '+30–60%', timeToTransition: '6–12 months' },
      { role: 'Platform / Infrastructure Engineer', riskReduction: 55, skillGap: 'Kubernetes internals, distributed systems, observability tooling', transitionDifficulty: 'Hard', industryMapping: ['Tech', 'Cloud providers', 'Scale-ups'], salaryDelta: '+25–50%', timeToTransition: '9–18 months' },
      { role: 'Staff+ Engineer / Architect', riskReduction: 60, skillGap: 'System design, cross-team technical leadership, ADR writing', transitionDifficulty: 'Very Hard', industryMapping: ['Any tech company'], salaryDelta: '+40–80%', timeToTransition: '18–36 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'AI-Augmented Development', actions: [
          { action: 'Master GitHub Copilot, Cursor, and Claude Code API as daily workflow tools', why: 'The biggest differentiator for entry-level engineers is 10x output using AI tools.', outcome: 'Measurably faster delivery, demonstrable in standups' },
          { action: 'Build a RAG-based application (vector DB + LLM + query interface)', why: 'LLM application engineering is the fastest-growing demand in backend development.', outcome: 'AI application in portfolio', tool: 'LangChain, Supabase pgvector' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Distributed Systems Fundamentals', actions: [
          { action: 'Read "Designing Data-Intensive Applications" (Kleppmann) and implement one distributed system pattern', why: 'System design depth is the core senior engineering differentiator — AI cannot replace this judgment.', outcome: 'Distributed systems portfolio project' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'AI tools + Systems Depth in New Role', actions: [
          { action: 'Target Mid-level Backend or AI Integration Engineer roles', why: 'Entry-level engineers who are AI-native command 20-30% more at the mid level.', outcome: 'Mid-level role with AI focus' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'System Design Depth', actions: [
          { action: 'Complete "System Design Interview" course by Alex Xu and practice 10 design problems', why: 'System design mastery is the gateway to senior and staff engineering roles that AI cannot fill.', outcome: 'Demonstrable system design capability' },
          { action: 'Build a complete LLM-powered feature: RAG, tool-calling, streaming UI', why: 'Being an AI application builder at this stage differentiates you as a full AI-era engineer.', outcome: 'Production-grade AI feature in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Open Source or Observability', actions: [
          { action: 'Contribute meaningfully to a relevant open-source project or build with observability tooling (OpenTelemetry, Grafana)', why: 'Public code + observability thinking = strong staff engineer profile.', outcome: 'Public contributions on GitHub' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior Backend Engineer', actions: [
          { action: 'Target Senior Backend Engineer or AI Applications Engineer roles', why: '2-5 years + AI tools + systems design = strong senior engineering profile.', outcome: 'Senior role, +30-50% salary' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Technical Leadership', actions: [
          { action: 'Lead the architecture design for your next significant project end-to-end + write the ADR', why: 'Architecture ownership is the primary signal for Staff/Principal engineer promotion.', outcome: 'Architecture Decision Record + technical lead credit' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Cross-team Technical Impact', actions: [
          { action: 'Identify and solve a cross-team technical problem (observability, shared library, API standards)', why: 'Engineers who solve organizational-scale problems are Staff+ material.', outcome: 'Cross-team technical win, staff-level credit' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Staff Engineer or AI Architect', actions: [
          { action: 'Target Staff Engineer or Principal AI Systems Architect roles', why: '5-10 years + technical leadership + AI expertise = rare senior engineering profile.', outcome: 'Staff/Principal level role, +50-80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Technical Vision Setting', actions: [
          { action: 'Write a 12-month technical strategy document for your organization or team', why: 'Technical strategy documents are the CTO/Principal level deliverable — demonstrate this capability.', outcome: 'Technical strategy document for portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Engineering Culture & Speaking', actions: [
          { action: 'Present at a technical conference or start publishing engineering deep-dives on LinkedIn/blog', why: 'External technical authority drives inbound opportunities at distinguished and CTO level.', outcome: 'External technical authority signal' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Distinguished Engineer or CTO', actions: [
          { action: 'Target Distinguished Engineer, Principal Engineer, or VP Engineering / CTO roles', why: '10-20 years backend + architecture + thought leadership = engineering executive profile.', outcome: 'Executive or Distinguished engineering role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Technology Advisory', actions: [
          { action: 'Codify your engineering philosophy and architectural principles into a published manifesto', why: '20 years of system design across technology cycles is advisory-grade wisdom.', outcome: 'Engineering philosophy document + speaking pipeline' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Board and CTO Advisory', actions: [
          { action: 'Target CTO advisory board at 2-3 scale-up companies or Series A/B startups', why: 'Technical judgment from a 20-year veteran is exactly what early-stage CTOs need from advisors.', outcome: 'Technical advisory relationships' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Chief Architect or Tech Board', actions: [
          { action: 'Target Chief Architect, CTO, or Technical Board Member roles', why: 'Technical executive judgment is irreducibly human at the organization level.', outcome: 'Board or CTO role' },
        ]},
      },
    },
    inactionScenario: 'Backend engineers who continue writing only CRUD applications and boilerplate code without evolving to AI-native development, system architecture, or LLM engineering will find their output directly replicable by tools like Devin, Cursor Agent, and GPT-4o function calling. The $60-80k backend developer writing standard endpoints will face strong downward rate pressure within 2-3 years.',
    riskTrend: [
      { year: 2024, riskScore: 58, label: 'Now' },
      { year: 2025, riskScore: 63, label: '+1yr' },
      { year: 2026, riskScore: 67, label: '+2yr' },
      { year: 2027, riskScore: 70, label: '+3yr' },
    ],
    confidenceScore: 85,
  },

  sw_frontend: {
    displayRole: 'Frontend / React Developer',
    summary: '84% task automatability for standard UI work. v0, Lovable, and Bolt generate complete React UIs from prompts and screenshots.',
    skills: {
      obsolete: [
        { skill: 'UI component generation from Figma', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'v0.dev, Locofy, and Builder.io convert designs to production React code automatically.', aiReplacement: 'Full', aiTool: 'v0.dev, Locofy, Lovable' },
        { skill: 'Standard landing page building', riskScore: 88, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI-powered tools build complete marketing pages from briefs in minutes.', aiReplacement: 'Full' },
        { skill: 'Responsive CSS layout generation', riskScore: 86, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI generates responsive layouts that pass WCAG standards from wireframes.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Complex state management', riskScore: 60, riskType: 'Augmented', horizon: '3-5yr', reason: 'Complex Zustand/Redux architectures for large applications still require architectural thinking.', aiReplacement: 'Partial' },
        { skill: 'Progressive web app optimization', riskScore: 62, riskType: 'Augmented', horizon: '3-5yr', reason: 'Service workers, caching strategies, and offline patterns require performance engineering judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Design System Architecture', whySafe: 'Designing token systems, component APIs, and accessibility patterns at the system level requires strategic design-engineering judgment.', longTermValue: 93, difficulty: 'High', resource: 'Brad Frost Atomic Design, Storybook' },
        { skill: 'Accessibility Engineering (WCAG Advanced)', whySafe: 'Complex accessibility implementations for disabled users — especially cognitive and motor — require deep empathy and engineering skill.', longTermValue: 90, difficulty: 'High' },
        { skill: 'Performance Engineering (Core Web Vitals)', whySafe: 'Diagnosing LCP, CLS, INP issues in complex applications requires profiling expertise that AI only partially addresses.', longTermValue: 88, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Full-Stack AI Application Developer', riskReduction: 50, skillGap: 'Backend basics (Node/Python), LLM APIs, database design', transitionDifficulty: 'Medium', industryMapping: ['SaaS', 'Startups', 'AI companies'], salaryDelta: '+20–40%', timeToTransition: '6–12 months' },
      { role: 'Design Systems Engineer', riskReduction: 58, skillGap: 'Token architecture, component API design, accessibility deep dive', transitionDifficulty: 'Hard', industryMapping: ['Large tech companies', 'Design agencies'], salaryDelta: '+30–60%', timeToTransition: '12–18 months' },
      { role: 'Developer Experience (DevX) Engineer', riskReduction: 60, skillGap: 'CLI tooling, build systems, documentation engineering', transitionDifficulty: 'Hard', industryMapping: ['Platform companies', 'Developer tools'], salaryDelta: '+35–60%', timeToTransition: '12–18 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Full-Stack + AI Integration', actions: [
          { action: 'Build a complete AI-powered application: React frontend + AI API integration + database', why: 'Full-stack AI apps are the highest-demand entry-level frontend project.', outcome: 'AI application in portfolio', tool: 'Next.js, Vercel AI SDK' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Performance and Accessibility', actions: [
          { action: 'Complete a Core Web Vitals course and achieve green scores on a real project', why: 'Performance engineering is an AI-resilient specialist skill not easily automated.', outcome: 'CWV optimization portfolio project' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Full-Stack AI Developer Role', actions: [
          { action: 'Target Full-Stack Developer or AI Applications Developer roles', why: 'Full-stack + AI integration = the most in-demand frontend profile for 2026.', outcome: 'New role, +20-40% salary' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Design Systems or Performance', actions: [
          { action: 'Build a complete design system with tokens, components, and documentation in Storybook', why: 'Design systems engineering is one of the most AI-resilient frontend specializations.', outcome: 'Complete design system in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Architecture Ownership', actions: [
          { action: 'Architect the frontend for a new project end-to-end: folder structure, state management, data fetching strategy, routing', why: 'Architecture decisions require judgment AI cannot fully replicate at this level of complexity.', outcome: 'Documented frontend architecture decision' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior Frontend or Design Systems', actions: [
          { action: 'Target Senior Frontend Engineer or Design Systems Engineer roles', why: '2-5 years + architecture + design systems = strong senior frontend profile.', outcome: '+35-50% salary in resilient specialization' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Technical Frontend Leadership', actions: [
          { action: 'Lead your organization\'s frontend guild/chapter and define coding standards', why: 'Technical leadership and standards-setting is a staff-level activity that AI cannot perform.', outcome: 'Technical leadership credit' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Developer Experience Strategy', actions: [
          { action: 'Document and improve your team\'s local development experience: tooling, CI/CD, testing framework', why: 'DevX strategy is an emerging staff-level function in high-growth organizations.', outcome: 'Developer experience improvement project' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Staff Engineer or Engineering Manager', actions: [
          { action: 'Target Staff Frontend Engineer or move to Engineering Manager track', why: '5-10 years + design systems + leadership = staff or EM material.', outcome: 'Staff or EM role, +50-70% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Frontend Architecture Thought Leadership', actions: [
          { action: 'Publish a definitive guide to frontend architecture in the AI component-generation era', why: 'Frontend architects with opinions on AI tool integration are uniquely positioned.', outcome: 'Thought leadership piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Principal or VP Engineering', actions: [
          { action: 'Target Principal Engineer or VP of Frontend Engineering roles at scale-up companies', why: '10+ years frontend + architecture + thought leadership = VP/Principal territory.', outcome: 'VP or Principal role' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CTO Track', actions: [
          { action: 'Target Head of Engineering or CTO roles at product companies', why: 'Engineering leadership at the executive level is irreplaceable by AI.', outcome: 'Engineering executive role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Web Platform Evolution Advisory', actions: [
          { action: 'Write a retrospective on how the web platform has evolved and where it\'s headed in the AI era', why: 'Very few people have 20 years of web development perspective — this is uniquely authoritative.', outcome: 'Historical web technology analysis' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory and Venture', actions: [
          { action: 'Join technical advisory boards at web/developer tool companies', why: 'Your platform perspective is exactly what product-led developer tool companies need from advisors.', outcome: 'Technical advisory relationships' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CTO or Technical Board', actions: [
          { action: 'Target CTO or Technical Board Member at established product or developer tool companies', why: '20 years web engineering = CTO-caliber judgment on platform evolution.', outcome: 'Executive or board role' },
        ]},
      },
    },
    inactionScenario: 'Frontend development for standard UI work is increasingly viable with AI tools that non-technical product managers can use directly. Companies like Vercel, Lovable, and Bolt are commoditizing the production of standard React UIs. Junior frontend engineers who only write components and hook up APIs will face strong downward rate pressure as AI tools lower the cost of UI production.',
    riskTrend: [
      { year: 2024, riskScore: 74, label: 'Now' },
      { year: 2025, riskScore: 79, label: '+1yr' },
      { year: 2026, riskScore: 83, label: '+2yr' },
      { year: 2027, riskScore: 85, label: '+3yr' },
    ],
    confidenceScore: 86,
  },

  sw_devops: {
    displayRole: 'DevOps / Infrastructure Engineer',
    summary: '54% task automatability. CI/CD pipelines and IaC boilerplate are AI-generated, but complex failure diagnosis and architecture require human engineering.',
    skills: {
      obsolete: [
        { skill: 'Standard CI/CD pipeline configuration', riskScore: 82, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI generates GitHub Actions, GitLab CI, and CircleCI configs from requirements.', aiReplacement: 'Full', aiTool: 'GitHub Copilot, Terraform AI' },
        { skill: 'IaC boilerplate (Terraform, Pulumi)', riskScore: 78, riskType: 'Automatable', horizon: '1-3yr', reason: 'Copilot and Claude generate complete Terraform modules from architecture diagrams.', aiReplacement: 'Full' },
        { skill: 'Kubernetes deployment YAML generation', riskScore: 76, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI tools generate K8s manifests from application requirements with high accuracy.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Cloud cost optimization', riskScore: 60, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI tools suggest optimizations but strategic decisions balancing cost, reliability, and team capacity require human judgment.', aiReplacement: 'Partial' },
        { skill: 'SRE metrics and alerting setup', riskScore: 55, riskType: 'Augmented', horizon: '3-5yr', reason: 'Standard monitoring is template-driven but defining meaningful SLOs and alert thresholds requires system understanding.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Novel Infrastructure Failure Diagnosis', whySafe: 'Cascading failures in complex distributed systems require deep systems expertise, institutional knowledge, and creative debugging.', longTermValue: 95, difficulty: 'High' },
        { skill: 'Platform Engineering (Internal Developer Platform)', whySafe: 'Designing the developer experience for an internal platform requires understanding organizational constraints AI cannot model.', longTermValue: 93, difficulty: 'High', resource: 'Platform Engineering books, CNCF resources' },
        { skill: 'FinOps & Cloud Economics Strategy', whySafe: 'Strategic cloud spending decisions involve organizational, technical, and financial tradeoffs requiring executive judgment.', longTermValue: 90, difficulty: 'Medium', resource: 'FinOps Foundation certification' },
      ],
    },
    careerPaths: [
      { role: 'Platform Engineer', riskReduction: 52, skillGap: 'Internal developer platforms, Backstage, dev experience tooling', transitionDifficulty: 'Hard', industryMapping: ['Large tech', 'Scale-ups'], salaryDelta: '+25–45%', timeToTransition: '9–18 months' },
      { role: 'AI Infrastructure Engineer', riskReduction: 58, skillGap: 'LLM deployment (vLLM, Triton), vector DBs, GPU infrastructure', transitionDifficulty: 'Hard', industryMapping: ['AI companies', 'Tech'], salaryDelta: '+40–70%', timeToTransition: '9–15 months' },
      { role: 'Cloud FinOps Specialist', riskReduction: 50, skillGap: 'FinOps certification, cloud cost analysis, tagging strategy', transitionDifficulty: 'Medium', industryMapping: ['Any cloud-native company'], salaryDelta: '+20–40%', timeToTransition: '6–9 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Platform Engineering Foundation', actions: [
          { action: 'Get Kubernetes CKA certification', why: 'CKA is the most recognized container orchestration credential and opens Platform Engineering roles.', outcome: 'CKA certification', tool: 'killer.sh practice environment' },
          { action: 'Deploy a GPU-backed model inference endpoint (even small model)', why: 'AI infrastructure capability is the highest-growth DevOps specialization in 2026.', outcome: 'AI inference infrastructure demo' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Observability and SRE', actions: [
          { action: 'Implement full observability stack: traces (Tempo), metrics (Prometheus), logs (Loki)', why: 'Observability engineering is a highly valued SRE skill that AI cannot fully automate.', outcome: 'Complete observability stack portfolio project' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Platform or AI Infrastructure Role', actions: [
          { action: 'Target Platform Engineer or AI Infrastructure Engineer roles', why: 'CKA + AI infra + observability = strong mid-level platform profile.', outcome: 'Platform role, +30-50% salary' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Internal Developer Platform', actions: [
          { action: 'Build a proof-of-concept Internal Developer Platform using Backstage or Port', why: 'Platform Engineering is the DevOps evolution that commands +30% above standard DevOps rates.', outcome: 'IDP demo in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'AI Model Serving', actions: [
          { action: 'Deploy a production-grade LLM endpoint with vLLM, auto-scaling, and monitoring', why: 'AI serving infrastructure is the highest-growth specialty in DevOps/Infrastructure.', outcome: 'LLM serving infrastructure portfolio project' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior Platform or AI Infra', actions: [
          { action: 'Target Senior DevOps Engineer (AI focus) or Platform Engineer Lead', why: '2-5 years DevOps + IDP + AI infra = exceptional mid-senior profile.', outcome: '+40-60% salary in high-demand specialty' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Infrastructure Architecture', actions: [
          { action: 'Design and document a full infrastructure architecture proposal for a new system', why: 'Architecture ownership is the Staff SRE / Principal Engineer gate.', outcome: 'Infrastructure architecture document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'FinOps and Cloud Strategy', actions: [
          { action: 'Get FinOps Foundation certification and conduct a cloud spend analysis', why: 'Cloud economics strategy is a senior function that combines financial and technical judgment.', outcome: 'FinOps certification + cost analysis report' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Staff SRE or Head of Infrastructure', actions: [
          { action: 'Target Staff SRE, Principal Infrastructure Engineer, or Head of Platform Engineering', why: '5-10 years DevOps + architecture + FinOps = senior infrastructure leadership.', outcome: 'Staff/Head role, +50-80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'CTO / VP Engineering Track', actions: [
          { action: 'Write a formal infrastructure strategy for the next 2 years at your organization', why: 'Strategic infrastructure thinking is VP Engineering/CTO-level work.', outcome: 'Infrastructure strategy document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Speaking and Thought Leadership', actions: [
          { action: 'Present at KubeCon, DevOpsDays, or similar conferences', why: 'External technical authority drives the inbound pipeline for VP and CTO roles.', outcome: 'Conference talk accepted/delivered' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'VP Engineering or CTO', actions: [
          { action: 'Target VP of Engineering, Head of Infrastructure, or CTO roles', why: '10-20 years DevOps + architecture + leadership is executive engineering territory.', outcome: 'Engineering executive role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'System Design Authority', actions: [
          { action: 'Write a comprehensive guide to infrastructure evolution: bare metal → cloud → AI-native', why: '20 years covers the entire infrastructure evolution — uniquely valuable historical perspective.', outcome: 'Thought leadership publication' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory and Investment', actions: [
          { action: 'Join infrastructure/cloud advisory boards at AI companies or infrastructure startups', why: 'Infrastructure advisors with cloud-native + AI experience are in high demand.', outcome: 'Advisory board pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CTO or Technical Board', actions: [
          { action: 'Target CTO or Technical Board Member roles', why: '20 years of infrastructure judgment is board-level technology advisory.', outcome: 'CTO or board role' },
        ]},
      },
    },
    inactionScenario: 'DevOps engineers who only write pipelines and Terraform will find AI tools directly competing with their output. GitHub Actions templates are largely AI-generated already. The $65-85k DevOps engineer doing standard configuration work faces commoditization by AI-powered infrastructure tools within 2-3 years.',
    riskTrend: [
      { year: 2024, riskScore: 50, label: 'Now' },
      { year: 2025, riskScore: 55, label: '+1yr' },
      { year: 2026, riskScore: 58, label: '+2yr' },
      { year: 2027, riskScore: 62, label: '+3yr' },
    ],
    confidenceScore: 82,
  },

  sw_arch: {
    displayRole: 'Software Architect / Solutions Architect',
    summary: '22% task automatability. This is one of the most AI-resilient engineering roles — complex system design under real organizational, technical, and business constraints is deeply human.',
    skills: {
      obsolete: [
        { skill: 'Standard architecture decision record templates', riskScore: 65, riskType: 'Automatable', horizon: '3-5yr', reason: 'AI generates ADR templates but the decision and rationale must come from human architectural judgment.', aiReplacement: 'Partial' },
        { skill: 'Boilerplate technology comparison documents', riskScore: 72, riskType: 'Automatable', horizon: '3-5yr', reason: 'AI can compile feature matrices but strategic choice requires organizational context.', aiReplacement: 'Partial' },
      ],
      at_risk: [
        { skill: 'Standard microservices design patterns', riskScore: 55, riskType: 'Augmented', horizon: '3-5yr', reason: 'Common patterns are well-documented and AI can generate them, but tailoring to constraints requires judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Long-term architectural vision under organizational uncertainty', whySafe: 'Architecture that must account for team skills, legacy constraints, business pivots, and budget realities requires leadership judgment no AI can replicate.', longTermValue: 98, difficulty: 'High' },
        { skill: 'Technology choice under build-vs-buy-vs-open-source trade-offs', whySafe: 'This decision involves vendor trust, team capability, longevity, and TCO — judgments requiring contextual organizational authority.', longTermValue: 96, difficulty: 'High' },
        { skill: 'Engineering culture and technical standards-setting', whySafe: 'Organizational influence and earning the trust of engineering teams is an irreducibly human function.', longTermValue: 97, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Chief AI Officer (CAIO)', riskReduction: 65, skillGap: 'AI strategy, LLM governance, enterprise AI procurement', transitionDifficulty: 'Very Hard', industryMapping: ['Enterprise companies', 'Large corporations'], salaryDelta: '+60–120%', timeToTransition: '18–36 months' },
      { role: 'AI Systems Architect', riskReduction: 55, skillGap: 'LLM architectures, vector databases, RAG at scale, AI safety basics', transitionDifficulty: 'Hard', industryMapping: ['AI companies', 'Tech giants', 'Scale-ups'], salaryDelta: '+40–80%', timeToTransition: '12–24 months' },
      { role: 'Technology Advisory / CTO-as-a-Service', riskReduction: 60, skillGap: 'Executive communication, stakeholder management, advisory business model', transitionDifficulty: 'Medium', industryMapping: ['Consulting', 'PE-backed companies', 'Scale-ups'], salaryDelta: '+50–100%', timeToTransition: '12–18 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Deep Systems + AI Architectures', actions: [
          { action: 'Complete the Cloud Architecture certifications (AWS Solutions Architect, Google Professional Cloud Architect)', why: 'Cloud architecture certifications are the base credential for systems architecture roles.', outcome: 'Cloud architecture certification' },
          { action: 'Deep-dive into LLM architecture patterns: RAG, fine-tuning, agent architectures', why: 'AI systems architecture is the fastest-growing architecture specialization.', outcome: 'AI architecture knowledge portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Design a Real System', actions: [
          { action: 'Design and document a complete system architecture for a real or hypothetical complex system (e-commerce at scale, ML pipeline, etc.)', why: 'Architecture documents are the primary portfolio piece for this role.', outcome: 'Complete system architecture document' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Junior Architecture Role', actions: [
          { action: 'Target Software Architect (Junior/Associate) or Solutions Architect roles', why: 'Architecture roles command $90-140k entry-level — significantly above engineer roles.', outcome: 'Architecture role, significant salary jump' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Architecture Portfolio', actions: [
          { action: 'Document 3 architecture decisions you have made with their rationale, alternatives considered, and outcomes', why: 'ADRs are the professional currency of architects.', outcome: 'ADR portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Enterprise Architecture Standards', actions: [
          { action: 'Learn and apply an enterprise architecture framework (TOGAF lite, C4 Model)', why: 'Framework fluency is required for enterprise and consulting architecture roles.', outcome: 'EA framework application' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Solutions Architect or Enterprise Architect', actions: [
          { action: 'Target Solutions Architect at cloud provider (AWS, Azure, Google) or Enterprise Architect at large firm', why: 'Cloud provider SA roles pay $130-200k and lead to AI Architect tracks.', outcome: 'Senior architecture role' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'AI Strategy Ownership', actions: [
          { action: 'Lead your organization\'s AI platform architecture — design the LLM governance, data pipeline, and integration strategy', why: 'AI architecture ownership is the highest-value architect function in 2026.', outcome: 'AI platform architecture document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Executive Communication', actions: [
          { action: 'Present a technical strategy to non-technical executives and get explicit feedback', why: 'Executive communication is the gate to Principal Architect and above.', outcome: 'Demonstrated executive communication capability' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Principal Architect or CTO Track', actions: [
          { action: 'Target Principal Architect, Distinguished Engineer, or CTO track roles', why: '5-10 years architecture + AI + executive communication = senior architecture territory.', outcome: 'Principal or Distinguished Architect role, $200k+' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'CTO / CAIO Positioning', actions: [
          { action: 'Develop an enterprise AI architecture framework — your intellectual property on how organizations should architect AI systems', why: 'Proprietary frameworks are the consulting founder and CTO advisory currency.', outcome: 'Enterprise AI architecture framework' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory and Speaking', actions: [
          { action: 'Present at enterprise architecture conferences (EA Konferenz, Gartner IT Symposium)', why: 'Conference keynotes at enterprise architecture level drive CTO and advisory inbound.', outcome: 'Speaking engagement + advisory pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CTO or CAIO', actions: [
          { action: 'Target CTO, Chief Architect, or CAIO roles at enterprise organizations', why: '10-20 years architecture + AI strategy + speaking = CTO/CAIO executive profile.', outcome: 'C-suite executive role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Technology Board Authority', actions: [
          { action: 'Write a 10-year technology evolution thesis based on 20 years of architectural pattern observation', why: 'You have seen multiple full technology cycles — this perspective is board-advisory gold.', outcome: 'Technology thesis document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Board and Investment', actions: [
          { action: 'Join technology advisory boards at PE firms or late-stage AI companies', why: 'PE firms actively seek seasoned technology executives with 20+ year track records.', outcome: 'Board advisory pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board of Directors or CTO Emeritus', actions: [
          { action: 'Target Board of Directors (technology committee) or CTO Emeritus positions at major organizations', why: '20 years architectural judgment is irreplaceable at the board level.', outcome: 'Board seat or executive advisory' },
        ]},
      },
    },
    inactionScenario: 'Software architects are relatively protected — but architects who only apply known patterns without developing AI strategy capabilities or organizational influence will find their value eroding as AI tools democratize standard architectural knowledge. The premium is increasingly on those who architect AI systems and communicate technical vision to executives.',
    riskTrend: [
      { year: 2024, riskScore: 22, label: 'Now' },
      { year: 2025, riskScore: 25, label: '+1yr' },
      { year: 2026, riskScore: 28, label: '+2yr' },
      { year: 2027, riskScore: 30, label: '+3yr' },
    ],
    confidenceScore: 88,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HR ROLES
  // ─────────────────────────────────────────────────────────────────────────

  hr_recruit: {
    displayRole: 'Recruiter / Talent Acquisition Specialist',
    summary: '70% task automatability. AI screens CVs, generates JDs, and schedules interviews — the administrative layer of recruiting is fully automated.',
    skills: {
      obsolete: [
        { skill: 'CV/resume screening and ranking', riskScore: 95, riskType: 'Automatable', horizon: '1-3yr', reason: 'Greenhouse AI, Workday AI, and HireVue screen thousands of applicants automatically.', aiReplacement: 'Full', aiTool: 'Greenhouse AI, HireVue, Paradox Olivia' },
        { skill: 'Job description generation', riskScore: 91, riskType: 'Automatable', horizon: '1-3yr', reason: 'Textio, Otta AI, and GPT-4o generate compliant, bias-corrected JDs from role briefs.', aiReplacement: 'Full', aiTool: 'Textio, ChatGPT' },
        { skill: 'Standard interview question generation', riskScore: 85, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI generates competency-based question banks from role specifications.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Candidate relationship management', riskScore: 60, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI sends follow-ups but building genuine candidate relationships still requires human recruitment.', aiReplacement: 'Partial' },
        { skill: 'Employer brand outreach', riskScore: 55, riskType: 'Augmented', horizon: '3-5yr', reason: 'Personalised outreach to passive candidates still benefits from human authenticity.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Strategic Talent Intelligence', whySafe: 'Identifying talent pools, market mapping, and competitive intelligence for critical hires requires strategic business acumen.', longTermValue: 93, difficulty: 'High', resource: 'LinkedIn Talent Insights certification' },
        { skill: 'Executive Search', whySafe: 'C-suite and VP-level search requires confidential relationship networks, deep judgment, and organizational navigation.', longTermValue: 92, difficulty: 'High' },
        { skill: 'Employer Brand Strategy', whySafe: 'Building a compelling employer narrative, managing candidate experience, and shaping culture perception requires human creativity.', longTermValue: 90, difficulty: 'Medium' },
      ],
    },
    careerPaths: [
      { role: 'Talent Intelligence Specialist', riskReduction: 55, skillGap: 'LinkedIn Talent Insights, market mapping, competitor talent analysis', transitionDifficulty: 'Medium', industryMapping: ['Any large corporation', 'RPO firms'], salaryDelta: '+30–50%', timeToTransition: '6–12 months' },
      { role: 'Employer Brand Manager', riskReduction: 50, skillGap: 'Content strategy, EVP development, social media, employee advocacy', transitionDifficulty: 'Medium', industryMapping: ['Any'], salaryDelta: '+20–40%', timeToTransition: '6–9 months' },
      { role: 'People Analytics Lead', riskReduction: 58, skillGap: 'SQL, Python basics, HR data modelling, Tableau/Power BI', transitionDifficulty: 'Hard', industryMapping: ['Large tech', 'Corporates'], salaryDelta: '+40–65%', timeToTransition: '9–15 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Talent Intelligence Skills', actions: [
          { action: 'Complete LinkedIn Recruiter Certification and LinkedIn Talent Insights training', why: 'Talent intelligence tools are the AI-resilient layer of recruiting — strategy over screening.', outcome: 'LinkedIn Intelligence certifications' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Employer Brand Contribution', actions: [
          { action: 'Contribute to your company\'s employer brand: write 3 employee stories, launch a culture campaign', why: 'Employer brand is the creative, strategic layer of TA that AI cannot fully replace.', outcome: 'Portfolio of employer brand content' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Talent Strategy or EB Role', actions: [
          { action: 'Target Talent Intelligence Analyst or Employer Brand Coordinator roles', why: 'These roles are 30-50% more AI-resistant than screening and sourcing.', outcome: 'Strategic TA role, +25-35% salary' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Recruitment Ops + Analytics', actions: [
          { action: 'Build a recruiting funnel analytics dashboard for your team using existing ATS data', why: 'Recruiting analytics is the bridge from recruiter to TA Ops or People Analytics.', outcome: 'Analytics dashboard in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Strategic Sourcing', actions: [
          { action: 'Run a talent market mapping project: who are the top 50 people at competitor companies in your target role?', why: 'Strategic market mapping is executive search territory — valuable and AI-resilient.', outcome: 'Market intelligence report' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior TA or People Analytics', actions: [
          { action: 'Target Senior Talent Acquisition Partner or TA Analytics roles', why: '2-5 years + analytics + strategic sourcing = strong senior TA profile.', outcome: '+40-55% salary, more strategic title' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'TA Technology Implementation', actions: [
          { action: 'Lead your organization\'s ATS upgrade or AI screening tool implementation', why: 'TA technology ownership is the Head of Talent Acquisition gate.', outcome: 'Technology implementation credit' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Executive Search Development', actions: [
          { action: 'Run 3 executive or senior leadership searches end-to-end including confidential outreach', why: 'Executive search experience is the most AI-resistant recruiting specialty — it pays 2-3x.', outcome: 'Executive search track record' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Head of Talent or Executive Search', actions: [
          { action: 'Target Head of Talent Acquisition or Executive Search Consultant roles', why: '5-10 years + exec search + tech implementation = TA leadership profile.', outcome: 'Leadership role, +60-80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Talent Strategy Architecture', actions: [
          { action: 'Design your organization\'s 3-year talent strategy: skills-based hiring roadmap, AI deployment plan', why: 'Talent strategy is CHRO-adjacent work that commands advisory rates.', outcome: 'Talent strategy framework' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory or TA Consulting', actions: [
          { action: 'Take on 2 TA consulting projects (fractional Head of TA, $150-250/hr)', why: '10 years TA expertise = consulting income that exceeds most in-house Head of TA roles.', outcome: 'Consulting income pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'VP TA or CHRO Track', actions: [
          { action: 'Target VP Talent Acquisition or CHRO roles at mid-market companies', why: '10-20 years TA + strategy + consulting = VP or CHRO executive profile.', outcome: 'VP or CHRO role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Talent Advisory Authority', actions: [
          { action: 'Write a definitive guide to talent acquisition transformation in the AI era', why: 'Your 20 years spans pre-LinkedIn to AI screening — this arc is uniquely authoritative.', outcome: 'Thought leadership piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory Board', actions: [
          { action: 'Join TA technology company advisory boards (applicant tracking, AI screening tools)', why: 'TA technology companies need veteran practitioners on their advisory boards.', outcome: 'Advisory board role' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CHRO or Advisory', actions: [
          { action: 'Target CHRO or Chief People Officer roles at mid-large organizations', why: '20 years talent acquisition is CHRO territory — people strategy at the executive level.', outcome: 'CHRO or advisory role' },
        ]},
      },
    },
    inactionScenario: 'Recruiting coordinators and volume hiring specialists are being automated at scale. Companies like Paradox (Olivia) eliminate the scheduling, screening, and initial outreach layer entirely. If you remain in high-volume screening and coordination without pivoting to talent intelligence, executive search, or people analytics, you face a 50% salary compression within 3 years as AI handles the volume work.',
    riskTrend: [
      { year: 2024, riskScore: 64, label: 'Now' },
      { year: 2025, riskScore: 70, label: '+1yr' },
      { year: 2026, riskScore: 74, label: '+2yr' },
      { year: 2027, riskScore: 78, label: '+3yr' },
    ],
    confidenceScore: 87,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEGAL ROLES
  // ─────────────────────────────────────────────────────────────────────────

  leg_paralegal: {
    displayRole: 'Paralegal / Legal Research Specialist',
    summary: '88% task automatability. Harvey AI, CoCounsel, and Lexis+ AI perform case research, document review, and memo drafting at scale.',
    skills: {
      obsolete: [
        { skill: 'Case law research and summarisation', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'Harvey AI and CoCounsel retrieve and synthesise case law in seconds, outperforming human research speed.', aiReplacement: 'Full', aiTool: 'Harvey AI, CoCounsel, Lexis+ AI' },
        { skill: 'Standard document review and tagging', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'eDiscovery AI tools classify and review millions of documents in hours vs. paralegal weeks.', aiReplacement: 'Full', aiTool: 'Relativity AI, Luminance' },
        { skill: 'Contract clause extraction', riskScore: 88, riskType: 'Automatable', horizon: '1-3yr', reason: 'Kira and Ironclad AI extract and analyse contract terms with 94%+ accuracy.', aiReplacement: 'Full', aiTool: 'Kira, Ironclad AI' },
      ],
      at_risk: [
        { skill: 'Client-facing paralegal intake', riskScore: 65, riskType: 'Augmented', horizon: '3-5yr', reason: 'Document collection and basic intake can be AI-managed but client trust and complex situations require human judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Legal Project Management', whySafe: 'Coordinating complex multi-party matters, managing timelines, and ensuring delivery across legal teams requires project leadership.', longTermValue: 92, difficulty: 'High', resource: 'CLPM (Certified Legal Project Manager) certification' },
        { skill: 'Legal Technology Implementation', whySafe: 'Implementing, configuring, and training on Harvey, Relativity, and Ironclad requires specialist expertise firms pay for.', longTermValue: 90, difficulty: 'Medium', resource: 'ILTACON Legal Technology training' },
        { skill: 'Complex Due Diligence Coordination', whySafe: 'M&A transactions with multiple workstreams, many parties, and tight deadlines require human project orchestration.', longTermValue: 88, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Legal Technology Specialist', riskReduction: 62, skillGap: 'Harvey AI, Relativity, Ironclad, legal project management basics', transitionDifficulty: 'Medium', industryMapping: ['Law firms', 'Legal tech companies', 'GC offices'], salaryDelta: '+40–70%', timeToTransition: '6–12 months' },
      { role: 'Legal Project Manager', riskReduction: 55, skillGap: 'Project management certification (PMP or CLPM), workflow tools', transitionDifficulty: 'Medium', industryMapping: ['Large law firms', 'General counsel offices'], salaryDelta: '+30–55%', timeToTransition: '9–15 months' },
      { role: 'Compliance Analyst', riskReduction: 48, skillGap: 'Regulatory frameworks, compliance software (NAVEX, Archer), audit skills', transitionDifficulty: 'Medium', industryMapping: ['Regulated industries', 'Finance', 'Healthcare'], salaryDelta: '+20–40%', timeToTransition: '6–12 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Legal Technology Credentials', actions: [
          { action: 'Get certified in Harvey AI, Relativity, or Ironclad (all offer training)', why: 'Being trained on the tools replacing your current work is the most direct transition path.', outcome: 'Legal technology certifications' },
          { action: 'Complete a Project Management Fundamentals course (PMBOK or Agile)', why: 'Legal PM skills separate you from pure paralegal and open a completely different title band.', outcome: 'PM fundamentals credential' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Legal Tech Portfolio', actions: [
          { action: 'Volunteer to lead your firm\'s legal tech onboarding project for a new tool', why: 'Implementation experience is the primary hiring signal for Legal Technology Specialist roles.', outcome: 'Implementation project credit' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Legal Technology or Project Role', actions: [
          { action: 'Apply for Legal Technology Specialist or Legal Project Coordinator roles', why: 'LegalTech roles pay 40-70% more than paralegal and are growing rapidly.', outcome: 'New role with technology focus' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Legal Ops Skills', actions: [
          { action: 'Get the CLOC (Corporate Legal Operations Consortium) Skills Certification', why: 'Legal Operations is the strategic layer above paralegal work — CLOC is the industry credential.', outcome: 'CLOC certification' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Process Improvement', actions: [
          { action: 'Map and redesign one major legal workflow in your organization using AI tools', why: 'Legal process improvement is a core Legal Ops competency firms are hiring for aggressively.', outcome: 'Legal workflow improvement case study' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Legal Operations or LPM', actions: [
          { action: 'Target Legal Operations Analyst or Legal Project Manager roles', why: '2-5 years paralegal + CLOC + process improvement = strong legal ops profile.', outcome: '+40-55% salary in resilient role' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Legal Ops Leadership', actions: [
          { action: 'Lead your firm\'s AI adoption project: evaluate, select, and implement one AI legal tool', why: 'AI implementation leadership is the Head of Legal Ops gate.', outcome: 'AI implementation project lead credit' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Commercial Awareness', actions: [
          { action: 'Complete a legal business management course (College of Law Business of Law program)', why: 'Commercial awareness combined with legal ops expertise = Director-level legal ops profile.', outcome: 'Legal business management credential' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Head of Legal Ops or Legal Tech', actions: [
          { action: 'Target Head of Legal Operations or Director of Legal Technology', why: '5-10 years paralegal + legal ops + AI implementation = senior legal operations.', outcome: 'Director-level legal ops role, +70-90% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'General Counsel Track', actions: [
          { action: 'Assess whether qualifying as a solicitor/barrister/attorney is viable (many jurisdictions recognize paralegal experience)', why: 'Qualifying as a lawyer removes the ceiling on your earnings and seniority.', outcome: 'Qualified lawyer pathway assessment' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Legal Consulting', actions: [
          { action: 'Pitch 2 legal operations consulting retainers to law firms or in-house legal teams', why: '10 years legal ops + tech = $200-350/hr consulting rates.', outcome: 'Consulting income pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Director Legal Ops or Consulting', actions: [
          { action: 'Target Director of Legal Operations at large law firm or GC office, or independent legal ops consulting', why: '10-20 years legal + ops + tech = senior advisory profile.', outcome: 'Senior leadership or consulting role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Legal Transformation Authority', actions: [
          { action: 'Write a guide on how legal workflows have transformed over 20 years and where AI takes them next', why: 'Your arc from pre-digital to AI-era legal practice is uniquely valuable institutional knowledge.', outcome: 'Thought leadership piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'LegalTech Advisory', actions: [
          { action: 'Join legal technology company advisory boards (Harvey AI, Ironclad, Relativity)', why: 'LegalTech companies need 20-year veteran practitioners to guide product development.', outcome: 'Advisory board role' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Advisory or Legal Ops Partner', actions: [
          { action: 'Target large law firm as Legal Operations Partner or join a legal consulting practice as Principal', why: '20 years legal knowledge is Partner and Principal territory in legal operations.', outcome: 'Partner or Principal role' },
        ]},
      },
    },
    inactionScenario: 'Paralegal and legal research functions are being consolidated into AI systems at law firms globally. Major firms including Dentons, Baker McKenzie, and Allen & Overy have deployed Harvey AI and are reducing junior legal support headcount. eDiscovery volumes now processed by 1 AI platform equal the annual output of 50 paralegals. Without pivoting to legal operations or technology, your position faces elimination or severe rate compression within 18-24 months.',
    riskTrend: [
      { year: 2024, riskScore: 82, label: 'Now' },
      { year: 2025, riskScore: 87, label: '+1yr' },
      { year: 2026, riskScore: 91, label: '+2yr' },
      { year: 2027, riskScore: 94, label: '+3yr' },
    ],
    confidenceScore: 90,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HEALTHCARE ROLES
  // ─────────────────────────────────────────────────────────────────────────

  hc_medical_coding: {
    displayRole: 'Medical Coder / Clinical Documentation Specialist',
    summary: '92% task automatability. AI-powered coding platforms (Nuance AI, Fathom, Optum) now assign ICD-10 and CPT codes with 96%+ accuracy.',
    skills: {
      obsolete: [
        { skill: 'Routine ICD-10/CPT code assignment', riskScore: 95, riskType: 'Automatable', horizon: '1-3yr', reason: 'Nuance AI, Fathom, and Optum automate standard code assignment with 96%+ accuracy.', aiReplacement: 'Full', aiTool: 'Nuance AI, Fathom, Ambience AI' },
        { skill: 'Standard claim form coding', riskScore: 93, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI reads clinical notes and assigns billing codes faster and more accurately than human coders for routine cases.', aiReplacement: 'Full' },
        { skill: 'Discharge summary processing', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'Ambient AI scribes generate and code discharge summaries in real-time from clinical conversations.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Complex case coding and audit', riskScore: 65, riskType: 'Augmented', horizon: '3-5yr', reason: 'Complex co-morbidities, unusual presentations, and audit exceptions still require human clinical coding expertise.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Clinical AI Audit and Quality', whySafe: 'Reviewing and validating AI coding outputs for compliance, accuracy, and revenue impact requires specialist coding + compliance expertise.', longTermValue: 93, difficulty: 'High', resource: 'AHIMA CDI certification' },
        { skill: 'Health Information Management Strategy', whySafe: 'Designing coding governance frameworks, training programs, and compliance audits requires strategic HIM leadership.', longTermValue: 90, difficulty: 'High' },
        { skill: 'Revenue Cycle Strategy', whySafe: 'Identifying revenue capture opportunities, denial management strategy, and payer relationship management requires business acumen.', longTermValue: 92, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Clinical AI Audit Specialist', riskReduction: 62, skillGap: 'AI coding tool QA workflows, compliance frameworks, audit methodology', transitionDifficulty: 'Medium', industryMapping: ['Hospitals', 'Health systems', 'Insurance'], salaryDelta: '+30–50%', timeToTransition: '6–12 months' },
      { role: 'Health Informatics Analyst', riskReduction: 58, skillGap: 'Epic/Cerner analytics, SQL basics, data visualization, HL7 FHIR basics', transitionDifficulty: 'Hard', industryMapping: ['Hospitals', 'Health tech'], salaryDelta: '+40–65%', timeToTransition: '9–18 months' },
      { role: 'Revenue Cycle Manager', riskReduction: 52, skillGap: 'Revenue cycle strategy, denial management, payer contract basics', transitionDifficulty: 'Medium', industryMapping: ['Hospitals', 'Physician groups'], salaryDelta: '+30–50%', timeToTransition: '9–15 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Health Informatics Foundation', actions: [
          { action: 'Enroll in AHIMA CDI Specialist (CDIP) or Health Data Analyst program', why: 'CDIP credential shifts your profile from coder to clinical informatics specialist.', outcome: 'CDI certification pathway started' },
          { action: 'Learn the basics of Epic or Cerner reporting modules', why: 'EHR analytics is the adjacent skill that opens Health Informatics roles.', outcome: 'EHR analytics basics' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'AI Coding Quality Focus', actions: [
          { action: 'Volunteer to audit AI coding outputs in your organization and document error patterns', why: 'This becomes your AI quality assurance portfolio — exactly what the new specialist role requires.', outcome: 'AI coding audit log and error analysis report' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Clinical AI Audit or Informatics Role', actions: [
          { action: 'Apply for CDI Specialist, Clinical Coding Quality Analyst, or Health Informatics roles', why: 'Moving from execution to quality/strategy increases salary 30-50% and dramatically increases AI resilience.', outcome: 'New clinical information management role' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Health Informatics Skills', actions: [
          { action: 'Complete the AHIMA Health Data Analyst certification', why: 'DATA analyst credentials open the Health Informatics career path from coding.', outcome: 'AHIMA data analyst credential' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'HL7 FHIR and Interoperability', actions: [
          { action: 'Complete an HL7 FHIR introductory course and understand how data flows between clinical systems', why: 'Health data interoperability is a specialized skill that is highly in-demand and not automated.', outcome: 'FHIR basics credential' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Health Informatics Analyst', actions: [
          { action: 'Target Health Informatics Analyst or Revenue Cycle Analytics roles', why: '2-5 years coding + informatics + FHIR = solid health informatics profile.', outcome: '+40-60% salary in analytical role' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Revenue Cycle Strategy', actions: [
          { action: 'Lead a denial analysis project: identify top 10 denial reasons and propose solutions', why: 'Revenue cycle strategy and denial management is a Director-level healthcare finance function.', outcome: 'Denial management analysis portfolio piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'HIM Leadership', actions: [
          { action: 'Complete AHIMA Health Informatics Management certification (CHDA or CHPS)', why: 'Senior HIM credentials open Director-level roles in hospital systems.', outcome: 'Senior HIM certification' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Healthcare Information Manager', actions: [
          { action: 'Target Director of Health Information Management or Revenue Cycle Manager', why: '5-10 years coding + informatics + strategy = HIM leadership profile.', outcome: 'Director-level HIM role, +60-80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Strategic HIM Leadership', actions: [
          { action: 'Design your hospital\'s AI coding governance framework: oversight standards, audit frequency, compliance metrics', why: 'This strategic document positions you as the HIM AI governance authority.', outcome: 'AI coding governance framework' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'HIM Consulting', actions: [
          { action: 'Pursue 2 healthcare consulting engagements on AI coding implementation', why: '10 years HIM + coding + AI governance = $150-300/hr healthcare consulting rates.', outcome: 'Healthcare consulting pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CHIM or Senior Director', actions: [
          { action: 'Target Chief Health Information Manager or VP Revenue Cycle at health systems', why: '10-20 years HIM + strategy + AI governance = senior health system leadership.', outcome: 'VP or Chief HIM role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'HIM Policy and Standards Leadership', actions: [
          { action: 'Publish on clinical coding standards in the AI era for AHIMA Journal or similar', why: '20 years HIM is expert-level voice in the profession — publishing builds advisory authority.', outcome: 'Professional publication' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'AHIMA Leadership and Advisory', actions: [
          { action: 'Run for AHIMA board elections or join HIM standards committees', why: 'Profession-level leadership at this experience level generates consulting and advisory opportunities.', outcome: 'Profession leadership role' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Board or Chief HIM', actions: [
          { action: 'Target Chief Health Information Officer (CHIO) or healthcare advisory board roles', why: '20 years HIM is CHIO executive territory at major health systems.', outcome: 'CHIO or advisory board role' },
        ]},
      },
    },
    inactionScenario: 'Medical coding is the healthcare function closest to full automation. Epic, Cerner, and standalone AI coding platforms are already replacing production coding departments. Health systems like Mass General Brigham have deployed ambient AI scribes that code in real-time during clinical encounters. If you remain in routine coding without developing quality oversight, informatics, or revenue cycle strategy skills, your position will be consolidated into AI automation within 18-24 months.',
    riskTrend: [
      { year: 2024, riskScore: 88, label: 'Now' },
      { year: 2025, riskScore: 92, label: '+1yr' },
      { year: 2026, riskScore: 95, label: '+2yr' },
      { year: 2027, riskScore: 97, label: '+3yr' },
    ],
    confidenceScore: 93,
  },

  hc_radiology: {
    displayRole: 'Radiologist / Radiology Technician',
    summary: '68% task automatability for routine interpretation. Med-Gemini and specialized radiology AI match specialist accuracy on standard scans in 12+ categories.',
    skills: {
      obsolete: [
        { skill: 'Routine chest X-ray interpretation', riskScore: 88, riskType: 'Automatable', horizon: '1-3yr', reason: 'Aidoc and Rad AI identify pneumonia, COVID patterns, and fractures with specialist-level accuracy.', aiReplacement: 'Full', aiTool: 'Aidoc, Rad AI, Nuance PowerScribe' },
        { skill: 'Standard CT scan pattern detection', riskScore: 84, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI-powered CT interpretation for PE, stroke, and common pathologies reaches 95%+ sensitivity.', aiReplacement: 'Full' },
        { skill: 'Follow-up scan comparison (standard)', riskScore: 80, riskType: 'Automatable', horizon: '1-3yr', reason: 'Automated comparison algorithms track changes between serial studies reliably.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Complex multi-system presentation interpretation', riskScore: 55, riskType: 'Augmented', horizon: '3-5yr', reason: 'Rare pathologies and multi-system presentations with unusual manifestations still require subspecialist radiologist judgment.', aiReplacement: 'Partial' },
        { skill: 'Interventional radiology procedures', riskScore: 35, riskType: 'Augmented', horizon: '5yr+', reason: 'Physical procedures guided by imaging — biopsies, ablations, angioplasty — remain human-essential.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'AI Radiology Governance', whySafe: 'Determining which AI systems to deploy, validating their performance, and maintaining oversight is a growing physician leadership function.', longTermValue: 95, difficulty: 'High' },
        { skill: 'Subspecialty Neuroradiology / Cardiac Radiology', whySafe: 'Complex subspecialty interpretation in neurology, cardiac, and musculoskeletal radiology still requires deep human expertise.', longTermValue: 93, difficulty: 'High' },
        { skill: 'Clinical AI Training and Validation', whySafe: 'Training radiology AI models requires physician-level labeling expertise and clinical judgment that cannot be automated.', longTermValue: 92, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'AI Radiology Specialist', riskReduction: 52, skillGap: 'Radiology AI platform administration, validation frameworks, clinical governance', transitionDifficulty: 'Medium', industryMapping: ['Hospitals', 'AI health companies', 'Teleradiology'], salaryDelta: '+15–30%', timeToTransition: '6–9 months' },
      { role: 'Clinical AI Research Lead', riskReduction: 60, skillGap: 'Research methodology, ML model evaluation, clinical study design', transitionDifficulty: 'Hard', industryMapping: ['Academic medicine', 'Research hospitals', 'Medtech'], salaryDelta: '+20–40%', timeToTransition: '12–24 months' },
      { role: 'Interventional Radiologist', riskReduction: 55, skillGap: 'IR procedural training (fellowship or supervised clinical experience)', transitionDifficulty: 'Very Hard', industryMapping: ['Hospitals', 'Clinics'], salaryDelta: '+30–60%', timeToTransition: '24–48 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'AI Radiology Tools Mastery', actions: [
          { action: 'Get certified in Aidoc, Rad AI, or your hospital\'s AI flagging system', why: 'Being the in-house expert on AI tools makes you the governance person, not the replaced person.', outcome: 'AI radiology tool certification' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Subspecialty Focus', actions: [
          { action: 'Identify one subspecialty where AI lags — neuroradiology, pediatric radiology, or complex musculoskeletal — and build specific expertise', why: 'Subspecialty depth is the highest-value specialization in radiology.', outcome: 'Subspecialty expertise development' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'AI Specialist and Subspecialty Parallel', actions: [
          { action: 'Become the department\'s AI radiology lead while developing subspecialty focus', why: 'Dual positioning (AI governance + subspecialty depth) is the most resilient radiologist profile.', outcome: 'AI governance lead + subspecialty expertise' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Clinical AI Research', actions: [
          { action: 'Design and submit a clinical validation study for one AI radiology tool in your department', why: 'Clinical AI research is the academic-clinical track that medical journals and AI companies value highly.', outcome: 'Research protocol submitted or IRB approved' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'IR Subspecialty or AI Fellowship', actions: [
          { action: 'Explore clinical AI fellowship programs or IR procedural training depending on career direction', why: 'AI health fellowship or IR training are the two most AI-resilient tracks for early radiologists.', outcome: 'Fellowship application or training pathway' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Research Lead or Subspecialist', actions: [
          { action: 'Target Clinical AI Research Lead or Subspecialty Radiologist role', why: '2-5 years + research + subspecialty = strong academic or subspecialty clinical profile.', outcome: 'Subspecialty or research role with higher AI resilience' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'AI Governance Leadership', actions: [
          { action: 'Lead your hospital\'s radiology AI governance committee', why: 'AI governance in radiology is a growing director-level function at health systems.', outcome: 'AI governance committee leadership' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Radiology AI Consulting', actions: [
          { action: 'Consult for a radiology AI company on clinical validation or implementation', why: 'Radiologist consulting for AI companies commands $300-600/hr and builds industry authority.', outcome: 'Consulting relationship with AI vendor' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Chief of Radiology or AI Medical Director', actions: [
          { action: 'Target Chief of Radiology or Medical Director of AI Imaging roles', why: '5-10 years radiology + AI governance + consulting = medical leadership profile.', outcome: 'Leadership role in radiology or AI health' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'AI Medical Strategy', actions: [
          { action: 'Develop your hospital\'s 3-year AI radiology strategy: deployment roadmap, governance framework, workforce implications', why: 'Leading AI strategic planning is CMIO/CMO-adjacent work.', outcome: 'AI radiology strategic plan' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Medtech Advisory', actions: [
          { action: 'Join clinical advisory boards at radiology AI companies (Aidoc, Rad AI, Nuance)', why: '10 years clinical expertise + AI governance = high-value advisor for medtech companies.', outcome: 'Medtech advisory board role' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CMIO or Chief Radiology Officer', actions: [
          { action: 'Target Chief Medical Information Officer (CMIO) or Chief Radiology Officer at major health systems', why: '10-20 years radiology + AI + strategy = CMIO executive profile.', outcome: 'CMIO or CRO executive role' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Specialty Authority', actions: [
          { action: 'Publish a major review article on the future of radiology in the AI era in RSNA or ARRS journals', why: '20 years radiology perspective on AI transformation is uniquely authoritative for the field.', outcome: 'Major radiology publication' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Board of Radiology / RSNA Leadership', actions: [
          { action: 'Run for American Board of Radiology or RSNA leadership positions', why: 'Specialty board leadership generates AI policy influence, consulting, and advisory opportunities.', outcome: 'Specialty board position' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'National Health AI Policy', actions: [
          { action: 'Engage with national health AI policy bodies (FDA AI/ML framework, NIST health AI)', why: '20 years radiology + AI expertise = health AI policy advisory at the national level.', outcome: 'National AI health policy advisory role' },
        ]},
      },
    },
    inactionScenario: 'Radiology AI is advancing rapidly — FDA has cleared 950+ AI medical devices with the majority in radiology. General radiologists who continue interpreting only routine studies without developing AI governance expertise, subspecialty depth, or procedural skills face a 40-60% reduction in reads over the next 5 years as AI handles the volume. The radiologist who does not evolve their role becomes a "signoff layer" with declining clinical value.',
    riskTrend: [
      { year: 2024, riskScore: 62, label: 'Now' },
      { year: 2025, riskScore: 68, label: '+1yr' },
      { year: 2026, riskScore: 73, label: '+2yr' },
      { year: 2027, riskScore: 77, label: '+3yr' },
    ],
    confidenceScore: 84,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MARKETING ROLES
  // ─────────────────────────────────────────────────────────────────────────

  mkt_seo: {
    displayRole: 'SEO Specialist',
    summary: '80% task automatability. AI tools automate keyword research, on-page optimization, and content briefs. Technical strategy and EEAT authority remain human.',
    skills: {
      obsolete: [
        { skill: 'Keyword research and clustering', riskScore: 88, riskType: 'Automatable', horizon: '1-3yr', reason: 'Semrush AI, Ahrefs AI, and GPT-4o generate complete keyword clusters from a single topic prompt.', aiReplacement: 'Full', aiTool: 'Semrush AI, Ahrefs AI, Surfer SEO' },
        { skill: 'Standard on-page optimization checklists', riskScore: 85, riskType: 'Automatable', horizon: '1-3yr', reason: 'Surfer SEO and Clearscope apply on-page recommendations automatically across pages.', aiReplacement: 'Full' },
        { skill: 'Standard link outreach email templates', riskScore: 80, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI generates personalized-sounding outreach at scale.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Technical SEO auditing', riskScore: 58, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI can run audit tools but diagnosing complex crawl issues and JavaScript SEO requires human expertise.', aiReplacement: 'Partial' },
        { skill: 'Content gap analysis', riskScore: 62, riskType: 'Augmented', horizon: '3-5yr', reason: 'AI identifies gaps but strategic prioritization based on business goals needs human judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Search Algorithm Strategy', whySafe: 'Understanding how Google algorithm updates affect specific industries and developing strategic responses requires senior search expertise.', longTermValue: 92, difficulty: 'High', resource: 'Google Search Central, Moz Whiteboard Fridays' },
        { skill: 'JavaScript / Advanced Technical SEO', whySafe: 'Diagnosing SPAs, dynamic rendering issues, and complex crawl architecture requires developer-level SEO expertise.', longTermValue: 90, difficulty: 'High' },
        { skill: 'EEAT and Brand Authority Building', whySafe: 'Building genuine E-E-A-T signals (author credentials, media coverage, expert content) requires real-world human authority.', longTermValue: 93, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Technical SEO Director', riskReduction: 55, skillGap: 'Python for SEO, log file analysis, JavaScript rendering, GA4 deep analysis', transitionDifficulty: 'Hard', industryMapping: ['E-commerce', 'Publisher', 'SaaS'], salaryDelta: '+50–80%', timeToTransition: '12–24 months' },
      { role: 'SEO Product Manager', riskReduction: 52, skillGap: 'Product management basics, SEO engineering coordination, roadmap planning', transitionDifficulty: 'Hard', industryMapping: ['Large tech', 'E-commerce platforms'], salaryDelta: '+40–70%', timeToTransition: '12–18 months' },
      { role: 'Digital Marketing Director', riskReduction: 45, skillGap: 'Paid media basics, email marketing, analytics, cross-channel strategy', transitionDifficulty: 'Hard', industryMapping: ['Any'], salaryDelta: '+40–65%', timeToTransition: '12–24 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Technical SEO Foundation', actions: [
          { action: 'Learn Screaming Frog, GSC deep analysis, and JavaScript SEO basics (Google\'s documentation)', why: 'Technical SEO is the most AI-resistant SEO specialization — it requires developer-level skills.', outcome: 'Technical SEO tool proficiency' },
          { action: 'Set up Python environment and run your first SEO analysis script (URL fetcher, bulk checking)', why: 'Python + SEO is a rare combination that commands significantly higher salaries.', outcome: 'First Python SEO script in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Full SEO Audit Portfolio', actions: [
          { action: 'Complete a full technical + content + off-page SEO audit of a real website', why: 'Comprehensive audit ability is the primary Senior SEO Specialist requirement.', outcome: 'Full SEO audit case study' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Technical SEO Analyst Role', actions: [
          { action: 'Target Technical SEO Analyst or SEO Analyst (Technical) roles', why: 'Technical SEO roles pay 30-50% more than standard SEO roles.', outcome: 'Technical SEO role, significant salary step-up' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Python SEO Automation', actions: [
          { action: 'Build a Python-based SEO reporting dashboard or automation tool', why: 'Custom SEO tooling is a Senior/Lead SEO signal that AI cannot directly replicate.', outcome: 'SEO Python tool in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Build the PR SEO Combination', actions: [
          { action: 'Run a Digital PR campaign — identify linkable assets and pitch 3 journalists', why: 'Digital PR is a high-value SEO adjacent skill that AI cannot fully execute (relationships!).', outcome: 'Digital PR campaign results' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior SEO or Head of SEO', actions: [
          { action: 'Target Senior SEO Specialist or Head of SEO at a company or agency', why: '2-5 years + Python + technical auditing + digital PR = strong senior SEO profile.', outcome: 'Senior SEO role, +50-65% salary' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'SEO Strategy Leadership', actions: [
          { action: 'Develop a formal SEO strategy with 12-month KPIs tied to business revenue', why: 'Strategy-to-revenue mapping is Director of SEO curriculum.', outcome: 'SEO strategy document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Brand + SEO Integration', actions: [
          { action: 'Design a brand-authority and EEAT strategy — linking off-site mentions, author credentials, and PR', why: 'EEAT is the most human-intensive SEO lever — strategy requires media and branding savvy.', outcome: 'EEAT playbook' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Director of SEO or S&O Lead', actions: [
          { action: 'Target Director of SEO or Head of Search & Organic Growth', why: '5-10 years + technical + strategy + EEAT = Director of SEO profile.', outcome: 'Director-level role, +70-90% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Search Authority Building', actions: [
          { action: 'Publish definitive research on how AI is changing organic search (10,000+ word guide with original data)', why: 'Original research on search + AI positions you as a top-tier search authority.', outcome: 'Search industry authority piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'SEO Consulting or Agency', actions: [
          { action: 'Launch a boutique SEO consultancy or take on 3 retainer clients at $3-8k/month', why: '10 years SEO = consulting rates that exceed most Director salaries.', outcome: 'Consulting income pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'VP Search or Agency Principal', actions: [
          { action: 'Target VP of Search or Digital Marketing or found your own search agency', why: '10-20 years search + strategy + consulting = VP or agency principal level.', outcome: 'VP or agency leadership' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Search Evolution Expert', actions: [
          { action: 'Write the definitive historical analysis of search from PageRank to AI Overviews — you lived it', why: '20 years search history is uniquely valuable perspective for the industry.', outcome: 'Major thought leadership piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Conference and Advisory', actions: [
          { action: 'Keynote at SearchLove, BrightonSEO, or SMX — pitch your AI search thesis', why: 'Keynoting the top search conferences at this experience level = CMO advisory inbound.', outcome: 'Keynote speaking + advisory pipeline' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CMO or Advisory Board', actions: [
          { action: 'Target CMO (with search focus) or join search industry advisory boards', why: '20 years of search mastery is CMO-caliber at many organisations.', outcome: 'CMO or advisory board role' },
        ]},
      },
    },
    inactionScenario: 'Standard SEO execution is rapidly commoditizing. AI tools now generate keyword strategies, content briefs, and on-page recommendations at a fraction of the cost of human SEO specialists. Google\'s AI Overviews are reducing click-through rates on standard informational queries by 20-40%. SEO specialists who only perform keyword research and basic optimization without developing technical expertise, data fluency, or PR strategy will face severe rate compression within 2-3 years.',
    riskTrend: [
      { year: 2024, riskScore: 73, label: 'Now' },
      { year: 2025, riskScore: 78, label: '+1yr' },
      { year: 2026, riskScore: 82, label: '+2yr' },
      { year: 2027, riskScore: 85, label: '+3yr' },
    ],
    confidenceScore: 88,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DESIGN ROLES
  // ─────────────────────────────────────────────────────────────────────────

  des_graphic: {
    displayRole: 'Graphic Designer',
    summary: '72% task automatability for standard design work. Adobe Firefly, Midjourney, and Canva AI generate marketing assets at machine speed.',
    skills: {
      obsolete: [
        { skill: 'Stock image generation and sourcing', riskScore: 95, riskType: 'Automatable', horizon: '1-3yr', reason: 'Midjourney v7, DALL-E 4, and Adobe Firefly generate commercial-quality images in seconds at near-zero cost.', aiReplacement: 'Full', aiTool: 'Midjourney v7, Adobe Firefly, DALL-E 4' },
        { skill: 'Social media graphic batch production', riskScore: 90, riskType: 'Automatable', horizon: '1-3yr', reason: 'Canva AI, Adobe Express, and Figma AI generate brand-consistent social graphics from templates at scale.', aiReplacement: 'Full', aiTool: 'Canva AI, Adobe Firefly' },
        { skill: 'Standard banner ad creative variants', riskScore: 92, riskType: 'Automatable', horizon: '1-3yr', reason: 'AI generates hundreds of performance creative variants for A/B testing with no human design input.', aiReplacement: 'Full' },
      ],
      at_risk: [
        { skill: 'Brand identity execution', riskScore: 60, riskType: 'Augmented', horizon: '3-5yr', reason: 'Applying a defined brand identity still requires human taste — but AI is encroaching here too.', aiReplacement: 'Partial' },
        { skill: 'Infographic design (complex)', riskScore: 62, riskType: 'Augmented', horizon: '3-5yr', reason: 'Complex information architecture and visual storytelling in infographics still benefits from human judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Art Direction and Creative Strategy', whySafe: 'Directing what AI generates — defining the visual concept, brand mood, and campaign direction — requires strategic creative leadership.', longTermValue: 93, difficulty: 'High' },
        { skill: 'Brand Identity Architecture', whySafe: 'Creating original brand identity systems — logo language, typography, color strategy — requires creative insight and taste that AI cannot generate.', longTermValue: 92, difficulty: 'High', resource: 'Identity Works certification, Brand New blog' },
        { skill: 'User Experience Design (Motion/Interaction)', whySafe: 'Designing interaction patterns, micro-animations, and the cognitive experience of digital products requires deep UX expertise.', longTermValue: 90, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Creative Director', riskReduction: 55, skillGap: 'Strategic creative leadership, campaign concept, brand vision, team management', transitionDifficulty: 'Very Hard', industryMapping: ['Advertising', 'Brand agencies', 'In-house teams'], salaryDelta: '+60–100%', timeToTransition: '18–36 months' },
      { role: 'AI Art Director', riskReduction: 60, skillGap: 'Midjourney mastery, AI workflow design, creative direction of AI outputs', transitionDifficulty: 'Medium', industryMapping: ['Any creative industry'], salaryDelta: '+30–55%', timeToTransition: '6–12 months' },
      { role: 'Brand Experience Designer', riskReduction: 52, skillGap: 'UX design basics, service design, brand experience mapping', transitionDifficulty: 'Hard', industryMapping: ['Brand consultancies', 'Large corporations'], salaryDelta: '+30–60%', timeToTransition: '12–18 months' },
      { role: 'Motion Designer (Digital)', riskReduction: 46, skillGap: 'After Effects, Lottie/Rive for web animations, design-code bridge', transitionDifficulty: 'Medium', industryMapping: ['Product companies', 'Gaming', 'Media'], salaryDelta: '+20–40%', timeToTransition: '6–12 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Master AI Creative Tools', actions: [
          { action: 'Build a complete AI-assisted creative workflow: Midjourney → Firefly → Photoshop AI → output', why: 'Being the designer who uses AI 10x faster is the entry-level survival skill.', outcome: 'AI design workflow portfolio', tool: 'Midjourney, Adobe Firefly' },
          { action: 'Pick a specialization: motion design (After Effects) OR UX design (Figma)', why: 'Motion and UX are both more AI-resistant than static graphic design.', outcome: 'Specialization direction chosen + course enrolled' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Specialize Portfolio', actions: [
          { action: 'Build 5 pieces in your chosen specialization (motion OR UX, not both)', why: 'Portfolio depth in one area is more powerful than breadth across commoditized skills.', outcome: 'Specialization portfolio pieces' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Apply for Specialized Role', actions: [
          { action: 'Apply for Motion Designer or UX Designer roles', why: 'Both specializations command 20-40% more than generalist graphic design.', outcome: 'Specialization role, more AI-resilient position' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Brand Identity Depth', actions: [
          { action: 'Design 3 complete brand identity systems from brief to full brand guidelines', why: 'Brand identity systems are the most defensible creative portfolio asset.', outcome: 'Three complete brand identity case studies' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Creative Direction Transition', actions: [
          { action: 'Work with a junior designer or AI tool as your "creative team" and direct their output', why: 'Direction is the Creative Director function — you must practice directing before you can lead.', outcome: 'Creative direction experience documented' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior Designer or Art Director', actions: [
          { action: 'Target Senior Designer or Junior Art Director roles at agencies or brands', why: '2-5 years design + brand systems + direction experience = Art Director candidate.', outcome: 'Art Director path, +40-60% salary' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Creative Leadership', actions: [
          { action: 'Lead a full campaign concept from brief to output — concept, art direction, execution, and presentation', why: 'Campaign ownership is the Creative Director gate.', outcome: 'Campaign portfolio piece with strategic rationale' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Design Management', actions: [
          { action: 'Manage at least 2 junior designers or freelancers on a real project', why: 'Team leadership is required for CD title — prove it with real examples.', outcome: 'Demonstrated creative team management' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Creative Director or Design Lead', actions: [
          { action: 'Target Creative Director or Head of Design roles', why: '5-10 years + art direction + creative leadership = CD-level profile.', outcome: 'Creative Director role, significant salary uplift' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Creative Consulting', actions: [
          { action: 'Pitch 3 creative consulting retainers to brands (visual identity review, art direction, brand refresh)', why: '10 years creative expertise = consulting income at premium rates.', outcome: 'Creative consulting income pipeline' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Award-Winning Portfolio Push', actions: [
          { action: 'Submit 3 of your best identity or campaign projects to D&AD, Cannes, or Clio awards', why: 'Award recognition accelerates senior creative career trajectory rapidly.', outcome: 'Award submissions pending' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Executive Creative Director or Agency', actions: [
          { action: 'Target Executive Creative Director or found a brand/design agency', why: '10-20 years design + CD experience + industry recognition = ECD profile.', outcome: 'ECD or agency founding' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Design Authority Statement', actions: [
          { action: 'Write your creative philosophy and design principles document — your 20-year visual point of view', why: 'Long-form creative philosophy is the founding block of advisory and brand authority.', outcome: 'Creative philosophy document' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Jury and Advisory', actions: [
          { action: 'Join D&AD, Cannes, or Clio awards jury', why: 'Award juries at this experience level generate peer recognition and advisory relationships.', outcome: 'Awards jury participation' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Agency Founder or ECD', actions: [
          { action: 'Target Global Executive Creative Director or found your own creative agency', why: '20 years creative authority is globally ECD-caliber — the level where AI cannot touch your creative vision.', outcome: 'Agency or Global ECD role' },
        ]},
      },
    },
    inactionScenario: 'The graphic design commodity market is collapsing rapidly. Fiverr reports 30-50% drops in demand for standard logo and social media graphic work since AI tools launched. Companies that once hired junior designers for social content now use Canva AI internally. The $35-60k graphic designer doing batch social media graphics and template work will face near-total market displacement within 18-24 months.',
    riskTrend: [
      { year: 2024, riskScore: 66, label: 'Now' },
      { year: 2025, riskScore: 72, label: '+1yr' },
      { year: 2026, riskScore: 76, label: '+2yr' },
      { year: 2027, riskScore: 80, label: '+3yr' },
    ],
    confidenceScore: 88,
  },

  des_ux: {
    displayRole: 'UX Designer / Product Designer',
    summary: '36% task automatability — one of the more AI-resilient design roles. User empathy, research synthesis, and interaction paradigm design remain deeply human.',
    skills: {
      obsolete: [
        { skill: 'Standard wireframe generation from templates', riskScore: 78, riskType: 'Automatable', horizon: '3-5yr', reason: 'Figma AI, Galileo AI, and UxSniff generate wireframes and basic flows from prompts.', aiReplacement: 'Partial', aiTool: 'Figma AI, Galileo AI' },
        { skill: 'Accessibility checklist execution', riskScore: 72, riskType: 'Automatable', horizon: '3-5yr', reason: 'Automated accessibility scanners handle basic WCAG compliance assessment.', aiReplacement: 'Full' },
        { skill: 'Standard user flow documentation', riskScore: 70, riskType: 'Automatable', horizon: '3-5yr', reason: 'AI generates standard flows from feature descriptions.', aiReplacement: 'Partial' },
      ],
      at_risk: [
        { skill: 'Usability testing execution (standard)', riskScore: 55, riskType: 'Augmented', horizon: '3-5yr', reason: 'Automated usability tools test interfaces, but interpreting nuanced behavioral insights still requires human judgment.', aiReplacement: 'Partial' },
      ],
      safe: [
        { skill: 'Deep User Research and Empathy Synthesis', whySafe: 'Conducting interviews, observing behaviors, and synthesizing into design insight requires emotional intelligence and contextual judgment.', longTermValue: 96, difficulty: 'High', resource: 'IDEO Design Research, NNG User Research' },
        { skill: 'Novel Interaction Paradigm Design', whySafe: 'Designing interaction patterns for new devices, AI interfaces, and emerging contexts is creative frontier work.', longTermValue: 95, difficulty: 'High' },
        { skill: 'Accessibility Advocacy (Complex)', whySafe: 'Deep accessibility design for cognitive, motor, and neurological disabilities requires empathy-driven expertise beyond checklist compliance.', longTermValue: 93, difficulty: 'High' },
      ],
    },
    careerPaths: [
      { role: 'Head of Design / Design Director', riskReduction: 52, skillGap: 'Design leadership, team management, design strategy, business acumen', transitionDifficulty: 'Hard', industryMapping: ['Product companies', 'Tech'], salaryDelta: '+40–70%', timeToTransition: '18–36 months' },
      { role: 'Design Systems Lead', riskReduction: 55, skillGap: 'Token architecture, component API design, developer collaboration', transitionDifficulty: 'Hard', industryMapping: ['Large tech companies'], salaryDelta: '+30–55%', timeToTransition: '12–18 months' },
      { role: 'AI UX Specialist', riskReduction: 58, skillGap: 'AI interface patterns, LLM interaction design, prompt UX', transitionDifficulty: 'Medium', industryMapping: ['AI companies', 'Tech'], salaryDelta: '+30–55%', timeToTransition: '6–12 months' },
    ],
    roadmap: {
      '0-2': {
        phase_1: { timeline: '0–30 days', focus: 'Deep User Research', actions: [
          { action: 'Conduct 5 in-depth user interviews using IDEO or NNG methodology and synthesize insights', why: 'User research is the most differentiated and AI-resistant UX skill.', outcome: 'User research case study with insights synthesis' },
          { action: 'Design your first AI interface interaction: chatbot, search, recommendation system', why: 'AI interface design is an emerging specialty with no established AI replacement.', outcome: 'AI interface design portfolio piece' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Accessibility Deep Dive', actions: [
          { action: 'Complete NNG Accessibility Certification and redesign a real interface for complex accessibility', why: 'Accessibility expertise commands a premium and is directly opposed to what AI tools do (which generate WCAG violations).', outcome: 'Accessibility certification + redesign case study' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Product Designer Role with Research Focus', actions: [
          { action: 'Target Product Designer or UX Researcher roles with a research-focused portfolio', why: 'Research-led design roles are more AI-resilient than execution-focused design.', outcome: 'Research-focused design role' },
        ]},
      },
      '2-5': {
        phase_1: { timeline: '0–30 days', focus: 'Design Systems Mastery', actions: [
          { action: 'Build a complete design system for a real product: tokens, components, documentation, in Storybook', why: 'Design system expertise is one of the highest-value UX specializations.', outcome: 'Complete design system in portfolio' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Strategic Design Impact', actions: [
          { action: 'Run a design sprint on a business problem and quantify the UX impact on a metric (conversion, task completion, NPS)', why: 'Design-to-business-outcome measurement is the Senior/Lead UX gate.', outcome: 'Quantified UX impact case study' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Senior UX or Design Systems Lead', actions: [
          { action: 'Target Senior UX Designer or Design Systems Lead roles', why: '2-5 years UX + design systems + measured impact = strong senior profile.', outcome: 'Senior role, +35-50% salary' },
        ]},
      },
      '5-10': {
        phase_1: { timeline: '0–30 days', focus: 'Design Leadership', actions: [
          { action: 'Lead a cross-functional product design effort across multiple workstreams', why: 'Cross-functional design leadership is the Head of Design gate.', outcome: 'Portfolio of cross-functional leadership' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Business Strategy + Design', actions: [
          { action: 'Complete Stanford d.school executive program or similar design-meets-business program', why: 'Design + business strategy skills are the VP Design executive requirement.', outcome: 'Design-business strategy credential' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Head of Design or VP', actions: [
          { action: 'Target Head of Design, Design Director, or VP Product Design', why: '5-10 years UX + leadership + strategy = design executive profile.', outcome: 'Design leadership role, +60-80% salary' },
        ]},
      },
      '10-20': {
        phase_1: { timeline: '0–30 days', focus: 'Design Strategy Advisory', actions: [
          { action: 'Develop a design maturity model for organizations — your consulting intellectual property', why: 'Design maturity frameworks are consulting deliverables that firms pay $200-400/hr for.', outcome: 'Design maturity model IP' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Advisory and Speaking', actions: [
          { action: 'Present at Figma Config, UX London, or similar design conferences', why: 'Conference appearances drive inbound consulting and advisory opportunities.', outcome: 'Conference speaking engagement' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'CPO or Design Consulting', actions: [
          { action: 'Target Chief Product Officer or Chief Design Officer roles, or launch design consulting practice', why: '10-20 years UX + strategy + speaking = design/product executive profile.', outcome: 'CPO/CDO or consulting practice' },
        ]},
      },
      '20+': {
        phase_1: { timeline: '0–30 days', focus: 'Design Philosophy Statement', actions: [
          { action: 'Write your design philosophy — 20 years of working with users crystallized into a framework', why: 'A published design philosophy is the foundation of design advisory and speaking authority.', outcome: 'Design philosophy manifesto' },
        ]},
        phase_2: { timeline: '1–3 months', focus: 'Foundational AI UX Standards', actions: [
          { action: 'Contribute to industry AI UX design standards (OECD AI, IEEE) based on your expertise', why: 'Standards bodies need experienced designers to define human-centered AI interface guidelines.', outcome: 'Standards contribution' },
        ]},
        phase_3: { timeline: '3–12 months', focus: 'Advisory Board or Design Institute', actions: [
          { action: 'Join design school advisory boards or found a design leadership program', why: '20 years UX is design education and advisory board territory.', outcome: 'Design advisory or academic leadership' },
        ]},
      },
    },
    inactionScenario: 'UX designers who only execute wireframes and apply established design patterns without developing research depth, accessibility expertise, or AI interface design skills will find their execution layer increasingly commoditized by AI tools. Figma AI, Galileo AI, and similar tools are generating wireframes and basic flows from prompts. The commodity UX executor earning $55-75k faces significant market pressure within 3-5 years.',
    riskTrend: [
      { year: 2024, riskScore: 36, label: 'Now' },
      { year: 2025, riskScore: 40, label: '+1yr' },
      { year: 2026, riskScore: 44, label: '+2yr' },
      { year: 2027, riskScore: 48, label: '+3yr' },
    ],
    confidenceScore: 82,
  },

};

// ═══════════════════════════════════════════════════════════════════════════
// LOOKUP HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get career intelligence for a role key, with graceful null return for unknown roles
 */
export const getCareerIntelligence = (roleKey: string): CareerIntelligence | null => {
  return CAREER_INTELLIGENCE_DB[roleKey] ?? null;
};

/**
 * Get roadmap for a role key + experience combination
 */
export const getRoleRoadmap = (
  roleKey: string,
  experience: '0-2' | '2-5' | '5-10' | '10-20' | '20+'
): ExperienceRoadmap | null => {
  const intel = CAREER_INTELLIGENCE_DB[roleKey];
  if (!intel) return null;
  return intel.roadmap[experience] ?? intel.roadmap['5-10'];
};

/**
 * Get career paths for a role
 */
export const getRoleCareerPaths = (roleKey: string): CareerPath[] => {
  return CAREER_INTELLIGENCE_DB[roleKey]?.careerPaths ?? [];
};

/**
 * Get skill risk matrix for a role
 */
export const getRoleSkills = (roleKey: string) => {
  return CAREER_INTELLIGENCE_DB[roleKey]?.skills ?? null;
};

/**
 * Get inaction scenario for a role
 */
export const getInactionScenario = (roleKey: string): string | null => {
  return CAREER_INTELLIGENCE_DB[roleKey]?.inactionScenario ?? null;
};

/**
 * Get risk trend data for charting
 */
export const getRiskTrend = (roleKey: string): TrendPoint[] => {
  return CAREER_INTELLIGENCE_DB[roleKey]?.riskTrend ?? [];
};

/**
 * Check if a role has pre-seeded data
 */
export const hasSeededData = (roleKey: string): boolean => {
  return roleKey in CAREER_INTELLIGENCE_DB;
};

/**
 * Get all seeded role keys
 */
export const getSeededRoleKeys = (): string[] => {
  return Object.keys(CAREER_INTELLIGENCE_DB);
};

export default CAREER_INTELLIGENCE_DB;
