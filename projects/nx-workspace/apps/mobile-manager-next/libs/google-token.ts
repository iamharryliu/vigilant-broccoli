import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  refreshGoogleAccessToken,
  resolveGoogleAccessToken,
  isRefreshTokenRevokedError,
} from '@vigilant-broccoli/google-workspace';
import { supabaseAdmin } from './supabase-admin';

// Shared with local-manager-next (same Supabase project and row per email);
// the table is created by its supabase/migrations.
const GOOGLE_OAUTH_TOKENS_TABLE = 'google_oauth_tokens';
const USER_EMAIL_COLUMN = 'user_email';
const GOOGLE_CLIENT_ID_ENV = 'GOOGLE_AUTH_PROVIDER_CLIENT_ID';
const GOOGLE_CLIENT_SECRET_ENV = 'GOOGLE_AUTH_PROVIDER_CLIENT_SECRET';
const GOOGLE_NOT_CONNECTED = 'google_not_connected';

interface GoogleTokenRow {
  refresh_token: string;
  access_token: string | null;
  access_token_expires_at: string | null;
}

export const storeGoogleRefreshToken = async (
  userEmail: string,
  refreshToken: string,
): Promise<void> => {
  await supabaseAdmin.from(GOOGLE_OAUTH_TOKENS_TABLE).upsert(
    {
      user_email: userEmail,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    },
    { onConflict: USER_EMAIL_COLUMN },
  );
};

const getGoogleAccessTokenForUser = async (
  userEmail: string,
): Promise<string> => {
  const { data } = await supabaseAdmin
    .from(GOOGLE_OAUTH_TOKENS_TABLE)
    .select('refresh_token, access_token, access_token_expires_at')
    .eq(USER_EMAIL_COLUMN, userEmail)
    .single<GoogleTokenRow>();

  if (!data?.refresh_token) throw new Error(GOOGLE_NOT_CONNECTED);

  return resolveGoogleAccessToken({
    stored: {
      refreshToken: data.refresh_token,
      accessToken: data.access_token,
      accessTokenExpiresAtMs: data.access_token_expires_at
        ? new Date(data.access_token_expires_at).getTime()
        : null,
    },
    refresh: refreshToken =>
      refreshGoogleAccessToken({
        clientId: getEnvironmentVariable(GOOGLE_CLIENT_ID_ENV),
        clientSecret: getEnvironmentVariable(GOOGLE_CLIENT_SECRET_ENV),
        refreshToken,
      }),
    persist: async ({ accessToken, expiresAtMs }) => {
      await supabaseAdmin
        .from(GOOGLE_OAUTH_TOKENS_TABLE)
        .update({
          access_token: accessToken,
          access_token_expires_at: new Date(expiresAtMs).toISOString(),
        })
        .eq(USER_EMAIL_COLUMN, userEmail);
    },
  });
};

// Resolves to null when Google must be reconnected (no stored refresh token,
// or Google revoked it) so callers can return the reconnect 401.
export const getStoredGoogleAccessToken = async (
  userEmail: string,
): Promise<string | null> => {
  try {
    return await getGoogleAccessTokenForUser(userEmail);
  } catch (error) {
    const needsReconnect =
      isRefreshTokenRevokedError(error) ||
      (error instanceof Error && error.message === GOOGLE_NOT_CONNECTED);
    if (!needsReconnect) throw error;
    console.warn(
      `Google reconnect required: ${(error as Error).message} at ${new Date().toISOString()}`,
    );
    return null;
  }
};
