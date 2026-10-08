import { test, expect, Page } from '@playwright/test';
import { setupMockRoutes } from './mocks/routes';

// The kanban toolbar buttons are icon-only lucide icons with no accessible name.
const SIDEBAR_COLLAPSE_BUTTON = 'button:has(svg.lucide-chevron-left)';
const SIDEBAR_EXPAND_BUTTON = 'button:has(svg.lucide-chevron-right)';
const ADD_BOARD_BUTTON = 'button:has(svg.lucide-plus)';
const REMOVE_LANE_BUTTON = 'button:has(svg.lucide-x)';
const MANAGE_LISTS_BUTTON = 'button:has(svg.lucide-menu)';

const apiFetch = (page: Page, url: string, options: RequestInit = {}) =>
  page.evaluate(
    async ({ url, options }) => {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      return { ok: res.ok, data: await res.json() };
    },
    { url, options: { ...options, body: options.body as string } },
  );

test.describe('Mock API - Task Lists CRUD', () => {
  test('create, fetch, rename, delete via mocked endpoints', async ({
    page,
  }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');

    const created = await apiFetch(page, '/api/tasks/lists', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test List' }),
    });
    expect(created.ok).toBe(true);
    expect(created.data.taskList.title).toBe('Test List');
    const listId = created.data.taskList.id;

    const fetched = await apiFetch(page, '/api/tasks/lists');
    expect(fetched.data.taskLists).toHaveLength(1);

    const renamed = await apiFetch(
      page,
      `/api/tasks/lists?taskListId=${listId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Renamed List' }),
      },
    );
    expect(renamed.data.taskList.title).toBe('Renamed List');

    const deleted = await apiFetch(
      page,
      `/api/tasks/lists?taskListId=${listId}`,
      {
        method: 'DELETE',
      },
    );
    expect(deleted.ok).toBe(true);

    const afterDelete = await apiFetch(page, '/api/tasks/lists');
    expect(afterDelete.data.taskLists).toHaveLength(0);
  });
});

test.describe('Mock API - Tasks CRUD', () => {
  test('create, fetch, update, delete via mocked endpoints', async ({
    page,
  }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');

    const list = await apiFetch(page, '/api/tasks/lists', {
      method: 'POST',
      body: JSON.stringify({ title: 'Tasks List' }),
    });
    const listId = list.data.taskList.id;

    const created = await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        taskListId: listId,
        title: 'Task 1',
        notes: 'Notes',
      }),
    });
    expect(created.data.task.title).toBe('Task 1');
    const taskId = created.data.task.id;

    const fetched = await apiFetch(page, `/api/tasks?taskListId=${listId}`);
    expect(fetched.data.tasks).toHaveLength(1);

    const updated = await apiFetch(page, '/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify({
        taskListId: listId,
        taskId,
        title: 'Updated',
        notes: 'New notes',
      }),
    });
    expect(updated.data.task.title).toBe('Updated');
    expect(updated.data.task.notes).toBe('New notes');

    await apiFetch(page, `/api/tasks?taskListId=${listId}&taskId=${taskId}`, {
      method: 'DELETE',
    });

    const afterDelete = await apiFetch(page, `/api/tasks?taskListId=${listId}`);
    expect(afterDelete.data.tasks).toHaveLength(0);
  });
});

test.describe('Mock API - Task reorder', () => {
  test('reorder tasks within a list', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');

    const list = await apiFetch(page, '/api/tasks/lists', {
      method: 'POST',
      body: JSON.stringify({ title: 'Reorder List' }),
    });
    const listId = list.data.taskList.id;

    const taskA = await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ taskListId: listId, title: 'A' }),
    });
    await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ taskListId: listId, title: 'B' }),
    });
    const taskC = await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ taskListId: listId, title: 'C' }),
    });

    await apiFetch(page, '/api/tasks/move', {
      method: 'POST',
      body: JSON.stringify({
        taskListId: listId,
        taskId: taskC.data.task.id,
        previous: taskA.data.task.id,
      }),
    });

    const result = await apiFetch(page, `/api/tasks?taskListId=${listId}`);
    const titles = result.data.tasks.map((t: { title: string }) => t.title);
    expect(titles).toEqual(['A', 'C', 'B']);
  });

  test('move task to first position', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');

    const list = await apiFetch(page, '/api/tasks/lists', {
      method: 'POST',
      body: JSON.stringify({ title: 'First Pos List' }),
    });
    const listId = list.data.taskList.id;

    await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ taskListId: listId, title: 'A' }),
    });
    await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ taskListId: listId, title: 'B' }),
    });
    const taskC = await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ taskListId: listId, title: 'C' }),
    });

    await apiFetch(page, '/api/tasks/move', {
      method: 'POST',
      body: JSON.stringify({
        taskListId: listId,
        taskId: taskC.data.task.id,
        previous: null,
      }),
    });

    const result = await apiFetch(page, `/api/tasks?taskListId=${listId}`);
    expect(result.data.tasks[0].title).toBe('C');
  });
});

test.describe('Mock API - Cross-list move', () => {
  test('move task between lists', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');

    const source = await apiFetch(page, '/api/tasks/lists', {
      method: 'POST',
      body: JSON.stringify({ title: 'Source' }),
    });
    const target = await apiFetch(page, '/api/tasks/lists', {
      method: 'POST',
      body: JSON.stringify({ title: 'Target' }),
    });

    const task = await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        taskListId: source.data.taskList.id,
        title: 'Moving',
      }),
    });

    await apiFetch(page, '/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        taskListId: target.data.taskList.id,
        title: 'Moving',
      }),
    });
    await apiFetch(
      page,
      `/api/tasks?taskListId=${source.data.taskList.id}&taskId=${task.data.task.id}`,
      { method: 'DELETE' },
    );

    const sourceResult = await apiFetch(
      page,
      `/api/tasks?taskListId=${source.data.taskList.id}`,
    );
    const targetResult = await apiFetch(
      page,
      `/api/tasks?taskListId=${target.data.taskList.id}`,
    );
    expect(sourceResult.data.tasks).toHaveLength(0);
    expect(targetResult.data.tasks).toHaveLength(1);
    expect(targetResult.data.tasks[0].title).toBe('Moving');
  });
});

test.describe('Kanban UI - Auth', () => {
  test('redirects to Google sign-in when unauthenticated', async ({ page }) => {
    await page.route('**/auth/v1/authorize**', async route => {
      await route.fulfill({ status: 200, body: 'authorize' });
    });
    await page.goto('/kanban');
    await page.waitForURL(/\/auth\/v1\/authorize\?provider=google/);
  });

  test('shows board UI when authenticated', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');
    await expect(page.getByText('Boards')).toBeVisible();
    await expect(page.getByText('+ Add Lane')).toBeVisible();
  });
});

test.describe('Kanban UI - Sidebar', () => {
  test('toggle sidebar visibility', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');

    await expect(page.getByText('Boards')).toBeVisible();

    await page.locator(SIDEBAR_COLLAPSE_BUTTON).click();
    await expect(page.getByText('Boards')).not.toBeVisible();

    await page.locator(SIDEBAR_EXPAND_BUTTON).click();
    await expect(page.getByText('Boards')).toBeVisible();
  });
});

test.describe('Kanban UI - Board management', () => {
  test('add board via dialog', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');
    await page.waitForTimeout(500);

    await page.locator(ADD_BOARD_BUTTON).first().click();
    await page.getByPlaceholder('Board name...').fill('New Board');
    await page.getByRole('button', { name: 'Add Board' }).click();

    await expect(page.getByText('New Board').first()).toBeVisible();
  });

  test('rename board via double-click', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');
    await page.waitForTimeout(500);

    await page.getByText('Default Board', { exact: true }).first().dblclick();

    const input = page.locator('input:visible').first();
    await input.fill('Renamed Board');
    await input.press('Enter');

    await expect(page.getByText('Renamed Board').first()).toBeVisible();
  });
});

test.describe('Kanban UI - Lane management', () => {
  test('add lane from existing list', async ({ page }) => {
    const store = await setupMockRoutes(page);
    store.createTaskList('My List');
    await page.goto('/kanban');
    await page.waitForTimeout(500);

    await page.getByText('+ Add Lane').click();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'My List' }).click();
    await page.getByRole('button', { name: 'Add Lane' }).click();

    await expect(page.getByText('My List').first()).toBeVisible();
  });

  test('create new list from add lane dialog', async ({ page }) => {
    await setupMockRoutes(page);
    await page.goto('/kanban');
    await page.waitForTimeout(500);

    await page.getByText('+ Add Lane').click();
    await page.getByText('+ Create new list').click();
    await page.getByPlaceholder('New list name...').fill('Brand New List');
    await page.getByRole('button', { name: 'Create List' }).click();

    await expect(page.getByText('Brand New List').first()).toBeVisible();
  });

  test('remove lane via close button', async ({ page }) => {
    const store = await setupMockRoutes(page);
    store.createTaskList('Remove Me');
    await page.goto('/kanban');
    await page.waitForTimeout(500);

    await page.getByText('+ Add Lane').click();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Remove Me' }).click();
    await page.getByRole('button', { name: 'Add Lane' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Remove Me').first()).toBeVisible();

    await page.locator(REMOVE_LANE_BUTTON).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Remove Me')).toHaveCount(0);
  });
});

test.describe('Kanban UI - Manage task lists dialog', () => {
  test('open manage lists dialog and see lists', async ({ page }) => {
    const store = await setupMockRoutes(page);
    store.createTaskList('List A');
    store.createTaskList('List B');
    await page.goto('/kanban');
    await page.waitForTimeout(500);

    await page.locator(MANAGE_LISTS_BUTTON).click();
    await expect(
      page.getByRole('heading', { name: 'Manage Task Lists' }),
    ).toBeVisible();
    await expect(page.getByText('List A')).toBeVisible();
    await expect(page.getByText('List B')).toBeVisible();
  });
});
