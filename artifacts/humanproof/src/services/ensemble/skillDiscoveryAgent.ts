// skillDiscoveryAgent.ts
// Agent used to instantly analyze displacement risk for any skill not in the database.
// This enables a "Google-like" search experience for any skill globally.

import { checkRateLimit } from "../rateLimit/apiRateLimiter";
import {
  Skill,
  SkillInsight,
  RiskFactors,
  SubSkill,
} from "../../types/skillRisk";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface DynamicSkillResult {
  skill: Skill;
  insight: SkillInsight;
}

export const discoverSkillRisk = async (
  skillName: string,
): Promise<DynamicSkillResult | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!checkRateLimit("gemini")) return null;

  const prompt = `Perform a deep Decision Intelligence analysis for the displacement risk of this skill: "${skillName}".

QUALITY RULES:
1. NEVER use generic phrases like "sits in a mid-range risk zone" or "focus on judgment".
2. Explain the trade-offs (e.g. 'AI can optimize recipes, but cannot taste salt or manage a high-pressure line').
3. For the riskScore, calculate a weighted average where Higher Automation = Higher Risk, but Higher Judgment/Physical/Creativity = Lower Risk.`;

  try {
    const response = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              skill: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  category: { type: "STRING", description: "Technical, Creative, Interpersonal, etc" },
                  riskScore: { type: "INTEGER" },
                  trend: { type: "STRING" },
                  factors: {
                    type: "OBJECT",
                    properties: {
                      automation: { type: "INTEGER" },
                      judgment: { type: "INTEGER" },
                      physical: { type: "INTEGER" },
                      creativity: { type: "INTEGER" }
                    },
                    required: ["automation", "judgment", "physical", "creativity"]
                  },
                  subSkills: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        riskScore: { type: "INTEGER" }
                      },
                      required: ["name", "riskScore"]
                    }
                  }
                },
                required: ["name", "category", "riskScore", "trend", "factors", "subSkills"]
              },
              insight: {
                type: "OBJECT",
                properties: {
                  threat: { type: "STRING" },
                  pivot: { type: "STRING" },
                  why_protected: { type: "STRING" },
                  action: { type: "STRING" },
                  aiTools: { type: "ARRAY", items: { type: "STRING" } },
                  source: { type: "STRING" }
                },
                required: ["threat", "pivot", "why_protected", "action", "aiTools", "source"]
              }
            },
            required: ["skill", "insight"]
          }
        }
      }),
    });

    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json();
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: DynamicSkillResult;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.warn("[SkillDiscovery] Invalid JSON response:", raw);
      return null;
    }

    if (!parsed.skill?.name || typeof parsed.skill.riskScore !== "number") {
      console.warn("[SkillDiscovery] Invalid skill data structure");
      return null;
    }

    parsed.skill.id = Date.now();
    return parsed;
  } catch (error: any) {
    console.warn("[SkillDiscovery] Failed:", error.message);
    return null;
  }
};
