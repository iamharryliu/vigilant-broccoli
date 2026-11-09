# Auth

## Stack

- Supabase Auth — Google OAuth and email/password signup

## Auth Flow

- Google OAuth → `/auth/callback` → redirect to `next` or home
- Email signup confirmation link → `/auth/callback` → redirect to `next` or home
- Unauthenticated users redirected to `/login?next=<current path>` (no `next` from `/`)

## `next` Handling

- `src/lib/auth-redirect.ts` accepts only same-origin relative paths (`/…`, not `//…`, backslash variants or absolute URLs) and never an auth page, which would loop
- `/login` and `/signup` pass `next` into the OAuth `redirectTo` and signup `emailRedirectTo` callback URLs and keep it in `sessionStorage`, because Supabase sends a callback URL it does not allow-list to `site_url` (`/`) instead
- `/auth/callback`, and `AppLayout` for any signed-in auth page, redirect to the query `next`, then the stored one, then `/`. `AppLayout` also replays a stored `next` from `/` and clears it on arrival
- The `sessionStorage` fallback is per-tab, so an email confirmation opened in another tab relies on the query `next`

## Routes

- `GET /login` — Google sign-in, with a link to email signup
- `GET /signup` — email/password + Google sign-up
- `GET /auth/callback` — OAuth and email-confirmation redirect handler
- `GET /join/[token]` — invite link join page; see [Homes](./homes.md#invite-link-flow)

## Env Vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```
