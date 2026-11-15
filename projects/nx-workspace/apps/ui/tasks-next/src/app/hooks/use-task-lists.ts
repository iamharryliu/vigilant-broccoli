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
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetchJson<{ taskLists: TaskList[] }>(authFetch, API_ENDPOINT.TASK_LISTS)
      .then(data => setTaskLists(data.taskLists))
      .catch(() => setLoadFailed(true));
  }, [authFetch]);

  const createTaskList = useCallback(
    async (title: string) => {
      const { taskList } = await fetchJson<{ taskList: TaskList }>(
        authFetch,
        API_ENDPOINT.TASK_LISTS,
        jsonInit(HTTP_METHOD.POST, { title }),
      );
      setTaskLists(previous => [...(previous ?? []), taskList]);
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

  return {
    taskLists,
    loadFailed,
    createTaskList,
    renameTaskList,
    deleteTaskList,
  };
};
