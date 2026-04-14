-- PHASE-2: Cloud Sync Backend
-- File: supabase/migrations/20260413000000_create_score_history.sql
-- Score History - Cloud sync support

CREATE TABLE IF NOT EXISTS score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('job', 'skill', 'human-index')),
    score SMALLINT NOT NULL,
    plot_score SMALLINT NOT NULL,
    data_version VARCHAR(20) DEFAULT '2026-Q1',
    app_version VARCHAR(20) DEFAULT '3.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_user ON score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_score_user_source ON score_history(user_id, source);
CREATE INDEX IF NOT EXISTS idx_score_created ON score_history(created_at DESC);

ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scores" ON score_history
    FOR ALL
    USING (auth.uid() = user_id);

-- Function to get latest score by source
CREATE OR REPLACE FUNCTION get_latest_score(p_user_id UUID, p_source VARCHAR)
RETURNS TABLE(score SMALLINT, plot_score SMALLINT, created_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY
    SELECT s.score, s.plot_score, s.created_at
    FROM score_history s
    WHERE s.user_id = p_user_id AND s.source = p_source
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get score trend
CREATE OR REPLACE FUNCTION get_score_trend(p_user_id UUID, p_source VARCHAR, p_days INTEGER DEFAULT 30)
RETURNS TABLE(change_num SMALLINT, direction VARCHAR, pct_change NUMERIC) AS $$
DECLARE
    v_current RECORD;
    v_previous RECORD;
BEGIN
    SELECT score, plot_score INTO v_current FROM get_latest_score(p_user_id, p_source);
    SELECT score, plot_score INTO v_previous 
    FROM score_history 
    WHERE user_id = p_user_id AND source = p_source AND created_at < NOW() - (p_days || ' days')::INTERVAL
    ORDER BY created_at DESC LIMIT 1;
    
    IF NOT FOUND OR v_previous IS NULL THEN
        RETURN QUERY SELECT 0, 'stable'::VARCHAR, 0::NUMERIC;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT 
        v_current.plot_score - v_previous.plot_score,
        CASE WHEN v_current.plot_score > v_previous.plot_score THEN 'up'
             WHEN v_current.plot_score < v_previous.plot_score THEN 'down'
             ELSE 'stable' END,
        ((v_current.plot_score - v_previous.plot_score)::NUMERIC / NULLIF(v_previous.plot_score, 0)) * 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE score_history IS 'Historical score entries synced from client devices';
COMMENT ON FUNCTION get_score_trend IS 'Calculate trend over specified days';