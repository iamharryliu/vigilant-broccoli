import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES, PublishAck } from '@vigilant-broccoli/common-js';
import { ChatPayload } from '../../../constants/chat';

const ERR_NOT_CONFIGURED = 'Socket server not configured';
const ERR_BAD_BODY = 'Expected { text: string, sender: string }';
const ERR_PUBLISH_FAILED = 'Publish failed';

type PublishChat = (
  url: string,
  token: string,
  payload: ChatPayload,
) => Promise<PublishAck | null>;

export const createChatPublishHandler =
  (logPrefix: string, publishChat: PublishChat) => async (req: NextRequest) => {
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
      const ack = await publishChat(url, token, {
        text: body.text,
        sender: body.sender,
        ts: Date.now(),
      });

      if (!ack?.ok) {
        return NextResponse.json(
          { error: ERR_PUBLISH_FAILED, code: ack?.code },
          { status: HTTP_STATUS_CODES.BAD_GATEWAY },
        );
      }

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error(`${logPrefix} failed:`, err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : ERR_PUBLISH_FAILED },
        { status: HTTP_STATUS_CODES.BAD_GATEWAY },
      );
    }
  };
