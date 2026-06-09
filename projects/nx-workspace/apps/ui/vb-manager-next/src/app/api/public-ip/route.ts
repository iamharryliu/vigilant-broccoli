import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

// GET - Fetch public IP address
export async function GET(_req: NextRequest) {
  try {
    // Using ipify API to get public IP
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();

    return NextResponse.json({
      success: true,
      ip: data.ip,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch public IP address',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
