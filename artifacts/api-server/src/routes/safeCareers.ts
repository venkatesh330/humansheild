import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Get all safe careers
router.get('/', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('safe_careers')
    .select('*')
    .order('risk_score', { ascending: true }); // Lower risk = safer

  if (error) return res.status(500).json({ error: error.message });

  // Map to the frontend contract
  const mappedData = data.map((c: any) => ({
    id: c.id,
    title: c.role_title,
    sector: c.industry_label,
    growth_rate: c.growth_projection ? `+${c.growth_projection}%` : 'Stable',
    avg_salary: c.median_salary_usd,
    human_factor: 100 - (c.risk_score || 0),
    ai_resistance: (c.risk_score < 20) ? 'Critical' : (c.risk_score < 40) ? 'Very High' : 'High',
    why_safe: c.safety_reason || '',
    skills: []
  }));

  res.json(mappedData);
});

// Stats aggregate
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { data: careers, error } = await supabase
      .from('safe_careers')
      .select('median_salary_usd, industry_label');

    if (error) throw error;
    if (!careers || careers.length === 0) {
      return res.json({ total: 0, avgSalary: 0, topSector: 'None' });
    }

    const total = careers.length;
    const avgSalary = careers.reduce((acc, c) => acc + (c.median_salary_usd || 0), 0) / total;
    
    const sectors = careers.reduce((acc: any, c) => {
      const sector = c.industry_label || 'Unknown';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});
    const topSector = Object.keys(sectors).sort((a, b) => sectors[b] - sectors[a])[0];

    res.json({ total, avgSalary, topSector });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
