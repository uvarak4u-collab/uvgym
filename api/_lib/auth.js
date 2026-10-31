import { SignJWT, jwtVerify } from 'jose'
import { HttpError } from './http.js'
import { db } from './db.js'

const COOKIE = 'uvgym_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) throw new HttpError(500, 'Server is missing JWT_SECRET.', 'CONFIG_ERROR')
  return new TextEncoder().encode(s)
}

function readCookie(req, name) {
  const header = req.headers.cookie ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

function cookie(value, maxAge) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export async function startSession(res, userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
  res.setHeader('Set-Cookie', cookie(token, MAX_AGE))
}

export function endSession(res) {
  res.setHeader('Set-Cookie', cookie('', 0))
}

/** Returns the logged-in user's id, or throws 401. */
export async function requireUserId(req) {
  const token = readCookie(req, COOKIE)
  if (!token) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED')
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    const id = Number(payload.sub)
    if (!Number.isInteger(id)) throw new Error('bad sub')
    return id
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again.', 'UNAUTHENTICATED')
  }
}

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  fullName: u.full_name,
  weeklyGoalWorkouts: u.weekly_goal_workouts,
  weeklyGoalMinutes: u.weekly_goal_minutes,
  createdAt: u.created_at,
})

/** Returns the logged-in user row, or throws 401 (also if the account was deleted). */
export async function requireUser(req) {
  const id = await requireUserId(req)
  const [user] = await db()`
    SELECT id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at
    FROM users WHERE id = ${id}`
  if (!user) throw new HttpError(401, 'Your account could not be found. Please log in again.', 'UNAUTHENTICATED')
  return user
}
