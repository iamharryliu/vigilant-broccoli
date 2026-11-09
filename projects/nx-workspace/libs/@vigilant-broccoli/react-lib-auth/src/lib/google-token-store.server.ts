import type { SupabaseClient } from '@supabase/supabase-js';
import {
  isRefreshTokenRevokedError,
  refreshGoogleAccessToken,
  resolveGoogleAccessToken,
} from '@vigilant-broccoli/google-workspace';

// Server-only (exposed as `@vigilant-broccoli/react-lib-auth/google-token-server`,
// never from the lib's index) so the admin-client store stays out of client bundles.
// local-manager-next and mobile-manager-next share one Supabase project and one
// row per email; the table is created by local-manager-next's supabase/migrations.
export const GOOGLE_OAUTH_TOKENS_TABLE = 'google_oauth_tokens';

const USER_EMAIL_COLUMN = 'user_email';
const GOOGLE_NOT_CONNECTED = 'google_not_connected';

interface GoogleTokenRow {
  refresh_token: string;
  access_token: string | null;
  access_token_expires_at: string | null;
}

export interface GoogleTokenStoreOptions {
  supabase: SupabaseClient;
  userEmail: string;
}

export interface GoogleAccessTokenOptions extends GoogleTokenStoreOptions {
  clientId: string;
  clientSecret: string;
}

export const storeGoogleRefreshToken = async ({
  supabase,
  userEmail,
  refreshToken,
}: GoogleTokenStoreOptions & { refreshToken: string }): Promise<void> => {
  await supabase.from(GOOGLE_OAUTH_TOKENS_TABLE).upsert(
    {
      user_email: userEmail,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    },
    { onConflict: USER_EMAIL_COLUMN },
  );
};

const resolveStoredGoogleAccessToken = async ({
  supabase,
  userEmail,
  clientId,
  clientSecret,
}: GoogleAccessTokenOptions): Promise<string> => {
  const { data } = await supabase
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
      refreshGoogleAccessToken({ clientId, clientSecret, refreshToken }),
    persist: async ({ accessToken, expiresAtMs }) => {
      await supabase
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
// or Google revoked it) so each app can map it to its own reconnect 401.
export const getStoredGoogleAccessToken = async (
  options: GoogleAccessTokenOptions,
): Promise<string | null> => {
  try {
    return await resolveStoredGoogleAccessToken(options);
  } catch (error) {
    const needsReconnect =
      isRefreshTokenRevokedError(error) ||
      (error instanceof Error && error.message === GOOGLE_NOT_CONNECTED);
    if (!needsReconnect) throw error;
    // Logged to tell a Google-side revocation apart from a Supabase session
    // 401; both render the same "Reconnect Google" card.
    console.warn(
      `Google reconnect required: ${(error as Error).message} at ${new Date().toISOString()}`,
    );
    return null;
  }
};
