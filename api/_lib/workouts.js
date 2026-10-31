import { db } from './db.js'

const DIFFICULTY_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3 }

/** Name a workout after the muscle groups in it, e.g. "Chest Day", "Back & Legs", "Full Body Mix". */
export function workoutName(groups) {
  const unique = [...new Set(groups)]
  if (unique.length === 0) return 'Today’s Workout'
  if (unique.length === 1) return `${unique[0]} Day`
  if (unique.length === 2) return `${unique[0]} & ${unique[1]}`
  return 'Full Body Mix'
}

/** Today's workout for one user (with exercises and sets), or null. Always scoped by user_id. */
export async function getWorkoutForDate(userId, date) {
  const sql = db()
  const [w] = await sql`
    SELECT id, name, status, duration_minutes, started_at, completed_at, to_char(workout_date, 'YYYY-MM-DD') AS date
    FROM workouts WHERE user_id = ${userId} AND workout_date = ${date}::date`
  if (!w) return null

  const rows = await sql`
    SELECT we.id AS workout_exercise_id, we.order_index,
           e.id AS exercise_id, e.name, e.muscle_group, e.reps, e.difficulty, e.rest_seconds, e.description,
           COALESCE(
             json_agg(json_build_object('id', s.id, 'setNumber', s.set_number, 'completed', s.completed)
                      ORDER BY s.set_number) FILTER (WHERE s.id IS NOT NULL),
             '[]'::json) AS sets
    FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id AND w.user_id = ${userId}
    JOIN exercises e ON e.id = we.exercise_id
    LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
    WHERE we.workout_id = ${w.id}
    GROUP BY we.id, e.id
    ORDER BY we.order_index, we.id`

  const exercises = rows.map((r) => ({
    workoutExerciseId: r.workout_exercise_id,
    exerciseId: r.exercise_id,
    name: r.name,
    muscleGroup: r.muscle_group,
    reps: r.reps,
    difficulty: r.difficulty,
    restSeconds: r.rest_seconds,
    description: r.description,
    sets: r.sets,
  }))

  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets = exercises.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0)
  // Rough plan length: ~45s of work per set plus its rest
  const estimatedMinutes = Math.max(
    5,
    Math.round(exercises.reduce((m, e) => m + e.sets.length * (45 + e.restSeconds), 0) / 60)
  )
  const hardest = exercises.reduce((best, e) => (DIFFICULTY_RANK[e.difficulty] > DIFFICULTY_RANK[best] ? e.difficulty : best), 'Beginner')

  return {
    id: w.id,
    name: w.name,
    date: w.date,
    status: w.status,
    durationMinutes: w.duration_minutes,
    startedAt: w.started_at,
    completedAt: w.completed_at,
    focus: [...new Set(exercises.map((e) => e.muscleGroup))].join(' · '),
    difficulty: exercises.length ? hardest : null,
    estimatedMinutes,
    totalSets,
    doneSets,
    exercises,
  }
}
