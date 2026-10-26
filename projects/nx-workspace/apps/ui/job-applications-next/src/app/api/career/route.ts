import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { validateResume } from '@vigilant-broccoli/resume';
import { CAREER_FILE_KIND, CareerFileKind } from '../../constants/career';
import { validateCareerExperience } from '../../utils/career-experience.utils';
import {
  CAREER_FILE,
  readCareerFile,
  writeCareerFile,
} from '../../../lib/career-files.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KIND_PARAM = 'kind';

const FILE_BY_KIND = {
  [CAREER_FILE_KIND.CAREER_EXPERIENCE]: CAREER_FILE.CAREER_EXPERIENCE,
  [CAREER_FILE_KIND.RESUME]: CAREER_FILE.RESUME,
} as const;

const parseKind = (req: NextRequest): CareerFileKind | null => {
  const kind = req.nextUrl.searchParams.get(KIND_PARAM);
  return kind && kind in FILE_BY_KIND ? (kind as CareerFileKind) : null;
};

const validateResumeText = (content: string): string[] => {
  try {
    const result = validateResume(JSON.parse(content));
    return result.ok ? [] : result.errors;
  } catch (error) {
    return [error instanceof Error ? error.message : 'Invalid JSON'];
  }
};

const VALIDATOR_BY_KIND = {
  [CAREER_FILE_KIND.CAREER_EXPERIENCE]: validateCareerExperience,
  [CAREER_FILE_KIND.RESUME]: validateResumeText,
} as const;

const invalidKind = () =>
  NextResponse.json(
    { error: 'Unknown career file' },
    { status: HTTP_STATUS_CODES.BAD_REQUEST },
  );

export async function GET(req: NextRequest) {
  const kind = parseKind(req);
  if (!kind) return invalidKind();
  const file = FILE_BY_KIND[kind];
  return NextResponse.json({
    content: await readCareerFile(file),
    path: file.path,
  });
}

export async function PUT(req: NextRequest) {
  const kind = parseKind(req);
  if (!kind) return invalidKind();
  const { content } = await req.json();
  if (typeof content !== 'string') {
    return NextResponse.json(
      { error: 'Content must be text' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const errors = VALIDATOR_BY_KIND[kind](content);
  if (errors.length) {
    return NextResponse.json(
      { error: 'Fix the listed problems before saving', errors },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  await writeCareerFile(FILE_BY_KIND[kind], content);
  return NextResponse.json({ ok: true });
}
