-- Add additional poses to expand the database
INSERT INTO poses (english_name, sanskrit_name_adapted, sanskrit_name, translation_name, pose_description, pose_benefits, difficulty_level, category_name)
VALUES
  -- Standing Poses
  ('Big Toe Pose', 'Padangushthasana', 'पादाङ्गुष्ठासन', 'pada = foot, angushtha = big toe', 
   'Standing forward bend while holding the big toes with the fingers.',
   'Stretches hamstrings and calves, improves balance, stimulates digestive organs.',
   'Intermediate', 'Standing'),

  ('Bird of Paradise', 'Svarga Dvijasana', 'स्वर्ग द्विजासन', 'svarga = heaven, dvija = twice-born',
   'A standing pose with one leg extended while binding the arms around the standing leg.',
   'Improves balance, opens hips and shoulders, builds concentration and focus.',
   'Expert', 'Standing'),

  ('Revolved Bird of Paradise', 'Parivritta Svarga Dvijasana', 'परिवृत्त स्वर्ग द्विजासन', 'parivritta = revolved',
   'A twisted variation of Bird of Paradise with one leg extended and arms bound.',
   'Deepens hip and shoulder opening, improves balance and spinal mobility.',
   'Expert', 'Standing'),

  ('Goddess Pose', 'Utkata Konasana', 'उत्कट कोणासन', 'utkata = powerful, kona = angle',
   'A wide-legged squat with feet turned out and arms raised.',
   'Strengthens legs and core, opens hips and groin, builds endurance.',
   'Intermediate', 'Standing'),

  ('Gorilla Pose', 'Padahastasana', 'पादहस्तासन', 'pada = foot, hasta = hand',
   'A forward fold with hands underneath the feet, palms facing up.',
   'Deeply stretches hamstrings and spine, releases tension in neck and shoulders.',
   'Intermediate', 'Standing'),

  -- Seated Poses
  ('Archer Pose', 'Akarna Dhanurasana', 'आकर्ण धनुरासन', 'akarna = near the ear, dhanu = bow',
   'A seated pose mimicking drawing a bow and arrow.',
   'Stretches hamstrings and hips, improves focus and concentration.',
   'Expert', 'Seated'),

  ('Fire Log Pose', 'Agnistambhasana', 'अग्निस्तम्भासन', 'agni = fire, stambha = log',
   'Seated with shins stacked parallel like logs.',
   'Opens hips and outer thighs, improves posture, calms mind.',
   'Intermediate', 'Seated'),

  ('Embryo in Womb Pose', 'Garbha Pindasana', 'गर्भ पिण्डासन', 'garbha = womb, pinda = embryo',
   'A challenging pose where the arms are threaded through the legs in lotus.',
   'Massages internal organs, improves flexibility, builds concentration.',
   'Expert', 'Seated'),

  -- Supine Poses
  ('Banana Pose', 'Supta Nitambasana', 'सुप्त नितम्बासन', 'supta = reclining, nitamba = hip',
   'Lying on the back in a curved position resembling a banana.',
   'Stretches the sides of the body, releases spinal tension.',
   'Beginner', 'Supine'),

  ('Happy Baby Pose', 'Ananda Balasana', 'आनन्द बालासन', 'ananda = happy, bala = child',
   'Lying on the back holding the feet with knees drawn toward armpits.',
   'Opens hips and groin, releases lower back tension, calms mind.',
   'Beginner', 'Supine'),

  -- Arm Balances
  ('Eight Angle Pose', 'Astavakrasana', 'अष्टवक्रासन', 'asta = eight, vakra = curved',
   'An arm balance with legs wrapped around one arm and crossed at the ankles.',
   'Strengthens arms and core, improves balance and focus.',
   'Expert', 'Arm Balance'),

  ('Grasshopper Pose', 'Maksikanagasana', 'मक्षिकानागासन', 'maksika = fly, naga = serpent',
   'An arm balance with legs wrapped around upper arms.',
   'Strengthens arms and core, improves balance and concentration.',
   'Expert', 'Arm Balance'),

  ('Flying Lizard Pose', 'Uttana Pristhasana', 'उत्तान पृष्ठासन', 'uttana = extended, pristha = back',
   'An arm balance variation of Lizard pose with one leg extended.',
   'Strengthens upper body, opens hips, improves balance.',
   'Expert', 'Arm Balance'); 