'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Card } from './Card';
import { Button } from './Button';
import { Select } from './Select';
import { Text } from './Text';
import { Textarea } from './Textarea';
import { CheckList, CheckListItem } from './CheckList';
import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { CardSkeleton } from './Skeleton';
import { getCommitType } from '../utils/commit-type.utils';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { SpeechToTextToggleButton } from './SpeechToTextToggleButton';

const TASKS_ENDPOINT = '/api/tasks';
const TASKS_LISTS_ENDPOINT = '/api/tasks/lists';
const TASKS_MOVE_ENDPOINT = '/api/tasks/move';
const TASKS_PARSE_TEXT_ENDPOINT = '/api/tasks/parse-text';

interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  updated?: string;
  status: 'needsAction' | 'completed';
  isNew?: boolean;
  isRemoving?: boolean;
}

interface TaskList {
  id: string;
  title: string;
}

export interface GoogleTasksAuthAdapter {
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
  useAuthStatus: () => 'loading' | 'authenticated' | 'unauthenticated';
  useGoogleToken: () => {
    googleToken: string | null;
    clearGoogleToken: () => void;
  };
  signInWithGoogle: () => Promise<void>;
}

type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'none';

export const SORT_MODE = {
  DEFAULT: 'default',
  EISENHOWER: 'eisenhower',
  COMMIT_TYPE: 'commitType',
  DATE_CREATED_NEWEST: 'dateCreatedNewest',
  DATE_CREATED_OLDEST: 'dateCreatedOldest',
} as const;

export type SortMode = (typeof SORT_MODE)[keyof typeof SORT_MODE];

const SORT_MODE_OPTIONS = Object.values(SORT_MODE);

const SORT_MODE_LABELS: Record<SortMode, string> = {
  [SORT_MODE.DEFAULT]: 'Default',
  [SORT_MODE.EISENHOWER]: 'Eisenhower Matrix',
  [SORT_MODE.COMMIT_TYPE]: 'Commit Type',
  [SORT_MODE.DATE_CREATED_NEWEST]: 'Date Created (Newest)',
  [SORT_MODE.DATE_CREATED_OLDEST]: 'Date Created (Oldest)',
};

const STORAGE_KEY_SELECTED_TASK_LIST = 'google-tasks-selected-list-id';

const TASKS_TITLE = 'Tasks';
const SIGN_IN_GOOGLE_LABEL = 'Sign in with Google';
const SIGN_IN_GOOGLE_DESCRIPTION = 'Sign in to view your Google Tasks';
const RECONNECT_GOOGLE_LABEL = 'Reconnect Google';
const RECONNECT_GOOGLE_DESCRIPTION =
  'Your Google access expired. Reconnect to load your tasks — you stay signed in.';

const getStorageKey = {
  sortMode: (taskListId: string) => `google-tasks-sort-mode-${taskListId}`,
} as const;

const getEisenhowerQuadrant = (title: string): EisenhowerQuadrant => {
  const match = title.match(/^(Q[1-4])[\s:]/i);
  if (match) {
    return match[1].toUpperCase() as EisenhowerQuadrant;
  }
  return 'none';
};

const sortByEisenhower = (tasks: Task[]): Task[] => {
  const priorityMap: Record<EisenhowerQuadrant, number> = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
    none: 5,
  };

  return [...tasks].sort((a, b) => {
    const quadrantA = getEisenhowerQuadrant(a.title);
    const quadrantB = getEisenhowerQuadrant(b.title);
    return priorityMap[quadrantA] - priorityMap[quadrantB];
  });
};

const sortByCommitType = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const typeA = getCommitType(a.title);
    const typeB = getCommitType(b.title);
    return typeA.localeCompare(typeB);
  });
};

const sortByDateCreated = (tasks: Task[], newest = true): Task[] => {
  return [...tasks].sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;
    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return newest ? dateB - dateA : dateA - dateB;
  });
};

const handleApiError = (err: unknown, fallbackMsg: string): string => {
  const message = err instanceof Error ? err.message : fallbackMsg;
  console.error(fallbackMsg, err);
  return message;
};

const useTasks = (
  taskListId: string,
  authFetch: GoogleTasksAuthAdapter['authFetch'],
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(
        `${TASKS_ENDPOINT}?taskListId=${taskListId}`,
      );
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
      const response = await authFetch(TASKS_ENDPOINT, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ taskListId, title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create task');
      const taskData = data.task;
      const newTask: Task = {
        id: taskData.id,
        title: taskData.title,
        notes: taskData.notes,
        due: taskData.due,
        updated: taskData.updated,
        status: taskData.status || 'needsAction',
        isNew: true,
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setTimeout(() => {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === newTask.id ? { ...t, isNew: false } : t,
          ),
        );
      }, 300);
    } catch (err) {
      setError(handleApiError(err, 'Failed to create task'));
    }
  };

  const toggleTaskComplete = async (task: Task) => {
    if (task.isRemoving) return;

    const originalStatus = task.status;
    const nextStatus =
      originalStatus === 'completed' ? 'needsAction' : 'completed';

    // Optimistically flip status and keep item visible while request is in-flight.
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, status: nextStatus, isRemoving: true } : t,
      ),
    );

    try {
      const response = await authFetch(TASKS_ENDPOINT, {
        method: HTTP_METHOD.PATCH,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          taskListId,
          taskId: task.id,
          status: nextStatus,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update task');
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                status: nextStatus,
                isRemoving: false,
                updated: data.task?.updated ?? new Date().toISOString(),
              }
            : t,
        ),
      );
    } catch (err) {
      // If the server call fails, revert the task to its original status.
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? { ...t, status: originalStatus, isRemoving: false }
            : t,
        ),
      );
      setError(handleApiError(err, 'Failed to update task'));
    }
  };

  const updateTask = async (taskId: string, title: string) => {
    if (!title.trim()) return;
    try {
      const response = await authFetch(TASKS_ENDPOINT, {
        method: HTTP_METHOD.PATCH,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ taskListId, taskId, title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update task');
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? { ...t, title } : t)),
      );
    } catch (err) {
      setError(handleApiError(err, 'Failed to update task'));
    }
  };

  const moveTask = async (taskId: string, previousTaskId: string | null) => {
    try {
      const response = await authFetch(TASKS_MOVE_ENDPOINT, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          taskListId,
          taskId,
          previous: previousTaskId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to move task');

      await fetchTasks();
    } catch (err) {
      setError(handleApiError(err, 'Failed to move task'));
      fetchTasks();
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    toggleTaskComplete,
    updateTask,
    moveTask,
    setTasks,
  };
};

const useTaskLists = (
  status: string,
  authFetch: GoogleTasksAuthAdapter['authFetch'],
) => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') {
      setTaskLists([]);
      setAuthError(false);
      setLoading(false);
      return;
    }

    const fetchTaskLists = async () => {
      try {
        const response = await authFetch(TASKS_LISTS_ENDPOINT);
        const data = await response.json();

        if (response.status === 401) {
          setAuthError(true);
          setLoading(false);
          return;
        }

        if (response.ok && data.taskLists) {
          setTaskLists(data.taskLists);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task lists:', err);
        setLoading(false);
      }
    };
    fetchTaskLists();
  }, [status, authFetch]);

  return { taskLists, authError, loading };
};

const useSortModeStorage = (taskListId: string, enabled = true) => {
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    if (enabled && typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey.sortMode(taskListId));
      if (
        saved === SORT_MODE.EISENHOWER ||
        saved === SORT_MODE.COMMIT_TYPE ||
        saved === SORT_MODE.DATE_CREATED_NEWEST ||
        saved === SORT_MODE.DATE_CREATED_OLDEST
      ) {
        return saved;
      }
    }
    return SORT_MODE.DEFAULT;
  });

  useEffect(() => {
    if (enabled) {
      localStorage.setItem(getStorageKey.sortMode(taskListId), sortMode);
    }
  }, [sortMode, taskListId, enabled]);

  return [sortMode, setSortMode] as const;
};

const QUADRANT_COLORS: Record<EisenhowerQuadrant, string> = {
  Q1: 'bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500',
  Q2: 'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500',
  Q3: 'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500',
  Q4: 'bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500',
  none: '',
};

const TaskHeader = memo(
  ({
    taskLists,
    selectedTaskListId,
    onTaskListChange,
    sortMode,
    onSortChange,
    showSelector,
  }: {
    taskLists: TaskList[];
    selectedTaskListId: string;
    onTaskListChange: (taskListId: string) => void;
    sortMode: SortMode;
    onSortChange: (value: SortMode) => void;
    showSelector: boolean;
  }) => {
    const selectedTaskList = taskLists.find(
      list => list.id === selectedTaskListId,
    );

    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          {selectedTaskList ? (
            <Text size="5" weight="bold">
              {selectedTaskList.title}
            </Text>
          ) : (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded" />
          )}
          <div className="flex gap-2 items-center">
            <Text size="2" color="gray">
              Sort:
            </Text>
            <Select
              selectedOption={sortMode}
              setValue={onSortChange}
              options={SORT_MODE_OPTIONS}
              displayMapper={SORT_MODE_LABELS}
              placeholder="Sort by..."
            />
          </div>
        </div>
        {showSelector && taskLists.length > 0 && (
          <div className="flex gap-2 items-center">
            <Select
              selectedOption={taskLists.find(l => l.id === selectedTaskListId)}
              setValue={list => onTaskListChange(list.id)}
              options={taskLists}
              optionIdenfifier="id"
              optionDisplayKey="title"
              placeholder="Select task list..."
              triggerClassName="w-full"
            />
          </div>
        )}
      </div>
    );
  },
);

TaskHeader.displayName = 'TaskHeader';

const VOICE_PARSE_ERROR = 'Failed to extract tasks from voice input';

const useVoiceAddTasks = (
  createTasks: (titles: string[]) => Promise<void>,
  authFetch: GoogleTasksAuthAdapter['authFetch'],
) => {
  const [isParsing, setIsParsing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const handleTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript?.trim()) return;
      setIsParsing(true);
      setVoiceError(null);
      try {
        const res = await authFetch(TASKS_PARSE_TEXT_ENDPOINT, {
          method: HTTP_METHOD.POST,
          headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
          body: JSON.stringify({ transcript }),
        });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data.items) || !data.items.length) {
          setVoiceError(data.error || VOICE_PARSE_ERROR);
          return;
        }
        await createTasks(data.items);
      } catch (err) {
        setVoiceError(err instanceof Error ? err.message : VOICE_PARSE_ERROR);
      } finally {
        setIsParsing(false);
      }
    },
    [createTasks, authFetch],
  );

  const { isRecording, isProcessing, error, toggleRecording } = useSpeechToText(
    { authFetch, onTranscriptComplete: handleTranscript },
  );

  return {
    isRecording,
    isProcessing: isProcessing || isParsing,
    error: voiceError || error,
    toggleRecording,
  };
};

const AddTaskForm = memo(
  ({
    showAddTask,
    newTaskTitle,
    onTitleChange,
    onSubmit,
    onCancel,
    onShowForm,
    isLoading = false,
    voiceRecording,
    voiceProcessing,
    voiceError,
    onVoiceToggle,
  }: {
    showAddTask: boolean;
    newTaskTitle: string;
    onTitleChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onShowForm: () => void;
    isLoading?: boolean;
    voiceRecording: boolean;
    voiceProcessing: boolean;
    voiceError: string | null;
    onVoiceToggle: () => void;
  }) => {
    if (!showAddTask) {
      return (
        <div className="flex gap-2 items-center">
          <Button onClick={onShowForm} variant="secondary" className="flex-1">
            + Add Task
          </Button>
          <SpeechToTextToggleButton
            isRecording={voiceRecording}
            isProcessing={voiceProcessing}
            isDisabled={isLoading}
            onToggle={onVoiceToggle}
          />
          {voiceError && (
            <Text size="1" color="red">
              {voiceError}
            </Text>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-end">
          <Textarea
            placeholder="Add a task, or use * item1 > item2 for multiple..."
            value={newTaskTitle}
            rows={2}
            onChange={e => onTitleChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                e.preventDefault();
                onSubmit();
              } else if (e.key === 'Escape') onCancel();
            }}
            onBlur={() => {
              if (!newTaskTitle.trim()) onCancel();
            }}
            className="flex-1 min-h-0 resize-none"
            disabled={isLoading}
            autoFocus
          />
          <SpeechToTextToggleButton
            isRecording={voiceRecording}
            isProcessing={voiceProcessing}
            isDisabled={isLoading}
            onToggle={onVoiceToggle}
          />
        </div>
        {voiceError && (
          <Text size="1" color="red">
            {voiceError}
          </Text>
        )}
      </div>
    );
  },
);

AddTaskForm.displayName = 'AddTaskForm';

const getActiveTasks = (tasks: Task[]) =>
  tasks.filter(t => t.status !== 'completed' || t.isRemoving);

const UnauthenticatedView = memo(
  ({ signInWithGoogle }: { signInWithGoogle: () => Promise<void> }) => (
    <Card className="w-full">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between items-center">
          <Text size="5" weight="bold">
            {TASKS_TITLE}
          </Text>
          <Button
            onClick={async () => {
              await signInWithGoogle();
            }}
          >
            {SIGN_IN_GOOGLE_LABEL}
          </Button>
        </div>
        <Text size="2" color="gray">
          {SIGN_IN_GOOGLE_DESCRIPTION}
        </Text>
      </div>
    </Card>
  ),
);

UnauthenticatedView.displayName = 'UnauthenticatedView';

const GoogleReconnectView = memo(
  ({ signInWithGoogle }: { signInWithGoogle: () => Promise<void> }) => (
    <Card className="w-full">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between items-center">
          <Text size="5" weight="bold">
            {TASKS_TITLE}
          </Text>
          <Button
            onClick={async () => {
              await signInWithGoogle();
            }}
          >
            {RECONNECT_GOOGLE_LABEL}
          </Button>
        </div>
        <Text size="2" color="gray">
          {RECONNECT_GOOGLE_DESCRIPTION}
        </Text>
      </div>
    </Card>
  ),
);

GoogleReconnectView.displayName = 'GoogleReconnectView';

interface DragOverTask {
  id: string;
  title: string;
}

// eslint-disable-next-line complexity
export const GoogleTasksComponent = ({
  auth,
  taskListId: propTaskListId,
  showSelector = true,
  enableDragDrop = false,
  refreshTrigger = 0,
  disableInternalDndContext = false,
  dragOverTask,
  sortMode: controlledSortMode,
  onSortModeChange,
  wrapInCard = true,
}: {
  auth: GoogleTasksAuthAdapter;
  taskListId?: string;
  showSelector?: boolean;
  enableDragDrop?: boolean;
  refreshTrigger?: number;
  disableInternalDndContext?: boolean;
  dragOverTask?: DragOverTask | null;
  sortMode?: SortMode;
  onSortModeChange?: (taskListId: string, sortMode: SortMode) => void;
  wrapInCard?: boolean;
}) => {
  const { authFetch, useAuthStatus, useGoogleToken, signInWithGoogle } = auth;
  const status = useAuthStatus();
  const { clearGoogleToken } = useGoogleToken();
  const { taskLists, authError: titleAuthError } = useTaskLists(
    status,
    authFetch,
  );

  const [selectedTaskListId, setSelectedTaskListId] = useState<string>(() => {
    if (propTaskListId) return propTaskListId;
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_SELECTED_TASK_LIST) || '@default';
    }
    return '@default';
  });

  const taskListId = propTaskListId || selectedTaskListId;

  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    toggleTaskComplete,
    updateTask,
    moveTask,
    setTasks,
  } = useTasks(taskListId, authFetch);
  const isControlledSort = controlledSortMode !== undefined;
  const [localSortMode, setLocalSortMode] = useSortModeStorage(
    taskListId,
    !isControlledSort,
  );
  const sortMode = isControlledSort ? controlledSortMode : localSortMode;
  const setSortMode = useCallback(
    (mode: SortMode) => {
      if (isControlledSort) {
        onSortModeChange?.(taskListId, mode);
      } else {
        setLocalSortMode(mode);
      }
    },
    [isControlledSort, onSortModeChange, taskListId, setLocalSortMode],
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  useEffect(() => {
    if (propTaskListId) {
      setSelectedTaskListId(propTaskListId);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_SELECTED_TASK_LIST);
      if (stored) {
        setSelectedTaskListId(stored);
      }
    }
  }, [propTaskListId]);

  useEffect(() => {
    if (!propTaskListId && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SELECTED_TASK_LIST, selectedTaskListId);
    }
  }, [selectedTaskListId, propTaskListId]);

  useEffect(() => {
    if (status === 'authenticated') fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, taskListId, refreshTrigger]);

  const hasGoogleAuthError =
    titleAuthError ||
    !!error?.includes('Unauthorized') ||
    !!error?.includes('authentication');

  useEffect(() => {
    if (hasGoogleAuthError) clearGoogleToken();
  }, [hasGoogleAuthError, clearGoogleToken]);

  const handleCreateTask = useCallback(async () => {
    if (isCreatingTask) return;
    setIsCreatingTask(true);
    try {
      if (newTaskTitle.startsWith('*')) {
        const titles = newTaskTitle
          .slice(1)
          .split(/[>\n]/)
          .map(t => t.trim())
          .filter(Boolean)
          .reverse();
        for (const title of titles) {
          await createTask(title);
        }
      } else {
        await createTask(newTaskTitle);
      }
      setNewTaskTitle('');
      setShowAddTask(false);
    } finally {
      setIsCreatingTask(false);
    }
  }, [newTaskTitle, createTask, isCreatingTask]);

  const handleCancelAddTask = useCallback(() => {
    setShowAddTask(false);
    setNewTaskTitle('');
  }, []);

  const createTasksFromVoice = useCallback(
    async (titles: string[]) => {
      for (const title of [...titles].reverse()) {
        await createTask(title);
      }
    },
    [createTask],
  );

  const {
    isRecording: voiceRecording,
    isProcessing: voiceProcessing,
    error: voiceError,
    toggleRecording: toggleVoice,
  } = useVoiceAddTasks(createTasksFromVoice, authFetch);

  const handleStartEdit = useCallback((item: CheckListItem) => {
    setEditingTaskId(item.id);
    setEditingTaskTitle(item.title);
  }, []);

  const handleEditChange = useCallback((title: string) => {
    setEditingTaskTitle(title);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingTaskId && editingTaskTitle.trim()) {
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

  const handleSortChange = useCallback(
    (value: SortMode) => {
      setSortMode(value);
    },
    [setSortMode],
  );

  const handleTaskListChange = useCallback((newTaskListId: string) => {
    setSelectedTaskListId(newTaskListId);
  }, []);

  const handleToggleCheck = useCallback(
    (item: CheckListItem) => {
      const task = tasks.find(t => t.id === item.id);
      if (task) toggleTaskComplete(task);
    },
    [tasks, toggleTaskComplete],
  );

  const sortedTasks = useMemo(() => {
    if (sortMode === SORT_MODE.EISENHOWER) return sortByEisenhower(tasks);
    if (sortMode === SORT_MODE.COMMIT_TYPE) return sortByCommitType(tasks);
    if (sortMode === SORT_MODE.DATE_CREATED_NEWEST)
      return sortByDateCreated(tasks, true);
    if (sortMode === SORT_MODE.DATE_CREATED_OLDEST)
      return sortByDateCreated(tasks, false);
    return tasks;
  }, [sortMode, tasks]);

  const checklistItems: CheckListItem[] = useMemo(
    () =>
      sortedTasks.map(t => ({
        id: t.id,
        title: t.title,
        checked: t.status === 'completed',
        notes: t.notes,
        due: t.due,
        updatedAt: t.updated,
        isNew: t.isNew,
        isRemoving: t.isRemoving,
      })),
    [sortedTasks],
  );

  const showCreatedMeta =
    sortMode === SORT_MODE.DATE_CREATED_NEWEST ||
    sortMode === SORT_MODE.DATE_CREATED_OLDEST;

  const renderItemMeta = useCallback(
    (item: CheckListItem) =>
      showCreatedMeta && item.updatedAt ? (
        <Text size="1" color="gray">
          Created: {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      ) : null,
    [showCreatedMeta],
  );

  const renderItemAccessory = useCallback((item: CheckListItem) => {
    const commitType = getCommitType(item.title);
    if (commitType === 'other') return null;
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 self-start">
        {commitType}
      </span>
    );
  }, []);

  const itemClassName = useCallback(
    (item: CheckListItem) => QUADRANT_COLORS[getEisenhowerQuadrant(item.title)],
    [],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeTasks = getActiveTasks(sortedTasks);
      const activeIndex = activeTasks.findIndex(t => t.id === active.id);
      const overIndex = activeTasks.findIndex(t => t.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return;

      const reorderedTasks = [...activeTasks];
      const [movedTask] = reorderedTasks.splice(activeIndex, 1);
      reorderedTasks.splice(overIndex, 0, movedTask);

      setTasks(
        tasks.map(t => {
          const newIndex = reorderedTasks.findIndex(rt => rt.id === t.id);
          return newIndex !== -1 ? reorderedTasks[newIndex] : t;
        }),
      );

      const previousTaskId =
        overIndex > 0 ? reorderedTasks[overIndex - 1].id : null;
      moveTask(active.id as string, previousTaskId);
    },
    [sortedTasks, tasks, setTasks, moveTask],
  );

  if (status === 'loading') return <CardSkeleton showTitleSkeleton rows={5} />;
  if (status === 'unauthenticated')
    return <UnauthenticatedView signInWithGoogle={signInWithGoogle} />;
  if (hasGoogleAuthError)
    return <GoogleReconnectView signInWithGoogle={signInWithGoogle} />;

  const isDragDropEnabled = sortMode === SORT_MODE.DEFAULT;

  const body = (
    <div className="flex flex-col gap-3 p-4 h-full">
      <TaskHeader
        taskLists={taskLists}
        selectedTaskListId={taskListId}
        onTaskListChange={handleTaskListChange}
        sortMode={sortMode}
        onSortChange={handleSortChange}
        showSelector={showSelector && !propTaskListId}
      />

      <AddTaskForm
        showAddTask={showAddTask}
        newTaskTitle={newTaskTitle}
        onTitleChange={setNewTaskTitle}
        onSubmit={handleCreateTask}
        onCancel={handleCancelAddTask}
        onShowForm={() => setShowAddTask(true)}
        isLoading={isCreatingTask}
        voiceRecording={voiceRecording}
        voiceProcessing={voiceProcessing}
        voiceError={voiceError}
        onVoiceToggle={toggleVoice}
      />

      <div className="flex-1 overflow-y-auto min-h-0 px-2 -mx-2">
        <CheckList
          items={checklistItems}
          loading={loading}
          error={error}
          editingItemId={editingTaskId}
          editingItemTitle={editingTaskTitle}
          onToggleCheck={handleToggleCheck}
          onStartEdit={handleStartEdit}
          onEditChange={handleEditChange}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          enableDragDrop={isDragDropEnabled || enableDragDrop}
          listId={taskListId}
          dragOverItem={dragOverTask}
          emptyLabel="No tasks to display"
          renderItemAccessory={renderItemAccessory}
          renderItemMeta={renderItemMeta}
          itemClassName={itemClassName}
        />
      </div>
    </div>
  );

  const content = wrapInCard ? (
    <Card className="w-full h-full flex flex-col overflow-hidden">{body}</Card>
  ) : (
    body
  );

  if (disableInternalDndContext) {
    return content;
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      {content}
    </DndContext>
  );
};
