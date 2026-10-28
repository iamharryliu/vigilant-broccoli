import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import {
  markWordAsMastered,
  addMasteredWord,
  getStandaloneMasteredWords,
  unmarkWordAsMastered,
  removeMasteredWord,
} from '../db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  return NextResponse.json(await getStandaloneMasteredWords(userEmail));
}

export async function POST(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const body = (await request.json()) as
    | { wordId: string }
    | {
        word: string;
        language: string;
        definition: string;
        pinyin?: string;
      };

  if (!body || !Object.keys(body).length) {
    return NextResponse.json(
      { error: 'Missing body' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if ('wordId' in body) {
    await markWordAsMastered(userEmail, body.wordId);
  } else {
    await addMasteredWord(
      userEmail,
      body.word,
      body.language,
      body.definition,
      body.pinyin,
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const body = (await request.json()) as { wordId: string } | { word: string };

  if (!body || !Object.keys(body).length) {
    return NextResponse.json(
      { error: 'Missing body' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if ('wordId' in body) {
    await unmarkWordAsMastered(userEmail, body.wordId);
  } else {
    await removeMasteredWord(userEmail, body.word);
  }

  return NextResponse.json({ success: true });
}
