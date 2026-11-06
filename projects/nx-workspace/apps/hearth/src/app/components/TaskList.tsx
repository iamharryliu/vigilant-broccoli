'use client';

import { KeyboardEvent, useEffect, useState } from 'react';
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
import { IS_DEV } from '../app.consts';
import { TaskManagerDialog } from './TaskManagerDialog';
import {
  DEFAULT_TASKS,
  OneOffTask,
  RecurringTask,
  isDueOn,
  loadDone,
  loadOneOffTasks,
  loadTasks,
  saveDone,
  saveOneOffTasks,
  saveTasks,
} from './tasks.utils';

export function TaskList() {
  const [tasks, setTasks] = useState<RecurringTask[]>(DEFAULT_TASKS);
  const [oneOffTasks, setOneOffTasks] = useState<OneOffTask[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [managerOpen, setManagerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    setTasks(loadTasks());
    setOneOffTasks(loadOneOffTasks());
    setDone(loadDone());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

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
    ...oneOffTasks,
  ];

  const completedCount = items.filter(item => item.checked).length;
  const progress = items.length ? (completedCount / items.length) * 100 : 0;

  const updateOneOff = (next: OneOffTask[]) => {
    setOneOffTasks(next);
    saveOneOffTasks(next);
  };

  const resetToDefaultTasks = () => {
    setTasks(DEFAULT_TASKS);
    saveTasks(DEFAULT_TASKS);
  };

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    updateOneOff([
      ...oneOffTasks,
      { id: crypto.randomUUID(), title, checked: false },
    ]);
    setNewTitle('');
  };

  const handleToggle = (item: CheckListItem) => {
    if (isOneOff(item.id)) {
      updateOneOff(
        oneOffTasks.map(task =>
          task.id === item.id ? { ...task, checked: !item.checked } : task,
        ),
      );
      return;
    }
    const next = item.checked
      ? done.filter(id => id !== item.id)
      : [...done, item.id];
    setDone(next);
    saveDone(next);
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
    const title = editingTitle.trim();
    if (editingId && title) {
      updateOneOff(
        oneOffTasks.map(task =>
          task.id === editingId ? { ...task, title } : task,
        ),
      );
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
      updateOneOff(move(oneOffTasks));
    } else if (!isOneOff(String(active.id)) && !isOneOff(String(over.id))) {
      handleTasksChange(move(tasks));
    }
  };

  const handleTasksChange = (next: RecurringTask[]) => {
    setTasks(next);
    saveTasks(next);
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
          updateOneOff(oneOffTasks.filter(task => task.id !== item.id));
        }}
      >
        <Trash2 size={14} />
      </Button>
    ) : null;

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
        onChange={handleTasksChange}
      />
    </div>
  );
}
