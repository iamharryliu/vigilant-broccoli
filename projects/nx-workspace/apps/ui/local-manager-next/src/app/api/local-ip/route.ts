import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { networkInterfaces } from 'os';

export async function GET(_req: NextRequest) {
  try {
    const nets = networkInterfaces();
    const results: string[] = [];

    for (const name of Object.keys(nets)) {
      const interfaces = nets[name];
      if (!interfaces) continue;

      for (const net of interfaces) {
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
        if (net.family === familyV4Value && !net.internal) {
          results.push(net.address);
        }
      }
    }

    const localIp = results[0] || 'No local IP found';

    return NextResponse.json({
      success: true,
      ip: localIp,
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get local IP address',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
