import {
  UserPresence,
  UserPresenceRow,
  UserPresences,
  OfficeEvent,
  OfficeEventRow,
} from '../types';
import * as Database from 'better-sqlite3';
import { formatISODateLocal } from './date.utils';

const db = new Database('state.db');

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

export function loadAllPresences(): UserPresences {
  const rows = db
    .prepare('SELECT * FROM user_presences')
    .all() as UserPresenceRow[];
  const result: UserPresences = {};
  const todayISO = formatISODateLocal(new Date());
  for (const r of rows) {
    if (r.date < todayISO) continue;
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

export function loadAllEvents(): OfficeEvent[] {
  const todayISO = formatISODateLocal(new Date());
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
