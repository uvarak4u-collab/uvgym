// Frontend → /api. The browser never sees DATABASE_URL; it only talks to our backend functions.

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
  get isDbDown() {
    return ['DB_UNAVAILABLE', 'DB_NOT_CONFIGURED', 'DB_NOT_READY', 'SERVER_UNREACHABLE'].includes(this.code)
  }
}

/** The user's local date, so "today" on the server matches the user's timezone. */
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Client-Date': localDate(),
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Can’t reach the UV Gym server. Check your connection — is “npm run dev” still running?', 0, 'SERVER_UNREACHABLE')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // The Vite proxy returns an empty 500/502 when the API server is down
    if (!res.ok) throw new ApiError('Can’t reach the UV Gym server. Is “npm run dev” still running?', res.status, 'SERVER_UNREACHABLE')
  }
  if (!res.ok) throw new ApiError(data?.error ?? 'Something went wrong. Please try again.', res.status, data?.code)
  return data
}
