import { route, clientToday } from './_lib/http.js'
import { db } from './_lib/db.js'
import { requireUser, publicUser } from './_lib/auth.js'
import { getWorkoutForDate } from './_lib/workouts.js'
import { getStreak } from './_lib/streak.js'

export default route({
  GET: async (req, res) => {
    const user = await requireUser(req)
    const today = clientToday(req)
    const sql = db()

    const [todayWorkout, last7, weekRows, streak] = await Promise.all([
      getWorkoutForDate(user.id, today),

      // Active minutes per day for the last 7 days (completed workouts only)
      sql`
        SELECT to_char(d, 'YYYY-MM-DD') AS date, to_char(d, 'Dy') AS day,
               COALESCE(SUM(w.duration_minutes), 0)::int AS minutes,
               COUNT(w.id)::int AS workouts
        FROM generate_series(${today}::date - 6, ${today}::date, interval '1 day') AS d
        LEFT JOIN workouts w
          ON w.workout_date = d::date AND w.user_id = ${user.id} AND w.status = 'completed'
        GROUP BY d ORDER BY d`,

      // This Monday–Sunday week
      sql`
        SELECT to_char(d, 'YYYY-MM-DD') AS date, to_char(d, 'Dy') AS day,
               COALESCE(SUM(w.duration_minutes), 0)::int AS minutes,
               COUNT(w.id)::int AS workouts
        FROM generate_series(
               ${today}::date - (EXTRACT(ISODOW FROM ${today}::date)::int - 1),
               ${today}::date - (EXTRACT(ISODOW FROM ${today}::date)::int - 1) + 6,
               interval '1 day') AS d
        LEFT JOIN workouts w
          ON w.workout_date = d::date AND w.user_id = ${user.id} AND w.status = 'completed'
        GROUP BY d ORDER BY d`,

      getStreak(user.id, today),
    ])

    const weekWorkouts = weekRows.reduce((n, d) => n + d.workouts, 0)
    const weekMinutes = weekRows.reduce((n, d) => n + d.minutes, 0)
    const goals = [weekWorkouts >= user.weekly_goal_workouts, weekMinutes >= user.weekly_goal_minutes]

    res.status(200).json({
      user: publicUser(user),
      today,
      todayWorkout,
      activity: last7.map((d) => ({ ...d, isToday: d.date === today })),
      week: weekRows.map((d) => ({ date: d.date, day: d.day, trained: d.workouts > 0, isToday: d.date === today })),
      streak,
      rings: {
        workouts: { value: weekWorkouts, goal: user.weekly_goal_workouts },
        minutes: { value: weekMinutes, goal: user.weekly_goal_minutes },
        goalsHit: { value: goals.filter(Boolean).length, goal: goals.length },
      },
    })
  },
})
