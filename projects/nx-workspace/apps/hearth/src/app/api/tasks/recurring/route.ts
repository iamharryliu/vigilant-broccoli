import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import {
  RECURRING_TASKS_TABLE,
  badRequest,
  serverError,
  toRecurringTask,
} from '../../../../lib/tasks-route';

export const runtime = 'nodejs';

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
  const { homeId, title, days } = await req.json();
  if (!homeId || !title || !Array.isArray(days))
    return badRequest('homeId, title and days are required');

  const { data: lastTask, error: positionError } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .select('position')
    .eq('home_id', homeId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (positionError) return serverError(positionError.message);

  const { data, error } = await supabase
    .from(RECURRING_TASKS_TABLE)
    .insert({
      home_id: homeId,
      title,
      days,
      position: (lastTask?.position ?? -1) + 1,
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

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title;
  if (body.days !== undefined) updates.days = body.days;
  if (body.assignedUserId !== undefined)
    updates.assigned_user_id = body.assignedUserId;

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
