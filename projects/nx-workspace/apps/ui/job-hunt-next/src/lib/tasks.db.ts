import { randomUUID } from 'crypto';
import { getJobHuntDb } from './job-application-runs.db';

const TASKS_TABLE = 'tasks';

export interface TaskRecord {
  id: string;
  title: string;
  checked: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface TaskRow {
  id: string;
  title: string;
  checked: number;
  completed_at: string | null;
  created_at: string;
}

const ensureTable = () => {
  const db = getJobHuntDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${TASKS_TABLE} (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      checked INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL
    )
  `);
  return db;
};

const toRecord = (row: TaskRow): TaskRecord => ({
  id: row.id,
  title: row.title,
  checked: row.checked === 1,
  completedAt: row.completed_at,
  createdAt: row.created_at,
});

export const listTasks = (): TaskRecord[] =>
  (
    ensureTable()
      .prepare(`SELECT * FROM ${TASKS_TABLE} ORDER BY created_at, rowid`)
      .all() as unknown as TaskRow[]
  ).map(toRecord);

export const createTask = (title: string): TaskRecord => {
  const task: TaskRecord = {
    id: randomUUID(),
    title,
    checked: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
  ensureTable()
    .prepare(
      `INSERT INTO ${TASKS_TABLE} (id, title, checked, completed_at, created_at) VALUES (?, ?, 0, NULL, ?)`,
    )
    .run(task.id, task.title, task.createdAt);
  return task;
};

export const updateTask = (
  id: string,
  patch: { title?: string; checked?: boolean },
): boolean => {
  const db = ensureTable();
  if (patch.title !== undefined) {
    db.prepare(`UPDATE ${TASKS_TABLE} SET title = ? WHERE id = ?`).run(
      patch.title,
      id,
    );
  }
  if (patch.checked !== undefined) {
    db.prepare(
      `UPDATE ${TASKS_TABLE} SET checked = ?, completed_at = ? WHERE id = ?`,
    ).run(
      patch.checked ? 1 : 0,
      patch.checked ? new Date().toISOString() : null,
      id,
    );
  }
  return (
    db.prepare(`SELECT 1 FROM ${TASKS_TABLE} WHERE id = ?`).get(id) !==
    undefined
  );
};

export const deleteTask = (id: string) => {
  ensureTable().prepare(`DELETE FROM ${TASKS_TABLE} WHERE id = ?`).run(id);
};
