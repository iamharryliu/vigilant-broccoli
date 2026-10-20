import * as SUPABASE_PUBLIC from './supabase-public.json';

export const SUPABASE_URL = SUPABASE_PUBLIC.url;
export const SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLIC.publishableKey;

export const getSupabaseUrl = () => process.env['SUPABASE_URL'] || SUPABASE_URL;
