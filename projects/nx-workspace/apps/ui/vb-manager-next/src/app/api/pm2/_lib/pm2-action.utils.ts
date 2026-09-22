import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  PM2_ACTION,
  Pm2Action,
  Pm2Service,
  isValidPm2ProcessId,
} from '@vigilant-broccoli/devops-cli';

const ACTION_LABEL: Record<Pm2Action, { done: string; failed: string }> = {
  [PM2_ACTION.START]: { done: 'Started', failed: 'start' },
  [PM2_ACTION.STOP]: { done: 'Stopped', failed: 'stop' },
  [PM2_ACTION.RESTART]: { done: 'Restarted', failed: 'restart' },
  [PM2_ACTION.DELETE]: { done: 'Deleted', failed: 'delete' },
};

export async function handlePm2ProcessAction(
  request: Request,
  action: Pm2Action,
) {
  const { done, failed } = ACTION_LABEL[action];

  try {
    const { processId } = await request.json();

    if (processId === undefined) {
      return NextResponse.json(
        { error: 'processId is required' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    if (!isValidPm2ProcessId(String(processId))) {
      return NextResponse.json(
        { error: 'processId is invalid' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    await Pm2Service.runProcessAction(action, String(processId));

    return NextResponse.json({
      success: true,
      message: `${done} process: ${processId}`,
    });
  } catch (error) {
    console.error(`Error running PM2 ${action}:`, error);
    return NextResponse.json(
      {
        error: `Failed to ${failed} PM2 process`,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
