import { NextRequest, NextResponse } from 'next/server';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const API_PREFIX = '/api/';
const WRITE_METHODS = [
  HTTP_METHOD.POST,
  HTTP_METHOD.PUT,
  HTTP_METHOD.PATCH,
  HTTP_METHOD.DELETE,
];
const SAME_ORIGIN = 'same-origin';
// Who may embed the app, as CSP sources, e.g. `'self' https://manager.example`.
const FRAME_ANCESTORS = process.env.JOB_HUNT_FRAME_ANCESTORS || "'self'";

// The app has no login, so another site's page could otherwise post a form
// or text body here (no preflight) and clear a career file or start a run.
// Browsers label every request with these headers and pages cannot forge
// them; requests without both come from tools like curl, which are not a
// CSRF vector. Behind a proxy the request URL is the container's, so the
// forwarded host is the one the browser used.
const isCrossSite = (request: NextRequest) => {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== SAME_ORIGIN) return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
};

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith(API_PREFIX) &&
    WRITE_METHODS.includes(request.method) &&
    isCrossSite(request)
  ) {
    return NextResponse.json(
      { error: 'Cross-site requests are not allowed' },
      { status: HTTP_STATUS_CODES.FORBIDDEN },
    );
  }
  const response = NextResponse.next();
  response.headers.set(
    'Content-Security-Policy',
    `frame-ancestors ${FRAME_ANCESTORS}`,
  );
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
