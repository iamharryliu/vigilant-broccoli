import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  markWordAsMastered,
  addMasteredWord,
  getStandaloneMasteredWords,
} from '../db';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(getStandaloneMasteredWords());
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as
    | { wordId: number }
    | { word: string; language: string; definition: string };

  if (!body || !Object.keys(body).length) {
    return NextResponse.json(
      { error: 'Missing body' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if ('wordId' in body) {
    markWordAsMastered(body.wordId);
  } else {
    addMasteredWord(body.word, body.language, body.definition);
  }

  return NextResponse.json({ success: true });
}
