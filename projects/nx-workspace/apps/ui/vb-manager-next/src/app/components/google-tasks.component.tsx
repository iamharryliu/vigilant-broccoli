'use client';

import { Card, Flex, Text, Checkbox, Button, TextField, Select } from '@radix-ui/themes';
import { useEffect, useState, useCallback, memo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { CardSkeleton } from './skeleton.component';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'none';

// Sort mode constants
const SORT_MODE = {
  DEFAULT: 'default',
  EISENHOWER: 'eisenhower',
  COMMIT_TYPE: 'commitType',
} as const;

type SortMode = typeof SORT_MODE[keyof typeof SORT_MODE];

// LocalStorage key factory
const getStorageKey = {
  sortMode: (taskListId: string) => `google-tasks-sort-mode-${taskListId}`,
} as const;

// Extract Eisenhower quadrant from task title (e.g., "Q1 chore(home): Fix sink")
const getEisenhowerQuadrant = (title: string): EisenhowerQuadrant => {
  const match = title.match(/^(Q[1-4])\s/i);
  if (match) {
    return match[1].toUpperCase() as EisenhowerQuadrant;
  }
  return 'none';
};

// Extract commit type from task title (e.g., "Q1 chore(home): Fix sink" -> "chore", "Q2 chore: task" -> "chore")
const getCommitType = (title: string): string => {
  // Remove quadrant prefix if present (e.g., "Q1 ", "Q2 ")
  const withoutQuadrant = title.replace(/^Q[1-4]\s+/i, '');

  // Match any word followed by ":" or "(" (e.g., "chore:", "chore(home):", "docs:(R&D)")
  const match = withoutQuadrant.match(/^([a-z&]+)[(:]/i);
  if (match) {
    return match[1].toLowerCase();
  }
  return 'other';
};

// Sort tasks by Eisenhower matrix priority (Q1 > Q2 > Q3 > Q4 > none)
const sortByEisenhower = (tasks: Task[]): Task[] => {
  const priorityMap: Record<EisenhowerQuadrant, number> = {
    'Q1': 1, // Urgent & Important
    'Q2': 2, // Not Urgent & Important
    'Q3': 3, // Urgent & Not Important
    'Q4': 4, // Not Urgent & Not Important
    'none': 5,
  };

  return [...tasks].sort((a, b) => {
    const quadrantA = getEisenhowerQuadrant(a.title);
    const quadrantB = getEisenhowerQuadrant(b.title);
    return priorityMap[quadrantA] - priorityMap[quadrantB];
  });
};

// Sort tasks by commit type alphabetically
const sortByCommitType = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const typeA = getCommitType(a.title);
    const typeB = getCommitType(b.title);
    return typeA.localeCompare(typeB);
  });
};

// Helper to handle API errors consistently
const handleApiError = (err: unknown, fallbackMsg: string): string => {
  const message = err instanceof Error ? err.message : fallbackMsg;
  console.error(fallbackMsg, err);
  return message;
};

// Custom hook to manage task operations
const useTasks = (taskListId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks?taskListId=${taskListId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch tasks');
      setTasks(data.tasks);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string) => {
    if (!title.trim()) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskListId, title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create task');
      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to create task'));
    }
  };

  const toggleTaskComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskListId, taskId: task.id, status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update task');
      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to update task'));
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?taskListId=${taskListId}&taskId=${taskId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete task');
      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to delete task'));
    }
  };

  const updateTask = async (taskId: string, title: string) => {
    if (!title.trim()) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskListId, taskId, title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update task');
      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to update task'));
    }
  };

  return { tasks, loading, error, fetchTasks, createTask, toggleTaskComplete, deleteTask, updateTask };
};

// Custom hook to manage task list metadata
const useTaskListName = (taskListId: string, status: string) => {
  const [taskListName, setTaskListName] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      setTaskListName(null);
      setAuthError(false);
      return;
    }

    const fetchTaskListName = async () => {
      try {
        const response = await fetch('/api/tasks/lists');
        const data = await response.json();

        // Handle authentication errors
        if (response.status === 401) {
          setAuthError(true);
          setTaskListName('Tasks');
          return;
        }

        if (response.ok && data.taskLists) {
          const list = data.taskLists.find((l: { id: string; title: string }) => l.id === taskListId);
          if (list) {
            setTaskListName(list.title);
          } else {
            console.warn(`Task list with ID ${taskListId} not found, using fallback`);
            setTaskListName('Tasks');
          }
        } else {
          setTaskListName('Tasks');
        }
      } catch (err) {
        console.error('Error fetching task list name:', err);
        setTaskListName('Tasks');
      }
    };
    fetchTaskListName();
  }, [taskListId, status]);

  return { taskListName, authError };
};

// Memoized task item component to prevent re-renders
interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  editingTitle: string;
  onToggleComplete: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartEdit: (task: Task) => void;
  onEditChange: (title: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

const TaskItem = memo(({
  task,
  isEditing,
  editingTitle,
  onToggleComplete,
  onDelete,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
}: TaskItemProps) => {
  const quadrant = getEisenhowerQuadrant(task.title);
  const commitType = getCommitType(task.title);

  const quadrantColors: Record<EisenhowerQuadrant, string> = {
    'Q1': 'bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500',
    'Q2': 'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500',
    'Q3': 'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500',
    'Q4': 'bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500',
    'none': '',
  };

  return (
    <div className={`flex items-start gap-3 py-2 hover:bg-gray-50 rounded px-2 -mx-2 group ${quadrantColors[quadrant]}`}>
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={() => onToggleComplete(task)}
        className="mt-0.5"
      />
      <Flex direction="column" gap="1" className="flex-1">
        {isEditing ? (
          <TextField.Root
            value={editingTitle}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              else if (e.key === 'Escape') onCancelEdit();
            }}
            onBlur={onSaveEdit}
            autoFocus
            size="2"
          />
        ) : (
          <Text
            size="2"
            className={task.status === 'completed' ? 'line-through text-gray-400 cursor-pointer' : 'cursor-pointer'}
            onClick={() => onStartEdit(task)}
          >
            {task.title}
          </Text>
        )}
        {task.notes && <Text size="1" color="gray">{task.notes}</Text>}
        {task.due && <Text size="1" color="blue">Due: {new Date(task.due).toLocaleDateString()}</Text>}
      </Flex>
      {commitType !== 'other' && (
        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 self-start">
          {commitType}
        </span>
      )}
      <Button
        onClick={() => onDelete(task.id)}
        size="1"
        variant="ghost"
        color="red"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Delete
      </Button>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

export const GoogleTasksComponent = ({ taskListId: propTaskListId }: { taskListId?: string } = {}) => {
  const { data: session, status } = useSession();
  const taskListId = propTaskListId || process.env.NEXT_PUBLIC_GOOGLE_TASK_LIST_ID || '@default';
  const { taskListName, authError: titleAuthError } = useTaskListName(taskListId, status);
  const { tasks, loading, error, fetchTasks, createTask, toggleTaskComplete, deleteTask, updateTask } = useTasks(taskListId);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Initialize sort mode from localStorage or default to 'default'
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey.sortMode(taskListId));
      if (saved === SORT_MODE.EISENHOWER || saved === SORT_MODE.COMMIT_TYPE || saved === SORT_MODE.DEFAULT) {
        return saved as SortMode;
      }
    }
    return SORT_MODE.DEFAULT;
  });

  useEffect(() => {
    if (status === 'authenticated') fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, taskListId]);

  // Load sort mode when taskListId changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey.sortMode(taskListId));
      if (saved === SORT_MODE.EISENHOWER || saved === SORT_MODE.COMMIT_TYPE || saved === SORT_MODE.DEFAULT) {
        setSortMode(saved as SortMode);
      } else {
        setSortMode(SORT_MODE.DEFAULT);
      }
    }
  }, [taskListId]);

  // Save sort mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey.sortMode(taskListId), sortMode);
    }
  }, [sortMode, taskListId]);

  const handleCreateTask = useCallback(async () => {
    await createTask(newTaskTitle);
    setNewTaskTitle('');
    setShowAddTask(false);
  }, [newTaskTitle, createTask]);

  const handleCancelAddTask = useCallback(() => {
    setShowAddTask(false);
    setNewTaskTitle('');
  }, []);

  const handleStartEdit = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  }, []);

  const handleEditChange = useCallback((title: string) => {
    setEditingTaskTitle(title);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingTaskId && editingTaskTitle.trim()) {
      // Only update if the title actually changed
      const originalTask = tasks.find(t => t.id === editingTaskId);
      if (originalTask && originalTask.title !== editingTaskTitle) {
        await updateTask(editingTaskId, editingTaskTitle);
      }
    }
    setEditingTaskId(null);
    setEditingTaskTitle('');
  }, [editingTaskId, editingTaskTitle, updateTask, tasks]);

  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  }, []);

  // Apply sorting based on selected mode
  const sortedTasks =
    sortMode === SORT_MODE.EISENHOWER ? sortByEisenhower(tasks) :
    sortMode === SORT_MODE.COMMIT_TYPE ? sortByCommitType(tasks) :
    tasks;

  if (status === 'loading') return <CardSkeleton showTitleSkeleton rows={5} />;

  if (status === 'unauthenticated') {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="3" p="4">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">Tasks</Text>
            <Button onClick={() => signIn('google')} size="2">Sign in with Google</Button>
          </Flex>
          <Text size="2" color="gray">Sign in to view your Google Tasks</Text>
        </Flex>
      </Card>
    );
  }

  // Show authentication error banner if token expired or refresh failed
  const hasAuthError = titleAuthError || error?.includes('Unauthorized') || error?.includes('authentication') || session?.error === 'RefreshAccessTokenError';

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        {/* Header */}
        <Flex justify="between" align="center">
          {taskListName ? (
            <Text size="5" weight="bold">{taskListName}</Text>
          ) : (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded" />
          )}
          <Flex gap="2" align="center">
            {session?.user?.email && <Text size="1" color="gray">{session.user.email}</Text>}
            <Button onClick={() => signOut()} size="1" variant="soft">Sign out</Button>
          </Flex>
        </Flex>

        {/* Sort Controls */}
        <Flex gap="2" align="center">
          <Text size="2" color="gray">Sort:</Text>
          <Select.Root value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
            <Select.Trigger placeholder="Sort by..." />
            <Select.Content>
              <Select.Item value={SORT_MODE.DEFAULT}>Default</Select.Item>
              <Select.Item value={SORT_MODE.EISENHOWER}>Eisenhower Matrix</Select.Item>
              <Select.Item value={SORT_MODE.COMMIT_TYPE}>Commit Type</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        {/* Auth Error Banner */}
        {hasAuthError && (
          <Flex direction="column" gap="2" p="3" className="bg-red-50 dark:bg-red-900/20 rounded">
            <Text size="2" weight="bold" color="red">Session Expired</Text>
            <Text size="2" color="red">Your Google authentication has expired. Please sign out and sign in again.</Text>
            <Button onClick={() => signOut()} size="2" variant="solid" color="red">Sign Out & Re-authenticate</Button>
          </Flex>
        )}

        {/* Add Task Form */}
        {showAddTask ? (
          <Flex gap="2" align="end">
            <TextField.Root
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTask();
                else if (e.key === 'Escape') handleCancelAddTask();
              }}
              className="flex-1"
            />
            <Button onClick={handleCreateTask} size="2">Add</Button>
            <Button onClick={handleCancelAddTask} size="2" variant="soft">Cancel</Button>
          </Flex>
        ) : (
          <Button onClick={() => setShowAddTask(true)} size="2" variant="soft">+ Add Task</Button>
        )}

        {/* Tasks List */}
        {loading ? (
          <Flex direction="column" gap="2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded" />
            ))}
          </Flex>
        ) : error ? (
          <Text size="2" color="red">{error}</Text>
        ) : sortedTasks.length === 0 ? (
          <Text size="2" color="gray">No tasks to display</Text>
        ) : (
          <Flex direction="column" gap="2">
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isEditing={editingTaskId === task.id}
                editingTitle={editingTaskTitle}
                onToggleComplete={toggleTaskComplete}
                onDelete={deleteTask}
                onStartEdit={handleStartEdit}
                onEditChange={handleEditChange}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
