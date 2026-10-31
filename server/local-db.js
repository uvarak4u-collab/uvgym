// LOCAL DEVELOPMENT ONLY — never imported by /api, so it is never deployed.
// When DATABASE_URL is "pglite://<folder>", we run a real Postgres (PGlite, compiled to WebAssembly)
// inside this Node process and store its files in that folder. It exposes the same small interface
// the /api code uses from @neondatabase/serverless:   await sql`...`   and   sql.transaction([...])
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'

export const isLocalUrl = (url = '') => url.startsWith('pglite://')

export function localDir(url, root) {
  return path.resolve(root, url.slice('pglite://'.length) || '.data/uvgym')
}

class LocalQuery {
  constructor(pg, text, params) {
    this.pg = pg
    this.text = text
    this.params = params
  }
  // Runs when awaited, just like Neon's query objects
  then(resolve, reject) {
    return this.pg.query(this.text, this.params).then((r) => r.rows).then(resolve, reject)
  }
}

export async function createLocalSql(dir) {
  mkdirSync(dir, { recursive: true })
  const pg = await PGlite.create(dir)

  const sql = (strings, ...values) => {
    const text = strings.reduce((acc, part, i) => acc + '$' + i + part)
    return new LocalQuery(pg, text, values)
  }
  sql.transaction = (queries) =>
    pg.transaction(async (tx) => {
      const results = []
      for (const q of queries) results.push((await tx.query(q.text, q.params)).rows)
      return results
    })
  sql.exec = (text) => pg.exec(text)
  sql.close = () => pg.close()
  return sql
}
