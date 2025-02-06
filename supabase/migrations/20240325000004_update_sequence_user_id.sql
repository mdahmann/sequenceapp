-- Drop the existing foreign key if it exists
ALTER TABLE sequences DROP CONSTRAINT IF EXISTS sequences_user_id_fkey;

-- Drop the existing index if it exists
DROP INDEX IF EXISTS idx_sequences_user_id;

-- Create a temporary column
ALTER TABLE sequences ADD COLUMN user_id_new UUID;

-- Update the new column with converted values
UPDATE sequences SET user_id_new = user_id::UUID;

-- Drop the old column
ALTER TABLE sequences DROP COLUMN user_id;

-- Rename the new column
ALTER TABLE sequences RENAME COLUMN user_id_new TO user_id;

-- Add the foreign key constraint
ALTER TABLE sequences
  ADD CONSTRAINT sequences_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Create index for better join performance
CREATE INDEX idx_sequences_user_id ON sequences(user_id); 