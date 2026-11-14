import {
  SUPABASE_PUBLISHABLE_KEY,
  getSupabaseUrl,
} from '@vigilant-broccoli/infrastructure';

// Server-only. Read from the environment per request, never inlined at build
// time, so one Docker image serves any Supabase project and embedder. Unset
// Supabase values fall back to this repo's project.
const SUPABASE_PUBLISHABLE_KEY_ENV = 'SUPABASE_PUBLISHABLE_KEY';
const FRAME_ANCESTORS_ENV = 'TASKS_FRAME_ANCESTORS';

export interface ClientRuntimeConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

export { getSupabaseUrl };

export const getSupabasePublishableKey = (): string =>
  process.env[SUPABASE_PUBLISHABLE_KEY_ENV] || SUPABASE_PUBLISHABLE_KEY;

export const getClientRuntimeConfig = (): ClientRuntimeConfig => ({
  supabaseUrl: getSupabaseUrl(),
  supabasePublishableKey: getSupabasePublishableKey(),
});

// Space- or comma-separated origins allowed to frame the app besides itself.
export const getFrameAncestors = (): string[] =>
  (process.env[FRAME_ANCESTORS_ENV] ?? '').split(/[\s,]+/).filter(Boolean);
