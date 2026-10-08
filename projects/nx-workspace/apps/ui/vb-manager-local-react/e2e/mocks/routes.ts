import { Page, Route } from '@playwright/test';
import { createMockStore } from './task-data';

const SUPABASE_PROJECT_REF = 'jrdosjjgmsoodpjmjqxx';
const SUPABASE_SESSION_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
const GOOGLE_TOKEN_STORAGE_KEY = 'google_provider_token';
const SESSION_TTL_SECONDS = 86400;
const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'e2e@test.com',
  app_metadata: { provider: 'google' },
  user_metadata: { name: 'E2E Test User' },
  created_at: new Date(0).toISOString(),
};

// The Supabase client reads its session from localStorage, so seeding an
// unexpired one there is what signs the app in without a real OAuth round trip.
const seedSupabaseSession = async (page: Page) => {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'bearer',
    expires_in: SESSION_TTL_SECONDS,
    expires_at: expiresAt,
    user: MOCK_USER,
  };
  await page.addInitScript(
    ({ sessionKey, googleKey, value }) => {
      localStorage.setItem(sessionKey, value);
      localStorage.setItem(googleKey, 'mock-google-token');
    },
    {
      sessionKey: SUPABASE_SESSION_STORAGE_KEY,
      googleKey: GOOGLE_TOKEN_STORAGE_KEY,
      value: JSON.stringify(session),
    },
  );
  await page.route('**/auth/v1/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    });
  });
};

export const setupMockRoutes = async (page: Page) => {
  const store = createMockStore();

  await seedSupabaseSession(page);

  await page.route('**/api/kanban/boards', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        route.request().method() === 'GET'
          ? { state: null }
          : { success: true },
      ),
    });
  });

  await page.route('**/api/tasks/lists*', async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const taskListId = url.searchParams.get('taskListId');

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ taskLists: store.getTaskLists() }),
      });
      return;
    }

    if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      const list = store.createTaskList(body.title);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ taskList: list }),
      });
      return;
    }

    if (method === 'PATCH' && taskListId) {
      const body = JSON.parse(route.request().postData() || '{}');
      const list = store.renameTaskList(taskListId, body.title);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ taskList: list }),
      });
      return;
    }

    if (method === 'DELETE' && taskListId) {
      store.deleteTaskList(taskListId);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
      return;
    }

    await route.continue();
  });

  await page.route('**/api/tasks/move*', async (route: Route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const task = store.moveTask(body.taskListId, body.taskId, body.previous);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, task }),
    });
  });

  await page.route('**/api/tasks?*', async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const taskListId = url.searchParams.get('taskListId') || '@default';
    const taskId = url.searchParams.get('taskId');

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tasks: store.getTasks(taskListId),
        }),
      });
      return;
    }

    if (method === 'DELETE' && taskId) {
      store.deleteTask(taskListId, taskId);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
      return;
    }

    await route.continue();
  });

  await page.route('**/api/tasks', async (route: Route) => {
    const method = route.request().method();
    const body = JSON.parse(route.request().postData() || '{}');

    if (method === 'POST') {
      const task = store.createTask(
        body.taskListId || '@default',
        body.title,
        body.notes,
        body.due,
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, task }),
      });
      return;
    }

    if (method === 'PATCH') {
      const task = store.updateTask(body.taskListId, body.taskId, {
        title: body.title,
        notes: body.notes,
        due: body.due,
        status: body.status,
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, task }),
      });
      return;
    }

    await route.continue();
  });

  return store;
};
