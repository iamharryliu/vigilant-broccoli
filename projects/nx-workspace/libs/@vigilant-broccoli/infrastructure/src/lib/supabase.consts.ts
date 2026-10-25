import * as SUPABASE_PUBLIC from './supabase-public.json';

export const SUPABASE_URL = SUPABASE_PUBLIC.url;
export const SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLIC.publishableKey;
// Session-mode pooler: it is IPv4-reachable and keeps per-connection settings
// such as search_path, unlike the transaction-mode pooler on port 6543.
export const SUPABASE_DB_HOST = SUPABASE_PUBLIC.dbHost;
export const SUPABASE_DB_PORT = 5432;
export const SUPABASE_DB_USER = SUPABASE_PUBLIC.dbUser;
export const SUPABASE_DB_NAME = 'postgres';

export const getSupabaseUrl = () => process.env['SUPABASE_URL'] || SUPABASE_URL;
