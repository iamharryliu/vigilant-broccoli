import { createSupabaseAuth } from '@vigilant-broccoli/react-lib-auth';

// Same Supabase project as local-manager-next, so supabase-js finds the
// session that app stored in this origin's localStorage; sign-in stays there.
export const { authFetch } = createSupabaseAuth({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  routes: {
    home: '/',
    login: '/login',
    callback: '/auth/callback',
  },
});
