import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  startMatchBriefRun,
  startMissingMatchBriefRuns,
} from '../../../../lib/match-brief-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL_PARAM = 'url';

// Starts a Claude run that writes a brief of the posting at `url`, or without
// `url` one run for every posting that lacks a current brief.
export async function POST(req: NextRequest) {
  const url = req.nextUrl.searchParams.get(URL_PARAM);
  if (!url) {
    return NextResponse.json({ started: await startMissingMatchBriefRuns() });
  }
  const run = await startMatchBriefRun(url);
  if (!run) {
    return NextResponse.json(
      { error: 'Posting not found or already being briefed' },
      { status: HTTP_STATUS_CODES.INVALID_PATH },
    );
  }
  return NextResponse.json({ id: run.id, status: run.status });
}
