import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { auth } from '../auth';

const router = Router();

const getAuthenticatedTasksClient = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: req.headers as unknown as HeadersInit,
  });

  if (!session?.user || !session.session) {
    throw new Error('Not authenticated');
  }

  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: 'google',
    },
    headers: req.headers as unknown as HeadersInit,
  });
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.tasks({ version: 'v1', auth: oauth2Client });
};

router.get('/lists', async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as HeadersInit,
    });

    if (!session?.user || !session.session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // const accessToken = (session.session as { accessToken?: string }).accessToken;
    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId: 'google',
      },
      headers: req.headers as unknown as HeadersInit,
    });
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token available' });
    }

    const response = await fetch(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API error:', errorText);
      return res
        .status(response.status)
        .json({ error: 'Failed to fetch task lists from Google' });
    }

    const data = await response.json();
    return res.json({ taskLists: data.items || [] });
  } catch (error) {
    console.error('Error fetching task lists:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const tasks = await getAuthenticatedTasksClient(req);
    const taskListId = (req.query.taskListId as string) || '@default';

    const response = await tasks.tasks.list({
      tasklist: taskListId,
      showCompleted: false,
      maxResults: 10,
    });

    return res.json({
      success: true,
      tasks: response.data.items || [],
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch tasks',
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const tasks = await getAuthenticatedTasksClient(req);
    const taskListId = req.body.taskListId || '@default';

    const response = await tasks.tasks.insert({
      tasklist: taskListId,
      requestBody: {
        title: req.body.title,
        notes: req.body.notes,
        due: req.body.due,
      },
    });

    return res.json({
      success: true,
      task: response.data,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create task',
    });
  }
});

router.patch('/', async (req: Request, res: Response) => {
  try {
    const tasks = await getAuthenticatedTasksClient(req);
    const taskListId = req.body.taskListId || '@default';

    const response = await tasks.tasks.patch({
      tasklist: taskListId,
      task: req.body.taskId,
      requestBody: {
        title: req.body.title,
        notes: req.body.notes,
        due: req.body.due,
        status: req.body.status,
      },
    });

    return res.json({
      success: true,
      task: response.data,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update task',
    });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const tasks = await getAuthenticatedTasksClient(req);
    const taskListId = (req.query.taskListId as string) || '@default';
    const taskId = req.query.taskId as string;

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    await tasks.tasks.delete({
      tasklist: taskListId,
      task: taskId,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete task',
    });
  }
});

export default router;
