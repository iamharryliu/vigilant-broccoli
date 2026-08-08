import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../libs/api-auth';
import { supabaseAdmin } from '../../../../libs/supabase-admin';

export const runtime = 'nodejs';

const NOTEPAD_TABLE = 'notepad';
const NOTEPAD_ID = 'singleton';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { data, error } = await supabaseAdmin
    .from(NOTEPAD_TABLE)
    .select('content, updated_at')
    .eq('id', NOTEPAD_ID)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    content: data.content ?? '',
    updatedAt: data.updated_at,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { content } = await request.json();
  const updatedAt = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from(NOTEPAD_TABLE)
    .update({ content, updated_at: updatedAt })
    .eq('id', NOTEPAD_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updatedAt });
}
