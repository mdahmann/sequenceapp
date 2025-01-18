-- Add timing-related columns to sequences table
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS timing jsonb;
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS transitions jsonb;
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS repetitions jsonb;
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS enabled_features jsonb;

-- Add comments to explain the columns
COMMENT ON COLUMN sequences.timing IS 'Array of timing instructions for each pose';
COMMENT ON COLUMN sequences.transitions IS 'Array of transition instructions between poses';
COMMENT ON COLUMN sequences.repetitions IS 'Object containing repetition information for poses or groups of poses';
COMMENT ON COLUMN sequences.enabled_features IS 'Object containing enabled/disabled state of features like timing, transitions, and cues'; 