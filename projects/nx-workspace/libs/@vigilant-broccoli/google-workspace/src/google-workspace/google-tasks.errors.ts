export const GOOGLE_TOKEN_EXPIRED = 'google_token_expired';

export const isExpiredError = (error: unknown): boolean =>
  (error as { status?: number })?.status === 401 ||
  (error as { response?: { status?: number } })?.response?.status === 401;
