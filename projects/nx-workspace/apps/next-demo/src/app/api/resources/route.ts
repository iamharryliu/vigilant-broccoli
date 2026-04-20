import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const getSupabase = (req: NextRequest) => {
  const accessToken =
    req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  return createServerClient(accessToken);
};

const toResource = (row: Record<string, unknown>) => ({
  id: row.id,
  name: row.name,
  description: row.description ?? null,
  category: row.category,
  quantity: row.quantity,
  homeId: row.home_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const supabase = getSupabase(req);

  let query = supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json((data ?? []).map(toResource));
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = await req.json();

  const { data, error } = await supabase
    .from('resources')
    .insert({
      name: body.name,
      description: body.description || null,
      category: body.category,
      quantity: body.quantity ?? 1,
      home_id: body.homeId,
    })
    .select()
    .single();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json(toResource(data));
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
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined)
    updates.description = body.description || null;
  if (body.category !== undefined) updates.category = body.category;
  if (body.quantity !== undefined) updates.quantity = body.quantity;

  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json(toResource(data));
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase(req);
  const { id } = await req.json();

  if (!id)
    return Response.json(
      { error: 'Missing id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );

  const { error } = await supabase.from('resources').delete().eq('id', id);

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json({ success: true });
}
