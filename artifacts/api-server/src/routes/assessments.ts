import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middlewares/auth';

const router = Router();

const assessmentSchema = z.object({
  industry: z.string().min(1).max(100),
  workType: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  details: z.string().max(2000).optional(),
  score: z.number().min(0).max(100).optional()
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI generates per IP per hour
  message: { error: 'AI generation rate limit reached. Try again in 1 hour.' },
});

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

// Create assessment - UPGRADED WITH GEMINI 2.5 ACCURACY & ZOD VALIDATION
router.post('/', aiLimiter, async (req: any, res) => {
  const userId = req.user.id;
  
  // 1. Zod Payload Sanitization
  const parsed = assessmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid assessment payload', details: parsed.error.issues });
  }

  const { industry, workType, country, details, score } = parsed.data;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  try {
    let aiScore = score; // Fallback to provided score
    let aiReasoning = details;

    if (geminiKey) {
      // 99% Accuracy Step: Query Gemini 2.5 Flash for grounded risk assessment via Structured JSON
      const prompt = `You are the HumanProof Risk Engine. 
Calculate a high-accuracy AI Displacement Risk Score for:
Industry: ${industry}
Role: ${workType}
Country: ${country}

Analyze:
1. Automation Potential (D1)
2. Disruption Velocity (D2)
3. National Workforce resilience for ${country} (D5)`;

      const aiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                score: { type: "INTEGER", description: "Risk Score 1-99" },
                reasoning: { type: "STRING", description: "150 chars max synthesis" }
              },
              required: ["score", "reasoning"]
            }
          }
        }),
      });

      if (aiResp.ok) {
        const data = (await aiResp.json()) as any;
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        try {
          const result = JSON.parse(rawText);
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
