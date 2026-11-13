import { SupabaseClient } from '@supabase/supabase-js';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { DefaultTask, MONTHLY_ORDINALS } from '../app/components/tasks.utils';

export const RECURRING_TASKS_TABLE = 'home_recurring_tasks';
export const RECURRING_TASK_COMPLETIONS_TABLE =
  'home_recurring_task_completions';
export const ONE_OFF_TASKS_TABLE = 'home_one_off_tasks';

export const toRecurringTask = (row: Record<string, unknown>) => ({
  id: row.id,
  title: row.title,
  days: row.days,
  monthlyNth: row.monthly_nth ?? null,
  position: row.position,
  homeId: row.home_id,
  createdAt: row.created_at,
  assignedUserId: row.assigned_user_id ?? null,
});

export const isValidMonthlyNth = (value: unknown) =>
  value === null ||
  (Array.isArray(value) &&
    value.length > 0 &&
    value.every(nth => MONTHLY_ORDINALS.some(ordinal => ordinal.nth === nth)));

export const serverError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

export const badRequest = (message: string) =>
  Response.json({ error: message }, { status: HTTP_STATUS_CODES.BAD_REQUEST });

const WEEKDAY_NUMBERS = [0, 1, 2, 3, 4, 5, 6];

export const isValidImportedTask = (value: unknown): value is DefaultTask => {
  const { title, days, monthlyNth = null } = (value ?? {}) as DefaultTask;
  return (
    typeof title === 'string' &&
    title.trim() !== '' &&
    Array.isArray(days) &&
    days.length > 0 &&
    days.every(day => WEEKDAY_NUMBERS.includes(day)) &&
    isValidMonthlyNth(monthlyNth)
  );
};

// Matches by title and never deletes: deleting a task cascades to its
// completions. The file's order becomes the list order, existing tasks it
// omits keep their relative order after them, and a matched task keeps its
// assignee and completions.
export const importRecurringTasks = async (
  supabase: SupabaseClient,
  homeId: string,
  tasks: DefaultTask[],
) => {
  const { data, error } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .select('id, title, position')
    .eq('home_id', homeId);
  if (error) return { error };

  const existing = [...(data ?? [])].sort((a, b) => a.position - b.position);
  const idByTitle = new Map(existing.map(({ id, title }) => [title, id]));
  const importedTitles = new Set(tasks.map(({ title }) => title));

  const imported = tasks.map(({ title, days, monthlyNth }, position) => ({
    id: idByTitle.get(title),
    title,
    row: { days, monthly_nth: monthlyNth ?? null, position },
  }));
  const omitted = existing
    .filter(({ title }) => !importedTitles.has(title))
    .map(({ id }, index) => ({ id, row: { position: tasks.length + index } }));

  for (const { id, row } of [...imported, ...omitted]) {
    if (!id) continue;
    const { error: updateError } = await supabase
      .from(RECURRING_TASKS_TABLE)
      .update(row)
      .eq('id', id);
    if (updateError) return { error: updateError };
  }

  const additions = imported.filter(({ id }) => !id);
  if (additions.length === 0) return { error: null };

  return supabase
    .from(RECURRING_TASKS_TABLE)
    .insert(
      additions.map(({ title, row }) => ({ home_id: homeId, title, ...row })),
    );
};
