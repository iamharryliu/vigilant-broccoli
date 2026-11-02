import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { FlyioService } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    const apps = await FlyioService.listApps();
    return NextResponse.json({ success: true, apps });
  } catch (error) {
    console.error('Error fetching Fly.io apps:', error);
    const authRequired = FlyioService.isAuthError(error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Fly.io apps', authRequired },
      {
        status: authRequired
          ? HTTP_STATUS_CODES.UNAUTHORIZED
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      },
    );
  }
}
