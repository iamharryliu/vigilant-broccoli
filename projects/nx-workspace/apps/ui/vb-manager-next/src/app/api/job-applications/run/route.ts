import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  hasRunningJobApplicationTask,
  startJobApplicationRun,
} from '../../../../lib/job-application-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/;

export async function POST(req: NextRequest) {
  const { url = '', text = '' } = await req.json();
  const postingUrl = String(url).trim();
  const postingText = String(text).trim();
  if (!postingText) {
    return NextResponse.json(
      { error: 'Paste a job posting or application question' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (postingUrl && !HTTP_URL_PATTERN.test(postingUrl)) {
    return NextResponse.json(
      { error: 'URL must start with http:// or https://' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (hasRunningJobApplicationTask()) {
    return NextResponse.json(
      { error: 'A job application run is already in progress' },
      { status: HTTP_STATUS_CODES.CONFLICT },
    );
  }

  const task = await startJobApplicationRun(postingUrl, postingText);
  return NextResponse.json({ id: task.id });
}
