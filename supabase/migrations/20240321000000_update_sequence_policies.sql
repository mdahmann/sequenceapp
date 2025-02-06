-- Enable RLS
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own sequences
CREATE POLICY "Users can read own sequences"
  ON sequences FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to read public sequences
CREATE POLICY "Anyone can read public sequences"
  ON sequences FOR SELECT
  USING (is_public = true);

-- Policy for users to update their own sequences
CREATE POLICY "Users can update own sequences"
  ON sequences FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own sequences
CREATE POLICY "Users can delete own sequences"
  ON sequences FOR DELETE
  USING (auth.uid() = user_id);

-- Policy for users to insert sequences
CREATE POLICY "Users can insert sequences"
  ON sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster public sequence queries
CREATE INDEX IF NOT EXISTS idx_sequences_is_public
  ON sequences (is_public)
  WHERE is_public = true; 