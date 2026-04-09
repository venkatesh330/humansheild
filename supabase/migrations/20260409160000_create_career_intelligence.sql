-- ── CAREER INTELLIGENCE TABLE ──
-- Stores high-accuracy intelligence data for AI grounding and frontend hydration

CREATE TABLE IF NOT EXISTS public.career_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_key TEXT UNIQUE NOT NULL,
    display_role TEXT NOT NULL,
    summary TEXT,
    skills JSONB NOT NULL DEFAULT '{}',
    career_paths JSONB NOT NULL DEFAULT '[]',
    roadmap JSONB NOT NULL DEFAULT '{}',
    inaction_scenario TEXT,
    risk_trend JSONB NOT NULL DEFAULT '[]',
    confidence_score INTEGER DEFAULT 85,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.career_intelligence ENABLE ROW LEVEL SECURITY;

-- Select policy (Public read access)
CREATE POLICY "Public read access for career_intelligence" 
ON public.career_intelligence FOR SELECT 
USING (true);

-- Index for fast lookup by role_key
CREATE INDEX IF NOT EXISTS idx_career_intel_role_key ON public.career_intelligence(role_key);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_career_intelligence_modtime
    BEFORE UPDATE ON public.career_intelligence
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
