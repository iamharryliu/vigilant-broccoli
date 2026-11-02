import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  RENDER_LOGIN_FAILURE,
  RenderCliService,
  RenderLoginFailure,
} from '@vigilant-broccoli/devops-cli';

const LOGIN_ERROR_MESSAGES: Record<RenderLoginFailure, string> = {
  [RENDER_LOGIN_FAILURE.failed]: 'Render login failed',
  [RENDER_LOGIN_FAILURE.timedOut]:
    'Render login timed out waiting for the browser sign-in',
  [RENDER_LOGIN_FAILURE.tokenMissing]:
    'Render login finished but no token was written',
};

export async function POST() {
  try {
    const { success, failure, authUrl } = await RenderCliService.login();
    if (!success && failure) {
      return NextResponse.json(
        { success: false, error: LOGIN_ERROR_MESSAGES[failure], authUrl },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging in to Render:', error);
    return NextResponse.json(
      {
        success: false,
        error: LOGIN_ERROR_MESSAGES[RENDER_LOGIN_FAILURE.failed],
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
