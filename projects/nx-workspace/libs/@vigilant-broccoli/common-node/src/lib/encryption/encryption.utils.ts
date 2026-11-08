import { createHmac, timingSafeEqual } from 'crypto';

const HMAC_ALGORITHM = 'sha256';
const BASE64_URL = 'base64url';
const ROOM_TOKEN_PREFIX = 'rt';
const ROOM_TOKEN_SEPARATOR = '.';
const ROOM_TOKEN_PARTS = 3;
// Derives a separate key so a room token can't be replayed as, or reveal, the shared secret.
const ROOM_TOKEN_KEY_CONTEXT = 'room-token';

export interface RoomTokenClaims {
  app: string;
  expiresAt: number;
}

export const isTimingSafeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

const roomTokenSignature = (payload: string, secret: string) =>
  createHmac(
    HMAC_ALGORITHM,
    createHmac(HMAC_ALGORITHM, secret).update(ROOM_TOKEN_KEY_CONTEXT).digest(),
  )
    .update(payload)
    .digest(BASE64_URL);

export const signRoomToken = (claims: RoomTokenClaims, secret: string) => {
  const payload = Buffer.from(JSON.stringify(claims)).toString(BASE64_URL);
  return [ROOM_TOKEN_PREFIX, payload, roomTokenSignature(payload, secret)].join(
    ROOM_TOKEN_SEPARATOR,
  );
};

export const verifyRoomToken = (
  token: string,
  secret: string,
): RoomTokenClaims | null => {
  const parts = token.split(ROOM_TOKEN_SEPARATOR);
  const [prefix, payload, signature] = parts;
  if (parts.length !== ROOM_TOKEN_PARTS || prefix !== ROOM_TOKEN_PREFIX) {
    return null;
  }
  if (!isTimingSafeEqual(signature, roomTokenSignature(payload, secret))) {
    return null;
  }
  const claims: RoomTokenClaims = JSON.parse(
    Buffer.from(payload, BASE64_URL).toString(),
  );
  return Date.now() < claims.expiresAt ? claims : null;
};
