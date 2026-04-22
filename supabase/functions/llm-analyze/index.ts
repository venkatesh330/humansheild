// llm-analyze — server-side AI narrative analysis via OpenRouter (cheap models).
// Uses OpenRouter so we get access to many models with a single key.
// Model cascade: gemini-flash-1.5-8b (cheapest) → mistral-small (fallback).
// API key never reaches the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Models raced in parallel — fastest valid response wins.
// All are cheap; running 3 in parallel costs ~3x but latency = slowest winner (usually <8s).
const MODELS = [
  "google/gemini-flash-1.5-8b",       // ~$0.04/1M tokens — smallest/fastest
  "mistralai/mistral-7b-instruct",     // ~$0.07/1M tokens
  "meta-llama/llama-3.1-8b-instruct", // ~$0.07/1M tokens
];

interface AnalyzeRequest {
  companyName: string;
  roleTitle: string;
  industry: string;
  engineScore: number;
  engineBreakdown: {
    L1: number; L2: number; L3: number; L4: number; L5: number;
    D6?: number; D7?: number;
  };
  signalContext: {
    stock90DayChange: number | null;
    revenueGrowthYoY: number | null;
    layoffRounds: number;
    lastLayoffPercent: number | null;
    recentLayoffHeadlines: number;
    employeeCount: number;
    revenuePerEmployee: number;
    aiInvestmentSignal: string;
    dataSource: string;
  };
  userFactors: {
    tenureYears: number;
    performanceTier: string;
    isUniqueRole: boolean;
    hasRecentPromotion: boolean;
    hasKeyRelationships: boolean;
  };
}

function getCalibration(score: number): { urgencyLevel: string; timeHorizon: string } {
  if (score >= 75) return { urgencyLevel: "critical", timeHorizon: "Immediate (< 12 months)" };
  if (score >= 55) return { urgencyLevel: "high",     timeHorizon: "12-24 months" };
  if (score >= 35) return { urgencyLevel: "medium",   timeHorizon: "3-5 years" };
  return                  { urgencyLevel: "low",      timeHorizon: "5-10 years" };
}

function buildPrompt(req: AnalyzeRequest): string {
  const { companyName, roleTitle, industry, engineScore, engineBreakdown, signalContext: sc, userFactors: uf } = req;
  const { urgencyLevel, timeHorizon } = getCalibration(engineScore);

  const stockStr = sc.stock90DayChange != null
    ? `${sc.stock90DayChange > 0 ? "+" : ""}${sc.stock90DayChange}% (90 days)`
    : "unknown (private/no ticker)";
  const revenueStr = sc.revenueGrowthYoY != null
    ? `${sc.revenueGrowthYoY > 0 ? "+" : ""}${sc.revenueGrowthYoY}% YoY`
    : "unknown";
  const layoffStr = sc.layoffRounds === 0
    ? "no layoffs in 24 months"
    : `${sc.layoffRounds} round(s) in 24 months — last cut: ${sc.lastLayoffPercent ?? "?"}% of workforce`;
  const dataQualityNote = sc.dataSource === "fallback"
    ? "⚠️ Limited company data — private/unknown company. Base analysis on role and sector only."
    : sc.dataSource === "live"
    ? "High confidence — live market signals available."
    : "Moderate confidence — static database.";

  return `You are a senior labor market analyst specialising in AI displacement risk assessment. Interpret a data-driven risk score and provide plain, honest, specific analysis.

DATA QUALITY: ${dataQualityNote}

COMPANY SIGNALS:
- Company: ${companyName} | Industry: ${industry}
- Stock: ${stockStr} | Revenue growth: ${revenueStr}
- Layoff history: ${layoffStr} | Recent layoff articles (30d): ${sc.recentLayoffHeadlines}
- Employees: ${sc.employeeCount.toLocaleString()} | Revenue/employee: $${Math.round(sc.revenuePerEmployee / 1000)}k
- AI investment signal: ${sc.aiInvestmentSignal}

RISK SCORE (0=safe, 100=high risk):
- OVERALL: ${engineScore}/100
- Company Health (L1, 30%): ${Math.round(engineBreakdown.L1 * 100)}/100
- Layoff History (L2, 25%): ${Math.round(engineBreakdown.L2 * 100)}/100
- Task Automatability (L3, 20%): ${Math.round(engineBreakdown.L3 * 100)}/100
- Market Headwinds (L4, 12%): ${Math.round(engineBreakdown.L4 * 100)}/100
- Experience Protection (L5, 13%): ${Math.round(engineBreakdown.L5 * 100)}/100
${engineBreakdown.D6 != null ? `- AI Agent Capability (D6): ${Math.round(engineBreakdown.D6 * 100)}/100` : ""}

USER:
- Role: ${roleTitle} | Tenure: ${uf.tenureYears} years | Performance: ${uf.performanceTier}
- Unique role: ${uf.isUniqueRole} | Recent promotion: ${uf.hasRecentPromotion} | Key relationships: ${uf.hasKeyRelationships}

Provide analysis specific to THIS person's data. Reference actual numbers (not generic phrases).
${sc.dataSource === "fallback" ? "Since company data is limited, focus on role-level and sector-level signals only." : ""}

The urgencyLevel and timeHorizon are FIXED — do NOT change them:
- urgencyLevel: "${urgencyLevel}"
- timeHorizon: "${timeHorizon}"

Return ONLY valid JSON (no markdown, no code blocks, no extra text):
{
  "dominantRiskFactor": "<highest-weighted risk in 6-8 words — cite actual score numbers>",
  "keyProtectiveFactor": "<strongest protection in 6-8 words — cite actual data>",
  "timeHorizon": "${timeHorizon}",
  "synthesis": "<2-3 sentences grounded in actual signal numbers — mention specific values like L1 score, layoff rounds, stock change>",
  "urgencyLevel": "${urgencyLevel}",
  "oneActionThisWeek": "<one specific, concrete step — name a skill, tool, platform, or person type to contact>"
}`;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<{ text: string; model: string; tokensUsed: number }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://humanproof.ai",
      "X-Title": "HumanProof Risk Analysis",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a precise labor market analyst. Respond with valid JSON only — no markdown, no code blocks.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 450,
    }),
    signal: AbortSignal.timeout(25_000), // 25s per model; parallel race keeps wall-time low
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status} (${model}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const tokensUsed = (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0);

  if (!text) throw new Error(`Empty response from ${model}`);
  return { text, model, tokensUsed };
}

function parseJsonFromText(text: string): any {
  // Try direct parse first
  try { return JSON.parse(text); } catch { /* continue */ }

  // Extract JSON object from surrounding text
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* continue */ }
  }

  throw new Error("Response did not contain parseable JSON");
}

function validateParsed(parsed: any): boolean {
  return (
    typeof parsed === "object" &&
    parsed !== null &&
    typeof parsed.dominantRiskFactor === "string" &&
    typeof parsed.keyProtectiveFactor === "string" &&
    typeof parsed.synthesis === "string" &&
    ["low", "medium", "high", "critical"].includes(parsed.urgencyLevel)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body: AnalyzeRequest = await req.json();

    if (!body.companyName || !body.roleTitle) {
      return json({ error: "companyName and roleTitle required" }, 400);
    }

    const openrouterKey = Deno.env.get("OPENROUTER_KEY");
    if (!openrouterKey) {
      console.warn("[llm-analyze] OPENROUTER_KEY not configured — returning deterministic fallback");
      return json({ success: false, fallback: true, error: "OPENROUTER_KEY not configured" });
    }

    const prompt = buildPrompt(body);

    // Race all models in parallel — first valid JSON response wins.
    // This keeps wall-time low (~fastest model's latency) even if some models fail.
    const modelRaces = MODELS.map((model) =>
      callOpenRouter(openrouterKey, model, prompt)
        .then(({ text, tokensUsed }) => {
          const parsed = parseJsonFromText(text);
          if (!validateParsed(parsed)) throw new Error(`Invalid schema from ${model}`);
          return { parsed, model, tokensUsed };
        })
    );

    let winner: { parsed: any; model: string; tokensUsed: number } | null = null;
    const errors: string[] = [];

    // Promise.any — resolves on first success, rejects only if ALL fail
    try {
      winner = await Promise.any(modelRaces);
    } catch (aggErr: any) {
      // AggregateError: all models failed
      const allErrors: Error[] = aggErr.errors ?? [];
      allErrors.forEach((e) => errors.push(e.message));
    }

    if (winner) {
      console.log(`[llm-analyze] ✓ ${winner.model} | tokens: ${winner.tokensUsed} | urgency: ${winner.parsed.urgencyLevel}`);
      return json({ success: true, model: winner.model, tokensUsed: winner.tokensUsed, ...winner.parsed });
    }

    // All models failed — graceful deterministic-only fallback
    console.error("[llm-analyze] All models failed:", errors.join(" | "));
    return json({
      success: false,
      fallback: true,
      error: errors.join(" | "),
      dominantRiskFactor: null,
      keyProtectiveFactor: null,
      timeHorizon: null,
      synthesis: null,
      urgencyLevel: null,
      oneActionThisWeek: null,
    });
  } catch (err: any) {
    console.error("[llm-analyze] Fatal:", err.message);
    return json({ success: false, fallback: true, error: err.message }, 500);
  }
});
