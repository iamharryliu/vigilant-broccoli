import { NextRequest, NextResponse } from 'next/server';
import {
  NotepadStore,
  getNotepad,
  saveNotepad,
} from '@vigilant-broccoli/react-lib-higher-level/notepad-server';
import { requireAuth } from '../../../../libs/api-auth';
import { supabaseAdmin } from '../../../../libs/supabase-admin';

export const runtime = 'nodejs';

// Same row as local-manager-next's /api/notepad.
const NOTEPAD_STORE: NotepadStore = {
  client: supabaseAdmin,
  table: 'notepad',
  match: { id: 'singleton' },
};

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  return getNotepad(NOTEPAD_STORE);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  return saveNotepad(NOTEPAD_STORE, request);
}
