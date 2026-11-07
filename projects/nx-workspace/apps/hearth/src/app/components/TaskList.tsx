'use client';

import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Settings } from 'lucide-react';
import {
  Badge,
  Button,
  CheckList,
  CheckListItem,
  DropdownMenu,
  IconButton,
  Input,
  Progress,
  Text,
} from '@vigilant-broccoli/react-lib';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { IS_DEV } from '../app.consts';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { useAuthHeader, useJsonAuthHeaders } from '../hooks/use-auth-headers';
import { ChecklistItem } from '../../lib/types';
import { toYmd } from '../../lib/date-utils';
import { TaskDraft, TaskManagerDialog } from './TaskManagerDialog';
import { AssignTaskDialog } from './AssignTaskDialog';
import { TaskListSkeleton } from './TaskListSkeleton';
import {
  LEGACY_TASK_STORAGE_KEYS,
  RecurringTask,
  TASKS_API,
  TaskAssignee,
  TaskCompletion,
  formatInstanceDate,
  getAssigneeLabel,
  getPendingDueDate,
} from './tasks.utils';

const ASSIGN_LABEL = 'Assign';
const DELETE_LABEL = 'Delete';
const ACCEPTED_STATUS = 'accepted';

const toPositions = (list: { id: string }[]) =>
  list.map(({ id }, position) => ({ id, position }));

// Pending invites have no user yet, so only accepted members are assignable.
const toAssignees = (members: unknown): TaskAssignee[] =>
  Array.isArray(members)
    ? members
        .filter(
          (member: Record<string, string | null>) =>
            member.status === ACCEPTED_STATUS && member.user_id,
        )
        .map((member: Record<string, string>) => ({
          userId: member.user_id,
          email: member.email,
          displayName: member.display_name ?? null,
        }))
    : [];

export function TaskList() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const authHeader = useAuthHeader();
  const jsonHeaders = useJsonAuthHeaders();
  const token = session?.access_token ?? '';

  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [oneOffTasks, setOneOffTasks] = useState<ChecklistItem[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerOpen, setManagerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [members, setMembers] = useState<TaskAssignee[]>([]);
  const [assigningItem, setAssigningItem] = useState<CheckListItem | null>(
    null,
  );

  useEffect(() => {
    LEGACY_TASK_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!homeId || !token) return;
    const headers = await authHeader();
    const [recurring, oneOff, completions, homeMembers] = await Promise.all(
      [
        `${TASKS_API.RECURRING}?homeId=${homeId}`,
        `${TASKS_API.ONE_OFF}?homeId=${homeId}`,
        `${TASKS_API.COMPLETIONS}?homeId=${homeId}`,
        `/api/homes/${homeId}/members`,
      ].map(async url => (await fetch(url, { headers })).json()),
    );
    setTasks(Array.isArray(recurring) ? recurring : []);
    setOneOffTasks(Array.isArray(oneOff) ? oneOff : []);
    setCompletions(Array.isArray(completions) ? completions : []);
    setMembers(toAssignees(homeMembers));
  }, [homeId, token, authHeader]);

  useEffect(() => {
    setTasks([]);
    setOneOffTasks([]);
    setCompletions([]);
    setMembers([]);
    setLoading(true);
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  const send = async (url: string, method: string, body: unknown) =>
    fetch(url, {
      method,
      headers: await jsonHeaders(),
      body: JSON.stringify(body),
    });

  const isOneOff = (id: string) => oneOffTasks.some(task => task.id === id);
  const isTask = (id: string) => tasks.some(task => task.id === id);

  const today = new Date();
  const todayYmd = toYmd(today);

  // Each recurring task has at most one pending instance (keyed by task id) and
  // one completed instance per completion (keyed by completion id).
  const pendingItems = tasks.flatMap(task => {
    const dueDate = getPendingDueDate(task, completions, today);
    if (!dueDate) return [];
    const overdue =
      dueDate === todayYmd ? '' : ` (due ${formatInstanceDate(dueDate)})`;
    return [{ id: task.id, title: `${task.title}${overdue}`, checked: false }];
  });
  const completedItems = completions.flatMap(({ id, taskId, date }) => {
    const task = tasks.find(({ id: candidate }) => candidate === taskId);
    return task
      ? [
          {
            id,
            title: `${task.title} (${formatInstanceDate(date)})`,
            checked: true,
          },
        ]
      : [];
  });
  const items: CheckListItem[] = [
    ...pendingItems,
    ...completedItems,
    ...oneOffTasks.map(task => ({
      id: task.id,
      title: task.name,
      checked: task.completed,
    })),
  ];

  // Instances completed on an earlier day stay listed but are left out of
  // today's progress.
  const progressItems = items.filter(item => {
    const completion = completions.find(({ id }) => id === item.id);
    if (completion) return completion.date === todayYmd;
    const oneOff = oneOffTasks.find(task => task.id === item.id);
    return (
      !oneOff?.completedAt || toYmd(new Date(oneOff.completedAt)) === todayYmd
    );
  });
  const completedCount = progressItems.filter(item => item.checked).length;
  const progress = progressItems.length
    ? (completedCount / progressItems.length) * 100
    : 0;

  const updateOneOff = (id: string, changes: Partial<ChecklistItem>) =>
    setOneOffTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...changes } : task)),
    );

  const resetToDefaultTasks = async () => {
    if (!homeId) return;
    const res = await send(TASKS_API.RECURRING_RESET, HTTP_METHOD.POST, {
      homeId,
    });
    const reset = await res.json();
    if (Array.isArray(reset)) {
      setTasks(reset);
      setCompletions([]);
    }
  };

  const handleAdd = async () => {
    const name = newTitle.trim();
    if (!name || !homeId) return;
    setNewTitle('');
    const res = await send(TASKS_API.ONE_OFF, HTTP_METHOD.POST, {
      name,
      homeId,
    });
    const created = await res.json();
    if (created?.id) setOneOffTasks(prev => [...prev, created]);
  };

  const handleToggle = (item: CheckListItem) => {
    const completed = !item.checked;
    if (isOneOff(item.id)) {
      updateOneOff(item.id, {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
      send(TASKS_API.ONE_OFF, HTTP_METHOD.PATCH, { id: item.id, completed });
      return;
    }
    const completion = completions.find(({ id }) => id === item.id);
    if (completion) {
      setCompletions(prev => prev.filter(({ id }) => id !== completion.id));
      send(TASKS_API.COMPLETIONS, HTTP_METHOD.POST, {
        taskId: completion.taskId,
        date: completion.date,
        completed: false,
      });
      return;
    }
    completeTask(item.id);
  };

  // The temporary id is swapped for the stored completion's id once known, so
  // the instance never shares a key with the pending row.
  const completeTask = async (taskId: string) => {
    const date = toYmd(new Date());
    const tempId = `pending-${taskId}-${date}`;
    setCompletions(prev => [...prev, { id: tempId, taskId, date }]);
    const res = await send(TASKS_API.COMPLETIONS, HTTP_METHOD.POST, {
      taskId,
      date,
      completed: true,
    });
    const saved = await res.json();
    if (saved?.id)
      setCompletions(prev =>
        prev.map(entry => (entry.id === tempId ? saved : entry)),
      );
  };

  const handleDeleteOneOff = (id: string) => {
    setOneOffTasks(prev => prev.filter(task => task.id !== id));
    send(TASKS_API.ONE_OFF, HTTP_METHOD.DELETE, { id });
  };

  const handleStartEdit = (item: CheckListItem) => {
    // Recurring tasks are renamed in the manager dialog.
    if (!isOneOff(item.id)) return;
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSaveEdit = () => {
    const name = editingTitle.trim();
    if (editingId && name) {
      updateOneOff(editingId, { name });
      send(TASKS_API.ONE_OFF, HTTP_METHOD.PATCH, { id: editingId, name });
    }
    handleCancelEdit();
  };

  // The list mixes both kinds, so a drop only reorders when both rows belong
  // to the same one; the moved index is taken from the full array so recurring
  // tasks without a pending instance keep their place. Completed instances
  // match neither kind.
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const move = <T extends { id: string }>(list: T[]) =>
      arrayMove(
        list,
        list.findIndex(task => task.id === active.id),
        list.findIndex(task => task.id === over.id),
      );
    if (isOneOff(String(active.id)) && isOneOff(String(over.id))) {
      const next = move(oneOffTasks);
      setOneOffTasks(next);
      send(TASKS_API.ONE_OFF, HTTP_METHOD.PATCH, { order: toPositions(next) });
    } else if (isTask(String(active.id)) && isTask(String(over.id))) {
      const next = move(tasks);
      setTasks(next);
      send(TASKS_API.RECURRING, HTTP_METHOD.PATCH, {
        order: toPositions(next),
      });
    }
  };

  const handleSaveTask = async ({ id, title, days }: TaskDraft) => {
    if (id) {
      setTasks(prev =>
        prev.map(task => (task.id === id ? { ...task, title, days } : task)),
      );
      send(TASKS_API.RECURRING, HTTP_METHOD.PATCH, { id, title, days });
      return;
    }
    if (!homeId) return;
    const res = await send(TASKS_API.RECURRING, HTTP_METHOD.POST, {
      homeId,
      title,
      days,
    });
    const created = await res.json();
    if (created?.id) setTasks(prev => [...prev, created]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setCompletions(prev => prev.filter(({ taskId }) => taskId !== id));
    send(TASKS_API.RECURRING, HTTP_METHOD.DELETE, { id });
  };

  const onNewKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const getAssignedUserId = (id: string) => {
    const taskId = completions.find(entry => entry.id === id)?.taskId ?? id;
    return (
      (
        oneOffTasks.find(task => task.id === taskId) ??
        tasks.find(t => t.id === taskId)
      )?.assignedUserId ?? null
    );
  };

  const handleAssign = (assignedUserId: string | null) => {
    if (!assigningItem) return;
    const { id } = assigningItem;
    setAssigningItem(null);
    if (isOneOff(id)) {
      updateOneOff(id, { assignedUserId });
      send(TASKS_API.ONE_OFF, HTTP_METHOD.PATCH, { id, assignedUserId });
      return;
    }
    const taskId = completions.find(entry => entry.id === id)?.taskId ?? id;
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, assignedUserId } : task,
      ),
    );
    send(TASKS_API.RECURRING, HTTP_METHOD.PATCH, {
      id: taskId,
      assignedUserId,
    });
  };

  // An assignee who has since left the home is missing from members, so the
  // badge is omitted rather than shown with a bare id.
  const renderItemAccessory = (item: CheckListItem) => {
    const assignedUserId = getAssignedUserId(item.id);
    const assignee = members.find(member => member.userId === assignedUserId);
    return (
      <div
        className="flex shrink-0 items-center gap-2"
        onClick={e => e.stopPropagation()}
      >
        {assignee && (
          <Badge variant="soft" size="1" className="max-w-32 truncate">
            {getAssigneeLabel(assignee)}
          </Badge>
        )}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton icon="ellipsis-vertical" variant="ghost" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setAssigningItem(item)}>
              {ASSIGN_LABEL}
            </DropdownMenu.Item>
            {isOneOff(item.id) && (
              <DropdownMenu.Item
                color="red"
                onSelect={() => handleDeleteOneOff(item.id)}
              >
                {DELETE_LABEL}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    );
  };

  if (!homeId) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Progress value={progress} aria-label="Tasks completed" />
        <Text size="1" color="gray" className="shrink-0">
          {completedCount}/{progressItems.length}
        </Text>
      </div>
      {IS_DEV && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={resetToDefaultTasks}
        >
          Reset recurring tasks to default
        </Button>
      )}
      <div className="flex gap-2">
        <Input
          className="grow"
          placeholder="Add a task"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={onNewKeyDown}
        />
        <Button onClick={handleAdd} disabled={!newTitle.trim()}>
          Add
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Manage recurring tasks"
          onClick={() => setManagerOpen(true)}
        >
          <Settings size={16} />
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {loading ? (
          <TaskListSkeleton />
        ) : (
          <CheckList
            items={items}
            enableDragDrop
            listId="recurring-tasks"
            editingItemId={editingId}
            editingItemTitle={editingTitle}
            onToggleCheck={handleToggle}
            onStartEdit={handleStartEdit}
            onEditChange={setEditingTitle}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            editor="input"
            rowVariant="dense"
            size="3"
            editCompleted={false}
            storageKeyPrefix="recurring-tasks"
            emptyLabel="No tasks due today"
            renderItemAccessory={renderItemAccessory}
          />
        )}
      </DndContext>
      <TaskManagerDialog
        open={managerOpen}
        onOpenChange={setManagerOpen}
        tasks={tasks}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
      <AssignTaskDialog
        taskTitle={assigningItem?.title ?? null}
        assignedUserId={
          assigningItem ? getAssignedUserId(assigningItem.id) : null
        }
        members={members}
        onAssign={handleAssign}
        onClose={() => setAssigningItem(null)}
      />
    </div>
  );
}
