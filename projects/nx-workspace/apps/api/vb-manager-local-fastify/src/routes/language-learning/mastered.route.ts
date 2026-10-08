import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../libs/server-auth';
import {
  markWordAsMastered,
  addMasteredWord,
  getStandaloneMasteredWords,
  unmarkWordAsMastered,
  removeMasteredWord,
} from './db';

export async function GET(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  return Response.json(await getStandaloneMasteredWords(userEmail));
}

export async function POST(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
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
    return Response.json(
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

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const body = (await request.json()) as { wordId: string } | { word: string };

  if (!body || !Object.keys(body).length) {
    return Response.json(
      { error: 'Missing body' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  if ('wordId' in body) {
    await unmarkWordAsMastered(userEmail, body.wordId);
  } else {
    await removeMasteredWord(userEmail, body.word);
  }

  return Response.json({ success: true });
}
