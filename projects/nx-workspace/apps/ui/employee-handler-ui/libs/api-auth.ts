import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  GOOGLE_TOKEN_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_MISSING_BEARER = 'Missing bearer token';
const ERROR_INVALID_SESSION = 'Invalid session';
const ERROR_MISSING_GOOGLE_TOKEN = 'Missing google token';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
);

const unauthorized = (message: string) =>
  NextResponse.json(
    { error: message },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

export const requireAuth = async (
  request: NextRequest,
  options?: { requireGoogleToken?: boolean },
): Promise<{ googleToken: string | null } | NextResponse> => {
  const authHeader = request.headers.get(AUTHORIZATION_HEADER) ?? '';
  if (!authHeader.startsWith(BEARER_PREFIX)) {
    return unauthorized(ERROR_MISSING_BEARER);
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authHeader.slice(BEARER_PREFIX.length));

  if (error || !user) return unauthorized(ERROR_INVALID_SESSION);

  const googleToken = request.headers.get(GOOGLE_TOKEN_HEADER);
  if (options?.requireGoogleToken && !googleToken) {
    return unauthorized(ERROR_MISSING_GOOGLE_TOKEN);
  }

  return { googleToken };
};
