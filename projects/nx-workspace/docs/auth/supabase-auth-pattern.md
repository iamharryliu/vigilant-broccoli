# Supabase Auth Pattern

Single shared Supabase project (`vb-supabase`, ref `jrdosjjgmsoodpjmjqxx`) provides Google-provider sign-in for all user-facing apps: `hearth`, `employee-handler-ui`, `small-business-next`, `vb-manager-next`. All apps share one auth user pool — the same Google account is the same user everywhere.

Reference implementation: **vb-manager-next** (the only app on the shared lib so far).

## Supabase config is Terraform-managed

[`infrastructure/terraform/supabase-auth.tf`](../../../../infrastructure/terraform/supabase-auth.tf) owns `site_url`, `uri_allow_list`, and the Google provider on the shared project. **Never edit these in the Supabase dashboard** — Terraform will revert them on the next apply, and the dashboard change is lost. Local Terraform env (including `SUPABASE_ACCESS_TOKEN` and `TF_VAR_supabase_google_client_secret`) is loaded from the Bitwarden `vb-vault-secrets` note by `infrastructure/terraform/scripts/load-vault-tf-env.sh`.

### The silent-fallback failure mode

A sign-in whose `redirectTo` is **not** matched by `uri_allow_list` does not error — Supabase silently redirects to `site_url` instead. The symptom is "I signed in and landed on the wrong app / a 404," not an auth error. So a missing or mistyped allow-list entry looks like a broken redirect, not a permissions problem. For the same reason, `site_url` must always point at a **real, deployed URL** (it is the fallback everyone hits when their entry is missing).

### Adding / changing redirect URLs

1. Get the app's real deployed domains from [`network-management.md`](../../../../docs/infrastructure/network-management.md) — the source of truth. **Every deployed app follows the `staging-<name>` / `production-<name>` prefix pattern** (e.g. `staging-hearth.vercel.app`, `production-hearth.vercel.app`). Do **not** guess a bare `<name>.vercel.app` — that domain usually does not exist, so its sign-in silently falls through to `site_url`. This exact mistake was live for hearth and employee-handler-ui.
2. Add one entry per app **per environment** to `uri_allow_list` in `supabase-auth.tf`: the local dev URL(s) plus each real staging and production URL. Use the `https://<domain>/*` wildcard form for Vercel/PM2 apps (matches any callback path); use the exact `.../auth/callback` path form for fly.io mobile shells. Keep entries grouped and commented by app, matching the existing style.
3. Only add apps that actually use Supabase sign-in (`signInWithOAuth` / `createSupabaseAuth`). Apps deployed to Vercel but without Supabase auth (e.g. `findme`, `whiteboard`) do **not** belong here. Apps not yet deployed (not in `network-management.md`) get added when they ship.
4. `pnpm tf:plan` — confirm the **only** change is the `auth` attribute (the other blocks must show as unchanged; see the resource's own comment about why `api`/`database`/`network`/`storage` are pinned). Then `pnpm tf:apply`.
5. If a new local dev port is used, add both `http://localhost:<port>/*` and `http://127.0.0.1:<port>/*` — Supabase treats them as distinct origins and matches literally.

## Client side

- Instantiate `createSupabaseAuth` from `@vigilant-broccoli/react-lib` (`libs/@vigilant-broccoli/react-lib/src/auth`) once per app — see `apps/ui/vb-manager-next/libs/auth.ts`. Config: Supabase env vars, optional extra Google scopes (e.g. Tasks/Calendar), and the app's home/login/callback routes.
- The factory returns `AuthProvider`, `useAuth`, `useAuthStatus` (`'loading' | 'authenticated' | 'unauthenticated'`), `useGoogleToken`, `signInWithGoogle`, `signOut`, `getSupabaseAccessToken`, `buildAuthHeaders`, `authFetch`, and `AuthCallbackPage`.
- Wrap the root layout in `AuthProvider`; the login page calls `signInWithGoogle` (use `GoogleSigninButton` from `react-lib`); the `/auth/callback` page renders `AuthCallbackPage`.
- The session lives in the Supabase JS client (localStorage), **not** an httpOnly cookie — the server never sees it implicitly. Every same-origin `/api/*` request must go through `authFetch`, which attaches `Authorization: Bearer <supabase access token>` and `x-google-token` headers. A plain `fetch()` to `/api/*` gets a 401 from middleware.
- The Google `provider_token` is captured once at sign-in (`onAuthStateChange`) into localStorage under `google_provider_token`. There is no refresh — it expires after ~1 hour, well before the Supabase session does.
- **Google-token expiry must not end the Supabase session.** The two lifetimes are independent: the Supabase session refreshes for as long as the refresh token stays valid, while the Google token dies hourly. On a 401 from a Google-backed route, clear only `google_provider_token` and prompt re-consent via `signInWithGoogle` (see `GoogleReconnectView` in `google-tasks.component.tsx`) — never call `signOut`. Calling `signOut` here is what made sessions look ~1 hour long after the NextAuth migration.
- Only one Supabase client per browser context may own the stored session. Secondary clients (realtime, stateless server-side `getUser`) must be constructed with `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false` — otherwise two auto-refresh tickers race on a rotating refresh token. See `apps/ui/vb-manager-next/src/lib/supabase.ts`.

## Server side

- `src/middleware.ts` gates all `/api/*` routes by verifying the bearer token with `supabase.auth.getUser(token)` (see `vb-manager-next`; `employee-handler-ui`'s `src/proxy.ts` is the same check plus an `ALLOWED_EMAILS` / `ALLOWED_EMAIL_DOMAINS` allowlist).
- Per-route helpers (`apps/ui/vb-manager-next/libs/server-auth.ts`):
  - `getGoogleAccessToken(req)` — reads `x-google-token` for Google API calls (Tasks, Calendar).
  - `getUserEmail(req)` — re-verifies the bearer token and returns the email used as the per-user data key.
- `hearth` variant: per-route Supabase server client scoped to the caller's token plus Postgres RLS (`apps/hearth/libs/supabase-server.ts`) instead of email-keyed lookups.

## Env vars

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (client + token verification), `SUPABASE_SECRET_KEY` (admin client, server-only).

## New app checklist

1. `libs/auth.ts` instantiating `createSupabaseAuth` with the app's routes/scopes.
2. `AuthProvider` in the root layout; login page; `auth/callback` page.
3. `src/middleware.ts` bearer-token guard on `/api/*`.
4. All same-origin `/api/*` calls via `authFetch`.
5. Callback URLs added to `uri_allow_list` in `supabase-auth.tf`, then `tf:apply` — follow [Adding / changing redirect URLs](#adding--changing-redirect-urls) exactly (real staging + production domains from `network-management.md`, not a guessed bare domain).

## Migration status

- `vb-manager-next` — on the shared `react-lib` auth module (migrated from NextAuth).
- `hearth`, `employee-handler-ui`, `small-business-next` — same pattern, but hand-rolled per-app copies predating the shared module; consolidation pending.
- `vb-express` (Fastify) — still on better-auth + API-key plugin; not part of this pattern yet.
