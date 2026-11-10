import { NextRequest, NextResponse } from 'next/server';
import {
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  PublishAck,
  SOCKET_SERVER_PATHS,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { CHAT_PUBLISH_TIMEOUT_MS } from '@vigilant-broccoli/react-lib-higher-level/chat-room-consts';
import {
  CHAT_APP,
  CHAT_ROOM,
  MAX_MESSAGE_LENGTH,
  MAX_SENDER_LENGTH,
} from '../../app.const';

const LOG_PREFIX = '[chat/publish]';
const ERR_FORBIDDEN = 'Forbidden';
const ERR_NOT_CONFIGURED = 'Socket server not configured';
const ERR_BAD_BODY = `Expected { text, sender } strings of 1-${MAX_MESSAGE_LENGTH} and 1-${MAX_SENDER_LENGTH} characters`;
const ERR_PUBLISH_FAILED = 'Publish failed';
const SEC_FETCH_SITE_HEADER = 'sec-fetch-site';
const SAME_ORIGIN = 'same-origin';

const json = (body: object, status: number) =>
  NextResponse.json(body, { status });

// The Vercel Authentication cookie rides cross-site requests too, so only
// same-origin browser requests may publish.
const isCrossSite = (req: NextRequest) => {
  const site = req.headers.get(SEC_FETCH_SITE_HEADER);
  return Boolean(site) && site !== SAME_ORIGIN;
};

const readMessage = async (
  req: NextRequest,
): Promise<{ text: string; sender: string } | null> => {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const sender = typeof body?.sender === 'string' ? body.sender.trim() : '';
  const valid =
    text &&
    text.length <= MAX_MESSAGE_LENGTH &&
    sender &&
    sender.length <= MAX_SENDER_LENGTH;
  return valid ? { text, sender } : null;
};

// Vercel Authentication gates every path, including this route, so only the
// signed-in owner reaches it.
export async function POST(req: NextRequest) {
  if (isCrossSite(req)) {
    return json({ error: ERR_FORBIDDEN }, HTTP_STATUS_CODES.FORBIDDEN);
  }

  const url = getEnvironmentVariable('SOCKET_SERVER_URL');
  const token = getEnvironmentVariable('SHARED_APP_TOKEN');
  if (!url || !token) {
    return json(
      { error: ERR_NOT_CONFIGURED },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  const message = await readMessage(req);
  if (!message) {
    return json({ error: ERR_BAD_BODY }, HTTP_STATUS_CODES.BAD_REQUEST);
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
        payload: { ...message, ts: Date.now() },
      }),
      signal: AbortSignal.timeout(CHAT_PUBLISH_TIMEOUT_MS),
    });
    const ack: PublishAck | null = await res.json().catch(() => null);
    if (!ack?.ok) {
      return json(
        { error: ERR_PUBLISH_FAILED, code: ack?.code },
        HTTP_STATUS_CODES.BAD_GATEWAY,
      );
    }
    return json({ ok: true }, HTTP_STATUS_CODES.OK);
  } catch (err) {
    console.error(`${LOG_PREFIX} failed:`, err);
    return json({ error: ERR_PUBLISH_FAILED }, HTTP_STATUS_CODES.BAD_GATEWAY);
  }
}
