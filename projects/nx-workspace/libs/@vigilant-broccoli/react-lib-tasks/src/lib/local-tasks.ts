import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import type { GoogleTasksAuthAdapter } from './GoogleTasks';

type TaskStatus = 'needsAction' | 'completed';

type LocalTask = {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  updated: string;
  completed?: string;
  status: TaskStatus;
};

type LocalTaskList = { id: string; title: string };

// Tasks per list are kept in display order, so array order is the position.
type LocalTasksStore = {
  taskLists: LocalTaskList[];
  tasks: Record<string, LocalTask[]>;
};

const DEFAULT_LIST_TITLE = 'My Tasks';
// Base for parsing the relative endpoint paths the component requests.
const URL_BASE = 'http://local';

const ENDPOINT = {
  TASKS: '/api/tasks',
  TASK_LISTS: '/api/tasks/lists',
  MOVE: '/api/tasks/move',
  CREATE_MANY: '/api/tasks/create',
} as const;

const json = (body: unknown, status: number = HTTP_STATUS_CODES.OK) =>
  Response.json(body, { status });

const notFound = (error: string) =>
  json({ error }, HTTP_STATUS_CODES.INVALID_PATH);

const createStore = (): LocalTasksStore => {
  const id = crypto.randomUUID();
  return {
    taskLists: [{ id, title: DEFAULT_LIST_TITLE }],
    tasks: { [id]: [] },
  };
};

// Serves the same /api/tasks* contract as createGoogleTasksRouteHandlers from
// localStorage, so GoogleTasksComponent runs unchanged without an account.
export const createLocalTasksAdapter = ({
  storageKey,
  signInWithGoogle,
}: {
  storageKey: string;
  signInWithGoogle: () => Promise<void>;
}): GoogleTasksAuthAdapter => {
  const read = (): LocalTasksStore => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : createStore();
  };
  const write = (store: LocalTasksStore) =>
    localStorage.setItem(storageKey, JSON.stringify(store));

  // Unknown ids (such as `@default` or a Google list id remembered from a
  // signed-in session) fall back to the first list, as Google's default does.
  const resolveListId = (store: LocalTasksStore, taskListId?: string | null) =>
    store.taskLists.some(list => list.id === taskListId)
      ? (taskListId as string)
      : store.taskLists[0].id;

  const addTask = (store: LocalTasksStore, listId: string, title: string) => {
    const task: LocalTask = {
      id: crypto.randomUUID(),
      title,
      updated: new Date().toISOString(),
      status: 'needsAction',
    };
    store.tasks[listId] = [task, ...(store.tasks[listId] ?? [])];
    return task;
  };

  const handleTasks = (
    method: string,
    params: URLSearchParams,
    body: Record<string, string | undefined>,
  ) => {
    const store = read();
    const listId = resolveListId(
      store,
      params.get('taskListId') ?? body.taskListId,
    );
    const tasks = store.tasks[listId] ?? [];

    if (method === HTTP_METHOD.GET) {
      const status = params.get('status');
      const completedMin = params.get('completedMin');
      const completedMax = params.get('completedMax');
      return json({
        tasks: tasks.filter(task => {
          if (status === 'active') return task.status === 'needsAction';
          if (task.status === 'needsAction') return status !== 'completed';
          const completed = task.completed ?? task.updated;
          return (
            (!completedMin || completed >= completedMin) &&
            (!completedMax || completed <= completedMax)
          );
        }),
      });
    }

    if (method === HTTP_METHOD.POST) {
      const task = addTask(store, listId, body.title ?? '');
      write(store);
      return json({ task });
    }

    const taskId = params.get('taskId') ?? body.taskId;
    const index = tasks.findIndex(task => task.id === taskId);
    if (index === -1) return notFound('Task not found');

    if (method === HTTP_METHOD.DELETE) {
      tasks.splice(index, 1);
      write(store);
      return json({ success: true });
    }

    const now = new Date().toISOString();
    const status = body.status as TaskStatus | undefined;
    const task: LocalTask = {
      ...tasks[index],
      ...(body.title !== undefined && { title: body.title }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.due !== undefined && { due: body.due }),
      ...(status && {
        status,
        completed: status === 'completed' ? now : undefined,
      }),
      updated: now,
    };
    tasks[index] = task;
    write(store);
    return json({ task });
  };

  const moveTask = (body: Record<string, string | null | undefined>) => {
    const store = read();
    const tasks = store.tasks[resolveListId(store, body.taskListId)] ?? [];
    const index = tasks.findIndex(task => task.id === body.taskId);
    if (index === -1) return notFound('Task not found');
    const [task] = tasks.splice(index, 1);
    const previousIndex = body.previous
      ? tasks.findIndex(t => t.id === body.previous)
      : -1;
    tasks.splice(previousIndex + 1, 0, task);
    write(store);
    return json({ task });
  };

  const handleTaskLists = (
    method: string,
    params: URLSearchParams,
    body: Record<string, string | undefined>,
  ) => {
    const store = read();
    if (method === HTTP_METHOD.GET) {
      if (!localStorage.getItem(storageKey)) write(store);
      return json({
        taskLists: store.taskLists,
        activeTaskCounts: Object.fromEntries(
          store.taskLists.map(list => [
            list.id,
            (store.tasks[list.id] ?? []).filter(
              task => task.status === 'needsAction',
            ).length,
          ]),
        ),
      });
    }
    if (method === HTTP_METHOD.POST) {
      const taskList = { id: crypto.randomUUID(), title: body.title ?? '' };
      store.taskLists.push(taskList);
      store.tasks[taskList.id] = [];
      write(store);
      return json({ taskList });
    }
    const taskList = store.taskLists.find(
      list => list.id === params.get('taskListId'),
    );
    if (!taskList) return notFound('Task list not found');
    if (method === HTTP_METHOD.PATCH) {
      taskList.title = body.title ?? taskList.title;
      write(store);
      return json({ taskList });
    }
    store.taskLists = store.taskLists.filter(list => list !== taskList);
    delete store.tasks[taskList.id];
    write(store.taskLists.length ? store : createStore());
    return json({ success: true });
  };

  const createMany = (body: { items?: string[]; taskListId?: string }) => {
    const store = read();
    const listId = resolveListId(store, body.taskListId);
    const results = (body.items ?? []).map(title => ({
      title,
      success: true,
      taskId: addTask(store, listId, title).id,
    }));
    write(store);
    return json({ results });
  };

  const authFetch: GoogleTasksAuthAdapter['authFetch'] = async (
    input,
    init,
  ) => {
    const url = new URL(
      input instanceof Request ? input.url : String(input),
      URL_BASE,
    );
    const method = init?.method ?? HTTP_METHOD.GET;
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
    switch (url.pathname) {
      case ENDPOINT.TASKS:
        return handleTasks(method, url.searchParams, body);
      case ENDPOINT.TASK_LISTS:
        return handleTaskLists(method, url.searchParams, body);
      case ENDPOINT.MOVE:
        return moveTask(body);
      case ENDPOINT.CREATE_MANY:
        return createMany(body);
      default:
        return notFound(`${url.pathname} is unavailable without signing in`);
    }
  };

  return {
    authFetch,
    useAuthStatus: () => 'authenticated',
    signInWithGoogle,
  };
};
