-- UV Gym sample data. Safe to run more than once (no duplicates).

-- 30 exercises: 5 per muscle group
INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  ('Barbell Bench Press',     'Chest',  4, '6–8',      'Intermediate', 120, 'Lower the bar to mid-chest with control, then press up explosively.'),
  ('Incline Dumbbell Press',  'Chest',  3, '8–10',     'Intermediate',  90, 'Bench at 30°. Press the dumbbells up and slightly together.'),
  ('Push-Up',                 'Chest',  3, '12–15',    'Beginner',      60, 'Body in a straight line, chest to just above the floor.'),
  ('Cable Fly',               'Chest',  3, '12–15',    'Beginner',      60, 'Soft elbows, hug a big tree, squeeze the chest at the middle.'),
  ('Weighted Dips',           'Chest',  3, '8–10',     'Advanced',      90, 'Lean forward slightly to bias the chest. Go to 90° at the elbow.'),

  ('Deadlift',                'Back',   5, '3–5',      'Advanced',     180, 'Brace hard, push the floor away and keep the bar close to your legs.'),
  ('Pull-Up',                 'Back',   4, '6–10',     'Intermediate', 120, 'Full hang to chin over bar. Drive the elbows down to your ribs.'),
  ('Bent-Over Barbell Row',   'Back',   4, '8–10',     'Intermediate',  90, 'Hinge to 45°, row the bar to your belly button, pause briefly.'),
  ('Lat Pulldown',            'Back',   3, '10–12',    'Beginner',      75, 'Pull the bar to your upper chest, keep your torso tall.'),
  ('Seated Cable Row',        'Back',   3, '10–12',    'Beginner',      75, 'Squeeze the shoulder blades together at the end of each rep.'),

  ('Back Squat',              'Legs',   5, '5',        'Advanced',     180, 'Bar on upper back, sit between your hips, knees track over toes.'),
  ('Romanian Deadlift',       'Legs',   4, '8',        'Intermediate', 120, 'Soft knees, hinge until you feel a deep hamstring stretch.'),
  ('Walking Lunge',           'Legs',   3, '12 / leg', 'Beginner',      75, 'Long steps, back knee kisses the floor, stay upright.'),
  ('Leg Press',               'Legs',   4, '10–12',    'Beginner',      90, 'Feet shoulder-width, lower until knees reach about 90°.'),
  ('Bulgarian Split Squat',   'Legs',   3, '8 / leg',  'Intermediate',  90, 'Rear foot on a bench, drop straight down, drive through the front heel.'),

  ('Barbell Curl',            'Arms',   3, '10',       'Beginner',      60, 'Elbows pinned to your sides, no swinging.'),
  ('Skull Crusher',           'Arms',   3, '10–12',    'Intermediate',  60, 'Lower the EZ bar to your forehead, extend through the triceps.'),
  ('Hammer Curl',             'Arms',   3, '12',       'Beginner',      60, 'Neutral grip, curl up and control the way down.'),
  ('Close-Grip Bench Press',  'Arms',   4, '6–8',      'Advanced',      90, 'Hands shoulder-width, elbows tucked, press with the triceps.'),
  ('Cable Triceps Pushdown',  'Arms',   3, '12–15',    'Beginner',      45, 'Lock the elbows by your sides and squeeze at the bottom.'),

  ('Plank',                   'Core',   3, '45s',      'Beginner',      45, 'Squeeze glutes, ribs down, breathe steadily.'),
  ('Hanging Leg Raise',       'Core',   3, '10–12',    'Intermediate',  60, 'Curl the pelvis up, no swinging.'),
  ('Ab Wheel Rollout',        'Core',   3, '8–10',     'Advanced',      75, 'Roll out only as far as you can keep a flat back.'),
  ('Russian Twist',           'Core',   3, '20',       'Beginner',      45, 'Lean back slightly, rotate from the ribs, not the arms.'),
  ('Cable Woodchopper',       'Core',   3, '12 / side','Intermediate',  60, 'Rotate through the torso, arms stay long.'),

  ('Rowing Intervals',        'Cardio', 6, '500m',     'Intermediate',  90, 'Legs, then body, then arms. Hold a hard but steady pace.'),
  ('Assault Bike Sprints',    'Cardio', 8, '20s',      'Advanced',      40, 'All-out effort for 20 seconds, then recover.'),
  ('Jump Rope',               'Cardio', 5, '2 min',    'Beginner',      60, 'Light on the balls of your feet, wrists do the work.'),
  ('Burpees',                 'Cardio', 4, '12',       'Intermediate',  60, 'Chest to the floor, jump and clap overhead.'),
  ('Incline Treadmill Walk',  'Cardio', 1, '20 min',   'Beginner',      30, '10–12% incline at a brisk pace. Don’t hold the rails.')
ON CONFLICT (name) DO UPDATE SET
  muscle_group = EXCLUDED.muscle_group,
  sets         = EXCLUDED.sets,
  reps         = EXCLUDED.reps,
  difficulty   = EXCLUDED.difficulty,
  rest_seconds = EXCLUDED.rest_seconds,
  description  = EXCLUDED.description;

-- 10 classes in the current week (Monday-based, UTC)
INSERT INTO classes (title, coach_name, start_time, duration_minutes, capacity, intensity)
SELECT c.title, c.coach_name, date_trunc('week', now()) + c.offset_from_monday, c.duration_minutes, c.capacity, c.intensity
FROM (VALUES
  ('Sunrise Yoga Flow',     'Maya Chen',     interval '0 days 06:30', 45, 20, 'Low'),
  ('HIIT Inferno',          'Jordan Blake',  interval '0 days 18:00', 30, 16, 'High'),
  ('Rhythm Spin',           'Sam Ortiz',     interval '1 day 07:00',  45, 24, 'Medium'),
  ('Boxing Bootcamp',       'Dre Walker',    interval '1 day 18:30',  50, 14, 'High'),
  ('Strength Foundations',  'Priya Nair',    interval '2 days 12:00', 60, 12, 'Medium'),
  ('Core Crusher',          'Jordan Blake',  interval '3 days 07:00', 30, 18, 'Medium'),
  ('Power Spin',            'Lena Fox',      interval '3 days 18:00', 45, 24, 'High'),
  ('Kettlebell Strength',   'Priya Nair',    interval '4 days 17:30', 45, 12, 'High'),
  ('Fight Club Boxing',     'Dre Walker',    interval '5 days 10:00', 60, 14, 'High'),
  ('Yin Yoga & Breath',     'Maya Chen',     interval '6 days 10:00', 60, 20, 'Low')
) AS c (title, coach_name, offset_from_monday, duration_minutes, capacity, intensity)
ON CONFLICT (title, start_time) DO NOTHING;
