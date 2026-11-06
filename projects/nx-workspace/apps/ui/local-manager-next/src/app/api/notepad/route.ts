import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  NotepadStore,
  getNotepad,
  saveNotepad,
} from '@vigilant-broccoli/react-lib-higher-level/notepad-server';
import { getUserEmail } from '../../../../libs/server-auth';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const runtime = 'nodejs';

const NOTEPAD_STORE: NotepadStore = {
  client: supabaseAdmin,
  table: 'notepad',
  match: { id: 'singleton' },
};

const unauthorized = () =>
  Response.json(
    { error: 'Unauthorized' },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();
  return getNotepad(NOTEPAD_STORE);
}

export async function POST(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();
  return saveNotepad(NOTEPAD_STORE, request);
}
