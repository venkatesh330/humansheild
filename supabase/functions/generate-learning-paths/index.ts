import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Edge Function to automatically generate Learning Paths using OpenAI / LLM
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) throw new Error("Missing OPENAI_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { roleKey } = await req.json();

    if (!roleKey) throw new Error("roleKey is required");

    // Fetch existing free resources so the LLM can construct the path from real DB objects
    const { data: resources } = await supabase.from('free_resources').select('id, title, provider, level');
    
    // Advanced AI Curriculum Generation Prompt
    const prompt = `You are an elite AI education architect and career transition strategist. 
A user with the target career role of "${roleKey}" is seeking to future-proof their skillset against AI disruption. 

I will provide you with a JSON array of carefully curated free learning resources. 
Your task is to analyze these resources and synthesize a highly effective, logical learning curriculum (a "Learning Path") tailored specifically to help the "${roleKey}" role evolve their skills.

Here are the available resources:
${JSON.stringify(resources?.slice(0, 80))}

Follow these strict constraints when designing the Learning Path:
1. Progression: Structure the resources to flow logically from foundational AI literacy to advanced role-specific augmentation.
2. Relevance: ONLY include resources that actually help future-proof this role. Do not blindly include unrelated resources. Match the resource IDs exactly.
3. Dimensions: Focus on addressing target dimension 'D1' (Automating Routine Tasks) or 'D3' (AI Augmentation).
4. Description: Write a compelling, 2-3 sentence description explaining exactly WHY this path matters for someone in the "${roleKey}" role moving into the AI era.

Respond ONLY with valid JSON strictly matching this schema:
{
  "title": "String - e.g., 'Mastering AI Augmentation for [Role]'",
  "description": "String - compelling explanation of value and relevance",
  "targetDimension": "String - 'D1', 'D2', 'D3', or 'general'",
  "difficultyLevel": "String - 'beginner', 'intermediate', or 'advanced'",
  "estimatedHours": Number - reasonable sum of resource durations,
  "resourceIds": ["uuid-1", "uuid-2", "uuid-3"] // Must match the provided IDs in a logical learning sequence
}
Do not include markdown blocks or any other commentary, just the JSON.`;

    const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" }
      }),
    });

    if (!llmResponse.ok) {
        throw new Error(await llmResponse.text());
    }

    const llmData = await llmResponse.json();
    const generatedPath = JSON.parse(llmData.choices[0].message.content);

    // Insert the Path
    const { data: newPath, error: pathError } = await supabase
      .from('learning_paths')
      .insert({
        title: generatedPath.title,
        description: generatedPath.description,
        target_role_key: roleKey,
        target_dimension: generatedPath.targetDimension,
        difficulty_level: generatedPath.difficultyLevel,
        estimated_hours: generatedPath.estimatedHours,
      })
      .select()
      .single();

    if (pathError) throw pathError;

    // Link Path Resources
    const pathResourcesData = generatedPath.resourceIds.map((id: string, index: number) => ({
      path_id: newPath.id,
      resource_id: id,
      order_index: index + 1,
      is_required: true,
    }));

    const { error: resourceError } = await supabase
      .from('path_resources')
      .insert(pathResourcesData);

    if (resourceError) throw resourceError;

    return new Response(JSON.stringify({ success: true, path: newPath }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 500,
    });
  }
});
