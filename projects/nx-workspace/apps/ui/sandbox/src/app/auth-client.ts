import { createAuthClient } from 'better-auth/react';

const DEFAULT_VB_EXPRESS_URL = 'https://staging-api.harryliu.dev';

export const VB_EXPRESS_URL =
  import.meta.env.VITE_VB_EXPRESS_URL || DEFAULT_VB_EXPRESS_URL;

export const authClient = createAuthClient({
  baseURL: VB_EXPRESS_URL,
  // The session cookie lives on the API host, so every request must carry it cross-origin.
  fetchOptions: { credentials: 'include' },
});
