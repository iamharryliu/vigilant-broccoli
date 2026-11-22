import { NextRequest } from 'next/server';
import { PostgrestError } from '@supabase/supabase-js';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { WhereIsRoom } from '../../../../lib/types';

const UNIQUE_VIOLATION = '23505';
const ERROR_NAME_REQUIRED = 'A room name is required.';
const ERROR_DUPLICATE_NAME = 'A room with that name already exists.';

interface RoomRow {
  id: string;
  home_id: number;
  name: string;
}

const toWhereIsRoom = (row: RoomRow): WhereIsRoom => ({
  id: row.id,
  homeId: row.home_id,
  name: row.name,
});

const errorResponse = (error: PostgrestError) =>
  error.code === UNIQUE_VIOLATION
    ? Response.json(
        { error: ERROR_DUPLICATE_NAME },
        { status: HTTP_STATUS_CODES.CONFLICT },
      )
    : Response.json(
        { error: error.message },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );

const nameRequiredResponse = () =>
  Response.json(
    { error: ERROR_NAME_REQUIRED },
    { status: HTTP_STATUS_CODES.BAD_REQUEST },
  );

export async function GET(request: NextRequest) {
  const homeId = new URL(request.url).searchParams.get('homeId');
  if (!homeId) {
    return Response.json(
      { error: 'homeId is required.' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const supabase = createServerClient(getBearerToken(request));

  const { data, error } = await supabase
    .from('where_is_rooms')
    .select('id, home_id, name')
    .eq('home_id', homeId)
    .order('name');

  if (error) return errorResponse(error);
  return Response.json((data ?? []).map(toWhereIsRoom));
}

export async function POST(request: NextRequest) {
  const { name, homeId, userId } = (await request.json()) as {
    name: string;
    homeId: number;
    userId: string;
  };
  const trimmed = name?.trim();
  if (!trimmed) return nameRequiredResponse();
  const supabase = createServerClient(getBearerToken(request));

  const { data, error } = await supabase
    .from('where_is_rooms')
    .insert({ name: trimmed, home_id: homeId, user_id: userId })
    .select('id, home_id, name')
    .single();

  if (error) return errorResponse(error);
  return Response.json(toWhereIsRoom(data));
}

export async function PATCH(request: NextRequest) {
  const { id, name } = (await request.json()) as { id: string; name: string };
  const trimmed = name?.trim();
  if (!trimmed) return nameRequiredResponse();
  const supabase = createServerClient(getBearerToken(request));

  const { data, error } = await supabase
    .from('where_is_rooms')
    .update({ name: trimmed })
    .eq('id', id)
    .select('id, home_id, name')
    .single();

  if (error) return errorResponse(error);
  return Response.json(toWhereIsRoom(data));
}

export async function DELETE(request: NextRequest) {
  const { id } = (await request.json()) as { id: string };
  const supabase = createServerClient(getBearerToken(request));

  // where_is_items.room_id is `on delete set null`, so storage areas stay.
  const { error } = await supabase.from('where_is_rooms').delete().eq('id', id);

  if (error) return errorResponse(error);
  return Response.json({ success: true });
}
