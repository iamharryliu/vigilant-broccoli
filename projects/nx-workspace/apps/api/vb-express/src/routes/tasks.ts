import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { google } from 'googleapis';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { auth } from '../auth';

const DEFAULT_TASK_LIST = '@default';
const GOOGLE_PROVIDER_ID = 'google';
const GOOGLE_TASK_LISTS_URL =
  'https://tasks.googleapis.com/tasks/v1/users/@me/lists';

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

type TaskBody = {
  taskListId?: string;
  taskId?: string;
  title?: string;
  notes?: string;
  due?: string;
  status?: string;
};

type TaskQuery = { taskListId?: string; taskId?: string };

const getAuthenticatedTasksClient = async (req: FastifyRequest) => {
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

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.tasks({ version: 'v1', auth: oauth2Client });
};

const tasksRoutes: FastifyPluginAsync = async app => {
  app.get('/lists', async (req, reply) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as unknown as HeadersInit,
      });

      if (!session?.user || !session.session) {
        return reply
          .code(HTTP_STATUS_CODES.UNAUTHORIZED)
          .send({ error: ERROR_UNAUTHORIZED });
      }

      const { accessToken } = await auth.api.getAccessToken({
        body: {
          providerId: GOOGLE_PROVIDER_ID,
        },
        headers: req.headers as unknown as HeadersInit,
      });
      if (!accessToken) {
        return reply
          .code(HTTP_STATUS_CODES.UNAUTHORIZED)
          .send({ error: ERROR_NO_ACCESS_TOKEN });
      }

      const response = await fetch(GOOGLE_TASK_LISTS_URL, {
        headers: {
          [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Tasks API error:', errorText);
        return reply.code(response.status).send({ error: ERROR_FETCH_LISTS });
      }

      const data = await response.json();
      return { taskLists: data.items || [] };
    } catch (error) {
      console.error('Error fetching task lists:', error);
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: ERROR_INTERNAL });
    }
  });

  app.get('/', async (req, reply) => {
    try {
      const tasks = await getAuthenticatedTasksClient(req);
      const { taskListId } = req.query as TaskQuery;

      const response = await tasks.tasks.list({
        tasklist: taskListId || DEFAULT_TASK_LIST,
        showCompleted: false,
        maxResults: 10,
      });

      return {
        success: true,
        tasks: response.data.items || [],
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
      const tasks = await getAuthenticatedTasksClient(req);
      const body = req.body as TaskBody;

      const response = await tasks.tasks.insert({
        tasklist: body.taskListId || DEFAULT_TASK_LIST,
        requestBody: {
          title: body.title,
          notes: body.notes,
          due: body.due,
        },
      });

      return {
        success: true,
        task: response.data,
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
      const tasks = await getAuthenticatedTasksClient(req);
      const body = req.body as TaskBody;

      const response = await tasks.tasks.patch({
        tasklist: body.taskListId || DEFAULT_TASK_LIST,
        task: body.taskId,
        requestBody: {
          title: body.title,
          notes: body.notes,
          due: body.due,
          status: body.status,
        },
      });

      return {
        success: true,
        task: response.data,
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
      const tasks = await getAuthenticatedTasksClient(req);
      const { taskListId, taskId } = req.query as TaskQuery;

      if (!taskId) {
        return reply
          .code(HTTP_STATUS_CODES.BAD_REQUEST)
          .send({ error: ERROR_TASK_ID_REQUIRED });
      }

      await tasks.tasks.delete({
        tasklist: taskListId || DEFAULT_TASK_LIST,
        task: taskId,
      });

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
