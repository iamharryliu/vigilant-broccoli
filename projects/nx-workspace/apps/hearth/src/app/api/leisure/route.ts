import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../libs/supabase-server';
import { buildEmailMap } from '../../../../libs/email-map';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const getSupabase = (req: NextRequest) => {
  const accessToken = getBearerToken(req);
  return createServerClient(accessToken);
};

const toLeisureActivity = (
  row: Record<string, unknown>,
  emailMap: Record<string, string> = {},
) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? null,
  category: row.category,
  position: row.position,
  homeId: row.home_id,
  createdByEmail: row.user_id
    ? (emailMap[row.user_id as string] ?? null)
    : null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const id = searchParams.get('id');
  const supabase = getSupabase(req);

  let query = supabase
    .from('leisure_activities')
    .select('*')
    .order('position', { ascending: true });

  if (id) query = query.eq('id', id);
  else if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  const rows = data ?? [];
  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
  const emailMap = await buildEmailMap(userIds);

  const result = rows.map(r => toLeisureActivity(r, emailMap));
  return Response.json(id ? (result[0] ?? null) : result);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lastActivity, error: positionError } = await supabase
    .from('leisure_activities')
    .select('position')
    .eq('home_id', body.homeId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError)
    return Response.json(
      { error: positionError.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  const { data, error } = await supabase
    .from('leisure_activities')
    .insert({
      title: body.title,
      description: body.description || null,
      category: body.category,
      position: (lastActivity?.position ?? -1) + 1,
      home_id: body.homeId,
      user_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  const emailMap = data.user_id ? await buildEmailMap([data.user_id]) : {};
  return Response.json(toLeisureActivity(data, emailMap));
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = await req.json();

  if (Array.isArray(body.order)) {
    const results = await Promise.all(
      body.order.map(({ id, position }: { id: string; position: number }) =>
        supabase.from('leisure_activities').update({ position }).eq('id', id),
      ),
    );
    const error = results.find(result => result.error)?.error;
    if (error)
      return Response.json(
        { error: error.message },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    return Response.json({ success: true });
  }

  const { id } = body;

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined)
    updates.description = body.description || null;
  if (body.category !== undefined) updates.category = body.category;

  const { data, error } = await supabase
    .from('leisure_activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  const emailMap = data.user_id ? await buildEmailMap([data.user_id]) : {};
  return Response.json(toLeisureActivity(data, emailMap));
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id } = await req.json();

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const { error } = await supabase
    .from('leisure_activities')
    .delete()
    .eq('id', id);

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json({ success: true });
}
