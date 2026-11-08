import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  getStoredGoogleAccessToken as getStoredAccessToken,
  storeGoogleRefreshToken as storeRefreshToken,
} from '@vigilant-broccoli/react-lib-auth/google-token-server';
import { supabaseAdmin } from './supabase-admin';

const GOOGLE_CLIENT_ID_ENV = 'GOOGLE_AUTH_PROVIDER_CLIENT_ID';
const GOOGLE_CLIENT_SECRET_ENV = 'GOOGLE_AUTH_PROVIDER_CLIENT_SECRET';

export const storeGoogleRefreshToken = (
  userEmail: string,
  refreshToken: string,
): Promise<void> =>
  storeRefreshToken({ supabase: supabaseAdmin, userEmail, refreshToken });

// Null means Google must be reconnected; requireGoogleAuth maps it to the
// GOOGLE_TOKEN_EXPIRED 401.
export const getStoredGoogleAccessToken = (
  userEmail: string,
): Promise<string | null> =>
  getStoredAccessToken({
    supabase: supabaseAdmin,
    userEmail,
    clientId: getEnvironmentVariable(GOOGLE_CLIENT_ID_ENV),
    clientSecret: getEnvironmentVariable(GOOGLE_CLIENT_SECRET_ENV),
  });
