import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const PM2_ID_PATTERN = /^[\w.-]+$/;

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

    if (!PM2_ID_PATTERN.test(String(processId))) {
      return NextResponse.json(
        { error: 'processId is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await execFileAsync('pm2', ['delete', String(processId)]);

    return NextResponse.json({
      success: true,
      message: `Deleted process: ${processId}`,
    });
  } catch (error) {
    console.error('Error deleting PM2 process:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete PM2 process',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
