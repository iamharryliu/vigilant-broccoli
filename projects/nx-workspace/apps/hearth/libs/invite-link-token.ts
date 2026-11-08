import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32;

export const generateInviteToken = () =>
  randomBytes(TOKEN_BYTES).toString('base64url');

// The token is 256 random bits, so an unsalted fast hash is enough: there is
// nothing to brute-force that would be cheaper than guessing the token itself.
export const hashInviteToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
