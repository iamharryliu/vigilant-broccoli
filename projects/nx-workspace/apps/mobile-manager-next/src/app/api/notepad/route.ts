import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { requireAuth } from '../../../../libs/api-auth';
import { supabaseAdmin } from '../../../../libs/supabase-admin';

export const runtime = 'nodejs';

const NOTEPAD_TABLE = 'notepad';
const NOTEPAD_ID = 'singleton';
const NOTEPAD_COLUMNS = 'content, updated_at';

interface NotepadRow {
  content: string | null;
  updated_at: string;
}

const fetchNotepad = () =>
  supabaseAdmin
    .from(NOTEPAD_TABLE)
    .select(NOTEPAD_COLUMNS)
    .eq('id', NOTEPAD_ID)
    .single<NotepadRow>();

const internalError = (message: string) =>
  NextResponse.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const conflict = (row: NotepadRow) =>
  NextResponse.json(
    { content: row.content ?? '', updatedAt: row.updated_at },
    { status: HTTP_STATUS_CODES.CONFLICT },
  );

// Mirrors hearth's /api/whiteboard: only a client flagging an edited-empty doc
// against the current row may clear saved text, so a fresh or reset room gets
// the saved text back as a 409 instead of wiping it.
const refuseEmptyOverwrite = async () => {
  const { data, error } = await fetchNotepad();
  if (error) return internalError(error.message);
  return data.content ? conflict(data) : null;
};

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { data, error } = await fetchNotepad();
  if (error) return internalError(error.message);

  return NextResponse.json({
    content: data.content ?? '',
    updatedAt: data.updated_at,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { content, baseUpdatedAt, allowEmpty } = await request.json();
  const updatedAt = new Date().toISOString();

  if (!content && !(allowEmpty && baseUpdatedAt)) {
    const refusal = await refuseEmptyOverwrite();
    if (refusal) return refusal;
  }

  const { data, error } = await supabaseAdmin
    .from(NOTEPAD_TABLE)
    .update({ content, updated_at: updatedAt })
    .eq('id', NOTEPAD_ID)
    .eq('updated_at', baseUpdatedAt)
    .select(NOTEPAD_COLUMNS);

  if (error) return internalError(error.message);

  if (!data || data.length === 0) {
    const { data: latest, error: latestError } = await fetchNotepad();
    if (latestError) return internalError(latestError.message);
    return conflict(latest);
  }

  return NextResponse.json({ success: true, updatedAt });
}
