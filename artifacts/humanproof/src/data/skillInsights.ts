export interface SkillInsight {
  threat?: string;
  pivot?: string;
  why_protected?: string;
  action?: string;
  aiTools?: string[];
  source?: string;
}

export const SKILL_INSIGHTS_2026: Record<string, SkillInsight> = {
  'Code generation': {
    threat: 'Cursor, Claude Code, Devin, and GitHub Copilot now write production-grade code autonomously. Junior dev output fully automatable at current capability levels.',
    pivot: 'Own system architecture, code review strategy, and AI-output QA. Become the engineer who designs and validates what AI builds.',
    aiTools: ['Cursor', 'Claude Code', 'GitHub Copilot', 'Devin', 'Replit Agent'],
    source: 'GitHub Octoverse Report 2025',
  },
  'Legal research': {
    threat: 'Harvey AI, Lexis+ AI, and CoCounsel retrieve case law, draft memos, and flag precedents in seconds. 91% risk as standalone function.',
    pivot: 'Own trial strategy, client counselling, and regulatory interpretation. AI can find the law — you must apply judgment to ambiguous facts.',
    aiTools: ['Harvey AI', 'Lexis+ AI', 'CoCounsel', 'Westlaw Edge'],
    source: 'Georgetown Law AI Adoption Study 2025',
  },
  'CV/resume screening': {
    threat: 'Greenhouse AI, Workday AI, and HireVue screen and rank thousands of applicants automatically. The function as currently practiced is nearly fully automated.',
    pivot: 'Own the hiring framework design: competency models, interview rubrics, structured assessment centres, and final-round evaluation.',
    aiTools: ['Greenhouse AI', 'Workday AI', 'HireVue', 'Paradox Olivia'],
    source: 'SHRM HR Technology Survey 2025',
  },
  'Bookkeeping': {
    threat: 'Automated bookkeeping is essentially complete. QuickBooks AI, Xero, and FreshBooks handle 95%+ of standard entries.',
    pivot: 'Exit bookkeeping entirely. Pivot to CFO advisory, tax strategy, M&A due diligence, or financial storytelling.',
    aiTools: ['QuickBooks AI', 'Xero AI', 'Sage Copilot', 'FreshBooks'],
    source: 'AICPA Future of Finance Report 2025',
  },
  'Medical imaging analysis': {
    threat: 'Med-Gemini and GPT-4V deployed clinically match specialist radiologist accuracy for standard scans in 12+ categories.',
    pivot: 'Lead AI governance in imaging, specialise in ambiguous or rare presentations, own multi-disciplinary integration.',
    aiTools: ['Med-Gemini', 'Rad AI', 'Aidoc', 'Nuance PowerScribe'],
    source: 'NEJM AI Clinical Validation Study 2024',
  },
  'Copywriting (ads)': {
    threat: 'GPT-4o, Claude 3.5, and Gemini 1.5 generate brand-compliant copy in seconds. 72% of marketing teams use AI for first drafts.',
    pivot: 'Own brand voice strategy, copy architecture, and AI output curation/QA. Become the creative director, not the typist.',
    aiTools: ['Claude 3.5', 'GPT-4o', 'Jasper', 'Copy.ai'],
    source: 'HubSpot State of Marketing 2025',
  },
  'Data entry': {
    threat: 'RPA tools, OCR AI, and form-parsing AI have automated 97% of standard data entry workflows. This function is effectively complete.',
    pivot: 'Pivot to data governance, quality assurance strategy, or process design. Become the person who audits what automation produces.',
    aiTools: ['UiPath AI', 'Microsoft Power Automate', 'Zapier AI'],
    source: 'McKinsey Automation Index 2025',
  },
  'Report generation': {
    threat: 'Tableau Pulse, Power BI Copilot, and Glean generate executive-ready reports from raw data automatically.',
    pivot: 'Own strategic narrative and decision framing. Tell the story behind the data that drives board-level action.',
    aiTools: ['Tableau Pulse', 'Power BI Copilot', 'Glean'],
    source: 'Gartner Analytics Trends 2025',
  },
  'Market research': {
    threat: 'AI research tools now synthesise market data, competitor intelligence, and consumer trends in minutes. Basic research is fully automatable.',
    pivot: 'Own primary qualitative research, consumer psychology interpretation, and strategic synthesis that contextualises findings.',
    aiTools: ['Perplexity Pro', 'Crayon AI', 'Exploding Topics'],
    source: 'ESOMAR AI in Research Report 2025',
  },
  'QA testing (manual)': {
    threat: 'AI-driven testing tools autonomously generate, run, and validate thousands of test cases. Manual QA is almost entirely obsolete.',
    pivot: 'Lead QA strategy and AI testing governance. Become the person who defines what quality means and audits AI-generated test suites.',
    aiTools: ['Testim AI', 'Mabl', 'Functionize'],
    source: 'Testim.io Automation State of QA 2025',
  },
  'Tax preparation': {
    threat: 'TurboTax AI, Intuit Assist, and Harvey Tax handle individual and business returns with 99%+ accuracy on standard filings.',
    pivot: 'Own complex tax strategy: cross-border structures, M&A tax, estate planning, and IRS dispute resolution.',
    aiTools: ['TurboTax AI', 'Intuit Assist', 'Harvey Tax'],
    source: 'AICPA Future of Finance Report 2025',
  },
  'Social media content': {
    threat: 'Claude 3.5, Jasper, and SocialBee generate platform-native content at scale. 88% risk for generic content production.',
    pivot: 'Own community strategy, brand voice development, and cultural moment identification. Lead human-brand relationships.',
    aiTools: ['Claude 3.5', 'Jasper', 'SocialBee AI'],
    source: 'Sprout Social AI Index 2025',
  },
  'Spreadsheet modelling': {
    threat: 'Claude, GPT-4o, and Copilot in Excel now build complex financial models from natural language instructions.',
    pivot: 'Move to strategic FP&A, scenario planning facilitation, and model architecture. Own the assumptions, not the cells.',
    aiTools: ['Copilot in Excel', 'Claude', 'GPT-4o'],
    source: 'CFO Alliance AI Tools Survey 2025',
  },
  'Database administration': {
    threat: 'AI-assisted database management tools automate query optimisation, backup, and routine maintenance at 76% risk level.',
    pivot: 'Pivot to data architecture, cloud-native infrastructure design, and AI data pipeline governance.',
    aiTools: ['AWS AI Ops', 'Azure AI', 'OtterTune'],
    source: 'Gartner Data Management 2025',
  },
  'Graphic design (templates)': {
    threat: 'Canva AI, Adobe Firefly, and Midjourney generate brand-compliant design assets in seconds. Template-based design is nearly fully automated.',
    pivot: 'Own brand identity strategy, creative direction, and AI output curation. Move from execution to vision.',
    aiTools: ['Canva AI', 'Adobe Firefly', 'Midjourney'],
    source: 'Adobe Creative Futures Report 2025',
  },
  'Image creation': {
    threat: 'Midjourney v7, DALL-E 4, and Firefly 3 produce commercial-grade images in seconds across any style.',
    pivot: 'Own art direction, visual brand strategy, and client creative briefs. Define what AI generates, do not generate it yourself.',
    aiTools: ['Midjourney v7', 'DALL-E 4', 'Adobe Firefly 3', 'Stable Diffusion 3'],
    source: 'Creative Industries AI Impact Report 2025',
  },
  'Ethical decision-making': {
    why_protected: 'Licensed professionals bear legal and reputational accountability that cannot be delegated to AI. Bar rules, medical ethics, and fiduciary duty require a named human.',
    action: 'Develop a reputation for exceptional ethical judgment. Publish case studies. Join professional ethics committees.',
    aiTools: [],
    source: 'ABA Model Rules of Professional Conduct 2024',
  },
  'Empathy': {
    why_protected: 'Authentic emotional attunement — reading unspoken feelings, adapting tone in real time, holding space — is rooted in embodied human experience AI cannot replicate.',
    action: 'Formalise your empathy practice: get coaching certified, study narrative medicine, document your highest-empathy wins in the Journal.',
    aiTools: [],
    source: 'MIT Sloan Management Review: Human Skills Premium 2024',
  },
  'Crisis management': {
    why_protected: 'Crisis response requires simultaneous reading of political context, personal relationships, and institutional stakes — a multi-dimensional judgment AI produces only stochastic approximations of.',
    action: 'Lead the next crisis simulation at your org. Build a personal crisis response playbook. Study the 2020–2025 corporate case archive.',
    aiTools: [],
    source: 'Harvard Kennedy School Crisis Leadership Programme 2024',
  },
  'Complex deal closing': {
    why_protected: 'High-stakes negotiations involve real-time reading of emotion, power dynamics, and creative options in a social context. AI can model these but cannot navigate them.',
    action: 'Specialise in enterprise or strategic account sales. Take Ury & Fisher negotiation masterclass. Build a track record of $500k+ deals.',
    aiTools: [],
    source: 'Harvard Negotiation Project, 2024 Research Update',
  },
  'Negotiation': {
    why_protected: 'In-person negotiation draws on micro-expression reading, silence management, and rapport-building that are embodied skills requiring years of deliberate practice.',
    action: 'Get formal negotiation training (Harvard PON, Karrass). Document your negotiation wins. Mentor others in the craft.',
    aiTools: [],
    source: 'Program on Negotiation, Harvard Law School 2024',
  },
  'Leadership coaching': {
    why_protected: 'ICF-certified coaching requires holding space, challenging assumptions, and facilitating transformation through a trusted human relationship AI cannot provide.',
    action: 'Complete ICF certification if not already done. Build a coaching practice with 3–5 senior clients. Publish case studies.',
    aiTools: [],
    source: 'ICF Global Coaching Study 2024',
  },
  'Strategic planning': {
    why_protected: 'Strategy requires synthesising ambiguous signals, aligning stakeholders with competing interests, and making irreversible resource allocation decisions under uncertainty.',
    action: 'Lead your organisation\'s next strategy cycle. Publish a white paper on your industry\'s future. Build board-level credibility.',
    aiTools: [],
    source: 'McKinsey Strategy Practice Report 2024',
  },
  'Early childhood education': {
    why_protected: 'Child development requires consistent human attachment figures, physical interaction, and emotionally attuned responses that are fundamentally embodied.',
    action: 'Specialise in developmental psychology integration. Lead AI literacy curriculum for parents. Build reputation as a child development authority.',
    aiTools: [],
    source: 'NAEYC Technology in Early Childhood Policy Statement 2024',
  },
  'Crisis counselling': {
    why_protected: 'Crisis intervention requires instantaneous human judgment, physical presence, and therapeutic alliance formed over time. Lives literally depend on the human element.',
    action: 'Pursue advanced crisis certification (ASIST, safeTALK). Build institutional partnerships. Develop specialisation in high-acuity presentations.',
    aiTools: [],
    source: 'American Association of Suicidology 2024',
  },
  'Systems thinking': {
    why_protected: 'Genuine systems thinking — seeing feedback loops, second-order effects, and leverage points — requires the kind of intuitive pattern recognition that comes from embodied organisational experience.',
    action: 'Study Senge and Meadows. Facilitate your next org-wide systems mapping workshop. Build your reputation as a complexity navigator.',
    aiTools: [],
    source: 'Santa Fe Institute Complexity Science 2024',
  },
};

export const SKILL_AI_TOOLS: Record<string, string[]> = {
  'Code generation': ['Cursor', 'Claude Code', 'GitHub Copilot', 'Devin'],
  'Legal research': ['Harvey AI', 'Lexis+ AI', 'CoCounsel'],
  'CV/resume screening': ['Greenhouse AI', 'Workday AI', 'HireVue'],
  'Copywriting (ads)': ['Claude 3.5', 'GPT-4o', 'Jasper'],
  'Medical imaging analysis': ['Med-Gemini', 'GPT-4V', 'Rad AI'],
  'Bookkeeping': ['QuickBooks AI', 'Xero AI', 'FreshBooks'],
  'Report generation': ['Tableau Pulse', 'Power BI Copilot', 'Glean'],
  'Image creation': ['Midjourney v7', 'DALL-E 4', 'Adobe Firefly 3'],
  'Data entry': ['UiPath AI', 'Microsoft Power Automate', 'Zapier AI'],
  'Market research': ['Perplexity Pro', 'Crayon AI', 'Exploding Topics'],
  'QA testing (manual)': ['Testim AI', 'Mabl', 'Functionize'],
  'Tax preparation': ['TurboTax AI', 'Intuit Assist', 'Harvey Tax'],
  'Social media content': ['Claude 3.5', 'Jasper', 'SocialBee AI'],
  'Spreadsheet modelling': ['Copilot in Excel', 'Claude', 'GPT-4o'],
  'Database administration': ['AWS AI Ops', 'Azure AI', 'OtterTune'],
  'Graphic design (templates)': ['Canva AI', 'Adobe Firefly', 'Midjourney'],
  'Technical writing': ['Claude 3.5', 'Notion AI', 'Writer AI'],
  'Translation': ['DeepL Pro', 'Google Translate AI', 'GPT-4o'],
  'Financial modelling': ['Copilot in Excel', 'Runway Financial', 'Causal'],
  'IT support': ['Intercom AI', 'Zendesk AI', 'ServiceNow AI'],
  'Radiology interpretation': ['Med-Gemini', 'Rad AI', 'Aidoc'],
  'Medical coding': ['Fathom', 'DeepScribe', 'Ambience AI'],
  'Patent analysis': ['PatSnap AI', 'Dennemeyer AI', 'Anaqua'],
  'Contract review': ['Ironclad AI', 'ContractPodAi', 'Kira'],
  'Literature review': ['Elicit', 'Consensus AI', 'Semantic Scholar'],
  'Due diligence': ['Kira', 'Luminance', 'Relativity AI'],
};
