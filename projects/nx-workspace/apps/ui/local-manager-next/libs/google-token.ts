import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  getStoredGoogleAccessToken,
  storeGoogleRefreshToken as storeRefreshToken,
} from '@vigilant-broccoli/react-lib-auth/google-token-server';
import { getUserEmail } from './server-auth';
import { supabaseAdmin } from '../src/lib/supabase-admin';

const GOOGLE_CLIENT_ID_ENV = 'GOOGLE_AUTH_PROVIDER_CLIENT_ID';
const GOOGLE_CLIENT_SECRET_ENV = 'GOOGLE_AUTH_PROVIDER_CLIENT_SECRET';

const unauthorizedError = (): Error =>
  Object.assign(new Error('Unauthorized'), {
    status: HTTP_STATUS_CODES.UNAUTHORIZED,
  });

export const storeGoogleRefreshToken = (
  userEmail: string,
  refreshToken: string,
): Promise<void> =>
  storeRefreshToken({ supabase: supabaseAdmin, userEmail, refreshToken });

export const getGoogleAccessTokenForRequest = async (
  request: NextRequest,
): Promise<string> => {
  const userEmail = await getUserEmail(request);
  if (!userEmail) throw unauthorizedError();

  const accessToken = await getStoredGoogleAccessToken({
    supabase: supabaseAdmin,
    userEmail,
    clientId: getEnvironmentVariable(GOOGLE_CLIENT_ID_ENV),
    clientSecret: getEnvironmentVariable(GOOGLE_CLIENT_SECRET_ENV),
  });
  // Same 401 as a Supabase session failure (src/proxy.ts); both render the
  // "Reconnect Google" card.
  if (!accessToken) throw unauthorizedError();
  return accessToken;
};
