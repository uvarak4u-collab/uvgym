// npm run db:setup — creates tables (db/schema.sql) then loads sample data (db/seed.sql).
// Safe to run again: schema uses IF NOT EXISTS, seed uses ON CONFLICT.
// Works with Neon (postgresql://…) and with the local database (pglite://…).
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureEnv } from './ensure-env.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = (name) => readFileSync(path.join(root, 'db', name), 'utf8')
const ok = (msg) => console.log(`\x1b[92m✔\x1b[0m ${msg}`)

const COUNTS = `
  SELECT 'exercises' AS "table", COUNT(*)::int AS "rows" FROM exercises
  UNION ALL SELECT 'classes', COUNT(*)::int FROM classes
  UNION ALL SELECT 'classes this week', COUNT(*)::int FROM classes
    WHERE start_time >= date_trunc('week', now()) AND start_time < date_trunc('week', now()) + interval '7 days'
  UNION ALL SELECT 'users', COUNT(*)::int FROM users
  UNION ALL SELECT 'workouts', COUNT(*)::int FROM workouts`

ensureEnv()
process.loadEnvFile(path.join(root, '.env'))
const url = process.env.DATABASE_URL

async function setupLocal() {
  // The local database can only be open in one process at a time
  const running = await fetch(`http://localhost:${process.env.API_PORT || 3001}/api/stats`).then(() => true, () => false)
  if (running) {
    console.error('\x1b[91m✖ The app is running (npm run dev), which has the local database open.\x1b[0m')
    console.error('  Stop it first (Ctrl+C), then run npm run db:setup again.')
    console.error('  Tip: npm run dev already applies schema.sql and seed.sql every time it starts.')
    process.exit(1)
  }
  const { createLocalSql, localDir } = await import('../server/local-db.js')
  const dir = localDir(url, root)
  const sql = await createLocalSql(dir)
  try {
    for (const name of ['schema.sql', 'seed.sql']) {
      await sql.exec(file(name))
      ok(`Ran db/${name}`)
    }
    const rows = await sql([COUNTS])
    console.log(`\nLocal database: ${path.relative(root, dir)}\nRow counts:`)
    console.table(rows)
  } finally {
    await sql.close()
  }
}

async function setupNeon() {
  const { Client, neonConfig } = await import('@neondatabase/serverless')
  neonConfig.webSocketConstructor = globalThis.WebSocket // built into Node 22+
  const client = new Client(url)
  try {
    await client.connect()
    for (const name of ['schema.sql', 'seed.sql']) {
      await client.query(file(name))
      ok(`Ran db/${name}`)
    }
    const { rows } = await client.query(COUNTS)
    console.log('\nNeon database\nRow counts:')
    console.table(rows)
  } finally {
    await client.end().catch(() => {})
  }
}

try {
  await (url.startsWith('pglite://') ? setupLocal() : setupNeon())
} catch (err) {
  console.error('\x1b[91m✖ Database setup failed:\x1b[0m', err.message)
  if (/password authentication|ENOTFOUND|getaddrinfo|fetch failed|ECONNREFUSED/i.test(err.message)) {
    console.error('  Check that DATABASE_URL in .env is the full connection string copied from Neon → Connect.')
  }
  process.exitCode = 1
}
