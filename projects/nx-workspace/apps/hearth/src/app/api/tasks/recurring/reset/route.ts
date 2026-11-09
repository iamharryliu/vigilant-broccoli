import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../../libs/supabase-server';
import {
  RECURRING_TASKS_TABLE,
  badRequest,
  insertDefaultTasks,
  serverError,
  toRecurringTask,
} from '../../../../../lib/tasks-route';

export const runtime = 'nodejs';

// Backs the dev-only "Reset recurring tasks to default" button; deleting the
// tasks cascades to their completions.
export const POST = async (req: NextRequest) => {
  const supabase = createServerClient(getBearerToken(req));
  const { homeId } = await req.json();
  if (!homeId) return badRequest('Missing homeId');

  const { error: deleteError } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .delete()
    .eq('home_id', homeId);
  if (deleteError) return serverError(deleteError.message);

  const { error: insertError } = await insertDefaultTasks(supabase, homeId);
  if (insertError) return serverError(insertError.message);

  const { data, error } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .select('*')
    .eq('home_id', homeId)
    .order('position', { ascending: true });
  if (error) return serverError(error.message);

  return Response.json((data ?? []).map(toRecurringTask));
};
