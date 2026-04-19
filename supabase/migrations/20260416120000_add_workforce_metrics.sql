-- ── ADD WORKFORCE AND JOBS METRICS ──
-- Phase 2 Expansion: Enhancing Risk Oracle predictive metrics
-- Created: 2026-04-16

ALTER TABLE public.company_intelligence 
ADD COLUMN IF NOT EXISTS workforce_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS open_jobs_count INTEGER DEFAULT 0;

-- ── UPDATE UPSERT FUNCTION ──
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
    p_last_updated DATE,
    p_workforce_count INTEGER DEFAULT 0,
    p_open_jobs_count INTEGER DEFAULT 0
) RETURNS void AS $$
BEGIN
    INSERT INTO public.company_intelligence (
        company_name, industry, company_size, stage, financial_signals, 
        layoff_history, hiring_signals, role_risk_map, 
        ai_exposure_index, market_risk_score, company_risk_score, 
        confidence_score, archetype, data_source, last_updated,
        workforce_count, open_jobs_count
    ) VALUES (
        p_company_name, p_industry, p_company_size, p_stage, p_financial_signals, 
        p_layoff_history, p_hiring_signals, p_role_risk_map, 
        p_ai_exposure_index, p_market_risk_score, p_company_risk_score, 
        p_confidence_score, p_archetype, p_data_source, p_last_updated,
        p_workforce_count, p_open_jobs_count
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
        workforce_count = EXCLUDED.workforce_count,
        open_jobs_count = EXCLUDED.open_jobs_count,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
