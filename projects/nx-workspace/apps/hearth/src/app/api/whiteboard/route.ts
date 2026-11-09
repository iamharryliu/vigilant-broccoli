import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  NotepadStore,
  getNotepad,
  saveNotepad,
} from '@vigilant-broccoli/react-lib-higher-level/notepad-server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../libs/supabase-server';

export const runtime = 'nodejs';

const WHITEBOARDS_TABLE = 'whiteboards';
const HOME_BOARD_CONFLICT = 'home_id,board_key';
const DEFAULT_BOARD_KEY = 'family';

const missingHomeId = () =>
  Response.json(
    { error: 'Missing homeId' },
    { status: HTTP_STATUS_CODES.BAD_REQUEST },
  );

// The RLS user client limits every read and write to the caller's homes.
const getStore = (req: NextRequest): NotepadStore | null => {
  const { searchParams } = new URL(req.url);
  const homeId = searchParams.get('homeId');
  if (!homeId) return null;
  return {
    client: createServerClient(getBearerToken(req)),
    table: WHITEBOARDS_TABLE,
    match: {
      home_id: homeId,
      board_key: searchParams.get('boardKey') ?? DEFAULT_BOARD_KEY,
    },
    upsertOnConflict: HOME_BOARD_CONFLICT,
  };
};

export async function GET(req: NextRequest) {
  const store = getStore(req);
  return store ? getNotepad(store) : missingHomeId();
}

export async function POST(req: NextRequest) {
  const store = getStore(req);
  return store ? saveNotepad(store, req) : missingHomeId();
}
