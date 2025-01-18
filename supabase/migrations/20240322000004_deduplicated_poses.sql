-- Create a mapping table for similar pose names
CREATE TABLE IF NOT EXISTS pose_name_mappings (
  canonical_name text PRIMARY KEY,
  alternate_names text[]
);

-- Insert known name variations
INSERT INTO pose_name_mappings (canonical_name, alternate_names) VALUES
  ('Boat', ARRAY['Navasana', 'Full Boat']),
  ('Half-Boat', ARRAY['Ardha Navasana']),
  ('Bridge', ARRAY['Setu Bandha Sarvangasana']),
  ('Butterfly', ARRAY['Bound Angle', 'Baddha Konasana']),
  ('Camel', ARRAY['Ustrasana']),
  ('Cat', ARRAY['Marjaryasana']),
  ('Chair', ARRAY['Utkatasana']),
  ('Child''s Pose', ARRAY['Balasana']),
  ('Corpse', ARRAY['Savasana', 'Sivasana']),
  ('Crescent Lunge', ARRAY['Ashta Chandrasana', 'Alanasana']),
  ('Crow', ARRAY['Bakasana', 'Crane']),
  ('Dolphin', ARRAY['Ardha Pincha Mayurasana']),
  ('Downward-Facing Dog', ARRAY['Adho Mukha Svanasana']),
  ('Eagle', ARRAY['Garudasana']),
  ('Extended Hand to Toe', ARRAY['Utthita Hasta Padangusthasana']),
  ('Extended Side Angle', ARRAY['Utthita Parsvakonasana']),
  ('Half Moon', ARRAY['Ardha Chandrasana']),
  ('Handstand', ARRAY['Adho Mukha Vrksasana']),
  ('Happy Baby', ARRAY['Ananda Balasana']),
  ('Headstand', ARRAY['Sirsasana', 'Salamba Sirsasana']),
  ('Lotus', ARRAY['Padmasana']),
  ('Pigeon', ARRAY['Eka Pada Rajakapotasana', 'Kapotasana']),
  ('Plow', ARRAY['Halasana']),
  ('Shoulder Stand', ARRAY['Sarvangasana', 'Salamba Sarvangasana']),
  ('Side Plank', ARRAY['Vasisthasana']),
  ('Sphinx', ARRAY['Salamba Bhujangasana']),
  ('Tree', ARRAY['Vrksasana']),
  ('Triangle', ARRAY['Trikonasana']),
  ('Warrior I', ARRAY['Virabhadrasana I', 'Virabhadrasana A']),
  ('Warrior II', ARRAY['Virabhadrasana II', 'Virabhadrasana B']),
  ('Warrior III', ARRAY['Virabhadrasana III', 'Virabhadrasana C']),
  ('Wheel', ARRAY['Urdhva Dhanurasana', 'Upward Bow']),
  ('Wild Thing', ARRAY['Camatkarasana', 'Flip Dog']);

-- Function to check if a pose name exists (including variations)
CREATE OR REPLACE FUNCTION pose_exists(check_name text) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM poses p
    LEFT JOIN pose_name_mappings m ON p.english_name = m.canonical_name
    WHERE p.english_name = check_name 
    OR p.sanskrit_name = check_name
    OR check_name = ANY(m.alternate_names)
  );
END;
$$ LANGUAGE plpgsql;

-- Add new poses, excluding duplicates and variations
INSERT INTO poses (
  english_name,
  sanskrit_name,
  sanskrit_name_adapted,
  translation_name,
  pose_description,
  pose_benefits,
  difficulty_level,
  category_name
)
SELECT 
  p.english_name,
  p.sanskrit_name,
  p.sanskrit_name_adapted,
  p.translation_name,
  p.pose_description,
  p.pose_benefits,
  p.difficulty_level,
  CASE p.category_name
    WHEN 'Core Work Poses' THEN 'Core'
    WHEN 'Backbends Poses' THEN 'Backbend'
    WHEN 'Forward Bends Poses' THEN 'Forward Bend'
    WHEN 'Hip Openers Poses' THEN 'Hip Opener'
    WHEN 'Inversions Poses' THEN 'Inversion'
    WHEN 'Balancing Poses' THEN 'Balance'
    ELSE p.category_name
  END as category_name
FROM (
  VALUES
    -- Standing Poses (New and Unique)
    ('Standing Foot to Head', 'Trivikramasana', 'Trivikramasana', 'tri = three, vikrama = step',
     'An advanced standing pose with one foot placed near or behind the head.',
     'Extreme hip opening, improves balance and flexibility, builds mental focus.',
     'Expert', 'Standing'),

    ('Shiva Squat', 'Malasana Variation', 'Malasana Variation', 'mala = garland',
     'A deep squat with feet close together and arms in prayer position.',
     'Opens hips and ankles, strengthens pelvic floor, improves balance.',
     'Intermediate', 'Standing'),

    -- Seated Poses (New and Unique)
    ('Fire Log', 'Agnistambhasana', 'Agnistambhasana', 'agni = fire, stambha = log',
     'Seated with shins stacked parallel like logs.',
     'Opens hips and outer thighs, improves posture, calms mind.',
     'Intermediate', 'Seated'),

    ('Sage Marichi I', 'Marichyasana A', 'Marichyasana A', 'marichi = ray of light',
     'Seated forward bend with one leg bent, other extended.',
     'Stretches spine and hamstrings, massages internal organs.',
     'Intermediate', 'Seated'),

    -- Supine Poses (New and Unique)
    ('Sleeping Yogi', 'Yoga Nidrasana', 'Yoga Nidrasana', 'yoga = union, nidra = sleep',
     'A deep hip opener with legs behind head while lying on back.',
     'Deep hip opening, calms nervous system, promotes relaxation.',
     'Expert', 'Supine'),

    -- Prone Poses (New and Unique)
    ('Snake', 'Sarpasana', 'Sarpasana', 'sarpa = snake',
     'A backbend variation lying on belly with hands clasped behind back.',
     'Strengthens spine and back muscles, opens chest and shoulders.',
     'Intermediate', 'Prone'),

    -- Arm Balances (New and Unique)
    ('Flying Man', 'Eka Pada Koundinyasana', 'Eka Pada Koundinyasana', 'eka = one, pada = foot, koundinya = sage',
     'An arm balance with one leg extended and one knee on upper arm.',
     'Strengthens arms and core, improves balance and focus.',
     'Expert', 'Arm Balance'),

    ('Grasshopper', 'Maksikanagasana', 'Maksikanagasana', 'maksika = fly',
     'An arm balance with legs wrapped around upper arms.',
     'Strengthens arms and core, improves balance and concentration.',
     'Expert', 'Arm Balance')

) AS p (
  english_name,
  sanskrit_name,
  sanskrit_name_adapted,
  translation_name,
  pose_description,
  pose_benefits,
  difficulty_level,
  category_name
)
WHERE NOT pose_exists(p.english_name) 
AND NOT pose_exists(p.sanskrit_name)
AND NOT pose_exists(p.sanskrit_name_adapted);

-- Cleanup
DROP FUNCTION pose_exists;
DROP TABLE pose_name_mappings; 