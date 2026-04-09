import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function performGemmaOSINT(companyName: string, gemmaKey: string) {
  // Pass 1: Signal Extraction
  const extractionPrompt = `Analyze the company: "${companyName}".
Extract: industry, isPublic, employeeCount, revenueTrend, and recent layoff likelihood.
Respond ONLY with JSON.`;

  const extractResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${gemmaKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: extractionPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    }),
  });
  
  const extractData = await extractResp.json();
  const signals = JSON.parse(extractData.candidates[0].content.parts[0].text);

  // Pass 2: Market Trend Correlation (Multi-Agent reasoning)
  const trendPrompt = `You are a Market Trend Analyst.
Signals for ${companyName}: ${JSON.stringify(signals)}

Correlate these signals with 2026 AI disruption trends for the ${signals.industry} sector.
Provide:
1. "displacementRisk": (1-100)
2. "reasoning": (Detailed multi-agent synthesis)
3. "marketTrend": (Observed industry shift)

Respond ONLY with JSON.`;

  const trendResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${gemmaKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: trendPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    }),
  });

  const trendData = await trendResp.json();
  const analysis = JSON.parse(trendData.candidates[0].content.parts[0].text);

  return { ...signals, ...analysis };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const gemmaKey = Deno.env.get("GEMMA_API_KEY");
    if (!gemmaKey) throw new Error("Missing GEMMA_API_KEY");

    const { companyName } = await req.json();
    if (!companyName) throw new Error("companyName is required");

    const lowerName = companyName.trim().toLowerCase();

    // 1. Check Cache
    const { data: cachedData } = await supabaseClient
      .from('cached_company_intelligence')
      .select('*')
      .eq('company_name', lowerName)
      .single();

    const now = new Date();
    if (cachedData && new Date(cachedData.next_refresh_due) > now) {
      return new Response(JSON.stringify({
        data: cachedData,
        source: 'Cached Intelligence (Gemma 4)',
        dataQuality: 'HIGH_ACCURACY_AI',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Perform AI OSINT
    const freshData = await performGemmaOSINT(lowerName, gemmaKey);

    const nextRefresh = new Date();
    nextRefresh.setDate(nextRefresh.getDate() + 7); // Cache AI reasoning for 7 days

    const dbPayload = {
      company_name: lowerName,
      domain: `${lowerName.replace(/\s+/g, '')}.com`,
      employee_count: freshData.employeeCount,
      revenue_yoy: freshData.revenueYoy,
      stock_90d_change: freshData.stock90dChange,
      recent_layoff_news: freshData.recentLayoffNews,
      industry: freshData.industry,
      is_public: freshData.isPublic,
      last_updated: now.toISOString(),
      next_refresh_due: nextRefresh.toISOString(),
    };

    // Upsert
    const { data: upsertData } = await supabaseClient
      .from('cached_company_intelligence')
      .upsert(dbPayload, { onConflict: 'company_name' })
      .select()
      .single();

    return new Response(JSON.stringify({
      data: upsertData || dbPayload,
      source: 'Gemma 4 Synthetic OSINT',
      dataQuality: 'HIGH_ACCURACY_AI',
      reasoning: freshData.reasoning,
      displacementRisk: freshData.displacementRisk
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
