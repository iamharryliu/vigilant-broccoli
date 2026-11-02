import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { AwsService } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    const profiles = await AwsService.listProfiles();
    return NextResponse.json({ profiles });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch AWS profiles' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
