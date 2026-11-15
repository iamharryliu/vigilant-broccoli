'use client';

import { FormEvent, useState } from 'react';
import {
  Button,
  CardContainer,
  DeleteItemConfirmationDialog,
  IconButton,
  Input,
} from '@vigilant-broccoli/react-lib';
import type { TaskList } from '../hooks/use-task-lists';
import { useTranslation } from '../i18n';

const KEY = { ENTER: 'Enter', ESCAPE: 'Escape' } as const;

function TaskListRow({
  taskList,
  isDefault,
  onRename,
  onDelete,
  onError,
}: {
  taskList: TaskList;
  isDefault: boolean;
  onRename: (title: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onError: () => void;
}) {
  const { t } = useTranslation();
  const [draftTitle, setDraftTitle] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const saveRename = async () => {
    const title = draftTitle?.trim();
    setDraftTitle(null);
    if (!title || title === taskList.title) return;
    await onRename(title).catch(onError);
  };

  return (
    <li className="flex items-center gap-2">
      {draftTitle === null ? (
        <span className="min-w-0 flex-1 truncate">{taskList.title}</span>
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
      <IconButton
        variant="ghost"
        icon="edit"
        title={t('SETTINGS.TASK_LISTS.RENAME')}
        onClick={() => setDraftTitle(taskList.title)}
      />
      {/* Google refuses to delete the default list, which it returns first. */}
      <IconButton
        variant="ghost"
        icon="trash"
        disabled={isDefault}
        title={
          isDefault
            ? t('SETTINGS.TASK_LISTS.DEFAULT_UNDELETABLE')
            : t('SETTINGS.TASK_LISTS.DELETE')
        }
        onClick={() => setIsDeleteOpen(true)}
      />
      <DeleteItemConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('SETTINGS.TASK_LISTS.DELETE_TITLE')}
        description={t('SETTINGS.TASK_LISTS.DELETE_DESCRIPTION', {
          title: taskList.title,
        })}
        deleteItem={() => onDelete().catch(onError)}
      />
    </li>
  );
}

export function TaskListsManager({
  taskLists,
  loadFailed,
  createTaskList,
  renameTaskList,
  deleteTaskList,
}: {
  taskLists: TaskList[] | null;
  loadFailed: boolean;
  createTaskList: (title: string) => Promise<void>;
  renameTaskList: (taskListId: string, title: string) => Promise<void>;
  deleteTaskList: (taskListId: string) => Promise<void>;
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

  const renderLists = () => {
    if (loadFailed) return <p>{t('SETTINGS.EXPORT.LOAD_FAILED')}</p>;
    if (!taskLists) return <p>{t('SETTINGS.EXPORT.LOADING')}</p>;
    return (
      <ul className="flex flex-col gap-1">
        {taskLists.map((taskList, index) => (
          <TaskListRow
            key={taskList.id}
            taskList={taskList}
            isDefault={index === 0}
            onRename={title => renameTaskList(taskList.id, title)}
            onDelete={() => deleteTaskList(taskList.id)}
            onError={() => setActionFailed(true)}
          />
        ))}
      </ul>
    );
  };

  return (
    <CardContainer title={t('SETTINGS.TASK_LISTS.TITLE')}>
      <div className="flex flex-col gap-3">
        {renderLists()}
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
        {actionFailed && (
          <p className="text-destructive">{t('SETTINGS.TASK_LISTS.FAILED')}</p>
        )}
      </div>
    </CardContainer>
  );
}
