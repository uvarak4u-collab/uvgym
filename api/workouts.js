// Today's workout for the logged-in user.
// GET                          → today's workout (or null)
// POST { action: 'add',     exerciseId }   → add an exercise (creates today's workout if needed)
// POST { action: 'remove',  exerciseId }   → remove an exercise
// POST { action: 'start',   workoutId }    → mark in progress
// POST { action: 'restart', workoutId }    → untick every set and restart the clock
// POST { action: 'finish',  workoutId }    → save duration and mark completed
import { route, body, clientToday, intParam, HttpError } from './_lib/http.js'
import { db } from './_lib/db.js'
import { requireUserId } from './_lib/auth.js'
import { getWorkoutForDate, workoutName } from './_lib/workouts.js'

async function renameFromGroups(sql, workoutId) {
  const groups = await sql`
    SELECT e.muscle_group FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ${workoutId} ORDER BY we.order_index, we.id`
  await sql`UPDATE workouts SET name = ${workoutName(groups.map((g) => g.muscle_group))} WHERE id = ${workoutId}`
}

async function ownWorkout(sql, userId, workoutId) {
  const [w] = await sql`SELECT id, status FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}`
  if (!w) throw new HttpError(404, 'We couldn’t find that workout.', 'NOT_FOUND')
  return w
}

const actions = {
  async add(sql, userId, b, today) {
    const exerciseId = intParam(b.exerciseId, 'exerciseId')
    const [exercise] = await sql`SELECT id, name FROM exercises WHERE id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, 'That exercise no longer exists.', 'NOT_FOUND')

    const [w] = await sql`
      INSERT INTO workouts (user_id, name, workout_date)
      VALUES (${userId}, 'Today’s Workout', ${today}::date)
      ON CONFLICT (user_id, workout_date) DO UPDATE SET user_id = EXCLUDED.user_id
      RETURNING id, status`
    if (w.status === 'completed') {
      throw new HttpError(409, 'You already finished today’s workout. Great job — add more tomorrow!', 'WORKOUT_COMPLETED')
    }

    // Add the exercise and create its sets in one statement
    await sql`
      WITH we AS (
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
        SELECT ${w.id}::int, ${exerciseId}::int, COALESCE(MAX(order_index) + 1, 0)
        FROM workout_exercises WHERE workout_id = ${w.id}::int
        ON CONFLICT (workout_id, exercise_id) DO NOTHING
        RETURNING id, exercise_id
      )
      INSERT INTO workout_sets (workout_exercise_id, set_number)
      SELECT we.id, n FROM we
      JOIN exercises e ON e.id = we.exercise_id
      CROSS JOIN LATERAL generate_series(1, e.sets) AS n
      ON CONFLICT (workout_exercise_id, set_number) DO NOTHING`

    await renameFromGroups(sql, w.id)
    return { message: `${exercise.name} added to today’s workout` }
  },

  async remove(sql, userId, b, today) {
    const exerciseId = intParam(b.exerciseId, 'exerciseId')
    const [w] = await sql`SELECT id, status FROM workouts WHERE user_id = ${userId} AND workout_date = ${today}::date`
    if (!w) return { message: 'Nothing to remove' }
    if (w.status === 'completed') throw new HttpError(409, 'Today’s workout is already finished.', 'WORKOUT_COMPLETED')
    await sql`DELETE FROM workout_exercises WHERE workout_id = ${w.id} AND exercise_id = ${exerciseId}`
    await renameFromGroups(sql, w.id)
    return { message: 'Removed from today’s workout' }
  },

  async start(sql, userId, b) {
    const w = await ownWorkout(sql, userId, intParam(b.workoutId, 'workoutId'))
    if (w.status === 'planned') {
      await sql`UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now()) WHERE id = ${w.id} AND user_id = ${userId}`
    }
    return {}
  },

  async restart(sql, userId, b) {
    const w = await ownWorkout(sql, userId, intParam(b.workoutId, 'workoutId'))
    if (w.status === 'completed') throw new HttpError(409, 'This workout is already finished.', 'WORKOUT_COMPLETED')
    await sql.transaction([
      sql`UPDATE workout_sets s SET completed = false, completed_at = NULL
          FROM workout_exercises we WHERE we.id = s.workout_exercise_id AND we.workout_id = ${w.id}`,
      sql`UPDATE workouts SET status = 'in_progress', started_at = now() WHERE id = ${w.id} AND user_id = ${userId}`,
    ])
    return { message: 'Workout restarted' }
  },

  async finish(sql, userId, b) {
    const workoutId = intParam(b.workoutId, 'workoutId')
    const [done] = await sql`
      UPDATE workouts SET
        status = 'completed',
        completed_at = now(),
        started_at = COALESCE(started_at, now()),
        duration_minutes = GREATEST(1, ROUND(EXTRACT(EPOCH FROM (now() - COALESCE(started_at, now()))) / 60))::int
      WHERE id = ${workoutId} AND user_id = ${userId} AND status <> 'completed'
        AND EXISTS (
          SELECT 1 FROM workout_exercises we JOIN workout_sets s ON s.workout_exercise_id = we.id
          WHERE we.workout_id = workouts.id AND s.completed)
      RETURNING duration_minutes`
    if (!done) {
      const w = await ownWorkout(sql, userId, workoutId)
      if (w.status === 'completed') throw new HttpError(409, 'This workout is already finished.', 'WORKOUT_COMPLETED')
      throw new HttpError(400, 'Log at least one set before finishing — even one rep counts.', 'NO_SETS_DONE')
    }
    return { message: 'Workout complete!', durationMinutes: done.duration_minutes }
  },
}

export default route({
  GET: async (req, res) => {
    const userId = await requireUserId(req)
    res.status(200).json({ workout: await getWorkoutForDate(userId, clientToday(req)) })
  },

  POST: async (req, res) => {
    const userId = await requireUserId(req)
    const b = body(req)
    const action = actions[b.action]
    if (!action) throw new HttpError(400, 'Unknown action.', 'BAD_REQUEST')
    const today = clientToday(req)
    const result = await action(db(), userId, b, today)
    res.status(200).json({ ...result, workout: await getWorkoutForDate(userId, today) })
  },
})
