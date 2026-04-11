// deepseekAgent.ts
// Agent 2: DeepSeek-V3 (via OpenRouter) — Financial signal analysis
// Free tier via openrouter.ai, exceptional reasoning for financial patterns

import { checkRateLimit } from '../rateLimit/apiRateLimiter';
import { LayoffRound } from '../../data/companyDatabase';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';

export interface DeepSeekSignals {
  financialPressureScore: number;    // 0–1
  industryContagionRisk: number;
  sectorHealthScore: number;
  overstaffingRisk: number;
  marketCycleRisk: number;
  compositeFinancialRisk: number;    // 0–1, main output
  confidence: number;
  primaryRiskDriver: string;
  timeHorizon: '3months' | '6months' | '12months' | 'beyond12months';
  patternMatch: 'early-warning' | 'developing' | 'acute' | 'stable';
}

export interface DeepSeekResult {
  model: 'deepseek-v3';
  success: boolean;
  signals: DeepSeekSignals | null;
  rawConfidence: number;
}

export const runDeepSeekFinancial = async (
  companyName: string,
  industry: string,
  companySize: number | string,
  layoffHistory: LayoffRound[],
  swarmContext?: string
): Promise<DeepSeekResult> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) return { model: 'deepseek-v3', success: false, signals: null, rawConfidence: 0 };
  if (!checkRateLimit('openrouter')) return { model: 'deepseek-v3', success: false, signals: null, rawConfidence: 0 };

  const swarmSection = swarmContext ? `\n\n${swarmContext}\n` : '';

  const prompt = `You are a financial risk analyst specializing in corporate workforce restructuring patterns.${swarmSection}

Perform a financial risk assessment for layoff probability:

Company: ${companyName}
Industry: ${industry}
Company Size: ${companySize} employees
Known Layoff History: ${JSON.stringify(layoffHistory)}

Think step by step:
1. What financial pressure signals indicate upcoming layoffs for companies in ${industry}?
2. How does ${companyName}'s profile match historical pre-layoff patterns?
3. What is the sector health and contagion risk?

Return ONLY this JSON structure — no markdown or explanation:

{
  "financialPressureScore": <0.0-1.0>,
  "industryContagionRisk": <0.0-1.0>,
  "sectorHealthScore": <0.0-1.0>,
  "overstaffingRisk": <0.0-1.0>,
  "marketCycleRisk": <0.0-1.0>,
  "compositeFinancialRisk": <0.0-1.0>,
  "confidence": <0.0-1.0>,
  "primaryRiskDriver": "<one sentence>",
  "timeHorizon": "<3months|6months|12months|beyond12months>",
  "patternMatch": "<early-warning|developing|acute|stable>"
}`;

  try {
    const response = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://humanproof.app',
        'X-Title': 'HumanProof Layoff Calculator',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.05,  // Near-deterministic for financial analysis
        max_tokens: 350,
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? '';
    const parsed: DeepSeekSignals = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return {
      model: 'deepseek-v3',
      success: true,
      signals: parsed,
      rawConfidence: parsed.confidence ?? 0.5,
    };
  } catch (error: any) {
    console.warn('[DeepSeekAgent] Failed:', error.message);
    return { model: 'deepseek-v3', success: false, signals: null, rawConfidence: 0 };
  }
};
