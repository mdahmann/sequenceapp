-- Create flow_blocks table
CREATE TABLE IF NOT EXISTS flow_blocks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  poses JSONB NOT NULL,
  timing JSONB,
  transitions JSONB,
  repetitions JSONB,
  is_bilateral BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  category TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Expert')),
  parent_block_id BIGINT REFERENCES flow_blocks(id) ON DELETE SET NULL,
  nested_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS flow_blocks_user_id_idx ON flow_blocks(user_id);
CREATE INDEX IF NOT EXISTS flow_blocks_category_idx ON flow_blocks(category) WHERE category IS NOT NULL;

-- Enable RLS
ALTER TABLE flow_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own flow blocks" ON flow_blocks;
CREATE POLICY "Users can view their own flow blocks"
  ON flow_blocks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public flow blocks" ON flow_blocks;
CREATE POLICY "Users can view public flow blocks"
  ON flow_blocks FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert their own flow blocks" ON flow_blocks;
CREATE POLICY "Users can insert their own flow blocks"
  ON flow_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own flow blocks" ON flow_blocks;
CREATE POLICY "Users can update their own flow blocks"
  ON flow_blocks FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own flow blocks" ON flow_blocks;
CREATE POLICY "Users can delete their own flow blocks"
  ON flow_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- Add flow_block_references table to track usage of flow blocks in sequences
CREATE TABLE IF NOT EXISTS flow_block_references (
  id SERIAL PRIMARY KEY,
  sequence_id BIGINT REFERENCES sequences(id) ON DELETE CASCADE,
  flow_block_id BIGINT REFERENCES flow_blocks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  repetitions INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS flow_block_references_sequence_id_idx ON flow_block_references(sequence_id);
CREATE INDEX IF NOT EXISTS flow_block_references_flow_block_id_idx ON flow_block_references(flow_block_id);

-- Enable RLS
ALTER TABLE flow_block_references ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can manage their own flow block references" ON flow_block_references;
CREATE POLICY "Users can manage their own flow block references"
  ON flow_block_references FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM sequences WHERE id = sequence_id
    )
  );

-- Add trigger to update updated_at
DROP TRIGGER IF EXISTS update_flow_blocks_updated_at ON flow_blocks;
CREATE TRIGGER update_flow_blocks_updated_at
  BEFORE UPDATE ON flow_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some default categories
COMMENT ON TABLE flow_blocks IS 'Stores reusable flow sequences like Sun Salutations';
COMMENT ON COLUMN flow_blocks.category IS 'Categories like: Sun Salutation, Moon Salutation, Standing Flow, etc.'; 