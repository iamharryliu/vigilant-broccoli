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

const getSupabase = (req: NextRequest) =>
  createServerClient(getBearerToken(req));

const toCompletion = ({ id, task_id, date }: Record<string, string>) => ({
  id,
  taskId: task_id,
  date,
});

// Every completed occurrence stays listed, so the whole history is returned.
export const GET = async (req: NextRequest) => {
  const homeId = new URL(req.url).searchParams.get('homeId');
  if (!homeId) return badRequest('homeId is required');

  const { data, error } = await getSupabase(req)
    .from(RECURRING_TASK_COMPLETIONS_TABLE)
    .select('id, task_id, date')
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
    .select('home_id')
    .eq('id', taskId)
    .single();
  if (taskError) return serverError(taskError.message);

  const { data, error } = await supabase
    .from(RECURRING_TASK_COMPLETIONS_TABLE)
    .upsert(
      { task_id: taskId, home_id: task.home_id, date },
      { onConflict: 'task_id,date' },
    )
    .select('id, task_id, date')
    .single();
  if (error) return serverError(error.message);

  return Response.json(toCompletion(data));
};
