import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Get all safe careers
router.get('/', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .order('ai_resistance', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// New Endpoint: Stats aggregate (BUG-006)
// Provides header statistics in a single call instead of fetching all records
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { data: careers, error } = await supabase
      .from('careers')
      .select('avg_salary, sector');

    if (error) throw error;
    if (!careers || careers.length === 0) {
      return res.json({ total: 0, avgSalary: 0, topSector: 'None' });
    }

    const total = careers.length;
    const avgSalary = careers.reduce((acc, c) => acc + c.avg_salary, 0) / total;
    
    // Simple frequency count for top sector
    const sectors = careers.reduce((acc: any, c) => {
      acc[c.sector] = (acc[c.sector] || 0) + 1;
      return acc;
    }, {});
    const topSector = Object.keys(sectors).sort((a, b) => sectors[b] - sectors[a])[0];

    res.json({ total, avgSalary, topSector });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
 Simon
