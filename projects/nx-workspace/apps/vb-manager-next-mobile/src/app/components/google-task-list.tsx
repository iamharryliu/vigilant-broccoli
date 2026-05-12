'use client';

import { useEffect, useState } from 'react';
import {
  getGoogleToken,
  signOutDueToExpiredToken,
} from '../providers/auth-provider';
import { GOOGLE_TOKEN_EXPIRED } from '../../../libs/api-errors';

type Task = {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
};

type TaskList = { id: string; title: string };

const STORAGE_KEY = 'google-tasks-selected-list-id';

const fetchTaskLists = async (googleToken: string): Promise<TaskList[]> => {
  const res = await fetch('/api/tasks/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ googleToken }),
  });
  const data = await res.json();
  if (data.error === GOOGLE_TOKEN_EXPIRED) {
    await signOutDueToExpiredToken();
    return [];
  }
  return data.lists ?? [];
};

const fetchTasks = async (
  googleToken: string,
  taskListId: string,
): Promise<Task[]> => {
  const res = await fetch('/api/tasks/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ googleToken, taskListId }),
  });
  const data = await res.json();
  if (data.error === GOOGLE_TOKEN_EXPIRED) {
    await signOutDueToExpiredToken();
    return [];
  }
  return data.tasks ?? [];
};

const updateTask = async (
  googleToken: string,
  taskListId: string,
  taskId: string,
  patch: { title?: string; status?: 'needsAction' | 'completed' },
) => {
  const res = await fetch('/api/tasks/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ googleToken, taskListId, taskId, ...patch }),
  });
  const data = await res.json();
  if (data.error === GOOGLE_TOKEN_EXPIRED) {
    await signOutDueToExpiredToken();
  }
};

const createTask = async (
  googleToken: string,
  taskListId: string,
  title: string,
): Promise<Task | null> => {
  const res = await fetch('/api/tasks/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [title], googleToken, taskListId }),
  });
  const data = await res.json();
  if (data.error === GOOGLE_TOKEN_EXPIRED) {
    await signOutDueToExpiredToken();
    return null;
  }
  const result = data.results?.[0];
  if (!result?.success) return null;
  return { id: result.taskId, title, status: 'needsAction' };
};

export const GoogleTaskList = () => {
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    const token = getGoogleToken();
    if (!token) {
      signOutDueToExpiredToken();
      return;
    }
    setGoogleToken(token);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSelectedListId(stored);

    fetchTaskLists(token).then(lists => {
      setTaskLists(lists);
      if (!stored && lists.length) setSelectedListId(lists[0].id ?? '@default');
    });
  }, []);

  useEffect(() => {
    if (!googleToken) return;
    setLoading(true);
    fetchTasks(googleToken, selectedListId)
      .then(setTasks)
      .finally(() => setLoading(false));
    localStorage.setItem(STORAGE_KEY, selectedListId);
  }, [googleToken, selectedListId]);

  const handleToggleComplete = async (task: Task) => {
    if (!googleToken || task.status === 'completed') return;
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: 'completed' } : t)),
    );
    await updateTask(googleToken, selectedListId, task.id, {
      status: 'completed',
    });
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleSaveEdit = async () => {
    if (!googleToken || !editingId || !editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    const original = tasks.find(t => t.id === editingId);
    if (original && original.title !== editingTitle) {
      setTasks(prev =>
        prev.map(t => (t.id === editingId ? { ...t, title: editingTitle } : t)),
      );
      await updateTask(googleToken, selectedListId, editingId, {
        title: editingTitle,
      });
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleAddTask = async () => {
    if (!googleToken || !newTaskTitle.trim()) return;
    const task = await createTask(
      googleToken,
      selectedListId,
      newTaskTitle.trim(),
    );
    if (task) setTasks(prev => [task, ...prev]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const selectedListName =
    taskLists.find(l => l.id === selectedListId)?.title ?? 'Tasks';

  if (!googleToken) return null;

  return (
    <div className="space-y-4">
      {taskLists.length > 1 && (
        <select
          value={selectedListId}
          onChange={e => setSelectedListId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {taskLists.map(l => (
            <option key={l.id} value={l.id ?? ''}>
              {l.title}
            </option>
          ))}
        </select>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-10 rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">
              No tasks in {selectedListName}
            </p>
          )}
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-gray-100"
            >
              <button
                onClick={() => handleToggleComplete(task)}
                className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-blue-400 transition-colors"
              />
              {editingId === task.id ? (
                <input
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveEdit();
                    else if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={handleSaveEdit}
                  autoFocus
                  className="flex-1 text-sm border-b border-blue-300 focus:outline-none bg-transparent"
                />
              ) : (
                <span
                  className="flex-1 text-sm text-gray-800 cursor-pointer"
                  onClick={() => {
                    setEditingId(task.id);
                    setEditingTitle(task.title);
                  }}
                >
                  {task.title}
                </span>
              )}
              {task.due && (
                <span className="text-xs text-blue-400 flex-shrink-0">
                  {new Date(task.due).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddTask ? (
        <div className="flex gap-2">
          <input
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddTask();
              else if (e.key === 'Escape') setShowAddTask(false);
            }}
            placeholder="Task title..."
            autoFocus
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => setShowAddTask(false)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddTask(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl border border-dashed border-gray-200 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add task
        </button>
      )}
    </div>
  );
};
