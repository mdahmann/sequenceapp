-- Create custom poses table
CREATE TABLE custom_poses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create indexes
CREATE INDEX custom_poses_user_id_idx ON custom_poses (user_id);
CREATE INDEX custom_poses_english_name_idx ON custom_poses (english_name);

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_custom_poses_updated_at
    BEFORE UPDATE ON custom_poses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE custom_poses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own custom poses"
ON custom_poses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom poses"
ON custom_poses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom poses"
ON custom_poses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom poses"
ON custom_poses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 