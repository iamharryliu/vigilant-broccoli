import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { processId } = body;

    if (processId === undefined) {
      return NextResponse.json(
        { error: 'processId is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await execAsync(`pm2 start ${processId}`);

    return NextResponse.json({
      success: true,
      message: `Started process: ${processId}`,
    });
  } catch (error) {
    console.error('Error starting PM2 process:', error);
    return NextResponse.json(
      {
        error: 'Failed to start PM2 process',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
