-- Create the initial poses table
CREATE TABLE poses (
  id SERIAL PRIMARY KEY,
  english_name TEXT NOT NULL,
  sanskrit_name TEXT,
  sanskrit_name_adapted TEXT,
  translation_name TEXT,
  pose_description TEXT,
  pose_benefits TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Expert')),
  category_name TEXT CHECK (category_name IN ('Standing', 'Seated', 'Supine', 'Prone', 'Core', 'Backbend', 'Forward Bend', 'Hip Opener', 'Inversion', 'Balance', 'Arm Balance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on english_name for faster lookups
CREATE INDEX poses_english_name_idx ON poses (english_name);

-- Create an index on sanskrit_name for faster lookups
CREATE INDEX poses_sanskrit_name_idx ON poses (sanskrit_name);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_poses_updated_at
    BEFORE UPDATE ON poses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add a unique constraint to prevent duplicate poses
ALTER TABLE poses ADD CONSTRAINT poses_unique_names UNIQUE (english_name, sanskrit_name);

-- Enable Row Level Security
ALTER TABLE poses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON poses;
DROP POLICY IF EXISTS "Allow authenticated read access" ON poses;
DROP POLICY IF EXISTS "Universal read access" ON poses;

-- Create policies for different access levels
CREATE POLICY "Allow service role full access"
ON poses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read access"
ON poses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow anonymous read access"
ON poses
FOR SELECT
TO anon
USING (true); 