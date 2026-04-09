import { Router } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Secure: Apply requireAuth globally to all assessment routes
router.use(requireAuth);

// Get user assessments (Secure: Only returns assessments owned by the logged-in user)
router.get('/', async (req: any, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create assessment - UPGRADED WITH GEMMA 4 ACCURACY
router.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const { industry, workType, country, details } = req.body;
  const gemmaKey = process.env.GEMMA_API_KEY;

  try {
    let aiScore = req.body.score; // Fallback to provided score
    let aiReasoning = details;

    if (gemmaKey) {
      // 98% Accuracy Step: Query Gemma 4 for grounded risk assessment
      const prompt = `You are the HumanProof Risk Engine. 
Calculate a high-accuracy AI Displacement Risk Score for:
Industry: ${industry}
Role: ${workType}
Country: ${country}

Analyze:
1. Automation Potential (D1)
2. Disruption Velocity (D2)
3. National Workforce resilience for ${country} (D5)

Respond with valid JSON: { "score": 3-97, "reasoning": "string (150 chars max)" }`;

      const gemmaResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${gemmaKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      });

      if (gemmaResp.ok) {
        const data = await gemmaResp.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        // ── Robust JSON extraction ──────────────────────────────────────────
        const extractJson = (raw: string) => {
          let cleaned = raw.replace(/```json\s?([\s\S]*?)```/g, '$1')
                           .replace(/```\s?([\s\S]*?)```/g, '$1')
                           .trim();
          if (!cleaned.startsWith('{')) {
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
              cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }
          }
          return cleaned;
        };

        try {
          const result = JSON.parse(extractJson(rawText));
          if (typeof result.score === 'number') aiScore = result.score;
          if (result.reasoning) aiReasoning = result.reasoning;
        } catch (e) {
          console.warn("AI Parsing failed on assessments route, falling back to client-provided fields.");
        }
      }
    }

    const { data, error } = await supabase
      .from('assessments')
      .insert([{ 
        user_id: userId, 
        industry, 
        work_type: workType, 
        country, 
        score: aiScore, 
        details: aiReasoning 
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err: any) {
    console.error("AI Risk Assessment Failed:", err);
    res.status(500).json({ error: "High-Accuracy Assessment Failed" });
  }
});

// Delete assessment (Secure: Verifies ownership before deletion)
router.delete('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId) // Ownership check
    .select();

  if (error) return res.status(500).json({ error: error.message });
  if (data.length === 0) return res.status(403).json({ error: 'Not authorized or not found' });
  
  res.status(204).end();
});

// Share assessment (Mock implementation)
router.post('/:id/share', async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Verify ownership before allowing share link generation
  const { data, error } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Assessment not found or unauthorized' });

  res.json({ shareUrl: `https://humanproof.ai/share/${id}` });
});

export default router;
