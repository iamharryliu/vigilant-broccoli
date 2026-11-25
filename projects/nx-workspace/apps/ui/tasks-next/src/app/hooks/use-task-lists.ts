'use client';

import { useCallback, useEffect, useState } from 'react';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import type { GoogleTasksAuthAdapter } from '@vigilant-broccoli/react-lib-tasks';
import { API_ENDPOINT } from '../app.const';

export type TaskList = { id: string; title: string };
export type AuthFetch = GoogleTasksAuthAdapter['authFetch'];

export const fetchJson = async <T>(
  authFetch: AuthFetch,
  url: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await authFetch(url, init);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
};

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
  body: JSON.stringify(body),
});

const taskListUrl = (taskListId: string) =>
  `${API_ENDPOINT.TASK_LISTS}?${new URLSearchParams({ taskListId })}`;

// One list state for the Settings cards, so renames and deletes show in the
// export selection too. Mutations update state only after the API confirms.
export const useTaskLists = (authFetch: AuthFetch) => {
  const [taskLists, setTaskLists] = useState<TaskList[] | null>(null);
  const [activeTaskCounts, setActiveTaskCounts] = useState<
    Record<string, number>
  >({});
  const [loadFailed, setLoadFailed] = useState(false);

  const loadTaskLists = useCallback(async () => {
    const data = await fetchJson<{
      taskLists: TaskList[];
      activeTaskCounts?: Record<string, number>;
    }>(authFetch, API_ENDPOINT.TASK_LISTS);
    setTaskLists(data.taskLists);
    setActiveTaskCounts(data.activeTaskCounts ?? {});
  }, [authFetch]);

  useEffect(() => {
    loadTaskLists().catch(() => setLoadFailed(true));
  }, [loadTaskLists]);

  const createTaskList = useCallback(
    async (title: string) => {
      const { taskList } = await fetchJson<{ taskList: TaskList }>(
        authFetch,
        API_ENDPOINT.TASK_LISTS,
        jsonInit(HTTP_METHOD.POST, { title }),
      );
      setTaskLists(previous => [...(previous ?? []), taskList]);
      setActiveTaskCounts(previous => ({ ...previous, [taskList.id]: 0 }));
      return taskList;
    },
    [authFetch],
  );

  const renameTaskList = useCallback(
    async (taskListId: string, title: string) => {
      const { taskList } = await fetchJson<{ taskList: TaskList }>(
        authFetch,
        taskListUrl(taskListId),
        jsonInit(HTTP_METHOD.PATCH, { title }),
      );
      setTaskLists(previous =>
        (previous ?? []).map(list =>
          list.id === taskListId ? { ...list, title: taskList.title } : list,
        ),
      );
    },
    [authFetch],
  );

  const deleteTaskList = useCallback(
    async (taskListId: string) => {
      await fetchJson(authFetch, taskListUrl(taskListId), {
        method: HTTP_METHOD.DELETE,
      });
      setTaskLists(previous =>
        (previous ?? []).filter(list => list.id !== taskListId),
      );
    },
    [authFetch],
  );

  // Deletes every list in `taskListIds`, then reloads: the local store
  // recreates an empty default list when its last one is deleted.
  const deleteTaskLists = useCallback(
    async (taskListIds: string[]) => {
      for (const taskListId of taskListIds) {
        await fetchJson(authFetch, taskListUrl(taskListId), {
          method: HTTP_METHOD.DELETE,
        });
      }
      await loadTaskLists();
    },
    [authFetch, loadTaskLists],
  );

  return {
    taskLists,
    activeTaskCounts,
    loadFailed,
    refreshTaskLists: loadTaskLists,
    deleteTaskLists,
    createTaskList,
    renameTaskList,
    deleteTaskList,
  };
};
