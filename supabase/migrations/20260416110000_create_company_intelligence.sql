-- ── COMPANY INTELLIGENCE TABLE ──
-- Production-grade grounding data for AI-driven layoff risk assessments
-- Created: 2026-04-16

CREATE TABLE IF NOT EXISTS public.company_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT UNIQUE NOT NULL,
    industry TEXT NOT NULL,
    company_size TEXT NOT NULL,
    stage TEXT NOT NULL,

    -- Dynamic signals stored as JSONB for flexibility and performance
    financial_signals JSONB NOT NULL DEFAULT '{}',
    layoff_history JSONB NOT NULL DEFAULT '{}',
    hiring_signals JSONB NOT NULL DEFAULT '{}',
    role_risk_map JSONB NOT NULL DEFAULT '{}',

    -- Primary risk indicators
    ai_exposure_index FLOAT NOT NULL DEFAULT 0.0,
    market_risk_score FLOAT NOT NULL DEFAULT 0.0,
    company_risk_score FLOAT NOT NULL DEFAULT 0.0,
    confidence_score FLOAT NOT NULL DEFAULT 0.0,

    -- Classification
    archetype TEXT NOT NULL,
    data_source TEXT NOT NULL DEFAULT 'preseeded',
    last_updated DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──
CREATE INDEX IF NOT EXISTS idx_company_intel_name ON public.company_intelligence(company_name);
CREATE INDEX IF NOT EXISTS idx_company_intel_industry ON public.company_intelligence(industry);
CREATE INDEX IF NOT EXISTS idx_company_intel_risk ON public.company_intelligence(company_risk_score);

-- ── SECURITY ──
ALTER TABLE public.company_intelligence ENABLE ROW LEVEL SECURITY;

-- Public read access for intelligence grounding
DROP POLICY IF EXISTS "Public read access for company_intelligence" ON public.company_intelligence;
CREATE POLICY "Public read access for company_intelligence" 
ON public.company_intelligence FOR SELECT 
USING (true);

-- ── TIMESTAMP TRIGGER ──
CREATE OR REPLACE FUNCTION update_company_intelligence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_company_intelligence_modtime ON public.company_intelligence;
CREATE TRIGGER update_company_intelligence_modtime
    BEFORE UPDATE ON public.company_intelligence
    FOR EACH ROW
    EXECUTE PROCEDURE update_company_intelligence_timestamp();

-- ── DEDUPLICATION & UPSERT LOGIC ──

-- Function to clean existing duplicates (if any exist before unique constraint enforced)
CREATE OR REPLACE FUNCTION public.clean_company_duplicates()
RETURNS void AS $$
BEGIN
    DELETE FROM public.company_intelligence a
    USING public.company_intelligence b
    WHERE a.id < b.id 
    AND LOWER(TRIM(a.company_name)) = LOWER(TRIM(b.company_name));
END;
$$ LANGUAGE plpgsql;

-- Stored procedure for high-fidelity verified upserts
CREATE OR REPLACE FUNCTION public.upsert_company_intelligence(
    p_company_name TEXT,
    p_industry TEXT,
    p_company_size TEXT,
    p_stage TEXT,
    p_financial_signals JSONB,
    p_layoff_history JSONB,
    p_hiring_signals JSONB,
    p_role_risk_map JSONB,
    p_ai_exposure_index FLOAT,
    p_market_risk_score FLOAT,
    p_company_risk_score FLOAT,
    p_confidence_score FLOAT,
    p_archetype TEXT,
    p_data_source TEXT,
    p_last_updated DATE
) RETURNS void AS $$
BEGIN
    INSERT INTO public.company_intelligence (
        company_name, industry, company_size, stage, financial_signals, 
        layoff_history, hiring_signals, role_risk_map, 
        ai_exposure_index, market_risk_score, company_risk_score, 
        confidence_score, archetype, data_source, last_updated
    ) VALUES (
        p_company_name, p_industry, p_company_size, p_stage, p_financial_signals, 
        p_layoff_history, p_hiring_signals, p_role_risk_map, 
        p_ai_exposure_index, p_market_risk_score, p_company_risk_score, 
        p_confidence_score, p_archetype, p_data_source, p_last_updated
    )
    ON CONFLICT (company_name) DO UPDATE SET
        industry = EXCLUDED.industry,
        company_size = EXCLUDED.company_size,
        stage = EXCLUDED.stage,
        financial_signals = EXCLUDED.financial_signals,
        layoff_history = EXCLUDED.layoff_history,
        hiring_signals = EXCLUDED.hiring_signals,
        role_risk_map = EXCLUDED.role_risk_map,
        ai_exposure_index = EXCLUDED.ai_exposure_index,
        market_risk_score = EXCLUDED.market_risk_score,
        company_risk_score = EXCLUDED.company_risk_score,
        confidence_score = EXCLUDED.confidence_score,
        archetype = EXCLUDED.archetype,
        data_source = EXCLUDED.data_source,
        last_updated = EXCLUDED.last_updated,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

