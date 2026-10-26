import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { validateResume } from '@vigilant-broccoli/resume';
import { readFile } from 'fs/promises';
import {
  CAREER_FILE,
  readCareerFile,
} from '../../../../lib/career-files.server';
import { hasRunningJobApplicationRun } from '../../../../lib/job-application-runs.db';
import { startJobApplicationRun } from '../../../../lib/job-application-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/;

const readResumeEmail = (content: string) => {
  const result = validateResume(JSON.parse(content));
  return result.ok && result.resume.basics.name
    ? result.resume.basics.email
    : '';
};

// The skill must keep the resume's identity as is, so a blank one would make
// every run fail its checks, and the sample's would apply as someone fictional.
const hasResumeIdentity = async () => {
  try {
    const email = readResumeEmail(await readCareerFile(CAREER_FILE.RESUME));
    const sampleEmail = readResumeEmail(
      await readFile(CAREER_FILE.RESUME.template.sample, 'utf-8'),
    );
    return !!email && email !== sampleEmail;
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
          'Replace the sample or blank resume with your own name and email in the Resume section before running',
      },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  if (hasRunningJobApplicationRun()) {
    return NextResponse.json(
      { error: 'Another run is already in progress' },
      { status: HTTP_STATUS_CODES.CONFLICT },
    );
  }

  const run = await startJobApplicationRun(postingUrl, postingText);
  return NextResponse.json({ id: run.id });
}
