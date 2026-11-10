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
import { CHAT_APP, CHAT_ROOM, MAX_MESSAGE_LENGTH } from '../../app.const';
import { getAccessEmail } from '../../../lib/access-identity.server';

const LOG_PREFIX = '[chat/publish]';
const ERR_FORBIDDEN = 'Forbidden';
const ERR_NOT_CONFIGURED = 'Socket server not configured';
const ERR_BAD_BODY = `Expected { text: string } of 1-${MAX_MESSAGE_LENGTH} characters`;
const ERR_PUBLISH_FAILED = 'Publish failed';
const SEC_FETCH_SITE_HEADER = 'sec-fetch-site';
const SAME_ORIGIN = 'same-origin';

const json = (body: object, status: number) =>
  NextResponse.json(body, { status });

// The Access cookie rides cross-site requests too, so only same-origin
// browser requests may publish as the signed-in user.
const isCrossSite = (req: NextRequest) => {
  const site = req.headers.get(SEC_FETCH_SITE_HEADER);
  return Boolean(site) && site !== SAME_ORIGIN;
};

const readText = async (req: NextRequest): Promise<string | null> => {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  return text && text.length <= MAX_MESSAGE_LENGTH ? text : null;
};

export async function POST(req: NextRequest) {
  // The sender comes from the verified Access assertion, never the body.
  const sender = await getAccessEmail(req.headers);
  if (!sender || isCrossSite(req)) {
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

  const text = await readText(req);
  if (!text) {
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
        payload: { text, sender, ts: Date.now() },
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
