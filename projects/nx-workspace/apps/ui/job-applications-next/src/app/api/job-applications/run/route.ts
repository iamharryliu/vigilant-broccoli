import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { validateResume } from '@vigilant-broccoli/resume';
import {
  CAREER_FILE,
  readCareerFile,
} from '../../../../lib/career-files.server';
import { hasRunningJobApplicationRun } from '../../../../lib/job-application-runs.db';
import { startJobApplicationRun } from '../../../../lib/job-application-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/;

// The skill must keep the resume's identity as is, so a blank one would make
// every run fail its checks.
const hasResumeIdentity = async () => {
  try {
    const result = validateResume(
      JSON.parse(await readCareerFile(CAREER_FILE.RESUME)),
    );
    return (
      result.ok && !!result.resume.basics.name && !!result.resume.basics.email
    );
  } catch {
    return false;
  }
};

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
  if (!(await hasResumeIdentity())) {
    return NextResponse.json(
      {
        error:
          'Add your name and email to the resume on the Career page before running',
      },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (hasRunningJobApplicationRun()) {
    return NextResponse.json(
      { error: 'A job application run is already in progress' },
      { status: HTTP_STATUS_CODES.CONFLICT },
    );
  }

  const run = await startJobApplicationRun(postingUrl, postingText);
  return NextResponse.json({ id: run.id });
}
