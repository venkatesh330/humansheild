-- ── LAYOFF AUDIT TABLES ──
-- Production-grade tables for layoff scoring, benchmarking, and news intelligence
-- Created: 2026-04-20

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: layoff_scores — anonymized benchmark aggregation
-- No user PII stored. Used to compute industry/role percentiles.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.layoff_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Anonymized classification (no company name, no user identifier)
    industry TEXT NOT NULL,
    role_category TEXT NOT NULL,      -- fuzzy bucket: "engineering", "marketing", etc.
    department TEXT NOT NULL,
    company_size_bucket TEXT NOT NULL, -- "startup" | "mid" | "large" | "enterprise"
    region TEXT NOT NULL DEFAULT 'US',

    -- Score data
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    tier TEXT NOT NULL,               -- 'red' | 'orange' | 'amber' | 'green' | 'teal'
    confidence TEXT NOT NULL,         -- 'High' | 'Medium' | 'Low'
    confidence_percent INTEGER NOT NULL DEFAULT 50,

    -- Layer breakdown (stored for aggregate analysis)
    l1_company_health FLOAT,
    l2_layoff_history FLOAT,
    l3_role_exposure FLOAT,
    l4_market_conditions FLOAT,
    l5_employee_factors FLOAT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_layoff_scores_industry ON public.layoff_scores(industry);
CREATE INDEX IF NOT EXISTS idx_layoff_scores_role ON public.layoff_scores(role_category);
CREATE INDEX IF NOT EXISTS idx_layoff_scores_tier ON public.layoff_scores(tier);
CREATE INDEX IF NOT EXISTS idx_layoff_scores_created ON public.layoff_scores(created_at DESC);

-- Public write (anonymous contributions) + public aggregate read
ALTER TABLE public.layoff_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert for layoff_scores" ON public.layoff_scores;
CREATE POLICY "Public insert for layoff_scores"
ON public.layoff_scores FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public read for layoff_scores" ON public.layoff_scores;
CREATE POLICY "Public read for layoff_scores"
ON public.layoff_scores FOR SELECT
USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: layoff_news_events — live news intelligence cache
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.layoff_news_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    headline TEXT NOT NULL,
    event_date DATE NOT NULL,
    percent_cut FLOAT,
    affected_count INTEGER,
    source_name TEXT NOT NULL,
    source_url TEXT,
    affected_departments TEXT[] DEFAULT '{}',
    is_confirmed BOOLEAN DEFAULT FALSE,   -- verified from primary source
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_layoff_news_company ON public.layoff_news_events(LOWER(company_name));
CREATE INDEX IF NOT EXISTS idx_layoff_news_date ON public.layoff_news_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_layoff_news_expires ON public.layoff_news_events(expires_at);

ALTER TABLE public.layoff_news_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for layoff_news_events" ON public.layoff_news_events;
CREATE POLICY "Public read for layoff_news_events"
ON public.layoff_news_events FOR SELECT
USING (expires_at > NOW());

-- Service role can insert/update
DROP POLICY IF EXISTS "Service role manage layoff_news_events" ON public.layoff_news_events;
CREATE POLICY "Service role manage layoff_news_events"
ON public.layoff_news_events FOR ALL
USING (true)
WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_layoff_benchmark
-- Returns percentile, median, and tier distribution for industry+role combo
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_layoff_benchmark(
    p_industry TEXT,
    p_role_category TEXT DEFAULT NULL,
    p_days INTEGER DEFAULT 90
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_count INTEGER;
    v_median FLOAT;
    v_p25 FLOAT;
    v_p75 FLOAT;
    v_tier_dist JSONB;
BEGIN
    SELECT
        COUNT(*),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score),
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY score),
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY score)
    INTO v_count, v_median, v_p25, v_p75
    FROM public.layoff_scores
    WHERE industry = p_industry
      AND (p_role_category IS NULL OR role_category = p_role_category)
      AND created_at > NOW() - (p_days || ' days')::INTERVAL;

    IF v_count < 5 THEN
        RETURN jsonb_build_object(
            'sufficient_data', false,
            'sample_size', v_count
        );
    END IF;

    SELECT jsonb_object_agg(tier, cnt)
    INTO v_tier_dist
    FROM (
        SELECT tier, COUNT(*) AS cnt
        FROM public.layoff_scores
        WHERE industry = p_industry
          AND created_at > NOW() - (p_days || ' days')::INTERVAL
        GROUP BY tier
    ) t;

    v_result := jsonb_build_object(
        'sufficient_data', true,
        'sample_size', v_count,
        'median_score', ROUND(v_median::NUMERIC, 1),
        'p25_score', ROUND(v_p25::NUMERIC, 1),
        'p75_score', ROUND(v_p75::NUMERIC, 1),
        'tier_distribution', COALESCE(v_tier_dist, '{}'),
        'industry', p_industry,
        'role_category', p_role_category,
        'days_window', p_days
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_score_percentile
-- Returns where a given score ranks within the industry distribution
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_score_percentile(
    p_score INTEGER,
    p_industry TEXT,
    p_days INTEGER DEFAULT 90
)
RETURNS JSONB AS $$
DECLARE
    v_total INTEGER;
    v_below INTEGER;
    v_percentile FLOAT;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM public.layoff_scores
    WHERE industry = p_industry
      AND created_at > NOW() - (p_days || ' days')::INTERVAL;

    IF v_total < 5 THEN
        RETURN jsonb_build_object('sufficient_data', false, 'sample_size', v_total);
    END IF;

    SELECT COUNT(*) INTO v_below
    FROM public.layoff_scores
    WHERE industry = p_industry
      AND score < p_score
      AND created_at > NOW() - (p_days || ' days')::INTERVAL;

    v_percentile := ROUND(((v_below::FLOAT / v_total::FLOAT) * 100)::NUMERIC, 1);

    RETURN jsonb_build_object(
        'sufficient_data', true,
        'percentile', v_percentile,
        'interpretation', CASE
            WHEN v_percentile >= 75 THEN 'Your risk is higher than most in your industry'
            WHEN v_percentile >= 50 THEN 'Your risk is above average for your industry'
            WHEN v_percentile >= 25 THEN 'Your risk is below average for your industry'
            ELSE 'Your risk is lower than most in your industry'
        END,
        'sample_size', v_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────────────
-- SEED: Extend company_intelligence with ticker + region fields if missing
-- ────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_intelligence' AND column_name = 'ticker'
    ) THEN
        ALTER TABLE public.company_intelligence ADD COLUMN ticker TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_intelligence' AND column_name = 'region'
    ) THEN
        ALTER TABLE public.company_intelligence ADD COLUMN region TEXT DEFAULT 'US';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_intelligence' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.company_intelligence ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'company_intelligence' AND column_name = 'employee_count'
    ) THEN
        ALTER TABLE public.company_intelligence ADD COLUMN employee_count INTEGER DEFAULT 1000;
    END IF;
END $$;
