# Auth & Homes

## Stack

- Supabase Auth — Google OAuth
- Supabase — `homes` table
- Email whitelist — hardcoded in `src/lib/whitelist.ts`

## Auth Flow

- Google OAuth → `/auth/callback` → redirect to home
- Unauthenticated users redirected to `/login`
- Non-whitelisted users signed out immediately

## Homes

- `homes` — `id`, `user_id`, `name`, `description`
- CRUD via `CRUDItemList` component
- RLS enforced via Supabase JWT

## Routes

- `GET /login` — Google sign-in
- `GET /signup` — email/password + Google sign-up
- `GET /auth/callback` — OAuth redirect handler
- `GET /homes` — homes CRUD

## Env Vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```
