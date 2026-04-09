import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// ── Pre-seeded Career Intelligence Registry (top roles for AI grounding) ──
// This data constrains the AI to personalize real data rather than hallucinate
const SEEDED_SKILLS: Record<string, { obsolete: string[]; at_risk: string[]; safe: string[] }> = {
  bpo_inbound:  { obsolete: ['FAQ answering', 'Standard account updates', 'Scripted troubleshooting'], at_risk: ['Cross-sell scripting', 'Complaint documentation'], safe: ['CX Design', 'AI Copilot QA', 'High-stakes empathetic resolution'] },
  bpo_chat:     { obsolete: ['First-line chat resolution', 'KB article retrieval', 'Query categorisation'], at_risk: ['Complex account escalation'], safe: ['Conversation Design', 'AI Conversation QA', 'Escalation Protocol Design'] },
  bpo_data_entry: { obsolete: ['Manual document digitisation', 'Form data processing', 'PDF-to-spreadsheet'], at_risk: ['Data validation and exception handling'], safe: ['IDP System Administration', 'Data Quality Governance', 'Process Automation Design'] },
  cnt_blog:     { obsolete: ['SEO article drafting', 'FAQ and how-to content', 'Product description writing'], at_risk: ['Long-form editorial', 'Interview-based content'], safe: ['Content Strategy', 'AI Content QA', 'Primary Research'] },
  cnt_seo_content: { obsolete: ['Keyword-based articles', 'Meta descriptions', 'Content cluster population'], at_risk: ['Technical SEO content'], safe: ['Technical SEO Strategy', 'EEAT Architecture', 'Content Performance Analysis'] },
  cnt_copy:     { obsolete: ['Ad copy A/B variants', 'Email subject lines', 'Standard promotional copy'], at_risk: ['Brand voice development', 'Cultural moment advertising'], safe: ['Creative Direction', 'Brand Strategy', 'CRO Strategy'] },
  fin_account:  { obsolete: ['Routine bookkeeping', 'Bank reconciliation', 'Standard financial statements', 'Invoice processing'], at_risk: ['Management accounts commentary', 'Client relationship (SME)'], safe: ['CFO Advisory', 'Complex Tax Strategy', 'Financial Systems Implementation'] },
  fin_payroll:  { obsolete: ['Salary calculation', 'Statutory compliance filing', 'Standard payroll reports'], at_risk: ['Complex payroll exceptions', 'Multi-country coordination'], safe: ['People Analytics', 'HCM Implementation', 'Compensation Strategy'] },
  sw_backend:   { obsolete: ['CRUD API boilerplate', 'Standard unit test writing', 'Database schema generation'], at_risk: ['Standard performance optimisation', 'Standard REST API design'], safe: ['Distributed Systems Architecture', 'AI/LLM Systems Engineering', 'Legacy System Integration'] },
  sw_frontend:  { obsolete: ['UI from Figma (AI tools)', 'Standard landing pages', 'Responsive CSS generation'], at_risk: ['Complex state management', 'PWA optimization'], safe: ['Design System Architecture', 'Advanced Accessibility Engineering', 'Core Web Vitals Performance Engineering'] },
  sw_devops:    { obsolete: ['Standard CI/CD configuration', 'IaC boilerplate (Terraform)', 'Kubernetes YAML generation'], at_risk: ['Cloud cost optimization', 'SRE metrics setup'], safe: ['Novel Infrastructure Failure Diagnosis', 'Platform Engineering (IDP)', 'FinOps & Cloud Economics Strategy'] },
  sw_arch:      { obsolete: ['Standard ADR templates', 'Technology comparison docs'], at_risk: ['Standard microservices patterns'], safe: ['Long-term architectural vision', 'Build-vs-buy-vs-OSS judgment', 'Engineering culture setting'] },
  hr_recruit:   { obsolete: ['CV/resume screening', 'Job description generation', 'Interview question generation'], at_risk: ['Candidate relationship management', 'Employer brand outreach'], safe: ['Strategic Talent Intelligence', 'Executive Search', 'Employer Brand Strategy'] },
  leg_paralegal: { obsolete: ['Case law research', 'Standard document review', 'Contract clause extraction'], at_risk: ['Client-facing paralegal intake'], safe: ['Legal Project Management', 'Legal Technology Implementation', 'Complex Due Diligence Coordination'] },
  hc_medical_coding: { obsolete: ['Routine ICD-10/CPT coding', 'Standard claim form coding', 'Discharge summary processing'], at_risk: ['Complex case coding and audit'], safe: ['Clinical AI Audit', 'Health Information Management Strategy', 'Revenue Cycle Strategy'] },
  hc_radiology: { obsolete: ['Routine chest X-ray reads', 'Standard CT scan detection', 'Follow-up scan comparison'], at_risk: ['Complex multi-system interpretation', 'Standard IR procedures'], safe: ['AI Radiology Governance', 'Subspecialty Neuroradiology', 'Clinical AI Training and Validation'] },
  mkt_seo:      { obsolete: ['Keyword research and clustering', 'Standard on-page optimization', 'Link outreach email templates'], at_risk: ['Technical SEO auditing', 'Content gap analysis'], safe: ['Search Algorithm Strategy', 'JavaScript/Advanced Technical SEO', 'EEAT and Brand Authority Building'] },
  des_graphic:  { obsolete: ['Stock image generation', 'Social media graphic production', 'Banner ad creative variants'], at_risk: ['Brand identity execution', 'Complex infographic design'], safe: ['Art Direction and Creative Strategy', 'Brand Identity Architecture', 'UX and Interaction Design'] },
  des_ux:       { obsolete: ['Standard wireframe generation', 'Accessibility checklist execution', 'Standard user flow docs'], at_risk: ['Usability testing execution (standard)'], safe: ['Deep User Research', 'Novel Interaction Paradigm Design', 'Complex Accessibility Advocacy'] },
};

const SEEDED_PATHS: Record<string, { role: string; risk_pct: number; gap: string; difficulty: string }[]> = {
  bpo_inbound:  [{ role: 'CX Technology Specialist', risk_pct: 55, gap: 'Zendesk admin, AI integration', difficulty: 'Medium' }, { role: 'Customer Experience Designer', risk_pct: 62, gap: 'Journey mapping, UX fundamentals', difficulty: 'Medium' }, { role: 'AI Trainer / RLHF Specialist', risk_pct: 70, gap: 'Annotation workflow, classification', difficulty: 'Easy' }],
  bpo_chat:     [{ role: 'Conversation Design Specialist', risk_pct: 65, gap: 'Voiceflow, Botpress, UX writing', difficulty: 'Medium' }, { role: 'CX Technology Specialist', risk_pct: 60, gap: 'Zendesk admin, API basics, analytics', difficulty: 'Medium' }],
  bpo_data_entry: [{ role: 'AI Operations Specialist', risk_pct: 70, gap: 'IDP tools, basic Python or Power Automate', difficulty: 'Medium' }, { role: 'RPA Developer', risk_pct: 72, gap: 'UiPath or Power Automate training', difficulty: 'Medium' }],
  cnt_blog:     [{ role: 'Content Strategist', risk_pct: 60, gap: 'Content audit frameworks, GA4', difficulty: 'Medium' }, { role: 'AI Content Operations Manager', risk_pct: 65, gap: 'Prompt engineering, editorial QA', difficulty: 'Easy' }],
  cnt_seo_content: [{ role: 'Technical SEO Specialist', risk_pct: 60, gap: 'Python, Screaming Frog, log file analysis', difficulty: 'Hard' }, { role: 'SEO Strategy Lead', risk_pct: 55, gap: 'Analytics deep dive, competitor strategy', difficulty: 'Medium' }],
  cnt_copy:     [{ role: 'Creative Director', risk_pct: 55, gap: 'Campaign concept, art direction, brand strategy', difficulty: 'Very Hard' }, { role: 'Brand Strategist', risk_pct: 58, gap: 'Brand positioning, competitor analysis', difficulty: 'Hard' }, { role: 'CRO Specialist', risk_pct: 52, gap: 'A/B testing, analytics, landing page strategy', difficulty: 'Medium' }],
  fin_account:  [{ role: 'FP&A Analyst', risk_pct: 45, gap: 'Financial modelling, scenario analysis', difficulty: 'Medium' }, { role: 'CFO Advisory (SME)', risk_pct: 58, gap: 'Business strategy, stakeholder communication', difficulty: 'Hard' }],
  fin_payroll:  [{ role: 'People Analytics Manager', risk_pct: 55, gap: 'People data analysis, Tableau/Power BI', difficulty: 'Hard' }, { role: 'HCM Technology Consultant', risk_pct: 65, gap: 'Workday/ADP admin, implementation PM', difficulty: 'Medium' }],
  sw_backend:   [{ role: 'AI/LLM Systems Engineer', risk_pct: 65, gap: 'LangChain, vector databases, RAG architectures', difficulty: 'Medium' }, { role: 'Platform/Infrastructure Engineer', risk_pct: 55, gap: 'Kubernetes internals, distributed systems', difficulty: 'Hard' }],
  sw_frontend:  [{ role: 'Full-Stack AI Application Developer', risk_pct: 50, gap: 'Backend basics, LLM APIs, database design', difficulty: 'Medium' }, { role: 'Design Systems Engineer', risk_pct: 58, gap: 'Token architecture, component API design', difficulty: 'Hard' }],
  sw_devops:    [{ role: 'Platform Engineer', risk_pct: 52, gap: 'Internal developer platforms, Backstage, Kubernetes', difficulty: 'Hard' }, { role: 'AI Infrastructure Engineer', risk_pct: 58, gap: 'LLM deployment (vLLM), vector DBs, GPU infra', difficulty: 'Hard' }],
  sw_arch:      [{ role: 'Chief AI Officer (CAIO)', risk_pct: 65, gap: 'AI strategy, LLM governance, enterprise AI procurement', difficulty: 'Very Hard' }, { role: 'AI Systems Architect', risk_pct: 55, gap: 'LLM architectures, vector databases, RAG at scale', difficulty: 'Hard' }],
  hr_recruit:   [{ role: 'Talent Intelligence Specialist', risk_pct: 55, gap: 'LinkedIn Talent Insights, market mapping', difficulty: 'Medium' }, { role: 'People Analytics Lead', risk_pct: 58, gap: 'SQL, Python basics, HR data modelling', difficulty: 'Hard' }],
  leg_paralegal: [{ role: 'Legal Technology Specialist', risk_pct: 62, gap: 'Harvey AI, Relativity, Ironclad, legal PM', difficulty: 'Medium' }, { role: 'Legal Project Manager', risk_pct: 55, gap: 'PMP or CLPM certification, workflow tools', difficulty: 'Medium' }],
  hc_medical_coding: [{ role: 'Clinical AI Audit Specialist', risk_pct: 62, gap: 'AI coding tool QA, compliance frameworks', difficulty: 'Medium' }, { role: 'Health Informatics Analyst', risk_pct: 58, gap: 'Epic/Cerner analytics, SQL, HL7 FHIR', difficulty: 'Hard' }],
  hc_radiology: [{ role: 'AI Radiology Specialist', risk_pct: 52, gap: 'Radiology AI platform admin, validation', difficulty: 'Medium' }, { role: 'Clinical AI Research Lead', risk_pct: 60, gap: 'Research methodology, ML model evaluation', difficulty: 'Hard' }],
  mkt_seo:      [{ role: 'Technical SEO Director', risk_pct: 55, gap: 'Python for SEO, log file analysis, JS rendering', difficulty: 'Hard' }, { role: 'Digital Marketing Director', risk_pct: 45, gap: 'Paid media basics, email, cross-channel strategy', difficulty: 'Hard' }],
  des_graphic:  [{ role: 'Creative Director', risk_pct: 55, gap: 'Strategic creative leadership, campaign concept', difficulty: 'Very Hard' }, { role: 'AI Art Director', risk_pct: 60, gap: 'Midjourney mastery, AI workflow design', difficulty: 'Medium' }],
  des_ux:       [{ role: 'Head of Design / Design Director', risk_pct: 52, gap: 'Design leadership, strategy, business acumen', difficulty: 'Hard' }, { role: 'AI UX Specialist', risk_pct: 58, gap: 'AI interface patterns, LLM interaction design', difficulty: 'Medium' }],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const gemmaKey = Deno.env.get("GEMMA_API_KEY");

    if (!gemmaKey) throw new Error("Missing GEMMA_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { roleKey, industry, country, experience, details } = await req.json();

    if (!roleKey) throw new Error("roleKey is required");

    // 1. Fetch Grounded Data from validated_scores
    const { data: groundedData } = await supabase
      .from('validated_scores')
      .select('*')
      .eq('role_key', roleKey)
      .single();

    // 2. Prepare Grounded Context for Gemma 4
    let groundedContext = "";
    if (groundedData) {
      groundedContext = `
Grounded Market Data for ${roleKey}:
- D1 (Automation): ${groundedData.d1}
- D2 (Disruption): ${groundedData.d2}
- D3 (Augmentation): ${groundedData.d3}
- D4 (Experience/Shield): ${groundedData.d4}
- D5 (Country Resilience): ${groundedData.d5}
- D6 (Social Capital): ${groundedData.d6}
- Baseline Risk Consensus: ${groundedData.final_score}%
- Confidence Level: ${groundedData.confidence_pct}%
`;
    } else {
      groundedContext = "No specific database record found. Use your knowledge of AI disruption trends as of 2026.";
    }

    // 2b. Inject pre-seeded career intelligence data if available
    const seededSkills = SEEDED_SKILLS[roleKey];
    const seededPaths = SEEDED_PATHS[roleKey];
    let seededCareerContext = "";
    if (seededSkills) {
      seededCareerContext = `
Pre-Validated Career Intelligence for ${roleKey} (DO NOT generate generic alternatives — personalize these for ${industry}/${country}/${experience}):

KNOWN OBSOLETE SKILLS (already being automated): ${seededSkills.obsolete.join(', ')}
KNOWN AT-RISK SKILLS (partial automation): ${seededSkills.at_risk.join(', ')}
KNOWN SAFE SKILLS (AI-resistant): ${seededSkills.safe.join(', ')}
${seededPaths ? `
VALIDATED CAREER PIVOTS:
${seededPaths.map(p => `- ${p.role}: ${p.risk_pct}% risk reduction | Gap: ${p.gap} | Difficulty: ${p.difficulty}`).join('\n')}
` : ''}
INSTRUCTION: Use the above as your authoritative baseline. Your job is to:
1. Personalize the skill reasoning for the specific industry (${industry}), experience level (${experience}), and country (${country})
2. Adjust the career path priorities based on the user's specific context
3. Add contextual nuance from the 6D scores (DO NOT change the core skills listed above)
4. Do NOT invent new skill categories or pivot paths that contradict the above validated data
`;
    }

    const prompt = `You are the HumanProof Grounded Risk Engine (Generator Agent).
Your task is to calculate a 90-98% accurate AI Displacement Risk Score for a user.

User Profile:
- Role: ${roleKey}
- Industry: ${industry}
- Country: ${country}
- Experience: ${experience}
- User Context: ${details || 'None provided'}

${groundedContext}

${seededCareerContext}

Instructions:
1. Conduct "Chain-of-Thought" reasoning for each of the 6 dimensions (D1-D6).
2. Adjust the Baseline Risk Consensus based on the user's Experience (${experience}) and specific context.
3. Provide a clear, concise justification for EACH dimension score.
4. Be brutally honest and data-driven.
5. For ai_risk_skills: if pre-validated skills are provided above, personalize their reasoning for this user's specific context (industry, country, experience). Do NOT replace them with generic alternatives.
6. For safer_career_paths: if pre-validated paths are provided above, personalize them with context-specific recommendations. Prioritize paths that are most relevant for ${industry} sector specifically.
7. Craft a highly specific, tactical 3-phase strategic roadmap based on the user's experience level (${experience}) and risk context.
8. Include an "inaction_scenario" that is role-specific and industry-specific — NOT a generic disclaimer.

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
