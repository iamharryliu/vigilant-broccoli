import { NextRequest } from 'next/server';
import { createServerClient, getBearerToken } from '../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const TABLE = 'kitchen_project_items';
const HOME_ID_PARAM = 'homeId';
const MISSING_ID_ERROR = 'Missing id';

const COLUMN_BY_FIELD: Record<string, string> = {
  name: 'name',
  kind: 'kind',
  location: 'location',
  notes: 'notes',
  startedAt: 'started_at',
  readyAt: 'ready_at',
  useByAt: 'use_by_at',
  resolution: 'resolution',
};


const getSupabase = (req: NextRequest) =>
  createServerClient(getBearerToken(req));

const toItem = (row: Record<string, unknown>) => ({
  id: row.id,
  name: row.name,
  kind: row.kind,
  location: row.location,
  notes: row.notes ?? null,
  startedAt: row.started_at,
  readyAt: row.ready_at ?? null,
  useByAt: row.use_by_at ?? null,
  resolution: row.resolution ?? null,
  resolvedAt: row.resolved_at ?? null,
  homeId: row.home_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const serverError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const badRequest = (message: string) =>
  Response.json({ error: message }, { status: HTTP_STATUS_CODES.BAD_REQUEST });

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get(HOME_ID_PARAM);
  const supabase = getSupabase(req);

  let query = supabase
    .from(TABLE)
    .select('*')
    .order('use_by_at', { ascending: true, nullsFirst: false });

  if (homeId) query = query.eq('home_id', homeId);

  const { data, error } = await query;
  if (error) return serverError(error.message);

  return Response.json((data ?? []).map(toItem));
};

export const POST = async (req: NextRequest) => {
  const supabase = getSupabase(req);
  const body = await req.json();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: body.name,
      kind: body.kind,
      location: body.location,
      notes: body.notes ?? null,
      started_at: body.startedAt ?? new Date().toISOString(),
      ready_at: body.readyAt ?? null,
      use_by_at: body.useByAt ?? null,
      home_id: body.homeId,
    })
    .select()
    .single();

  if (error) return serverError(error.message);

  return Response.json(toItem(data));
};

export const PATCH = async (req: NextRequest) => {
  const supabase = getSupabase(req);
  const { id, ...body } = await req.json();

  if (!id) return badRequest(MISSING_ID_ERROR);

  const updates: Record<string, unknown> = Object.entries(COLUMN_BY_FIELD)
    .filter(([field]) => body[field] !== undefined)
    .reduce((acc, [field, column]) => ({ ...acc, [column]: body[field] }), {
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>);

  if (body.resolution !== undefined)
    updates.resolved_at = body.resolution ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return serverError(error.message);

  return Response.json(toItem(data));
};

export const DELETE = async (req: NextRequest) => {
  const supabase = getSupabase(req);
  const { id } = await req.json();

  if (!id) return badRequest(MISSING_ID_ERROR);

  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return serverError(error.message);

  return Response.json({ success: true });
};
