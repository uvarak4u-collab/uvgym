// Local stand-in for Vercel Functions: serves every file in /api at the same URL Vercel will.
//   api/stats.js       → /api/stats
//   api/auth/login.js  → /api/auth/login
// Files and folders starting with "_" (like api/_lib) are helpers, not routes — same rule as Vercel.
// Only used for local development; Vercel runs the /api files directly.
import express from 'express'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = path.join(root, 'api')
const PORT = Number(process.env.API_PORT) || 3001

try {
  process.loadEnvFile(path.join(root, '.env'))
} catch {
  console.warn('[api] No .env file found — copy .env.example to .env')
}

// DATABASE_URL=pglite://.data/uvgym → a real Postgres stored in that folder (local dev only)
const { isLocalUrl, localDir, createLocalSql } = await import('./local-db.js')
if (isLocalUrl(process.env.DATABASE_URL)) {
  const dir = localDir(process.env.DATABASE_URL, root)
  const sql = await createLocalSql(dir)
  // Same files as "npm run db:setup" — both are safe to run again
  for (const file of ['schema.sql', 'seed.sql']) await sql.exec(readFileSync(path.join(root, 'db', file), 'utf8'))
  globalThis.__uvgymLocalSql = sql
  console.log(`[api] Local Postgres ready (PGlite) → ${path.relative(root, dir)}`)

  // Close cleanly so every write is flushed to disk
  const shutdown = async () => {
    await sql.close().catch(() => {})
    process.exit(0)
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}

function findRoutes(dir, prefix = '/api') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) return []
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return findRoutes(full, `${prefix}/${entry.name}`)
    if (!/\.(js|mjs)$/.test(entry.name)) return []
    const name = entry.name.replace(/\.(js|mjs)$/, '')
    return [{ url: name === 'index' ? prefix : `${prefix}/${name}`, file: full }]
  })
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

const routes = findRoutes(apiDir)
for (const { url, file } of routes) {
  const { default: handler } = await import(pathToFileURL(file).href)
  app.all(url, (req, res) => handler(req, res))
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' }))
// Malformed JSON bodies and other Express-level errors
app.use((err, req, res, _next) => {
  res.status(err.status ?? 500).json({ error: err.status === 400 ? 'Invalid request body' : 'Server error', code: 'BAD_REQUEST' })
})

app.listen(PORT, () => {
  console.log(`[api] ${routes.length} routes ready on http://localhost:${PORT}`)
  for (const r of routes) console.log(`      ${r.url}`)
})
