// One-off: copies event-calendar tracking from the old per-machine SQLite file
// into shared Supabase. Idempotent (upserts by id), so it is safe to re-run and
// to run on each machine that still holds local rows. After the tracking lives
// in Supabase the SQLite file is unused.
//
//   pnpm tsx scripts/migrate-event-calendars-to-supabase.ts
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the environment
// (and VB_MANAGER_DATA_DIR if the DB lives outside ~/.vb-manager).
import Database from 'better-sqlite3';
import os from 'os';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DB_FILENAME = 'vb-manager.db';
const DB_DIRECTORY =
  process.env.VB_MANAGER_DATA_DIR ?? path.join(os.homedir(), '.vb-manager');
const DB_PATH = path.join(DB_DIRECTORY, DB_FILENAME);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SECRET_KEY as string,
  { auth: { persistSession: false } },
);

const main = async () => {
  const db = new Database(DB_PATH, { readonly: true });

  const calendars = db.prepare('SELECT * FROM event_calendars').all() as Record<
    string,
    unknown
  >[];
  const sources = db
    .prepare('SELECT calendar_id, url, source_type FROM event_calendar_sources')
    .all() as Record<string, unknown>[];

  if (!calendars.length) {
    console.log(`No calendars in ${DB_PATH} — nothing to migrate.`);
    return;
  }

  const calendarRows = calendars.map(row => ({
    id: row.id,
    name: row.name,
    google_calendar_id: row.google_calendar_id,
    is_public: !!row.is_public,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_synced_at: row.last_synced_at ?? null,
    last_sync_message: row.last_sync_message ?? null,
  }));

  const { error: calendarError } = await supabase
    .from('event_calendars')
    .upsert(calendarRows, { onConflict: 'id' });
  if (calendarError) throw new Error(calendarError.message);

  for (const row of calendarRows) {
    const { error: deleteError } = await supabase
      .from('event_calendar_sources')
      .delete()
      .eq('calendar_id', row.id);
    if (deleteError) throw new Error(deleteError.message);
  }

  if (sources.length) {
    const { error: sourceError } = await supabase
      .from('event_calendar_sources')
      .insert(
        sources.map(row => ({
          calendar_id: row.calendar_id,
          url: row.url,
          source_type: row.source_type,
        })),
      );
    if (sourceError) throw new Error(sourceError.message);
  }

  console.log(
    `Migrated ${calendarRows.length} calendar(s) and ${sources.length} source(s) to Supabase.`,
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
