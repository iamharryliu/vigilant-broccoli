import type {
  JobMatchesBookmarkletPosting,
  StoredJobMatchesPosting,
} from '@vigilant-broccoli/common-js';
import { getJobHuntDb } from './job-application-runs.db';

const MATCHES_TABLE = 'job_matches';

interface MatchRow {
  url: string;
  title: string;
  text: string;
  posted: string;
  easy_apply: number | null;
  captured_at: string;
}

const ensureTable = () => {
  const db = getJobHuntDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${MATCHES_TABLE} (
      url TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      captured_at TEXT NOT NULL
    )
  `);
  // Databases created before these columns existed lack them.
  const columns = (
    db.prepare(`PRAGMA table_info(${MATCHES_TABLE})`).all() as {
      name: string;
    }[]
  ).map(column => column.name);
  if (!columns.includes('posted')) {
    db.exec(
      `ALTER TABLE ${MATCHES_TABLE} ADD COLUMN posted TEXT NOT NULL DEFAULT ''`,
    );
  }
  // Null marks a posting captured before Easy Apply was recorded.
  if (!columns.includes('easy_apply')) {
    db.exec(`ALTER TABLE ${MATCHES_TABLE} ADD COLUMN easy_apply INTEGER`);
  }
  return db;
};

export const listMatchPostings = (): StoredJobMatchesPosting[] =>
  (
    ensureTable()
      .prepare(
        `SELECT url, title, text, posted, easy_apply, captured_at FROM ${MATCHES_TABLE} ORDER BY rowid`,
      )
      .all() as unknown as MatchRow[]
  ).map(({ captured_at, easy_apply, ...row }) => ({
    ...row,
    easyApply: easy_apply === null ? undefined : easy_apply === 1,
    capturedAt: captured_at,
  }));

// A posting captured again replaces its earlier copy, so a later search that
// overlaps an earlier one refreshes it instead of duplicating it.
export const saveMatchPostings = (postings: JobMatchesBookmarkletPosting[]) => {
  const db = ensureTable();
  const upsert = db.prepare(
    `INSERT INTO ${MATCHES_TABLE} (url, title, text, posted, easy_apply, captured_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET title = excluded.title, text = excluded.text, posted = excluded.posted, easy_apply = excluded.easy_apply, captured_at = excluded.captured_at`,
  );
  const capturedAt = new Date().toISOString();
  db.exec('BEGIN');
  try {
    postings.forEach(({ url, title, text, posted, easyApply }) =>
      upsert.run(
        url,
        title,
        text,
        posted ?? '',
        easyApply === undefined ? null : Number(easyApply),
        capturedAt,
      ),
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

export const deleteMatchPosting = (url: string) => {
  ensureTable().prepare(`DELETE FROM ${MATCHES_TABLE} WHERE url = ?`).run(url);
};

export const clearMatchPostings = () => {
  ensureTable().exec(`DELETE FROM ${MATCHES_TABLE}`);
};
