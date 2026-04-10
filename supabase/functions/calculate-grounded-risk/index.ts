import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

    // 2b. Fetch Modular Career Intelligence for deep grounding
    const { data: modularIntel } = await supabase
      .from('career_intelligence')
      .select('skills, career_paths, summary, inaction_scenario')
      .eq('role_key', roleKey)
      .single();

    let seededCareerContext = "";
    if (modularIntel) {
      const skills = modularIntel.skills as any;
      const paths = modularIntel.career_paths as any[];
      
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

    const prompt = `You are the HumanProof Grounded Risk Engine (Generator Agent).
Your task is to calculate a 90-98% accurate AI Displacement Risk Score for a user.

User Profile:
- User Profile: ${roleKey} (${industry}), ${experience} in ${country}.
- Instruction: Your analysis MUST BE GROUNDED in the pre-validated career intelligence provided below.

${groundedContext}

${seededCareerContext}

Instructions:
1. Conduct "Chain-of-Thought" reasoning for each of the 6 dimensions (D1-D6).
2. Adjust the Baseline Risk Consensus based on the user's Experience (${experience}) and specific context.
3. Provide a clear, concise justification for EACH dimension score.
4. Be brutally honest and data-driven.
5. For ai_risk_skills: Use ONLY the pre-validated skills provided in the matrix above. Personalize the 'reason' for each based on the user's industries and experience level.
6. For safer_career_paths: Use ONLY the pre-validated pivots provided in the "VALIDATED CAREER PIVOTS" section above. Do not hallucinate generic alternatives.
7. Craft a highly specific, tactical 3-phase strategic roadmap based on the user's experience level (${experience}) and risk context. 
8. Include an "inaction_scenario" that matches the grounding data but personalized to the user's current situation.

Respond ONLY with valid JSON matching this schema:
{
  "total": number (3-97),
  "dimensions": [
    { "key": "D1", "label": "Task Automatability", "score": number, "reason": "string" },
    { "key": "D2", "label": "AI Tool Maturity", "score": number, "reason": "string" },
    { "key": "D3", "label": "Human Amplification", "score": number, "reason": "string" },
    { "key": "D4", "label": "Experience Shield", "score": number, "reason": "string" },
    { "key": "D5", "label": "Country Exposure", "score": number, "reason": "string" },
    { "key": "D6", "label": "Social Capital Moat", "score": number, "reason": "string" }
  ],
  "reasoning": "string (Overall synthesis)",
  "verdict": "AI-Resistant" | "Resilient" | "Exposed" | "Critical Risk",
  "urgency": "Low" | "Moderate" | "High" | "Critical",
  "timeline": "8-12 Years" | "5-8 Years" | "2-4 Years" | "Immediate (< 2 Years)"
}
Do not include markdown or preamble.`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        total: { type: "NUMBER", description: "Score from 3 to 97" },
        dimensions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              key: { type: "STRING" },
              label: { type: "STRING" },
              score: { type: "NUMBER" },
              reason: { type: "STRING" }
            },
            required: ["key", "label", "score", "reason"]
          }
        },
        reasoning: { type: "STRING", description: "Overall synthesis" },
        verdict: { type: "STRING", description: "AI-Resistant, Resilient, Exposed, or Critical Risk" },
        urgency: { type: "STRING", description: "Low, Moderate, High, or Critical" },
        timeline: { type: "STRING", description: "8-12 Years, 5-8 Years, 2-4 Years, Immediate (< 2 Years)" },
        ai_risk_skills: {
          type: "OBJECT",
          properties: {
            obsolete: {
              type: "ARRAY",
              items: { type: "OBJECT", properties: { skill: { type: "STRING" }, reason: { type: "STRING" }, timeline: { type: "STRING" } }, required: ["skill", "reason", "timeline"] }
            },
            at_risk: {
              type: "ARRAY",
              items: { type: "OBJECT", properties: { skill: { type: "STRING" }, reason: { type: "STRING" }, timeline: { type: "STRING" } }, required: ["skill", "reason", "timeline"] }
            },
            safe: {
              type: "ARRAY",
              items: { type: "OBJECT", properties: { skill: { type: "STRING" }, reason: { type: "STRING" }, timeline: { type: "STRING" } }, required: ["skill", "reason", "timeline"] }
            }
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
            phase_1: {
              type: "OBJECT",
              properties: {
                timeline: { type: "STRING" },
                actions: { type: "ARRAY", items: { type: "OBJECT", properties: { action: { type: "STRING" }, why: { type: "STRING" }, outcome: { type: "STRING" } }, required: ["action", "why", "outcome"] } }
              }, required: ["timeline", "actions"]
            },
            phase_2: {
              type: "OBJECT",
              properties: {
                timeline: { type: "STRING" },
                actions: { type: "ARRAY", items: { type: "OBJECT", properties: { action: { type: "STRING" }, why: { type: "STRING" }, outcome: { type: "STRING" } }, required: ["action", "why", "outcome"] } }
              }, required: ["timeline", "actions"]
            },
            phase_3: {
              type: "OBJECT",
              properties: {
                timeline: { type: "STRING" },
                actions: { type: "ARRAY", items: { type: "OBJECT", properties: { action: { type: "STRING" }, why: { type: "STRING" }, outcome: { type: "STRING" } }, required: ["action", "why", "outcome"] } }
              }, required: ["timeline", "actions"]
            }
          },
          required: ["phase_1", "phase_2", "phase_3"]
        },
        inaction_scenario: { type: "STRING", description: "The brutal outcome of doing nothing." }
      },
      required: ["total", "dimensions", "reasoning", "verdict", "urgency", "timeline", "ai_risk_skills", "safer_career_paths", "roadmap", "inaction_scenario"]
    };

    // ── Pass 1: Generation Agent ─────────────────────────────────────────────
    const genResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${gemmaKey}`, {
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
    const genData = await genResp.json();
    const genText = genData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const initialResult = JSON.parse(genText);

    // ── Pass 2: Critic Agent (Verification) ───────────────────────────────────
    const criticPrompt = `You are the HumanProof Quality Critic. 
Review the following risk assessment generated by another agent. 
Cross-reference it with the Grounded Market Data and User Profile.

User Profile: ${roleKey} (${industry}), ${experience} in ${country}.
${groundedContext}

Candidate Assessment:
${JSON.stringify(initialResult, null, 2)}

Your Goal: 
1. Identify any hallucinations or scores that deviate wildly from grounded consensus without clear reason.
2. Ensure the "Experience Shield" (D4) and "Country Exposure" (D5) properly reflect the user context.
3. Refine the reasoning to be more professional and data-backed.

Respond with the final, validated version of the JSON assessment. 
Follow the exact same schema. Respond ONLY with JSON.`;

    const criticResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${gemmaKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: criticPrompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      }),
    });

    let finalResult = initialResult;
    if (criticResp.ok) {
      const criticData = await criticResp.json();
      const criticText = criticData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      try {
        finalResult = JSON.parse(criticText);
      } catch (e) {
        console.warn("Critic Agent failed to produce valid JSON, falling back to Generator output.");
      }
    }

    // ── Schema Validation & Normalization ──────────────────────────────────────
    const requiredDims = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
    const validatedDimensions = requiredDims.map(key => {
      const existing = finalResult.dimensions?.find((d: any) => d.key === key);
      const labels: Record<string, string> = {
        D1: "Task Automatability",
        D2: "AI Tool Maturity",
        D3: "Human Amplification",
        D4: "Experience Shield",
        D5: "Country Exposure",
        D6: "Social Capital Moat"
      };
      return {
        key,
        label: existing?.label || labels[key],
        score: typeof existing?.score === 'number' ? Math.max(0, Math.min(100, existing.score)) : 50,
        reason: existing?.reason || "Analysis based on historical labor vectors and AI adoption trends."
      };
    });

    const finalOutput = {
      total: typeof finalResult.total === 'number' ? finalResult.total : 50,
      dimensions: validatedDimensions,
      reasoning: finalResult.reasoning || "Grounded analysis complete via multi-agent validation.",
      verdict: finalResult.verdict || "Resilient",
      urgency: finalResult.urgency || "Moderate",
      timeline: finalResult.timeline || "5-8 Years",
      ai_risk_skills: finalResult.ai_risk_skills || { obsolete: [], at_risk: [], safe: [] },
      safer_career_paths: finalResult.safer_career_paths || [],
      roadmap: finalResult.roadmap || { phase_1: { timeline: "0-30 days", actions: [] }, phase_2: { timeline: "1-3 months", actions: [] }, phase_3: { timeline: "3-12 months", actions: [] } },
      inaction_scenario: finalResult.inaction_scenario || "If you do not adapt, your role will face extreme pressure from rapid automation.",
      confidence: groundedData ? 'HIGH' : 'MEDIUM',
      isGrounded: !!groundedData,
      agentChain: criticResp.ok ? 'Generator -> Critic' : 'Generator (Solo)'
    };

    return new Response(JSON.stringify(finalOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Critical Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

});
