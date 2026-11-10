import { SupabaseClient } from '@supabase/supabase-js';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { DEFAULT_TASKS, MONTHLY_ORDINALS } from '../app/components/tasks.utils';

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

export const insertDefaultTasks = (supabase: SupabaseClient, homeId: string) =>
  supabase.from(RECURRING_TASKS_TABLE).insert(
    DEFAULT_TASKS.map(({ title, days }, position) => ({
      home_id: homeId,
      title,
      days,
      position,
    })),
  );
