-- Add additional poses to expand the database (Batch 3)
INSERT INTO poses (english_name, sanskrit_name_adapted, sanskrit_name, translation_name, pose_description, pose_benefits, difficulty_level, category_name)
VALUES
  -- Standing Poses
  ('Standing Bow', 'Dandayamana Dhanurasana', 'दण्डायमान धनुरासन', 'dandayamana = standing, dhanu = bow',
   'A standing balance pose where one leg is held behind while arching back.',
   'Improves balance and concentration, opens chest and shoulders, strengthens legs.',
   'Expert', 'Standing'),

  ('Star', 'Utthita Tadasana', 'उत्थित तडासन', 'utthita = extended, tada = mountain',
   'Standing with legs wide and arms extended to form a five-pointed star.',
   'Opens the entire body, improves circulation, builds energy and confidence.',
   'Beginner', 'Standing'),

  -- Seated Poses
  ('Shoelace', 'Gomukhasana variation', 'गोमुखासन विविधता', 'go = cow, mukha = face',
   'A seated pose with legs crossed and stacked, similar to tied shoelaces.',
   'Opens hips and shoulders, improves posture, releases tension in legs.',
   'Intermediate', 'Seated'),

  ('Rock the Baby', 'Hindolasana', 'हिन्दोलासन', 'hindola = swing',
   'A seated pose where one leg is cradled like a baby.',
   'Gently opens hips, soothes nervous system, promotes relaxation.',
   'Beginner', 'Seated'),

  -- Supine Poses
  ('Waterfall', 'Supta Dandasana', 'सुप्त दण्डासन', 'supta = reclining, danda = staff',
   'Lying on back with legs extended up toward ceiling.',
   'Relieves tired legs, calms nervous system, promotes relaxation.',
   'Beginner', 'Supine'),

  ('Wind Removing', 'Pavanamuktasana', 'पवनमुक्तासन', 'pavana = wind, mukta = releasing',
   'Lying on back, drawing knees to chest to release trapped air.',
   'Aids digestion, releases gas, massages internal organs.',
   'Beginner', 'Supine'),

  -- Prone Poses
  ('Sphinx', 'Salamba Bhujangasana', 'सालम्ब भुजङ्गासन', 'salamba = supported, bhujanga = cobra',
   'A gentle backbend supported on the forearms.',
   'Strengthens spine, opens chest and lungs, therapeutic for lower back.',
   'Beginner', 'Prone'),

  ('Tortoise', 'Kurmasana', 'कूर्मासन', 'kurma = tortoise',
   'A forward fold with arms threaded under legs.',
   'Deep hip opening, calms nervous system, promotes introspection.',
   'Expert', 'Prone'),

  -- Arm & Leg Support
  ('Box', 'Chakravakasana', 'चक्रवाकासन', 'chakravaka = ruddy goose',
   'On hands and knees in a neutral spine position.',
   'Improves spinal mobility, strengthens core, good for warm-up.',
   'Beginner', 'Other'),

  ('Humble Flamingo', 'Baddha Natarajasana variation', 'बद्ध नटराजासन विविधता', 'baddha = bound, nataraja = dance of Shiva',
   'A variation of Dancers Pose with a forward fold.',
   'Improves balance, opens shoulders and hips, builds concentration.',
   'Expert', 'Standing'),

  -- Arm Balance & Inversion
  ('Chin Stand', 'Ganda Bherundasana', 'गण्ड भेरुण्डासन', 'ganda = cheek, bherunda = terrible',
   'An advanced pose balancing on the chin and sternum.',
   'Extreme spinal flexibility, strengthens entire body, requires great control.',
   'Expert', 'Arm Balance'),

  ('Pendant', 'Lolasana', 'लोलासन', 'lola = pendant, hanging',
   'An arm balance where the legs are lifted and tucked.',
   'Strengthens arms and core, improves balance and concentration.',
   'Expert', 'Arm Balance'),

  ('Moon Bird', 'Eka Pada Sirsasana C', 'एकपाद शीर्षासन स', 'eka = one, pada = foot, sirsa = head',
   'An advanced variation with one leg behind head and arms in balance.',
   'Extreme flexibility, strength, and balance required.',
   'Expert', 'Arm Balance'); 