import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const WHITEBOARDS_TABLE = 'whiteboards';
const HOME_BOARD_CONFLICT = 'home_id,board_key';
const DEFAULT_BOARD_KEY = 'family';
const WHITEBOARD_COLUMNS = 'content, home_id, board_key, updated_at';

const getSupabase = (req: NextRequest) => {
  const accessToken = getBearerToken(req);
  return createServerClient(accessToken);
};

const toWhiteboard = (row: Record<string, unknown>) => ({
  content: (row.content as string) ?? '',
  homeId: row.home_id,
  boardKey: row.board_key,
  updatedAt: row.updated_at,
});

const internalError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const conflict = (
  row: Record<string, unknown> | null,
  homeId: string,
  boardKey: string,
) =>
  Response.json(toWhiteboard(row ?? { home_id: homeId, board_key: boardKey }), {
    status: HTTP_STATUS_CODES.CONFLICT,
  });

const fetchWhiteboard = (
  supabase: ReturnType<typeof getSupabase>,
  homeId: string,
  boardKey: string,
) =>
  supabase
    .from(WHITEBOARDS_TABLE)
    .select(WHITEBOARD_COLUMNS)
    .eq('home_id', homeId)
    .eq('board_key', boardKey)
    .maybeSingle();

// Clients only flag an empty write when their own edit emptied the board, and
// only a write based on the current row may clear it; anything else (fresh
// tab, failed load, reset room) gets the saved text back as a 409 instead.
const refuseEmptyOverwrite = async (
  supabase: ReturnType<typeof getSupabase>,
  homeId: string,
  boardKey: string,
) => {
  const { data, error } = await fetchWhiteboard(supabase, homeId, boardKey);
  if (error) return internalError(error.message);
  return data?.content ? conflict(data, homeId, boardKey) : null;
};

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

  const { data, error } = await fetchWhiteboard(supabase, homeId, boardKey);

  if (error) return internalError(error.message);

  if (data) return Response.json(toWhiteboard(data));

  return Response.json({
    content: '',
    homeId: Number(homeId),
    boardKey,
    updatedAt: null,
  });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  const boardKey = searchParams.get('boardKey') ?? DEFAULT_BOARD_KEY;
  if (!homeId) return missingHomeId();

  const supabase = getSupabase(req);
  const { content, baseUpdatedAt, allowEmpty } = await req.json();
  const text: string = content ?? '';
  const updatedAt = new Date().toISOString();

  if (!text && !(allowEmpty && baseUpdatedAt)) {
    const refusal = await refuseEmptyOverwrite(supabase, homeId, boardKey);
    if (refusal) return refusal;
  }

  if (!baseUpdatedAt) {
    const { data, error } = await supabase
      .from(WHITEBOARDS_TABLE)
      .upsert(
        {
          home_id: homeId,
          board_key: boardKey,
          content: text,
          updated_at: updatedAt,
        },
        { onConflict: HOME_BOARD_CONFLICT },
      )
      .select(WHITEBOARD_COLUMNS)
      .single();

    if (error) return internalError(error.message);

    return Response.json(toWhiteboard(data));
  }

  const { data, error } = await supabase
    .from(WHITEBOARDS_TABLE)
    .update({ content: text, updated_at: updatedAt })
    .eq('home_id', homeId)
    .eq('board_key', boardKey)
    .eq('updated_at', baseUpdatedAt)
    .select(WHITEBOARD_COLUMNS);

  if (error) return internalError(error.message);

  if (!data || data.length === 0) {
    const { data: latest, error: latestError } = await fetchWhiteboard(
      supabase,
      homeId,
      boardKey,
    );
    if (latestError) return internalError(latestError.message);
    return conflict(latest, homeId, boardKey);
  }

  return Response.json(toWhiteboard(data[0]));
}
