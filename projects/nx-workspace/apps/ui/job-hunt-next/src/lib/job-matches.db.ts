import type {
  JobMatchesBookmarkletPosting,
  JobMatchesBookmarkletSkip,
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
  archived: number;
  applied: number;
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
  if (!columns.includes('applied')) {
    db.exec(
      `ALTER TABLE ${MATCHES_TABLE} ADD COLUMN applied INTEGER NOT NULL DEFAULT 0`,
    );
  }
  if (!columns.includes('archived')) {
    db.exec(
      `ALTER TABLE ${MATCHES_TABLE} ADD COLUMN archived INTEGER NOT NULL DEFAULT 0`,
    );
  }
  return db;
};

export const listMatchPostings = (): StoredJobMatchesPosting[] =>
  (
    ensureTable()
      .prepare(
        `SELECT url, title, text, posted, easy_apply, archived, applied, captured_at FROM ${MATCHES_TABLE} ORDER BY rowid`,
      )
      .all() as unknown as MatchRow[]
  ).map(({ captured_at, easy_apply, archived, applied, ...row }) => ({
    ...row,
    easyApply: easy_apply === null ? undefined : easy_apply === 1,
    capturedAt: captured_at,
    archived: archived === 1,
    applied: applied === 1,
  }));

// A recapture leaves both flags alone: the upsert below does not update them.
// Applied is only meaningful while archived, so restoring clears it.
export const setMatchPostingArchived = (
  url: string,
  archived: boolean,
  applied: boolean,
) =>
  ensureTable()
    .prepare(
      `UPDATE ${MATCHES_TABLE} SET archived = ?, applied = ? WHERE url = ?`,
    )
    .run(Number(archived), Number(archived && applied), url).changes > 0;

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

// Cards a scan opened but could not turn into a posting, newest last; only
// the latest ones are kept.
const SKIPS_TABLE = 'job_match_skips';
const MAX_SKIPS = 500;

export interface MatchSkipRow extends JobMatchesBookmarkletSkip {
  loggedAt: string;
}

const ensureSkipsTable = () => {
  const db = getJobHuntDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${SKIPS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      reason TEXT NOT NULL,
      detail TEXT NOT NULL,
      logged_at TEXT NOT NULL
    )
  `);
  return db;
};

export const saveMatchSkips = (skips: JobMatchesBookmarkletSkip[]) => {
  if (!skips.length) return;
  const db = ensureSkipsTable();
  const insert = db.prepare(
    `INSERT INTO ${SKIPS_TABLE} (title, reason, detail, logged_at) VALUES (?, ?, ?, ?)`,
  );
  const loggedAt = new Date().toISOString();
  skips.forEach(({ title, reason, detail }) =>
    insert.run(title, reason, detail, loggedAt),
  );
  db.prepare(
    `DELETE FROM ${SKIPS_TABLE} WHERE id <= (SELECT MAX(id) FROM ${SKIPS_TABLE}) - ?`,
  ).run(MAX_SKIPS);
};

export const listMatchSkips = (): MatchSkipRow[] =>
  (
    ensureSkipsTable()
      .prepare(
        `SELECT title, reason, detail, logged_at FROM ${SKIPS_TABLE} ORDER BY id`,
      )
      .all() as unknown as {
      title: string;
      reason: MatchSkipRow['reason'];
      detail: string;
      logged_at: string;
    }[]
  ).map(({ logged_at, ...row }) => ({ ...row, loggedAt: logged_at }));

export const clearMatchSkips = () => {
  ensureSkipsTable().exec(`DELETE FROM ${SKIPS_TABLE}`);
};

export const deleteMatchPosting = (url: string) => {
  ensureTable().prepare(`DELETE FROM ${MATCHES_TABLE} WHERE url = ?`).run(url);
};

export const clearMatchPostings = () => {
  ensureTable().exec(`DELETE FROM ${MATCHES_TABLE}`);
};
