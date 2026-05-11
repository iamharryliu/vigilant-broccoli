import pg from 'pg';
import { resolve4 } from 'node:dns/promises';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';

const migrationsArg = process.argv
  .find(a => a.startsWith('--migrations-dir='))
  ?.split('=')[1];
if (!migrationsArg) {
  console.error('migrate: --migrations-dir=<path> is required');
  process.exit(1);
}
const MIGRATIONS_DIR = path.resolve(migrationsArg);

function parseDbUrl(raw: string) {
  const match = raw.match(
    /^(postgresql|postgres):\/\/([^:]+):(.+)@([^:/]+)(:\d+)?(\/.*)?$/,
  );
  if (!match) throw new Error('Invalid SUPABASE_DB_URL format');
  const [, , user, password, host, portStr, database] = match;
  return {
    user,
    password,
    host,
    port: portStr ? parseInt(portStr.slice(1)) : 5432,
    database: database ? database.slice(1) : 'postgres',
  };
}

async function run() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('migrate: SUPABASE_DB_URL not set — skipping migrations');
    return;
  }

  const baseline = process.argv.includes('--baseline');
  const { user, password, host, port, database } = parseDbUrl(dbUrl);
  const [ipv4] = await resolve4(host);

  const client = new pg.Client({
    host: ipv4,
    port,
    user,
    password,
    database,
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

    const files = readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

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
        const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
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
