import bcrypt from 'bcryptjs'
import { route, body, HttpError } from '../_lib/http.js'
import { db } from '../_lib/db.js'
import { startSession, publicUser } from '../_lib/auth.js'

// Compared against when the email doesn't exist, so response time doesn't reveal which emails are registered
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.3wSx9a9jE1Q1b6H6pZ8a0b1c2d3e'

export default route({
  POST: async (req, res) => {
    const b = body(req)
    const email = String(b.email ?? '').trim().toLowerCase()
    const password = String(b.password ?? '')
    if (!email || !password) throw new HttpError(400, 'Enter your email and password.', 'VALIDATION')

    const [user] = await db()`
      SELECT id, email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at
      FROM users WHERE email = ${email}`
    const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)
    if (!user || !ok) throw new HttpError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS')

    await startSession(res, user.id)
    res.status(200).json({ user: publicUser(user) })
  },
})
