import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import { getAllSessions } from '../db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const sessions = (await getAllSessions(userEmail)).map(s => ({
    id: s.id,
    language: s.language,
    category: s.category,
    created_at: s.created_at,
    words: s.words,
    exampleSentence: {
      target: s.example_target,
      english: s.example_english,
      pinyin: s.example_pinyin ?? undefined,
    },
  }));
  return NextResponse.json(sessions);
}
