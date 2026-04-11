// aiReplacementPatternAgent.ts
// AI Signal — Historical AI-for-human replacement pattern by role category.
// HEURISTIC — tracks known waves of AI replacement with confidence levels.

import { AgentFn, AgentSignal, SwarmInput } from '../../swarmTypes';

// Known replacement patterns with signal + confidence (based on documented cases 2022-2025)
const REPLACEMENT_PATTERNS: { keywords: string[]; signal: number; confidence: number; pattern: string }[] = [
  { keywords: ['customer service', 'support', 'chat'],               signal: 0.82, confidence: 0.88, pattern: 'wave-1-complete' },
  { keywords: ['content', 'copywriter', 'write', 'writer'],          signal: 0.80, confidence: 0.85, pattern: 'wave-1-complete' },
  { keywords: ['translator', 'transl'],                              signal: 0.85, confidence: 0.90, pattern: 'wave-1-complete' },
  { keywords: ['data entry', 'data processing'],                     signal: 0.90, confidence: 0.92, pattern: 'wave-1-complete' },
  { keywords: ['financial analyst', 'junior analyst'],               signal: 0.65, confidence: 0.78, pattern: 'wave-2-active' },
  { keywords: ['recruiter', 'talent acquisition'],                   signal: 0.62, confidence: 0.75, pattern: 'wave-2-active' },
  { keywords: ['junior developer', 'junior engineer', 'junior'],     signal: 0.55, confidence: 0.70, pattern: 'wave-2-active' },
  { keywords: ['qa engineer', 'quality assurance', 'tester'],        signal: 0.60, confidence: 0.72, pattern: 'wave-2-active' },
  { keywords: ['software engineer', 'developer', 'programmer'],      signal: 0.40, confidence: 0.60, pattern: 'wave-3-emerging' },
  { keywords: ['data scientist', 'machine learning'],                signal: 0.30, confidence: 0.55, pattern: 'wave-3-emerging' },
  { keywords: ['product manager', 'product'],                        signal: 0.28, confidence: 0.50, pattern: 'wave-3-emerging' },
  { keywords: ['nurse', 'medical', 'clinical'],                      signal: 0.15, confidence: 0.80, pattern: 'wave-4-distant' },
  { keywords: ['teacher', 'instructor', 'educator'],                 signal: 0.20, confidence: 0.72, pattern: 'wave-4-distant' },
  { keywords: ['manager', 'director', 'executive', 'vp'],           signal: 0.18, confidence: 0.65, pattern: 'wave-4-distant' },
];

const run = async (input: SwarmInput): Promise<AgentSignal> => {
  const roleLower = input.roleTitle.toLowerCase();

  const match = REPLACEMENT_PATTERNS.find(p =>
    p.keywords.some(kw => roleLower.includes(kw))
  );

  if (match) {
    return {
      agentId:    'aiReplacementPatternAgent',
      category:   'ai',
      signal:     match.signal,
      confidence: match.confidence,
      sourceType: 'heuristic',
      ageInDays:  60,
      metadata:   { pattern: match.pattern, matchedKeywords: match.keywords },
    };
  }

  return {
    agentId:    'aiReplacementPatternAgent',
    category:   'ai',
    signal:     0.40,
    confidence: 0.35,
    sourceType: 'heuristic',
    ageInDays:  60,
    metadata:   { pattern: 'unclassified', role: input.roleTitle },
  };
};

export const aiReplacementPatternAgent: AgentFn = { id: 'aiReplacementPatternAgent', run };
