const fs = require('fs');
const path = require('path');
const nodeFetch = require('node-fetch');

interface YogaPose {
  id: number;
  english_name: string;
  sanskrit_name_adapted: string;
  sanskrit_name: string;
  translation_name: string;
  pose_description: string;
  pose_benefits: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Expert';
  category_name: string;
}

interface RawYogaPose {
  id: number;
  sanskrit_name: string;
  english_name: string;
  img_url: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const poseDetails: Record<string, { description: string; benefits: string; translation?: string }> = {
  'Boat': {
    description: 'Balance on the sitting bones with legs lifted, forming a V-shape with the body. Arms parallel to the ground or reaching toward the feet.',
    benefits: 'Strengthens core muscles, improves balance and digestion, stimulates kidneys, thyroid and prostate glands, helps relieve stress.',
    translation: 'nava = boat, asana = pose'
  },
  'Half-Boat': {
    description: 'Similar to Boat Pose but with bent knees, shins parallel to the ground, forming a less intense V-shape.',
    benefits: 'Builds core strength, improves balance and concentration, helps relieve stress, gentler on the lower back.',
    translation: 'ardha = half, nava = boat, asana = pose'
  },
  'Bow': {
    description: 'Lie on the belly, bend knees, reach back to hold ankles, lift chest and legs to form a bow shape.',
    benefits: 'Opens chest and shoulders, strengthens back muscles, improves posture and flexibility, stimulates digestive organs.',
    translation: 'dhanu = bow, asana = pose'
  },
  'Bridge': {
    description: 'Lie on the back, bend knees, feet flat on the ground. Lift hips, rolling the spine off the floor, and clasp hands beneath the pelvis.',
    benefits: 'Stretches spine and chest, strengthens back muscles, improves posture, can help relieve anxiety and fatigue.',
    translation: 'setu bandha = bridge lock, sarvanga = all limbs, asana = pose'
  },
  'Butterfly': {
    description: 'Sitting with soles of feet together, knees bent out to sides, hands holding feet or ankles. Spine straight, gently press knees toward ground.',
    benefits: 'Opens hips and groin, improves flexibility in inner thighs, can help with menstruation and sciatica.',
    translation: 'baddha = bound, kona = angle, asana = pose'
  },
  'Camel': {
    description: 'Kneel with knees hip-width apart, reach back to hold heels, arch spine and lift chest toward ceiling.',
    benefits: 'Opens chest and shoulders, improves posture, stimulates digestive and endocrine systems, increases energy.',
    translation: 'ustra = camel, asana = pose'
  },
  'Cat': {
    description: 'Start on hands and knees, round spine toward ceiling while dropping head and tailbone.',
    benefits: 'Improves spine flexibility, relieves back pain, calms mind, good for stress relief.',
    translation: 'marjari = cat, asana = pose'
  },
  'Cow': {
    description: 'Start on hands and knees, arch back while lifting head and tailbone.',
    benefits: 'Improves posture and balance, coordinates breathing, calms mind, massages spine.',
    translation: 'bitila = cow, asana = pose'
  },
  'Chair': {
    description: 'Stand with feet together, bend knees and sink hips as if sitting in a chair, arms raised overhead.',
    benefits: 'Strengthens thighs, calves, and ankles, stretches chest and shoulders, stimulates heart and diaphragm.',
    translation: 'utkata = fierce, asana = pose'
  },
  'Child\'s Pose': {
    description: 'Kneel and sit back on heels, fold forward with arms extended or by sides, forehead resting on floor.',
    benefits: 'Gently stretches back, hips, and thighs, calms mind, relieves stress and fatigue.',
    translation: 'bala = child, asana = pose'
  },
  'Corpse': {
    description: 'Lie flat on back with arms and legs extended, palms facing up, completely relaxed.',
    benefits: 'Calms central nervous system, promotes deep relaxation, reduces stress and anxiety, improves sleep.',
    translation: 'siva = corpse, asana = pose'
  },
  'Crescent Lunge': {
    description: 'Step one foot forward into a lunge, back heel lifted. Raise arms overhead, back knee off the ground.',
    benefits: 'Stretches hip flexors and quadriceps, strengthens legs, improves balance and stability.',
    translation: 'alana = crescent moon, asana = pose'
  },
  'Crow': {
    description: 'Squat with hands planted on the ground, knees resting on upper arms. Shift weight forward until feet lift off ground.',
    benefits: 'Strengthens arms, wrists, and core, improves balance and focus, builds confidence.',
    translation: 'baka = crow, asana = pose'
  },
  'Downward-Facing Dog': {
    description: 'Form an inverted V-shape with the body, hands and feet pressing into the ground, hips lifted toward ceiling.',
    benefits: 'Stretches entire back body, strengthens arms and legs, calms mind, relieves stress.',
    translation: 'adho = downward, mukha = face, svana = dog, asana = pose'
  },
  'Eagle': {
    description: 'Stand on one leg, other leg wrapped around standing leg. Arms wrapped in front of face.',
    benefits: 'Improves balance and focus, stretches shoulders and hips, strengthens legs.',
    translation: 'garuda = eagle, asana = pose'
  },
  'Handstand': {
    description: 'Balance on hands with body inverted, legs straight up toward ceiling.',
    benefits: 'Builds upper body strength, improves balance and focus, increases confidence.',
    translation: 'adho = downward, mukha = face, vrksa = tree, asana = pose'
  },
  'Warrior One': {
    description: 'Lunge with back foot at 45-degree angle, front knee bent. Arms raised overhead, chest facing forward.',
    benefits: 'Strengthens legs and core, opens hips and chest, improves focus and stability.',
    translation: 'virabhadra = warrior, asana = pose'
  },
  'Warrior Two': {
    description: 'Lunge with back foot parallel to back edge of mat. Arms extended to sides, gaze over front hand.',
    benefits: 'Strengthens legs, opens hips and chest, improves concentration and stamina.',
    translation: 'virabhadra = warrior, asana = pose'
  },
  'Warrior Three': {
    description: 'Balance on one leg, torso parallel to ground, back leg lifted. Arms can be in various positions.',
    benefits: 'Strengthens legs and core, improves balance and posture, builds focus.',
    translation: 'virabhadra = warrior, asana = pose'
  },
  'Tree': {
    description: 'Stand on one leg, other foot pressed into inner thigh or calf. Arms raised overhead like branches.',
    benefits: 'Improves balance and focus, strengthens legs and core, calms mind.',
    translation: 'vrksa = tree, asana = pose'
  },
  'Triangle': {
    description: 'Stand with legs wide, front foot facing forward. Hinge at hip to reach front hand to shin, other arm to ceiling.',
    benefits: 'Stretches legs, hips, and spine, strengthens core, improves balance.',
    translation: 'tri = three, kona = angle, asana = pose'
  },
  'Dolphin': {
    description: 'Similar to Downward-Facing Dog but on forearms instead of hands. Elbows shoulder-width apart, forearms pressed into mat.',
    benefits: 'Strengthens shoulders and core, stretches spine and hamstrings, calms mind, good preparation for headstand.',
    translation: 'ardha = half, pincha = feather, mayura = peacock, asana = pose'
  },
  'Extended Hand to Toe': {
    description: 'Standing on one leg, hold big toe of other foot and extend leg forward. Can also be done to the side.',
    benefits: 'Improves balance and concentration, stretches hamstrings and calves, strengthens legs.',
    translation: 'utthita = extended, hasta = hand, pada = foot, angusta = big toe, asana = pose'
  },
  'Extended Side Angle': {
    description: 'From Warrior II, lower front arm to rest on thigh or floor, extend other arm over ear.',
    benefits: 'Stretches sides of body, strengthens legs, improves stamina and concentration.',
    translation: 'utthita = extended, parsva = side, kona = angle, asana = pose'
  },
  'Forearm Stand': {
    description: 'Balance on forearms with legs extended up toward ceiling. Similar to handstand but on forearms.',
    benefits: 'Strengthens shoulders and core, improves balance and focus, builds confidence.',
    translation: 'pincha = feather, mayura = peacock, asana = pose'
  },
  'Forward Bend with Shoulder Opener': {
    description: 'Forward fold with hands clasped behind back, arms lifted away from body.',
    benefits: 'Stretches hamstrings and spine, opens shoulders and chest, calms nervous system.',
    translation: 'uttana = intense stretch, asana = pose'
  },
  'Half-Moon': {
    description: 'Balance on one hand and foot, other leg extended parallel to ground, top arm reaching to ceiling.',
    benefits: 'Improves balance and coordination, strengthens legs and core, opens hips and chest.',
    translation: 'ardha = half, chandra = moon, asana = pose'
  },
  'Low Lunge': {
    description: 'Step one foot forward between hands, lower back knee to ground. Can keep hands on ground or lift torso.',
    benefits: 'Stretches hip flexors and quadriceps, strengthens legs, improves balance.',
    translation: 'anjaneya = devotee of Lord Rama, asana = pose'
  },
  'Pigeon': {
    description: 'From all fours, bring one knee forward behind wrist, extend back leg. Fold forward or stay upright.',
    benefits: 'Opens hip flexors and rotators, stretches thighs and groin, releases tension.',
    translation: 'kapota = pigeon, asana = pose'
  },
  'King Pigeon': {
    description: 'From Pigeon pose, bend back knee and hold foot with hands, lifting chest toward ceiling.',
    benefits: 'Deep hip and back bend, opens chest and shoulders, improves flexibility.',
    translation: 'eka = one, pada = foot, raja = king, kapota = pigeon, asana = pose'
  },
  'Plank': {
    description: 'Hold body in straight line from head to heels, supported by hands and toes.',
    benefits: 'Strengthens core, arms, and wrists, improves posture and balance.',
    translation: 'phalaka = plank, asana = pose'
  },
  'Plow': {
    description: 'Lie on back, lift legs over head until toes touch floor behind head.',
    benefits: 'Stretches spine and shoulders, calms nervous system, helps with insomnia.',
    translation: 'hala = plow, asana = pose'
  },
  'Pyramid': {
    description: 'Stand with one foot forward, back foot at angle. Fold forward over front leg with straight spine.',
    benefits: 'Stretches hamstrings and calves, improves balance, calms mind.',
    translation: 'parsvottana = intense side stretch, asana = pose'
  },
  'Reverse Warrior': {
    description: 'From Warrior II, back bend while sliding back hand down leg, front arm reaching overhead.',
    benefits: 'Stretches sides of body, strengthens legs, improves flexibility and balance.',
    translation: 'viparita = reversed, virabhadra = warrior, asana = pose'
  },
  'Seated Forward Bend': {
    description: 'Sit with legs extended, fold forward from hips, reaching for feet.',
    benefits: 'Stretches entire back body, calms mind, improves digestion.',
    translation: 'paschi = west, uttana = intense stretch, asana = pose'
  },
  'Lotus': {
    description: 'Sit cross-legged with each foot placed on opposite thigh.',
    benefits: 'Opens hips, calms mind, improves posture and concentration.',
    translation: 'padma = lotus, asana = pose'
  },
  'Half Lord of the Fishes': {
    description: 'Sit with one leg crossed, other foot outside opposite thigh. Twist toward raised knee.',
    benefits: 'Improves spine mobility, aids digestion, energizes body.',
    translation: 'ardha = half, matsya = fish, indra = ruler, asana = pose'
  },
  'Shoulder Stand': {
    description: 'Lie on back, lift legs and torso, support back with hands, balance on shoulders.',
    benefits: 'Stimulates thyroid, improves circulation, calms nervous system.',
    translation: 'salamba = supported, sarvanga = all limbs, asana = pose'
  },
  'Side Plank': {
    description: 'From plank, rotate onto one hand and edge of feet, lift other arm to ceiling.',
    benefits: 'Strengthens arms, wrists, and core, improves balance and focus.',
    translation: 'vasistha = sage, asana = pose'
  },
  'Sphinx': {
    description: 'Lie on belly, prop upper body on forearms, legs extended behind.',
    benefits: 'Strengthens spine, opens chest and lungs, improves posture.',
    translation: 'salamba = supported, bhujanga = cobra, asana = pose'
  },
  'Splits': {
    description: 'Extend legs in opposite directions until they form a straight line on the ground.',
    benefits: 'Increases flexibility in hips and hamstrings, improves balance.',
    translation: 'hanumat = monkey deity, asana = pose'
  },
  'Squat': {
    description: 'Lower hips toward ground with feet flat, keeping spine straight.',
    benefits: 'Opens hips and groin, strengthens legs, improves digestion.',
    translation: 'mala = garland, asana = pose'
  },
  'Standing Forward Bend': {
    description: 'Fold forward from hips with straight legs, bringing head toward shins.',
    benefits: 'Stretches entire back body, calms nervous system, relieves stress.',
    translation: 'uttana = intense stretch, asana = pose'
  },
  'Crescent Moon': {
    description: 'Stand with arms overhead, interlace fingers and stretch to one side.',
    benefits: 'Stretches sides of body, improves flexibility, energizes body.',
    translation: 'ashta = eight, chandra = moon, asana = pose'
  },
  'Side Splits': {
    description: 'Sit with legs extended out to sides as wide as possible.',
    benefits: 'Opens hips and groin, improves flexibility, builds strength.',
    translation: 'upavistha = seated, kona = angle, asana = pose'
  },
  'Upward-Facing Dog': {
    description: 'Lie on belly, straighten arms to lift chest and hips off ground, thighs lifted.',
    benefits: 'Strengthens spine and arms, opens chest and lungs, improves posture.',
    translation: 'urdhva = upward, mukha = face, svana = dog, asana = pose'
  },
  'Wild Thing': {
    description: 'From side plank, flip over by lifting hips and reaching top arm back to floor.',
    benefits: 'Opens chest and shoulders, strengthens arms and core, energizes body.',
    translation: 'camatkar = miracle, asana = pose'
  },
  'Wheel': {
    description: 'Lie on back, bend knees with feet flat on ground. Place hands by ears, fingers pointing toward shoulders. Press into hands and feet to lift entire body off the ground, arching into a backbend.',
    benefits: 'Strengthens arms, wrists, legs, buttocks, abs, and spine. Stretches chest and lungs. Increases energy and counteracts depression. Therapeutic for asthma, back pain, infertility, and osteoporosis.',
    translation: 'urdhva = upward, dhanu = bow, asana = pose'
  },
  'Mountain': {
    description: 'Stand tall with feet together or hip-width apart, arms at sides or overhead. Ground down through all four corners of feet, engage leg muscles, lengthen spine.',
    benefits: 'Improves posture, strengthens thighs, knees, and ankles, firms abdomen and buttocks, relieves sciatica, reduces flat feet.',
    translation: 'tada = mountain, asana = pose'
  },
  'Fish': {
    description: 'Lie on back, lift chest and arch upper back, support weight on elbows and forearms. Head can rest on floor or lift slightly.',
    benefits: 'Opens chest and throat, stretches front body and neck, strengthens upper back, helps with respiratory ailments.',
    translation: 'matsya = fish, asana = pose'
  },
  'Cobra': {
    description: 'Lie on belly, place hands under shoulders. Press into hands to lift chest off ground, keeping lower body and pelvis grounded.',
    benefits: 'Strengthens spine, opens chest and lungs, helps relieve stress and fatigue, beneficial for asthma.',
    translation: 'bhujanga = serpent, asana = pose'
  },
  'Gate': {
    description: 'Kneel with right leg extended to side, reach right arm overhead and side bend left. Left hand rests on left leg.',
    benefits: 'Stretches side body, strengthens core, opens hips and shoulders, improves flexibility.',
    translation: 'parigha = gate, asana = pose'
  },
  'Locust': {
    description: 'Lie face down, lift chest, arms, and legs off ground simultaneously. Arms alongside body, palms facing up.',
    benefits: 'Strengthens back muscles, buttocks, and legs, improves posture, stimulates abdominal organs.',
    translation: 'salabha = locust, asana = pose'
  },
  'Staff': {
    description: 'Sit with legs extended straight in front, flex feet, press thighs down, lengthen spine, hands beside hips.',
    benefits: 'Strengthens back muscles, improves posture, stretches shoulders and chest, calms mind.',
    translation: 'danda = staff, asana = pose'
  },
  'Wind-Relieving': {
    description: 'Lie on back, hug knees to chest. Can be done with one leg at a time or both legs together.',
    benefits: 'Massages abdominal organs, aids digestion, relieves gas, stretches lower back and spine.',
    translation: 'pawan = wind, mukta = relief, asana = pose'
  },
  'Happy Baby': {
    description: 'Lie on back, bend knees toward armpits, grab outer edges of feet. Rock gently side to side.',
    benefits: 'Opens hips and groin, calms mind, relieves stress and fatigue, gently stretches spine.',
    translation: 'ananda = happy, bala = child, asana = pose'
  },
  'Lizard': {
    description: 'From low lunge, bring both hands inside front foot. Option to lower onto forearms for deeper stretch.',
    benefits: 'Opens hip flexors and hamstrings, improves flexibility, prepares for splits.',
    translation: 'utthan = stretched out, pristhasana = lizard pose'
  },
  'Eight-Angle': {
    description: 'Balance on hands with legs wrapped around one arm, feet crossed. Body parallel to ground.',
    benefits: 'Strengthens arms, wrists, and core, improves balance and concentration, builds confidence.',
    translation: 'asta = eight, vakra = bent, curved, asana = pose'
  },
  'Firefly': {
    description: 'Balance on hands with legs extended straight out to sides, parallel to ground.',
    benefits: 'Strengthens arms, wrists, and core, improves balance and focus, opens hips and groins.',
    translation: 'tittibha = firefly, asana = pose'
  },
  'Grasshopper': {
    description: 'Deep twist with legs wrapped around one arm, balanced on hands.',
    benefits: 'Strengthens arms and core, improves balance, opens hips and twists spine.',
    translation: 'maksika = grasshopper, asana = pose'
  },
  'Heron': {
    description: 'Seated pose with one leg extended straight up, hands holding foot, other leg bent or straight.',
    benefits: 'Stretches hamstrings deeply, improves balance and concentration, strengthens core.',
    translation: 'krounchasana = heron pose'
  },
  'Peacock': {
    description: 'Balance entire body parallel to ground on bent arms, legs straight and together.',
    benefits: 'Strengthens arms, wrists, and core, improves balance and focus, stimulates digestive organs.',
    translation: 'mayura = peacock, asana = pose'
  },
  'Scale': {
    description: 'Seated with hands beside hips, lift entire body off ground, legs straight or bent.',
    benefits: 'Strengthens arms, wrists, and core, improves balance and focus.',
    translation: 'tolasana = scale pose'
  },
  'Scorpion': {
    description: 'From forearm stand or handstand, bend knees and arch back to bring feet toward head.',
    benefits: 'Strengthens arms and core, improves balance and flexibility, opens chest and spine.',
    translation: 'vrischika = scorpion, asana = pose'
  },
  'Side Crane': {
    description: 'Balance on hands with both legs stacked and resting on one upper arm.',
    benefits: 'Strengthens arms, wrists, and core, improves balance and focus, opens hips.',
    translation: 'parsva = side, bakasana = crane pose'
  },
  'Tortoise': {
    description: 'Forward fold with arms threaded under legs and behind back, chest close to thighs.',
    benefits: 'Opens hips and shoulders, calms mind, massages internal organs.',
    translation: 'kurma = tortoise, asana = pose'
  },
  'Upward Bow': {
    description: 'From wheel pose, walk hands and feet closer together, straighten arms and legs.',
    benefits: 'Strengthens arms and legs, opens chest and shoulders, energizes body and mind.',
    translation: 'urdhva = upward, dhanurasana = bow pose'
  },
  'Bound Angle': {
    description: 'Seated with soles of feet together, knees wide, hold feet and fold forward.',
    benefits: 'Opens hips and groins, stretches inner thighs, calms mind.',
    translation: 'baddha = bound, kona = angle, asana = pose'
  },
  'Revolved Head to Knee': {
    description: 'Seated with one leg extended, other foot at inner thigh. Twist torso and fold over extended leg.',
    benefits: 'Stretches hamstrings and spine, massages internal organs, calms nervous system.',
    translation: 'parivrtta = revolved, janu = knee, sirsa = head, asana = pose'
  },
  'Lord of the Dance': {
    description: 'Standing on one leg, hold opposite foot behind you and arch back, free arm reaching forward.',
    benefits: 'Improves balance and focus, strengthens legs and ankles, opens chest and shoulders.',
    translation: 'nata = dancer, raja = king, asana = pose'
  },
  'Sage Marichi': {
    description: 'Seated with one leg extended, other knee bent. Twist torso, wrapping opposite arm around bent knee.',
    benefits: 'Improves spinal mobility, aids digestion, stretches shoulders and hips.',
    translation: 'marichi = ray of light, asana = pose'
  },
  'Noose': {
    description: 'Squat with feet together, twist to wrap arms around legs and back.',
    benefits: 'Opens hips and shoulders, improves digestion, stretches spine and ankles.',
    translation: 'pasa = noose, asana = pose'
  },
  'Garland': {
    description: 'Deep squat with feet close together, hands in prayer at heart.',
    benefits: 'Opens hips and groins, stretches ankles and back, improves digestion.',
    translation: 'mala = garland, asana = pose'
  },
  'Embryo': {
    description: 'Lie on back, hug knees to chest, tuck chin to chest.',
    benefits: 'Calms mind, relieves stress, gently stretches back and neck.',
    translation: 'garbha = womb, pinda = embryo, asana = pose'
  },
  'Sleeping Thunderbolt': {
    description: 'Kneel and sit back on heels, then lie back with arms overhead.',
    benefits: 'Stretches quadriceps and hip flexors, improves digestion, calms mind.',
    translation: 'supta = sleeping, vajra = thunderbolt, asana = pose'
  },
  'Supported Headstand': {
    description: 'Balance on crown of head and forearms, legs extended straight up.',
    benefits: 'Builds strength and confidence, improves circulation, calms mind.',
    translation: 'salamba = supported, sirsa = head, asana = pose'
  },
  'Feathered Peacock': {
    description: 'Handstand variation with bent arms, similar to forearm stand but on straight arms.',
    benefits: 'Strengthens upper body, improves balance and focus, builds confidence.',
    translation: 'pincha = feather, mayura = peacock, asana = pose'
  },
  'Fallen Angel': {
    description: 'Side crow variation with bottom hip lowered to ground, legs extended.',
    benefits: 'Strengthens arms and core, improves balance, opens hips.',
    translation: 'devaduuta = angel, patita = fallen, asana = pose'
  },
  'Flying Pigeon': {
    description: 'From standing split, bend front leg and place hands on ground, hook bent leg on upper arm.',
    benefits: 'Strengthens arms and core, improves balance, opens hips.',
    translation: 'eka = one, pada = foot, galavasana = flying crow pose'
  },
  'Dragonfly': {
    description: 'Seated with legs spread wide, hands between legs, lift hips off ground.',
    benefits: 'Strengthens core and arms, opens hips and hamstrings, improves balance.',
    translation: 'maksikanagasana = dragonfly pose'
  },
  'Compass': {
    description: 'Seated with one leg extended up and over shoulder, other leg bent.',
    benefits: 'Opens hips and shoulders, improves flexibility, strengthens core.',
    translation: 'parivrtta = revolved, surya = sun, yantrasana = compass pose'
  },
  'Elephant Trunk': {
    description: 'Arm balance with legs wrapped around one arm, similar to side crow.',
    benefits: 'Strengthens arms and core, improves balance, opens hips.',
    translation: 'eka = one, hasta = hand, bhuja = arm, sirsasana = head pose'
  },
  'Wounded Peacock': {
    description: 'One-armed peacock pose, other arm behind back.',
    benefits: 'Extreme arm and core strength, improves balance and focus.',
    translation: 'eka = one, hasta = hand, mayurasana = peacock pose'
  },
  'Visvamitrasana': {
    description: 'Complex pose combining side plank, split, and twist.',
    benefits: 'Strengthens entire body, improves balance and flexibility, opens hips.',
    translation: 'visvamitra = sage name, asana = pose'
  },
  'Koundinyasana': {
    description: 'Arm balance with legs in splits position, chest parallel to ground.',
    benefits: 'Strengthens arms and core, improves balance, opens hips and hamstrings.',
    translation: 'koundinya = sage name, asana = pose'
  },
  'Yoganidrasana': {
    description: 'Deep forward fold with legs behind head, arms bound around back.',
    benefits: 'Extreme flexibility, calms nervous system, opens entire body.',
    translation: 'yoga = union, nidra = sleep, asana = pose'
  },
  'Reclined Bound Angle': {
    description: 'Lie on back with soles of feet together, knees wide, arms alongside body.',
    benefits: 'Opens hips and groins, relieves stress, aids in recovery and relaxation.',
    translation: 'supta = reclined, baddha = bound, kona = angle, asana = pose'
  },
  'Reclined Hero': {
    description: 'From hero pose (sitting between heels), lie back with arms overhead.',
    benefits: 'Stretches quadriceps and hip flexors deeply, improves digestion, opens chest.',
    translation: 'supta = reclined, vira = hero, asana = pose'
  },
  'Reclined Spinal Twist': {
    description: 'Lie on back, hug one knee to chest, then cross it over body while keeping shoulders grounded.',
    benefits: 'Releases spinal tension, aids digestion, calms nervous system.',
    translation: 'jathara = stomach, parivartanasana = revolved pose'
  },
  'Sage Pose': {
    description: 'Sit with one leg extended, other foot crossed over and placed outside extended leg\'s thigh.',
    benefits: 'Stretches outer hips, improves spinal mobility, aids digestion.',
    translation: 'vasistha = sage, asana = pose'
  },
  'Side-Reclining Leg Lift': {
    description: 'Lie on side, support head with bottom hand, lift top leg toward ceiling.',
    benefits: 'Strengthens outer hips and thighs, improves balance, tones legs.',
    translation: 'anantasana = infinite pose'
  },
  'Upward Plank': {
    description: 'From seated, place hands behind hips, lift hips and chest toward ceiling.',
    benefits: 'Strengthens arms, wrists, and core, opens chest and shoulders.',
    translation: 'purvottana = upward plank, asana = pose'
  },
  'Wide-Legged Forward Bend': {
    description: 'Stand with feet wide apart, fold forward from hips, bringing crown of head toward floor.',
    benefits: 'Stretches inner legs and spine, calms mind, relieves mild depression.',
    translation: 'prasarita = spread out, pada = foot, uttana = intense stretch, asana = pose'
  },
  'Dolphin Plank': {
    description: 'Similar to plank pose but forearms on ground instead of hands.',
    benefits: 'Strengthens core and shoulders, prepares for forearm stand.',
    translation: 'makara = crocodile, asana = pose'
  },
  'Half Frog': {
    description: 'Lie on belly, bend one knee and hold foot near buttock.',
    benefits: 'Stretches quadriceps and hip flexors, improves posture.',
    translation: 'ardha = half, bheka = frog, asana = pose'
  },
  'Supine Hand to Big Toe': {
    description: 'Lie on back, extend one leg toward ceiling while holding big toe.',
    benefits: 'Stretches hamstrings and calves, improves circulation.',
    translation: 'supta = reclined, hasta = hand, padangusthasana = big toe pose'
  },
  'Seated Wide Angle': {
    description: 'Sit with legs spread wide, fold forward from hips.',
    benefits: 'Opens inner thighs and groins, stretches spine, calms mind.',
    translation: 'upavistha = seated, kona = angle, asana = pose'
  },
  'Goddess': {
    description: 'Stand with feet wide, knees bent, arms raised with elbows bent.',
    benefits: 'Strengthens legs and core, opens hips and chest, builds energy.',
    translation: 'utkata = powerful, konasana = angle pose'
  },
  'Reverse Table': {
    description: 'From seated, place hands behind hips, lift hips forming table shape.',
    benefits: 'Strengthens arms and core, opens chest and shoulders.',
    translation: 'purvottana = upward plank, asana = pose'
  },
  'Deer': {
    description: 'Sit with one leg bent in front, other leg bent behind.',
    benefits: 'Opens hips gently, good for meditation, calms mind.',
    translation: 'mrga = deer, asana = pose'
  },
  'Crocodile': {
    description: 'Lie face down with chin resting on crossed arms.',
    benefits: 'Relaxes spine and neck, aids digestion, calms nervous system.',
    translation: 'makara = crocodile, asana = pose'
  }
};

function getDifficultyLevel(poseName: string): 'Beginner' | 'Intermediate' | 'Expert' {
  const beginnerPoses = [
    'Mountain', 'Child', 'Corpse', 'Cat', 'Cow', 'Downward-Facing Dog', 'Tree',
    'Staff', 'Wind-Relieving', 'Happy Baby', 'Embryo', 'Reclined Bound Angle',
    'Crocodile', 'Deer'
  ];
  
  const expertPoses = [
    'Crow', 'Handstand', 'Forearm Stand', 'King Pigeon', 'Splits', 'Wheel',
    'Eight-Angle', 'Firefly', 'Grasshopper', 'Peacock', 'Scorpion', 'Side Crane',
    'Supported Headstand', 'Feathered Peacock', 'Fallen Angel', 'Flying Pigeon',
    'Dragonfly', 'Compass', 'Elephant Trunk', 'Wounded Peacock', 'Visvamitrasana',
    'Koundinyasana', 'Yoganidrasana'
  ];
  
  return beginnerPoses.some(pose => poseName.includes(pose)) ? 'Beginner' :
         expertPoses.some(pose => poseName.includes(pose)) ? 'Expert' :
         'Intermediate';
}

function getCategoryName(poseName: string): string {
  const categories = {
    'Standing': [
      'Mountain', 'Tree', 'Triangle', 'Warrior', 'Eagle', 'Standing Forward Bend',
      'Lord of the Dance', 'Goddess', 'Wide-Legged Forward Bend'
    ],
    'Seated': [
      'Lotus', 'Butterfly', 'Seated Forward Bend', 'Half Lord of the Fishes',
      'Staff', 'Bound Angle', 'Sage Marichi', 'Seated Wide Angle', 'Deer'
    ],
    'Balancing': [
      'Crow', 'Handstand', 'Forearm Stand', 'Side Plank', 'Half-Moon', 'Eight-Angle',
      'Firefly', 'Peacock', 'Scale', 'Scorpion', 'Side Crane', 'Flying Pigeon'
    ],
    'Backbends': [
      'Wheel', 'Bridge', 'Camel', 'Bow', 'Upward-Facing Dog', 'Cobra', 'Locust',
      'Upward Bow', 'Half Frog'
    ],
    'Forward Bends': [
      'Forward Bend', 'Pyramid', 'Child', 'Tortoise', 'Revolved Head to Knee',
      'Wide-Legged Forward Bend'
    ],
    'Hip Openers': [
      'Pigeon', 'Butterfly', 'Squat', 'Lizard', 'Garland', 'Bound Angle',
      'Reclined Bound Angle', 'Half Frog', 'Deer'
    ],
    'Inversions': [
      'Handstand', 'Shoulder Stand', 'Plow', 'Forearm Stand', 'Supported Headstand',
      'Feathered Peacock', 'Scorpion'
    ],
    'Core Work': [
      'Boat', 'Plank', 'Side Plank', 'Scale', 'Firefly', 'Peacock',
      'Dolphin Plank', 'Upward Plank', 'Reverse Table'
    ],
    'Restorative': [
      'Child', 'Corpse', 'Bridge', 'Happy Baby', 'Embryo', 'Sleeping Thunderbolt',
      'Reclined Bound Angle', 'Crocodile'
    ],
    'Twists': [
      'Half Lord of the Fishes', 'Noose', 'Sage Marichi', 'Revolved Head to Knee',
      'Reclined Spinal Twist'
    ]
  };

  for (const [category, poses] of Object.entries(categories)) {
    if (poses.some(pose => poseName.includes(pose))) {
      return category + ' Poses';
    }
  }
  
  return 'Other Poses';
}

async function fetchYogaData() {
  try {
    console.log('Starting yoga data fetch...');

    // Create necessary directories
    const dataDir = path.join(process.cwd(), 'public', 'yoga-data');
    fs.mkdirSync(dataDir, { recursive: true });

    // Fetch yoga poses from the GitHub repo
    console.log('Fetching pose data from GitHub...');
    const response = await nodeFetch('https://raw.githubusercontent.com/rebeccaestes/yoga_api/master/yoga_api.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch pose data: ${response.status}`);
    }
    const rawPoses = await response.json() as RawYogaPose[];
    
    // Transform raw poses into our format
    const poses: YogaPose[] = rawPoses.map(raw => {
      const details = poseDetails[raw.english_name] || {
        description: '',
        benefits: '',
        translation: ''
      };

      return {
        id: raw.id,
        english_name: raw.english_name,
        sanskrit_name: raw.sanskrit_name,
        sanskrit_name_adapted: raw.sanskrit_name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        translation_name: details.translation || '',
        pose_description: details.description,
        pose_benefits: details.benefits,
        difficulty_level: getDifficultyLevel(raw.english_name),
        category_name: getCategoryName(raw.english_name)
      };
    });
    
    console.log(`Found ${poses.length} poses`);

    // Save processed data
    console.log('Saving processed pose data...');
    fs.writeFileSync(
      path.join(dataDir, 'poses.json'),
      JSON.stringify(poses, null, 2)
    );

    // Create categories
    console.log('Creating categories...');
    const categories = Array.from(new Set(poses.map(pose => pose.category_name)))
      .map(categoryName => ({
        id: poses.findIndex(pose => pose.category_name === categoryName) + 1,
        category_name: categoryName,
        category_description: `Collection of ${categoryName.toLowerCase()}`,
        poses: poses.filter(pose => pose.category_name === categoryName)
      }));

    fs.writeFileSync(
      path.join(dataDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );

    console.log('Yoga data successfully fetched and saved!');
  } catch (error) {
    console.error('Error fetching yoga data:', error);
    process.exit(1);
  }
}

fetchYogaData(); 