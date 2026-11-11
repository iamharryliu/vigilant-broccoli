import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getNotes, saveNotes } from '../../../lib/notes.db';

export async function GET() {
  return NextResponse.json(getNotes());
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    content?: unknown;
  } | null;
  if (typeof body?.content !== 'string') {
    return NextResponse.json(
      { error: 'Invalid notes content' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  return NextResponse.json(saveNotes(body.content));
}
