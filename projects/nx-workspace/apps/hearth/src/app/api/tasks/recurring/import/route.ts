import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../../libs/supabase-server';
import {
  RECURRING_TASKS_TABLE,
  badRequest,
  importRecurringTasks,
  isValidImportedTask,
  serverError,
  toRecurringTask,
} from '../../../../../lib/tasks-route';

export const runtime = 'nodejs';

export const POST = async (req: NextRequest) => {
  const supabase = createServerClient(getBearerToken(req));
  const { homeId, tasks } = await req.json();
  if (!homeId) return badRequest('Missing homeId');
  if (!Array.isArray(tasks) || !tasks.every(isValidImportedTask))
    return badRequest(
      'tasks must be an array of { title, days, monthlyNth? } with weekdays 0-6',
    );

  const { error: importError } = await importRecurringTasks(
    supabase,
    homeId,
    tasks,
  );
  if (importError) return serverError(importError.message);

  const { data, error } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .select('*')
    .eq('home_id', homeId)
    .order('position', { ascending: true });
  if (error) return serverError(error.message);

  return Response.json((data ?? []).map(toRecurringTask));
};
