// geminiAgent.ts
// Agent 4: Gemini 2.0 Flash (Google AI Studio) — Final synthesis & confidence verifier
// Free: 1 million tokens/day. Receives ALL other model outputs and acts as judge.

import { checkRateLimit } from '../rateLimit/apiRateLimiter';
import { GemmaResult } from './gemmaAgent';
import { DeepSeekResult } from './deepseekAgent';
import { LlamaResult } from './llamaAgent';
import { ScoreBreakdown } from '../layoffScoreEngine';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiSynthesis {
  finalScore: number;               // 0–100
  confidencePercent: number;        // 0–100
  modelAgreementPercent: number;    // 0–100
  outlierDetected: boolean;
  outlierModel: string | null;
  outlierReason: string | null;
  scoreAdjustmentFromEngine: number; // can be negative
  adjustmentReason: string;
  dominantRiskFactor: string;
  keyProtectiveFactor: string;
  finalTier: 'very-low' | 'low' | 'moderate' | 'elevated' | 'high';
  verificationNote: string;
}

export interface GeminiResult {
  model: 'gemini-2.0-flash';
  success: boolean;
  synthesis: GeminiSynthesis | null;
}

interface GeminiSynthesisInput {
  companyName: string;
  roleTitle: string;
  gemmaOutput: GemmaResult;
  deepseekOutput: DeepSeekResult;
  llamaOutput: LlamaResult;
  engineScore: number;
  engineBreakdown: ScoreBreakdown;
}

export const runGeminiSynthesis = async (input: GeminiSynthesisInput): Promise<GeminiResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return { model: 'gemini-2.0-flash', success: false, synthesis: null };
  if (!checkRateLimit('gemini')) return { model: 'gemini-2.0-flash', success: false, synthesis: null };

  const { companyName, roleTitle, gemmaOutput, deepseekOutput, llamaOutput, engineScore, engineBreakdown } = input;

  const prompt = `You are the final verification layer of a multi-model AI ensemble for layoff risk assessment.

Three independent AI models and a deterministic engine have already analyzed this case. Your job is to:
1. Review their outputs for consistency
2. Identify if any model is an outlier (and why)
3. Produce a final calibrated score
4. State your confidence level

COMPANY: ${companyName}
ROLE: ${roleTitle}

--- GEMMA-3 OSINT ANALYSIS ---
${JSON.stringify(gemmaOutput?.signals || 'FAILED - model unavailable')}

--- DEEPSEEK-V3 FINANCIAL ANALYSIS ---
${JSON.stringify(deepseekOutput?.signals || 'FAILED - model unavailable')}

--- LLAMA-3.3 ROLE VALIDATION ---
${JSON.stringify(llamaOutput?.signals || 'FAILED - model unavailable')}

--- 5-LAYER DETERMINISTIC ENGINE ---
Raw score: ${engineScore}/100
Layer breakdown: L1(Company Health)=${Math.round(engineBreakdown.L1 * 100)}, L2(Layoff History)=${Math.round(engineBreakdown.L2 * 100)}, L3(Role Exposure)=${Math.round(engineBreakdown.L3 * 100)}, L4(Market)=${Math.round(engineBreakdown.L4 * 100)}, L5(Employee)=${Math.round(engineBreakdown.L5 * 100)}

SYNTHESIS TASK:
- Agreement: If 3+ sources agree, trust that signal strongly
- Contradiction: If one model sharply disagrees, investigate why
- Gap: If engine score and AI signals diverge by >20 points, flag it
- If models FAILED: rely more heavily on the models that succeeded and the engine

Respond with ONLY this JSON — no markdown:

{
  "finalScore": <integer 0-100>,
  "confidencePercent": <integer 0-100>,
  "modelAgreementPercent": <integer 0-100>,
  "outlierDetected": <boolean>,
  "outlierModel": "<model name or null>",
  "outlierReason": "<brief reason or null>",
  "scoreAdjustmentFromEngine": <integer, positive means higher than engine score>,
  "adjustmentReason": "<why you adjusted or 'No adjustment needed'>",
  "dominantRiskFactor": "<the single biggest risk signal as a short phrase>",
  "keyProtectiveFactor": "<the single strongest protective signal as a short phrase>",
  "finalTier": "<very-low|low|moderate|elevated|high>",
  "verificationNote": "<1 sentence synthesis summary>"
}`;

  try {
    const response = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.05,
          maxOutputTokens: 400,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json();
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    // BUG-B15 FIX: More robust JSON extraction supporting markdown blocks and non-matching prefixes
    let jsonStr = raw.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    
    const parsed: GeminiSynthesis = JSON.parse(jsonStr);

    return { model: 'gemini-2.0-flash', success: true, synthesis: parsed };
  } catch (error: any) {
    console.warn('[GeminiAgent] Failed:', error.message);
    return { model: 'gemini-2.0-flash', success: false, synthesis: null };
  }
};
