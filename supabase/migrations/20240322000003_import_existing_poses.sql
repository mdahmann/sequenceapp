-- First, standardize category names
UPDATE poses 
SET category_name = 
  CASE category_name
    WHEN 'Core Work Poses' THEN 'Core'
    WHEN 'Backbends Poses' THEN 'Backbend'
    WHEN 'Forward Bends Poses' THEN 'Forward Bend'
    WHEN 'Hip Openers Poses' THEN 'Hip Opener'
    WHEN 'Inversions Poses' THEN 'Inversion'
    WHEN 'Balancing Poses' THEN 'Balance'
    ELSE category_name
  END;

-- Import poses from poses_rows.sql, excluding duplicates
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
  english_name,
  sanskrit_name,
  sanskrit_name_adapted,
  translation_name,
  pose_description,
  pose_benefits,
  difficulty_level,
  CASE category_name
    WHEN 'Core Work Poses' THEN 'Core'
    WHEN 'Backbends Poses' THEN 'Backbend'
    WHEN 'Forward Bends Poses' THEN 'Forward Bend'
    WHEN 'Hip Openers Poses' THEN 'Hip Opener'
    WHEN 'Inversions Poses' THEN 'Inversion'
    WHEN 'Balancing Poses' THEN 'Balance'
    ELSE category_name
  END as category_name
FROM (
  VALUES
    ('Boat', 'Navasana', 'Navasana', 'nava = boat, asana = pose',
     'Balance on the sitting bones with legs lifted, forming a V-shape with the body. Arms parallel to the ground or reaching toward the feet.',
     'Strengthens core muscles, improves balance and digestion, stimulates kidneys, thyroid and prostate glands, helps relieve stress.',
     'Intermediate', 'Core'),
     
    ('Half-Boat', 'Ardha Navasana', 'Ardha Navasana', 'ardha = half, nava = boat, asana = pose',
     'Similar to Boat Pose but with bent knees, shins parallel to the ground, forming a less intense V-shape.',
     'Builds core strength, improves balance and concentration, helps relieve stress, gentler on the lower back.',
     'Intermediate', 'Core'),
     
    ('Bow', 'Dhanurasana', 'Dhanurasana', 'dhanu = bow, asana = pose',
     'Lie on the belly, bend knees, reach back to hold ankles, lift chest and legs to form a bow shape.',
     'Opens chest and shoulders, strengthens back muscles, improves posture and flexibility, stimulates digestive organs.',
     'Intermediate', 'Backbend'),
     
    ('King Pigeon', 'Eka Pada Rajakapotasana', 'Eka Pada Rajakapotasana', 'eka = one, pada = foot, raja = king, kapota = pigeon, asana = pose',
     'From Pigeon pose, bend back knee and hold foot with hands, lifting chest toward ceiling.',
     'Deep hip and back bend, opens chest and shoulders, improves flexibility.',
     'Expert', 'Hip Opener'),
     
    ('Plank', 'Phalakasana', 'Phalakasana', 'phalaka = plank, asana = pose',
     'Hold body in straight line from head to heels, supported by hands and toes.',
     'Strengthens core, arms, and wrists, improves posture and balance.',
     'Intermediate', 'Core'),
     
    ('Plow', 'Halasana', 'Halasana', 'hala = plow, asana = pose',
     'Lie on back, lift legs over head until toes touch floor behind head.',
     'Stretches spine and shoulders, calms nervous system, helps with insomnia.',
     'Intermediate', 'Inversion'),
     
    ('Reverse Warrior', 'Parsva Virabhadrasana', 'Parsva Virabhadrasana', 'viparita = reversed, virabhadra = warrior, asana = pose',
     'From Warrior II, back bend while sliding back hand down leg, front arm reaching overhead.',
     'Stretches sides of body, strengthens legs, improves flexibility and balance.',
     'Intermediate', 'Standing'),
     
    ('Side Splits', 'Upavistha Konasana', 'Upavistha Konasana', 'upavistha = seated, kona = angle, asana = pose',
     'Sit with legs extended out to sides as wide as possible.',
     'Opens hips and groin, improves flexibility, builds strength.',
     'Expert', 'Hip Opener'),
     
    ('Wild Thing', 'Camatkarasana', 'Camatkarasana', 'camatkar = miracle, asana = pose',
     'From side plank, flip over by lifting hips and reaching top arm back to floor.',
     'Opens chest and shoulders, strengthens arms and core, energizes body.',
     'Intermediate', 'Backbend')
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
WHERE NOT EXISTS (
  SELECT 1 FROM poses 
  WHERE poses.english_name = p.english_name 
  OR poses.sanskrit_name = p.sanskrit_name
); 