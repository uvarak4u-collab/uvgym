// Small helpers shared by every /api route. Works the same on Vercel and the local Express server.

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const DB_DOWN = /fetch failed|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|getaddrinfo|socket hang up|password authentication failed|connection.*(terminated|refused|timeout)|Couldn't connect/i

function toResponse(err) {
  if (err instanceof HttpError) return { status: err.status, body: { error: err.message, code: err.code } }

  // Postgres error codes: 42P01 = table missing, 28xxx = auth, 08xxx/57Pxx = connection
  const pgCode = err?.code ?? err?.sourceError?.code
  if (pgCode === '42P01') {
    return { status: 503, body: { error: 'The database isn’t set up yet. Run “npm run db:setup” and try again.', code: 'DB_NOT_READY' } }
  }
  const message = `${err?.message ?? ''} ${err?.cause?.message ?? ''} ${err?.sourceError?.message ?? ''}`
  if (/^(28|08|57P)/.test(pgCode ?? '') || DB_DOWN.test(message)) {
    return { status: 503, body: { error: 'We can’t reach the database right now. Check your connection and try again in a moment.', code: 'DB_UNAVAILABLE' } }
  }
  console.error('[api] Unexpected error:', err)
  return { status: 500, body: { error: 'Something went wrong on our side. Please try again.', code: 'SERVER_ERROR' } }
}

/** Wrap a route: `export default route({ GET: async (req, res) => {...} })` */
export function route(methods) {
  return async function handler(req, res) {
    const fn = methods[req.method]
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '))
      return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' })
    }
    try {
      res.setHeader('Cache-Control', 'no-store')
      await fn(req, res)
    } catch (err) {
      const { status, body } = toResponse(err)
      if (!res.headersSent) res.status(status).json(body)
    }
  }
}

export function body(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      throw new HttpError(400, 'Invalid JSON body', 'BAD_REQUEST')
    }
  }
  return req.body
}

export function intParam(value, name) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, `Invalid ${name}`, 'BAD_REQUEST')
  return n
}

/**
 * The user's local calendar date (YYYY-MM-DD). The browser sends it in a header so "today"
 * matches the user's timezone; we fall back to UTC and reject anything more than a day off.
 */
export function clientToday(req) {
  const header = req.headers['x-client-date']
  const utc = new Date().toISOString().slice(0, 10)
  if (typeof header !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(header)) return utc
  const diffDays = Math.abs(Date.parse(header) - Date.parse(utc)) / 86_400_000
  return Number.isFinite(diffDays) && diffDays <= 1 ? header : utc
}
