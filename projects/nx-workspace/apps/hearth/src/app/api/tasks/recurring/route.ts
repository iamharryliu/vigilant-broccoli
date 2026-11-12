import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import {
  RECURRING_TASKS_TABLE,
  badRequest,
  isValidMonthlyNth,
  serverError,
  toRecurringTask,
} from '../../../../lib/tasks-route';

export const runtime = 'nodejs';

const INVALID_MONTHLY_NTH =
  'monthlyNth must be null or a non-empty array of 1-4 or -1';

const UPDATABLE_COLUMNS = {
  title: 'title',
  days: 'days',
  monthlyNth: 'monthly_nth',
  assignedUserId: 'assigned_user_id',
};

const getSupabase = (req: NextRequest) =>
  createServerClient(getBearerToken(req));

export const GET = async (req: NextRequest) => {
  const homeId = new URL(req.url).searchParams.get('homeId');
  if (!homeId) return badRequest('Missing homeId');
  const { data, error } = await getSupabase(req)
    .from(RECURRING_TASKS_TABLE)
    .select('*')
    .eq('home_id', homeId)
    .order('position', { ascending: true });
  if (error) return serverError(error.message);

  return Response.json((data ?? []).map(toRecurringTask));
};

export const POST = async (req: NextRequest) => {
  const supabase = getSupabase(req);
  const { homeId, title, days, monthlyNth = null } = await req.json();
  if (!homeId || !title || !Array.isArray(days))
    return badRequest('homeId, title and days are required');
  if (!isValidMonthlyNth(monthlyNth)) return badRequest(INVALID_MONTHLY_NTH);

  // New tasks land above every existing one.
  const { data: firstTask, error: positionError } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .select('position')
    .eq('home_id', homeId)
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (positionError) return serverError(positionError.message);

  const { data, error } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .insert({
      home_id: homeId,
      title,
      days,
      monthly_nth: monthlyNth,
      position: (firstTask?.position ?? 1) - 1,
    })
    .select()
    .single();
  if (error) return serverError(error.message);

  return Response.json(toRecurringTask(data));
};

export const PATCH = async (req: NextRequest) => {
  const supabase = getSupabase(req);
  const body = await req.json();

  if (Array.isArray(body.order)) {
    const results = await Promise.all(
      body.order.map(({ id, position }: { id: string; position: number }) =>
        supabase.from(RECURRING_TASKS_TABLE).update({ position }).eq('id', id),
      ),
    );
    const error = results.find(result => result.error)?.error;
    if (error) return serverError(error.message);
    return Response.json({ success: true });
  }

  if (!body.id) return badRequest('Missing id');
  if (body.monthlyNth !== undefined && !isValidMonthlyNth(body.monthlyNth))
    return badRequest(INVALID_MONTHLY_NTH);

  const updates = {
    updated_at: new Date().toISOString(),
    ...Object.fromEntries(
      Object.entries(UPDATABLE_COLUMNS)
        .filter(([field]) => body[field] !== undefined)
        .map(([field, column]) => [column, body[field]]),
    ),
  };

  const { data, error } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .update(updates)
    .eq('id', body.id)
    .select()
    .single();
  if (error) return serverError(error.message);

  return Response.json(toRecurringTask(data));
};

export const DELETE = async (req: NextRequest) => {
  const supabase = getSupabase(req);
  const { id } = await req.json();
  if (!id) return badRequest('Missing id');

  const { error } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .delete()
    .eq('id', id);
  if (error) return serverError(error.message);

  return Response.json({ success: true });
};
