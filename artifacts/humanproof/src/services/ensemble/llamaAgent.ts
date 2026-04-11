// llamaAgent.ts
// Agent 3: Llama 3.3 70B (via Groq) — Role & industry cross-validation
// Free tier: 14,400 requests/day, 800 tokens/sec (fastest inference available)

import { checkRateLimit } from '../rateLimit/apiRateLimiter';

const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export interface LlamaSignals {
  roleVulnerabilityScore: number;     // 0–1
  departmentRisk: number;
  automationExposure: number;
  tenureProtection: number;           // higher = more protected
  uniquenessProtection: number;       // higher = more protected
  compositeRoleRisk: number;          // 0–1, main output
  confidence: number;
  roleCategory: 'high-risk' | 'moderate-risk' | 'low-risk' | 'strategic';
  primaryThreat: 'ai-automation' | 'budget-cuts' | 'restructuring' | 'outsourcing' | 'none';
  protectionStrength: 'strong' | 'moderate' | 'weak';
}

export interface LlamaResult {
  model: 'llama-3.3-70b';
  success: boolean;
  signals: LlamaSignals | null;
  rawConfidence: number;
}

export const runLlamaRoleValidation = async (
  roleTitle: string,
  department: string,
  industry: string,
  tenureYears: number,
  isUniqueRole: boolean,
  swarmContext?: string
): Promise<LlamaResult> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return { model: 'llama-3.3-70b', success: false, signals: null, rawConfidence: 0 };
  if (!checkRateLimit('groq')) return { model: 'llama-3.3-70b', success: false, signals: null, rawConfidence: 0 };

  const swarmSection = swarmContext ? `\n\n${swarmContext}\n` : '';

  const prompt = `You are a workforce transformation expert with deep knowledge of which roles are being eliminated in 2025-2026.${swarmSection}

Assess the layoff risk for this specific role profile:

Job Title: ${roleTitle}
Department: ${department}
Industry: ${industry}
Years at company: ${tenureYears}
Only person in this role: ${isUniqueRole}

Consider:
1. Is ${roleTitle} commonly listed in recent mass layoff announcements in 2025-2026?
2. Is ${department} typically cut early or protected in restructuring?
3. What is the automation vulnerability of ${roleTitle} in the ${industry} sector?
4. Does ${tenureYears} years of tenure protect or make this person seem expensive?
5. Does being ${isUniqueRole ? 'the only person' : 'one of many'} in this role affect risk?

Respond with ONLY this JSON — no markdown:

{
  "roleVulnerabilityScore": <0.0-1.0>,
  "departmentRisk": <0.0-1.0>,
  "automationExposure": <0.0-1.0>,
  "tenureProtection": <0.0-1.0>,
  "uniquenessProtection": <0.0-1.0>,
  "compositeRoleRisk": <0.0-1.0>,
  "confidence": <0.0-1.0>,
  "roleCategory": "<high-risk|moderate-risk|low-risk|strategic>",
  "primaryThreat": "<ai-automation|budget-cuts|restructuring|outsourcing|none>",
  "protectionStrength": "<strong|moderate|weak>"
}`;

  try {
    const response = await fetch(GROQ_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 350,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);
    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? '';
    const parsed: LlamaSignals = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return {
      model: 'llama-3.3-70b',
      success: true,
      signals: parsed,
      rawConfidence: parsed.confidence ?? 0.5,
    };
  } catch (error: any) {
    console.warn('[LlamaAgent] Failed:', error.message);
    return { model: 'llama-3.3-70b', success: false, signals: null, rawConfidence: 0 };
  }
};
