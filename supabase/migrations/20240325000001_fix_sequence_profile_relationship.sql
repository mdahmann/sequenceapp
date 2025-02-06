-- First, ensure the profiles table exists and has the correct structure
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

-- Drop the existing foreign key if it exists
ALTER TABLE sequences DROP CONSTRAINT IF EXISTS sequences_user_id_fkey;

-- Drop the existing index if it exists
DROP INDEX IF EXISTS idx_sequences_user_id;

-- Ensure user_id in sequences is the correct type
ALTER TABLE sequences ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Add the foreign key constraint
ALTER TABLE sequences
  ADD CONSTRAINT sequences_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Create index for better join performance
CREATE INDEX idx_sequences_user_id ON sequences(user_id);

-- Enable RLS on both tables
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update or create policies
DROP POLICY IF EXISTS "Allow reading public sequences" ON sequences;
CREATE POLICY "Allow reading public sequences"
  ON sequences FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow reading profiles for public sequences" ON profiles;
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

-- Create trigger for profile creation on user signup if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 