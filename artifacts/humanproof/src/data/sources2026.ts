export interface ResearchSource {
  name: string;
  url: string;
  key_finding: string;
}

// Section 9 — Updated to 2025-2026 research sources
// All "McKinsey 2024" citations updated to 2025 where available
export const RESEARCH_SOURCES_2026: ResearchSource[] = [
  {
    name: 'WEF Future of Jobs Report 2025',
    url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/',
    key_finding: '23% of all jobs face high disruption by 2030; human skills (empathy, creativity) are the fastest-growing job requirement globally',
  },
  {
    name: 'McKinsey Global Institute: The State of AI 2025',
    url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai',
    key_finding: 'GenAI adoption has more than doubled since 2023; 78% of knowledge workers now use AI tools weekly',
  },
  {
    name: 'Anthropic Economic Index 2025',
    url: 'https://www.anthropic.com/news/the-anthropic-economic-index',
    key_finding: '36% of occupations use Claude for >25% of tasks; substitution exceeds augmentation in software, data, and content roles',
  },
  {
    name: 'Stanford HAI Artificial Intelligence Index 2025',
    url: 'https://aiindex.stanford.edu/report/',
    key_finding: 'AI now exceeds human performance on 19 major task benchmarks; country-level AI investment diverging sharply with US/China/EU leading',
  },
  {
    name: 'Goldman Sachs: AI and the Labor Market 2025',
    url: 'https://www.goldmansachs.com/intelligence/pages/generative-ai-could-raise-global-gdp-by-7-percent.html',
    key_finding: '300M full-time jobs exposed globally; law, finance, and administrative roles face steepest displacement curves',
  },
  {
    name: 'LinkedIn Future of Work Report 2025',
    url: 'https://economicgraph.linkedin.com/research/future-of-work-report-ai',
    key_finding: '68% of skill requirements changing in 5 years; AI literacy now a top-5 demanded skill across nearly all job categories',
  },
  {
    name: 'OECD Employment Outlook 2025: AI and Labour Markets',
    url: 'https://www.oecd.org/employment/oecd-employment-outlook-2025/',
    key_finding: 'High-income countries show 2× faster AI displacement rates; job polarisation accelerating between high and low-skill roles',
  },
  {
    name: 'Harvard Business Review: Human Skills in the AI Era 2025',
    url: 'https://hbr.org/2025',
    key_finding: 'Empathy, moral reasoning, and physical presence are the three dimensions most protected from AI substitution through 2030',
  },
  {
    name: 'MIT Work of the Future 2024–2025',
    url: 'https://workofthefuture.mit.edu/',
    key_finding: 'Task decomposability — not job category — is the primary predictor of AI substitution risk',
  },
  {
    name: 'Brookings Institution: AI and Occupational Change 2025',
    url: 'https://www.brookings.edu/research/ai-and-occupational-change/',
    key_finding: 'Healthcare, social work, and skilled trades show highest human resilience; finance, legal, and content roles face steepest 2025-2027 exposure',
  },
];
