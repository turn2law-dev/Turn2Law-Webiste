-- Service Requests Table Migration
-- Run this in Supabase SQL Editor

-- Create sequence for auto-incrementing service numbers
CREATE SEQUENCE IF NOT EXISTS service_number_seq START 1;

-- Main table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_phone TEXT,
  service_type TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'in_progress', 'on_hold', 'completed'
  )),
  plan TEXT,
  form_data JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  estimated_completion DATE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate service number
CREATE OR REPLACE FUNCTION generate_service_number(service_type TEXT)
RETURNS TEXT AS $$
DECLARE
  service_code TEXT;
  seq_num INTEGER;
BEGIN
  -- Map service type to code
  service_code := CASE service_type
    WHEN 'GST Registration' THEN 'GST'
    WHEN 'GST Return Filing' THEN 'GSTR'
    WHEN 'LLP' THEN 'LLP'
    WHEN 'Private Limited' THEN 'PVT'
    WHEN 'Partnership' THEN 'PRT'
    WHEN 'OPC' THEN 'OPC'
    WHEN 'IEC' THEN 'IEC'
    ELSE 'SVC'
  END;
  
  -- Get next sequence number
  SELECT nextval('service_number_seq') INTO seq_num;
  
  -- Return formatted service number
  RETURN 'T2L-' || service_code || '-' || LPAD(seq_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON service_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can insert own requests"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Admin access will be handled at API level using SUPABASE_SERVICE_ROLE_KEY
-- This bypasses RLS for admin operations
