import { createClient } from '@supabase/supabase-js';

export const createServerClient = (accessToken: string) =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    },
  );

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
