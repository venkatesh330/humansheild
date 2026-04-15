import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { TASK_AUTO, DISRUPTION_VELOCITY, AUGMENTATION, NETWORK_MOAT, EXP_SENSITIVITY, EXP_RISK_BASE, COUNTRY_DATA, INDUSTRY_KEY_MULT, D3_CURVE_EXPONENT } from '../data/riskData';

interface DimensionWeights {
  d1: number; d2: number; d3: number; d4: number; d5: number; d6: number;
}

function getDynamicWeights(workType: string, industry: string): DimensionWeights {
  const ind = industry ?? '';
  // Healthcare / Mental Health
  if (ind.startsWith('health') || ind === 'mental_health' || ind === 'nursing') {
    return { d1: 0.18, d2: 0.12, d3: 0.30, d4: 0.22, d5: 0.08, d6: 0.10 };
  }
  // BPO / Admin
  if (ind === 'bpo' || ind === 'admin') {
    return { d1: 0.35, d2: 0.28, d3: 0.12, d4: 0.12, d5: 0.08, d6: 0.05 };
  }
  // Creative
  if (['content', 'media', 'design', 'animation', 'music', 'photography'].includes(ind)) {
    return { d1: 0.25, d2: 0.20, d3: 0.28, d4: 0.12, d5: 0.07, d6: 0.08 };
  }
  // Legal / Consulting
  if (['legal', 'consulting'].includes(ind)) {
    return { d1: 0.20, d2: 0.18, d3: 0.20, d4: 0.20, d5: 0.08, d6: 0.14 };
  }
  // Tech
  if (ind.startsWith('it_') || ind === 'fintech') {
    return { d1: 0.28, d2: 0.20, d3: 0.18, d4: 0.16, d5: 0.09, d6: 0.09 };
  }
  // Finance
  if (['finance', 'insurance', 'investment'].includes(ind)) {
    return { d1: 0.26, d2: 0.22, d3: 0.18, d4: 0.16, d5: 0.09, d6: 0.09 };
  }
  // Default
  return { d1: 0.26, d2: 0.18, d3: 0.20, d4: 0.16, d5: 0.09, d6: 0.11 };
}

export const getVerdict = (score: number) => {
  if (score < 25) return "AI-Resistant";
  if (score < 50) return "Resilient";
  if (score < 70) return "Exposed";
  return "Critical Risk";
};

export const getTimeline = (score: number) => {
  if (score < 25) return "8-12 Years";
  if (score < 50) return "5-8 Years";
  if (score < 70) return "2-4 Years";
  return "Immediate (< 2 Years)";
};

export const getUrgency = (score: number) => {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "High";
  return "Critical";
};

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: "Missing Supabase credentials" });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.authorization || '' } }
    });

    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY environment variable" });

    const { roleKey, industry, experience = '5-10', country = 'usa' } = req.body;
    if (!roleKey) return res.status(400).json({ error: "roleKey is required" });

    // 1. Fetch grounded market data and career intelligence in parallel
    const [groundedResponse, modularIntelResponse] = await Promise.all([
      supabase.from('grounded_market_data').select('*').eq('role_key', roleKey).single(),
      supabase.from('career_intelligence').select('skills, career_paths, summary, inaction_scenario').eq('role_key', roleKey).single()
    ]);
    const groundedData = groundedResponse.data;
    const modularIntel = modularIntelResponse.data;

    let groundedContext = "";
    if (groundedData) {
      groundedContext = `
Baseline Risk Consensus for ${roleKey}:
- Industry: ${groundedData.industry_sector}
- Automatability Score: ${groundedData.automatability_score}
- AI Tool Maturity: ${groundedData.ai_tool_maturity}
- Human Augmentation Potential: ${groundedData.human_augmentation_score}
- Safe Role Reference: ${groundedData.safe_alternative_role}

This baseline should inform your risk calculation.`;
    }

    let seededCareerContext = "";
    if (modularIntel) {
      const skills = modularIntel.skills || {};
      const paths = modularIntel.career_paths || [];
      
      seededCareerContext = `
Pre-Validated Career Intelligence for ${roleKey} (Authoritative Baseline):
SUMMARY: ${modularIntel.summary}

VALIDATED SKILL RISK MATRIX:
- OBSOLETE: ${skills.obsolete?.map((s: any) => s.skill).join(', ') || 'None'}
- AT-RISK: ${skills.at_risk?.map((s: any) => s.skill).join(', ') || 'None'}
- SAFE/SHIELD: ${skills.safe?.map((s: any) => s.skill).join(', ') || 'None'}

VALIDATED CAREER PIVOTS:
${paths?.map((p: any) => `- ${p.role}: ${p.riskReduction || p.risk_pct}% risk reduction | Gap: ${p.skillGap || p.gap}`).join('\n') || 'None'}

INACTION SCENARIO: ${modularIntel.inaction_scenario}

INSTRUCTION: Use the above as your authoritative baseline. Personalize the reasoning for the user's specific industry, experience, and country. Do NOT contradict these validated data points.
`;
    }
    
    // --- 2. ADDITIVE SERVER-SIDE MATH ENGINE ---
    const induMult = INDUSTRY_KEY_MULT[industry] || 1.0;
    const d1_raw = TASK_AUTO[industry]?.[roleKey] || TASK_AUTO['default']?.[roleKey] || 50;
    const calcD1 = Math.round(Math.min(d1_raw * (induMult > 1 ? 1.1 : 0.9), 100));
    
    const calcD2 = DISRUPTION_VELOCITY[roleKey] ?? 50;
    
    const rawAug = AUGMENTATION[roleKey] ?? 50;
    const calcD3 = Math.round(100 * (1 - Math.pow(rawAug / 100, D3_CURVE_EXPONENT)));
    
    const sensFactor = EXP_SENSITIVITY[roleKey] ?? 0.42;
    const baseRisk = EXP_RISK_BASE[experience] ?? 50;
    let calcD4 = Math.round(baseRisk * (1 - sensFactor));
    
    // Architecture Upgrade: Experience Decay Penalty
    // Highly experienced purely technical roles (non-leadership) face "Dinosaur Tooling" disruption velocity
    if ((industry.startsWith('it_') || roleKey.startsWith('sw_') || roleKey.startsWith('web_')) && !roleKey.includes('lead') && !roleKey.includes('arch') && !roleKey.includes('pm')) {
      if (experience === '20+') calcD4 = Math.min(100, Math.round(calcD4 * 1.35));
      if (experience === '10-20') calcD4 = Math.min(100, Math.round(calcD4 * 1.15));
    }
    
    const countryKey = country.toLowerCase().replace(/\s+/g, '_');
    const [adoption, regulation] = COUNTRY_DATA[countryKey] ?? COUNTRY_DATA['other'] ?? [55, 40];
    const calcD5 = Math.round((adoption - regulation * 0.6) / 1.4);
    
    const calcD6 = NETWORK_MOAT[roleKey] ?? 50;

    // Apply accurate dynamic weights mapping the server directly to the offline fallback engine.
    const w = getDynamicWeights(roleKey, industry);
    const calcTotal = Math.round(
      calcD1 * w.d1 + calcD2 * w.d2 + calcD3 * w.d3 + calcD4 * w.d4 + calcD5 * w.d5 + calcD6 * w.d6
    );

    const prompt = `You are the HumanProof Grounded Risk Engine (Generator Agent).
Your task is to generate qualitative risk assessment reasoning, skill obsolescence mapping, and a tactical roadmap.

User Profile:
- Role/Industry: ${roleKey} (${industry})
- Experience: ${experience}
- Country: ${country}
- Calculated Total Risk: ${calcTotal}/100

${groundedContext}
${seededCareerContext}

Instructions:
1. Conduct "Chain-of-Thought" reasoning for the qualitative data (reasons, roadmaps). 
2. Ensure the justification for D4 and D5 heavily references the User's inputted Experience (${experience}) and Country (${country}).
3. For ai_risk_skills: Use ONLY the pre-validated skills provided in your baseline. Do not generate novel skills.
4. Craft a tactical 3-phase strategic roadmap.

Respond ONLY with valid JSON matching this schema:
{
  "dimensions": [
    { "key": "D1", "reason": "string" },
    { "key": "D2", "reason": "string" },
    { "key": "D3", "reason": "string" },
    { "key": "D4", "reason": "string" },
    { "key": "D5", "reason": "string" },
    { "key": "D6", "reason": "string" }
  ],
  "reasoning": "string (Overall synthesis)",
  "inaction_scenario": "string"
  // Plus ai_risk_skills, safer_career_paths, roadmap
}
Do not include markdown or preamble.`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        dimensions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              key: { type: "STRING" },
              reason: { type: "STRING" }
            },
            required: ["key", "reason"]
          }
        },
        reasoning: { type: "STRING" },
        ai_risk_skills: {
          type: "OBJECT",
          properties: {
            obsolete: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: { type: "STRING" }, reason: { type: "STRING" }, timeline: { type: "STRING" } }, required: ["skill", "reason", "timeline"] } },
            at_risk: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: { type: "STRING" }, reason: { type: "STRING" }, timeline: { type: "STRING" } }, required: ["skill", "reason", "timeline"] } },
            safe: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: { type: "STRING" }, reason: { type: "STRING" }, timeline: { type: "STRING" } }, required: ["skill", "reason", "timeline"] } }
          },
          required: ["obsolete", "at_risk", "safe"]
        },
        safer_career_paths: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: { role: { type: "STRING" }, risk_reduction_pct: { type: "NUMBER" }, skill_gap: { type: "STRING" }, transition_difficulty: { type: "STRING" } },
            required: ["role", "risk_reduction_pct", "skill_gap", "transition_difficulty"]
          }
        },
        roadmap: {
          type: "OBJECT",
          properties: {
            phase_1: { type: "OBJECT", properties: { timeline: { type: "STRING" }, actions: { type: "ARRAY", items: { type: "OBJECT", properties: { action: { type: "STRING" }, why: { type: "STRING" }, outcome: { type: "STRING" } } } } } },
            phase_2: { type: "OBJECT", properties: { timeline: { type: "STRING" }, actions: { type: "ARRAY", items: { type: "OBJECT", properties: { action: { type: "STRING" }, why: { type: "STRING" }, outcome: { type: "STRING" } } } } } },
            phase_3: { type: "OBJECT", properties: { timeline: { type: "STRING" }, actions: { type: "ARRAY", items: { type: "OBJECT", properties: { action: { type: "STRING" }, why: { type: "STRING" }, outcome: { type: "STRING" } } } } } }
          },
          required: ["phase_1", "phase_2", "phase_3"]
        },
        inaction_scenario: { type: "STRING" }
      },
      required: ["dimensions", "reasoning", "ai_risk_skills", "safer_career_paths", "roadmap", "inaction_scenario"]
    };

    // Single-Pass Gemini Generation
    const genResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          responseSchema: responseSchema 
        }
      }),
    });

    if (!genResp.ok) throw new Error(await genResp.text());
    const genData = (await genResp.json()) as any;
    const genText = genData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const qualResult = JSON.parse(genText);

    // Manual merge of Qualitative LLM + Hard Deterministic Math
    const finalResult = {
      ...qualResult,
      total: calcTotal,
      verdict: getVerdict(calcTotal),
      urgency: getUrgency(calcTotal),
      timeline: getTimeline(calcTotal),
      dimensions: [
        { key: "D1", label: "Task Automatability", score: calcD1, weight: Math.round(w.d1 * 100), reason: qualResult.dimensions?.find((d: any) => d.key === "D1")?.reason || "" },
        { key: "D2", label: "AI Tool Maturity", score: calcD2, weight: Math.round(w.d2 * 100), reason: qualResult.dimensions?.find((d: any) => d.key === "D2")?.reason || "" },
        { key: "D3", label: "Human Amplification", score: calcD3, weight: Math.round(w.d3 * 100), reason: qualResult.dimensions?.find((d: any) => d.key === "D3")?.reason || "" },
        { key: "D4", label: "Experience Shield", score: calcD4, weight: Math.round(w.d4 * 100), reason: qualResult.dimensions?.find((d: any) => d.key === "D4")?.reason || "" },
        { key: "D5", label: "Country Exposure", score: calcD5, weight: Math.round(w.d5 * 100), reason: qualResult.dimensions?.find((d: any) => d.key === "D5")?.reason || "" },
        { key: "D6", label: "Social Capital Moat", score: calcD6, weight: Math.round(w.d6 * 100), reason: qualResult.dimensions?.find((d: any) => d.key === "D6")?.reason || "" }
      ]
    };

    return res.status(200).json(finalResult);

  } catch (error: any) {
    console.error("Calculate Grounded Risk Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

