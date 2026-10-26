import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { DatabaseSync } from 'node:sqlite';
import {
  JobApplicationRun,
  RUN_STATUS,
  RunStatus,
} from '../app/constants/runs';
import { RUNS_DB_PATH } from './paths.server';

const RUNS_TABLE = 'job_application_runs';
const INTERRUPTED_NOTE =
  '\nInterrupted: the server restarted during this run\n';

interface RunRow {
  id: string;
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
  // The db is opened once per server process, before any run of this process
  // starts, so a row still running belongs to a process that no longer exists.
  db.prepare(
    `UPDATE ${RUNS_TABLE}
     SET status = ?, finished_at = ?, output = output || ?
     WHERE status = ?`,
  ).run(
    RUN_STATUS.FAILED,
    new Date().toISOString(),
    INTERRUPTED_NOTE,
    RUN_STATUS.RUNNING,
  );
  return db;
};

const getDb = () => (globalStore.jobApplicationRunsDb ??= openDb());

const toRun = (row: RunRow): JobApplicationRun => ({
  id: row.id,
  title: row.title,
  status: row.status,
  startedAt: row.started_at,
  finishedAt: row.finished_at ?? undefined,
  output: row.output,
});

export const insertJobApplicationRun = (task: JobApplicationRun) => {
  getDb()
    .prepare(
      `INSERT INTO ${RUNS_TABLE} (id, title, status, started_at, output)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(task.id, task.title, task.status, task.startedAt, task.output);
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

export const hasRunningJobApplicationRun = () =>
  !!getDb()
    .prepare(`SELECT 1 FROM ${RUNS_TABLE} WHERE status = ? LIMIT 1`)
    .get(RUN_STATUS.RUNNING);

// Keeps the newest `keep` finished runs; a running row is never pruned.
export const pruneJobApplicationRuns = (keep: number) => {
  getDb()
    .prepare(
      `DELETE FROM ${RUNS_TABLE}
       WHERE status != ?
         AND id NOT IN (
           SELECT id FROM ${RUNS_TABLE}
           WHERE status != ?
           ORDER BY started_at DESC
           LIMIT ?
         )`,
    )
    .run(RUN_STATUS.RUNNING, RUN_STATUS.RUNNING, keep);
};
