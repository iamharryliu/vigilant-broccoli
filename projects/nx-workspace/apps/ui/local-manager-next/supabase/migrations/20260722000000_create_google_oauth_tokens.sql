-- Server-side store for Google OAuth refresh tokens, keyed by user email.
-- Read and written only through the service-role key (supabaseAdmin), which
-- bypasses RLS. RLS is enabled with NO policies so the anon/publishable key
-- can never read the refresh tokens from the browser.
create table google_oauth_tokens (
  user_email text primary key,
  refresh_token text not null,
  access_token text,
  access_token_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table google_oauth_tokens enable row level security;
