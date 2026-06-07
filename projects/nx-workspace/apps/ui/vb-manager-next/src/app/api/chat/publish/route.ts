import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { io } from 'socket.io-client';
import {
  CHAT_APP,
  CHAT_CONNECT_TIMEOUT_MS,
  CHAT_ROOM,
  SOCKET_EVENTS,
} from '../../../constants/chat';

const LOG_PREFIX = '[chat/publish]';
const ERR_NOT_CONFIGURED = 'Socket server not configured';
const ERR_BAD_BODY = 'Expected { text: string, sender: string }';
const ERR_CONNECT_TIMEOUT = 'Socket connect timeout';
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

  const caCert = process.env.SOCKET_SERVER_CA_CERT;
  const tlsOpts: Record<string, unknown> = caCert
    ? {
        ca: Buffer.from(caCert, 'base64'),
        checkServerIdentity: () => undefined,
      }
    : {};

  const socket = io(url, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
    ...tlsOpts,
  } as Parameters<typeof io>[1]);

  try {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error(ERR_CONNECT_TIMEOUT)),
        CHAT_CONNECT_TIMEOUT_MS,
      );
      socket.once(SOCKET_EVENTS.CONNECT, () => {
        clearTimeout(t);
        resolve();
      });
      socket.once(SOCKET_EVENTS.CONNECT_ERROR, err => {
        clearTimeout(t);
        reject(err);
      });
    });

    socket.emit(SOCKET_EVENTS.PUBLISH, {
      app: CHAT_APP,
      receiverId: CHAT_ROOM,
      payload: { text: body.text, sender: body.sender, ts: Date.now() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`${LOG_PREFIX} failed:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : ERR_PUBLISH_FAILED },
      { status: HTTP_STATUS_CODES.BAD_GATEWAY },
    );
  } finally {
    socket.close();
  }
}
