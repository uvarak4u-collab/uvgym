import bcrypt from 'bcryptjs'
import { route, body, HttpError } from '../_lib/http.js'
import { db } from '../_lib/db.js'
import { startSession, publicUser } from '../_lib/auth.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function int(value, fallback, min, max, label) {
  if (value === undefined || value === null || value === '') return fallback
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) throw new HttpError(400, `${label} must be between ${min} and ${max}.`, 'VALIDATION')
  return n
}

export default route({
  POST: async (req, res) => {
    const b = body(req)
    const fullName = String(b.fullName ?? '').trim()
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')

    if (fullName.length < 1 || fullName.length > 80) throw new HttpError(400, 'Please tell us your name.', 'VALIDATION')
    if (!EMAIL.test(email) || email.length > 254) throw new HttpError(400, 'That email address doesn’t look right.', 'VALIDATION')
    if (password.length < 8 || password.length > 128) throw new HttpError(400, 'Password must be at least 8 characters.', 'VALIDATION')
    const goalWorkouts = int(b.weeklyGoalWorkouts, 4, 1, 14, 'Weekly workouts goal')
    const goalMinutes = int(b.weeklyGoalMinutes, 180, 10, 3000, 'Weekly minutes goal')

    const hash = await bcrypt.hash(password, 10)
    const [user] = await db()`
      INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      VALUES (${email}, ${hash}, ${fullName}, ${goalWorkouts}, ${goalMinutes})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at`
    if (!user) throw new HttpError(409, 'An account with that email already exists. Try logging in instead.', 'EMAIL_TAKEN')

    await startSession(res, user.id)
    res.status(201).json({ user: publicUser(user) })
  },
})
