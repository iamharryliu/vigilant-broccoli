import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  FLYIO_LOGIN_FAILURE,
  FlyioLoginFailure,
  FlyioService,
} from '@vigilant-broccoli/devops-cli';

const LOGIN_ERROR_MESSAGES: Record<FlyioLoginFailure, string> = {
  [FLYIO_LOGIN_FAILURE.failed]: 'Fly.io login failed',
  [FLYIO_LOGIN_FAILURE.timedOut]:
    'Fly.io login timed out waiting for the browser sign-in',
  [FLYIO_LOGIN_FAILURE.tokenMissing]:
    'Fly.io login finished but no token was written',
};

export async function POST() {
  try {
    const { success, failure, authUrl } = await FlyioService.login();

    if (!success && failure) {
      return NextResponse.json(
        { success: false, error: LOGIN_ERROR_MESSAGES[failure], authUrl },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging in to Fly.io:', error);
    return NextResponse.json(
      {
        success: false,
        error: LOGIN_ERROR_MESSAGES[FLYIO_LOGIN_FAILURE.failed],
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
