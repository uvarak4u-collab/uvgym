// PATCH { setId, completed } → tick / untick one set. Only the owner's sets can change.
import { route, body, intParam, HttpError } from './_lib/http.js'
import { db } from './_lib/db.js'
import { requireUserId } from './_lib/auth.js'

export default route({
  PATCH: async (req, res) => {
    const userId = await requireUserId(req)
    const b = body(req)
    const setId = intParam(b.setId, 'setId')
    if (typeof b.completed !== 'boolean') throw new HttpError(400, 'completed must be true or false', 'BAD_REQUEST')

    const sql = db()
    const [row] = await sql`
      UPDATE workout_sets s
      SET completed = ${b.completed}, completed_at = CASE WHEN ${b.completed}::boolean THEN now() ELSE NULL END
      FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE s.id = ${setId}
        AND s.workout_exercise_id = we.id
        AND w.user_id = ${userId}
        AND w.status <> 'completed'
      RETURNING s.id, s.completed, w.id AS workout_id, w.status`
    if (!row) throw new HttpError(404, 'That set couldn’t be saved — it may belong to a finished workout. Refresh and try again.', 'NOT_FOUND')

    // The first ticked set starts the workout clock
    if (row.status === 'planned') {
      await sql`UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
                WHERE id = ${row.workout_id} AND user_id = ${userId}`
    }
    res.status(200).json({ set: { id: row.id, completed: row.completed } })
  },
})
