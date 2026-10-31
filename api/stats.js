// Public: community numbers for the landing page. Aggregates only, no personal data.
import { route } from './_lib/http.js'
import { db } from './_lib/db.js'

export default route({
  GET: async (req, res) => {
    const [row] = await db()`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS members,
        (SELECT COUNT(*)::int FROM workouts WHERE status = 'completed') AS workouts_completed,
        (SELECT COUNT(*)::int FROM classes
          WHERE start_time >= date_trunc('week', now())
            AND start_time <  date_trunc('week', now()) + interval '7 days') AS classes_this_week`
    res.status(200).json({
      members: row.members,
      workoutsCompleted: row.workouts_completed,
      classesThisWeek: row.classes_this_week,
    })
  },
})
