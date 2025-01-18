-- Add more poses to expand the database
INSERT INTO poses (english_name, sanskrit_name_adapted, sanskrit_name, translation_name, pose_description, pose_benefits, difficulty_level, category_name)
VALUES
  -- Standing Poses
  ('Warrior III', 'Virabhadrasana III', 'वीरभद्रासन III', 'Warrior Pose III', 'A standing balancing pose that strengthens the legs and core while improving balance and posture.', 'Strengthens legs, core, and back; improves balance and posture; builds focus and concentration.', 'Intermediate', 'Standing'),
  ('Half Moon Pose', 'Ardha Chandrasana', 'अर्धचन्द्रासन', 'Half Moon Pose', 'A standing balancing pose that opens the hips and strengthens the legs and core.', 'Opens hips and hamstrings; strengthens legs and core; improves balance and coordination.', 'Intermediate', 'Standing'),
  ('Eagle Pose', 'Garudasana', 'गरुडासन', 'Eagle Pose', 'A standing balancing pose that strengthens the legs and improves focus.', 'Improves balance and concentration; strengthens legs and core; opens shoulders and hips.', 'Intermediate', 'Standing'),

  -- Seated Poses
  ('Fire Log Pose', 'Agnistambhasana', 'अग्निस्तम्भासन', 'Fire Log Pose', 'A seated pose that deeply opens the hips and stretches the outer thighs.', 'Opens hips and outer thighs; improves posture; calms the mind.', 'Intermediate', 'Seated'),
  ('Bound Angle Pose', 'Baddha Konasana', 'बद्धकोणासन', 'Bound Angle Pose', 'A seated pose that opens the hips and groin.', 'Opens hips and groin; improves circulation; calms the nervous system.', 'Beginner', 'Seated'),
  ('Cow Face Pose', 'Gomukhasana', 'गोमुखासन', 'Cow Face Pose', 'A seated pose that opens the shoulders and hips.', 'Opens shoulders and hips; improves posture; stretches arms and legs.', 'Intermediate', 'Seated'),

  -- Backbends
  ('Wheel Pose', 'Urdhva Dhanurasana', 'ऊर्ध्वधनुरासन', 'Upward Bow Pose', 'A deep backbend that opens the chest and strengthens the back.', 'Opens chest and shoulders; strengthens back and arms; energizes the body.', 'Expert', 'Backbend'),
  ('Camel Pose', 'Ustrasana', 'उष्ट्रासन', 'Camel Pose', 'A kneeling backbend that opens the chest and stretches the front body.', 'Opens chest and shoulders; improves posture; stimulates organs.', 'Intermediate', 'Backbend'),
  ('Bridge Pose', 'Setu Bandha Sarvangasana', 'सेतुबन्धसर्वाङ्गासन', 'Bridge Pose', 'A gentle backbend that strengthens the back and opens the chest.', 'Strengthens back and glutes; opens chest; calms the mind.', 'Beginner', 'Backbend'),

  -- Forward Folds
  ('Wide-Legged Forward Fold', 'Prasarita Padottanasana', 'प्रसारितपादोत्तानासन', 'Wide-Legged Forward Bend', 'A standing forward fold that stretches the legs and back.', 'Stretches legs and back; calms the mind; improves circulation.', 'Beginner', 'Forward Fold'),
  ('Seated Forward Fold', 'Paschimottanasana', 'पश्चिमोत्तानासन', 'Seated Forward Bend', 'A seated forward fold that stretches the back and hamstrings.', 'Stretches back and hamstrings; calms the nervous system; improves digestion.', 'Beginner', 'Forward Fold'),
  ('Head to Knee Pose', 'Janu Sirsasana', 'जानुशीर्षासन', 'Head to Knee Pose', 'A seated forward fold that stretches one leg at a time.', 'Stretches hamstrings; massages organs; calms the mind.', 'Intermediate', 'Forward Fold'),

  -- Twists
  ('Revolved Triangle Pose', 'Parivrtta Trikonasana', 'परिवृत्तत्रिकोणासन', 'Revolved Triangle Pose', 'A standing twist that stretches and strengthens the entire body.', 'Strengthens legs and core; improves spinal mobility; detoxifies organs.', 'Expert', 'Twist'),
  ('Half Lord of the Fishes Pose', 'Ardha Matsyendrasana', 'अर्धमत्स्येन्द्रासन', 'Half Fish Lord Pose', 'A seated spinal twist that improves digestion and spinal mobility.', 'Improves digestion; increases spinal mobility; detoxifies organs.', 'Intermediate', 'Twist'),
  ('Revolved Head to Knee Pose', 'Parivrtta Janu Sirsasana', 'परिवृत्तजानुशीर्षासन', 'Revolved Head to Knee Pose', 'A seated forward fold with a twist.', 'Stretches side body; improves digestion; increases spinal mobility.', 'Expert', 'Twist'),

  -- Inversions
  ('Headstand', 'Sirsasana', 'शीर्षासन', 'Head Stand', 'An advanced inversion that builds strength and balance.', 'Builds strength and balance; improves circulation; calms the mind.', 'Expert', 'Inversion'),
  ('Shoulder Stand', 'Sarvangasana', 'सर्वाङ्गासन', 'All Limbs Pose', 'An inversion that calms the nervous system and improves circulation.', 'Calms nervous system; improves circulation; strengthens shoulders.', 'Intermediate', 'Inversion'),
  ('Plow Pose', 'Halasana', 'हलासन', 'Plow Pose', 'An inversion that stretches the back and calms the mind.', 'Stretches back and shoulders; calms nervous system; improves flexibility.', 'Intermediate', 'Inversion'),

  -- Arm Balances
  ('Crow Pose', 'Bakasana', 'बकासन', 'Crow Pose', 'An arm balance that builds core strength and balance.', 'Builds core strength; improves balance; increases focus.', 'Intermediate', 'Arm Balance'),
  ('Side Crow Pose', 'Parsva Bakasana', 'पार्श्वबकासन', 'Side Crow Pose', 'A twisting arm balance that builds strength and focus.', 'Strengthens arms and core; improves balance; increases focus.', 'Expert', 'Arm Balance'),
  ('Eight Angle Pose', 'Astavakrasana', 'अष्टवक्रासन', 'Eight Angle Pose', 'An advanced arm balance that requires strength and flexibility.', 'Builds strength and flexibility; improves balance; increases focus.', 'Expert', 'Arm Balance'),

  -- Core Work
  ('Boat Pose', 'Navasana', 'नावासन', 'Boat Pose', 'A core strengthening pose that builds abdominal strength.', 'Strengthens core and hip flexors; improves balance; builds focus.', 'Intermediate', 'Core'),
  ('Side Plank Pose', 'Vasisthasana', 'वसिष्ठासन', 'Side Plank Pose', 'A pose that strengthens the core and arms.', 'Strengthens core and arms; improves balance; builds focus.', 'Intermediate', 'Core'),
  ('Scale Pose', 'Tolasana', 'तोलासन', 'Scale Pose', 'An advanced core strengthening pose that requires arm and core strength.', 'Builds core and arm strength; improves balance; increases focus.', 'Expert', 'Core'); 