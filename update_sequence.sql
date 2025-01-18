create or replace function update_sequence(
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
) returns json language plpgsql security definer as $$ 
begin 
  update sequences 
  set 
    name = p_name, 
    duration = p_duration, 
    level = p_level, 
    focus = p_focus, 
    poses = p_poses, 
    peak_poses = p_peak_poses,
    timing = p_timing,
    transitions = p_transitions,
    repetitions = p_repetitions,
    enabled_features = p_enabled_features,
    updated_at = now() 
  where id = p_id and user_id = p_user_id; 
  
  return json_build_object(
    'success', found, 
    'message', case when found then 'Sequence updated' else 'Sequence not found' end
  ); 
end; 
$$;
