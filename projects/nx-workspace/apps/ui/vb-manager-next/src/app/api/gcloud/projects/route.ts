import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { GcloudService } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    return NextResponse.json(await GcloudService.listProjects());
  } catch (error) {
    console.error('Error fetching gcloud projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gcloud projects' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
