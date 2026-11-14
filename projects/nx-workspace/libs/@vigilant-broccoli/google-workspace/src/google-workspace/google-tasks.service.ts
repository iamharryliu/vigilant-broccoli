import { google, tasks_v1 } from 'googleapis';
import { GoogleTask, GoogleTaskList, TaskPatch } from './google-tasks.model';

const createClient = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.tasks({ version: 'v1', auth });
};

const mapTask = (t: tasks_v1.Schema$Task): GoogleTask => ({
  id: t.id ?? '',
  title: t.title ?? '',
  notes: t.notes ?? undefined,
  due: t.due ?? undefined,
  updated: t.updated ?? undefined,
  completed: t.completed ?? undefined,
  status: (t.status as GoogleTask['status']) ?? 'needsAction',
  position: t.position ?? undefined,
});

const mapTaskList = (l: tasks_v1.Schema$TaskList): GoogleTaskList => ({
  id: l.id ?? '',
  title: l.title ?? '',
});

// The API caps each page at 100 items for both tasks and task lists.
const MAX_PAGE_SIZE = 100;
// Partial response limited to what mapTask reads, so each page stays small.
const TASK_LIST_FIELDS =
  'nextPageToken,items(id,title,notes,due,updated,completed,status,position)';

const listAllPages = async <T>(
  fetchPage: (
    pageToken?: string,
  ) => Promise<{ items?: T[]; nextPageToken?: string | null }>,
): Promise<T[]> => {
  const items: T[] = [];
  let pageToken: string | undefined;
  do {
    const page = await fetchPage(pageToken);
    items.push(...(page.items ?? []));
    pageToken = page.nextPageToken ?? undefined;
  } while (pageToken);
  return items;
};

export const listTaskLists = async (
  accessToken: string,
): Promise<GoogleTaskList[]> => {
  const client = createClient(accessToken);
  const taskLists = await listAllPages(async pageToken => {
    const res = await client.tasklists.list({
      maxResults: MAX_PAGE_SIZE,
      pageToken,
    });
    return res.data;
  });
  return taskLists.map(mapTaskList);
};

export const createTaskList = async (
  accessToken: string,
  title: string,
): Promise<GoogleTaskList> => {
  const client = createClient(accessToken);
  const res = await client.tasklists.insert({ requestBody: { title } });
  return mapTaskList(res.data);
};

export const renameTaskList = async (
  accessToken: string,
  taskListId: string,
  title: string,
): Promise<GoogleTaskList> => {
  const client = createClient(accessToken);
  const res = await client.tasklists.patch({
    tasklist: taskListId,
    requestBody: { title },
  });
  return mapTaskList(res.data);
};

export const deleteTaskList = async (
  accessToken: string,
  taskListId: string,
): Promise<void> => {
  const client = createClient(accessToken);
  await client.tasklists.delete({ tasklist: taskListId });
};

export const listTasks = async (
  accessToken: string,
  taskListId = '@default',
  showCompleted = false,
  // RFC 3339 completion-date bounds; only meaningful with `showCompleted`.
  {
    completedMin,
    completedMax,
  }: { completedMin?: string; completedMax?: string } = {},
): Promise<GoogleTask[]> => {
  const client = createClient(accessToken);
  const tasks = await listAllPages(async pageToken => {
    const res = await client.tasks.list({
      tasklist: taskListId,
      showCompleted,
      showHidden: showCompleted,
      completedMin,
      completedMax,
      maxResults: MAX_PAGE_SIZE,
      pageToken,
      fields: TASK_LIST_FIELDS,
    });
    return res.data;
  });
  return tasks
    .sort((a, b) => (a.position ?? '').localeCompare(b.position ?? ''))
    .map(mapTask);
};

export const createTask = async (
  accessToken: string,
  taskListId: string,
  title: string,
): Promise<GoogleTask> => {
  const client = createClient(accessToken);
  const res = await client.tasks.insert({
    tasklist: taskListId,
    requestBody: { title },
  });
  return mapTask(res.data);
};

export const updateTask = async (
  accessToken: string,
  taskListId: string,
  taskId: string,
  patch: TaskPatch,
): Promise<GoogleTask> => {
  const client = createClient(accessToken);
  const res = await client.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    requestBody: patch,
  });
  return mapTask(res.data);
};

export const deleteTask = async (
  accessToken: string,
  taskListId: string,
  taskId: string,
): Promise<void> => {
  const client = createClient(accessToken);
  await client.tasks.delete({ tasklist: taskListId, task: taskId });
};

export const moveTask = async (
  accessToken: string,
  taskListId: string,
  taskId: string,
  previousTaskId: string | null,
): Promise<GoogleTask> => {
  const client = createClient(accessToken);
  const res = await client.tasks.move({
    tasklist: taskListId,
    task: taskId,
    previous: previousTaskId ?? undefined,
  });
  return mapTask(res.data);
};
