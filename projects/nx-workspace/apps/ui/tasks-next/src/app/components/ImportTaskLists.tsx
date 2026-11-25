'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { Button, CardContainer } from '@vigilant-broccoli/react-lib';
import type { KanbanStore } from '@vigilant-broccoli/react-lib-tasks';
import { API_ENDPOINT } from '../app.const';
import {
  type AuthFetch,
  type TaskList,
  fetchJson,
} from '../hooks/use-task-lists';
import { useTranslation } from '../i18n';
import {
  type TransferredKanban,
  mergeTransferredKanban,
} from './kanban-transfer';

type ImportedTask = {
  title: string;
  notes?: string;
  due?: string;
  status?: string;
};
type ImportedList = { title: string; tasks: ImportedTask[] };
type ParsedExport = { lists: ImportedList[]; kanban: TransferredKanban | null };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const optionalString = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined;

// Accepts the file written by the export card; throws on any other shape.
const parseKanban = (value: unknown): TransferredKanban | null => {
  if (!isRecord(value) || !Array.isArray(value.boards)) return null;
  return {
    boards: value.boards.filter(isRecord).map(board => ({
      name: optionalString(board.name) ?? '',
      lanes: (Array.isArray(board.lanes) ? board.lanes : [])
        .filter(isRecord)
        .flatMap(lane => {
          const taskListTitle = optionalString(lane.taskListTitle);
          return taskListTitle ? [{ taskListTitle }] : [];
        }),
    })),
    sortModes: isRecord(value.sortModes)
      ? (Object.fromEntries(
          Object.entries(value.sortModes).filter(
            ([, mode]) => typeof mode === 'string',
          ),
        ) as TransferredKanban['sortModes'])
      : {},
  };
};

const parseExport = (text: string): ParsedExport => {
  const data: unknown = JSON.parse(text);
  if (!isRecord(data) || !Array.isArray(data.taskLists)) {
    throw new Error('Not a task export');
  }
  const lists = data.taskLists.filter(isRecord).map(list => ({
    title: optionalString(list.title) ?? '',
    tasks: (Array.isArray(list.tasks) ? list.tasks : [])
      .filter(isRecord)
      .flatMap(task => {
        const title = optionalString(task.title);
        return title
          ? [
              {
                title,
                notes: optionalString(task.notes),
                due: optionalString(task.due),
                status: optionalString(task.status),
              },
            ]
          : [];
      }),
  }));
  return { lists, kanban: parseKanban(data.kanban) };
};

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
  body: JSON.stringify(body),
});

// Google assigns new ids, so lists are matched by title and created when
// missing. Stores with a bulk endpoint take a list in one request; Google
// takes one create per task, and inserts each at the top, so tasks go in
// reverse to leave the file's first task on top.
const importTaskList = async (
  authFetch: AuthFetch,
  list: ImportedList,
  existingLists: TaskList[],
  createTaskList: (title: string) => Promise<TaskList>,
  supportsBulkImport: boolean,
  onProgress: (imported: number) => void,
) => {
  const target =
    existingLists.find(existing => existing.title === list.title) ??
    (await createTaskList(list.title));
  if (supportsBulkImport) {
    await fetchJson(
      authFetch,
      API_ENDPOINT.IMPORT_TASKS,
      jsonInit(HTTP_METHOD.POST, {
        taskListId: target.id,
        tasks: list.tasks,
      }),
    );
    onProgress(list.tasks.length);
    return;
  }
  for (const task of [...list.tasks].reverse()) {
    await fetchJson(
      authFetch,
      API_ENDPOINT.TASKS,
      jsonInit(HTTP_METHOD.POST, { taskListId: target.id, ...task }),
    );
    onProgress(1);
  }
};

export function ImportTaskLists({
  authFetch,
  taskLists,
  loadFailed,
  kanbanStore,
  createTaskList,
  refreshTaskLists,
  supportsBulkImport,
}: {
  authFetch: AuthFetch;
  kanbanStore: KanbanStore;
  taskLists: TaskList[] | null;
  loadFailed: boolean;
  createTaskList: (title: string) => Promise<TaskList>;
  // Imports change task counts, which the lists state only reads on load.
  refreshTaskLists: () => Promise<void>;
  supportsBulkImport: boolean;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [importedBoards, setImportedBoards] = useState(0);
  const [fileHadBoards, setFileHadBoards] = useState(true);
  const [importFailed, setImportFailed] = useState(false);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Cleared so choosing the same file again still fires onChange.
    event.target.value = '';
    if (!file || !taskLists) return;
    setIsImporting(true);
    setImportFailed(false);
    setImportedCount(null);
    try {
      const { lists, kanban } = parseExport(await file.text());
      setImportedBoards(0);
      setFileHadBoards(Boolean(kanban?.boards.length));
      const known = [...taskLists];
      setTotalCount(lists.reduce((sum, list) => sum + list.tasks.length, 0));
      setImportedCount(0);
      for (const list of lists) {
        await importTaskList(
          authFetch,
          list,
          known,
          async title => {
            const created = await createTaskList(title);
            known.push(created);
            return created;
          },
          supportsBulkImport,
          imported => setImportedCount(previous => (previous ?? 0) + imported),
        );
      }
      if (kanban && kanban.boards.length > 0) {
        const loaded = await kanbanStore.load();
        if (!loaded.ok) throw new Error('Boards unavailable');
        const saved = await kanbanStore.save(
          mergeTransferredKanban(loaded.state, kanban, known),
        );
        if (!saved) throw new Error('Boards not saved');
        setImportedBoards(kanban.boards.length);
      }
    } catch {
      setImportFailed(true);
    } finally {
      await refreshTaskLists().catch(() => setImportFailed(true));
      setIsImporting(false);
    }
  };

  return (
    <CardContainer title={t('SETTINGS.IMPORT.TITLE')}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {t('SETTINGS.IMPORT.DESCRIPTION')}
        </p>
        {loadFailed && <p>{t('SETTINGS.EXPORT.LOAD_FAILED')}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={event => void handleFile(event)}
        />
        <div>
          <Button
            disabled={!taskLists || isImporting}
            onClick={() => inputRef.current?.click()}
          >
            {isImporting
              ? t('SETTINGS.IMPORT.IMPORTING')
              : t('SETTINGS.IMPORT.SUBMIT')}
          </Button>
        </div>
        {importedCount !== null && (
          <p>
            {isImporting
              ? t('SETTINGS.IMPORT.PROGRESS', {
                  count: importedCount,
                  total: totalCount,
                })
              : t('SETTINGS.IMPORT.DONE', { count: importedCount })}
          </p>
        )}
        {importedBoards > 0 && !isImporting && (
          <p>{t('SETTINGS.IMPORT.BOARDS_DONE', { count: importedBoards })}</p>
        )}
        {importedCount !== null && !isImporting && !fileHadBoards && (
          <p className="text-sm text-muted-foreground">
            {t('SETTINGS.IMPORT.NO_BOARDS')}
          </p>
        )}
        {importFailed && (
          <p className="text-destructive">{t('SETTINGS.IMPORT.FAILED')}</p>
        )}
      </div>
    </CardContainer>
  );
}
