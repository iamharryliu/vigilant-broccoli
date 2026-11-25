'use client';

import { FormEvent, useState } from 'react';
import { Pencil, Star, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  CardContainer,
  EllipsisCTA,
  Input,
} from '@vigilant-broccoli/react-lib';
import type { TaskList } from '../hooks/use-task-lists';
import { useTranslation } from '../i18n';

const KEY = { ENTER: 'Enter', ESCAPE: 'Escape' } as const;
const ACTION_ICON_SIZE = 16;

function TaskListRow({
  taskList,
  activeTaskCount,
  isDefault,
  isDeletable,
  onRename,
  onSetDefault,
  onDelete,
  onError,
}: {
  taskList: TaskList;
  activeTaskCount: number | undefined;
  isDefault: boolean;
  isDeletable: boolean;
  onRename: (title: string) => Promise<void>;
  onSetDefault: () => void;
  onDelete: () => Promise<void>;
  onError: () => void;
}) {
  const { t } = useTranslation();
  const [draftTitle, setDraftTitle] = useState<string | null>(null);

  const saveRename = async () => {
    const title = draftTitle?.trim();
    setDraftTitle(null);
    if (!title || title === taskList.title) return;
    await onRename(title).catch(onError);
  };

  return (
    <li className="flex items-center gap-2">
      {draftTitle === null ? (
        <>
          <span className="min-w-0 truncate">{taskList.title}</span>
          {isDefault && (
            <Badge color="blue">{t('SETTINGS.TASK_LISTS.DEFAULT_BADGE')}</Badge>
          )}
          <span className="flex-1" />
          {activeTaskCount !== undefined && (
            <Badge color="gray" title={t('SETTINGS.TASK_LISTS.COUNT_TITLE')}>
              {activeTaskCount}
            </Badge>
          )}
        </>
      ) : (
        <Input
          autoFocus
          aria-label={t('SETTINGS.TASK_LISTS.RENAME')}
          value={draftTitle}
          onChange={event => setDraftTitle(event.target.value)}
          onBlur={() => void saveRename()}
          onKeyDown={event => {
            if (event.key === KEY.ENTER) event.currentTarget.blur();
            if (event.key === KEY.ESCAPE) setDraftTitle(null);
          }}
        />
      )}
      {/* Only Google refuses to delete its default list, which it returns
          first; the local and database stores can delete any list but the last. */}
      <EllipsisCTA
        actions={[
          {
            label: t('SETTINGS.TASK_LISTS.RENAME'),
            icon: <Pencil size={ACTION_ICON_SIZE} />,
            onSelect: () => setDraftTitle(taskList.title),
          },
          {
            label: t('SETTINGS.TASK_LISTS.SET_DEFAULT'),
            icon: <Star size={ACTION_ICON_SIZE} />,
            disabled: isDefault,
            onSelect: onSetDefault,
          },
          {
            label: isDeletable
              ? t('SETTINGS.TASK_LISTS.DELETE')
              : t('SETTINGS.TASK_LISTS.DEFAULT_UNDELETABLE'),
            color: 'red',
            disabled: !isDeletable,
            onSelect: () => onDelete().catch(onError),
            confirm: {
              title: t('SETTINGS.TASK_LISTS.DELETE_TITLE'),
              description: t('SETTINGS.TASK_LISTS.DELETE_DESCRIPTION', {
                title: taskList.title,
              }),
              confirmLabel: t('SETTINGS.TASK_LISTS.DELETE'),
            },
          },
        ]}
      />
    </li>
  );
}

export function TaskListsManager({
  taskLists,
  activeTaskCounts,
  loadFailed,
  defaultTaskListId,
  canDeleteFirstList,
  createTaskList,
  renameTaskList,
  deleteTaskList,
  deleteTaskLists,
  setDefaultTaskList,
}: {
  taskLists: TaskList[] | null;
  activeTaskCounts: Record<string, number>;
  loadFailed: boolean;
  defaultTaskListId: string | null;
  canDeleteFirstList: boolean;
  createTaskList: (title: string) => Promise<unknown>;
  renameTaskList: (taskListId: string, title: string) => Promise<void>;
  deleteTaskList: (taskListId: string) => Promise<void>;
  deleteTaskLists: (taskListIds: string[]) => Promise<void>;
  setDefaultTaskList: (taskListId: string | null) => void;
}) {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setIsCreating(true);
    setActionFailed(false);
    try {
      await createTaskList(title);
      setNewTitle('');
    } catch {
      setActionFailed(true);
    } finally {
      setIsCreating(false);
    }
  };

  // A stored default whose list was deleted falls back to the first list.
  const effectiveDefaultId = taskLists?.some(
    list => list.id === defaultTaskListId,
  )
    ? defaultTaskListId
    : taskLists?.[0]?.id;

  // Google keeps its first list, so only the others are deletable there.
  const deletableIds = (taskLists ?? [])
    .filter((_, index) => canDeleteFirstList || index !== 0)
    .map(list => list.id);

  const handleDeleteAll = async () => {
    setActionFailed(false);
    await deleteTaskLists(deletableIds).catch(() => setActionFailed(true));
    setDefaultTaskList(null);
  };

  const handleDelete = async (taskListId: string) => {
    await deleteTaskList(taskListId);
    if (taskListId === defaultTaskListId) setDefaultTaskList(null);
  };

  const renderLists = () => {
    if (loadFailed) return <p>{t('SETTINGS.EXPORT.LOAD_FAILED')}</p>;
    if (!taskLists) return <p>{t('SETTINGS.EXPORT.LOADING')}</p>;
    return (
      <ul className="flex flex-col gap-1">
        {taskLists.map((taskList, index) => (
          <TaskListRow
            key={taskList.id}
            taskList={taskList}
            activeTaskCount={activeTaskCounts[taskList.id]}
            isDefault={taskList.id === effectiveDefaultId}
            isDeletable={
              canDeleteFirstList ? taskLists.length > 1 : index !== 0
            }
            onRename={title => renameTaskList(taskList.id, title)}
            onSetDefault={() => setDefaultTaskList(taskList.id)}
            onDelete={() => handleDelete(taskList.id)}
            onError={() => setActionFailed(true)}
          />
        ))}
      </ul>
    );
  };

  return (
    <CardContainer
      title={t('SETTINGS.TASK_LISTS.TITLE')}
      headerAction={
        <EllipsisCTA
          actions={[
            {
              label: t('SETTINGS.TASK_LISTS.DELETE_ALL'),
              icon: <Trash2 size={ACTION_ICON_SIZE} />,
              color: 'red',
              disabled: deletableIds.length === 0,
              onSelect: handleDeleteAll,
              confirm: {
                title: t('SETTINGS.TASK_LISTS.DELETE_ALL_TITLE'),
                description: canDeleteFirstList
                  ? t('SETTINGS.TASK_LISTS.DELETE_ALL_DESCRIPTION_RECREATED')
                  : t('SETTINGS.TASK_LISTS.DELETE_ALL_DESCRIPTION'),
                confirmLabel: t('SETTINGS.TASK_LISTS.DELETE_ALL'),
              },
            },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3">
        <form
          className="flex gap-2"
          onSubmit={event => void handleCreate(event)}
        >
          <Input
            aria-label={t('SETTINGS.TASK_LISTS.NEW_PLACEHOLDER')}
            placeholder={t('SETTINGS.TASK_LISTS.NEW_PLACEHOLDER')}
            value={newTitle}
            onChange={event => setNewTitle(event.target.value)}
          />
          <Button type="submit" disabled={!newTitle.trim() || isCreating}>
            {t('SETTINGS.TASK_LISTS.CREATE')}
          </Button>
        </form>
        {renderLists()}
        {actionFailed && (
          <p className="text-destructive">{t('SETTINGS.TASK_LISTS.FAILED')}</p>
        )}
      </div>
    </CardContainer>
  );
}
