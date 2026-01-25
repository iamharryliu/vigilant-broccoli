import { createAuthClient } from 'better-auth/react';
import { VB_EXPRESS_BASE_URL } from './vb-express-config';

export const authClient = createAuthClient({
  baseURL: VB_EXPRESS_BASE_URL,
});

export const { signIn, signOut, useSession } = authClient;
