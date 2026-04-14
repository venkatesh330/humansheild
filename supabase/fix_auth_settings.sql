-- Update Auth Settings for Production
-- Run in Supabase SQL Editor: https://ysenimczeasmaeojzlkt.supabase.co/project/-/sql

-- Update site URL
UPDATE auth.config SET site_url = 'https://humanproof.ai' WHERE id = (SELECT id FROM auth.config LIMIT 1);

-- Add redirect URLs
-- Note: This needs to be done via the Supabase Dashboard UI or API

-- Enable email signups
UPDATE auth.config SET enable_signup = true WHERE id = (SELECT id FROM auth.config LIMIT 1);

-- Check current auth config
SELECT 
  id,
  site_url,
  enable_signup,
  enable_anonymous_sign_ins,
  jwt_expiry
FROM auth.config 
LIMIT 1;

-- List users to verify auth is working
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;