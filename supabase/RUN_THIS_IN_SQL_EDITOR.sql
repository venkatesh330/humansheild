-- ===========================================
-- SUPABASE SQL MIGRATIONS
-- Run this in: https://ysenimczeasmaeojzlkt.supabase.co/project/-/sql
-- ===========================================

-- ===========================================
-- MIGRATION 1: Journal Entries Table
-- ===========================================

-- Create table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dimension VARCHAR(20) NOT NULL CHECK (dimension IN ('empathic', 'moral', 'creative', 'physical', 'social', 'contextual')),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    human_score SMALLINT,
    job_risk_score SMALLINT,
    skill_risk_score SMALLINT,
    assessment_date TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_dimension ON journal_entries(dimension);
CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries(created_at DESC);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own journal entries" ON journal_entries;
CREATE POLICY "Users can manage own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS journal_updated_at ON journal_entries;
CREATE TRIGGER journal_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_updated_at();

-- Function: Get tag stats
CREATE OR REPLACE FUNCTION get_journal_tag_stats(p_user_id UUID)
RETURNS TABLE(tag_name TEXT, usage_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT tag::TEXT, COUNT(*)::BIGINT
    FROM journal_entries, unnest(tags) AS tag
    WHERE journal_entries.user_id = p_user_id
    GROUP BY tag
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Rename tag
CREATE OR REPLACE FUNCTION rename_journal_tag(p_user_id UUID, p_old_tag TEXT, p_new_tag TEXT)
RETURNS BIGINT AS $$
DECLARE rows_affected BIGINT;
BEGIN
    UPDATE journal_entries
    SET tags = array(
        SELECT CASE WHEN t = p_old_tag THEN p_new_tag ELSE t END
        FROM unnest(tags) AS t
    )
    WHERE user_id = p_user_id AND p_old_tag = ANY(tags);
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- MIGRATION 2: Score History Table
-- ===========================================

-- Create table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_score_user ON score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_score_user_source ON score_history(user_id, source);
CREATE INDEX IF NOT EXISTS idx_score_created ON score_history(created_at DESC);

-- Enable RLS
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own scores" ON score_history;
CREATE POLICY "Users can manage own scores" ON score_history FOR ALL USING (auth.uid() = user_id);

-- Function: Get score trend
CREATE OR REPLACE FUNCTION get_score_trend(p_user_id UUID, p_source VARCHAR, p_days INTEGER DEFAULT 30)
RETURNS TABLE(change_num SMALLINT, direction VARCHAR, pct_change NUMERIC) AS $$
DECLARE
    v_current RECORD;
    v_previous RECORD;
BEGIN
    SELECT score, plot_score INTO v_current FROM score_history
    WHERE user_id = p_user_id AND source = p_source
    ORDER BY created_at DESC LIMIT 1;

    SELECT score, plot_score INTO v_previous FROM score_history
    WHERE user_id = p_user_id AND source = p_source AND created_at < NOW() - (p_days || ' days')::INTERVAL
    ORDER BY created_at DESC LIMIT 1;
    
    IF v_current IS NULL OR v_previous IS NULL THEN
        RETURN QUERY SELECT 0::SMALLINT, 'stable'::VARCHAR, 0::NUMERIC;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT 
        (v_current.plot_score - v_previous.plot_score)::SMALLINT,
        CASE 
            WHEN v_current.plot_score > v_previous.plot_score THEN 'up'
            WHEN v_current.plot_score < v_previous.plot_score THEN 'down'
            ELSE 'stable' 
        END,
        CASE 
            WHEN v_previous.plot_score = 0 THEN 0
            ELSE ((v_current.plot_score - v_previous.plot_score)::NUMERIC / v_previous.plot_score) * 100
        END;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- VERIFY
-- ===========================================
SELECT 'journal_entries' as table_name, COUNT(*) as rows FROM journal_entries
UNION ALL
SELECT 'score_history', COUNT(*) FROM score_history;

-- Show tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('journal_entries', 'score_history')
ORDER BY table_name;