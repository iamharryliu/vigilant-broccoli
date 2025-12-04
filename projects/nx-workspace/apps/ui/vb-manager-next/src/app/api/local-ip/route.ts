import { NextRequest, NextResponse } from 'next/server';
import { networkInterfaces } from 'os';

// GET - Fetch local IP address
export async function GET(_req: NextRequest) {
  try {
    const nets = networkInterfaces();
    const results: string[] = [];

    for (const name of Object.keys(nets)) {
      const interfaces = nets[name];
      if (!interfaces) continue;

      for (const net of interfaces) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
        if (net.family === familyV4Value && !net.internal) {
          results.push(net.address);
        }
      }
    }

    // Return the first local IP found, or a message if none found
    const localIp = results[0] || 'No local IP found';

    return NextResponse.json({
      success: true,
      ip: localIp
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get local IP address'
      },
      { status: 500 }
    );
  }
}
