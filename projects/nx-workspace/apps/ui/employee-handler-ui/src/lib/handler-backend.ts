import { NextRequest, NextResponse } from 'next/server';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const ENV_KEY = 'EMPLOYEE_HANDLER_URL';

const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
]);

const getUpstreamUrl = (): string | null => {
  const url = process.env[ENV_KEY];
  return url && url.trim().length > 0 ? url.replace(/\/$/, '') : null;
};

const forwardableHeaders = (incoming: Headers): Headers => {
  const out = new Headers();
  incoming.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) out.set(key, value);
  });
  return out;
};

export const hasUpstream = (): boolean => getUpstreamUrl() !== null;

export const forwardToUpstream = async (
  request: NextRequest,
): Promise<NextResponse> => {
  const upstream = getUpstreamUrl();
  if (!upstream) {
    return NextResponse.json(
      { error: `${ENV_KEY} is not configured` },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { pathname, search } = new URL(request.url);
  const target = `${upstream}${pathname}${search}`;

  const init: RequestInit = {
    method: request.method,
    headers: forwardableHeaders(request.headers),
    redirect: 'manual',
  };

  if (request.method !== HTTP_METHOD.GET && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  const upstreamRes = await fetch(target, init);
  return new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: forwardableHeaders(upstreamRes.headers),
  });
};
