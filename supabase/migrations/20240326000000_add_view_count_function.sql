-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(sequence_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE sequences
  SET view_count = view_count + 1
  WHERE id = sequence_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(BIGINT) TO anon; 