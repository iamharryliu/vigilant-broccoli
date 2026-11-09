import { NextResponse } from 'next/server';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  PublishAck,
  SOCKET_SERVER_PATHS,
} from '@vigilant-broccoli/common-js';
import {
  DEPLOY_APP,
  DEPLOY_RECEIVER_ID,
  DEPLOY_STATUS,
  DeployPayload,
} from '@vigilant-broccoli/deployment';

const LOG_PREFIX = '[notifications/test]';
const ERR_NOT_CONFIGURED = 'Socket server not configured';
const ERR_PUBLISH_FAILED = 'Publish failed';
const PUBLISH_TIMEOUT_MS = 5000;

const TEST_PAYLOAD: DeployPayload = {
  status: DEPLOY_STATUS.SUCCESS,
  job: 'test notification',
  commit: 'sandbox',
  commit_message: 'Test only, nothing was deployed',
  workflow: 'Feature Sandbox',
  run_url: 'https://github.com/iamharryliu/vigilant-broccoli/actions',
};

export async function POST() {
  const url = process.env.SOCKET_SERVER_URL;
  const token = process.env.SHARED_APP_TOKEN;
  if (!url || !token) {
    return NextResponse.json(
      { error: ERR_NOT_CONFIGURED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  try {
    const res = await fetch(`${url}${SOCKET_SERVER_PATHS.PUBLISH}`, {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        ...HTTP_HEADERS.AUTHORIZATION(token),
      },
      body: JSON.stringify({
        app: DEPLOY_APP,
        receiverId: DEPLOY_RECEIVER_ID,
        payload: TEST_PAYLOAD,
      }),
      signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
    });
    const ack: PublishAck | null = await res.json().catch(() => null);
    if (!ack?.ok) {
      return NextResponse.json(
        { error: ERR_PUBLISH_FAILED, code: ack?.code },
        { status: HTTP_STATUS_CODES.BAD_GATEWAY },
      );
    }
    return NextResponse.json({ ok: true, receivers: ack.receivers });
  } catch (err) {
    console.error(`${LOG_PREFIX} failed:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : ERR_PUBLISH_FAILED },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }
}
