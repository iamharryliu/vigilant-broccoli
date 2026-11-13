'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Download, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { JSON_CONTENT_TYPE } from '@vigilant-broccoli/common-js';
import { TaskScheduleFields } from './TaskScheduleFields';
import {
  ALL_DAYS,
  RecurringTask,
  describeDays,
  isDaily,
  toDefaultTask,
} from './tasks.utils';

const RECURRING_TASKS_FILENAME = 'recurring-tasks.json';

export type TaskDraft = Omit<RecurringTask, 'id'> & { id: string | null };

const EMPTY_DRAFT: TaskDraft = {
  id: null,
  title: '',
  days: ALL_DAYS,
  monthlyNth: null,
};

const isValidSchedule = ({ days, monthlyNth }: TaskDraft) =>
  days.length > 0 && (!monthlyNth || monthlyNth.length > 0);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: RecurringTask[];
  onSave: (task: TaskDraft) => void;
  onDelete: (id: string) => void;
  onImport: (tasks: unknown) => void;
};

export function TaskManagerDialog({
  open,
  onOpenChange,
  tasks,
  onSave,
  onDelete,
  onImport,
}: Props) {
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const updateDraft = (update: (prev: TaskDraft) => TaskDraft) =>
    setDraft(prev => (prev ? update(prev) : prev));

  const canSave =
    !!draft && draft.title.trim() !== '' && isValidSchedule(draft);

  const handleExport = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(tasks.map(toDefaultTask), null, 2)], {
        type: JSON_CONTENT_TYPE,
      }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = RECURRING_TASKS_FILENAME;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportText('');
    setImportError(null);
  };

  const importJson = (json: string) => {
    try {
      onImport(JSON.parse(json));
      closeImport();
    } catch {
      setImportError('Not valid JSON.');
    }
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) importJson(await file.text());
  };

  const handleSave = () => {
    if (!draft) return;
    onSave({ ...draft, title: draft.title.trim() });
    setDraft(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          fullScreenOnMobile
          className="block max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto"
        >
          <DialogTitle className="mb-3 text-xl font-bold">
            Manage tasks
          </DialogTitle>

          <Button
            variant="outline"
            className="mb-3 w-full"
            onClick={() => setDraft(EMPTY_DRAFT)}
          >
            <Plus size={14} />
            Add task
          </Button>

          <div className="mb-3 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleExport}>
              <Download size={14} />
              Export
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setImportOpen(true)}
            >
              <Upload size={14} />
              Import
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Text size="2" className="max-w-full truncate">
                    {task.title}
                  </Text>
                  <Badge size="1" color={isDaily(task) ? 'blue' : 'purple'}>
                    {describeDays(task)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${task.title}`}
                  onClick={() => setDraft(task)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={open => !open && closeImport()}>
        <DialogContent
          aria-describedby={undefined}
          fullScreenOnMobile
          className="block max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto"
        >
          <DialogTitle className="mb-3 text-xl font-bold">
            Import tasks
          </DialogTitle>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => importFileRef.current?.click()}
            >
              <Upload size={14} />
              Upload file
            </Button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <Text size="1" color="gray">
              Or paste JSON
            </Text>
            <Textarea
              rows={8}
              value={importText}
              placeholder='[{ "title": "Morning dog walk", "days": [0, 1, 2, 3, 4, 5, 6] }]'
              onChange={e => {
                setImportText(e.target.value);
                setImportError(null);
              }}
            />
            {importError && (
              <Text size="1" color="red">
                {importError}
              </Text>
            )}
            <Button
              disabled={!importText.trim()}
              onClick={() => importJson(importText)}
            >
              Import text
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!draft} onOpenChange={open => !open && setDraft(null)}>
        <DialogContent
          aria-describedby={undefined}
          fullScreenOnMobile
          className="block max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto"
        >
          {draft && (
            <>
              <DialogTitle className="mb-3 text-xl font-bold">
                {draft.id ? 'Edit task' : 'New task'}
              </DialogTitle>
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Task name"
                  value={draft.title}
                  onChange={e =>
                    updateDraft(prev => ({ ...prev, title: e.target.value }))
                  }
                  autoFocus
                />
                <TaskScheduleFields
                  schedule={draft}
                  onChange={update =>
                    updateDraft(prev => ({ ...prev, ...update(prev) }))
                  }
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDraft(null)}>
                    Cancel
                  </Button>
                  <Button disabled={!canSave} onClick={handleSave}>
                    {draft.id ? 'Save' : 'Add task'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
