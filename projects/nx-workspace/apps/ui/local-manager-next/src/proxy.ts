import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const unauthorized = (): NextResponse =>
  NextResponse.json(
    { error: 'Unauthorized' },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

export async function proxy(request: NextRequest) {
  const auth = request.headers.get(AUTHORIZATION_HEADER);
  if (!auth?.startsWith(BEARER_PREFIX)) return unauthorized();
  const token = auth.slice(BEARER_PREFIX.length);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    // A revoked Supabase session (e.g. a global sign-out from another app on
    // the same project) surfaces client-side as "Reconnect Google".
    console.warn(
      `Supabase session rejected for ${request.nextUrl.pathname}: ${error?.message ?? 'no user'} at ${new Date().toISOString()}`,
    );
    return unauthorized();
  }

  return NextResponse.next();
}

// /api/spotify/auth/* is exempt too: Spotify's OAuth callback is a plain
// browser redirect with no Authorization header, so it authenticates via
// the signed `state` param instead (see libs/spotify-oauth-state.ts). The
// /login route under the same prefix re-checks the bearer token itself,
// mirroring how /api/auth/google-token does its own getUserEmail check.
// /api/chat/token is exempt so guests can get a room-limited chat token; the
// route rate limits itself.
export const config = {
  matcher: ['/api/((?!auth|spotify/auth|chat/token).*)'],
};
