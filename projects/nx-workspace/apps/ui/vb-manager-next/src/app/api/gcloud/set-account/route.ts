import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  GcloudService,
  isValidGcloudAccount,
} from '@vigilant-broccoli/devops-cli';

export async function POST(request: Request) {
  try {
    const { account } = await request.json();

    if (!account) {
      return NextResponse.json(
        { error: 'account is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (!isValidGcloudAccount(String(account))) {
      return NextResponse.json(
        { error: 'account is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await GcloudService.setAccount(String(account));

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error('Error setting gcloud account:', error);
    return NextResponse.json(
      { error: 'Failed to set gcloud account' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
