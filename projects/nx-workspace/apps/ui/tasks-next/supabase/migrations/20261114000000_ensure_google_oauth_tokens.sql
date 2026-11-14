-- tasks-next's copy of the Google refresh-token store, so a self-hosted
-- project gets the table without local-manager-next's migrations. A no-op on
-- the shared project, where 20260722000000_create_google_oauth_tokens.sql
-- already created it. Read and written only through the secret key; RLS with
-- no policies keeps the publishable key from reading the tokens.
create table if not exists google_oauth_tokens (
  user_email text primary key,
  refresh_token text not null,
  access_token text,
  access_token_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table google_oauth_tokens enable row level security;
