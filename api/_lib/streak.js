import { db } from './db.js'

/**
 * Streaks = runs of consecutive days with a completed workout (gaps-and-islands).
 * The current streak stays alive until the end of today, so it counts runs ending today or yesterday.
 */
export async function getStreak(userId, today) {
  const [row] = await db()`
    WITH days AS (
      SELECT DISTINCT workout_date FROM workouts
      WHERE user_id = ${userId} AND status = 'completed' AND workout_date <= ${today}::date
    ), runs AS (
      SELECT MAX(workout_date) AS last_day, COUNT(*)::int AS length
      FROM (SELECT workout_date, workout_date - (ROW_NUMBER() OVER (ORDER BY workout_date))::int AS grp FROM days) g
      GROUP BY grp
    )
    SELECT
      COALESCE(MAX(length) FILTER (WHERE last_day >= ${today}::date - 1), 0)::int AS current,
      COALESCE(MAX(length), 0)::int AS best
    FROM runs`
  return { current: row.current, best: row.best }
}
