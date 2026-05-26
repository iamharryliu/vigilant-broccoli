import { createClient } from '@supabase/supabase-js';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
} from '@vigilant-broccoli/common-js';

export const getBearerToken = (request: Request) =>
  request.headers.get(AUTHORIZATION_HEADER)?.replace(BEARER_PREFIX, '') ?? '';

export const createServerClient = (accessToken: string) =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      global: {
        headers: { Authorization: `${BEARER_PREFIX}${accessToken}` },
      },
    },
  );

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SECRET_KEY as string,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
