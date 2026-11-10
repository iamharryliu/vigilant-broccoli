'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  Text,
} from '@vigilant-broccoli/react-lib';
import { TaskScheduleFields } from './TaskScheduleFields';
import { ALL_DAYS, RecurringTask, describeDays, isDaily } from './tasks.utils';

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
};

export function TaskManagerDialog({
  open,
  onOpenChange,
  tasks,
  onSave,
  onDelete,
}: Props) {
  const [draft, setDraft] = useState<TaskDraft | null>(null);

  const updateDraft = (update: (prev: TaskDraft) => TaskDraft) =>
    setDraft(prev => (prev ? update(prev) : prev));

  const canSave =
    !!draft && draft.title.trim() !== '' && isValidSchedule(draft);

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
