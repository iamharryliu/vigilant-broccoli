import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { CAREER_PRESET, CareerPreset } from '../../../constants/career';
import { resetCareerFile } from '../../../../lib/career-files.server';
import {
  FILE_BY_KIND,
  invalidKind,
  parseKind,
  runInProgress,
} from '../career-request';
import { hasRunningJobApplicationRun } from '../../../../lib/job-application-runs.db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isPreset = (value: unknown): value is CareerPreset =>
  Object.values(CAREER_PRESET).includes(value as CareerPreset);

export async function POST(req: NextRequest) {
  const kind = parseKind(req);
  if (!kind) return invalidKind();
  const { preset } = await req.json();
  if (!isPreset(preset)) {
    return NextResponse.json(
      { error: 'Unknown preset' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (hasRunningJobApplicationRun()) return runInProgress();
  await resetCareerFile(FILE_BY_KIND[kind], preset);
  return NextResponse.json({ ok: true });
}
