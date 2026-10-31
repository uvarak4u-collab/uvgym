// Server-only database access. DATABASE_URL never leaves the backend.
import { neon } from '@neondatabase/serverless'
import { HttpError } from './http.js'

let sql

export function db() {
  // Local development: server/dev.js can provide an on-disk Postgres (PGlite) with the same interface
  if (globalThis.__uvgymLocalSql) return globalThis.__uvgymLocalSql
  if (!process.env.DATABASE_URL) {
    throw new HttpError(503, 'The database isn’t configured yet. Add DATABASE_URL to .env and restart.', 'DB_NOT_CONFIGURED')
  }
  sql ??= neon(process.env.DATABASE_URL)
  return sql
}
