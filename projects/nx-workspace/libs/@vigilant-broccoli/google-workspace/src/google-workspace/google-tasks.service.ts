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
  status: (t.status as GoogleTask['status']) ?? 'needsAction',
  position: t.position ?? undefined,
});

export const listTaskLists = async (
  accessToken: string,
): Promise<GoogleTaskList[]> => {
  const client = createClient(accessToken);
  const res = await client.tasklists.list({ maxResults: 100 });
  return (res.data.items ?? []).map(l => ({
    id: l.id ?? '',
    title: l.title ?? '',
  }));
};

export const listTasks = async (
  accessToken: string,
  taskListId = '@default',
): Promise<GoogleTask[]> => {
  const client = createClient(accessToken);
  const res = await client.tasks.list({
    tasklist: taskListId,
    showCompleted: false,
    maxResults: 100,
  });
  return (res.data.items ?? [])
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
