-- Add visibility column to sequences table
ALTER TABLE sequences ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE sequences ADD COLUMN published_at TIMESTAMPTZ;
ALTER TABLE sequences ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE sequences ADD COLUMN like_count INTEGER DEFAULT 0;

-- Create sequence_likes table for tracking likes
CREATE TABLE sequence_likes (
  id BIGSERIAL PRIMARY KEY,
  sequence_id BIGINT REFERENCES sequences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, user_id)
);

-- Update RLS policies for sequences
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;

-- Policy for viewing sequences (public or owned)
CREATE POLICY "View public sequences or own sequences"
ON sequences
FOR SELECT
USING (
  is_public = true OR 
  auth.uid() = user_id
);

-- Policy for updating sequences (owner only)
CREATE POLICY "Update own sequences"
ON sequences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS for sequence_likes
ALTER TABLE sequence_likes ENABLE ROW LEVEL SECURITY;

-- Policy for viewing likes
CREATE POLICY "View sequence likes"
ON sequence_likes
FOR SELECT
USING (true);

-- Policy for adding likes
CREATE POLICY "Add sequence likes"
ON sequence_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for removing likes
CREATE POLICY "Remove sequence likes"
ON sequence_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_sequence_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sequences
  SET view_count = view_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update like count
CREATE OR REPLACE FUNCTION update_sequence_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sequences
    SET like_count = like_count + 1
    WHERE id = NEW.sequence_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sequences
    SET like_count = like_count - 1
    WHERE id = OLD.sequence_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for view count
CREATE TRIGGER increment_sequence_view_trigger
AFTER INSERT ON sequences
FOR EACH ROW
EXECUTE FUNCTION increment_sequence_view();

-- Trigger for like count
CREATE TRIGGER update_sequence_like_count_trigger
AFTER INSERT OR DELETE ON sequence_likes
FOR EACH ROW
EXECUTE FUNCTION update_sequence_like_count(); 