import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { GcloudService } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    return NextResponse.json(await GcloudService.getAuthStatus());
  } catch (error) {
    console.error('Error fetching gcloud auth status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gcloud auth status' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
