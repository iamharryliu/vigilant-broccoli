import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { CAREER_FILE_KIND } from '../../../constants/career';
import { validateCareerFile } from '../../../utils/career-file.utils';
import {
  findApplicationResume,
  readApplicationResume,
  writeApplicationResume,
} from '../../../../lib/application-resume.server';
import { PATH_PARAM } from '../../../../lib/paths.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json(
    { error: 'This application has no editable resume' },
    { status: HTTP_STATUS_CODES.INVALID_PATH },
  );

const findResume = (req: NextRequest) =>
  findApplicationResume(req.nextUrl.searchParams.get(PATH_PARAM) ?? '');

export async function GET(req: NextRequest) {
  const resume = await findResume(req);
  if (!resume) return notFound();
  return NextResponse.json(await readApplicationResume(resume));
}

export async function PUT(req: NextRequest) {
  const resume = await findResume(req);
  if (!resume) return notFound();
  const { content } = await req.json();
  if (typeof content !== 'string') {
    return NextResponse.json(
      { error: 'Content must be text' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const errors = validateCareerFile(CAREER_FILE_KIND.RESUME, content);
  if (errors.length) {
    return NextResponse.json(
      { error: 'Fix the listed problems before saving', errors },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  return NextResponse.json(await writeApplicationResume(resume, content));
}
