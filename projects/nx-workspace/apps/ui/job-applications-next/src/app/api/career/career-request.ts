import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { CAREER_FILE_KIND } from '../../constants/career';
import { isCareerFileKind } from '../../utils/career-file.utils';
import { CAREER_FILE } from '../../../lib/career-files.server';

const KIND_PARAM = 'kind';

export const FILE_BY_KIND = {
  [CAREER_FILE_KIND.CAREER_EXPERIENCE]: CAREER_FILE.CAREER_EXPERIENCE,
  [CAREER_FILE_KIND.RESUME]: CAREER_FILE.RESUME,
} as const;

export const parseKind = (req: NextRequest) => {
  const kind = req.nextUrl.searchParams.get(KIND_PARAM);
  return isCareerFileKind(kind) ? kind : null;
};

export const invalidKind = () =>
  NextResponse.json(
    { error: 'Unknown career file' },
    { status: HTTP_STATUS_CODES.BAD_REQUEST },
  );

// Runs read and rewrite the career files, so changing them mid-run would race.
export const runInProgress = () =>
  NextResponse.json(
    { error: 'Wait for the current run to finish' },
    { status: HTTP_STATUS_CODES.CONFLICT },
  );
