import { createSupabaseAuth } from '@vigilant-broccoli/react-lib';

const GOOGLE_SCOPES =
  'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar';

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
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  googleScopes: GOOGLE_SCOPES,
  routes: {
    home: '/',
    login: '/login',
    callback: '/auth/callback',
  },
});
