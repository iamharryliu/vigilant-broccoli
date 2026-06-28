# Auth

## Stack

- Supabase Auth — Google OAuth
- Email whitelist — hardcoded in `src/lib/whitelist.ts`

## Auth Flow

- Google OAuth → `/auth/callback` → redirect to home
- Unauthenticated users redirected to `/login`
- Non-whitelisted users signed out immediately

## Routes

- `GET /login` — Google sign-in
- `GET /signup` — email/password + Google sign-up
- `GET /auth/callback` — OAuth redirect handler

## Env Vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```
