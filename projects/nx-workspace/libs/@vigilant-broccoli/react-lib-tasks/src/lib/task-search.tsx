'use client';
import { useEffect, useState } from 'react';
import {
  SearchDialog,
  type SearchDialogItem,
} from '@vigilant-broccoli/react-lib';

const TASKS_ENDPOINT = '/api/tasks';
const ACTIVE_STATUS = 'active';

const ROW_ATTRIBUTE = 'data-checklist-item-id';
const HIGHLIGHT_CLASSES = ['ring-2', 'ring-blue-400', 'rounded'];
const HIGHLIGHT_MS = 1800;
// The row can mount after the selection (list switch, board switch, task fetch).
const FOCUS_POLL_MS = 100;
const FOCUS_MAX_ATTEMPTS = 30;

export const TASK_SEARCH_LABEL = 'Search tasks';

export interface TaskSearchList {
  id: string;
  title: string;
  // Shown before the list title, e.g. the board the list sits on.
  prefix?: string;
}

export interface TaskSearchItem extends SearchDialogItem {
  taskListId: string;
}

type AuthFetch = (input: string, init?: RequestInit) => Promise<Response>;

const fetchListItems = async (
  authFetch: AuthFetch,
  list: TaskSearchList,
): Promise<TaskSearchItem[]> => {
  try {
    const params = new URLSearchParams({
      taskListId: list.id,
      status: ACTIVE_STATUS,
    });
    const response = await authFetch(`${TASKS_ENDPOINT}?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    const description = list.prefix
      ? `${list.prefix} · ${list.title}`
      : list.title;
    return (data.tasks as { id: string; title: string }[]).map(task => ({
      id: task.id,
      title: task.title,
      description,
      taskListId: list.id,
    }));
  } catch {
    return [];
  }
};

// Loads the active tasks of every list each time the dialog opens, so results
// reflect edits made since the last search.
const useSearchItems = (
  open: boolean,
  lists: TaskSearchList[],
  authFetch: AuthFetch,
) => {
  const [items, setItems] = useState<TaskSearchItem[]>([]);
  const listsKey = lists.map(list => `${list.id}:${list.prefix}`).join(',');

  useEffect(() => {
    if (!open || lists.length === 0) return;
    let cancelled = false;
    Promise.all(lists.map(list => fetchListItems(authFetch, list))).then(
      results => {
        if (!cancelled) setItems(results.flat());
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, listsKey]);

  return items;
};

export const TaskSearchDialog = ({
  open,
  onOpenChange,
  lists,
  authFetch,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lists: TaskSearchList[];
  authFetch: AuthFetch;
  onSelect: (item: TaskSearchItem) => void;
}) => {
  const items = useSearchItems(open, lists, authFetch);
  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      onSelect={onSelect}
      title={TASK_SEARCH_LABEL}
      description="Search tasks across your task lists"
      placeholder="Search tasks..."
      emptyLabel="No matching tasks"
    />
  );
};

// Scrolls the task row into view and outlines it briefly.
export const focusTaskRow = (taskId: string) => {
  let attempts = 0;
  const attempt = () => {
    const row = document.querySelector<HTMLElement>(
      `[${ROW_ATTRIBUTE}="${CSS.escape(taskId)}"]`,
    );
    if (!row) {
      if (++attempts < FOCUS_MAX_ATTEMPTS) setTimeout(attempt, FOCUS_POLL_MS);
      return;
    }
    row.scrollIntoView({ block: 'center', inline: 'center' });
    row.classList.add(...HIGHLIGHT_CLASSES);
    setTimeout(() => row.classList.remove(...HIGHLIGHT_CLASSES), HIGHLIGHT_MS);
  };
  attempt();
};
