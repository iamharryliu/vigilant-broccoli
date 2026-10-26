import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { stat } from 'fs/promises';
import { promisify } from 'util';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { resolveJobApplicationsPath } from '../job-applications.server';

const execFileAsync = promisify(execFile);

// Reveals a folder in Finder on the machine serving the app; the manager runs
// on the user's own Mac, so this is the same desktop the browser is on.
export async function POST(req: NextRequest) {
  const { path } = await req.json();
  const folder =
    typeof path === 'string' && path ? resolveJobApplicationsPath(path) : null;
  if (!folder) {
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  try {
    if (!(await stat(folder)).isDirectory()) throw new Error('Not a folder');
    await execFileAsync('open', [folder]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to open' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
