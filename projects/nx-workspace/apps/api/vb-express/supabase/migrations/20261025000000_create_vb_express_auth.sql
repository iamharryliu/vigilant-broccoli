-- Own schema rather than public: PostgREST only exposes public, so the anon and
-- authenticated Supabase roles cannot reach sessions, OAuth tokens or API keys.
create schema if not exists vb_express_auth;

create table vb_express_auth."user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table vb_express_auth."session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references vb_express_auth."user" ("id") on delete cascade);

create table vb_express_auth."account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references vb_express_auth."user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table vb_express_auth."verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table vb_express_auth."apikey" ("id" text not null primary key, "configId" text not null, "name" text, "start" text, "referenceId" text not null, "prefix" text, "key" text not null, "refillInterval" integer, "refillAmount" integer, "lastRefillAt" timestamptz, "enabled" boolean, "rateLimitEnabled" boolean, "rateLimitTimeWindow" integer, "rateLimitMax" integer, "requestCount" integer, "remaining" integer, "lastRequest" timestamptz, "expiresAt" timestamptz, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, "permissions" text, "metadata" text);

create index "session_userId_idx" on vb_express_auth."session" ("userId");
create index "account_userId_idx" on vb_express_auth."account" ("userId");
create index "verification_identifier_idx" on vb_express_auth."verification" ("identifier");
create index "apikey_configId_idx" on vb_express_auth."apikey" ("configId");
create index "apikey_referenceId_idx" on vb_express_auth."apikey" ("referenceId");
create index "apikey_key_idx" on vb_express_auth."apikey" ("key");
