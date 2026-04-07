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

// Create assessment
router.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const { industry, workType, country, score, details } = req.body;
  
  const { data, error } = await supabase
    .from('assessments')
    .insert([{ user_id: userId, industry, work_type: workType, country, score, details }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
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
