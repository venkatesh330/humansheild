export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Course {
  title: string;
  provider: string;
  duration: string;
  price: string;
  affiliateUrl: string;
  skillImpact: string;
  description: string;
  difficulty?: CourseDifficulty;
}

export interface RoadmapPhase {
  phase: string;
  weeks: string;
  focus: string;
  milestones: string[];
  courses: Course[];
}

export function getDifficultyDots(difficulty: CourseDifficulty): string {
  switch (difficulty) {
    case 'beginner': return '○○○';
    case 'intermediate': return '●○○';
    case 'advanced': return '●●○';
    case 'expert': return '●●●';
  }
}

// Expanded 2026 course database with accurate providers and real course names
export const courseDatabase: Record<string, Course[]> = {
  // HIGH-RISK TECH SKILLS — Pivot to uniqueness
  'Data entry': [
    { title: 'RPA Automation with UiPath', provider: 'UiPath Academy', duration: '12 hours', price: '$0', affiliateUrl: 'https://academy.uipath.com', skillImpact: '+20 points', description: 'Build robots that automate your own job, then pivot to bot management', difficulty: 'intermediate' },
    { title: 'Power Automate Cloud Flows', provider: 'Microsoft Learn', duration: '6 hours', price: '$0', affiliateUrl: 'https://learn.microsoft.com', skillImpact: '+15 points', description: 'Automate repetitive tasks before AI does it for you', difficulty: 'beginner' },
    { title: 'Process Mining & Optimization', provider: 'Coursera', duration: '8 hours', price: '$39', affiliateUrl: 'https://coursera.org/process-mining', skillImpact: '+18 points', description: 'Identify what to automate — a higher-value skill', difficulty: 'intermediate' },
  ],
  'Code generation': [
    { title: 'Advanced Prompt Engineering', provider: 'DeepLearning.AI', duration: '4 hours', price: '$0', affiliateUrl: 'https://deeplearning.ai/short-courses/prompt-engineering', skillImpact: '+22 points', description: 'Master AI code assistants to stay 10x ahead', difficulty: 'intermediate' },
    { title: 'Code Review & Architecture', provider: 'Coursera', duration: '12 hours', price: '$49', affiliateUrl: 'https://coursera.org/code-review', skillImpact: '+18 points', description: 'Validate AI-generated code — humans still required', difficulty: 'advanced' },
    { title: 'Full-Stack with AI Co-Pilots', provider: 'Udemy', duration: '16 hours', price: '$19', affiliateUrl: 'https://udemy.com/ai-copilot-fullstack', skillImpact: '+20 points', description: 'Leverage Copilot + Claude for 10x productivity', difficulty: 'intermediate' },
  ],
  'Report generation': [
    { title: 'Executive Storytelling', provider: 'LinkedIn Learning', duration: '5 hours', price: '$29', affiliateUrl: 'https://linkedin.com/learning/executive-storytelling', skillImpact: '+20 points', description: 'Transform data into decisions — AI cannot do this', difficulty: 'intermediate' },
    { title: 'Data Narrative & Visualization', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/data-narrative', skillImpact: '+16 points', description: 'Make data meaningful to humans', difficulty: 'beginner' },
  ],
  'Documentation writing': [
    { title: 'Technical Writing Mastery', provider: 'Write the Docs', duration: '10 hours', price: '$0', affiliateUrl: 'https://www.writethedocs.org', skillImpact: '+14 points', description: 'Write for clarity & users, not just coverage', difficulty: 'intermediate' },
    { title: 'API Documentation Design', provider: 'Udemy', duration: '6 hours', price: '$19', affiliateUrl: 'https://udemy.com/api-documentation', skillImpact: '+12 points', description: 'Create documentation that developers love', difficulty: 'intermediate' },
  ],
  'Spreadsheet modelling': [
    { title: 'Python for Financial Analysis', provider: 'DataCamp', duration: '20 hours', price: '$99', affiliateUrl: 'https://datacamp.com/python-finance', skillImpact: '+20 points', description: 'Graduate from Excel to reproducible analysis', difficulty: 'intermediate' },
    { title: 'Business Intelligence Mastery', provider: 'Mode Analytics', duration: '12 hours', price: '$0', affiliateUrl: 'https://mode.com/sql-tutorial', skillImpact: '+16 points', description: 'Tell stories with data, not just report it', difficulty: 'intermediate' },
  ],
  'QA testing (manual)': [
    { title: 'Test Automation with Playwright', provider: 'Playwright.dev', duration: '14 hours', price: '$0', affiliateUrl: 'https://playwright.dev/docs/intro', skillImpact: '+22 points', description: 'Write tests that catch what humans miss', difficulty: 'intermediate' },
    { title: 'AI System Testing & Evaluation', provider: 'Coursera', duration: '10 hours', price: '$49', affiliateUrl: 'https://coursera.org/ai-testing', skillImpact: '+18 points', description: 'A new critical skill: test AI systems responsibly', difficulty: 'advanced' },
  ],
  'Medical imaging analysis': [
    { title: 'AI Ethics in Healthcare', provider: 'Stanford Online', duration: '8 hours', price: '$0', affiliateUrl: 'https://online.stanford.edu/ai-health', skillImpact: '+20 points', description: 'Oversee AI rather than execute analysis', difficulty: 'advanced' },
    { title: 'Clinical Decision Support Systems', provider: 'Coursera', duration: '12 hours', price: '$49', affiliateUrl: 'https://coursera.org/clinical-ai', skillImpact: '+16 points', description: 'Validate & interpret AI medical recommendations', difficulty: 'intermediate' },
  ],
  'Legal research': [
    { title: 'Legal Technology & AI Oversight', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/legal-ai', skillImpact: '+18 points', description: 'Supervise AI legal tools — still requires human judgment', difficulty: 'intermediate' },
    { title: 'Strategic Legal Counsel', provider: 'LinkedIn Learning', duration: '7 hours', price: '$29', affiliateUrl: 'https://linkedin.com/learning/legal-counsel', skillImpact: '+14 points', description: 'Move from research to advisory roles', difficulty: 'intermediate' },
  ],

  // MIDDLE-RISK SKILLS — Augment or specialize
  'Graphic design (templates)': [
    { title: 'Brand Strategy & Identity', provider: 'Interaction Design Foundation', duration: '10 hours', price: '$0', affiliateUrl: 'https://www.interaction-design.org/courses/design-thinking', skillImpact: '+18 points', description: 'Design strategy, not templates', difficulty: 'intermediate' },
    { title: 'Creative Direction Mastery', provider: 'Skillshare', duration: '8 hours', price: '$32', affiliateUrl: 'https://skillshare.com/creative-direction', skillImpact: '+16 points', description: 'Direct creative vision that AI executes', difficulty: 'advanced' },
  ],
  'UX/UI design': [
    { title: 'Systems Thinking for Designers', provider: 'Nielsen Norman Group', duration: '6 hours', price: '$495', affiliateUrl: 'https://www.nngroup.com/courses', skillImpact: '+16 points', description: 'Design ecosystems, not just screens', difficulty: 'advanced' },
    { title: 'User Research & Testing', provider: 'CareerFoundry', duration: '16 hours', price: '$599', affiliateUrl: 'https://careerfoundry.com/en/courses/ux-design', skillImpact: '+14 points', description: 'Understand humans — AI cannot replace this', difficulty: 'intermediate' },
  ],
  'Video editing': [
    { title: 'Narrative Filmmaking', provider: 'MasterClass', duration: '12 hours', price: '$180', affiliateUrl: 'https://masterclass.com/classes', skillImpact: '+18 points', description: 'Tell stories with depth, not just edit clips', difficulty: 'advanced' },
    { title: 'Brand Storytelling with Video', provider: 'LinkedIn Learning', duration: '6 hours', price: '$29', affiliateUrl: 'https://linkedin.com/learning/video-storytelling', skillImpact: '+14 points', description: 'Communicate brand purpose through narrative', difficulty: 'intermediate' },
  ],
  'Copywriting (ads)': [
    { title: 'Persuasion Psychology for Marketers', provider: 'Udemy', duration: '9 hours', price: '$19', affiliateUrl: 'https://udemy.com/persuasion-psychology', skillImpact: '+16 points', description: 'Understand human psychology deeper than AI prompts', difficulty: 'advanced' },
    { title: 'Brand Messaging Strategy', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/brand-strategy', skillImpact: '+14 points', description: 'Strategy before copy — the real value', difficulty: 'intermediate' },
  ],
  'Financial modelling': [
    { title: 'Advanced FP&A Analytics', provider: 'CFI', duration: '18 hours', price: '$399', affiliateUrl: 'https://corporatefinanceinstitute.com/courses', skillImpact: '+18 points', description: 'Strategic finance beyond spreadsheets', difficulty: 'advanced' },
    { title: 'Valuation & Corporate Strategy', provider: 'Coursera', duration: '12 hours', price: '$49', affiliateUrl: 'https://coursera.org/valuation', skillImpact: '+16 points', description: 'Make strategic recommendations from models', difficulty: 'advanced' },
  ],
  'Cold calling/sales': [
    { title: 'Enterprise Sales Strategy', provider: 'LinkedIn Learning', duration: '8 hours', price: '$29', affiliateUrl: 'https://linkedin.com/learning/enterprise-sales', skillImpact: '+18 points', description: 'Strategic selling, not just calling', difficulty: 'advanced' },
    { title: 'AI-Augmented Sales', provider: 'Coursera', duration: '6 hours', price: '$39', affiliateUrl: 'https://coursera.org/ai-sales', skillImpact: '+16 points', description: 'Use AI for qualification, focus on relationship building', difficulty: 'intermediate' },
  ],

  // PROTECTED SKILLS — Already hard to automate
  'Leadership coaching': [
    { title: 'Executive Coaching Certification', provider: 'International Coach Federation', duration: '60 hours', price: '$3000', affiliateUrl: 'https://coachfederation.org', skillImpact: '+8 points', description: 'Deepen your human transformation impact', difficulty: 'expert' },
    { title: 'Organizational Change Leadership', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/change-leadership', skillImpact: '+6 points', description: 'Lead transformation in the age of AI', difficulty: 'advanced' },
  ],
  'Crisis counselling': [
    { title: 'Trauma-Informed Care', provider: 'IACP', duration: '40 hours', price: '$500', affiliateUrl: 'https://iacp.org.uk/courses', skillImpact: '+4 points', description: 'Deepen your capability in life-changing moments', difficulty: 'advanced' },
    { title: 'Suicide Prevention & Intervention', provider: 'AFSP', duration: '4 hours', price: '$0', affiliateUrl: 'https://afsp.org/real-stories-real-help', skillImpact: '+8 points', description: 'Save lives — fundamentally human', difficulty: 'intermediate' },
  ],
  'Negotiation': [
    { title: 'Advanced Negotiation Mastery', provider: 'Harvard ManageMentor', duration: '12 hours', price: '$99', affiliateUrl: 'https://managementor.harvardbusiness.org', skillImpact: '+6 points', description: 'Win-win outcomes require human understanding', difficulty: 'advanced' },
    { title: 'Difficult Conversations Framework', provider: 'Coursera', duration: '6 hours', price: '$39', affiliateUrl: 'https://coursera.org/difficult-conversations', skillImpact: '+7 points', description: 'Navigate conflict with empathy', difficulty: 'intermediate' },
  ],

  // STRATEGIC/MANAGEMENT SKILLS
  'Strategic planning': [
    { title: 'Business Strategy Mastery', provider: 'Coursera', duration: '10 hours', price: '$49', affiliateUrl: 'https://coursera.org/business-strategy', skillImpact: '+12 points', description: 'Think 10 years ahead in an AI-accelerated world', difficulty: 'advanced' },
    { title: 'Scenario Planning & Foresight', provider: 'Futures Academy', duration: '8 hours', price: '$99', affiliateUrl: 'https://futures.org.uk', skillImpact: '+14 points', description: 'Navigate unprecedented change', difficulty: 'advanced' },
  ],
  'System architecture': [
    { title: 'Microservices Architecture Mastery', provider: 'O\'Reilly Learning Platform', duration: '12 hours', price: '$49', affiliateUrl: 'https://learning.oreilly.com', skillImpact: '+16 points', description: 'Design scalable systems at enterprise scale', difficulty: 'advanced' },
    { title: 'AI-Ready Architecture Patterns', provider: 'Coursera', duration: '10 hours', price: '$49', affiliateUrl: 'https://coursera.org/ai-architecture', skillImpact: '+14 points', description: 'Build systems that leverage AI safely', difficulty: 'advanced' },
  ],
  'Market research': [
    { title: 'Consumer Psychology Deep Dive', provider: 'Coursera', duration: '10 hours', price: '$49', affiliateUrl: 'https://coursera.org/consumer-insights', skillImpact: '+14 points', description: 'Go beyond data — understand human behavior', difficulty: 'advanced' },
    { title: 'Qualitative Research Methods', provider: 'Interaction Design Foundation', duration: '8 hours', price: '$0', affiliateUrl: 'https://www.interaction-design.org', skillImpact: '+12 points', description: 'Discover what surveys cannot', difficulty: 'intermediate' },
  ],

  // TECH SPECIALIZED SKILLS
  'Machine learning engineering': [
    { title: 'Production ML Systems', provider: 'DeepLearning.AI', duration: '20 hours', price: '$0', affiliateUrl: 'https://deeplearning.ai/short-courses', skillImpact: '+16 points', description: 'Build ML systems that work in the real world', difficulty: 'expert' },
    { title: 'Responsible AI Practices', provider: 'Google Cloud', duration: '12 hours', price: '$0', affiliateUrl: 'https://cloud.google.com/training', skillImpact: '+14 points', description: 'AI governance is critical', difficulty: 'advanced' },
  ],
  'Cloud infrastructure': [
    { title: 'AWS Solutions Architect Professional', provider: 'Linux Academy', duration: '40 hours', price: '$99', affiliateUrl: 'https://linuxacademy.com', skillImpact: '+16 points', description: 'Design cloud systems at scale', difficulty: 'advanced' },
    { title: 'Multi-Cloud Strategy', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/multi-cloud', skillImpact: '+12 points', description: 'Navigate complex cloud ecosystems', difficulty: 'advanced' },
  ],
  'Cybersecurity analysis': [
    { title: 'CEH: Certified Ethical Hacker', provider: 'EC-Council', duration: '40 hours', price: '$500', affiliateUrl: 'https://www.eccouncil.org', skillImpact: '+18 points', description: 'Security is increasingly critical in AI era', difficulty: 'expert' },
    { title: 'Zero Trust Architecture', provider: 'Coursera', duration: '10 hours', price: '$49', affiliateUrl: 'https://coursera.org/zero-trust', skillImpact: '+14 points', description: 'Modern security for modern threats', difficulty: 'advanced' },
  ],
};

export const jobRoleRoadmaps: Record<string, RoadmapPhase[]> = {
  lawyer: [
    {
      phase: 'Phase 1', weeks: 'Weeks 1–3', focus: 'AI-Legal Supervision & Risk Mitigation',
      milestones: ['Audit which of your current tasks AI can perform', 'Identify 3 workflows to supervise vs. execute'],
      courses: [
        { title: 'Legal Technology & AI Oversight', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/legal-ai', skillImpact: '+15 safety points', description: 'Supervise AI legal tools ethically and effectively', difficulty: 'intermediate' },
        { title: 'Contract Review Best Practices', provider: 'LinkedIn Learning', duration: '5 hours', price: '$29', affiliateUrl: 'https://linkedin.com/learning/contracts', skillImpact: '+12 points', description: 'Validate AI-generated contracts', difficulty: 'intermediate' },
      ],
    },
    {
      phase: 'Phase 2', weeks: 'Weeks 4–8', focus: 'Strategic Legal Advisory',
      milestones: ['Complete 2 AI-augmented case analyses', 'Present AI impact assessment to firm leadership'],
      courses: [
        { title: 'Strategic Legal Counsel', provider: 'LinkedIn Learning', duration: '7 hours', price: '$29', affiliateUrl: 'https://linkedin.com/learning/legal-counsel', skillImpact: '+14 points', description: 'Advise on strategy, not just compliance', difficulty: 'advanced' },
      ],
    },
  ],
  'data-analyst': [
    {
      phase: 'Phase 1', weeks: 'Weeks 1–4', focus: 'SQL & Data Engineering Foundation',
      milestones: ['Build a 5-table database from scratch', 'Write 10 complex queries'],
      courses: [
        { title: 'Advanced SQL', provider: 'DataCamp', duration: '20 hours', price: '$99', affiliateUrl: 'https://datacamp.com/sql', skillImpact: '+18 points', description: 'SQL is harder to automate than BI tools', difficulty: 'intermediate' },
        { title: 'Data Warehouse Fundamentals', provider: 'Udemy', duration: '12 hours', price: '$19', affiliateUrl: 'https://udemy.com/data-warehouse', skillImpact: '+14 points', description: 'Understand data architecture', difficulty: 'intermediate' },
      ],
    },
    {
      phase: 'Phase 2', weeks: 'Weeks 5–9', focus: 'Data Storytelling & Strategy',
      milestones: ['Create 3 executive dashboards', 'Present insights that drove a decision'],
      courses: [
        { title: 'Data Storytelling Mastery', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/data-storytelling', skillImpact: '+16 points', description: 'Data becomes valuable when it drives decisions', difficulty: 'intermediate' },
      ],
    },
  ],
};

export const getJobRoleRoadmap = (jobId: string | null): RoadmapPhase[] | null => {
  if (!jobId) return null;
  return jobRoleRoadmaps[jobId.toLowerCase()] || null;
};

// Maps skill names to courses — with fuzzy matching for variants
export const getCoursesForSkill = (skillName: string): Course[] => {
  const key = skillName.toLowerCase();
  
  // Direct match
  if (courseDatabase[skillName]) return courseDatabase[skillName];
  
  // Find by exact key in lowercase
  for (const [dbKey, courses] of Object.entries(courseDatabase)) {
    if (dbKey.toLowerCase() === key) return courses;
  }
  
  // Partial match (first skill starting with this)
  for (const [dbKey, courses] of Object.entries(courseDatabase)) {
    if (dbKey.toLowerCase().startsWith(key) || key.includes(dbKey.toLowerCase())) {
      return courses;
    }
  }
  
  // Default: generic professional development
  return [
    { title: 'Professional Skills for Your Role', provider: 'LinkedIn Learning', duration: '6 hours', price: '$29', affiliateUrl: 'https://linkedin.com/learning', skillImpact: '+8 points', description: 'Develop skills specific to your role', difficulty: 'beginner' },
    { title: 'Strategic Thinking & Planning', provider: 'Coursera', duration: '8 hours', price: '$49', affiliateUrl: 'https://coursera.org/strategy', skillImpact: '+10 points', description: 'Move from execution to strategy', difficulty: 'intermediate' },
  ];
};
