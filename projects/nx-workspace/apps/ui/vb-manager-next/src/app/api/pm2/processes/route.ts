import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { Pm2Service } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    return NextResponse.json(await Pm2Service.listProcesses());
  } catch (error) {
    console.error('Error fetching PM2 processes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PM2 processes' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
