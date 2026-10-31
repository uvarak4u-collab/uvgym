-- UV Gym database schema. Safe to run more than once.

CREATE TABLE IF NOT EXISTS users (
  id                    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email                 text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash         text NOT NULL,
  full_name             text NOT NULL,
  weekly_goal_workouts  integer NOT NULL DEFAULT 4 CHECK (weekly_goal_workouts BETWEEN 1 AND 14),
  weekly_goal_minutes   integer NOT NULL DEFAULT 180 CHECK (weekly_goal_minutes BETWEEN 10 AND 3000),
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercises (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text NOT NULL UNIQUE,
  muscle_group  text NOT NULL CHECK (muscle_group IN ('Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio')),
  sets          integer NOT NULL CHECK (sets BETWEEN 1 AND 20),
  reps          text NOT NULL,
  difficulty    text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  rest_seconds  integer NOT NULL CHECK (rest_seconds BETWEEN 0 AND 600),
  description   text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS exercises_muscle_group_idx ON exercises (muscle_group);

CREATE TABLE IF NOT EXISTS workouts (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name              text NOT NULL,
  workout_date      date NOT NULL,
  status            text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  duration_minutes  integer NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  started_at        timestamptz,
  completed_at      timestamptz,
  UNIQUE (user_id, workout_date) -- one workout per user per day
);
CREATE INDEX IF NOT EXISTS workouts_user_status_date_idx ON workouts (user_id, status, workout_date);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_id   integer NOT NULL REFERENCES workouts (id) ON DELETE CASCADE,
  exercise_id  integer NOT NULL REFERENCES exercises (id) ON DELETE RESTRICT,
  order_index  integer NOT NULL DEFAULT 0,
  UNIQUE (workout_id, exercise_id)
);
CREATE INDEX IF NOT EXISTS workout_exercises_exercise_idx ON workout_exercises (exercise_id);

CREATE TABLE IF NOT EXISTS workout_sets (
  id                   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_exercise_id  integer NOT NULL REFERENCES workout_exercises (id) ON DELETE CASCADE,
  set_number           integer NOT NULL CHECK (set_number >= 1),
  completed            boolean NOT NULL DEFAULT false,
  completed_at         timestamptz,
  UNIQUE (workout_exercise_id, set_number)
);

CREATE TABLE IF NOT EXISTS classes (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title             text NOT NULL,
  coach_name        text NOT NULL,
  start_time        timestamptz NOT NULL,
  duration_minutes  integer NOT NULL CHECK (duration_minutes > 0),
  capacity          integer NOT NULL CHECK (capacity > 0),
  intensity         text NOT NULL CHECK (intensity IN ('Low', 'Medium', 'High')),
  UNIQUE (title, start_time)
);
CREATE INDEX IF NOT EXISTS classes_start_time_idx ON classes (start_time);
