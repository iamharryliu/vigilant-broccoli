import { createSupabaseAuth } from '@vigilant-broccoli/react-lib-auth';

export const CALLBACK_ROUTE = '/auth/callback';

export const {
  AuthProvider,
  AuthCallbackPage,
  useAuth,
  signInWithGoogle,
  signOut,
} = createSupabaseAuth({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  routes: { home: '/', login: '/', callback: CALLBACK_ROUTE },
});
