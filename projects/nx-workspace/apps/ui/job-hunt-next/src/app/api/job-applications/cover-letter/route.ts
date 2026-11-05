import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  findApplicationCoverLetter,
  readApplicationCoverLetter,
  writeApplicationCoverLetter,
} from '../../../../lib/application-cover-letter.server';
import { PATH_PARAM } from '../../../../lib/paths.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json(
    { error: 'This application has no cover letter' },
    { status: HTTP_STATUS_CODES.INVALID_PATH },
  );

const findLetter = (req: NextRequest) =>
  findApplicationCoverLetter(req.nextUrl.searchParams.get(PATH_PARAM) ?? '');

export async function GET(req: NextRequest) {
  const letter = await findLetter(req);
  if (!letter) return notFound();
  return NextResponse.json(await readApplicationCoverLetter(letter));
}

export async function PUT(req: NextRequest) {
  const letter = await findLetter(req);
  if (!letter) return notFound();
  const { content } = await req.json();
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json(
      { error: 'The cover letter cannot be empty' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  return NextResponse.json(await writeApplicationCoverLetter(letter, content));
}
