// gemmaAgent.ts
// Agent 1: Gemma 3 27B (via OpenRouter) — OSINT & company signal extraction
// Free tier: 200 requests/day via openrouter.ai

import { checkRateLimit } from '../rateLimit/apiRateLimiter';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-3-27b-it:free';

export interface GemmaSignals {
  companyHealthSignal: number;      // 0–1, higher = more risk
  recentLayoffSignal: number;
  financialStressSignal: number;
  aiAdoptionThreat: number;
  roleSpecificRisk: number;
  confidence: number;               // 0–1
  keyRiskFactors: string[];
  protectiveFactors: string[];
  reasoning: string;
}

export interface GemmaResult {
  model: 'gemma-3-27b';
  success: boolean;
  signals: GemmaSignals | null;
  rawConfidence: number;
}

export const runGemmaOSINT = async (
  companyName: string,
  industry: string,
  roleTitle: string
): Promise<GemmaResult> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) return { model: 'gemma-3-27b', success: false, signals: null, rawConfidence: 0 };
  if (!checkRateLimit('openrouter')) return { model: 'gemma-3-27b', success: false, signals: null, rawConfidence: 0 };

  const prompt = `You are a corporate intelligence analyst specializing in workforce risk assessment.

Analyze the following company and provide a structured risk assessment:

Company: ${companyName}
Industry: ${industry}
Role being assessed: ${roleTitle}

Respond with ONLY this JSON — no markdown, no explanation:

{
  "companyHealthSignal": <number 0.0-1.0, where 1.0 = highest layoff risk>,
  "recentLayoffSignal": <number 0.0-1.0>,
  "financialStressSignal": <number 0.0-1.0>,
  "aiAdoptionThreat": <number 0.0-1.0>,
  "roleSpecificRisk": <number 0.0-1.0>,
  "confidence": <number 0.0-1.0>,
  "keyRiskFactors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "protectiveFactors": ["<factor 1>", "<factor 2>"],
  "reasoning": "<2 sentence max explanation>"
}

Base analysis on known financial performance of ${companyName}, industry trends in ${industry}, and AI automation vulnerability of ${roleTitle} roles. If you have low confidence about ${companyName}, use industry-level signals and set confidence below 0.5.`;

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
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? '';
    const parsed: GemmaSignals = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return {
      model: 'gemma-3-27b',
      success: true,
      signals: parsed,
      rawConfidence: parsed.confidence ?? 0.5,
    };
  } catch (error: any) {
    console.warn('[GemmaAgent] Failed:', error.message);
    return { model: 'gemma-3-27b', success: false, signals: null, rawConfidence: 0 };
  }
};
