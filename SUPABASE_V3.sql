-- SUPABASE_V3.sql
-- Rode no SQL Editor do Supabase

ALTER TABLE workshops ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
