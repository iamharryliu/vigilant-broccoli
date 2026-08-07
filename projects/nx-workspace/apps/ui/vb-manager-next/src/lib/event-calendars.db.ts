import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  EventCalendar,
  EventCalendarSource,
  EventSourceType,
} from '../app/constants/event-calendars';

// Deliberately outside the repo: cwd under PM2 is the build output directory,
// so a db file there is data living inside a rebuildable artifact. This path is
// where the sync runner reads which calendars to sync and which URLs to
// scrape for each.
const DB_FILENAME = 'vb-manager.db';
const DB_DIRECTORY =
  process.env.VB_MANAGER_DATA_DIR ?? path.join(os.homedir(), '.vb-manager');
const DB_PATH = path.join(DB_DIRECTORY, DB_FILENAME);

interface EventCalendarRow {
  id: string;
  name: string;
  google_calendar_id: string;
  is_public: number;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
  last_sync_message: string | null;
}

interface EventCalendarSourceRow {
  calendar_id: string;
  url: string;
  source_type: string;
}

const SCHEMA_STATEMENTS = [
  `
  CREATE TABLE IF NOT EXISTS event_calendars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    google_calendar_id TEXT NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_synced_at TEXT,
    last_sync_message TEXT
  )
`,
  `
  CREATE TABLE IF NOT EXISTS event_calendar_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calendar_id TEXT NOT NULL REFERENCES event_calendars(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    source_type TEXT NOT NULL
  )
`,
  `CREATE INDEX IF NOT EXISTS idx_event_calendar_sources_calendar_id
   ON event_calendar_sources(calendar_id)`,
];

// Opened on first query rather than at import. Next.js evaluates route modules
// while collecting page data at build time, and better-sqlite3 is a native
// addon — connecting eagerly makes every production build depend on the
// addon's ABI matching the building Node, which fails the build outright.
let database: Database.Database | null = null;

const getDb = (): Database.Database => {
  if (database) return database;
  fs.mkdirSync(DB_DIRECTORY, { recursive: true });
  database = new Database(DB_PATH);
  for (const statement of SCHEMA_STATEMENTS) {
    database.prepare(statement).run();
  }
  // Tables created before sync tracking existed lack these columns.
  const columns = (
    database.prepare('PRAGMA table_info(event_calendars)').all() as {
      name: string;
    }[]
  ).map(column => column.name);
  for (const [column, type] of [
    ['last_synced_at', 'TEXT'],
    ['last_sync_message', 'TEXT'],
  ]) {
    if (!columns.includes(column)) {
      database
        .prepare(`ALTER TABLE event_calendars ADD COLUMN ${column} ${type}`)
        .run();
    }
  }
  return database;
};

const toEventCalendar = (
  row: EventCalendarRow,
  sources: EventCalendarSource[],
): EventCalendar => ({
  id: row.id,
  name: row.name,
  googleCalendarId: row.google_calendar_id,
  isPublic: !!row.is_public,
  sources,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lastSyncedAt: row.last_synced_at ?? undefined,
  lastSyncMessage: row.last_sync_message ?? undefined,
});

const loadSourcesByCalendarId = (): Map<string, EventCalendarSource[]> => {
  const rows = getDb()
    .prepare('SELECT calendar_id, url, source_type FROM event_calendar_sources')
    .all() as EventCalendarSourceRow[];

  return rows.reduce((grouped, row) => {
    const sources = grouped.get(row.calendar_id) ?? [];
    sources.push({
      url: row.url,
      sourceType: row.source_type as EventSourceType,
    });
    grouped.set(row.calendar_id, sources);
    return grouped;
  }, new Map<string, EventCalendarSource[]>());
};

const replaceSources = (calendarId: string, sources: EventCalendarSource[]) => {
  const db = getDb();
  db.transaction(() => {
    db.prepare('DELETE FROM event_calendar_sources WHERE calendar_id = ?').run(
      calendarId,
    );
    const insert = db.prepare(
      `INSERT INTO event_calendar_sources (calendar_id, url, source_type)
       VALUES (@calendar_id, @url, @source_type)`,
    );
    for (const source of sources) {
      insert.run({
        calendar_id: calendarId,
        url: source.url,
        source_type: source.sourceType,
      });
    }
  })();
};

export const listEventCalendars = (): EventCalendar[] => {
  const rows = getDb()
    .prepare('SELECT * FROM event_calendars ORDER BY created_at')
    .all() as EventCalendarRow[];
  const sourcesByCalendarId = loadSourcesByCalendarId();
  return rows.map(row =>
    toEventCalendar(row, sourcesByCalendarId.get(row.id) ?? []),
  );
};

export const getEventCalendar = (id: string): EventCalendar | null => {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM event_calendars WHERE id = ?')
    .get(id) as EventCalendarRow | undefined;
  if (!row) return null;

  const sources = db
    .prepare(
      'SELECT calendar_id, url, source_type FROM event_calendar_sources WHERE calendar_id = ?',
    )
    .all(id) as EventCalendarSourceRow[];

  return toEventCalendar(
    row,
    sources.map(source => ({
      url: source.url,
      sourceType: source.source_type as EventSourceType,
    })),
  );
};

export const insertEventCalendar = ({
  name,
  googleCalendarId,
  isPublic,
  sources,
}: {
  name: string;
  googleCalendarId: string;
  isPublic: boolean;
  sources: EventCalendarSource[];
}): EventCalendar => {
  const id = randomUUID();
  const now = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO event_calendars
     (id, name, google_calendar_id, is_public, created_at, updated_at)
     VALUES (@id, @name, @google_calendar_id, @is_public, @created_at, @updated_at)`,
    )
    .run({
      id,
      name,
      google_calendar_id: googleCalendarId,
      is_public: isPublic ? 1 : 0,
      created_at: now,
      updated_at: now,
    });

  replaceSources(id, sources);

  return {
    id,
    name,
    googleCalendarId,
    isPublic,
    sources,
    createdAt: now,
    updatedAt: now,
  };
};

export const updateEventCalendar = (
  id: string,
  updates: {
    name?: string;
    isPublic?: boolean;
    sources?: EventCalendarSource[];
  },
): EventCalendar | null => {
  const existing = getEventCalendar(id);
  if (!existing) return null;

  const updatedAt = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE event_calendars
     SET name = @name, is_public = @is_public, updated_at = @updated_at
     WHERE id = @id`,
    )
    .run({
      id,
      name: updates.name ?? existing.name,
      is_public: (updates.isPublic ?? existing.isPublic) ? 1 : 0,
      updated_at: updatedAt,
    });

  if (updates.sources) replaceSources(id, updates.sources);

  return getEventCalendar(id);
};

export const deleteEventCalendar = (id: string) => {
  const db = getDb();
  db.transaction(() => {
    db.prepare('DELETE FROM event_calendar_sources WHERE calendar_id = ?').run(
      id,
    );
    db.prepare('DELETE FROM event_calendars WHERE id = ?').run(id);
  })();
};

export const recordSyncResult = (id: string, message: string) => {
  getDb()
    .prepare(
      `UPDATE event_calendars
       SET last_synced_at = @last_synced_at, last_sync_message = @last_sync_message
       WHERE id = @id`,
    )
    .run({
      id,
      last_synced_at: new Date().toISOString(),
      last_sync_message: message,
    });
};
