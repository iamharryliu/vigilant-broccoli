import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { homedir } from 'os';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const execFileAsync = promisify(execFile);

const REPO_ROOT = join(homedir(), 'vigilant-broccoli');
const RESUME_REPO_PATH =
  'projects/nx-workspace/libs/@vigilant-broccoli/resume/src/resume.json';
const BASELINE_REF = 'HEAD';
const MAX_BUFFER_BYTES = 5 * 1024 * 1024;
const READ_FAILED = 'Failed to read the committed resume.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['show', `${BASELINE_REF}:${RESUME_REPO_PATH}`],
      { cwd: REPO_ROOT, maxBuffer: MAX_BUFFER_BYTES },
    );
    return NextResponse.json({ content: stdout });
  } catch (error) {
    console.error(READ_FAILED, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : READ_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
