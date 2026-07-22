const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';
const GRANT_TYPE_REFRESH_TOKEN = 'refresh_token';
const INVALID_GRANT_ERROR = 'invalid_grant';
const REFRESH_FAILED_ERROR = 'google_token_refresh_failed';
const DEFAULT_SAFETY_MARGIN_MS = 60_000;
const MS_PER_SECOND = 1000;

export const GOOGLE_REFRESH_TOKEN_REVOKED = 'google_refresh_token_revoked';

export const isRefreshTokenRevokedError = (error: unknown): boolean =>
  error instanceof Error && error.message === GOOGLE_REFRESH_TOKEN_REVOKED;

export interface GoogleTokenCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface RefreshedGoogleAccessToken {
  accessToken: string;
  expiresInSeconds: number;
}

interface GoogleTokenEndpointResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

export const refreshGoogleAccessToken = async ({
  clientId,
  clientSecret,
  refreshToken,
}: GoogleTokenCredentials): Promise<RefreshedGoogleAccessToken> => {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': FORM_CONTENT_TYPE },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      refresh_token: refreshToken,
    }),
  });

  const data = (await response.json()) as GoogleTokenEndpointResponse;

  if (response.ok && data.access_token && data.expires_in) {
    return {
      accessToken: data.access_token,
      expiresInSeconds: data.expires_in,
    };
  }

  if (data.error === INVALID_GRANT_ERROR) {
    throw new Error(GOOGLE_REFRESH_TOKEN_REVOKED);
  }

  throw new Error(data.error_description || data.error || REFRESH_FAILED_ERROR);
};

export interface StoredGoogleToken {
  refreshToken: string;
  accessToken?: string | null;
  accessTokenExpiresAtMs?: number | null;
}

export interface PersistedGoogleAccessToken {
  accessToken: string;
  expiresAtMs: number;
}

export interface ResolveGoogleAccessTokenParams {
  stored: StoredGoogleToken;
  refresh: (refreshToken: string) => Promise<RefreshedGoogleAccessToken>;
  persist: (next: PersistedGoogleAccessToken) => Promise<void>;
  nowMs?: number;
  safetyMarginMs?: number;
}

const isCachedTokenValid = (
  stored: StoredGoogleToken,
  nowMs: number,
  safetyMarginMs: number,
): boolean =>
  !!stored.accessToken &&
  !!stored.accessTokenExpiresAtMs &&
  stored.accessTokenExpiresAtMs - safetyMarginMs > nowMs;

export const resolveGoogleAccessToken = async ({
  stored,
  refresh,
  persist,
  nowMs = Date.now(),
  safetyMarginMs = DEFAULT_SAFETY_MARGIN_MS,
}: ResolveGoogleAccessTokenParams): Promise<string> => {
  if (isCachedTokenValid(stored, nowMs, safetyMarginMs)) {
    return stored.accessToken as string;
  }

  const { accessToken, expiresInSeconds } = await refresh(stored.refreshToken);
  const expiresAtMs = nowMs + expiresInSeconds * MS_PER_SECOND;
  await persist({ accessToken, expiresAtMs });
  return accessToken;
};
