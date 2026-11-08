import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { signRoomToken } from '@vigilant-broccoli/common-node';
import { CHAT_APP } from '../../../constants/chat';

const ERR_NOT_CONFIGURED = 'Socket server not configured';
const ERR_RATE_LIMITED = 'Too many token requests';
const FORWARDED_FOR_HEADER = 'x-forwarded-for';
const UNKNOWN_CLIENT = 'unknown';
const TOKEN_TTL_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const RATE_WINDOW_MS = 60 * 1000;

const windows = new Map<string, { count: number; resetAtMs: number }>();

// Module memory, so this blunts one client on one process rather than a distributed flood.
const isRateLimited = (req: NextRequest) => {
  const now = Date.now();
  windows.forEach((window, key) => {
    if (window.resetAtMs <= now) windows.delete(key);
  });
  const client =
    req.headers.get(FORWARDED_FOR_HEADER)?.split(',')[0].trim() ||
    UNKNOWN_CLIENT;
  const window = windows.get(client) ?? {
    count: 0,
    resetAtMs: now + RATE_WINDOW_MS,
  };
  window.count += 1;
  windows.set(client, window);
  return window.count > MAX_REQUESTS_PER_WINDOW;
};

export async function POST(req: NextRequest) {
  const secret = process.env.SHARED_APP_TOKEN;
  if (!secret) {
    return NextResponse.json(
      { error: ERR_NOT_CONFIGURED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
  if (isRateLimited(req)) {
    return NextResponse.json(
      { error: ERR_RATE_LIMITED },
      { status: HTTP_STATUS_CODES.TOO_MANY_REQUESTS },
    );
  }
  return NextResponse.json({
    token: signRoomToken(
      { app: CHAT_APP, expiresAt: Date.now() + TOKEN_TTL_MS },
      secret,
    ),
  });
}
