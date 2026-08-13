import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const WHITEBOARDS_TABLE = 'whiteboards';
const HOME_BOARD_CONFLICT = 'home_id,board_key';
const DEFAULT_BOARD_KEY = 'family';

const getSupabase = (req: NextRequest) => {
  const accessToken =
    req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  return createServerClient(accessToken);
};

const toWhiteboard = (row: Record<string, unknown>) => ({
  content: (row.content as string) ?? '',
  homeId: row.home_id,
  boardKey: row.board_key,
  updatedAt: row.updated_at,
});

const missingHomeId = () =>
  Response.json(
    { error: 'Missing homeId' },
    { status: HTTP_STATUS_CODES.BAD_REQUEST },
  );

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const boardKey = searchParams.get('boardKey') ?? DEFAULT_BOARD_KEY;
  if (!homeId) return missingHomeId();

  const supabase = getSupabase(req);

  const { data, error } = await supabase
    .from(WHITEBOARDS_TABLE)
    .select('content, home_id, board_key, updated_at')
    .eq('home_id', homeId)
    .eq('board_key', boardKey)
    .maybeSingle();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  if (data) return Response.json(toWhiteboard(data));

  return Response.json({
    content: '',
    homeId: Number(homeId),
    boardKey,
    updatedAt: null,
  });
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabase(req);
  const { homeId, content, boardKey } = await req.json();
  if (!homeId) return missingHomeId();

  const updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from(WHITEBOARDS_TABLE)
    .upsert(
      {
        home_id: homeId,
        board_key: boardKey ?? DEFAULT_BOARD_KEY,
        content: content ?? '',
        updated_at: updatedAt,
      },
      { onConflict: HOME_BOARD_CONFLICT },
    )
    .select('content, home_id, board_key, updated_at')
    .single();

  if (error)
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );

  return Response.json(toWhiteboard(data));
}
