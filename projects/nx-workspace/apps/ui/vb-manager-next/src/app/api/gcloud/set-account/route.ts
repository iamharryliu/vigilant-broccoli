import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { account } = await request.json();

    if (!account) {
      return NextResponse.json(
        { error: 'account is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await execAsync(`gcloud config set account ${account}`);

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Error setting gcloud account:', error);
    return NextResponse.json(
      { error: 'Failed to set gcloud account' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
