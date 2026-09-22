import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
// gcloud accounts are email addresses, service accounts included.
const GCLOUD_ACCOUNT_PATTERN = /^[\w.+-]+@[\w.-]+$/;

export async function POST(request: Request) {
  try {
    const { account } = await request.json();

    if (!account) {
      return NextResponse.json(
        { error: 'account is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (!GCLOUD_ACCOUNT_PATTERN.test(String(account))) {
      return NextResponse.json(
        { error: 'account is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await execFileAsync('gcloud', [
      'config',
      'set',
      'account',
      String(account),
    ]);

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Error setting gcloud account:', error);
    return NextResponse.json(
      { error: 'Failed to set gcloud account' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
