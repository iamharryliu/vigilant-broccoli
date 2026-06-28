import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const getSupabase = (req: NextRequest) => {
  const accessToken =
    req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  return createServerClient(accessToken);
};

const toBooking = (row: Record<string, unknown>) => ({
  id: row.id,
  resourceId: row.resource_id,
  title: row.title,
  description: row.description ?? null,
  startDate: row.start_date,
  endDate: row.end_date,
  homeId: row.home_id,
  calendarEventId: row.calendar_event_id ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const resourceId = searchParams.get('resourceId');
  const supabase = getSupabase(req);

  let query = supabase
    .from('resource_bookings')
    .select('*')
    .order('start_date', { ascending: true });

  if (homeId) query = query.eq('home_id', homeId);
  if (resourceId) query = query.eq('resource_id', resourceId);

  const { data, error } = await query;
  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json((data ?? []).map(toBooking));
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase(req);
  const body = await req.json();

  const { data, error } = await supabase
    .from('resource_bookings')
    .insert({
      resource_id: body.resourceId,
      title: body.title,
      description: body.description || null,
      start_date: body.startDate,
      end_date: body.endDate,
      home_id: body.homeId,
      calendar_event_id: body.calendarEventId ?? null,
    })
    .select()
    .single();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json(toBooking(data));
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
  if (body.resourceId !== undefined) updates.resource_id = body.resourceId;
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined)
    updates.description = body.description || null;
  if (body.startDate !== undefined) updates.start_date = body.startDate;
  if (body.endDate !== undefined) updates.end_date = body.endDate;

  const { data, error } = await supabase
    .from('resource_bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json(toBooking(data));
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
    .from('resource_bookings')
    .delete()
    .eq('id', id);

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json({ success: true });
}
