import { NextRequest, NextResponse } from 'next/server';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  PublishAck,
  SOCKET_SERVER_PATHS,
} from '@vigilant-broccoli/common-js';
import {
  CHAT_APP,
  CHAT_PUBLISH_TIMEOUT_MS,
  CHAT_ROOM,
} from '../../../constants/chat';

const LOG_PREFIX = '[chat/publish]';
const ERR_NOT_CONFIGURED = 'Socket server not configured';
const ERR_BAD_BODY = 'Expected { text: string, sender: string }';
const ERR_PUBLISH_FAILED = 'Publish failed';

export async function POST(req: NextRequest) {
  const url = process.env.SOCKET_SERVER_URL;
  const token = process.env.SHARED_APP_TOKEN;
  if (!url || !token) {
    return NextResponse.json(
      { error: ERR_NOT_CONFIGURED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.text !== 'string' ||
    typeof body.sender !== 'string'
  ) {
    return NextResponse.json(
      { error: ERR_BAD_BODY },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
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
        app: CHAT_APP,
        receiverId: CHAT_ROOM,
        payload: { text: body.text, sender: body.sender, ts: Date.now() },
      }),
      signal: AbortSignal.timeout(CHAT_PUBLISH_TIMEOUT_MS),
    });
    const ack: PublishAck | null = await res.json().catch(() => null);
    if (!ack?.ok) {
      return NextResponse.json(
        { error: ERR_PUBLISH_FAILED, code: ack?.code },
        { status: HTTP_STATUS_CODES.BAD_GATEWAY },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`${LOG_PREFIX} failed:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : ERR_PUBLISH_FAILED },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  }
}
