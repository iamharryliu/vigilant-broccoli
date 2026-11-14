'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import {
  SORT_MODE,
  SORT_MODE_LABELS,
  SORT_MODE_OPTIONS,
  SortMode,
  useTaskChecklistView,
} from './TaskChecklist';
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
  useMemo,
} from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  Button,
  Card,
  CardSkeleton,
  CheckList,
  CheckListItem,
  Select,
  Skeleton,
  SpeechToTextToggleButton,
  Text,
  Textarea,
  useRefetchOnFocus,
  useSpeechToText,
} from '@vigilant-broccoli/react-lib';

const TASKS_ENDPOINT = '/api/tasks';
const TASKS_LISTS_ENDPOINT = '/api/tasks/lists';
const TASKS_MOVE_ENDPOINT = '/api/tasks/move';
const TASKS_PARSE_TEXT_ENDPOINT = '/api/tasks/parse-text';
const TASK_STATUS_FILTER = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;
type TaskStatusFilter =
  (typeof TASK_STATUS_FILTER)[keyof typeof TASK_STATUS_FILTER];
const DAY_MS = 24 * 60 * 60 * 1000;
// Completed tasks load this many days at a time: first load, then per scroll.
const COMPLETED_BATCH_DAYS = 30;
// Past this many days, the next scroll loads the rest of the history at once.
const BATCHED_COMPLETED_DAYS = 90;
const RETRY_OLDER_COMPLETED_LABEL = 'Retry loading older completed tasks';
// Starts loading slightly before the end of Completed is actually reached.
const OLDER_COMPLETED_PREFETCH_MARGIN = '200px';
const OLDER_COMPLETED_SKELETON_ROWS = 3;

const daysBetween = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS);
const getCompletedHint = (loadedSince: string) =>
  `last ${daysBetween(loadedSince, new Date().toISOString())} days`;

interface Task {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  updated?: string;
  completed?: string;
  status: 'needsAction' | 'completed';
  isRemoving?: boolean;
}

const completionTime = (task: Task) => task.completed ?? task.updated ?? '';

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
  signInWithGoogle: () => Promise<void>;
}

const STORAGE_KEY_SELECTED_TASK_LIST = 'google-tasks-selected-list-id';
// Google Tasks accepts this alias for the default list, but listed task lists
// only carry real ids; the API returns the default list first.
const DEFAULT_TASK_LIST_ID = '@default';

const TASKS_TITLE = 'Tasks';
const SIGN_IN_GOOGLE_LABEL = 'Sign in with Google';
const SIGN_IN_GOOGLE_DESCRIPTION = 'Sign in to view your Google Tasks';
const RECONNECT_GOOGLE_LABEL = 'Reconnect Google';
const RECONNECT_GOOGLE_DESCRIPTION =
  'Your Google access expired. Reconnect to load your tasks — you stay signed in.';

const getStorageKey = {
  sortMode: (taskListId: string) => `google-tasks-sort-mode-${taskListId}`,
} as const;

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
  const loadedTaskListId = useRef<string | null>(null);
  // Responses for a list that is no longer selected are dropped.
  const currentTaskListId = useRef(taskListId);
  useEffect(() => {
    currentTaskListId.current = taskListId;
  }, [taskListId]);
  // Start of the recent completed window, fixed per list load. Refetches only
  // cover this window; older completed tasks load in batches while scrolling.
  const recentCompletedSince = useRef('');
  // Oldest completion date loaded so far; the next batch ends here. The ref
  // serves async loads, the state the header hint.
  const olderBatchEnd = useRef('');
  const [completedLoadedSince, setCompletedLoadedSince] = useState('');
  const [hasOlderCompleted, setHasOlderCompleted] = useState(false);
  const [loadingOlderCompleted, setLoadingOlderCompleted] = useState(false);
  // Stops scroll-triggered retries after a failure until the user asks again.
  const [olderCompletedFailed, setOlderCompletedFailed] = useState(false);
  const [completedLoading, setCompletedLoading] = useState(false);

  const fetchTasksByStatus = async (
    status: TaskStatusFilter,
    completedRange: Record<string, string> = {},
  ): Promise<Task[]> => {
    const params = new URLSearchParams({
      taskListId,
      status,
      ...completedRange,
    });
    const response = await authFetch(`${TASKS_ENDPOINT}?${params}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch tasks');
    return data.tasks;
  };

  // Only the first load of a list shows the skeleton; refetching the list
  // already on screen keeps it visible so background refreshes don't flash.
  // A first load renders active tasks as soon as they arrive, and limits
  // completed tasks to recent ones, because that history can span many pages.
  const fetchTasks = async () => {
    const requestedListId = taskListId;
    const isStale = () => currentTaskListId.current !== requestedListId;
    const isFirstLoad = loadedTaskListId.current !== requestedListId;
    if (isFirstLoad) {
      setLoading(true);
      recentCompletedSince.current = new Date(
        Date.now() - COMPLETED_BATCH_DAYS * DAY_MS,
      ).toISOString();
      olderBatchEnd.current = recentCompletedSince.current;
      setCompletedLoadedSince(recentCompletedSince.current);
      setHasOlderCompleted(true);
      setOlderCompletedFailed(false);
    }
    const windowStart = recentCompletedSince.current;
    setError(null);
    try {
      const completedRequest = fetchTasksByStatus(
        TASK_STATUS_FILTER.COMPLETED,
        { completedMin: windowStart },
      );
      // Handled by the await below; prevents an unhandled rejection when the
      // active request fails first.
      completedRequest.catch(() => undefined);
      const activeTasks = await fetchTasksByStatus(TASK_STATUS_FILTER.ACTIVE);
      if (isStale()) return;
      if (isFirstLoad) {
        setTasks(activeTasks);
        setCompletedLoading(true);
        setLoading(false);
      }
      const completedTasks = await completedRequest;
      if (isStale()) return;
      if (isFirstLoad) {
        // Keep edits made while completed tasks were loading.
        appendTasks(completedTasks);
      } else {
        const fetchedIds = new Set(
          [...activeTasks, ...completedTasks].map(t => t.id),
        );
        // Older completed tasks are outside the refetched window, so keep the
        // ones already loaded instead of fetching the full history again.
        setTasks(prevTasks => [
          ...activeTasks,
          ...completedTasks,
          ...prevTasks.filter(
            t =>
              t.status === 'completed' &&
              completionTime(t) < windowStart &&
              !fetchedIds.has(t.id),
          ),
        ]);
      }
      loadedTaskListId.current = requestedListId;
    } catch (err) {
      if (!isStale()) setError(handleApiError(err, 'Failed to fetch tasks'));
    } finally {
      if (!isStale()) {
        setLoading(false);
        setCompletedLoading(false);
      }
    }
  };

  const appendTasks = (newTasks: Task[]) =>
    setTasks(prevTasks => {
      const shownIds = new Set(prevTasks.map(t => t.id));
      return [...prevTasks, ...newTasks.filter(t => !shownIds.has(t.id))];
    });

  // Loads the 30 days before the oldest loaded date until 90 days are loaded,
  // then everything older in one request, since Google cannot report how far
  // back the history goes.
  // Triggered by scrolling, so concurrent calls are dropped rather than queued.
  const loadingOlderRequest = useRef(false);
  const loadOlderCompleted = async () => {
    if (loadingOlderRequest.current) return;
    loadingOlderRequest.current = true;
    const requestedListId = taskListId;
    const completedMax = olderBatchEnd.current;
    const loadedDays =
      COMPLETED_BATCH_DAYS +
      daysBetween(completedMax, recentCompletedSince.current);
    const completedMin =
      loadedDays >= BATCHED_COMPLETED_DAYS
        ? undefined
        : new Date(
            new Date(completedMax).getTime() - COMPLETED_BATCH_DAYS * DAY_MS,
          ).toISOString();
    setLoadingOlderCompleted(true);
    setOlderCompletedFailed(false);
    try {
      const olderTasks = await fetchTasksByStatus(
        TASK_STATUS_FILTER.COMPLETED,
        completedMin ? { completedMin, completedMax } : { completedMax },
      );
      if (currentTaskListId.current !== requestedListId) return;
      appendTasks(olderTasks);
      if (completedMin) {
        olderBatchEnd.current = completedMin;
        setCompletedLoadedSince(completedMin);
      } else {
        setHasOlderCompleted(false);
      }
    } catch (err) {
      setOlderCompletedFailed(true);
      setError(handleApiError(err, 'Failed to fetch older completed tasks'));
    } finally {
      loadingOlderRequest.current = false;
      setLoadingOlderCompleted(false);
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
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
    } catch (err) {
      setError(handleApiError(err, 'Failed to create task'));
    }
  };

  const toggleTaskComplete = async (task: Task) => {
    if (task.isRemoving) return;

    const originalStatus = task.status;
    const nextStatus =
      originalStatus === 'completed' ? 'needsAction' : 'completed';

    // The shared checklist owns visual timing; this flag only guards persistence.
    // `completed` moves to now so the row lands in Completed's Today group at once.
    const now = new Date().toISOString();
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              isRemoving: true,
              updated: now,
              completed: nextStatus === 'completed' ? now : undefined,
            }
          : t,
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
                updated: data.task?.updated ?? now,
                completed:
                  nextStatus === 'completed'
                    ? (data.task?.completed ?? now)
                    : undefined,
              }
            : t,
        ),
      );
    } catch (err) {
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                status: originalStatus,
                isRemoving: false,
                updated: task.updated,
                completed: task.completed,
              }
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

  const setTaskRemoving = (taskId: string, isRemoving: boolean) =>
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? { ...t, isRemoving } : t)),
    );

  const deleteTask = async (taskId: string) => {
    setTaskRemoving(taskId, true);
    try {
      const params = new URLSearchParams({ taskListId, taskId });
      const response = await authFetch(`${TASKS_ENDPOINT}?${params}`, {
        method: HTTP_METHOD.DELETE,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete task');
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err) {
      setTaskRemoving(taskId, false);
      setError(handleApiError(err, 'Failed to delete task'));
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
    deleteTask,
    moveTask,
    setTasks,
    hasOlderCompleted,
    completedLoadedSince,
    loadingOlderCompleted,
    olderCompletedFailed,
    loadOlderCompleted,
    completedLoading,
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

const TaskHeader = memo(
  ({
    taskLists,
    selectedTaskListId,
    onTaskListChange,
    sortMode,
    onSortChange,
    showSelector,
    taskListsLoading,
  }: {
    taskLists: TaskList[];
    selectedTaskListId: string;
    onTaskListChange: (taskListId: string) => void;
    sortMode: SortMode;
    onSortChange: (value: SortMode) => void;
    showSelector: boolean;
    taskListsLoading: boolean;
  }) => {
    const selectedTaskList =
      selectedTaskListId === DEFAULT_TASK_LIST_ID
        ? taskLists[0]
        : taskLists.find(list => list.id === selectedTaskListId);

    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          {taskListsLoading ? (
            <div className="animate-pulse bg-muted h-8 w-32 rounded" />
          ) : (
            <Text size="5" weight="bold">
              {selectedTaskList?.title ?? TASKS_TITLE}
            </Text>
          )}
          <div className="flex gap-2 items-center">
            <Text size="2" color="gray">
              Sort:
            </Text>
            <Select
              value={sortMode}
              onValueChange={onSortChange}
              options={SORT_MODE_OPTIONS}
              displayMapper={SORT_MODE_LABELS}
              placeholder="Sort by..."
            />
          </div>
        </div>
        {showSelector && taskLists.length > 0 && (
          <div className="flex gap-2 items-center">
            <Select
              value={selectedTaskList}
              onValueChange={list => onTaskListChange(list.id)}
              options={taskLists}
              optionIdentifier="id"
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
    showVoiceInput,
    voiceRecording,
    voiceProcessing,
    voiceError,
    onVoiceToggle,
    extraActions,
  }: {
    showAddTask: boolean;
    newTaskTitle: string;
    onTitleChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onShowForm: () => void;
    isLoading?: boolean;
    showVoiceInput: boolean;
    voiceRecording: boolean;
    voiceProcessing: boolean;
    voiceError: string | null;
    onVoiceToggle: () => void;
    extraActions?: ReactNode;
  }) => {
    if (!showAddTask) {
      return (
        <div className="flex gap-2 items-center">
          <Button onClick={onShowForm} variant="secondary" className="flex-1">
            + Add Task
          </Button>
          {showVoiceInput && (
            <SpeechToTextToggleButton
              isRecording={voiceRecording}
              isProcessing={voiceProcessing}
              isDisabled={isLoading}
              onToggle={onVoiceToggle}
            />
          )}
          {extraActions}
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
        <div className="flex flex-col gap-2">
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
          <div
            className="flex gap-2 items-center"
            onMouseDown={e => e.preventDefault()}
          >
            {showVoiceInput && (
              <SpeechToTextToggleButton
                isRecording={voiceRecording}
                isProcessing={voiceProcessing}
                isDisabled={isLoading}
                onToggle={onVoiceToggle}
              />
            )}
            {extraActions}
          </div>
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

// Loads older completed tasks once the end of the Completed section scrolls
// into view. The section's content mounts only while it is open, so a
// collapsed section never triggers the load. Observing again after each batch
// chains the next one while the end is still visible, since an observer only
// reports changes.
const OlderCompletedLoader = ({
  loading,
  failed,
  onLoad,
}: {
  loading: boolean;
  failed: boolean;
  onLoad: () => void;
}) => {
  const sentinel = useRef<HTMLDivElement>(null);
  const latestOnLoad = useRef(onLoad);
  useEffect(() => {
    latestOnLoad.current = onLoad;
  });

  useEffect(() => {
    const node = sentinel.current;
    if (!node || failed || loading) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) latestOnLoad.current();
      },
      { rootMargin: OLDER_COMPLETED_PREFETCH_MARGIN },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [failed, loading]);

  if (failed) {
    return (
      <Button variant="ghost" size="sm" className="self-start" onClick={onLoad}>
        {RETRY_OLDER_COMPLETED_LABEL}
      </Button>
    );
  }

  return (
    <div
      ref={sentinel}
      className="flex flex-col gap-2 min-h-px"
      aria-busy={loading}
    >
      {loading &&
        Array.from({ length: OLDER_COMPLETED_SKELETON_ROWS }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
    </div>
  );
};

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
  addTaskActions,
  enableVoiceInput = true,
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
  addTaskActions?: ReactNode;
  // Voice input needs the app's /api/speech-to-text and /api/tasks/parse-text.
  enableVoiceInput?: boolean;
}) => {
  const { authFetch, useAuthStatus, signInWithGoogle } = auth;
  const status = useAuthStatus();
  const {
    taskLists,
    authError: titleAuthError,
    loading: taskListsLoading,
  } = useTaskLists(status, authFetch);

  const [selectedTaskListId, setSelectedTaskListId] = useState<string>(() => {
    if (propTaskListId) return propTaskListId;
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem(STORAGE_KEY_SELECTED_TASK_LIST) ||
        DEFAULT_TASK_LIST_ID
      );
    }
    return DEFAULT_TASK_LIST_ID;
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
    deleteTask,
    moveTask,
    setTasks,
    hasOlderCompleted,
    completedLoadedSince,
    loadingOlderCompleted,
    olderCompletedFailed,
    loadOlderCompleted,
    completedLoading,
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

  useRefetchOnFocus(fetchTasks, {
    enabled: status === 'authenticated',
    busy: isCreatingTask || !!editingTaskId || tasks.some(t => t.isRemoving),
  });

  const hasGoogleAuthError =
    titleAuthError ||
    !!error?.includes('Unauthorized') ||
    !!error?.includes('authentication');

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

  const handleDeleteItem = useCallback(
    (item: CheckListItem) => deleteTask(item.id),
    [deleteTask],
  );

  const rawChecklistItems: CheckListItem[] = useMemo(
    () =>
      tasks.map(t => ({
        id: t.id,
        title: t.title,
        checked: t.status === 'completed',
        notes: t.notes,
        due: t.due,
        updatedAt: t.updated,
        completedAt: t.completed,
        isRemoving: t.isRemoving,
      })),
    [tasks],
  );

  const {
    items: checklistItems,
    itemClassName,
    renderItemAccessory,
    renderItemMeta,
  } = useTaskChecklistView(rawChecklistItems, sortMode);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeItems = checklistItems.filter(
        item => !item.checked && !item.isRemoving,
      );
      const activeIndex = activeItems.findIndex(item => item.id === active.id);
      const overIndex = activeItems.findIndex(item => item.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return;

      const reorderedItems = [...activeItems];
      const [movedItem] = reorderedItems.splice(activeIndex, 1);
      reorderedItems.splice(overIndex, 0, movedItem);
      const orderIndex = new Map(
        reorderedItems.map((item, index) => [item.id, index]),
      );

      setTasks(prevTasks =>
        [...prevTasks].sort((a, b) => {
          const indexA = orderIndex.get(a.id);
          const indexB = orderIndex.get(b.id);
          if (indexA === undefined || indexB === undefined) return 0;
          return indexA - indexB;
        }),
      );

      const previousTaskId =
        overIndex > 0 ? reorderedItems[overIndex - 1].id : null;
      moveTask(active.id as string, previousTaskId);
    },
    [checklistItems, setTasks, moveTask],
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
        taskListsLoading={taskListsLoading}
      />

      <AddTaskForm
        showAddTask={showAddTask}
        newTaskTitle={newTaskTitle}
        onTitleChange={setNewTaskTitle}
        onSubmit={handleCreateTask}
        onCancel={handleCancelAddTask}
        onShowForm={() => setShowAddTask(true)}
        isLoading={isCreatingTask}
        showVoiceInput={enableVoiceInput}
        voiceRecording={voiceRecording}
        voiceProcessing={voiceProcessing}
        voiceError={voiceError}
        onVoiceToggle={toggleVoice}
        extraActions={addTaskActions}
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
          onDeleteItem={handleDeleteItem}
          renderItemAccessory={renderItemAccessory}
          renderItemMeta={renderItemMeta}
          itemClassName={itemClassName}
          completedLoading={completedLoading}
          completedHint={
            hasOlderCompleted
              ? getCompletedHint(completedLoadedSince)
              : undefined
          }
          completedFooter={
            !hasOlderCompleted || loading || completedLoading ? undefined : (
              <OlderCompletedLoader
                loading={loadingOlderCompleted}
                failed={olderCompletedFailed}
                onLoad={loadOlderCompleted}
              />
            )
          }
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
