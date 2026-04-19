-- Migration: Add signal integrity tables for Hybrid Intelligence Engine
-- Date: 2026-04-18
-- Purpose: Replace static signal model with time-decayed, provenance-tracked signals

-- 1. Extend company_baseline with verification metadata
ALTER TABLE company_intelligence
  ADD COLUMN IF NOT EXISTS last_verified TIMESTAMP,
  ADD COLUMN IF NOT EXISTS next_verification_due TIMESTAMP,
  ADD COLUMN IF NOT EXISTS data_confidence FLOAT DEFAULT 0.85,
  ADD COLUMN IF NOT EXISTS baseline_version INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Backfill: set last_verified to lastUpdated for existing records
UPDATE company_intelligence
SET last_verified = last_updated,
    next_verification_due = last_updated + INTERVAL '30 days'
WHERE last_verified IS NULL;

-- 2. Create live_signals_v2 (replaces old live_signals)
CREATE TABLE IF NOT EXISTS live_signals_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  signal_type TEXT NOT NULL,  -- 'stock90DayChange', 'recentLayoffNews', 'revenueGrowth', etc.
  signal_value FLOAT NOT NULL,  -- normalized 0–1
  raw_value TEXT,  -- original API response string
  unit TEXT NOT NULL DEFAULT 'normalized',
  source_name TEXT NOT NULL,  -- 'alpha_vantage', 'newsapi', 'sec_edgar', 'crunchbase'
  source_url TEXT,
  signal_timestamp TIMESTAMP NOT NULL,  -- when the event occurred
  fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
  confidence FLOAT NOT NULL DEFAULT 0.8,  -- source reliability 0–1
  decay_rate FLOAT NOT NULL DEFAULT 0.05,  -- per day
  evidence JSONB DEFAULT '[]',  -- array of URLs / citations
  -- Conflict metadata
  contradicts_signal_id UUID REFERENCES live_signals_v2(id),
  conflict_reason TEXT,
  -- Natural uniqueness constraint: same company + signal type + approx same timestamp
  -- (we allow multiple values per day if different sources)
  UNIQUE(company_name, signal_type, signal_timestamp, source_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_signals_company ON live_signals_v2(company_name, signal_type DESC);
CREATE INDEX IF NOT EXISTS idx_live_signals_fresh ON live_signals_v2(signal_timestamp)
  WHERE signal_timestamp > NOW() - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_live_signals_source ON live_signals_v2(source_name, fetched_at DESC);

-- 3. Create consensus_snapshot table (cached resolved signals per company)
CREATE TABLE IF NOT EXISTS consensus_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  snapshot_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  -- Store each resolved signal as JSONB key-value (could normalize to rows, but JSON simpler for prototyping)
  signals JSONB NOT NULL,  -- { "revenueGrowth": { "value": 0.32, "confidence": 0.87, ... }, ... }
  overall_confidence FLOAT NOT NULL,
  conflict_level TEXT CHECK (conflict_level IN ('none','low','medium','high','critical')),
  conflict_count INT DEFAULT 0,
  freshness_avg_days INT,
  primary_source TEXT CHECK (primary_source IN ('db','live','hybrid')),
  used_live BOOLEAN DEFAULT FALSE,
  used_swarm BOOLEAN DEFAULT FALSE,
  signal_source_breakdown JSONB,  -- { "live": 0.6, "db": 0.3, "swarm": 0.1 }
  -- Cache control
  valid_until TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_name, snapshot_timestamp)
);

CREATE INDEX IF NOT EXISTS idx_consensus_company ON consensus_snapshot(company_name, snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_consensus_valid ON consensus_snapshot(valid_until) WHERE valid_until > NOW();

-- 4. Create signal_quality_log for audit trail
CREATE TABLE IF NOT EXISTS signal_quality_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  log_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL,  -- 'conflict_detected', 'kill_switch_triggered', 'override_applied'
  details JSONB NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_details JSONB,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_log_company ON signal_quality_log(company_name, log_timestamp DESC);

-- 5. Function: Upsert live signal with idempotency
CREATE OR REPLACE FUNCTION upsert_live_signal(
  p_company_name TEXT,
  p_signal_type TEXT,
  p_signal_value FLOAT,
  p_raw_value TEXT,
  p_unit TEXT,
  p_source_name TEXT,
  p_signal_timestamp TIMESTAMP,
  p_confidence FLOAT DEFAULT 0.8,
  p_decay_rate FLOAT DEFAULT 0.05,
  p_evidence JSONB DEFAULT '[]'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO live_signals_v2
    (company_name, signal_type, signal_value, raw_value, unit, source_name, signal_timestamp, confidence, decay_rate, evidence)
  VALUES
    (p_company_name, p_signal_type, p_signal_value, p_raw_value, p_unit, p_source_name, p_signal_timestamp, p_confidence, p_decay_rate, p_evidence)
  ON CONFLICT (company_name, signal_type, signal_timestamp, source_name)
  DO UPDATE SET
    signal_value = EXCLUDED.signal_value,
    raw_value = EXCLUDED.raw_value,
    confidence = EXCLUDED.confidence,
    fetched_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 6. Function: Get freshest signals for a company (used by consensus engine)
CREATE OR REPLACE FUNCTION get_fresh_signals_for_company(
  p_company_name TEXT,
  p_max_age_days INT DEFAULT 30
)
RETURNS TABLE (
  signal_type TEXT,
  signal_value FLOAT,
  source_name TEXT,
  signal_timestamp TIMESTAMP,
  age_days INT,
  effective_weight FLOAT,
  row_rank INT
) AS $$
DECLARE
  v_max_age INTERVAL := p_max_age_days * INTERVAL '1 day';
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      ls.signal_type,
      ls.signal_value,
      ls.source_name,
      ls.signal_timestamp,
      EXTRACT(DAY FROM (NOW() - ls.signal_timestamp))::INT AS age_days,
      ls.confidence * EXP(-ls.decay_rate * EXTRACT(DAY FROM (NOW() - ls.signal_timestamp))) AS effective_weight,
      ROW_NUMBER() OVER (
        PARTITION BY ls.signal_type, DATE_TRUNC('day', ls.signal_timestamp)
        ORDER BY ls.confidence DESC, ls.fetched_at DESC
      ) AS rank_within_type_day
    FROM live_signals_v2 ls
    WHERE ls.company_name = p_company_name
      AND ls.signal_timestamp > NOW() - v_max_age
  )
  SELECT
    r.signal_type,
    r.signal_value,
    r.source_name,
    r.signal_timestamp,
    r.age_days,
    r.effective_weight,
    r.rank_within_type_day
  FROM ranked r
  WHERE r.rank_within_type_day = 1  -- keep freshest per source per day
  ORDER BY r.signal_type, r.effective_weight DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Function: Compute consensus snapshot for a company (server-side)
-- This would be called by the Edge Function after fetching live signals
CREATE OR REPLACE FUNCTION compute_consensus_snapshot(
  p_company_name TEXT,
  p_role_title TEXT,
  p_experience TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_consensus JSONB;
  v_overall_confidence FLOAT;
  v_conflict_count INT;
  v_freshness_avg INT;
  v_primary_source TEXT;
  v_used_live BOOLEAN;
BEGIN
  -- Placeholder: actual logic would be in application layer (TypeScript)
  -- This stub just returns a default structure
  v_consensus := jsonb_build_object(
    'revenueGrowth', jsonb_build_object('value', 0.5, 'confidence', 0.6),
    'stock90DayChange', jsonb_build_object('value', 0.5, 'confidence', 0.5)
    -- ... all signals
  );
  v_overall_confidence := 0.6;
  v_conflict_count := 0;
  v_freshness_avg := 45;
  v_primary_source := 'db';
  v_used_live := FALSE;

  -- Upsert into consensus_snapshot
  INSERT INTO consensus_snapshot
    (company_name, signals, overall_confidence, conflict_level, conflict_count,
     freshness_avg_days, primary_source, used_live, valid_until)
  VALUES
    (p_company_name, v_consensus, v_overall_confidence,
     CASE WHEN v_conflict_count = 0 THEN 'none' WHEN v_conflict_count < 3 THEN 'medium' ELSE 'high' END,
     v_conflict_count, v_freshness_avg, v_primary_source, v_used_live,
     NOW() + INTERVAL '24 hours')
  ON CONFLICT (company_name, snapshot_timestamp)
  DO UPDATE SET
    signals = EXCLUDED.signals,
    overall_confidence = EXCLUDED.overall_confidence,
    conflict_level = EXCLUDED.conflict_level,
    conflict_count = EXCLUDED.conflict_count,
    freshness_avg_days = EXCLUDED.freshness_avg_days,
    primary_source = EXCLUDED.primary_source,
    used_live = EXCLUDED.used_live,
    valid_until = EXCLUDED.valid_until;

  RETURN v_consensus;
END;
$$ LANGUAGE plpgsql;

-- Permissions (if using RLS)
-- GRANT SELECT, INSERT ON live_signals_v2 TO authenticated;
-- GRANT SELECT, INSERT ON consensus_snapshot TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_fresh_signals_for_company TO authenticated;
-- GRANT EXECUTE ON FUNCTION compute_consensus_snapshot TO authenticated;

COMMIT;
