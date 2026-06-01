-- Legal Navigator Queries Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS legal_navigator_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT,
  recommended_authority TEXT,
  result JSONB,
  -- Optional: linked to a logged-in user if present
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by user and date
CREATE INDEX IF NOT EXISTS idx_legal_navigator_user_id ON legal_navigator_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_navigator_created_at ON legal_navigator_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_navigator_category ON legal_navigator_queries(category);

-- RLS: only service role can read/write (backend uses supabaseAdmin)
ALTER TABLE legal_navigator_queries ENABLE ROW LEVEL SECURITY;

-- Allow backend service role full access (supabaseAdmin bypasses RLS automatically)
-- No public policy needed since all writes happen from the backend with service key
