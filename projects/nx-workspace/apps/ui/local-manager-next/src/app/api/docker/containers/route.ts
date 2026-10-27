import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { DockerService } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    return NextResponse.json(await DockerService.getStatus());
  } catch (error) {
    console.error('Error fetching Docker container status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Docker container status' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
