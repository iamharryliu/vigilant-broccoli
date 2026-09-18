import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../libs/server-auth';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const runtime = 'nodejs';

const NOTEPAD_TABLE = 'notepad';
const NOTEPAD_ID = 'singleton';

const unauthorized = () =>
  NextResponse.json(
    { error: 'Unauthorized' },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { data, error } = await supabaseAdmin
    .from(NOTEPAD_TABLE)
    .select('content, updated_at')
    .eq('id', NOTEPAD_ID)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return NextResponse.json({
    content: data.content ?? '',
    updatedAt: data.updated_at,
  });
}

export async function POST(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) return unauthorized();

  const { content, baseUpdatedAt } = await request.json();
  const updatedAt = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(NOTEPAD_TABLE)
    .update({ content, updated_at: updatedAt })
    .eq('id', NOTEPAD_ID)
    .eq('updated_at', baseUpdatedAt)
    .select('content, updated_at');

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  if (!data || data.length === 0) {
    const { data: latest, error: latestError } = await supabaseAdmin
      .from(NOTEPAD_TABLE)
      .select('content, updated_at')
      .eq('id', NOTEPAD_ID)
      .single();

    if (latestError) {
      return NextResponse.json(
        { error: latestError.message },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json(
      { content: latest.content ?? '', updatedAt: latest.updated_at },
      { status: HTTP_STATUS_CODES.CONFLICT },
    );
  }

  return NextResponse.json({ success: true, updatedAt });
}
