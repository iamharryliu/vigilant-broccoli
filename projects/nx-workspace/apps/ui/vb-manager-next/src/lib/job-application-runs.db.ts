import { mkdirSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { DatabaseSync } from 'node:sqlite';
import {
  BackgroundTask,
  TASK_KIND,
  TASK_STATUS,
  TaskStatus,
} from '../app/constants/background-tasks';

// Per-machine on purpose: runs write PDFs and resume.json on this Mac, so the
// history is only meaningful here. Outside the Job Applications folder so the
// explorer never lists it. Uses Node's built-in SQLite rather than
// better-sqlite3, whose native binding is built for the shell's Node and fails
// to load under PM2's interpreter.
const DB_PATH = join(homedir(), '.vigilant-broccoli', 'vb-manager.db');
const RUNS_TABLE = 'job_application_runs';
const INTERRUPTED_NOTE =
  '\nInterrupted: the server restarted during this run\n';

interface RunRow {
  id: string;
  title: string;
  status: TaskStatus;
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
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
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
    TASK_STATUS.FAILED,
    new Date().toISOString(),
    INTERRUPTED_NOTE,
    TASK_STATUS.RUNNING,
  );
  return db;
};

const getDb = () => (globalStore.jobApplicationRunsDb ??= openDb());

const toTask = (row: RunRow): BackgroundTask => ({
  id: row.id,
  kind: TASK_KIND.JOB_APPLICATION,
  title: row.title,
  status: row.status,
  startedAt: row.started_at,
  finishedAt: row.finished_at ?? undefined,
  output: row.output,
});

export const insertJobApplicationRun = (task: BackgroundTask) => {
  getDb()
    .prepare(
      `INSERT INTO ${RUNS_TABLE} (id, title, status, started_at, output)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(task.id, task.title, task.status, task.startedAt, task.output ?? '');
};

export const updateJobApplicationRunOutput = (id: string, output: string) => {
  getDb()
    .prepare(`UPDATE ${RUNS_TABLE} SET output = ? WHERE id = ?`)
    .run(output, id);
};

export const finishJobApplicationRun = (task: BackgroundTask) => {
  getDb()
    .prepare(
      `UPDATE ${RUNS_TABLE}
       SET status = ?, finished_at = ?, output = ?
       WHERE id = ?`,
    )
    .run(
      task.status,
      task.finishedAt ?? new Date().toISOString(),
      task.output ?? '',
      task.id,
    );
};

export const listJobApplicationRuns = (): BackgroundTask[] =>
  (
    getDb()
      .prepare(`SELECT * FROM ${RUNS_TABLE} ORDER BY started_at DESC`)
      .all() as unknown as RunRow[]
  ).map(toTask);

export const hasRunningJobApplicationRun = () =>
  !!getDb()
    .prepare(`SELECT 1 FROM ${RUNS_TABLE} WHERE status = ? LIMIT 1`)
    .get(TASK_STATUS.RUNNING);

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
    .run(TASK_STATUS.RUNNING, TASK_STATUS.RUNNING, keep);
};
