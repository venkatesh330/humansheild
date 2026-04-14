-- PHASE-1: Backend Integration
-- File: supabase/migrations/20260412090000_create_journal.sql
-- Human Edge Journal - Cloud sync support

-- Create journal_entries table with full schema
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dimension VARCHAR(20) NOT NULL CHECK (dimension IN (
        'empathic', 'moral', 'creative', 'physical', 'social', 'contextual'
    )),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    human_score SMALLINT,
    job_risk_score SMALLINT,
    skill_risk_score SMALLINT,
    assessment_date TIMESTAMP,
    linked_course_id UUID,
    linked_roadmap_item_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_date DATE GENERATED ALWAYS AS (CAST(created_at AT TIME ZONE 'UTC' AS DATE)) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_dimension ON journal_entries(dimension);
CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own entries
CREATE POLICY "Users can manage own journal entries" ON journal_entries
    FOR ALL
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function to get tag usage stats
CREATE OR REPLACE FUNCTION get_journal_tag_stats(p_user_id UUID)
RETURNS TABLE(tag_name TEXT, usage_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT tag::TEXT, COUNT(*)::BIGINT
    FROM journal_entries,
         unnest(tags) AS tag
    WHERE journal_entries.user_id = p_user_id
    GROUP BY tag
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Add function to rename tags across all entries
CREATE OR REPLACE FUNCTION rename_journal_tag(
    p_user_id UUID,
    p_old_tag TEXT,
    p_new_tag TEXT
) RETURNS BIGINT AS $$
DECLARE
    rows_affected BIGINT;
BEGIN
    UPDATE journal_entries
    SET tags = array(
        SELECT CASE
            WHEN t = p_old_tag THEN p_new_tag
            ELSE t
        END
        FROM unnest(tags) AS t
    )
    WHERE user_id = p_user_id AND p_old_tag = ANY(tags);
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- Add function to get streak data
CREATE OR REPLACE FUNCTION get_journal_streak(p_user_id UUID)
RETURNS TABLE(current_streak INT, longest_streak INT, total_entries BIGINT) AS $$
DECLARE
    v_current INT := 0;
    v_longest INT := 0;
    v_temp INT := 0;
    v_prev_date DATE;
    v_entry RECORD;
BEGIN
    -- Get sorted entries
    FOR v_entry IN
        SELECT DISTINCT DATE(created_at) as entry_date
        FROM journal_entries
        WHERE user_id = p_user_id
        ORDER BY entry_date DESC
    LOOP
        IF v_prev_date IS NULL THEN
            -- First entry - check if it's today or yesterday
            IF v_entry.entry_date >= CURRENT_DATE - 1 THEN
                v_current := 1;
            ELSE
                v_current := 0;
            END IF;
            v_temp := 1;
        ELSE
            IF v_entry.entry_date = v_prev_date - 1 THEN
                v_temp := v_temp + 1;
            ELSE
                v_longest := GREATEST(v_longest, v_temp);
                v_temp := 1;
            END IF;
        END IF;
        v_prev_date := v_entry.entry_date;
    END LOOP;
    
    v_longest := GREATEST(v_longest, v_temp);
    
    RETURN QUERY SELECT v_current, v_longest, COUNT(*)::BIGINT FROM journal_entries WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE journal_entries IS 'Human Edge Journal entries - stores user reflections on human skills';
COMMENT ON COLUMN journal_entries.linked_course_id IS 'Optional link to a learning course';
COMMENT ON COLUMN journal_entries.linked_roadmap_item_id IS 'Optional link to a roadmap item';