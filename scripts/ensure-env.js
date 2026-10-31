// Makes sure .env exists and has what the app needs.
// - Creates .env from .env.example if missing
// - Generates a strong JWT_SECRET if it is empty
// - Uses a local database (pglite://.data/uvgym) if DATABASE_URL is empty
// - Stops with clear instructions if DATABASE_URL is set but not a valid Postgres URL
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')
const examplePath = path.join(root, '.env.example')

export const LOCAL_URL = 'pglite://.data/uvgym'

const c = { lime: (s) => `\x1b[92m${s}\x1b[0m`, red: (s) => `\x1b[91m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m` }

const readValue = (text, key) => {
  // [ \t] not \s — \s would match newlines and read the next line as the value
  const m = text.match(new RegExp(`^[ \\t]*${key}[ \\t]*=[ \\t]*(.*?)[ \\t]*$`, 'm'))
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
}

const setValue = (text, key, value) => {
  const re = new RegExp(`^[ \\t]*${key}[ \\t]*=.*$`, 'm')
  return re.test(text) ? text.replace(re, `${key}=${value}`) : `${text.trimEnd()}\n${key}=${value}\n`
}

export function ensureEnv() {
  let text = existsSync(envPath) ? readFileSync(envPath, 'utf8') : existsSync(examplePath) ? readFileSync(examplePath, 'utf8') : ''
  let changed = !existsSync(envPath)

  if (readValue(text, 'JWT_SECRET').length < 32) {
    text = setValue(text, 'JWT_SECRET', randomBytes(48).toString('base64url'))
    changed = true
    console.log(c.lime('✔ Generated a strong JWT_SECRET and saved it to .env'))
  }
  if (!readValue(text, 'DATABASE_URL')) {
    text = setValue(text, 'DATABASE_URL', LOCAL_URL)
    changed = true
    console.log(c.lime(`✔ Using a local database on this computer (DATABASE_URL=${LOCAL_URL})`))
    console.log(c.dim('  To use Neon instead, replace it with your Neon connection string (Neon → Connect).'))
  }
  if (changed) writeFileSync(envPath, text)

  const url = readValue(text, 'DATABASE_URL')
  if (!/^(postgres(ql)?|pglite):\/\//.test(url)) {
    console.error(
      [
        '',
        c.red(c.bold('✖ DATABASE_URL in .env isn’t a database connection string')),
        '',
        '  Get it from Neon (free):',
        `  1. Go to ${c.bold('https://console.neon.tech')} and sign in (create a free project if you have none)`,
        `  2. Open your project → on the ${c.bold('Project Dashboard')} click the ${c.bold('Connect')} button (top right)`,
        `  3. In "Connect to your database", keep Branch ${c.dim('main')}, Database ${c.dim('neondb')}, and ${c.bold('Connection pooling')} on`,
        `  4. Click ${c.bold('Show password')}, then the ${c.bold('copy')} icon next to the connection string`,
        `     It looks like: ${c.dim('postgresql://neondb_owner:••••@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require')}`,
        `  5. Paste it into ${c.bold('.env')} after ${c.bold('DATABASE_URL=')} and save`,
        `     (Or set ${c.bold(`DATABASE_URL=${LOCAL_URL}`)} to use a local database on this computer.)`,
        '',
        `  Then run ${c.lime('npm run db:setup')} and ${c.lime('npm run dev')}.`,
        '',
      ].join('\n')
    )
    process.exit(1)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) ensureEnv()
