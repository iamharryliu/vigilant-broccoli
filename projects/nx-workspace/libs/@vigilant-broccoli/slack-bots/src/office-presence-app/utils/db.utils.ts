import { UserPresence, UserPresenceRow, UserPresences } from '../types';
import Database from 'better-sqlite3';
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
