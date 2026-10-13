import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { auth } from '../auth';

const DEFAULT_TASK_LIST = '@default';
const GOOGLE_PROVIDER_ID = 'google';
const GOOGLE_TASKS_API_URL = 'https://tasks.googleapis.com/tasks/v1';
const GOOGLE_TASK_LISTS_URL = `${GOOGLE_TASKS_API_URL}/users/@me/lists`;
const TASK_LIST_QUERY = { showCompleted: 'false', maxResults: '10' };

const ERROR_NOT_AUTHENTICATED = 'Not authenticated';
const ERROR_UNAUTHORIZED = 'Unauthorized';
const ERROR_NO_ACCESS_TOKEN = 'No access token available';
const ERROR_INTERNAL = 'Internal server error';
const ERROR_FETCH_LISTS = 'Failed to fetch task lists from Google';
const ERROR_FETCH_TASKS = 'Failed to fetch tasks';
const ERROR_CREATE_TASK = 'Failed to create task';
const ERROR_UPDATE_TASK = 'Failed to update task';
const ERROR_DELETE_TASK = 'Failed to delete task';
const ERROR_TASK_ID_REQUIRED = 'taskId is required';
const LOG_GOOGLE_TASKS_ERROR = 'Google Tasks API error:';

type TaskBody = {
  taskListId?: string;
  taskId?: string;
  title?: string;
  notes?: string;
  due?: string;
  status?: string;
};

type TaskQuery = { taskListId?: string; taskId?: string };

type GoogleTasksCollection = { items?: unknown[] };

const getTaskListTasksUrl = (taskListId: string): string =>
  `${GOOGLE_TASKS_API_URL}/lists/${encodeURIComponent(taskListId)}/tasks`;

const getTaskUrl = (taskListId: string, taskId: string): string =>
  `${getTaskListTasksUrl(taskListId)}/${encodeURIComponent(taskId)}`;

const getAuthenticatedAccessToken = async (req: FastifyRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers as unknown as HeadersInit,
  });

  if (!session?.user || !session.session) {
    throw new Error(ERROR_NOT_AUTHENTICATED);
  }

  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: GOOGLE_PROVIDER_ID,
    },
    headers: req.headers as unknown as HeadersInit,
  });
  if (!accessToken) {
    throw new Error(ERROR_NO_ACCESS_TOKEN);
  }

  return accessToken;
};

const tasksRoutes: FastifyPluginAsync = async app => {
  app.get('/lists', async (req, reply) => {
    try {
      const accessToken = await getAuthenticatedAccessToken(req);

      const response = await fetch(GOOGLE_TASK_LISTS_URL, {
        headers: HTTP_HEADERS.AUTHORIZATION(accessToken),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(LOG_GOOGLE_TASKS_ERROR, errorText);
        return reply.code(response.status).send({ error: ERROR_FETCH_LISTS });
      }

      const data = (await response.json()) as GoogleTasksCollection;
      return { taskLists: data.items || [] };
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_NOT_AUTHENTICATED) {
        return reply
          .code(HTTP_STATUS_CODES.UNAUTHORIZED)
          .send({ error: ERROR_UNAUTHORIZED });
      }
      if (error instanceof Error && error.message === ERROR_NO_ACCESS_TOKEN) {
        return reply
          .code(HTTP_STATUS_CODES.UNAUTHORIZED)
          .send({ error: ERROR_NO_ACCESS_TOKEN });
      }
      console.error('Error fetching task lists:', error);
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: ERROR_INTERNAL });
    }
  });

  app.get('/', async (req, reply) => {
    try {
      const accessToken = await getAuthenticatedAccessToken(req);
      const { taskListId } = req.query as TaskQuery;
      const url = new URL(getTaskListTasksUrl(taskListId || DEFAULT_TASK_LIST));
      url.search = new URLSearchParams(TASK_LIST_QUERY).toString();

      const response = await fetch(url, {
        headers: HTTP_HEADERS.AUTHORIZATION(accessToken),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(LOG_GOOGLE_TASKS_ERROR, errorText);
        return reply.code(response.status).send({ error: ERROR_FETCH_TASKS });
      }

      const data = (await response.json()) as GoogleTasksCollection;

      return {
        success: true,
        tasks: data.items || [],
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return reply.code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send({
        error: error instanceof Error ? error.message : ERROR_FETCH_TASKS,
      });
    }
  });

  app.post('/', async (req, reply) => {
    try {
      const accessToken = await getAuthenticatedAccessToken(req);
      const body = req.body as TaskBody;

      const response = await fetch(
        getTaskListTasksUrl(body.taskListId || DEFAULT_TASK_LIST),
        {
          method: HTTP_METHOD.POST,
          headers: {
            ...HTTP_HEADERS.AUTHORIZATION(accessToken),
            ...HTTP_HEADERS.CONTENT_TYPE.JSON,
          },
          body: JSON.stringify({
            title: body.title,
            notes: body.notes,
            due: body.due,
          }),
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(LOG_GOOGLE_TASKS_ERROR, errorText);
        return reply.code(response.status).send({ error: ERROR_CREATE_TASK });
      }

      const task: unknown = await response.json();

      return {
        success: true,
        task,
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return reply.code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send({
        error: error instanceof Error ? error.message : ERROR_CREATE_TASK,
      });
    }
  });

  app.patch('/', async (req, reply) => {
    try {
      const accessToken = await getAuthenticatedAccessToken(req);
      const body = req.body as TaskBody;

      if (!body.taskId) {
        return reply
          .code(HTTP_STATUS_CODES.BAD_REQUEST)
          .send({ error: ERROR_TASK_ID_REQUIRED });
      }

      const response = await fetch(
        getTaskUrl(body.taskListId || DEFAULT_TASK_LIST, body.taskId),
        {
          method: HTTP_METHOD.PATCH,
          headers: {
            ...HTTP_HEADERS.AUTHORIZATION(accessToken),
            ...HTTP_HEADERS.CONTENT_TYPE.JSON,
          },
          body: JSON.stringify({
            title: body.title,
            notes: body.notes,
            due: body.due,
            status: body.status,
          }),
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(LOG_GOOGLE_TASKS_ERROR, errorText);
        return reply.code(response.status).send({ error: ERROR_UPDATE_TASK });
      }

      const task: unknown = await response.json();

      return {
        success: true,
        task,
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return reply.code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send({
        error: error instanceof Error ? error.message : ERROR_UPDATE_TASK,
      });
    }
  });

  app.delete('/', async (req, reply) => {
    try {
      const accessToken = await getAuthenticatedAccessToken(req);
      const { taskListId, taskId } = req.query as TaskQuery;

      if (!taskId) {
        return reply
          .code(HTTP_STATUS_CODES.BAD_REQUEST)
          .send({ error: ERROR_TASK_ID_REQUIRED });
      }

      const response = await fetch(
        getTaskUrl(taskListId || DEFAULT_TASK_LIST, taskId),
        {
          method: HTTP_METHOD.DELETE,
          headers: HTTP_HEADERS.AUTHORIZATION(accessToken),
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(LOG_GOOGLE_TASKS_ERROR, errorText);
        return reply.code(response.status).send({ error: ERROR_DELETE_TASK });
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return reply.code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send({
        error: error instanceof Error ? error.message : ERROR_DELETE_TASK,
      });
    }
  });
};

export default tasksRoutes;
