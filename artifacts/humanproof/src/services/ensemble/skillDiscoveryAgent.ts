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

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemma-3-27b-it:free";

export interface DynamicSkillResult {
  skill: Skill;
  insight: SkillInsight;
}

export const discoverSkillRisk = async (
  skillName: string,
): Promise<DynamicSkillResult | null> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) return null;
  if (!checkRateLimit("openrouter")) return null;

  const prompt = `Perform a deep Decision Intelligence analysis for the displacement risk of this skill: "${skillName}".

Return ONLY this JSON — no markdown, no words:

{
  "skill": {
    "name": "${skillName}",
    "category": "<One of: Technical, Creative, Interpersonal, Analytical, Trades, Management, Education, Healthcare, Finance, Legal, Science>",
    "riskScore": <integer 1-99 representing AI displacement risk>,
    "trend": "<rising | stable | declining>",
    "factors": {
      "automation": <0-100, feasibility of AI automation>,
      "judgment": <0-100, requirement for complex human judgment>,
      "physical": <0-100, degree of physical/embodied work>,
      "creativity": <0-100, human creative/originality requirement>
    },
    "subSkills": [
      { "name": "<Sub-skill 1>", "riskScore": <score> },
      { "name": "<Sub-skill 2>", "riskScore": <score> },
      { "name": "<Sub-skill 3>", "riskScore": <score> }
    ]
  },
  "insight": {
    "threat": "<Deep, unique analysis of WHY AI can/can't replace it. NO TEMPLATES.>",
    "pivot": "<Personalized + actionable pivot strategy, e.g. 'Shift toward high-end dining' if cooking.>",
    "why_protected": "<Explanation of specific human sensory or ethical elements that are safe.>",
    "action": "<A PROJECT or certification for the user to document in their journal.>",
    "aiTools": ["<Tool 1>", "<Tool 2>", "<Tool 3>"],
    "source": "<Specific 2024-2025 news or research source>"
  }
}

QUALITY RULES:
1. NEVER use generic phrases like "sits in a mid-range risk zone" or "focus on judgment".
2. Explain the trade-offs (e.g. 'AI can optimize recipes, but cannot taste salt or manage a high-pressure line').
3. For the riskScore, calculate a weighted average where Higher Automation = Higher Risk, but Higher Judgment/Physical/Creativity = Lower Risk.`;

  try {
    const response = await fetch(OPENROUTER_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://humanproof.app",
        "X-Title": "HumanProof Skill Discovery",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
    const data = await response.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";

    // FIX: Validate JSON before parsing
    let parsed: DynamicSkillResult;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (parseError) {
      console.warn("[SkillDiscovery] Invalid JSON response:", raw);
      return null;
    }

    // Validate required fields
    if (!parsed.skill?.name || typeof parsed.skill.riskScore !== "number") {
      console.warn("[SkillDiscovery] Invalid skill data structure");
      return null;
    }

    // Generate a unique ID for this dynamic skill instance
    parsed.skill.id = Date.now();

    return parsed;
  } catch (error: any) {
    console.warn("[SkillDiscovery] Failed:", error.message);
    return null;
  }
};
