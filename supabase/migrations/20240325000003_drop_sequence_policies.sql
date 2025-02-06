-- First disable RLS temporarily
ALTER TABLE sequences DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow reading public sequences with profile info" ON sequences;
DROP POLICY IF EXISTS "Allow reading public sequences" ON sequences;
DROP POLICY IF EXISTS "Users can read own sequences" ON sequences;
DROP POLICY IF EXISTS "Anyone can read public sequences" ON sequences;
DROP POLICY IF EXISTS "Users can update own sequences" ON sequences;
DROP POLICY IF EXISTS "Users can delete own sequences" ON sequences;
DROP POLICY IF EXISTS "Users can insert sequences" ON sequences;
DROP POLICY IF EXISTS "Admin users can delete sequences" ON sequences;
DROP POLICY IF EXISTS "Admin users can insert sequences" ON sequences;
DROP POLICY IF EXISTS "Admin users can see all sequences" ON sequences;
DROP POLICY IF EXISTS "Admin users can update sequences" ON sequences;
DROP POLICY IF EXISTS "Users can delete their own sequences" ON sequences;
DROP POLICY IF EXISTS "Users can insert their own sequences" ON sequences;
DROP POLICY IF EXISTS "Users can view their own sequences" ON sequences;
DROP POLICY IF EXISTS "View public sequences or own sequences" ON sequences;
DROP POLICY IF EXISTS "Update own sequences" ON sequences;

-- Drop profile policies
DROP POLICY IF EXISTS "Allow reading profiles for public sequences" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles; 