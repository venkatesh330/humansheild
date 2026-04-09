// quickProfilerAgent.ts
// Agent used to instantly discover industry/size for unknown companies.
// This allows the search bar to work like Google (no manual entry needed).

import { checkRateLimit } from '../rateLimit/apiRateLimiter';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-3-27b-it:free';

export interface CompanyProfile {
  industry: string;
  isPublic: boolean;
  employeeCount: number;
  region: 'US' | 'EU' | 'IN' | 'APAC' | 'GLOBAL';
  ticker?: string;
  confidence: number;
}

export const profileUnknownCompany = async (companyName: string): Promise<CompanyProfile | null> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) return null;
  if (!checkRateLimit('openrouter')) return null;

  const prompt = `Quickly identify the basic profile for this company: "${companyName}".

Return ONLY this JSON — no markdown, no words:

{
  "industry": "<One of: Technology, E-commerce, Finance, Healthcare, Manufacturing, Media, Retail, Energy, Transportation, Services>",
  "isPublic": <boolean>,
  "employeeCount": <integer estimate, e.g. 50, 500, 10000>,
  "region": "<One of: US, EU, IN, APAC, GLOBAL>",
  "ticker": "<null or ticker string if public>",
  "confidence": <0.0 to 1.0>
}

If you are not sure, provide an industry average for a company of this name. If it sounds like a small local business, set employeeCount to 50 and isPublic to false.`;

  try {
    const response = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://humanproof.app',
        'X-Title': 'HumanProof Quick Profiler',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? '';
    const parsed: CompanyProfile = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return parsed;
  } catch (error: any) {
    console.warn('[QuickProfiler] Failed:', error.message);
    return null;
  }
};
