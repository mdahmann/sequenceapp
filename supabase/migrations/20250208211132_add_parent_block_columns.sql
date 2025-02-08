DO $$ 
BEGIN
    -- Add parent_block_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'flow_blocks' 
        AND column_name = 'parent_block_id'
    ) THEN
        ALTER TABLE flow_blocks 
        ADD COLUMN parent_block_id BIGINT REFERENCES flow_blocks(id) ON DELETE SET NULL;
    END IF;

    -- Add nested_position if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'flow_blocks' 
        AND column_name = 'nested_position'
    ) THEN
        ALTER TABLE flow_blocks 
        ADD COLUMN nested_position INTEGER;
    END IF;
END $$;
