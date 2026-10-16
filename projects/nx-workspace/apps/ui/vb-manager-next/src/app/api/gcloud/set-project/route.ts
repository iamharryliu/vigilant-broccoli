import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  GcloudService,
  isValidGcloudProjectId,
} from '@vigilant-broccoli/devops-cli';

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (!isValidGcloudProjectId(String(projectId))) {
      return NextResponse.json(
        { error: 'projectId is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await GcloudService.setProject(String(projectId));

    return NextResponse.json({ success: true, projectId });
  } catch (error) {
    console.error('Error setting gcloud project:', error);
    return NextResponse.json(
      { error: 'Failed to set gcloud project' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
