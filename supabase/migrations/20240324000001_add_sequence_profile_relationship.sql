-- First ensure the profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  experience_level TEXT CHECK (experience_level IN ('Beginner', 'Intermediate', 'Expert')),
  preferred_style TEXT,
  practice_frequency TEXT,
  focus_areas TEXT[],
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check if the foreign key constraint already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'sequences_user_id_fkey'
  ) THEN
    -- Add foreign key relationship between sequences and profiles
    ALTER TABLE sequences 
      ADD CONSTRAINT sequences_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better join performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_sequences_user_id
  ON sequences(user_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow reading public sequences with profile info" ON sequences;
DROP POLICY IF EXISTS "Allow reading profiles for public sequences" ON profiles;

-- Create new policies
CREATE POLICY "Allow reading public sequences with profile info"
  ON sequences FOR SELECT
  USING (
    is_public = true OR 
    auth.uid() = user_id
  );

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading profiles for public sequences"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id 
      FROM sequences 
      WHERE is_public = true
    ) OR
    id = auth.uid()
  ); 