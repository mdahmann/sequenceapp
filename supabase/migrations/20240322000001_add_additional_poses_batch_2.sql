-- Add additional poses to expand the database (Batch 2)
INSERT INTO poses (english_name, sanskrit_name_adapted, sanskrit_name, translation_name, pose_description, pose_benefits, difficulty_level, category_name)
VALUES
  -- Standing Poses
  ('Standing Foot Behind the Head', 'Durvasasana', 'दुर्वासासन', 'durvasa = sage Durvasa',
   'An advanced standing pose where one foot is placed behind the head.',
   'Extreme hip opening, improves balance and flexibility, builds mental focus.',
   'Expert', 'Standing'),

  ('Standing Half Bound Lotus Forward Bend', 'Ardha Baddha Padmottanasana', 'अर्धबद्धपद्मोत्तानासन', 'ardha = half, baddha = bound, padma = lotus',
   'Forward fold with one leg in half lotus position.',
   'Opens hips and shoulders, stretches spine and legs, improves balance.',
   'Expert', 'Standing'),

  ('Standing Splits', 'Urdhva Prasarita Eka Padasana', 'ऊर्ध्वप्रसारितैकपादासन', 'urdhva = upward, prasarita = spread, eka = one, pada = foot',
   'A standing forward bend with one leg lifted toward the ceiling.',
   'Stretches hamstrings and hip flexors, improves balance and core strength.',
   'Expert', 'Standing'),

  -- Seated Poses
  ('Both Feet Behind the Head', 'Dvi Pada Sirsasana', 'द्विपादशीर्षासन', 'dvi = two, pada = foot, sirsa = head',
   'An advanced seated pose with both feet placed behind the head.',
   'Extreme hip opening, spinal flexibility, deep concentration required.',
   'Expert', 'Seated'),

  ('Foot Behind the Head', 'Eka Pada Sirsasana', 'एकपादशीर्षासन', 'eka = one, pada = foot, sirsa = head',
   'A seated pose with one foot placed behind the head.',
   'Deep hip opening, improves flexibility, builds concentration.',
   'Expert', 'Seated'),

  ('Lord of the Fishes', 'Paripurna Matsyendrasana', 'परिपूर्णमत्स्येन्द्रासन', 'paripurna = full, matsyendra = lord of the fishes',
   'An advanced seated twist named after the sage Matsyendra.',
   'Deep spinal twist, massages internal organs, improves digestion.',
   'Expert', 'Seated'),

  -- Prone Poses
  ('Locust I', 'Salabhasana A', 'शलभासन अ', 'salabha = locust',
   'Lying face down, lift legs off the ground while keeping arms along the body.',
   'Strengthens back muscles, improves posture, stimulates digestive organs.',
   'Intermediate', 'Prone'),

  ('Locust II', 'Salabhasana B', 'शलभासन ब', 'salabha = locust',
   'Variation of Locust with arms extended forward.',
   'Strengthens entire back body, improves posture and balance.',
   'Intermediate', 'Prone'),

  ('Locust III', 'Salabhasana C', 'शलभासन स', 'salabha = locust',
   'Advanced variation of Locust with hands clasped behind back.',
   'Maximum back strengthening, opens chest, improves posture.',
   'Expert', 'Prone'),

  -- Arm Balances
  ('Peacock', 'Mayurasana', 'मयूरासन', 'mayura = peacock',
   'Balance the entire body on the elbows with legs extended back.',
   'Strengthens core and arms, improves digestion, builds focus.',
   'Expert', 'Arm Balance'),

  ('Rooster', 'Kukkutasana', 'कुक्कुटासन', 'kukkuta = rooster',
   'An arm balance in lotus position with hands pressed into the floor.',
   'Strengthens arms and wrists, improves balance, requires deep concentration.',
   'Expert', 'Arm Balance'),

  ('Scale', 'Tolasana', 'तोलासन', 'tola = scale',
   'Lift the entire body off the ground while seated in lotus position.',
   'Builds arm and core strength, improves balance and focus.',
   'Expert', 'Arm Balance'),

  ('Shoulder Pressing', 'Bhujapidasana', 'भुजपीडासन', 'bhuja = arm, pida = pressure',
   'An arm balance with thighs resting on upper arms.',
   'Strengthens arms and core, improves balance and concentration.',
   'Expert', 'Arm Balance'); 