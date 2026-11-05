'use client';

import { useCallback, useEffect, useState } from 'react';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  BackgroundTask,
  TASK_KIND_LABELS,
  TASK_STATUS,
  TaskStatus,
} from '../constants/background-tasks';

const POLL_INTERVAL_MS = 3000;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

const STATUS_CLASS_NAMES: Record<TaskStatus, string> = {
  [TASK_STATUS.RUNNING]:
    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  [TASK_STATUS.SUCCEEDED]:
    'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  [TASK_STATUS.PARTIAL]:
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  [TASK_STATUS.FAILED]:
    'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const formatDuration = (task: BackgroundTask, now: number) => {
  const end = task.finishedAt ? new Date(task.finishedAt).getTime() : now;
  const seconds = Math.max(
    0,
    Math.floor((end - new Date(task.startedAt).getTime()) / MS_PER_SECOND),
  );
  return `${Math.floor(seconds / SECONDS_PER_MINUTE)}m ${String(seconds % SECONDS_PER_MINUTE).padStart(2, '0')}s`;
};

const TaskCard = ({ task, now }: { task: BackgroundTask; now: number }) => (
  <div className="rounded-md border border-gray-200 p-3 dark:border-gray-800">
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_CLASS_NAMES[task.status]}`}
      >
        {task.status}
      </span>
      <span className="text-sm font-medium">{task.title}</span>
      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {TASK_KIND_LABELS[task.kind]} ·{' '}
        {new Date(task.startedAt).toLocaleString()} ·{' '}
        {formatDuration(task, now)}
      </span>
    </div>
    {task.output && (
      <details className="mt-2" open={task.status === TASK_STATUS.RUNNING}>
        <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">
          Output
        </summary>
        <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
          {task.output}
        </pre>
      </details>
    )}
  </div>
);

export const BackgroundTasksComponent = () => {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.BACKGROUND_TASKS);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTasks(data.tasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoaded(true);
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loaded && !error && !tasks.length && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No background tasks yet.
        </p>
      )}
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} now={now} />
      ))}
    </div>
  );
};
