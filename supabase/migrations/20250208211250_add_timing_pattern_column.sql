DO $$ 
BEGIN
    -- Add timing_pattern if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'flow_blocks' 
        AND column_name = 'timing_pattern'
    ) THEN
        ALTER TABLE flow_blocks 
        ADD COLUMN timing_pattern JSONB;
    END IF;
END $$;



