-- Drop all existing policies that might reference user_id
DROP POLICY IF EXISTS "Allow reading public sequences with profile info" ON sequences;
DROP POLICY IF EXISTS "Allow reading public sequences" ON sequences;
DROP POLICY IF EXISTS "Users can read own sequences" ON sequences;
DROP POLICY IF EXISTS "Anyone can read public sequences" ON sequences;
DROP POLICY IF EXISTS "Users can update own sequences" ON sequences;
DROP POLICY IF EXISTS "Users can delete own sequences" ON sequences;
DROP POLICY IF EXISTS "Users can insert sequences" ON sequences;

-- Drop the existing foreign key if it exists
ALTER TABLE sequences DROP CONSTRAINT IF EXISTS sequences_user_id_fkey;

-- Drop the existing index if it exists
DROP INDEX IF EXISTS idx_sequences_user_id;

-- Now we can safely alter the column type
ALTER TABLE sequences ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Add the foreign key constraint
ALTER TABLE sequences
  ADD CONSTRAINT sequences_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Create index for better join performance
CREATE INDEX idx_sequences_user_id ON sequences(user_id);

-- Recreate all necessary policies
CREATE POLICY "Allow reading public sequences"
  ON sequences FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can update own sequences"
  ON sequences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sequences"
  ON sequences FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert sequences"
  ON sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Profile policies
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