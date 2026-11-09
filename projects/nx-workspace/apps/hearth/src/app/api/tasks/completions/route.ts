import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import {
  RECURRING_TASKS_TABLE,
  RECURRING_TASK_COMPLETIONS_TABLE,
  badRequest,
  serverError,
} from '../../../../lib/tasks-route';

export const runtime = 'nodejs';

const COMPLETION_COLUMNS = 'id, task_id, date, created_at, assigned_user_id';

const getSupabase = (req: NextRequest) =>
  createServerClient(getBearerToken(req));

const toCompletion = ({
  id,
  task_id,
  date,
  created_at,
  assigned_user_id,
}: Record<string, string | null>) => ({
  id,
  taskId: task_id,
  date,
  completedAt: created_at,
  assignedUserId: assigned_user_id ?? null,
});

// Every completed occurrence stays listed, so the whole history is returned.
export const GET = async (req: NextRequest) => {
  const homeId = new URL(req.url).searchParams.get('homeId');
  if (!homeId) return badRequest('homeId is required');

  const { data, error } = await getSupabase(req)
    .from(RECURRING_TASK_COMPLETIONS_TABLE)
    .select(COMPLETION_COLUMNS)
    .eq('home_id', homeId)
    .order('date');
  if (error) return serverError(error.message);

  return Response.json((data ?? []).map(toCompletion));
};

export const POST = async (req: NextRequest) => {
  const supabase = getSupabase(req);
  const { taskId, date, completed } = await req.json();
  if (!taskId || !date || typeof completed !== 'boolean')
    return badRequest('taskId, date and completed are required');

  // A removed completion's assignee is not restored onto the task.
  if (!completed) {
    const { error } = await supabase
      .from(RECURRING_TASK_COMPLETIONS_TABLE)
      .delete()
      .eq('task_id', taskId)
      .eq('date', date);
    if (error) return serverError(error.message);
    return Response.json({ success: true });
  }

  // home_id comes from the task as read through RLS rather than the request,
  // so a completion cannot pair a task with another home.
  const { data: task, error: taskError } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .select('home_id, assigned_user_id')
    .eq('id', taskId)
    .single();
  if (taskError) return serverError(taskError.message);

  // The task's assignee belongs to its pending occurrence only, so it moves to
  // the completion and the next occurrence starts unassigned.
  const { data, error } = await supabase
    .from(RECURRING_TASK_COMPLETIONS_TABLE)
    .upsert(
      {
        task_id: taskId,
        home_id: task.home_id,
        date,
        assigned_user_id: task.assigned_user_id,
      },
      { onConflict: 'task_id,date' },
    )
    .select(COMPLETION_COLUMNS)
    .single();
  if (error) return serverError(error.message);

  const { error: clearError } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .update({ assigned_user_id: null, updated_at: new Date().toISOString() })
    .eq('id', taskId);
  if (clearError) return serverError(clearError.message);

  return Response.json(toCompletion(data));
};

// RLS scopes the update to completions of the caller's homes.
export const PATCH = async (req: NextRequest) => {
  const { id, assignedUserId } = await req.json();
  if (!id || assignedUserId === undefined)
    return badRequest('id and assignedUserId are required');

  const { data, error } = await getSupabase(req)
    .from(RECURRING_TASK_COMPLETIONS_TABLE)
    .update({ assigned_user_id: assignedUserId })
    .eq('id', id)
    .select(COMPLETION_COLUMNS)
    .single();
  if (error) return serverError(error.message);

  return Response.json(toCompletion(data));
};
