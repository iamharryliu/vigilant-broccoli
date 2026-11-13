import { createSupabaseAuth } from '@vigilant-broccoli/react-lib-auth';
import { GoogleTasksAuthAdapter } from '@vigilant-broccoli/react-lib-higher-level';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINT, ROUTE } from '../src/app/app.const';
import {
  POPUP_STORAGE_KEY,
  STORAGE_KEY,
  isSignInPopup,
  openSignInPopup,
} from './sign-in-popup';

const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/tasks';
// The stored refresh token is shared per email with the manager apps, so a
// Tasks-only consent must keep the Calendar scope they were already granted.
const GOOGLE_QUERY_PARAMS = { include_granted_scopes: 'true' };

const persistGoogleRefreshToken = async ({
  refreshToken,
  accessToken,
}: {
  refreshToken: string;
  accessToken: string | null;
}) => {
  if (!accessToken) return;
  await fetch(API_ENDPOINT.GOOGLE_TOKEN, {
    method: 'POST',
    headers: {
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
};

export const {
  AuthProvider,
  AuthCallbackPage,
  useAuthStatus,
  signInWithGoogle,
  signOut,
  authFetch,
  setSession,
} = createSupabaseAuth({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  googleScopes: GOOGLE_SCOPES,
  googleQueryParams: GOOGLE_QUERY_PARAMS,
  offlineAccess: true,
  storageKey: isSignInPopup() ? POPUP_STORAGE_KEY : STORAGE_KEY,
  onProviderRefreshToken: persistGoogleRefreshToken,
  routes: {
    home: ROUTE.HOME,
    login: ROUTE.LOGIN,
    callback: ROUTE.AUTH_CALLBACK,
  },
});

export const tasksAuth: GoogleTasksAuthAdapter = {
  authFetch,
  useAuthStatus,
  signInWithGoogle,
};

export const embedTasksAuth: GoogleTasksAuthAdapter = {
  authFetch,
  useAuthStatus,
  signInWithGoogle: openSignInPopup,
};
