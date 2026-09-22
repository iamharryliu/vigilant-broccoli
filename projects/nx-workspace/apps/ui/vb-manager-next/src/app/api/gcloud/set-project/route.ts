import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
// Plain ids plus the `domain.com:project` form legacy domain-scoped projects use.
const GCLOUD_PROJECT_ID_PATTERN = /^[\w.:-]+$/;

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (!GCLOUD_PROJECT_ID_PATTERN.test(String(projectId))) {
      return NextResponse.json(
        { error: 'projectId is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await execFileAsync('gcloud', [
      'config',
      'set',
      'project',
      String(projectId),
    ]);

    return NextResponse.json({ success: true, projectId });
  } catch (error) {
    console.error('Error setting gcloud project:', error);
    return NextResponse.json(
      { error: 'Failed to set gcloud project' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
