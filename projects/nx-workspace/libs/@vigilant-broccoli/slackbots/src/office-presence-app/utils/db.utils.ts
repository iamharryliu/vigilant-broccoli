import {
  UserPresence,
  UserPresenceRow,
  UserPresences,
  OfficeEvent,
  OfficeEventRow,
  UserSettings,
  UserSettingsRow,
} from '../types';
import Database from 'better-sqlite3';
import { Language } from '../consts/app-copy.const';

// The local mock points this at ':memory:' so it never touches the real state.
const db = new Database(process.env.OFFICE_PRESENCE_DB ?? 'state.db');

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS user_presences (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    office TEXT,
    presence_time TEXT,
    is_bringing_dog INTEGER,
    message TEXT,
    PRIMARY KEY (user_id, date)
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS office_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    description TEXT,
    attendees TEXT
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    default_office TEXT,
    show_weekdays_only INTEGER,
    show_team_count INTEGER
  )
`,
).run();

const userSettingsColumns = (
  db.prepare(`PRAGMA table_info(user_settings)`).all() as { name: string }[]
).map(r => r.name);

for (const [col, type] of [
  ['show_weekdays_only', 'INTEGER'],
  ['show_team_count', 'INTEGER'],
  ['language', 'TEXT'],
] as [string, string][]) {
  if (!userSettingsColumns.includes(col)) {
    db.prepare(`ALTER TABLE user_settings ADD COLUMN ${col} ${type}`).run();
  }
}

// `todayISO` is the viewer's today: the server's own (UTC) date can be a day off.
export function loadAllPresences(todayISO: string): UserPresences {
  const rows = db
    .prepare('SELECT * FROM user_presences WHERE date >= ?')
    .all(todayISO) as UserPresenceRow[];
  const result: UserPresences = {};
  for (const r of rows) {
    if (!result[r.user_id]) result[r.user_id] = {};
    result[r.user_id][r.date] = {
      office: r.office,
      presenceTime: r.presence_time,
      isBringingDog: !!r.is_bringing_dog,
      message: r.message,
    };
  }
  return result;
}

export function savePresence(
  userId: string,
  date: string,
  presence: UserPresence,
) {
  db.prepare(
    `
    INSERT INTO user_presences
    (user_id, date, office, presence_time, is_bringing_dog, message)
    VALUES (@user_id, @date, @office, @presence_time, @is_bringing_dog, @message)
    ON CONFLICT(user_id, date) DO UPDATE SET
      office=excluded.office,
      presence_time=excluded.presence_time,
      is_bringing_dog=excluded.is_bringing_dog,
      message=excluded.message
  `,
  ).run({
    user_id: userId,
    date,
    office: presence.office,
    presence_time: presence.presenceTime ?? null,
    is_bringing_dog: presence.isBringingDog ? 1 : 0,
    message: presence.message,
  });
}

export function deletePresence(userId: string, date: string) {
  db.prepare(
    `
    DELETE FROM user_presences
    WHERE user_id = ? AND date = ?
    `,
  ).run(userId, date);
}

export function loadEventsByDate(date: string): OfficeEvent[] {
  const rows = db
    .prepare('SELECT * FROM office_events WHERE date = ? ORDER BY time')
    .all(date) as OfficeEventRow[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    date: row.date,
    time: row.time,
    creatorId: row.creator_id,
    description: row.description,
    attendees: row.attendees ? JSON.parse(row.attendees) : [],
  }));
}

export function loadAllEvents(todayISO: string): OfficeEvent[] {
  const rows = db
    .prepare('SELECT * FROM office_events WHERE date >= ? ORDER BY date, time')
    .all(todayISO) as OfficeEventRow[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    date: row.date,
    time: row.time,
    creatorId: row.creator_id,
    description: row.description,
    attendees: row.attendees ? JSON.parse(row.attendees) : [],
  }));
}

export function saveEvent(event: OfficeEvent): number {
  const result = db
    .prepare(
      `
    INSERT INTO office_events
    (name, date, time, creator_id, description, attendees)
    VALUES (@name, @date, @time, @creator_id, @description, @attendees)
  `,
    )
    .run({
      name: event.name,
      date: event.date,
      time: event.time,
      creator_id: event.creatorId,
      description: event.description || null,
      attendees: event.attendees ? JSON.stringify(event.attendees) : null,
    });
  return result.lastInsertRowid as number;
}

export function loadEventById(eventId: number): OfficeEvent | null {
  const row = db
    .prepare('SELECT * FROM office_events WHERE id = ?')
    .get(eventId) as OfficeEventRow | undefined;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    date: row.date,
    time: row.time,
    creatorId: row.creator_id,
    description: row.description,
    attendees: row.attendees ? JSON.parse(row.attendees) : [],
  };
}

export function updateEventAttendees(eventId: number, attendees: string[]) {
  db.prepare(
    `
    UPDATE office_events
    SET attendees = @attendees
    WHERE id = @id
  `,
  ).run({
    id: eventId,
    attendees: JSON.stringify(attendees),
  });
}

export function deleteEvent(eventId: number) {
  db.prepare('DELETE FROM office_events WHERE id = ?').run(eventId);
}

export function loadUserSettings(userId: string): UserSettings {
  const row = db
    .prepare('SELECT * FROM user_settings WHERE user_id = ?')
    .get(userId) as UserSettingsRow | undefined;
  if (!row) return {};
  return {
    defaultOffice: row.default_office,
    showWeekdaysOnly:
      row.show_weekdays_only != null ? !!row.show_weekdays_only : undefined,
    showTeamCount:
      row.show_team_count != null ? !!row.show_team_count : undefined,
    language: (row.language as Language) ?? undefined,
  };
}

export function saveUserSettings(userId: string, settings: UserSettings) {
  db.prepare(
    `
    INSERT INTO user_settings (user_id, default_office, show_weekdays_only, show_team_count, language)
    VALUES (@user_id, @default_office, @show_weekdays_only, @show_team_count, @language)
    ON CONFLICT(user_id) DO UPDATE SET
      default_office=excluded.default_office,
      show_weekdays_only=excluded.show_weekdays_only,
      show_team_count=excluded.show_team_count,
      language=excluded.language
  `,
  ).run({
    user_id: userId,
    default_office: settings.defaultOffice ?? null,
    show_weekdays_only:
      settings.showWeekdaysOnly != null ? +settings.showWeekdaysOnly : null,
    show_team_count:
      settings.showTeamCount != null ? +settings.showTeamCount : null,
    language: settings.language ?? null,
  });
}

export function updateEvent(eventId: number, event: OfficeEvent) {
  db.prepare(
    `
    UPDATE office_events
    SET name = @name,
        date = @date,
        time = @time,
        description = @description,
        attendees = @attendees
    WHERE id = @id
  `,
  ).run({
    id: eventId,
    name: event.name,
    date: event.date,
    time: event.time,
    description: event.description || null,
    attendees: event.attendees ? JSON.stringify(event.attendees) : null,
  });
}

// Seeded members are recognised by their reserved id prefix; GLOB (unlike LIKE) treats `_` literally.
// Bounds are inclusive ISO dates.
export function deleteSeededRows(prefix: string, from: string, to: string) {
  const params = { pattern: `${prefix}*`, from, to };
  db.prepare(
    `DELETE FROM user_presences
     WHERE user_id GLOB @pattern AND date >= @from AND date <= @to`,
  ).run(params);
  db.prepare(
    `DELETE FROM office_events
     WHERE creator_id GLOB @pattern AND date >= @from AND date <= @to`,
  ).run(params);
}

export function deleteSeededRowsBefore(prefix: string, date: string) {
  const params = { pattern: `${prefix}*`, date };
  db.prepare(
    'DELETE FROM user_presences WHERE user_id GLOB @pattern AND date < @date',
  ).run(params);
  db.prepare(
    'DELETE FROM office_events WHERE creator_id GLOB @pattern AND date < @date',
  ).run(params);
}

// Members dropped from the seeded roster would otherwise linger as raw ids until their dates pass.
export function deleteSeededRowsOfOtherUsers(
  prefix: string,
  userIds: string[],
) {
  const params = { pattern: `${prefix}*`, userIds: JSON.stringify(userIds) };
  db.prepare(
    `DELETE FROM user_presences WHERE user_id GLOB @pattern
     AND user_id NOT IN (SELECT value FROM json_each(@userIds))`,
  ).run(params);
  db.prepare(
    `DELETE FROM office_events WHERE creator_id GLOB @pattern
     AND creator_id NOT IN (SELECT value FROM json_each(@userIds))`,
  ).run(params);
}

export function hasSeededRows(prefix: string): boolean {
  return !!db
    .prepare('SELECT 1 FROM user_settings WHERE user_id GLOB ? LIMIT 1')
    .get(`${prefix}*`);
}

export function deleteSeededSettings(prefix: string) {
  db.prepare('DELETE FROM user_settings WHERE user_id GLOB ?').run(
    `${prefix}*`,
  );
}

// Never overwrites: a real member's own entry for the day always wins over a seeded one.
export function savePresenceIfMissing(
  userId: string,
  date: string,
  presence: UserPresence,
) {
  db.prepare(
    `
    INSERT OR IGNORE INTO user_presences
    (user_id, date, office, presence_time, is_bringing_dog, message)
    VALUES (@user_id, @date, @office, @presence_time, @is_bringing_dog, @message)
  `,
  ).run({
    user_id: userId,
    date,
    office: presence.office ?? null,
    presence_time: presence.presenceTime ?? null,
    is_bringing_dog: presence.isBringingDog ? 1 : 0,
    message: presence.message ?? null,
  });
}

export function runInTransaction<T>(work: () => T): T {
  return db.transaction(work)();
}
