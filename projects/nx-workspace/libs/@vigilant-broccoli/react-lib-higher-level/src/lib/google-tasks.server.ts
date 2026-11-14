import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  GOOGLE_TOKEN_EXPIRED,
  createTask,
  createTaskList,
  deleteTask,
  deleteTaskList,
  isExpiredError,
  listTaskLists,
  listTasks,
  moveTask,
  renameTaskList,
  updateTask,
} from '@vigilant-broccoli/google-workspace';

const DEFAULT_TASK_LIST_ID = '@default';
const TASK_LIST_ID_PARAM = 'taskListId';
const TASK_ID_PARAM = 'taskId';
const INCLUDE_ACTIVE_COUNTS_PARAM = 'includeActiveCounts';
// Omitting it returns active and completed tasks together.
const TASK_STATUS_PARAM = 'status';
const TASK_STATUS_FILTER = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;
const COMPLETED_MIN_PARAM = 'completedMin';
const COMPLETED_MAX_PARAM = 'completedMax';

// Returns the caller's Google access token, or the Response to send instead
// (401 for a missing session or Google token, which the client's reconnect
// flow handles, or 403 for an app's allowlist).
export type GoogleAccessTokenResolver = (
  request: Request,
) => Promise<string | Response>;

type RouteHandler = (request: Request) => Promise<Response>;

const CreateTasksSchema = z.object({
  items: z.array(z.string()).min(1),
  taskListId: z.string().min(1),
});

type TaskResult = {
  title: string;
  success: boolean;
  taskId?: string | null;
  error?: string;
};

const errorResponse = (error: string, status: number) =>
  Response.json({ error }, { status });

const badRequest = (error: string) =>
  errorResponse(error, HTTP_STATUS_CODES.BAD_REQUEST);

const googleErrorResponse = (error: unknown, fallback: string) =>
  isExpiredError(error)
    ? errorResponse(GOOGLE_TOKEN_EXPIRED, HTTP_STATUS_CODES.UNAUTHORIZED)
    : errorResponse(fallback, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);

const searchParam = (request: Request, name: string) =>
  new URL(request.url).searchParams.get(name);

const withGoogleToken =
  (
    resolveAccessToken: GoogleAccessTokenResolver,
    failureMessage: string,
    handle: (accessToken: string, request: Request) => Promise<Response>,
  ): RouteHandler =>
  async request => {
    const accessToken = await resolveAccessToken(request);
    if (accessToken instanceof Response) return accessToken;
    try {
      return await handle(accessToken, request);
    } catch (error) {
      return googleErrorResponse(error, failureMessage);
    }
  };

const createTasks = async (accessToken: string, request: Request) => {
  const parsed = CreateTasksSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const { items, taskListId } = parsed.data;
  const results: TaskResult[] = [];
  for (const title of items) {
    try {
      const task = await createTask(accessToken, taskListId, title);
      results.push({ title, success: true, taskId: task.id });
    } catch (error) {
      if (isExpiredError(error)) throw error;
      const message =
        (error as { message?: string })?.message ?? 'Unknown error';
      results.push({ title, success: false, error: message });
    }
  }
  return Response.json({ results });
};

const listTaskListsWithCounts = async (
  accessToken: string,
  request: Request,
) => {
  const taskLists = await listTaskLists(accessToken);
  if (searchParam(request, INCLUDE_ACTIVE_COUNTS_PARAM) !== 'true') {
    return Response.json({ taskLists });
  }
  const activeTaskCounts = Object.fromEntries(
    await Promise.all(
      taskLists.map(async list => [
        list.id,
        (await listTasks(accessToken, list.id)).length,
      ]),
    ),
  );
  return Response.json({ taskLists, activeTaskCounts });
};

// Route modules re-export these, e.g.
// `export const { GET, POST } = googleTasksRoutes.taskLists;`.
export const createGoogleTasksRouteHandlers = (
  resolveAccessToken: GoogleAccessTokenResolver,
) => {
  const route = (
    failureMessage: string,
    handle: (accessToken: string, request: Request) => Promise<Response>,
  ) => withGoogleToken(resolveAccessToken, failureMessage, handle);

  return {
    tasks: {
      GET: route('Failed to fetch tasks', async (accessToken, request) => {
        const taskListId =
          searchParam(request, TASK_LIST_ID_PARAM) ?? DEFAULT_TASK_LIST_ID;
        const statusFilter = searchParam(request, TASK_STATUS_PARAM);
        if (statusFilter === TASK_STATUS_FILTER.ACTIVE) {
          return Response.json({
            tasks: await listTasks(accessToken, taskListId),
          });
        }
        const tasks = await listTasks(accessToken, taskListId, true, {
          completedMin: searchParam(request, COMPLETED_MIN_PARAM) ?? undefined,
          completedMax: searchParam(request, COMPLETED_MAX_PARAM) ?? undefined,
        });
        // Google has no completed-only filter, so drop active tasks here.
        return Response.json({
          tasks:
            statusFilter === TASK_STATUS_FILTER.COMPLETED
              ? tasks.filter(t => t.status === 'completed')
              : tasks,
        });
      }),
      POST: route('Failed to create task', async (accessToken, request) => {
        const body = await request.json();
        const task = await createTask(
          accessToken,
          body.taskListId ?? DEFAULT_TASK_LIST_ID,
          body.title,
        );
        return Response.json({ task });
      }),
      PATCH: route('Failed to update task', async (accessToken, request) => {
        const body = await request.json();
        const task = await updateTask(
          accessToken,
          body.taskListId ?? DEFAULT_TASK_LIST_ID,
          body.taskId,
          {
            title: body.title,
            notes: body.notes,
            due: body.due,
            status: body.status,
          },
        );
        return Response.json({ task });
      }),
      DELETE: route('Failed to delete task', async (accessToken, request) => {
        const taskId = searchParam(request, TASK_ID_PARAM);
        if (!taskId) return badRequest('taskId is required');
        await deleteTask(
          accessToken,
          searchParam(request, TASK_LIST_ID_PARAM) ?? DEFAULT_TASK_LIST_ID,
          taskId,
        );
        return Response.json({ success: true });
      }),
    },
    taskLists: {
      GET: route(
        'Failed to fetch task lists from Google',
        listTaskListsWithCounts,
      ),
      POST: route(
        'Failed to create task list',
        async (accessToken, request) => {
          const { title } = await request.json();
          const taskList = await createTaskList(accessToken, title);
          return Response.json({ taskList });
        },
      ),
      PATCH: route(
        'Failed to rename task list',
        async (accessToken, request) => {
          const taskListId = searchParam(request, TASK_LIST_ID_PARAM);
          if (!taskListId) return badRequest('taskListId is required');
          const { title } = await request.json();
          const taskList = await renameTaskList(accessToken, taskListId, title);
          return Response.json({ taskList });
        },
      ),
      DELETE: route(
        'Failed to delete task list',
        async (accessToken, request) => {
          const taskListId = searchParam(request, TASK_LIST_ID_PARAM);
          if (!taskListId) return badRequest('taskListId is required');
          await deleteTaskList(accessToken, taskListId);
          return Response.json({ success: true });
        },
      ),
    },
    createTasks: {
      POST: route('Failed to create tasks', createTasks),
    },
    moveTask: {
      POST: route('Failed to move task', async (accessToken, request) => {
        const {
          taskListId = DEFAULT_TASK_LIST_ID,
          taskId,
          previous,
        } = await request.json();
        if (!taskId) return badRequest('taskId is required');
        const task = await moveTask(
          accessToken,
          taskListId,
          taskId,
          previous ?? null,
        );
        return Response.json({ task });
      }),
    },
  };
};
