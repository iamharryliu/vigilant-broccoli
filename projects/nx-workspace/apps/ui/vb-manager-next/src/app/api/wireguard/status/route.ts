import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { WireguardService } from '@vigilant-broccoli/devops-cli';

export async function GET() {
  try {
    const connections = await WireguardService.listConnections();
    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching WireGuard status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WireGuard status' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
