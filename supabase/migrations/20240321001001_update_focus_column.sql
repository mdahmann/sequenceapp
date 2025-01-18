-- Update focus column to be a text array
ALTER TABLE sequences ALTER COLUMN focus TYPE text[] USING 
  CASE 
    WHEN focus IS NULL THEN ARRAY[]::text[]
    WHEN focus::text ~ '^\\[.*\\]$' THEN ARRAY(SELECT json_array_elements_text(focus::json))
    WHEN focus::text ~ '^{.*}$' THEN string_to_array(trim(both '{}' from focus::text), ',')
    ELSE ARRAY[focus::text]
  END;

-- Update the update_sequence function to handle text arrays properly
CREATE OR REPLACE FUNCTION update_sequence(
  p_id bigint, 
  p_duration integer,
  p_enabled_features jsonb,
  p_focus text[],
  p_level text,
  p_name text,
  p_peak_poses jsonb,
  p_poses jsonb,
  p_repetitions jsonb,
  p_timing jsonb,
  p_transitions jsonb,
  p_user_id uuid
) RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN 
  -- Clean the focus array by removing any JSON artifacts
  UPDATE sequences 
  SET 
    name = p_name, 
    duration = p_duration, 
    level = p_level, 
    focus = (
      SELECT array_agg(trim(both '"' from trim(both E'\\' from value)))
      FROM unnest(p_focus) as value
    ),
    poses = p_poses, 
    peak_poses = p_peak_poses,
    timing = p_timing,
    transitions = p_transitions,
    repetitions = p_repetitions,
    enabled_features = p_enabled_features,
    updated_at = now() 
  WHERE id = p_id AND user_id = p_user_id; 
  
  RETURN json_build_object(
    'success', FOUND, 
    'message', CASE WHEN FOUND THEN 'Sequence updated' ELSE 'Sequence not found' END
  ); 
END; 
$$; 