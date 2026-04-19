/**
 * Database Cleanse: Removing NULL and questionable 0 values 
 * from company_intelligence table.
 */

-- 1. Standardization of 'No Layoff' dates
-- Replace NULL last_layoff_date with 'No History' for companies with 0 layoffs
UPDATE public.company_intelligence
SET layoff_history = jsonb_set(
    layoff_history, 
    '{last_layoff_date}', 
    '"No History"'
)
WHERE 
    (layoff_history->>'total_layoffs')::int = 0 
    AND (layoff_history->>'last_layoff_date') IS NULL;

-- 2. Repair empty departments
-- Ensure affected_departments is at least an empty array, not NULL or missing
UPDATE public.company_intelligence
SET layoff_history = jsonb_set(
    layoff_history, 
    '{affected_departments}', 
    '[]'
)
WHERE 
    (layoff_history->'affected_departments') IS NULL;

-- 3. Recover uncalibrated risk scores
-- If a risk score is exactly 0 but confidence is high, it likely means missing data during seed
UPDATE public.company_intelligence
SET company_risk_score = 0.15
WHERE company_risk_score = 0 AND confidence_score > 0.5;

UPDATE public.company_intelligence
SET ai_exposure_index = 0.4
WHERE ai_exposure_index = 0 AND confidence_score > 0.5;

-- 4. Defaulting missing confidence scores
-- Production grounding data should have at least 70% confidence if it exists in DB
UPDATE public.company_intelligence
SET confidence_score = 0.7
WHERE confidence_score = 0;

-- 5. Cleanup Industry strings (trim and consistency)
UPDATE public.company_intelligence
SET industry = TRIM(industry);
