import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { RenderCliService } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    const services = await RenderCliService.listServices();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching Render services:', error);
    const authRequired = RenderCliService.isAuthError(error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Render services',
        authRequired,
      },
      {
        status: authRequired
          ? HTTP_STATUS_CODES.UNAUTHORIZED
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      },
    );
  }
}
