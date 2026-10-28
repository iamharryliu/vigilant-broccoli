import { Page, Route } from '@playwright/test';
import { createMockStore } from './task-data';

export const setupMockRoutes = async (page: Page) => {
  const store = createMockStore();

  await page.route('**/api/auth/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { name: 'E2E Test User', email: 'e2e@test.com' },
        expires: new Date(Date.now() + 86400000).toISOString(),
        accessToken: 'mock-token',
      }),
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
