import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { DatabaseSync } from 'node:sqlite';
import {
  ACTIVE_RUN_STATUSES,
  JobApplicationRun,
  RUN_KIND,
  RUN_STATUS,
  RunKind,
  RunStatus,
} from '../app/constants/runs';
import { RUNS_DB_PATH } from './paths.server';

const RUNS_TABLE = 'job_application_runs';
const KIND_COLUMN = 'kind';
const INTERRUPTED_NOTE =
  '\nInterrupted: the server restarted during this run\n';
const ACTIVE_PLACEHOLDERS = ACTIVE_RUN_STATUSES.map(() => '?').join(', ');

interface RunRow {
  id: string;
  kind: RunKind;
  title: string;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  output: string;
}

// Next bundles each route separately, so a module-level handle would open one
// connection per route.
const globalStore = globalThis as typeof globalThis & {
  jobApplicationRunsDb?: DatabaseSync;
};

const openDb = () => {
  mkdirSync(dirname(RUNS_DB_PATH), { recursive: true });
  const db = new DatabaseSync(RUNS_DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${RUNS_TABLE} (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      output TEXT NOT NULL DEFAULT ''
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      folder TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  // Databases created before import runs existed lack the kind column.
  const columns = db
    .prepare(`PRAGMA table_info(${RUNS_TABLE})`)
    .all() as unknown as { name: string }[];
  if (!columns.some(({ name }) => name === KIND_COLUMN)) {
    db.exec(
      `ALTER TABLE ${RUNS_TABLE} ADD COLUMN ${KIND_COLUMN} TEXT NOT NULL DEFAULT '${RUN_KIND.JOB_APPLICATION}'`,
    );
  }
  // The db is opened once per server process, before any run of this process
  // starts, so a row still running belongs to a process that no longer exists.
  // Queued rows fail too: their prompts lived only in the old process's queue.
  db.prepare(
    `UPDATE ${RUNS_TABLE}
     SET status = ?, finished_at = ?, output = output || ?
     WHERE status IN (${ACTIVE_PLACEHOLDERS})`,
  ).run(
    RUN_STATUS.FAILED,
    new Date().toISOString(),
    INTERRUPTED_NOTE,
    ...ACTIVE_RUN_STATUSES,
  );
  return db;
};

const getDb = () => (globalStore.jobApplicationRunsDb ??= openDb());

// The same file also holds the application statuses.
export const getJobHuntDb = getDb;

const toRun = (row: RunRow): JobApplicationRun => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  status: row.status,
  startedAt: row.started_at,
  finishedAt: row.finished_at ?? undefined,
  output: row.output,
});

export const insertJobApplicationRun = (task: JobApplicationRun) => {
  getDb()
    .prepare(
      `INSERT INTO ${RUNS_TABLE} (id, ${KIND_COLUMN}, title, status, started_at, output)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      task.id,
      task.kind,
      task.title,
      task.status,
      task.startedAt,
      task.output,
    );
};

export const updateJobApplicationRunOutput = (id: string, output: string) => {
  getDb()
    .prepare(`UPDATE ${RUNS_TABLE} SET output = ? WHERE id = ?`)
    .run(output, id);
};

export const finishJobApplicationRun = (task: JobApplicationRun) => {
  getDb()
    .prepare(
      `UPDATE ${RUNS_TABLE}
       SET status = ?, finished_at = ?, output = ?
       WHERE id = ?`,
    )
    .run(
      task.status,
      task.finishedAt ?? new Date().toISOString(),
      task.output,
      task.id,
    );
};

export const listJobApplicationRuns = (): JobApplicationRun[] =>
  (
    getDb()
      .prepare(`SELECT * FROM ${RUNS_TABLE} ORDER BY started_at DESC`)
      .all() as unknown as RunRow[]
  ).map(toRun);

export const markJobApplicationRunStarted = (task: JobApplicationRun) => {
  getDb()
    .prepare(`UPDATE ${RUNS_TABLE} SET status = ?, started_at = ? WHERE id = ?`)
    .run(task.status, task.startedAt, task.id);
};

export const hasActiveJobApplicationRun = () =>
  !!getDb()
    .prepare(
      `SELECT 1 FROM ${RUNS_TABLE} WHERE status IN (${ACTIVE_PLACEHOLDERS}) LIMIT 1`,
    )
    .get(...ACTIVE_RUN_STATUSES);

// Keeps the newest `keep` finished runs; a running or queued row is never
// pruned.
export const pruneJobApplicationRuns = (keep: number) => {
  getDb()
    .prepare(
      `DELETE FROM ${RUNS_TABLE}
       WHERE status NOT IN (${ACTIVE_PLACEHOLDERS})
         AND id NOT IN (
           SELECT id FROM ${RUNS_TABLE}
           WHERE status NOT IN (${ACTIVE_PLACEHOLDERS})
           ORDER BY started_at DESC
           LIMIT ?
         )`,
    )
    .run(...ACTIVE_RUN_STATUSES, ...ACTIVE_RUN_STATUSES, keep);
};
