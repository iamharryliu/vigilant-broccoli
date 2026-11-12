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
      created_at TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    )
  `);
  // Databases created before manual ordering lack the column; rows backfill to
  // newest-first, matching where new tasks land.
  const columns = (
    db.prepare(`PRAGMA table_info(${TASKS_TABLE})`).all() as { name: string }[]
  ).map(column => column.name);
  if (!columns.includes('position')) {
    db.exec(
      `ALTER TABLE ${TASKS_TABLE} ADD COLUMN position INTEGER NOT NULL DEFAULT 0`,
    );
    db.exec(`UPDATE ${TASKS_TABLE} SET position = -rowid`);
  }
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
      .prepare(`SELECT * FROM ${TASKS_TABLE} ORDER BY position, rowid`)
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
  // Below every existing position, so the task lists first.
  ensureTable()
    .prepare(
      `INSERT INTO ${TASKS_TABLE} (id, title, checked, completed_at, created_at, position)
       VALUES (?, ?, 0, NULL, ?, (SELECT COALESCE(MIN(position), 1) - 1 FROM ${TASKS_TABLE}))`,
    )
    .run(task.id, task.title, task.createdAt);
  return task;
};

export const reorderTasks = (ids: string[]) => {
  const update = ensureTable().prepare(
    `UPDATE ${TASKS_TABLE} SET position = ? WHERE id = ?`,
  );
  ids.forEach((id, index) => update.run(index, id));
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
