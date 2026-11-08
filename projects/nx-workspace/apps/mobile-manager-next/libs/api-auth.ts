import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { isAllowedEmail } from './auth-policy';
import { GOOGLE_TOKEN_EXPIRED } from './api-errors';
import { getStoredGoogleAccessToken } from './google-token';

const ERROR_MISSING_BEARER = 'Missing bearer token';
const ERROR_INVALID_SESSION = 'Invalid session';
const ERROR_FORBIDDEN = 'Forbidden';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
);

const unauthorized = (message: string) =>
  NextResponse.json(
    { error: message },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

const forbidden = (message: string) =>
  NextResponse.json(
    { error: message },
    { status: HTTP_STATUS_CODES.FORBIDDEN },
  );

export const requireAuth = async (
  request: NextRequest,
): Promise<{ userEmail: string } | NextResponse> => {
  const authHeader = request.headers.get(AUTHORIZATION_HEADER) ?? '';
  if (!authHeader.startsWith(BEARER_PREFIX)) {
    return unauthorized(ERROR_MISSING_BEARER);
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authHeader.slice(BEARER_PREFIX.length));

  if (error || !user?.email) return unauthorized(ERROR_INVALID_SESSION);
  if (!isAllowedEmail(user.email)) return forbidden(ERROR_FORBIDDEN);

  return { userEmail: user.email };
};

// The Google access token comes from the refresh token stored at sign-in, so
// Google access outlives the ~1 hour provider_token; a missing or revoked one
// returns GOOGLE_TOKEN_EXPIRED for the client's reconnect flow.
export const requireGoogleAuth = async (
  request: NextRequest,
): Promise<{ userEmail: string; googleToken: string } | NextResponse> => {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const googleToken = await getStoredGoogleAccessToken(auth.userEmail);
  if (!googleToken) return unauthorized(GOOGLE_TOKEN_EXPIRED);

  return { ...auth, googleToken };
};
