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

// `date` is the client's local YYYY-MM-DD, since "today" is the member's day.
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const date = searchParams.get('date');
  if (!homeId || !date) return badRequest('homeId and date are required');

  const { data, error } = await getSupabase(req)
    .from(RECURRING_TASK_COMPLETIONS_TABLE)
    .select('task_id')
    .eq('home_id', homeId)
    .eq('date', date);
  if (error) return serverError(error.message);

  return Response.json((data ?? []).map(({ task_id }) => task_id));
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

  const { error } = await supabase
    .from(RECURRING_TASK_COMPLETIONS_TABLE)
    .upsert(
      { task_id: taskId, home_id: task.home_id, date },
      { onConflict: 'task_id,date', ignoreDuplicates: true },
    );
  if (error) return serverError(error.message);

  return Response.json({ success: true });
};
