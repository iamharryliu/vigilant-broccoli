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
import { Settings, Trash2 } from 'lucide-react';
import {
  Button,
  CheckList,
  CheckListItem,
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
import {
  LEGACY_TASK_STORAGE_KEYS,
  RecurringTask,
  TASKS_API,
  isDueOn,
} from './tasks.utils';

const toPositions = (list: { id: string }[]) =>
  list.map(({ id }, position) => ({ id, position }));

export function TaskList() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const authHeader = useAuthHeader();
  const jsonHeaders = useJsonAuthHeaders();
  const token = session?.access_token ?? '';

  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [oneOffTasks, setOneOffTasks] = useState<ChecklistItem[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [managerOpen, setManagerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    LEGACY_TASK_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!homeId || !token) return;
    const headers = await authHeader();
    const [recurring, oneOff, completions] = await Promise.all(
      [
        `${TASKS_API.RECURRING}?homeId=${homeId}`,
        `${TASKS_API.ONE_OFF}?homeId=${homeId}`,
        `${TASKS_API.COMPLETIONS}?homeId=${homeId}&date=${toYmd(new Date())}`,
      ].map(async url => (await fetch(url, { headers })).json()),
    );
    setTasks(Array.isArray(recurring) ? recurring : []);
    setOneOffTasks(Array.isArray(oneOff) ? oneOff : []);
    setDone(Array.isArray(completions) ? completions : []);
  }, [homeId, token, authHeader]);

  useEffect(() => {
    setTasks([]);
    setOneOffTasks([]);
    setDone([]);
    fetchTasks();
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

  const today = new Date();
  const items: CheckListItem[] = [
    ...tasks
      .filter(task => isDueOn(task, today))
      .map(task => ({
        id: task.id,
        title: task.title,
        checked: done.includes(task.id),
      })),
    ...oneOffTasks.map(task => ({
      id: task.id,
      title: task.name,
      checked: task.completed,
    })),
  ];

  const completedCount = items.filter(item => item.checked).length;
  const progress = items.length ? (completedCount / items.length) * 100 : 0;

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
      setDone([]);
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
    setDone(prev =>
      completed ? [...prev, item.id] : prev.filter(id => id !== item.id),
    );
    send(TASKS_API.COMPLETIONS, HTTP_METHOD.POST, {
      taskId: item.id,
      date: toYmd(new Date()),
      completed,
    });
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
  // tasks not due today keep their place.
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
    } else if (!isOneOff(String(active.id)) && !isOneOff(String(over.id))) {
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
    setDone(prev => prev.filter(doneId => doneId !== id));
    send(TASKS_API.RECURRING, HTTP_METHOD.DELETE, { id });
  };

  const onNewKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const renderItemAccessory = (item: CheckListItem) =>
    isOneOff(item.id) ? (
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${item.title}`}
        onClick={e => {
          e.stopPropagation();
          handleDeleteOneOff(item.id);
        }}
      >
        <Trash2 size={14} />
      </Button>
    ) : null;

  if (!homeId) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Progress value={progress} aria-label="Tasks completed" />
        <Text size="1" color="gray" className="shrink-0">
          {completedCount}/{items.length}
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
      </DndContext>
      <TaskManagerDialog
        open={managerOpen}
        onOpenChange={setManagerOpen}
        tasks={tasks}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
