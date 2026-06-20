-- Add auth columns to profiles for Neon + NextAuth
-- Run this in the Neon SQL Editor

-- First drop the FK to auth.users (doesn't exist in Neon)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add auth columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make user_id nullable and auto-generate if null
ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN user_id SET DEFAULT gen_random_uuid();

-- Seed demo users (password_hash = bcrypt of "password123")
INSERT INTO profiles (full_name, role, email, password_hash) VALUES
  ('Admin User', 'admin', 'admin@madrasa.com', '$2b$10$qyDFUCyZTmYFH1F9jCT.1u1SDc0gdzEsBZSxJop3zLS91JCNLHToW'),
  ('Teacher User', 'teacher', 'teacher@madrasa.com', '$2b$10$qyDFUCyZTmYFH1F9jCT.1u1SDc0gdzEsBZSxJop3zLS91JCNLHToW'),
  ('Accountant User', 'accountant', 'accounts@madrasa.com', '$2b$10$qyDFUCyZTmYFH1F9jCT.1u1SDc0gdzEsBZSxJop3zLS91JCNLHToW')
ON CONFLICT (email) DO NOTHING;
