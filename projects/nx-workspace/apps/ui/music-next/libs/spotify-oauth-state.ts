import { createHmac, randomUUID } from 'crypto';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

// Spotify's authorize redirect is a plain browser GET with no Authorization
// header we control, so identity has to travel in the OAuth `state` param
// instead of the Bearer token every other API route relies on. Signing it
// with the client secret (never exposed to the browser) means the callback
// can trust the embedded userEmail without a server-side session lookup.
const STATE_TTL_MS = 5 * 60 * 1000;
const STATE_PART_SEPARATOR = '.';

interface SpotifyOAuthStatePayload {
  userEmail: string;
  nonce: string;
  exp: number;
}

const signingKey = (): string =>
  getEnvironmentVariable('SPOTIFY_CLIENT_SECRET');

const base64UrlEncode = (value: string): string =>
  Buffer.from(value).toString('base64url');

const base64UrlDecode = (value: string): string =>
  Buffer.from(value, 'base64url').toString('utf8');

const sign = (payload: string): string =>
  createHmac('sha256', signingKey()).update(payload).digest('base64url');

export const createSpotifyOAuthState = (userEmail: string): string => {
  const payload: SpotifyOAuthStatePayload = {
    userEmail,
    nonce: randomUUID(),
    exp: Date.now() + STATE_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}${STATE_PART_SEPARATOR}${sign(encodedPayload)}`;
};

export const verifySpotifyOAuthState = (state: string): string | null => {
  const [encodedPayload, signature] = state.split(STATE_PART_SEPARATOR);
  if (!encodedPayload || !signature) return null;
  if (sign(encodedPayload) !== signature) return null;

  const payload: SpotifyOAuthStatePayload = JSON.parse(
    base64UrlDecode(encodedPayload),
  );
  if (payload.exp < Date.now()) return null;
  return payload.userEmail;
};
