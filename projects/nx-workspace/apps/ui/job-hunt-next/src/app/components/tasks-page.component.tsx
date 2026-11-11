'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  Button,
  CheckList,
  CheckListItem,
  IconButton,
  Input,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { IS_DEMO } from '../constants/demo';
import { useTranslation } from '../i18n';

const STORAGE_KEY_PREFIX = 'job-hunt-tasks';

interface Task extends CheckListItem {
  createdAt: string;
}

const taskUrl = (id: string) =>
  `${API_ENDPOINTS.TASKS}?id=${encodeURIComponent(id)}`;

const write = (url: string, method: string, body?: unknown) =>
  fetch(url, {
    method,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(res => (res.ok ? res : Promise.reject(res)));

export const TasksPage = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const load = useCallback(() => {
    fetch(API_ENDPOINTS.TASKS)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => {
        setTasks(data.tasks);
        setError(null);
      })
      .catch(() => setError(t('TASKS.LOAD_FAILED')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(load, [load]);

  const patchTask = (id: string, patch: Partial<Task>) =>
    setTasks(current =>
      current.map(task => (task.id === id ? { ...task, ...patch } : task)),
    );

  // Optimistic: the row shows isRemoving while its write is pending and rolls
  // back to the original on failure.
  const mutate = (
    id: string,
    optimistic: Partial<Task>,
    request: () => Promise<unknown>,
  ) => {
    const original = tasks.find(task => task.id === id);
    if (!original) return;
    patchTask(id, { ...optimistic, isRemoving: true });
    request()
      .then(() => patchTask(id, { isRemoving: false }))
      .catch(() => {
        patchTask(id, { ...original, isRemoving: false });
        toast.error(t('TASKS.WRITE_FAILED'));
      });
  };

  const toggle = (item: CheckListItem) => {
    if (item.isRemoving) return;
    const checked = !item.checked;
    mutate(item.id, { checked }, () =>
      write(taskUrl(item.id), HTTP_METHOD.PATCH, { checked }),
    );
  };

  const saveEdit = () => {
    const title = editingTitle.trim();
    const id = editingId;
    setEditingId(null);
    if (!id || !title) return;
    mutate(id, { title }, () =>
      write(taskUrl(id), HTTP_METHOD.PATCH, { title }),
    );
  };

  const remove = (id: string) => {
    const original = tasks.find(task => task.id === id);
    if (!original) return;
    patchTask(id, { isRemoving: true });
    write(taskUrl(id), HTTP_METHOD.DELETE)
      .then(() => setTasks(current => current.filter(task => task.id !== id)))
      .catch(() => {
        patchTask(id, { isRemoving: false });
        toast.error(t('TASKS.WRITE_FAILED'));
      });
  };

  const add = (event: FormEvent) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    write(API_ENDPOINTS.TASKS, HTTP_METHOD.POST, { title })
      .then(res => res.json())
      .then(data => setTasks(current => [...current, data.task]))
      .catch(() => {
        setDraft(title);
        toast.error(t('TASKS.WRITE_FAILED'));
      });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <form onSubmit={add} className="flex gap-2">
        <Input
          value={draft}
          disabled={IS_DEMO}
          placeholder={t('TASKS.PLACEHOLDER')}
          onChange={event => setDraft(event.target.value)}
        />
        <Button type="submit" disabled={IS_DEMO || !draft.trim()}>
          {t('TASKS.ADD')}
        </Button>
      </form>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CheckList
          items={tasks}
          loading={loading}
          error={error}
          editingItemId={editingId}
          editingItemTitle={editingTitle}
          onToggleCheck={toggle}
          onStartEdit={item => {
            setEditingId(item.id);
            setEditingTitle(item.title);
          }}
          onEditChange={setEditingTitle}
          onSaveEdit={saveEdit}
          onCancelEdit={() => setEditingId(null)}
          editor="input"
          rowVariant="dense"
          size="3"
          storageKeyPrefix={STORAGE_KEY_PREFIX}
          emptyLabel={t('TASKS.EMPTY')}
          renderItemAccessory={item => (
            <IconButton
              icon="trash"
              aria-label={t('TASKS.DELETE')}
              variant="ghost"
              disabled={IS_DEMO || item.isRemoving}
              onClick={() => remove(item.id)}
            />
          )}
        />
      </div>
    </div>
  );
};
