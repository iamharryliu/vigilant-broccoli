import { getJobHuntDb } from './job-application-runs.db';

const NOTES_TABLE = 'notes';
const NOTES_ID = 1;

interface NotesRow {
  content: string;
  updated_at: string;
}

const ensureTable = () => {
  const db = getJobHuntDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${NOTES_TABLE} (
      id INTEGER PRIMARY KEY CHECK (id = ${NOTES_ID}),
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  return db;
};

export const getNotes = () => {
  const row = ensureTable()
    .prepare(`SELECT content, updated_at FROM ${NOTES_TABLE} WHERE id = ?`)
    .get(NOTES_ID) as unknown as NotesRow | undefined;
  return { content: row?.content ?? '', updatedAt: row?.updated_at ?? null };
};

export const saveNotes = (content: string) => {
  const updatedAt = new Date().toISOString();
  ensureTable()
    .prepare(
      `INSERT INTO ${NOTES_TABLE} (id, content, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
    )
    .run(NOTES_ID, content, updatedAt);
  return { content, updatedAt };
};
