import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../libs/supabase-server';
import { buildEmailMap } from '../../../../libs/email-map';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const getSupabase = (req: NextRequest) => {
  const accessToken =
    req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  return createServerClient(accessToken);
};

const toProject = (
  row: Record<string, unknown>,
  emailMap: Record<string, string> = {},
) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? null,
  category: row.category,
  status: row.status,
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
  const supabase = getSupabase(req);

  let query = supabase
    .from('home_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  const rows = data ?? [];
  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
  const emailMap = await buildEmailMap(userIds);

  return Response.json(rows.map(r => toProject(r, emailMap)));
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('home_projects')
    .insert({
      title: body.title,
      description: body.description || null,
      category: body.category,
      status: body.status ?? 'Todo',
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
  return Response.json(toProject(data, emailMap));
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id, ...body } = await req.json();

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
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await supabase
    .from('home_projects')
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
  return Response.json(toProject(data, emailMap));
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id } = await req.json();

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const { error } = await supabase.from('home_projects').delete().eq('id', id);

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json({ success: true });
}
