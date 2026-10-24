import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface RuntimeConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  demo: boolean;
}

let configPromise: Promise<RuntimeConfig> | null = null;
let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Fetches Supabase connection details from the server at request time
 * instead of reading process.env.NEXT_PUBLIC_* directly — Next.js inlines
 * NEXT_PUBLIC_* vars into the client bundle at build time, which would lock
 * every consumer of this Docker image to whichever Supabase project was
 * configured when the image was built. Reading them via /api/config (a
 * server-only route, so its env reads happen fresh per request) lets each
 * deployment point at its own Supabase project purely through container
 * env vars.
 */
export const getRuntimeConfig = (): Promise<RuntimeConfig> => {
  if (!configPromise) {
    configPromise = fetch('/api/config').then(
      res => res.json() as Promise<RuntimeConfig>,
    );
  }
  return configPromise;
};

export const getSupabase = (): Promise<SupabaseClient> => {
  if (!clientPromise) {
    clientPromise = getRuntimeConfig().then(
      ({ supabaseUrl, supabasePublishableKey }) =>
        createClient(supabaseUrl, supabasePublishableKey),
    );
  }
  return clientPromise;
};
