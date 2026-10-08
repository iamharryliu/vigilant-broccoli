import {
  createSupabaseAuth,
  GoogleTasksAuthAdapter,
} from '@vigilant-broccoli/react-lib';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../app/constants/api-endpoints';

const GOOGLE_SCOPES =
  'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar';

const persistGoogleRefreshToken = async ({
  refreshToken,
  accessToken,
}: {
  refreshToken: string;
  accessToken: string | null;
}) => {
  if (!accessToken) return;
  await fetch(API_ENDPOINTS.GOOGLE_TOKEN, {
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
  useAuth,
  useAuthStatus,
  useGoogleToken,
  signInWithGoogle,
  signOut,
  getSupabaseAccessToken,
  buildAuthHeaders,
  authFetch,
} = createSupabaseAuth({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  googleScopes: GOOGLE_SCOPES,
  offlineAccess: true,
  onProviderRefreshToken: persistGoogleRefreshToken,
  routes: {
    home: '/',
    login: '/login',
    callback: '/auth/callback',
  },
});

export const googleTasksAuth: GoogleTasksAuthAdapter = {
  authFetch,
  useAuthStatus,
  useGoogleToken,
  signInWithGoogle,
};
