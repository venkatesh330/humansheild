-- Waitlist table for tracking Pro/Enterprise signups
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'pro',
  referral_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);