-- MsituMum Supabase Database Setup
-- Run this in your Supabase SQL Editor: https://lmcmxqbzqsudvqxutpuf.supabase.co

-- Drop existing users table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table to store additional user info and enable username lookup
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  organization TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast username lookup
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own data during registration
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Grant permissions (optional, for service role)
-- GRANT ALL ON users TO authenticated;
-- GRANT ALL ON users TO service_role;

-- Test query
SELECT 'Users table created successfully!' as status;
