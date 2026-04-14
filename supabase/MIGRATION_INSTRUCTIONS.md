# Database Migration - Please Run in Supabase SQL Editor

## Instructions:

1. Go to: https://ysenimczeasmaeojzlkt.supabase.co/project/-/sql
2. Copy and paste the SQL below
3. Click "Run"

---

## SQL MIGRATION SCRIPT

```sql
-- ===========================================
-- MIGRATION 1: Journal Entries
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
CREATE POLICY "Users can manage own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- MIGRATION 2: Score History
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
CREATE POLICY "Users can manage own scores" ON score_history FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- VERIFY
-- ===========================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('journal_entries', 'score_history');
```

After running, you should see both tables listed.

---

## Why this approach?

The local machine cannot resolve Supabase's database hostname due to DNS/network restrictions, but the Supabase Dashboard SQL Editor works directly in the browser and can create tables.
