import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from './server-auth';
import { supabaseAdmin } from './supabase-admin';

const TABLE = { LISTS: 'app_task_lists', TASKS: 'app_tasks' } as const;
const DEFAULT_LIST_TITLE = 'My Tasks';
const STATUS = { ACTIVE: 'needsAction', COMPLETED: 'completed' } as const;
const POSITION_STEP = 1;

type ListRow = { id: string; title: string };
type TaskRow = {
  id: string;
  title: string;
  notes: string | null;
  due: string | null;
  status: string;
  completed_at: string | null;
  position: number;
  updated_at: string;
};
type TaskBody = {
  taskListId?: string;
  taskId?: string;
  title?: string;
  notes?: string;
  due?: string;
  status?: string;
  previous?: string | null;
  items?: string[];
};

const fail = (error: string, status: number) =>
  Response.json({ error }, { status });

const unwrap = <T>({
  data,
  error,
}: {
  data: T | null;
  error: { message: string } | null;
}) => {
  if (error) throw new Error(error.message);
  return data as T;
};

const param = (request: Request, name: string) =>
  new URL(request.url).searchParams.get(name);

const withUser =
  (handler: (email: string, request: Request) => Promise<Response>) =>
  async (request: Request) => {
    const email = await getUserEmail(request);
    if (!email) return fail('Unauthorized', HTTP_STATUS_CODES.UNAUTHORIZED);
    return handler(email, request);
  };

// A user's first request creates their default list, as the local store does.
const getLists = async (email: string): Promise<ListRow[]> => {
  const lists = unwrap<ListRow[]>(
    await supabaseAdmin
      .from(TABLE.LISTS)
      .select('id, title')
      .eq('user_email', email)
      .order('created_at'),
  );
  if (lists.length > 0) return lists;
  const created = unwrap<ListRow>(
    await supabaseAdmin
      .from(TABLE.LISTS)
      .insert({ user_email: email, title: DEFAULT_LIST_TITLE })
      .select('id, title')
      .single(),
  );
  return [created];
};

// Unknown ids (such as `@default` or another mode's list id) fall back to the
// first list, matching the Google and local adapters.
const resolveListId = (lists: ListRow[], requested?: string | null) =>
  lists.some(list => list.id === requested)
    ? (requested as string)
    : lists[0].id;

// Always both columns, so rows in one bulk insert share the same keys (a
// missing key would insert null into the not-null status). completed_at is set
// only for completed tasks, as in updateTask.
const statusColumns = (status?: string) =>
  status === STATUS.COMPLETED
    ? { status: STATUS.COMPLETED, completed_at: new Date().toISOString() }
    : { status: STATUS.ACTIVE, completed_at: null };

const toTask = (row: TaskRow) => ({
  id: row.id,
  title: row.title,
  notes: row.notes ?? undefined,
  due: row.due ?? undefined,
  status: row.status,
  updated: row.updated_at,
  completed: row.completed_at ?? undefined,
});

const getListTasks = async (email: string, listId: string) =>
  unwrap<TaskRow[]>(
    await supabaseAdmin
      .from(TABLE.TASKS)
      .select('*')
      .eq('user_email', email)
      .eq('list_id', listId)
      .order('position'),
  );

const frontPosition = (tasks: TaskRow[]) =>
  (tasks[0]?.position ?? POSITION_STEP) - POSITION_STEP;

const listTasks = withUser(async (email, request) => {
  const lists = await getLists(email);
  const listId = resolveListId(lists, param(request, 'taskListId'));
  const status = param(request, 'status');
  const completedMin = param(request, 'completedMin');
  const completedMax = param(request, 'completedMax');
  const tasks = (await getListTasks(email, listId)).filter(task => {
    if (status === 'active') return task.status === STATUS.ACTIVE;
    if (task.status === STATUS.ACTIVE) return status !== 'completed';
    const completed = task.completed_at ?? task.updated_at;
    return (
      (!completedMin || completed >= completedMin) &&
      (!completedMax || completed <= completedMax)
    );
  });
  return Response.json({ tasks: tasks.map(toTask) });
});

const createTask = withUser(async (email, request) => {
  const body: TaskBody = await request.json();
  const lists = await getLists(email);
  const listId = resolveListId(lists, body.taskListId);
  const row = unwrap<TaskRow>(
    await supabaseAdmin
      .from(TABLE.TASKS)
      .insert({
        list_id: listId,
        user_email: email,
        title: body.title ?? '',
        notes: body.notes,
        due: body.due,
        ...statusColumns(body.status),
        position: frontPosition(await getListTasks(email, listId)),
      })
      .select('*')
      .single(),
  );
  return Response.json({ task: toTask(row) });
});

const updateTask = withUser(async (email, request) => {
  const body: TaskBody = await request.json();
  const now = new Date().toISOString();
  const row = unwrap<TaskRow | null>(
    await supabaseAdmin
      .from(TABLE.TASKS)
      .update({
        ...(body.title !== undefined && { title: body.title }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.due !== undefined && { due: body.due }),
        ...(body.status && {
          status: body.status,
          completed_at: body.status === STATUS.COMPLETED ? now : null,
        }),
        updated_at: now,
      })
      .eq('id', body.taskId)
      .eq('user_email', email)
      .select('*')
      .maybeSingle(),
  );
  if (!row) return fail('Task not found', HTTP_STATUS_CODES.INVALID_PATH);
  return Response.json({ task: toTask(row) });
});

const deleteTask = withUser(async (email, request) => {
  unwrap(
    await supabaseAdmin
      .from(TABLE.TASKS)
      .delete()
      .eq('id', param(request, 'taskId'))
      .eq('user_email', email),
  );
  return Response.json({ success: true });
});

const moveTask = withUser(async (email, request) => {
  const body: TaskBody = await request.json();
  const lists = await getLists(email);
  const listId = resolveListId(lists, body.taskListId);
  const tasks = await getListTasks(email, listId);
  const rest = tasks.filter(task => task.id !== body.taskId);
  if (rest.length === tasks.length) {
    return fail('Task not found', HTTP_STATUS_CODES.INVALID_PATH);
  }
  const previousIndex = body.previous
    ? rest.findIndex(task => task.id === body.previous)
    : -1;
  const before = rest[previousIndex];
  const after = rest[previousIndex + 1];
  const position =
    before && after
      ? (before.position + after.position) / 2
      : before
        ? before.position + POSITION_STEP
        : frontPosition(rest);
  const row = unwrap<TaskRow>(
    await supabaseAdmin
      .from(TABLE.TASKS)
      .update({ position })
      .eq('id', body.taskId)
      .eq('user_email', email)
      .select('*')
      .single(),
  );
  return Response.json({ task: toTask(row) });
});

const createTasks = withUser(async (email, request) => {
  const body: TaskBody = await request.json();
  const lists = await getLists(email);
  const listId = resolveListId(lists, body.taskListId);
  const front = frontPosition(await getListTasks(email, listId));
  const items = body.items ?? [];
  // Each item lands at the front in turn, so later items sit above earlier ones.
  const rows = unwrap<TaskRow[]>(
    await supabaseAdmin
      .from(TABLE.TASKS)
      .insert(
        items.map((title, index) => ({
          list_id: listId,
          user_email: email,
          title,
          position: front - index * POSITION_STEP,
        })),
      )
      .select('*'),
  );
  return Response.json({
    results: items.map((title, index) => ({
      title,
      success: true,
      taskId: rows.find(row => row.position === front - index * POSITION_STEP)
        ?.id,
    })),
  });
});

// One insert for the whole batch, laid out so the first task ends up on top.
const importTasks = withUser(async (email, request) => {
  const body: { taskListId?: string; tasks?: TaskBody[] } =
    await request.json();
  const lists = await getLists(email);
  const listId = resolveListId(lists, body.taskListId);
  const tasks = body.tasks ?? [];
  if (tasks.length === 0) return Response.json({ count: 0 });
  const front = frontPosition(await getListTasks(email, listId));
  unwrap(
    await supabaseAdmin.from(TABLE.TASKS).insert(
      tasks.map((task, index) => ({
        list_id: listId,
        user_email: email,
        title: task.title ?? '',
        notes: task.notes,
        due: task.due,
        ...statusColumns(task.status),
        position: front - (tasks.length - index) * POSITION_STEP,
      })),
    ),
  );
  return Response.json({ count: tasks.length });
});

const listTaskLists = withUser(async email => {
  const lists = await getLists(email);
  const active = unwrap<{ list_id: string }[]>(
    await supabaseAdmin
      .from(TABLE.TASKS)
      .select('list_id')
      .eq('user_email', email)
      .eq('status', STATUS.ACTIVE),
  );
  return Response.json({
    taskLists: lists,
    activeTaskCounts: Object.fromEntries(
      lists.map(list => [
        list.id,
        active.filter(task => task.list_id === list.id).length,
      ]),
    ),
  });
});

const createTaskList = withUser(async (email, request) => {
  const { title }: TaskBody = await request.json();
  const taskList = unwrap<ListRow>(
    await supabaseAdmin
      .from(TABLE.LISTS)
      .insert({ user_email: email, title: title ?? '' })
      .select('id, title')
      .single(),
  );
  return Response.json({ taskList });
});

const renameTaskList = withUser(async (email, request) => {
  const { title }: TaskBody = await request.json();
  const taskList = unwrap<ListRow | null>(
    await supabaseAdmin
      .from(TABLE.LISTS)
      .update({ title })
      .eq('id', param(request, 'taskListId'))
      .eq('user_email', email)
      .select('id, title')
      .maybeSingle(),
  );
  if (!taskList) {
    return fail('Task list not found', HTTP_STATUS_CODES.INVALID_PATH);
  }
  return Response.json({ taskList });
});

// Tasks go with their list through the foreign key's cascade.
const deleteTaskList = withUser(async (email, request) => {
  unwrap(
    await supabaseAdmin
      .from(TABLE.LISTS)
      .delete()
      .eq('id', param(request, 'taskListId'))
      .eq('user_email', email),
  );
  return Response.json({ success: true });
});

// Same contract as the Google and local adapters, so the tasks component runs
// unchanged against /api/db-tasks.
export const dbTasksRoutes = {
  tasks: {
    GET: listTasks,
    POST: createTask,
    PATCH: updateTask,
    DELETE: deleteTask,
  },
  taskLists: {
    GET: listTaskLists,
    POST: createTaskList,
    PATCH: renameTaskList,
    DELETE: deleteTaskList,
  },
  move: { POST: moveTask },
  create: { POST: createTasks },
  import: { POST: importTasks },
};
