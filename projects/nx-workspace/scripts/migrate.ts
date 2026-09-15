import pg from 'pg';
import { resolve4 } from 'node:dns/promises';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';

// Accepts one or more --migrations-dir flags. Multiple dirs (all targeting the
// one shared Supabase project) are merged and applied in a single global order
// by filename, so a migration in one app's folder that depends on an object
// created earlier in another's still runs after it. Single-dir usage — how the
// per-app `serve` targets call this — is unchanged.
const MIGRATION_DIRS = process.argv
  .filter(a => a.startsWith('--migrations-dir='))
  .map(a => path.resolve(a.split('=')[1]));
if (MIGRATION_DIRS.length === 0) {
  console.error('migrate: at least one --migrations-dir=<path> is required');
  process.exit(1);
}

const DB_HOST = 'aws-1-eu-west-1.pooler.supabase.com';
const DB_PORT = 5432;
const DB_USER = 'postgres.jrdosjjgmsoodpjmjqxx';
const DB_NAME = 'postgres';

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    console.error(
      'migrate: SUPABASE_DB_PASSWORD not set — skipping migrations',
    );
    return;
  }

  const baseline = process.argv.includes('--baseline');
  const [ipv4] = await resolve4(DB_HOST);

  const client = new pg.Client({
    host: ipv4,
    port: DB_PORT,
    user: DB_USER,
    password,
    database: DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const { rows: applied } = await client.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations ORDER BY filename',
    );
    const appliedSet = new Set(applied.map(r => r.filename));

    const seen = new Map<string, string>();
    for (const dir of MIGRATION_DIRS) {
      for (const file of readdirSync(dir).filter(f => f.endsWith('.sql'))) {
        const existing = seen.get(file);
        if (existing && existing !== path.join(dir, file)) {
          console.error(
            `migrate: duplicate migration filename "${file}" in ${existing} and ${dir}`,
          );
          process.exit(1);
        }
        seen.set(file, path.join(dir, file));
      }
    }

    // schema_migrations is keyed by filename, so a global filename sort gives a
    // stable cross-dir order.
    const files = [...seen.keys()].sort();
    const pending = files.filter(f => !appliedSet.has(f));

    if (pending.length === 0) {
      console.log('migrate: all migrations up to date');
      return;
    }

    console.log(
      `migrate: ${pending.length} pending migration(s)${baseline ? ' (baseline)' : ''}`,
    );

    for (const file of pending) {
      if (!baseline) {
        const sql = readFileSync(seen.get(file) as string, 'utf-8');
        console.log(`migrate: applying ${file}...`);
        await client.query(sql);
      }
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file],
      );
      console.log(`migrate: ✓ ${file}`);
    }

    console.log('migrate: done');
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error('migrate: fatal:', err.message);
  process.exit(1);
});
